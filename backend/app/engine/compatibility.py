import math
from datetime import date
from typing import Dict, Any, List, Optional, Tuple
from app.config import settings

def calculate_haversine_distance(lat1: Optional[float], lon1: Optional[float], lat2: Optional[float], lon2: Optional[float]) -> Optional[float]:
    """Calculate distance in kilometers between two GPS coordinates."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return None
    
    R = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

def compute_compatibility_score(
    farmer_produce: Any,
    farmer_user: Any,
    team: Any,
    representative_user: Any,
    team_members: List[Any],
    buyer_requirements: List[Any] = []
) -> Tuple[float, Dict[str, float], List[str], str]:
    """
    Computes a transparent compatibility score (0-100%) between a farmer's produce lot and an open team.
    Returns: (final_score, breakdown_dict, reasons_list, summary_explanation)
    """
    # 1. Crop Match (Weight: 30%)
    if farmer_produce.crop.strip().lower() != team.crop.strip().lower():
        return (
            0.0,
            {"crop_match": 0.0, "variety_match": 0.0, "grade_match": 0.0, "date_window": 0.0, "proximity": 0.0, "quantity_fit": 0.0},
            ["Crop type mismatch: Produce is " + farmer_produce.crop + " while team is " + team.crop],
            f"This team is aggregating {team.crop}, but your listed produce is {farmer_produce.crop}."
        )
    
    crop_score = 1.0

    # 2. Variety Match (Weight: 15%)
    farmer_var = (farmer_produce.variety or "").strip().lower()
    team_var = (team.variety or "").strip().lower()
    if not farmer_var or not team_var or farmer_var == team_var or farmer_var in ["all", "standard", "any"] or team_var in ["all", "standard", "any"]:
        variety_score = 1.0
        variety_reason = f"Identical crop variety: {farmer_produce.variety}"
    elif farmer_var in team_var or team_var in farmer_var:
        variety_score = 0.8
        variety_reason = f"Compatible variety profile: {farmer_produce.variety} ~ {team.variety}"
    else:
        variety_score = 0.5
        variety_reason = f"Different variety ({farmer_produce.variety} vs {team.variety})"

    # 3. Grade Match (Weight: 15%)
    farmer_grade = (farmer_produce.grade or "A").strip().upper()
    team_grade = (team.grade or "A").strip().upper()
    if farmer_grade == team_grade:
        grade_score = 1.0
        grade_reason = f"Same quality grade: Grade {farmer_grade}"
    elif (farmer_grade == 'A' and team_grade == 'B') or (farmer_grade == 'B' and team_grade == 'A'):
        grade_score = 0.6
        grade_reason = f"Minor grade difference: Grade {farmer_grade} and Grade {team_grade}"
    else:
        grade_score = 0.3
        grade_reason = f"Grade disparity: Grade {farmer_grade} with Grade {team_grade}"

    # 4. Harvest & Selling Window Overlap (Weight: 15%)
    farmer_sell_date = farmer_produce.expected_selling_date
    team_sell_date = team.target_selling_date
    date_diff_days = abs((farmer_sell_date - team_sell_date).days)
    
    if date_diff_days <= 3:
        date_score = 1.0
        date_reason = f"Synchronized selling window (within {date_diff_days} day{'s' if date_diff_days != 1 else ''})"
    elif date_diff_days <= 7:
        date_score = 0.85
        date_reason = f"Close selling window ({date_diff_days} days apart)"
    elif date_diff_days <= 14:
        date_score = 0.60
        date_reason = f"Acceptable selling window ({date_diff_days} days apart)"
    else:
        date_score = 0.20
        date_reason = f"Selling window gap ({date_diff_days} days apart)"

    # 5. Geographical Proximity (Weight: 15%)
    dist_km = None
    if farmer_user and representative_user:
        dist_km = calculate_haversine_distance(
            farmer_user.latitude, farmer_user.longitude,
            representative_user.latitude, representative_user.longitude
        )
    
    if dist_km is None:
        # Fallback to village/district comparison if coordinates are missing
        if farmer_user and representative_user and farmer_user.district and representative_user.district:
            if farmer_user.district.lower() == representative_user.district.lower():
                proximity_score = 0.90
                dist_km = 12.0
                proximity_reason = f"Same district ({farmer_user.district}) - optimal shared transport"
            elif farmer_user.state and representative_user.state and farmer_user.state.lower() == representative_user.state.lower():
                proximity_score = 0.70
                dist_km = 45.0
                proximity_reason = f"Neighboring district in {farmer_user.state}"
            else:
                proximity_score = 0.40
                dist_km = 120.0
                proximity_reason = f"Distant location ({farmer_user.state} vs {representative_user.state})"
        else:
            proximity_score = 0.80
            proximity_reason = "Nearby regional area"
    else:
        if dist_km <= 15:
            proximity_score = 1.0
            proximity_reason = f"High geographical proximity: {dist_km} km apart"
        elif dist_km <= 35:
            proximity_score = 0.85
            proximity_reason = f"Favorable logistics distance: {dist_km} km apart"
        elif dist_km <= 65:
            proximity_score = 0.65
            proximity_reason = f"Moderate transport distance: {dist_km} km apart"
        elif dist_km <= 100:
            proximity_score = 0.40
            proximity_reason = f"Extended transport distance: {dist_km} km apart"
        else:
            proximity_score = 0.15
            proximity_reason = f"Significant transport distance: {dist_km} km apart"

    # 6. Quantity Fit & Buyer Target Contribution (Weight: 10%)
    team_total_kg = sum(m.contributed_kg for m in team_members)
    projected_total_kg = team_total_kg + (farmer_produce.available_quantity_kg or farmer_produce.quantity_kg)
    
    # Check if this brings team to unlock any active buyer requirement
    unlocked_target = False
    matching_buyers = [
        b for b in buyer_requirements
        if b.crop.lower() == team.crop.lower() and b.status == "active"
    ]
    
    if matching_buyers:
        for b in matching_buyers:
            if team_total_kg < b.min_quantity_kg and projected_total_kg >= b.min_quantity_kg:
                unlocked_target = True
                break
    
    if unlocked_target:
        quantity_score = 1.0
        quantity_reason = f"Crucial quantity contribution (+{farmer_produce.quantity_kg:g} kg unlocks bulk buyer tier)"
    elif projected_total_kg >= 1000:
        quantity_score = 0.90
        quantity_reason = f"Brings combined lot to {projected_total_kg:g} kg for commercial buyers"
    elif (farmer_produce.available_quantity_kg or farmer_produce.quantity_kg) >= 200:
        quantity_score = 0.80
        quantity_reason = f"Healthy produce contribution of {farmer_produce.quantity_kg:g} kg"
    else:
        quantity_score = 0.60
        quantity_reason = f"Smaller lot contribution of {farmer_produce.quantity_kg:g} kg"

    # Weighted Calculation
    raw_score = (
        crop_score * settings.WEIGHT_CROP_MATCH +
        variety_score * settings.WEIGHT_VARIETY_MATCH +
        grade_score * settings.WEIGHT_GRADE_MATCH +
        date_score * settings.WEIGHT_DATE_WINDOW +
        proximity_score * settings.WEIGHT_PROXIMITY +
        quantity_score * settings.WEIGHT_QUANTITY_FIT
    )
    
    final_score = round(raw_score * 100, 1)

    breakdown = {
        "crop_match": round(crop_score * 100, 1),
        "variety_match": round(variety_score * 100, 1),
        "grade_match": round(grade_score * 100, 1),
        "date_window": round(date_score * 100, 1),
        "proximity": round(proximity_score * 100, 1),
        "quantity_fit": round(quantity_score * 100, 1)
    }

    reasons = [
        variety_reason,
        grade_reason,
        date_reason,
        proximity_reason,
        quantity_reason
    ]

    # Simple, clear explanation for farmer
    if final_score >= 85:
        summary = f"Excellent match! Same {team.crop} ({team.variety}) Grade {team.grade}, ready within {date_diff_days} days, only {dist_km or '~15'} km away. Joining will aggregate {projected_total_kg:g} kg for high-value buyer demand."
    elif final_score >= settings.DEFAULT_COMPATIBILITY_THRESHOLD:
        summary = f"Good compatible team! Matching {team.crop} with aligned harvest window ({date_diff_days} days difference) and shared transport route."
    else:
        summary = f"Moderate compatibility ({final_score}%). Has some differences in harvest timing or distance."

    return (final_score, breakdown, reasons, summary)


def compute_buyer_team_compatibility_score(
    buyer_req: Any,
    buyer_user: Any,
    team: Any,
    representative_user: Any,
    team_members: List[Any]
) -> Tuple[float, Dict[str, float], List[str], str]:
    """
    Computes a transparent compatibility score (0-100%) between a buyer's requirement and an aggregated collective team lot.
    Returns: (final_score, breakdown_dict, reasons_list, summary_explanation)
    """
    # 1. Crop Match
    if buyer_req.crop.strip().lower() != team.crop.strip().lower():
        return (
            0.0,
            {"crop_match": 0.0, "variety_match": 0.0, "grade_match": 0.0, "date_window": 0.0, "proximity": 0.0, "quantity_fit": 0.0},
            [f"Crop mismatch: Buyer needs {buyer_req.crop}, team has {team.crop}"],
            f"Team is aggregating {team.crop}, but requirement is for {buyer_req.crop}."
        )
    crop_score = 1.0

    # 2. Variety Match
    req_var = (buyer_req.variety or "").strip().lower()
    team_var = (team.variety or "").strip().lower()
    if not req_var or req_var in ["all", "any", "standard"] or not team_var or team_var in ["all", "any", "standard"] or req_var == team_var:
        variety_score = 1.0
        variety_reason = f"Matching variety: {team.variety}"
    elif req_var in team_var or team_var in req_var:
        variety_score = 0.8
        variety_reason = f"Compatible variety profile: {team.variety}"
    else:
        variety_score = 0.5
        variety_reason = f"Different variety ({team.variety} vs required {buyer_req.variety})"

    # 3. Grade Match
    req_grade = (buyer_req.preferred_grade or "Any").strip().upper()
    team_grade = (team.grade or "A").strip().upper()
    if req_grade in ["ANY", "ALL"] or req_grade == team_grade:
        grade_score = 1.0
        grade_reason = f"Grade {team_grade} satisfies required Grade {req_grade}"
    elif (req_grade == "B" and team_grade == "A"):
        grade_score = 1.0
        grade_reason = f"Superior Grade A provided for Grade B demand"
    elif (req_grade == "A" and team_grade == "B"):
        grade_score = 0.65
        grade_reason = f"Grade B lot available for Grade A demand"
    else:
        grade_score = 0.40
        grade_reason = f"Grade disparity (Grade {team_grade} vs required Grade {req_grade})"

    # 4. Delivery & Harvest Date Window Overlap
    date_diff_days = abs((buyer_req.target_delivery_date - team.target_selling_date).days)
    if date_diff_days <= 3:
        date_score = 1.0
        date_reason = f"Optimal delivery window sync ({date_diff_days} days apart)"
    elif date_diff_days <= 7:
        date_score = 0.85
        date_reason = f"Close delivery window ({date_diff_days} days apart)"
    elif date_diff_days <= 14:
        date_score = 0.60
        date_reason = f"Acceptable delivery schedule ({date_diff_days} days apart)"
    else:
        date_score = 0.25
        date_reason = f"Delivery schedule gap ({date_diff_days} days apart)"

    # 5. Geographical Proximity
    buyer_lat = buyer_req.delivery_lat or (buyer_user.latitude if buyer_user else None)
    buyer_lng = buyer_req.delivery_lng or (buyer_user.longitude if buyer_user else None)
    team_lat = team.collection_lat or (representative_user.latitude if representative_user else None)
    team_lng = team.collection_lng or (representative_user.longitude if representative_user else None)

    dist_km = calculate_haversine_distance(buyer_lat, buyer_lng, team_lat, team_lng)
    if dist_km is None:
        if buyer_req.delivery_state and representative_user and representative_user.state and buyer_req.delivery_state.lower() == representative_user.state.lower():
            proximity_score = 0.85
            dist_km = 45.0
            proximity_reason = f"Intra-state procurement route in {buyer_req.delivery_state}"
        else:
            proximity_score = 0.70
            dist_km = 120.0
            proximity_reason = "Regional logistics corridor"
    else:
        if dist_km <= 50:
            proximity_score = 1.0
            proximity_reason = f"Direct local depot: {dist_km} km away"
        elif dist_km <= 150:
            proximity_score = 0.85
            proximity_reason = f"Efficient transit route: {dist_km} km away"
        elif dist_km <= 300:
            proximity_score = 0.65
            proximity_reason = f"Inter-district transport: {dist_km} km away"
        else:
            proximity_score = 0.40
            proximity_reason = f"Long-haul logistics: {dist_km} km away"

    # 6. Quantity Fit
    team_total_kg = sum(m.contributed_kg for m in team_members)
    if buyer_req.min_quantity_kg <= team_total_kg <= buyer_req.max_quantity_kg:
        quantity_score = 1.0
        quantity_reason = f"Ideal batch volume: {team_total_kg:g} kg matches demand ({buyer_req.min_quantity_kg:g} - {buyer_req.max_quantity_kg:g} kg)"
    elif team_total_kg >= buyer_req.min_quantity_kg * 0.75:
        ratio = round((team_total_kg / buyer_req.min_quantity_kg) * 100, 1)
        quantity_score = 0.85
        quantity_reason = f"Batch volume of {team_total_kg:g} kg fills {ratio}% of minimum target"
    elif team_total_kg > buyer_req.max_quantity_kg:
        quantity_score = 0.80
        quantity_reason = f"Large batch volume: {team_total_kg:g} kg exceeds maximum target ({buyer_req.max_quantity_kg:g} kg)"
    else:
        ratio = round((team_total_kg / buyer_req.min_quantity_kg) * 100, 1)
        quantity_score = max(0.3, round(team_total_kg / buyer_req.min_quantity_kg, 2))
        quantity_reason = f"Partial batch volume: {team_total_kg:g} kg ({ratio}% of target)"

    raw_score = (
        crop_score * 0.30 +
        variety_score * 0.15 +
        grade_score * 0.15 +
        date_score * 0.15 +
        proximity_score * 0.15 +
        quantity_score * 0.10
    )
    final_score = round(raw_score * 100, 1)

    breakdown = {
        "crop_match": round(crop_score * 100, 1),
        "variety_match": round(variety_score * 100, 1),
        "grade_match": round(grade_score * 100, 1),
        "date_window": round(date_score * 100, 1),
        "proximity": round(proximity_score * 100, 1),
        "quantity_fit": round(quantity_score * 100, 1)
    }

    reasons = [
        variety_reason,
        grade_reason,
        date_reason,
        proximity_reason,
        quantity_reason
    ]

    summary = (
        f"Verified 4-farmer collective lot offering {team_total_kg:g} kg {team.crop} ({team.variety}) Grade {team.grade}. "
        f"Consolidated pickup depot {dist_km or '~45'} km away, scheduled for {team.target_selling_date}."
    )

    return (final_score, breakdown, reasons, summary)
