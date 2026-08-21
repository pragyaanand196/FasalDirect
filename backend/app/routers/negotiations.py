from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import (
    User, Team, TeamMember, BuyerRequirement, CollectiveNegotiation,
    Notification, SaleTransaction
)
from app.schemas import (
    OfferCreate, CounterOfferCreate, VoteRequest, NegotiationResponse
)
from app.auth import get_current_user, require_buyer
from app.config import settings
from app.engine.logistics import calculate_shared_transport_savings

router = APIRouter(prefix="/negotiations", tags=["Collective Negotiation"])

def _format_negotiation_response(
    neg: CollectiveNegotiation,
    current_user: User,
    db: Session
) -> NegotiationResponse:
    team = db.query(Team).filter(Team.id == neg.team_id).first()
    buyer = db.query(User).filter(User.id == neg.buyer_id).first()
    members = db.query(TeamMember).filter(TeamMember.team_id == neg.team_id).all()
    total_kg = sum(m.contributed_kg for m in members) if members else 0.0

    active_price = neg.final_agreed_price_per_kg or neg.counter_price_per_kg or neg.offered_price_per_kg
    gross_total = round(total_kg * active_price, 2)
    
    # Calculate estimated freight & platform fee
    freight = neg.transport_cost_total or (total_kg * 0.5)
    fee = round(gross_total * (settings.DEFAULT_PLATFORM_FEE_PERCENT / 100.0), 2)
    net_distributable = max(0.0, round(gross_total - freight - fee, 2))

    # Count approved votes among members
    approved_votes = sum(1 for m in members if m.vote_status == "approved")
    user_vote = next((m.vote_status for m in members if m.farmer_id == current_user.id), None)

    return NegotiationResponse(
        id=neg.id,
        team_id=neg.team_id,
        team_name=team.name if team else "Team",
        buyer_id=neg.buyer_id,
        buyer_name=buyer.full_name if buyer else "Buyer",
        buyer_business=buyer.business_name if buyer else None,
        offered_price_per_kg=neg.offered_price_per_kg,
        counter_price_per_kg=neg.counter_price_per_kg,
        final_agreed_price_per_kg=neg.final_agreed_price_per_kg,
        transport_cost_total=freight,
        platform_fee_total=fee,
        status=neg.status,
        notes=neg.notes,
        total_quantity_kg=total_kg,
        gross_total_amount=gross_total,
        net_distributable_amount=net_distributable,
        approval_votes_count=approved_votes,
        total_members_count=len(members),
        current_user_voted=user_vote,
        created_at=neg.created_at,
        updated_at=neg.updated_at
    )

