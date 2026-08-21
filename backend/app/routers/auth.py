from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, ProduceLot, BuyerRequirement, Wallet, Notification
from app.schemas import (
    FarmerRegister, BuyerRegister, AdminRegister, LoginRequest,
    Token, UserResponse
)
from app.auth import hash_password, verify_password, create_access_token, get_current_user
from datetime import date, datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register/farmer", response_model=Token)
def register_farmer(req: FarmerRegister, db: Session = Depends(get_db)):
    # Check existing phone or email
    if db.query(User).filter(User.phone == req.phone.strip()).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this mobile number is already registered"
        )
    if req.email and db.query(User).filter(User.email == req.email.strip().lower()).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address is already registered"
        )

    user = User(
        phone=req.phone.strip(),
        email=req.email.strip().lower() if req.email else None,
        password_hash=hash_password(req.password),
        role="farmer",
        full_name=req.full_name.strip(),
        village=req.village.strip() if req.village else None,
        district=req.district.strip() if req.district else None,
        state=req.state.strip() if req.state else None,
        latitude=req.latitude,
        longitude=req.longitude,
        preferred_language=req.preferred_language or "en",
        kyc_verified=True
    )
    db.add(user)
    db.flush()

    # Create empty wallet
    wallet = Wallet(user_id=user.id, available_balance=0.0, pending_balance=0.0, total_earned=0.0, total_withdrawn=0.0)
    db.add(wallet)

    # If farmer provided initial produce details during registration
    if req.crop and req.quantity_kg and req.quantity_kg > 0:
        harvest_dt = req.harvest_date or date.today()
        sell_dt = req.expected_selling_date or date.today()
        if sell_dt < harvest_dt:
            sell_dt = harvest_dt

        produce = ProduceLot(
            farmer_id=user.id,
            crop=req.crop.strip().title(),
            variety=req.variety.strip().title() if req.variety else "Standard",
            quantity_kg=float(req.quantity_kg),
            available_quantity_kg=float(req.quantity_kg),
            grade=(req.grade or "A").strip().upper(),
            harvest_date=harvest_dt,
            expected_selling_date=sell_dt,
            min_price_per_kg=float(req.min_price_per_kg) if req.min_price_per_kg and req.min_price_per_kg > 0 else 25.0,
            photo_url=req.photo_url,
            status="available"
        )
        db.add(produce)

    # Welcome notification
    notif = Notification(
        user_id=user.id,
        title="Welcome to FasalDirect!",
        message="Your farmer profile is active. You can now discover 4-farmer compatible teams or create your own team to unlock bulk pricing.",
        category="system",
        link="/dashboard/produce"
    )
    db.add(notif)

    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id), "role": user.role, "name": user.full_name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "full_name": user.full_name
    }

@router.post("/register/buyer", response_model=Token)
def register_buyer(req: BuyerRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.phone == req.phone.strip()).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A buyer with this mobile number is already registered"
        )
    if req.email and db.query(User).filter(User.email == req.email.strip().lower()).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A buyer with this email address is already registered"
        )

    user = User(
        phone=req.phone.strip(),
        email=req.email.strip().lower() if req.email else None,
        password_hash=hash_password(req.password),
        role="buyer",
        full_name=req.full_name.strip(),
        business_name=req.business_name.strip(),
        buyer_type=req.buyer_type.strip(),
        business_address=req.business_address.strip(),
        gst_or_license=req.gst_or_license.strip() if req.gst_or_license else None,
        district=req.delivery_district.strip(),
        state=req.delivery_state.strip(),
        latitude=req.delivery_lat,
        longitude=req.delivery_lng,
        kyc_verified=True
    )
    db.add(user)
    db.flush()

    # Create empty wallet for buyers
    wallet = Wallet(user_id=user.id, available_balance=0.0, pending_balance=0.0, total_earned=0.0, total_withdrawn=0.0)
    db.add(wallet)

    # If buyer provided initial crop demand during registration
    if req.crop and req.min_quantity_kg and req.min_quantity_kg > 0 and req.offered_price_per_kg and req.offered_price_per_kg > 0:
        target_date = req.target_delivery_date or date.today()
        max_qty = float(req.max_quantity_kg) if req.max_quantity_kg and req.max_quantity_kg >= req.min_quantity_kg else float(req.min_quantity_kg) * 2
        requirement = BuyerRequirement(
            buyer_id=user.id,
            crop=req.crop.strip().title(),
            variety=req.variety.strip().title() if req.variety else None,
            min_quantity_kg=float(req.min_quantity_kg),
            max_quantity_kg=max_qty,
            preferred_grade=(req.preferred_grade or "Any").strip(),
            target_delivery_date=target_date,
            offered_price_per_kg=float(req.offered_price_per_kg),
            delivery_state=req.delivery_state.strip(),
            delivery_district=req.delivery_district.strip(),
            delivery_address=req.business_address.strip(),
            delivery_lat=req.delivery_lat,
            delivery_lng=req.delivery_lng,
            buying_preferences=req.buying_preferences.strip() if req.buying_preferences else None,
            status="active"
        )
        db.add(requirement)

    # Welcome notification
    notif = Notification(
        user_id=user.id,
        title="Buyer Account Created",
        message="Welcome to FasalDirect. You can now browse verified 4-farmer collective lots and post direct procurement requirements.",
        category="system",
        link="/buyer/requirements"
    )
    db.add(notif)

    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id), "role": user.role, "name": user.full_name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "full_name": user.full_name
    }

@router.post("/register/admin", response_model=Token)
def register_admin(req: AdminRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.phone == req.phone.strip()).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this mobile number already exists"
        )

    user = User(
        phone=req.phone.strip(),
        email=req.email.strip().lower() if req.email else None,
        password_hash=hash_password(req.password),
        role="admin",
        full_name=req.full_name.strip(),
        kyc_verified=True
    )
    db.add(user)
    db.flush()

    wallet = Wallet(user_id=user.id, available_balance=0.0, pending_balance=0.0, total_earned=0.0, total_withdrawn=0.0)
    db.add(wallet)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id), "role": user.role, "name": user.full_name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "full_name": user.full_name
    }

@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == req.phone.strip()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid mobile number or password"
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role, "name": user.full_name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "full_name": user.full_name
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
