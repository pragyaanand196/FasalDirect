from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Wallet, WalletTransaction, Notification
from app.schemas import WalletResponse, WalletTransactionResponse, WithdrawRequest
from app.auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/wallet", tags=["Wallet & Payouts"])

@router.get("/my", response_model=WalletResponse)
def get_my_wallet(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        wallet = Wallet(user_id=current_user.id, available_balance=0.0, pending_balance=0.0, total_earned=0.0, total_withdrawn=0.0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)

    txs = db.query(WalletTransaction).filter(
        WalletTransaction.wallet_id == wallet.id
    ).order_by(WalletTransaction.created_at.desc()).all()

    tx_responses = [
        WalletTransactionResponse(
            id=t.id,
            amount=t.amount,
            type=t.type,
            description=t.description,
            reference_id=t.reference_id,
            created_at=t.created_at
        )
        for t in txs
    ]

    return WalletResponse(
        id=wallet.id,
        user_id=wallet.user_id,
        available_balance=wallet.available_balance,
        pending_balance=wallet.pending_balance,
        total_earned=wallet.total_earned,
        total_withdrawn=wallet.total_withdrawn,
        transactions=tx_responses
    )

@router.post("/withdraw")
def withdraw_funds(
    req: WithdrawRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Withdrawal amount must be greater than zero")

    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet or wallet.available_balance < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient available balance in wallet")

    wallet.available_balance = round(wallet.available_balance - req.amount, 2)
    wallet.total_withdrawn = round(wallet.total_withdrawn + req.amount, 2)

    tx = WalletTransaction(
        wallet_id=wallet.id,
        amount=req.amount,
        type="debit_withdrawal",
        description=f"Bank Transfer / UPI payout to {req.bank_account_or_upi}",
        reference_id=f"WTH-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    )
    db.add(tx)

    notif = Notification(
        user_id=current_user.id,
        title="Payout Withdrawal Initiated",
        message=f"₹{req.amount:,.2f} transfer to {req.bank_account_or_upi} has been processed successfully.",
        category="payment",
        link="/dashboard/wallet"
    )
    db.add(notif)

    db.commit()
    return {
        "message": f"Successfully withdrew ₹{req.amount:,.2f} to {req.bank_account_or_upi}",
        "new_balance": wallet.available_balance
    }
