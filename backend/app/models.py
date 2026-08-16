from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'farmer', 'buyer', 'admin'
    full_name = Column(String, nullable=False)
    
    # Farmer specific location & info
    village = Column(String, nullable=True)
    district = Column(String, nullable=True)
    state = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    preferred_language = Column(String, default="en")
    
    # Buyer specific info
    business_name = Column(String, nullable=True)
    buyer_type = Column(String, nullable=True)  # 'Wholesaler', 'Food Processor', 'Retail Chain', 'Exporter', 'Institutional'
    business_address = Column(String, nullable=True)
    gst_or_license = Column(String, nullable=True)
    
    kyc_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    produce_lots = relationship("ProduceLot", back_populates="farmer", cascade="all, delete-orphan")
    buyer_requirements = relationship("BuyerRequirement", back_populates="buyer", cascade="all, delete-orphan")
    represented_teams = relationship("Team", back_populates="representative")
    memberships = relationship("TeamMember", back_populates="farmer")
    join_requests = relationship("JoinRequest", back_populates="farmer")
    wallet = relationship("Wallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class ProduceLot(Base):
    __tablename__ = "produce_lots"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop = Column(String, nullable=False, index=True)
    variety = Column(String, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    available_quantity_kg = Column(Float, nullable=False)
    grade = Column(String, nullable=False)  # 'A', 'B', 'C'
    harvest_date = Column(Date, nullable=False)
    expected_selling_date = Column(Date, nullable=False)
    min_price_per_kg = Column(Float, nullable=False)
    photo_url = Column(String, nullable=True)
    status = Column(String, default="available")  # 'available', 'locked_in_team', 'sold'
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("User", back_populates="produce_lots")
    team_members = relationship("TeamMember", back_populates="produce_lot")
    join_requests = relationship("JoinRequest", back_populates="produce_lot")


class BuyerRequirement(Base):
    __tablename__ = "buyer_requirements"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop = Column(String, nullable=False, index=True)
    variety = Column(String, nullable=True)
    min_quantity_kg = Column(Float, nullable=False)
    max_quantity_kg = Column(Float, nullable=False)
    preferred_grade = Column(String, default="Any")  # 'A', 'B', 'C', 'Any'
    target_delivery_date = Column(Date, nullable=False)
    offered_price_per_kg = Column(Float, nullable=False)
    delivery_state = Column(String, nullable=False)
    delivery_district = Column(String, nullable=False)
    delivery_address = Column(String, nullable=False)
    delivery_lat = Column(Float, nullable=True)
    delivery_lng = Column(Float, nullable=True)
    buying_preferences = Column(String, nullable=True)  # e.g., 'Grade A preferred, moisture < 12%'
    status = Column(String, default="active")  # 'active', 'negotiating', 'fulfilled', 'cancelled'
    created_at = Column(DateTime, default=datetime.utcnow)

    buyer = relationship("User", back_populates="buyer_requirements")
    negotiations = relationship("CollectiveNegotiation", back_populates="requirement")


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    representative_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop = Column(String, nullable=False, index=True)
    variety = Column(String, nullable=False)
    grade = Column(String, nullable=False)
    target_selling_date = Column(Date, nullable=False)
    # Lifecycle: 'open', 'full', 'ready_to_sell', 'selling', 'sold', 'payment_processing', 'completed'
    status = Column(String, default="open")
    
    # Smart Collection Point
    collection_lat = Column(Float, nullable=True)
    collection_lng = Column(Float, nullable=True)
    collection_address = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    representative = relationship("User", back_populates="represented_teams")
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")
    join_requests = relationship("JoinRequest", back_populates="team", cascade="all, delete-orphan")
    negotiations = relationship("CollectiveNegotiation", back_populates="team", cascade="all, delete-orphan")
    sales = relationship("SaleTransaction", back_populates="team")
    passports = relationship("CollectiveLotPassport", back_populates="team")
    reviews = relationship("TeamReview", back_populates="team")


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    produce_lot_id = Column(Integer, ForeignKey("produce_lots.id"), nullable=False)
    contributed_kg = Column(Float, nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    vote_status = Column(String, default="pending")  # 'pending', 'approved', 'rejected' for deal voting

    team = relationship("Team", back_populates="members")
    farmer = relationship("User", back_populates="memberships")
    produce_lot = relationship("ProduceLot", back_populates="team_members")


class JoinRequest(Base):
    __tablename__ = "join_requests"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    produce_lot_id = Column(Integer, ForeignKey("produce_lots.id"), nullable=False)
    compatibility_score = Column(Float, nullable=False)
    reasons_json = Column(Text, nullable=True)
    message = Column(String, nullable=True)
    status = Column(String, default="pending")  # 'pending', 'approved', 'rejected'
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)

    team = relationship("Team", back_populates="join_requests")
    farmer = relationship("User", back_populates="join_requests")
    produce_lot = relationship("ProduceLot", back_populates="join_requests")


class CollectiveNegotiation(Base):
    __tablename__ = "collective_negotiations"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    buyer_requirement_id = Column(Integer, ForeignKey("buyer_requirements.id"), nullable=True)
    
    offered_price_per_kg = Column(Float, nullable=False)
    counter_price_per_kg = Column(Float, nullable=True)
    final_agreed_price_per_kg = Column(Float, nullable=True)
    transport_cost_total = Column(Float, default=0.0)
    platform_fee_total = Column(Float, default=0.0)
    
    # Status: 'offer_received', 'counter_sent', 'voting', 'deal_agreed', 'rejected', 'cancelled'
    status = Column(String, default="offer_received")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    team = relationship("Team", back_populates="negotiations")
    buyer = relationship("User")
    requirement = relationship("BuyerRequirement", back_populates="negotiations")
    sales = relationship("SaleTransaction", back_populates="negotiation")


class SaleTransaction(Base):
    __tablename__ = "sale_transactions"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    negotiation_id = Column(Integer, ForeignKey("collective_negotiations.id"), nullable=True)
    
    total_quantity_kg = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    gross_amount = Column(Float, nullable=False)
    transport_deduction = Column(Float, default=0.0)
    platform_fee = Column(Float, default=0.0)
    net_distributable_amount = Column(Float, nullable=False)
    
    payment_status = Column(String, default="pending")  # 'pending', 'escrow_funded', 'completed'
    payment_reference = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("Team", back_populates="sales")
    buyer = relationship("User")
    negotiation = relationship("CollectiveNegotiation", back_populates="sales")
    settlements = relationship("SettlementRecord", back_populates="sale", cascade="all, delete-orphan")
    passport = relationship("CollectiveLotPassport", back_populates="sale", uselist=False)


class SettlementRecord(Base):
    __tablename__ = "settlement_records"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sale_transactions.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    contributed_kg = Column(Float, nullable=False)
    percentage_share = Column(Float, nullable=False)
    gross_payout = Column(Float, nullable=False)
    transport_share = Column(Float, default=0.0)
    platform_fee_share = Column(Float, default=0.0)
    net_payout = Column(Float, nullable=False)
    status = Column(String, default="credited")  # 'credited', 'processed'
    created_at = Column(DateTime, default=datetime.utcnow)

    sale = relationship("SaleTransaction", back_populates="settlements")
    farmer = relationship("User")


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    available_balance = Column(Float, default=0.0)
    pending_balance = Column(Float, default=0.0)
    total_earned = Column(Float, default=0.0)
    total_withdrawn = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="wallet")
    transactions = relationship("WalletTransaction", back_populates="wallet", cascade="all, delete-orphan")


class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)  # 'credit_payout', 'debit_withdrawal'
    description = Column(String, nullable=False)
    reference_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    wallet = relationship("Wallet", back_populates="transactions")


class CollectiveLotPassport(Base):
    __tablename__ = "collective_lot_passports"

    id = Column(Integer, primary_key=True, index=True)
    lot_code = Column(String, unique=True, index=True, nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    sale_id = Column(Integer, ForeignKey("sale_transactions.id"), nullable=True)
    
    crop = Column(String, nullable=False)
    grade = Column(String, nullable=False)
    total_kg = Column(Float, nullable=False)
    farmer_count = Column(Integer, nullable=False)
    harvest_window = Column(String, nullable=False)
    collection_point = Column(String, nullable=False)
    buyer_name = Column(String, nullable=True)
    final_price = Column(Float, nullable=True)
    qr_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("Team", back_populates="passports")
    sale = relationship("SaleTransaction", back_populates="passport")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    category = Column(String, default="system")  # 'join_request', 'approval', 'team_status', 'offer', 'sale', 'payment', 'system'
    link = Column(String, nullable=True)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class TeamReview(Base):
    __tablename__ = "team_reviews"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Float, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("Team", back_populates="reviews")
    buyer = relationship("User")


class PlatformConfig(Base):
    __tablename__ = "platform_configs"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(String, nullable=False)
    description = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
