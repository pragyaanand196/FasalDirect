from typing import Dict, Any, List, Optional

def explain_team_recommendation(
    team_data: Dict[str, Any],
    farmer_produce: Dict[str, Any],
    score_breakdown: Dict[str, float]
) -> Dict[str, Any]:
    """
    Generates a natural, grounded explanation for why a team was recommended to a farmer.
    """
    crop = team_data.get("crop", "produce")
    variety = team_data.get("variety", "Standard")
    grade = team_data.get("grade", "A")
    score = team_data.get("compatibility_percentage", 0.0)
    distance = team_data.get("distance_km", 15.0)
    current_kg = team_data.get("combined_quantity_kg", 0.0)
    farmer_kg = farmer_produce.get("quantity_kg", 0.0)
    new_total = current_kg + farmer_kg

    factors = [
        {"factor": "Crop & Grade Match", "detail": f"Both listing {crop} ({variety}) Grade {grade}", "impact": "High Positive"},
        {"factor": "Logistics Proximity", "detail": f"Farm locations are ~{distance} km apart, allowing shared vehicle pickup", "impact": "Positive"},
        {"factor": "Harvest Synchronization", "detail": f"Ready within close harvest dates for unified batching", "impact": "Positive"},
        {"factor": "Volume Aggregation", "detail": f"Combines your {farmer_kg:g} kg to reach {new_total:g} kg lot size", "impact": "Key Advantage"}
    ]

    explanation = (
        f"This team '{team_data.get('name')}' is recommended with a {score}% compatibility score because you and the existing members "
        f"grow identical {crop} (Grade {grade}) with overlapping harvest timelines. By combining your {farmer_kg:g} kg with the team's "
        f"{current_kg:g} kg, you create a commercial batch of {new_total:g} kg. This lot size attracts bulk institutional buyers who offer "
        f"₹2-₹5 more per kg compared to distress local mandi sales, while halving your individual transportation expenses."
    )

    return {
        "title": f"Why Team '{team_data.get('name')}' is Recommended ({score}% Match)",
        "explanation": explanation,
        "key_factors": factors,
        "recommendation_verdict": "Strongly Recommended to Join"
    }

def explain_ineligibility(
    team_data: Dict[str, Any],
    farmer_produce: Dict[str, Any],
    reasons: List[str]
) -> Dict[str, Any]:
    """
    Explains why a farmer cannot join a specific team.
    """
    team_name = team_data.get("name", "Team")
    members_count = team_data.get("current_members_count", 0)

    if members_count >= 4:
        return {
            "title": f"Team '{team_name}' is Full",
            "explanation": "Every collective team on FasalDirect has a strict maximum limit of 4 farmers to ensure strong local trust, rapid decision making, and fair representation. This team already has 4 confirmed members.",
            "key_factors": [
                {"factor": "Member Limit Reached", "detail": "4 of 4 slots filled", "impact": "Hard Constraint"},
                {"factor": "Actionable Next Step", "detail": "You can create a new team and invite other compatible neighbors", "impact": "Opportunity"}
            ],
            "recommendation_verdict": "Team Full — Create or Join Another Team"
        }
    
    return {
        "title": f"Compatibility Notice for Team '{team_name}'",
        "explanation": f"This team is aggregating {team_data.get('crop')} Grade {team_data.get('grade')}, but your produce profile has some incompatibilities.",
        "key_factors": [{"factor": "Identified Difference", "detail": r, "impact": "Requires Alignment"} for r in reasons],
        "recommendation_verdict": "Consider teams with matching crop, grade, and harvest windows"
    }

def explain_net_realization_comparison(
    solo_data: Dict[str, Any],
    team_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Explains the financial difference between selling alone vs in a collective team.
    """
    solo_realization = solo_data.get("solo_realization_per_kg", 0.0)
    team_realization = team_data.get("team_realization_per_kg", 0.0)
    diff = round(team_realization - solo_realization, 2)
    percent = team_data.get("net_improvement_percentage", 0.0)

    explanation = (
        f"By selling collectively in a 4-farmer team, your net in-hand realization increases by ₹{diff:,.2f} per kg (+{percent}%). "
        f"This advantage comes from two key factors: (1) Bulk premium from direct institutional buyers (who pay higher for a verified single batch), "
        f"and (2) Sharing a single vehicle freight instead of 4 separate individual tempo trips."
    )

    factors = [
        {"factor": "Bulk Buyer Premium", "detail": f"₹{team_data.get('team_expected_price_per_kg', 0) - solo_data.get('solo_price_per_kg', 0):+.2f}/kg higher base offer for aggregated lot", "impact": "Revenue Boost"},
        {"factor": "Shared Freight Savings", "detail": f"Consolidates 4 individual transport trips into 1 shared run", "impact": "Cost Reduction"},
        {"factor": "Transparent Platform Fee", "detail": f"{team_data.get('team_platform_fee', 0):.1f}% for verified settlement and digital passport", "impact": "Fair Payout Guarantee"}
    ]

    return {
        "title": f"Collective Bargaining Financial Breakdown (+₹{diff}/kg Net Advantage)",
        "explanation": explanation,
        "key_factors": factors,
        "recommendation_verdict": f"Expected +{percent}% higher net income for your produce"
    }