@router.post("/offer", response_model=NegotiationResponse)
def create_buyer_offer(
    req: OfferCreate,
    current_user: User = Depends(require_buyer),
    db: Session = Depends(get_db)
):
    if req.offered_price_per_kg <= 0:
        raise HTTPException(status_code=400, detail="Offered price must be greater than zero")

    team = db.query(Team).filter(Team.id == req.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    if team.status in ["selling", "sold", "payment_processing", "completed"]:
        raise HTTPException(status_code=400, detail=f"Cannot make offer to team with status '{team.status}' (already committed or sold)")

    members = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
    if not members:
        raise HTTPException(status_code=400, detail="Team has no registered members")

    # Check for existing active negotiation from this buyer for this team
    existing_active = db.query(CollectiveNegotiation).filter(
        CollectiveNegotiation.team_id == team.id,
        CollectiveNegotiation.buyer_id == current_user.id,
        CollectiveNegotiation.status.in_(["offer_received", "counter_sent", "voting"])
    ).first()
    if existing_active:
        raise HTTPException(status_code=400, detail="You already have an active negotiation with this team")

    total_kg = sum(m.contributed_kg for m in members)
    freight_calc = calculate_shared_transport_savings(len(members), total_kg)
    transport_cost = freight_calc["collective_transport_cost"]
    gross_val = total_kg * req.offered_price_per_kg
    fee = round(gross_val * (settings.DEFAULT_PLATFORM_FEE_PERCENT / 100.0), 2)

    neg = CollectiveNegotiation(
        team_id=team.id,
        buyer_id=current_user.id,
        buyer_requirement_id=req.buyer_requirement_id,
        offered_price_per_kg=float(req.offered_price_per_kg),
        transport_cost_total=transport_cost,
        platform_fee_total=fee,
        status="offer_received",
        notes=req.notes.strip() if req.notes else None
    )
    db.add(neg)

    # Reset member vote statuses to pending for this negotiation
    for m in members:
        m.vote_status = "pending"

    # Notify Representative
    notif = Notification(
        user_id=team.representative_id,
        title="New Purchase Offer Received!",
        message=f"Buyer {current_user.business_name or current_user.full_name} offered ₹{req.offered_price_per_kg}/kg for team lot of {total_kg:g} kg {team.crop}.",
        category="offer",
        link=f"/dashboard/teams/{team.id}"
    )
    db.add(notif)

    db.commit()
    db.refresh(neg)
    return _format_negotiation_response(neg, current_user, db)

@router.post("/{neg_id}/counter", response_model=NegotiationResponse)
def send_counter_offer(
    neg_id: int,
    req: CounterOfferCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if req.counter_price_per_kg <= 0:
        raise HTTPException(status_code=400, detail="Counter price must be greater than zero")

    neg = db.query(CollectiveNegotiation).filter(CollectiveNegotiation.id == neg_id).first()
    if not neg:
        raise HTTPException(status_code=404, detail="Negotiation not found")

    if neg.status not in ["offer_received", "counter_sent", "voting"]:
        raise HTTPException(status_code=400, detail=f"Cannot counter a negotiation that is '{neg.status}'")

    team = db.query(Team).filter(Team.id == neg.team_id).first()
    if team.representative_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the Team Representative can send a counter-offer on behalf of the collective team")

    neg.counter_price_per_kg = float(req.counter_price_per_kg)
    neg.status = "counter_sent"
    if req.notes:
        neg.notes = f"{neg.notes or ''}\nRepresentative: {req.notes.strip()}".strip()

    # Reset member votes
    members = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
    for m in members:
        m.vote_status = "pending"

    # Notify Buyer
    notif = Notification(
        user_id=neg.buyer_id,
        title="Team Counter-Offer Received",
        message=f"Representative of '{team.name}' countered with ₹{req.counter_price_per_kg}/kg for the collective {team.crop} lot.",
        category="offer",
        link=f"/buyer/negotiations"
    )
    db.add(notif)

    db.commit()
    db.refresh(neg)
    return _format_negotiation_response(neg, current_user, db)

@router.post("/{neg_id}/vote")
def vote_on_offer(
    neg_id: int,
    req: VoteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    neg = db.query(CollectiveNegotiation).filter(CollectiveNegotiation.id == neg_id).first()
    if not neg:
        raise HTTPException(status_code=404, detail="Negotiation not found")

    if neg.status not in ["offer_received", "counter_sent", "voting"]:
        raise HTTPException(status_code=400, detail="Voting is only allowed on active negotiations")

    member = db.query(TeamMember).filter(
        TeamMember.team_id == neg.team_id,
        TeamMember.farmer_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Only verified team members can vote on collective offers")

    member.vote_status = req.vote.strip().lower()
    neg.status = "voting"
    db.commit()

    return {"message": f"Your vote '{req.vote}' has been recorded"}

@router.post("/{neg_id}/accept", response_model=NegotiationResponse)
def accept_negotiation(
    neg_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    neg = db.query(CollectiveNegotiation).filter(CollectiveNegotiation.id == neg_id).first()
    if not neg:
        raise HTTPException(status_code=404, detail="Negotiation not found")

    if neg.status in ["deal_agreed", "rejected", "cancelled"]:
        raise HTTPException(status_code=400, detail=f"Negotiation is already in '{neg.status}' state")

    team = db.query(Team).filter(Team.id == neg.team_id).first()
    members = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()

    # If buyer is accepting representative's counter-offer
    if current_user.role == "buyer" and current_user.id == neg.buyer_id:
        neg.final_agreed_price_per_kg = neg.counter_price_per_kg or neg.offered_price_per_kg
        neg.status = "deal_agreed"
        team.status = "selling"
    # If team representative is accepting buyer's offer
    elif current_user.id == team.representative_id:
        # Rep accepts
        neg.final_agreed_price_per_kg = neg.offered_price_per_kg
        neg.status = "deal_agreed"
        team.status = "selling"
    else:
        raise HTTPException(status_code=403, detail="Unauthorized to accept this negotiation")

    # Reject / cancel any other pending negotiations for this team to prevent double selling
    other_negs = db.query(CollectiveNegotiation).filter(
        CollectiveNegotiation.team_id == team.id,
        CollectiveNegotiation.id != neg.id,
        CollectiveNegotiation.status.in_(["offer_received", "counter_sent", "voting"])
    ).all()
    for o_neg in other_negs:
        o_neg.status = "rejected"

    # Notify all members
    for m in members:
        notif = Notification(
            user_id=m.farmer_id,
            title="Collective Sale Deal Confirmed!",
            message=f"Deal agreed at ₹{neg.final_agreed_price_per_kg}/kg for Team '{team.name}'. Awaiting buyer payment completion.",
            category="sale",
            link=f"/dashboard/teams/{team.id}"
        )
        db.add(notif)

    # Notify buyer
    notif_buyer = Notification(
        user_id=neg.buyer_id,
        title="Deal Confirmed — Proceed to Payment",
        message=f"Sale confirmed for Team '{team.name}' at ₹{neg.final_agreed_price_per_kg}/kg. Please complete payment to initiate automatic settlement.",
        category="sale",
        link="/buyer/purchases"
    )
    db.add(notif_buyer)

    db.commit()
    db.refresh(neg)
    return _format_negotiation_response(neg, current_user, db)

@router.get("/team/{team_id}", response_model=List[NegotiationResponse])
def get_team_negotiations(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    negs = db.query(CollectiveNegotiation).filter(
        CollectiveNegotiation.team_id == team_id
    ).order_by(CollectiveNegotiation.updated_at.desc()).all()

    return [_format_negotiation_response(n, current_user, db) for n in negs]

@router.get("/buyer/my", response_model=List[NegotiationResponse])
def get_buyer_negotiations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    negs = db.query(CollectiveNegotiation).filter(
        CollectiveNegotiation.buyer_id == current_user.id
    ).order_by(CollectiveNegotiation.updated_at.desc()).all()

    return [_format_negotiation_response(n, current_user, db) for n in negs]
