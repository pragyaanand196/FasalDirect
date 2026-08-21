from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import date, datetime
import json

from app.database import get_db
from app.models import (
    User, ProduceLot, Team, TeamMember, JoinRequest, BuyerRequirement,
    Notification, CollectiveNegotiation, SaleTransaction
)
from app.schemas import (
    TeamCreate, TeamDetailResponse, TeamMemberInfo, TeamOpportunityResponse,
    JoinRequestCreate, JoinRequestResponse, JoinRequestReview,
    WhatIfSimulationRequest, WhatIfSimulationResponse, TeamGrowthSimulationResponse
)
from app.auth import get_current_user, require_farmer
from app.config import settings
from app.engine.compatibility import (
    compute_compatibility_score, compute_buyer_team_compatibility_score,
    calculate_haversine_distance
)
from app.engine.logistics import calculate_smart_collection_point, calculate_shared_transport_savings

router = APIRouter(prefix="/teams", tags=["Collective Teams"])

@router.post("", response_model=TeamDetailResponse)
def create_team(
    req: TeamCreate,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    if not req.name or not req.name.strip():
        raise HTTPException(status_code=400, detail="Team name is required")

    produce = db.query(ProduceLot).filter(
        ProduceLot.id == req.produce_lot_id,
        ProduceLot.farmer_id == current_user.id
    ).first()
    
    if not produce:
        raise HTTPException(status_code=404, detail="Produce lot not found")
    if produce.status != "available":
        raise HTTPException(status_code=400, detail="This produce lot is already committed to a team or sold")

    # Determine collection point default from creator's farm
    coll_lat = current_user.latitude or 19.9975
    coll_lng = current_user.longitude or 73.7898
    coll_addr = f"{current_user.village or ''}, {current_user.district or ''}, {current_user.state or ''}".strip(", ")
    if not coll_addr:
        coll_addr = "Regional Collection Depot"

    team = Team(
        name=req.name.strip(),
        representative_id=current_user.id,
        crop=produce.crop,
        variety=produce.variety,
        grade=produce.grade,
        target_selling_date=req.target_selling_date or produce.expected_selling_date,
        status="open",
        collection_lat=coll_lat,
        collection_lng=coll_lng,
        collection_address=coll_addr
    )
    db.add(team)
    db.flush()

    # Add creator as Member #1 (Team Representative)
    member = TeamMember(
        team_id=team.id,
        farmer_id=current_user.id,
        produce_lot_id=produce.id,
        contributed_kg=produce.quantity_kg,
        vote_status="pending"
    )
    db.add(member)

    # Lock creator produce lot
    produce.status = "locked_in_team"

    # Notification
    notif = Notification(
        user_id=current_user.id,
        title="Team Created Successfully",
        message=f"You created team '{team.name}'. You are the Team Representative. Other compatible farmers can now request to join.",
        category="team_status",
        link=f"/dashboard/teams/{team.id}"
    )
    db.add(notif)

    db.commit()
    db.refresh(team)
    return get_team_detail_by_id(team.id, current_user, db)

@router.get("/compatible", response_model=List[TeamOpportunityResponse])
def find_compatible_teams(
    produce_lot_id: int,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    produce = db.query(ProduceLot).filter(
        ProduceLot.id == produce_lot_id,
        ProduceLot.farmer_id == current_user.id
    ).first()
    if not produce:
        raise HTTPException(status_code=404, detail="Produce lot not found")

    # Fetch all open teams with the same crop
    teams = db.query(Team).filter(
        Team.crop.ilike(produce.crop.strip()),
        Team.status.in_(["open", "ready_to_sell"])
    ).all()

    # Fetch active buyer requirements for smart target contribution scoring
    active_buyers = db.query(BuyerRequirement).filter(
        BuyerRequirement.crop.ilike(produce.crop.strip()),
        BuyerRequirement.status == "active"
    ).all()

    opportunities = []

    for t in teams:
        members = db.query(TeamMember).filter(TeamMember.team_id == t.id).all()
        # Enforce strict 4-member limit
        if len(members) >= 4:
            continue
        # Skip if farmer is already a member
        if any(m.farmer_id == current_user.id for m in members):
            continue

        rep = db.query(User).filter(User.id == t.representative_id).first()
        score, breakdown, reasons, summary = compute_compatibility_score(
            farmer_produce=produce,
            farmer_user=current_user,
            team=t,
            representative_user=rep,
            team_members=members,
            buyer_requirements=active_buyers
        )

        # Distance calculation
        dist_km = None
        if current_user.latitude and rep and rep.latitude:
            dist_km = calculate_haversine_distance(
                current_user.latitude, current_user.longitude,
                rep.latitude, rep.longitude
            )

        combined_kg = sum(m.contributed_kg for m in members)
        days_diff = abs((produce.expected_selling_date - t.target_selling_date).days)
        rep_loc = f"{rep.village or ''}, {rep.district or ''}".strip(", ") if rep else "Local Region"

        opportunities.append(
            TeamOpportunityResponse(
                team_id=t.id,
                name=t.name,
                crop=t.crop,
                variety=t.variety,
                grade=t.grade,
                target_selling_date=t.target_selling_date,
                status=t.status,
                current_members_count=len(members),
                available_slots=4 - len(members),
                combined_quantity_kg=combined_kg,
                compatibility_percentage=score,
                distance_km=dist_km,
                selling_window_diff_days=days_diff,
                explanation=summary,
                score_breakdown=breakdown,
                representative_name=rep.full_name if rep else "Representative",
                representative_location=rep_loc or "Local Hub",
                created_at=t.created_at
            )
        )

    # Sort descending by compatibility percentage
    opportunities.sort(key=lambda x: x.compatibility_percentage, reverse=True)
    return opportunities

@router.get("/recently-created", response_model=List[TeamOpportunityResponse])
def get_recently_created_compatible_teams(
    produce_lot_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # If farmer called with specific produce
    if produce_lot_id and current_user.role == "farmer":
        return find_compatible_teams(produce_lot_id, current_user, db)
    
    # If caller is a buyer: match against buyer's active requirements or location
    if current_user.role == "buyer":
        buyer_reqs = db.query(BuyerRequirement).filter(
            BuyerRequirement.buyer_id == current_user.id,
            BuyerRequirement.status == "active"
        ).all()

        active_teams = db.query(Team).filter(
            Team.status.in_(["open", "full", "ready_to_sell"])
        ).order_by(Team.created_at.desc()).all()

        results = []
        for t in active_teams:
            members = db.query(TeamMember).filter(TeamMember.team_id == t.id).all()
            if not members:
                continue
            rep = db.query(User).filter(User.id == t.representative_id).first()
            combined_kg = sum(m.contributed_kg for m in members)
            rep_loc = t.collection_address or (f"{rep.village or ''}, {rep.district or ''}".strip(", ") if rep else "Regional Depot")

            # Check if matching requirement exists for this team's crop
            matching_req = next((r for r in buyer_reqs if r.crop.lower() == t.crop.lower()), None)
            if not matching_req and buyer_reqs:
                # If buyer specified requirements for different crops, pick closest or first
                matching_req = buyer_reqs[0]

            if matching_req:
                score, breakdown, reasons, summary = compute_buyer_team_compatibility_score(
                    buyer_req=matching_req,
                    buyer_user=current_user,
                    team=t,
                    representative_user=rep,
                    team_members=members
                )
                dist_km = calculate_haversine_distance(
                    matching_req.delivery_lat or current_user.latitude,
                    matching_req.delivery_lng or current_user.longitude,
                    t.collection_lat or (rep.latitude if rep else None),
                    t.collection_lng or (rep.longitude if rep else None)
                )
                days_diff = abs((matching_req.target_delivery_date - t.target_selling_date).days)
            else:
                dist_km = calculate_haversine_distance(
                    current_user.latitude, current_user.longitude,
                    t.collection_lat or (rep.latitude if rep else None),
                    t.collection_lng or (rep.longitude if rep else None)
                )
                days_diff = 0
                score = 90.0 if t.status in ["full", "ready_to_sell"] else 80.0
                breakdown = {
                    "crop_match": 100.0,
                    "variety_match": 90.0,
                    "grade_match": 100.0,
                    "date_window": 85.0,
                    "proximity": 80.0,
                    "quantity_fit": 85.0
                }
                summary = f"Verified collective lot aggregating {combined_kg:g} kg {t.crop} ({t.variety}) Grade {t.grade} from {len(members)} farmers."

            results.append(
                TeamOpportunityResponse(
                    team_id=t.id,
                    name=t.name,
                    crop=t.crop,
                    variety=t.variety,
                    grade=t.grade,
                    target_selling_date=t.target_selling_date,
                    status=t.status,
                    current_members_count=len(members),
                    available_slots=max(0, 4 - len(members)),
                    combined_quantity_kg=combined_kg,
                    compatibility_percentage=score,
                    distance_km=dist_km,
                    selling_window_diff_days=days_diff,
                    explanation=summary,
                    score_breakdown=breakdown,
                    representative_name=rep.full_name if rep else "Representative",
                    representative_location=rep_loc,
                    created_at=t.created_at
                )
            )

        results.sort(key=lambda x: x.compatibility_percentage, reverse=True)
        return results

    # If caller is a Farmer without specific produce passed
    open_teams = db.query(Team).filter(Team.status == "open").order_by(Team.created_at.desc()).limit(15).all()
    results = []
    farmer_produce = db.query(ProduceLot).filter(
        ProduceLot.farmer_id == current_user.id,
        ProduceLot.status == "available"
    ).first()

    for t in open_teams:
        members = db.query(TeamMember).filter(TeamMember.team_id == t.id).all()
        if len(members) >= 4:
            continue
        if any(m.farmer_id == current_user.id for m in members):
            continue

        rep = db.query(User).filter(User.id == t.representative_id).first()
        combined_kg = sum(m.contributed_kg for m in members)
        rep_loc = t.collection_address or (f"{rep.village or ''}, {rep.district or ''}".strip(", ") if rep else "Regional")

        if farmer_produce and farmer_produce.crop.lower() == t.crop.lower():
            score, breakdown, reasons, summary = compute_compatibility_score(
                farmer_produce=farmer_produce,
                farmer_user=current_user,
                team=t,
                representative_user=rep,
                team_members=members
            )
            dist_km = calculate_haversine_distance(
                current_user.latitude, current_user.longitude,
                t.collection_lat or (rep.latitude if rep else None),
                t.collection_lng or (rep.longitude if rep else None)
            )
            days_diff = abs((farmer_produce.expected_selling_date - t.target_selling_date).days)
        else:
            dist_km = calculate_haversine_distance(
                current_user.latitude, current_user.longitude,
                t.collection_lat or (rep.latitude if rep else None),
                t.collection_lng or (rep.longitude if rep else None)
            )
            days_diff = 0
            score = 80.0
            breakdown = {"crop_match": 100.0, "variety_match": 80.0, "grade_match": 90.0, "date_window": 80.0, "proximity": 75.0, "quantity_fit": 75.0}
            summary = f"Open collective lot aggregating {combined_kg:g} kg {t.crop} Grade {t.grade}. Seeking {4 - len(members)} more farmers."

        results.append(
            TeamOpportunityResponse(
                team_id=t.id,
                name=t.name,
                crop=t.crop,
                variety=t.variety,
                grade=t.grade,
                target_selling_date=t.target_selling_date,
                status=t.status,
                current_members_count=len(members),
                available_slots=4 - len(members),
                combined_quantity_kg=combined_kg,
                compatibility_percentage=score,
                distance_km=dist_km,
                selling_window_diff_days=days_diff,
                explanation=summary,
                score_breakdown=breakdown,
                representative_name=rep.full_name if rep else "Representative",
                representative_location=rep_loc,
                created_at=t.created_at
            )
        )

    results.sort(key=lambda x: x.compatibility_percentage, reverse=True)
    return results

@router.get("/my", response_model=List[TeamDetailResponse])
def get_my_teams(
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    memberships = db.query(TeamMember).filter(TeamMember.farmer_id == current_user.id).all()
    team_ids = [m.team_id for m in memberships]
    
    # Also include represented teams
    represented = db.query(Team).filter(Team.representative_id == current_user.id).all()
    for t in represented:
        if t.id not in team_ids:
            team_ids.append(t.id)

    teams = db.query(Team).filter(Team.id.in_(team_ids)).order_by(Team.created_at.desc()).all()
    return [get_team_detail_by_id(t.id, current_user, db) for t in teams]

@router.get("/{team_id}", response_model=TeamDetailResponse)
def get_team_detail_by_id(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    members = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
    total_kg = sum(m.contributed_kg for m in members) if members else 0.0

    member_infos = []
    for m in members:
        f = db.query(User).filter(User.id == m.farmer_id).first()
        p = db.query(ProduceLot).filter(ProduceLot.id == m.produce_lot_id).first()
        pct = round((m.contributed_kg / total_kg) * 100, 1) if total_kg > 0 else 0.0
        member_infos.append(
            TeamMemberInfo(
                id=m.id,
                farmer_id=m.farmer_id,
                farmer_name=f.full_name if f else "Farmer",
                village=f.village if f else None,
                district=f.district if f else None,
                state=f.state if f else None,
                crop=p.crop if p else team.crop,
                variety=p.variety if p else team.variety,
                grade=p.grade if p else team.grade,
                contributed_kg=m.contributed_kg,
                percentage=pct,
                joined_at=m.joined_at,
                vote_status=m.vote_status,
                is_representative=(m.farmer_id == team.representative_id)
            )
        )

    rep = db.query(User).filter(User.id == team.representative_id).first()
    is_member = any(m.farmer_id == current_user.id for m in members)
    is_rep = (current_user.id == team.representative_id)

    # Active negotiation ID
    active_neg = db.query(CollectiveNegotiation).filter(
        CollectiveNegotiation.team_id == team.id,
        CollectiveNegotiation.status.in_(["offer_received", "counter_sent", "voting", "deal_agreed"])
    ).first()

    # Buyer Unlocks: check actual buyer requirements matching crop
    buyer_unlocks = []
    matching_buyers = db.query(BuyerRequirement).filter(
        BuyerRequirement.crop.ilike(team.crop),
        BuyerRequirement.status == "active"
    ).all()

    for b in matching_buyers:
        b_user = db.query(User).filter(User.id == b.buyer_id).first()
        b_name = b_user.business_name or b_user.full_name if b_user else "Bulk Buyer"
        needed_kg = max(0.0, b.min_quantity_kg - total_kg)
        progress_pct = min(100.0, round((total_kg / b.min_quantity_kg) * 100, 1)) if b.min_quantity_kg > 0 else 100.0
        
        buyer_unlocks.append({
            "requirement_id": b.id,
            "buyer_name": b_name,
            "buyer_location": f"{b.delivery_district}, {b.delivery_state}",
            "target_min_quantity_kg": b.min_quantity_kg,
            "current_team_quantity_kg": total_kg,
            "kg_needed_to_unlock": needed_kg,
            "progress_percentage": progress_pct,
            "offered_price_per_kg": b.offered_price_per_kg,
            "is_unlocked": (needed_kg <= 0),
            "target_delivery_date": str(b.target_delivery_date)
        })

    completed_sales = db.query(SaleTransaction).filter(
        SaleTransaction.team_id == team.id,
        SaleTransaction.payment_status == "completed"
    ).count()

    return TeamDetailResponse(
        id=team.id,
        name=team.name,
        crop=team.crop,
        variety=team.variety,
        grade=team.grade,
        target_selling_date=team.target_selling_date,
        status=team.status,
        representative_id=team.representative_id,
        representative_name=rep.full_name if rep else "Representative",
        representative_phone=rep.phone if (is_member or current_user.role in ["buyer", "admin"]) else None,
        current_members_count=len(members),
        available_slots=max(0, 4 - len(members)),
        combined_quantity_kg=total_kg,
        members=member_infos,
        collection_lat=team.collection_lat,
        collection_lng=team.collection_lng,
        collection_address=team.collection_address,
        created_at=team.created_at,
        is_current_user_member=is_member,
        is_current_user_representative=is_rep,
        active_negotiation_id=active_neg.id if active_neg else None,
        completed_sales_count=completed_sales,
        buyer_unlocks=buyer_unlocks
    )

@router.post("/{team_id}/join-request", response_model=JoinRequestResponse)
def create_join_request(
    team_id: int,
    req: JoinRequestCreate,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    if team.status not in ["open", "ready_to_sell"]:
        raise HTTPException(status_code=400, detail=f"Cannot join team: team is already full or unavailable (status '{team.status}')")

    members = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
    # Enforce strict 4-member limit
    if len(members) >= 4:
        raise HTTPException(status_code=400, detail="Team is already full (maximum 4 farmers allowed)")
    
    if any(m.farmer_id == current_user.id for m in members):
        raise HTTPException(status_code=400, detail="You are already a member of this team")

    produce = db.query(ProduceLot).filter(
        ProduceLot.id == req.produce_lot_id,
        ProduceLot.farmer_id == current_user.id
    ).first()
    if not produce:
        raise HTTPException(status_code=404, detail="Produce lot not found")
    if produce.status != "available":
        raise HTTPException(status_code=400, detail="This produce lot is not available")

    # Check pending request
    existing_req = db.query(JoinRequest).filter(
        JoinRequest.team_id == team.id,
        JoinRequest.farmer_id == current_user.id,
        JoinRequest.status == "pending"
    ).first()
    if existing_req:
        raise HTTPException(status_code=400, detail="You already have a pending join request for this team")

    rep = db.query(User).filter(User.id == team.representative_id).first()
    score, breakdown, reasons, summary = compute_compatibility_score(
        farmer_produce=produce,
        farmer_user=current_user,
        team=team,
        representative_user=rep,
        team_members=members
    )

    join_req = JoinRequest(
        team_id=team.id,
        farmer_id=current_user.id,
        produce_lot_id=produce.id,
        compatibility_score=score,
        reasons_json=json.dumps(reasons),
        message=req.message,
        status="pending"
    )
    db.add(join_req)
    db.flush()

    # Notify Representative
    notif = Notification(
        user_id=team.representative_id,
        title=f"New Join Request ({score}% Match)",
        message=f"Farmer {current_user.full_name} requested to join '{team.name}' with {produce.quantity_kg:g} kg of {produce.crop}.",
        category="join_request",
        link=f"/dashboard/teams/requests?team_id={team.id}"
    )
    db.add(notif)

    db.commit()
    db.refresh(join_req)

    return JoinRequestResponse(
        id=join_req.id,
        team_id=team.id,
        team_name=team.name,
        farmer_id=current_user.id,
        farmer_name=current_user.full_name,
        farmer_village=current_user.village,
        farmer_district=current_user.district,
        crop=produce.crop,
        variety=produce.variety,
        grade=produce.grade,
        contributed_kg=produce.quantity_kg,
        harvest_date=produce.harvest_date,
        expected_selling_date=produce.expected_selling_date,
        min_price_per_kg=produce.min_price_per_kg,
        compatibility_score=score,
        match_reasons=reasons,
        message=join_req.message,
        status=join_req.status,
        created_at=join_req.created_at
    )

@router.get("/{team_id}/join-requests", response_model=List[JoinRequestResponse])
def get_team_join_requests(
    team_id: int,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    if team.representative_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the Team Representative can review join requests")

    requests = db.query(JoinRequest).filter(
        JoinRequest.team_id == team_id,
        JoinRequest.status == "pending"
    ).all()

    results = []
    for r in requests:
        f = db.query(User).filter(User.id == r.farmer_id).first()
        p = db.query(ProduceLot).filter(ProduceLot.id == r.produce_lot_id).first()
        reasons = json.loads(r.reasons_json) if r.reasons_json else []
        results.append(
            JoinRequestResponse(
                id=r.id,
                team_id=team.id,
                team_name=team.name,
                farmer_id=r.farmer_id,
                farmer_name=f.full_name if f else "Farmer",
                farmer_village=f.village if f else None,
                farmer_district=f.district if f else None,
                crop=p.crop if p else team.crop,
                variety=p.variety if p else team.variety,
                grade=p.grade if p else team.grade,
                contributed_kg=p.quantity_kg if p else 0.0,
                harvest_date=p.harvest_date if p else team.target_selling_date,
                expected_selling_date=p.expected_selling_date if p else team.target_selling_date,
                min_price_per_kg=p.min_price_per_kg if p else 0.0,
                compatibility_score=r.compatibility_score,
                match_reasons=reasons,
                message=r.message,
                status=r.status,
                created_at=r.created_at
            )
        )
    return results

@router.post("/{team_id}/join-requests/{req_id}/review")
def review_join_request(
    team_id: int,
    req_id: int,
    review: JoinRequestReview,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    if team.representative_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the Team Representative can review join requests")

    join_req = db.query(JoinRequest).filter(
        JoinRequest.id == req_id,
        JoinRequest.team_id == team_id,
        JoinRequest.status == "pending"
    ).first()
    if not join_req:
        raise HTTPException(status_code=404, detail="Join request not found or already processed")

    if review.action.lower() == "approve":
        members = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
        # Enforce strict 4-member limit
        if len(members) >= 4:
            join_req.status = "rejected"
            db.commit()
            raise HTTPException(status_code=400, detail="Team is already full (maximum 4 farmers). Cannot approve more members.")

        produce = db.query(ProduceLot).filter(ProduceLot.id == join_req.produce_lot_id).first()
        if not produce or produce.status != "available":
            join_req.status = "rejected"
            db.commit()
            raise HTTPException(status_code=400, detail="The farmer's produce lot is no longer available")

        # Add member
        member = TeamMember(
            team_id=team.id,
            farmer_id=join_req.farmer_id,
            produce_lot_id=produce.id,
            contributed_kg=produce.quantity_kg,
            vote_status="pending"
        )
        db.add(member)
        produce.status = "locked_in_team"
        join_req.status = "approved"
        join_req.reviewed_at = datetime.utcnow()

        # Update member count and check if full
        all_members = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
        new_count = len(all_members) + 1  # including newly added
        if new_count >= 4:
            team.status = "full"
            # Reject any remaining pending join requests
            pending_others = db.query(JoinRequest).filter(
                JoinRequest.team_id == team.id,
                JoinRequest.status == "pending",
                JoinRequest.id != join_req.id
            ).all()
            for po in pending_others:
                po.status = "rejected"

        # Update Smart Collection Point centroid
        member_farmers = db.query(User).filter(
            User.id.in_([m.farmer_id for m in all_members] + [join_req.farmer_id])
        ).all()
        coords = [(f.latitude, f.longitude) for f in member_farmers if f.latitude and f.longitude]
        if coords:
            lat, lng, desc = calculate_smart_collection_point(coords)
            team.collection_lat = lat
            team.collection_lng = lng
            team.collection_address = desc

        # Notify applicant
        notif = Notification(
            user_id=join_req.farmer_id,
            title="Join Request Approved!",
            message=f"Welcome! Your request to join team '{team.name}' has been approved by Representative {current_user.full_name}.",
            category="approval",
            link=f"/dashboard/teams/{team.id}"
        )
        db.add(notif)

    elif review.action.lower() == "reject":
        join_req.status = "rejected"
        join_req.reviewed_at = datetime.utcnow()

        notif = Notification(
            user_id=join_req.farmer_id,
            title="Join Request Update",
            message=f"Your request to join team '{team.name}' was not accepted at this time.",
            category="approval",
            link=f"/dashboard/teams"
        )
        db.add(notif)
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'approve' or 'reject'.")

    db.commit()
    return {"message": f"Join request {review.action}d successfully"}

@router.post("/{team_id}/withdraw")
def withdraw_from_team(
    team_id: int,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    if team.status in ["selling", "sold", "payment_processing", "completed"]:
        raise HTTPException(status_code=400, detail="Cannot withdraw once produce is committed to an agreed sale")

    member = db.query(TeamMember).filter(
        TeamMember.team_id == team.id,
        TeamMember.farmer_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=400, detail="You are not a member of this team")

    # Release produce
    if member.produce_lot:
        member.produce_lot.status = "available"

    db.delete(member)
    db.flush()

    remaining_members = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
    
    if not remaining_members:
        # If no members left, remove empty team
        db.delete(team)
        db.commit()
        return {"message": "You withdrew and the empty team was removed"}
    
    # If representative withdrew, pass role to first remaining member
    if team.representative_id == current_user.id:
        new_rep_id = remaining_members[0].farmer_id
        team.representative_id = new_rep_id
        notif = Notification(
            user_id=new_rep_id,
            title="Assigned as Team Representative",
            message=f"The previous representative withdrew from '{team.name}'. You are now the Team Representative.",
            category="team_status",
            link=f"/dashboard/teams/{team.id}"
        )
        db.add(notif)

    # Reopen team slot
    team.status = "open"

    db.commit()
    return {"message": "Withdrawn from team successfully. Your produce has been unlocked."}

@router.post("/{team_id}/what-if-simulation", response_model=WhatIfSimulationResponse)
def simulate_what_if_benefit(
    team_id: int,
    req: WhatIfSimulationRequest,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    produce = db.query(ProduceLot).filter(ProduceLot.id == req.produce_lot_id).first()
    if not produce:
        raise HTTPException(status_code=404, detail="Produce lot not found")

    qty = produce.quantity_kg
    # Solo benchmark: default to min price or local mandi price
    solo_price = req.solo_price_per_kg or produce.min_price_per_kg or 24.0
    solo_dist = req.distance_km or 35.0
    # Solo transport: small tempo solo run ~₹800 base + ₹18/km
    solo_transport = 800.0 + (solo_dist * 18.0)
    solo_gross = qty * solo_price
    solo_net = max(0.0, solo_gross - solo_transport)
    solo_realization_per_kg = round(solo_net / qty, 2) if qty > 0 else 0.0

    # Team benchmark: bulk buyer price is typically ~12-18% higher
    team_price = req.team_price_per_kg or (solo_price * 1.15)
    # Team shared transport savings (split among 4 farmers)
    transport_savings = calculate_shared_transport_savings(4, qty * 4, solo_dist)
    team_shared_transport = transport_savings["collective_transport_cost"] / 4
    team_gross = qty * team_price
    team_fee = team_gross * (settings.DEFAULT_PLATFORM_FEE_PERCENT / 100.0)
    team_net = max(0.0, team_gross - team_shared_transport - team_fee)
    team_realization_per_kg = round(team_net / qty, 2) if qty > 0 else 0.0

    net_gain = round(team_net - solo_net, 2)
    net_pct = round(((team_net - solo_net) / solo_net) * 100, 1) if solo_net > 0 else 0.0

    summary = (
        f"By aggregating in a 4-farmer team, your net in-hand earnings increase from ₹{solo_net:,.2f} to ₹{team_net:,.2f} "
        f"(an extra +₹{net_gain:,.2f} or +{net_pct}%). You gain ₹{team_price - solo_price:+.2f}/kg in bulk buyer pricing "
        f"and save ₹{solo_transport - team_shared_transport:,.2f} on transport."
    )

    return WhatIfSimulationResponse(
        quantity_kg=qty,
        solo_price_per_kg=round(solo_price, 2),
        solo_gross_revenue=round(solo_gross, 2),
        solo_transport_cost=round(solo_transport, 2),
        solo_net_realization=round(solo_net, 2),
        solo_realization_per_kg=solo_realization_per_kg,
        team_expected_price_per_kg=round(team_price, 2),
        team_gross_revenue=round(team_gross, 2),
        team_shared_transport_cost=round(team_shared_transport, 2),
        team_platform_fee=round(team_fee, 2),
        team_net_realization=round(team_net, 2),
        team_realization_per_kg=team_realization_per_kg,
        net_improvement_amount=net_gain,
        net_improvement_percentage=net_pct,
        summary=summary
    )

@router.get("/{team_id}/growth-simulation", response_model=TeamGrowthSimulationResponse)
def simulate_team_growth(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    members = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
    current_members = len(members)
    current_kg = sum(m.contributed_kg for m in members)
    slots_left = max(0, 4 - current_members)

    avg_kg_per_member = (current_kg / current_members) if current_members > 0 else 500.0
    projected_kg = current_kg + (slots_left * avg_kg_per_member)

    # Check active buyers for this crop
    matching_buyers = db.query(BuyerRequirement).filter(
        BuyerRequirement.crop.ilike(team.crop),
        BuyerRequirement.status == "active"
    ).all()

    highest_price = max([b.offered_price_per_kg for b in matching_buyers] + [30.0])
    unlocked_buyers = [b for b in matching_buyers if projected_kg >= b.min_quantity_kg]

    current_val = round(current_kg * 25.0, 2)
    projected_val = round(projected_kg * highest_price, 2)
    gain = round(projected_val - current_val, 2)

    explanation = (
        f"Filling the remaining {slots_left} slot{'s' if slots_left != 1 else ''} will grow the team lot to approximately "
        f"{projected_kg:g} kg, unlocking up to {len(unlocked_buyers)} bulk buyer opportunities offering up to ₹{highest_price}/kg."
    )

    return TeamGrowthSimulationResponse(
        current_members_count=current_members,
        current_quantity_kg=current_kg,
        slots_left=slots_left,
        projected_final_quantity_kg=projected_kg,
        unlocked_buyers_count=len(unlocked_buyers),
        highest_potential_price_per_kg=highest_price,
        current_est_value=current_val,
        projected_est_value=projected_val,
        potential_value_gain=gain,
        explanation=explanation
    )

@router.get("/{team_id}/health")
def get_team_health(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    members = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
    checks = []
    
    # 1. Member capacity
    m_count = len(members)
    checks.append({
        "check": "Member Capacity",
        "status": "pass" if m_count >= 2 else "warning",
        "detail": f"{m_count}/4 farmers confirmed ({4 - m_count} slots open)"
    })

    # 2. Grade consistency
    grades = set()
    for m in members:
        p = db.query(ProduceLot).filter(ProduceLot.id == m.produce_lot_id).first()
        if p:
            grades.add(p.grade)
    checks.append({
        "check": "Grade Homogeneity",
        "status": "pass" if len(grades) <= 1 else "warning",
        "detail": f"Quality grades in lot: {', '.join(grades) if grades else 'Grade A'}"
    })

    # 3. Buyer Demand Alignment
    total_kg = sum(m.contributed_kg for m in members)
    active_buyers = db.query(BuyerRequirement).filter(
        BuyerRequirement.crop.ilike(team.crop),
        BuyerRequirement.status == "active",
        BuyerRequirement.min_quantity_kg <= total_kg
    ).count()
    checks.append({
        "check": "Market Buyer Demand",
        "status": "pass" if active_buyers > 0 else "info",
        "detail": f"{active_buyers} active institutional buyers currently match this lot volume ({total_kg:g} kg)"
    })

    overall_health = "Excellent" if m_count >= 3 and len(grades) <= 1 else ("Good" if m_count >= 2 else "Forming")

    return {
        "team_id": team.id,
        "team_name": team.name,
        "overall_health": overall_health,
        "checks": checks
    }
