from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.database import get_db
from app.models import (
    User, Team, TeamMember, CollectiveNegotiation, SaleTransaction,
    SettlementRecord, CollectiveLotPassport, Notification
)
from app.schemas import (
    SaleCreate, PaymentSimulateRequest, SaleResponse, SettlementRecordResponse,
    LotPassportResponse
)
from app.auth import get_current_user
from app.config import settings
from app.engine.settlement import process_automatic_settlement

router = APIRouter(prefix="/sales", tags=["Sales & Settlement"])

def _format_sale_response(sale: SaleTransaction, db: Session) -> SaleResponse:
    team = db.query(Team).filter(Team.id == sale.team_id).first()
    buyer = db.query(User).filter(User.id == sale.buyer_id).first()
    settlements = db.query(SettlementRecord).filter(SettlementRecord.sale_id == sale.id).all()
    passport = db.query(CollectiveLotPassport).filter(CollectiveLotPassport.sale_id == sale.id).first()

    settlement_responses = []
    for s in settlements:
        farmer = db.query(User).filter(User.id == s.farmer_id).first()
        settlement_responses.append(
            SettlementRecordResponse(
                id=s.id,
                farmer_id=s.farmer_id,
                farmer_name=farmer.full_name if farmer else "Farmer",
                contributed_kg=s.contributed_kg,
                percentage_share=s.percentage_share,
                gross_payout=s.gross_payout,
                transport_share=s.transport_share,
                platform_fee_share=s.platform_fee_share,
                net_payout=s.net_payout,
                status=s.status,
                created_at=s.created_at
            )
        )

    return SaleResponse(
        id=sale.id,
        team_id=sale.team_id,
        team_name=team.name if team else "Team",
        buyer_id=sale.buyer_id,
        buyer_name=buyer.full_name if buyer else "Buyer",
        buyer_business=buyer.business_name if buyer else None,
        total_quantity_kg=sale.total_quantity_kg,
        price_per_kg=sale.price_per_kg,
        gross_amount=sale.gross_amount,
        transport_deduction=sale.transport_deduction,
        platform_fee=sale.platform_fee,
        net_distributable_amount=sale.net_distributable_amount,
        payment_status=sale.payment_status,
        payment_reference=sale.payment_reference,
        settlements=settlement_responses,
        lot_code=passport.lot_code if passport else None,
        created_at=sale.created_at
    )

@router.post("/checkout", response_model=SaleResponse)
def create_sale_from_negotiation(
    req: SaleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    neg = db.query(CollectiveNegotiation).filter(CollectiveNegotiation.id == req.negotiation_id).first()
    if not neg:
        raise HTTPException(status_code=404, detail="Negotiation not found")
    if neg.status != "deal_agreed":
        raise HTTPException(status_code=400, detail="Cannot checkout a negotiation that is not agreed upon")

    team = db.query(Team).filter(Team.id == neg.team_id).first()
    members = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
    total_kg = sum(m.contributed_kg for m in members)
    price_per_kg = neg.final_agreed_price_per_kg or neg.offered_price_per_kg
    gross_amount = round(total_kg * price_per_kg, 2)
    transport_deduction = neg.transport_cost_total or 0.0
    platform_fee = round(gross_amount * (settings.DEFAULT_PLATFORM_FEE_PERCENT / 100.0), 2)
    net_distributable = max(0.0, round(gross_amount - transport_deduction - platform_fee, 2))

    sale = SaleTransaction(
        team_id=team.id,
        buyer_id=neg.buyer_id,
        negotiation_id=neg.id,
        total_quantity_kg=total_kg,
        price_per_kg=price_per_kg,
        gross_amount=gross_amount,
        transport_deduction=transport_deduction,
        platform_fee=platform_fee,
        net_distributable_amount=net_distributable,
        payment_status="pending",
        payment_reference=f"PAY-FASAL-{uuid.uuid4().hex[:8].upper()}"
    )
    db.add(sale)
    team.status = "payment_processing"
    db.commit()
    db.refresh(sale)

    return _format_sale_response(sale, db)

@router.post("/{sale_id}/simulate-payment", response_model=SaleResponse)
def simulate_buyer_payment(
    sale_id: int,
    req: PaymentSimulateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sale = db.query(SaleTransaction).filter(SaleTransaction.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale transaction not found")
    if sale.payment_status == "completed":
        raise HTTPException(status_code=400, detail="Payment already processed and settled for this sale")

    # Update payment reference
    sale.payment_reference = req.transaction_reference or f"UPI-SETTLED-{uuid.uuid4().hex[:8].upper()}"
    sale.payment_status = "completed"

    team_members = db.query(TeamMember).filter(TeamMember.team_id == sale.team_id).all()
    
    # Trigger Contribution-Based Automatic Settlement Engine
    process_automatic_settlement(db, sale, team_members)
    
    return _format_sale_response(sale, db)

@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale_detail(
    sale_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sale = db.query(SaleTransaction).filter(SaleTransaction.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale transaction not found")
    return _format_sale_response(sale, db)

@router.get("/passport/{lot_code}", response_model=LotPassportResponse)
def get_collective_lot_passport(
    lot_code: str,
    db: Session = Depends(get_db)
):
    passport = db.query(CollectiveLotPassport).filter(CollectiveLotPassport.lot_code == lot_code).first()
    if not passport:
        raise HTTPException(status_code=404, detail="Lot Passport not found")
    
    team = db.query(Team).filter(Team.id == passport.team_id).first()

    return LotPassportResponse(
        id=passport.id,
        lot_code=passport.lot_code,
        team_id=passport.team_id,
        team_name=team.name if team else "Team",
        crop=passport.crop,
        grade=passport.grade,
        total_kg=passport.total_kg,
        farmer_count=passport.farmer_count,
        harvest_window=passport.harvest_window,
        collection_point=passport.collection_point,
        buyer_name=passport.buyer_name,
        final_price=passport.final_price,
        qr_data=passport.qr_data,
        created_at=passport.created_at
    )

@router.get("/my/all", response_model=List[SaleResponse])
def get_my_sales(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "buyer":
        sales = db.query(SaleTransaction).filter(SaleTransaction.buyer_id == current_user.id).order_by(SaleTransaction.created_at.desc()).all()
    else:
        # Farmer: find sales through team memberships
        memberships = db.query(TeamMember).filter(TeamMember.farmer_id == current_user.id).all()
        team_ids = [m.team_id for m in memberships]
        sales = db.query(SaleTransaction).filter(SaleTransaction.team_id.in_(team_ids)).order_by(SaleTransaction.created_at.desc()).all()

    return [_format_sale_response(s, db) for s in sales]
