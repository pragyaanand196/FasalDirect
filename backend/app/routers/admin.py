from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

from app.database import get_db
from app.models import (
    User, ProduceLot, Team, TeamMember, BuyerRequirement, SaleTransaction,
    SettlementRecord, PlatformConfig
)
from app.schemas import (
    AdminStatsResponse, UserResponse, UserVerificationUpdate, PlatformConfigUpdate
)
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/admin", tags=["Administrative Portal"])

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_farmers = db.query(User).filter(User.role == "farmer").count()
    total_buyers = db.query(User).filter(User.role == "buyer").count()
    total_teams = db.query(Team).count()
    active_teams = db.query(Team).filter(Team.status.in_(["open", "full", "ready_to_sell", "selling"])).count()
    
    completed_sales = db.query(SaleTransaction).filter(SaleTransaction.payment_status == "completed").all()
    completed_sales_count = len(completed_sales)
    total_vol_kg = sum(s.total_quantity_kg for s in completed_sales)
    total_turnover = sum(s.gross_amount for s in completed_sales)
    total_comm = sum(s.platform_fee for s in completed_sales)

    # Volume by crop (from completed sales or active teams)
    crop_stats = db.query(Team.crop, func.count(Team.id)).group_by(Team.crop).all()
    volume_by_crop = [{"crop": c[0], "count": c[1]} for c in crop_stats]

    # Top districts from registered farmers
    district_stats = db.query(User.district, func.count(User.id)).filter(
        User.district != None, User.role == "farmer"
    ).group_by(User.district).limit(5).all()
    top_districts = [{"district": d[0], "farmers_count": d[1]} for d in district_stats]

    # Monthly sales trend
    sales_trend = []
    for s in completed_sales:
        month_key = s.created_at.strftime("%b %Y")
        existing = next((item for item in sales_trend if item["month"] == month_key), None)
        if existing:
            existing["turnover"] += s.gross_amount
            existing["volume_kg"] += s.total_quantity_kg
        else:
            sales_trend.append({
                "month": month_key,
                "turnover": s.gross_amount,
                "volume_kg": s.total_quantity_kg
            })

    return AdminStatsResponse(
        total_farmers=total_farmers,
        total_buyers=total_buyers,
        total_teams=total_teams,
        active_teams=active_teams,
        completed_sales=completed_sales_count,
        total_aggregated_volume_kg=total_vol_kg,
        total_gross_turnover_rs=total_turnover,
        total_platform_commission_rs=total_comm,
        volume_by_crop=volume_by_crop,
        monthly_sales_trend=sales_trend,
        top_districts=top_districts
    )

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    role: str = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.order_by(User.created_at.desc()).all()

@router.post("/users/{user_id}/verify")
def toggle_user_verification(
    user_id: int,
    req: UserVerificationUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.kyc_verified = req.kyc_verified
    db.commit()
    return {"message": f"User KYC verification updated to {req.kyc_verified}"}

@router.get("/teams")
def get_all_teams_audit(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    teams = db.query(Team).order_by(Team.created_at.desc()).all()
    results = []
    for t in teams:
        members = db.query(TeamMember).filter(TeamMember.team_id == t.id).all()
        rep = db.query(User).filter(User.id == t.representative_id).first()
        total_kg = sum(m.contributed_kg for m in members)
        results.append({
            "id": t.id,
            "name": t.name,
            "crop": t.crop,
            "grade": t.grade,
            "status": t.status,
            "representative": rep.full_name if rep else "Unknown",
            "members_count": len(members),
            "total_quantity_kg": total_kg,
            "created_at": t.created_at
        })
    return results

@router.get("/config")
def get_platform_config(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    configs = db.query(PlatformConfig).all()
    if not configs:
        # Return defaults
        return {
            "default_compatibility_threshold": "75.0",
            "default_platform_fee_percent": "2.0",
            "max_team_members": "4",
            "base_transport_rate_per_km_per_kg": "0.008"
        }
    return {c.key: c.value for c in configs}

@router.post("/config")
def update_platform_config(
    req: PlatformConfigUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    conf = db.query(PlatformConfig).filter(PlatformConfig.key == req.key).first()
    if not conf:
        conf = PlatformConfig(key=req.key, value=req.value)
        db.add(conf)
    else:
        conf.value = req.value
    db.commit()
    return {"message": f"Configuration '{req.key}' updated successfully"}
