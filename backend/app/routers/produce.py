from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, ProduceLot
from app.schemas import ProduceCreate, ProduceResponse
from app.auth import get_current_user, require_farmer

router = APIRouter(prefix="/produce", tags=["Farmer Produce"])

@router.post("", response_model=ProduceResponse)
def create_produce_lot(
    req: ProduceCreate,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    lot = ProduceLot(
        farmer_id=current_user.id,
        crop=req.crop.strip().title(),
        variety=req.variety.strip().title(),
        quantity_kg=req.quantity_kg,
        available_quantity_kg=req.quantity_kg,
        grade=req.grade.strip().upper(),
        harvest_date=req.harvest_date,
        expected_selling_date=req.expected_selling_date,
        min_price_per_kg=req.min_price_per_kg,
        photo_url=req.photo_url,
        status="available"
    )
    db.add(lot)
    db.commit()
    db.refresh(lot)
    return lot

@router.get("/my", response_model=List[ProduceResponse])
def get_my_produce(
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    return db.query(ProduceLot).filter(ProduceLot.farmer_id == current_user.id).order_by(ProduceLot.created_at.desc()).all()

@router.get("/{produce_id}", response_model=ProduceResponse)
def get_produce_by_id(
    produce_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lot = db.query(ProduceLot).filter(ProduceLot.id == produce_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Produce lot not found")
    return lot

@router.delete("/{produce_id}")
def delete_produce(
    produce_id: int,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db)
):
    lot = db.query(ProduceLot).filter(ProduceLot.id == produce_id, ProduceLot.farmer_id == current_user.id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Produce lot not found")
    if lot.status != "available":
        raise HTTPException(status_code=400, detail="Cannot delete produce that is currently committed to a team or already sold")
    db.delete(lot)
    db.commit()
    return {"message": "Produce lot deleted successfully"}
