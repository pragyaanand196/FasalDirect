from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models import (
    SaleTransaction, SettlementRecord, TeamMember, Wallet, WalletTransaction,
    User, Notification, CollectiveLotPassport, Team, ProduceLot
)
import uuid

def process_automatic_settlement(
    db: Session,
    sale: SaleTransaction,
    team_members: List[TeamMember]
) -> List[SettlementRecord]:
    """
    Contribution-Based Automatic Settlement Engine:
    Calculates every farmer's exact proportional payout based on their verified contributed quantity kg,
    deducts shared transport and platform commission transparently, and automatically credits each farmer's wallet.
    Performs exact penny/paisa reconciliation to eliminate any rounding discrepancy.
    """
    total_quantity_kg = sale.total_quantity_kg
    if total_quantity_kg <= 0:
        raise ValueError("Total sale quantity must be greater than zero")

    # Check if settlement already exists for this sale to ensure idempotency
    existing_settlements = db.query(SettlementRecord).filter(SettlementRecord.sale_id == sale.id).all()
    if existing_settlements:
        return existing_settlements

    created_settlements = []
    num_members = len(team_members)

    sum_gross = 0.0
    sum_transport = 0.0
    sum_platform = 0.0
    sum_net = 0.0

    for idx, member in enumerate(team_members):
        farmer_id = member.farmer_id
        contributed_kg = member.contributed_kg
        percentage_share = round((contributed_kg / total_quantity_kg) * 100, 2)
        fraction = contributed_kg / total_quantity_kg
        is_last = (idx == num_members - 1)

        if is_last:
            gross_payout = round(sale.gross_amount - sum_gross, 2)
            transport_share = round(sale.transport_deduction - sum_transport, 2)
            platform_fee_share = round(sale.platform_fee - sum_platform, 2)
            net_payout = round(sale.net_distributable_amount - sum_net, 2)
        else:
            gross_payout = round(sale.gross_amount * fraction, 2)
            transport_share = round(sale.transport_deduction * fraction, 2)
            platform_fee_share = round(sale.platform_fee * fraction, 2)
            net_payout = round(gross_payout - (transport_share + platform_fee_share), 2)
            
            sum_gross += gross_payout
            sum_transport += transport_share
            sum_platform += platform_fee_share
            sum_net += net_payout

        # Create immutable settlement record
        settlement = SettlementRecord(
            sale_id=sale.id,
            farmer_id=farmer_id,
            contributed_kg=contributed_kg,
            percentage_share=percentage_share,
            gross_payout=gross_payout,
            transport_share=transport_share,
            platform_fee_share=platform_fee_share,
            net_payout=net_payout,
            status="credited"
        )
        db.add(settlement)
        created_settlements.append(settlement)

        # Automatically credit Farmer's Wallet
        wallet = db.query(Wallet).filter(Wallet.user_id == farmer_id).first()
        if not wallet:
            wallet = Wallet(user_id=farmer_id, available_balance=0.0, pending_balance=0.0, total_earned=0.0, total_withdrawn=0.0)
            db.add(wallet)
            db.flush()

        wallet.available_balance = round(wallet.available_balance + net_payout, 2)
        wallet.total_earned = round(wallet.total_earned + net_payout, 2)

        # Add wallet audit log
        tx = WalletTransaction(
            wallet_id=wallet.id,
            amount=net_payout,
            type="credit_payout",
            description=f"Collective Sale Payout: {contributed_kg:g} kg of {sale.team.crop} (Team #{sale.team_id})",
            reference_id=f"SALE-{sale.id}-FARMER-{farmer_id}"
        )
        db.add(tx)

        # Mark produce lot as sold
        if member.produce_lot:
            member.produce_lot.status = "sold"
            member.produce_lot.available_quantity_kg = 0.0

        # Send in-app notification to the farmer
        notif = Notification(
            user_id=farmer_id,
            title="Payment Credited to Wallet!",
            message=f"₹{net_payout:,.2f} has been credited to your FasalDirect Wallet for {contributed_kg:g} kg {sale.team.crop} sold through Team '{sale.team.name}'.",
            category="payment",
            link="/dashboard/wallet"
        )
        db.add(notif)

    # Update team status to completed
    sale.team.status = "completed"
    sale.payment_status = "completed"

    # Create Digital Collective Lot Passport if not already existing
    existing_passport = db.query(CollectiveLotPassport).filter(CollectiveLotPassport.sale_id == sale.id).first()
    if not existing_passport:
        lot_code = f"LOT-{sale.team.crop.upper()[:3]}-{uuid.uuid4().hex[:6].upper()}"
        passport = CollectiveLotPassport(
            lot_code=lot_code,
            team_id=sale.team_id,
            sale_id=sale.id,
            crop=sale.team.crop,
            grade=sale.team.grade,
            total_kg=total_quantity_kg,
            farmer_count=len(team_members),
            harvest_window=f"{sale.team.target_selling_date}",
            collection_point=sale.team.collection_address or f"Central Depot ({sale.team.collection_lat or 19.99}, {sale.team.collection_lng or 73.78})",
            buyer_name=sale.buyer.business_name or sale.buyer.full_name,
            final_price=sale.price_per_kg,
            qr_data=f"FasalDirect-Lot:{lot_code}|Crop:{sale.team.crop}|Total:{total_quantity_kg}kg|Price:Rs.{sale.price_per_kg}/kg"
        )
        db.add(passport)

    db.commit()
    return created_settlements
