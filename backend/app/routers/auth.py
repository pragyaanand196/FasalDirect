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
    if db.query(User).filter(User.phone == req.phone).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this mobile number is already registered"
        )
    if req.email and db.query(User).filter(User.email == req.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address is already registered"
        )

    user = User(
        phone=req.phone,
        email=req.email,
        password_hash=hash_password(req.password),
        role="farmer",
        full_name=req.full_name,
        village=req.village,
        district=req.district,
        state=req.state,
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
        produce = ProduceLot(
            farmer_id=user.id,
            crop=req.crop,
            variety=req.variety or "Standard",
            quantity_kg=req.quantity_kg,
            available_quantity_kg=req.quantity_kg,
            grade=req.grade or "A",
            harvest_date=harvest_dt,
            expected_selling_date=sell_dt,
            min_price_per_kg=req.min_price_per_kg or 25.0,
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
    if db.query(User).filter(User.phone == req.phone).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A buyer with this mobile number is already registered"
        )

    user = User(
        phone=req.phone,
        email=req.email,
        password_hash=hash_password(req.password),
        role="buyer",
        full_name=req.full_name,
        business_name=req.business_name,
        buyer_type=req.buyer_type,
        business_address=req.business_address,
        gst_or_license=req.gst_or_license,
        district=req.delivery_district,
        state=req.delivery_state,
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
    if req.crop and req.min_quantity_kg and req.offered_price_per_kg:
        target_date = req.target_delivery_date or date.today()
        requirement = BuyerRequirement(
            buyer_id=user.id,
            crop=req.crop,
            variety=req.variety,
            min_quantity_kg=req.min_quantity_kg,
            max_quantity_kg=req.max_quantity_kg or req.min_quantity_kg * 2,
            preferred_grade=req.preferred_grade or "Any",
            target_delivery_date=target_date,
            offered_price_per_kg=req.offered_price_per_kg,
            delivery_state=req.delivery_state,
            delivery_district=req.delivery_district,
            delivery_address=req.business_address,
            delivery_lat=req.delivery_lat,
            delivery_lng=req.delivery_lng,
            buying_preferences=req.buying_preferences,
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
    if db.query(User).filter(User.phone == req.phone).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this mobile number already exists"
        )

    user = User(
        phone=req.phone,
        email=req.email,
        password_hash=hash_password(req.password),
        role="admin",
        full_name=req.full_name,
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
    user = db.query(User).filter(User.phone == req.phone).first()
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
