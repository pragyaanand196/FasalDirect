from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional, List, Dict, Any
from datetime import date, datetime

# User & Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str
    full_name: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

class FarmerRegister(BaseModel):
    phone: str
    password: str
    full_name: str
    email: Optional[str] = None
    village: str
    district: str
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    preferred_language: Optional[str] = "en"
    
    # Optional first crop produce submission during registration
    crop: Optional[str] = None
    variety: Optional[str] = None
    quantity_kg: Optional[float] = Field(None, gt=0)
    grade: Optional[str] = "A"
    harvest_date: Optional[date] = None
    expected_selling_date: Optional[date] = None
    min_price_per_kg: Optional[float] = Field(None, gt=0)
    photo_url: Optional[str] = None

class BuyerRegister(BaseModel):
    phone: str
    password: str
    full_name: str
    email: Optional[str] = None
    business_name: str
    buyer_type: str  # 'Wholesaler', 'Food Processor', 'Retail Chain', 'Exporter', 'Institutional'
    business_address: str
    gst_or_license: Optional[str] = None
    delivery_district: str
    delivery_state: str
    delivery_lat: Optional[float] = None
    delivery_lng: Optional[float] = None
    
    # Initial crop requirement during registration
    crop: Optional[str] = None
    variety: Optional[str] = None
    min_quantity_kg: Optional[float] = Field(None, gt=0)
    max_quantity_kg: Optional[float] = Field(None, gt=0)
    preferred_grade: Optional[str] = "Any"
    target_delivery_date: Optional[date] = None
    offered_price_per_kg: Optional[float] = Field(None, gt=0)
    buying_preferences: Optional[str] = None

    @model_validator(mode="after")
    def validate_quantities(self):
        if self.min_quantity_kg is not None and self.max_quantity_kg is not None:
            if self.max_quantity_kg < self.min_quantity_kg:
                raise ValueError("max_quantity_kg must be greater than or equal to min_quantity_kg")
        return self

class AdminRegister(BaseModel):
    phone: str
    password: str
    full_name: str
    email: Optional[str] = None
    admin_secret_key: Optional[str] = None

class LoginRequest(BaseModel):
    phone: str
    password: str

class UserResponse(BaseModel):
    id: int
    phone: str
    email: Optional[str] = None
    role: str
    full_name: str
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    preferred_language: Optional[str] = "en"
    business_name: Optional[str] = None
    buyer_type: Optional[str] = None
    business_address: Optional[str] = None
    gst_or_license: Optional[str] = None
    kyc_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Produce Schemas
class ProduceCreate(BaseModel):
    crop: str
    variety: str
    quantity_kg: float = Field(..., gt=0)
    grade: str
    harvest_date: date
    expected_selling_date: date
    min_price_per_kg: float = Field(..., gt=0)
    photo_url: Optional[str] = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.harvest_date and self.expected_selling_date:
            if self.expected_selling_date < self.harvest_date:
                raise ValueError("expected_selling_date must be on or after harvest_date")
        return self

class ProduceResponse(BaseModel):
    id: int
    farmer_id: int
    crop: str
    variety: str
    quantity_kg: float
    available_quantity_kg: float
    grade: str
    harvest_date: date
    expected_selling_date: date
    min_price_per_kg: float
    photo_url: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Buyer Requirement Schemas
class BuyerRequirementCreate(BaseModel):
    crop: str
    variety: Optional[str] = None
    min_quantity_kg: float = Field(..., gt=0)
    max_quantity_kg: float = Field(..., gt=0)
    preferred_grade: Optional[str] = "Any"
    target_delivery_date: date
    offered_price_per_kg: float = Field(..., gt=0)
    delivery_state: str
    delivery_district: str
    delivery_address: str
    delivery_lat: Optional[float] = None
    delivery_lng: Optional[float] = None
    buying_preferences: Optional[str] = None

    @model_validator(mode="after")
    def validate_quantities(self):
        if self.max_quantity_kg < self.min_quantity_kg:
            raise ValueError("max_quantity_kg must be greater than or equal to min_quantity_kg")
        return self

class BuyerRequirementResponse(BaseModel):
    id: int
    buyer_id: int
    buyer_name: Optional[str] = None
    business_name: Optional[str] = None
    crop: str
    variety: Optional[str] = None
    min_quantity_kg: float
    max_quantity_kg: float
    preferred_grade: str
    target_delivery_date: date
    offered_price_per_kg: float
    delivery_state: str
    delivery_district: str
    delivery_address: str
    delivery_lat: Optional[float] = None
    delivery_lng: Optional[float] = None
    buying_preferences: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Team Schemas
class TeamCreate(BaseModel):
    name: str
    produce_lot_id: int
    target_selling_date: Optional[date] = None

class TeamMemberInfo(BaseModel):
    id: int
    farmer_id: int
    farmer_name: str
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    crop: str
    variety: str
    grade: str
    contributed_kg: float
    percentage: float
    joined_at: datetime
    vote_status: str
    is_representative: bool

class TeamOpportunityResponse(BaseModel):
    team_id: int
    name: str
    crop: str
    variety: str
    grade: str
    target_selling_date: date
    status: str
    current_members_count: int
    available_slots: int
    combined_quantity_kg: float
    compatibility_percentage: float
    distance_km: Optional[float] = None
    selling_window_diff_days: int
    explanation: str
    score_breakdown: Dict[str, float]
    representative_name: str
    representative_location: str
    created_at: datetime

class TeamDetailResponse(BaseModel):
    id: int
    name: str
    crop: str
    variety: str
    grade: str
    target_selling_date: date
    status: str
    representative_id: int
    representative_name: str
    representative_phone: Optional[str] = None
    current_members_count: int
    available_slots: int
    combined_quantity_kg: float
    members: List[TeamMemberInfo]
    collection_lat: Optional[float] = None
    collection_lng: Optional[float] = None
    collection_address: Optional[str] = None
    created_at: datetime
    is_current_user_member: bool = False
    is_current_user_representative: bool = False
    active_negotiation_id: Optional[int] = None
    completed_sales_count: int = 0
    buyer_unlocks: List[Dict[str, Any]] = []

# Join Request Schemas
class JoinRequestCreate(BaseModel):
    team_id: int
    produce_lot_id: int
    message: Optional[str] = None

class JoinRequestResponse(BaseModel):
    id: int
    team_id: int
    team_name: str
    farmer_id: int
    farmer_name: str
    farmer_village: Optional[str] = None
    farmer_district: Optional[str] = None
    crop: str
    variety: str
    grade: str
    contributed_kg: float
    harvest_date: date
    expected_selling_date: date
    min_price_per_kg: float
    compatibility_score: float
    match_reasons: List[str]
    message: Optional[str] = None
    status: str
    created_at: datetime

class JoinRequestReview(BaseModel):
    action: str  # 'approve' or 'reject'

# Simulation Schemas
class WhatIfSimulationRequest(BaseModel):
    produce_lot_id: int
    team_id: Optional[int] = None
    solo_price_per_kg: Optional[float] = None
    team_price_per_kg: Optional[float] = None
    distance_km: Optional[float] = None

class WhatIfSimulationResponse(BaseModel):
    quantity_kg: float
    solo_price_per_kg: float
    solo_gross_revenue: float
    solo_transport_cost: float
    solo_net_realization: float
    solo_realization_per_kg: float
    
    team_expected_price_per_kg: float
    team_gross_revenue: float
    team_shared_transport_cost: float
    team_platform_fee: float
    team_net_realization: float
    team_realization_per_kg: float
    
    net_improvement_amount: float
    net_improvement_percentage: float
    summary: str

class TeamGrowthSimulationResponse(BaseModel):
    current_members_count: int
    current_quantity_kg: float
    slots_left: int
    projected_final_quantity_kg: float
    unlocked_buyers_count: int
    highest_potential_price_per_kg: float
    current_est_value: float
    projected_est_value: float
    potential_value_gain: float
    explanation: str

# Negotiation Schemas
class OfferCreate(BaseModel):
    team_id: int
    offered_price_per_kg: float = Field(..., gt=0)
    buyer_requirement_id: Optional[int] = None
    notes: Optional[str] = None

class CounterOfferCreate(BaseModel):
    counter_price_per_kg: float = Field(..., gt=0)
    notes: Optional[str] = None

class VoteRequest(BaseModel):
    vote: str  # 'approved' or 'rejected'

class NegotiationResponse(BaseModel):
    id: int
    team_id: int
    team_name: str
    buyer_id: int
    buyer_name: str
    buyer_business: Optional[str] = None
    offered_price_per_kg: float
    counter_price_per_kg: Optional[float] = None
    final_agreed_price_per_kg: Optional[float] = None
    transport_cost_total: float
    platform_fee_total: float
    status: str
    notes: Optional[str] = None
    total_quantity_kg: float
    gross_total_amount: float
    net_distributable_amount: float
    approval_votes_count: int
    total_members_count: int
    current_user_voted: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# Sale & Settlement Schemas
class SaleCreate(BaseModel):
    negotiation_id: int

class PaymentSimulateRequest(BaseModel):
    payment_method: Optional[str] = "UPI_Simulated_Escrow"
    transaction_reference: Optional[str] = None

class SettlementRecordResponse(BaseModel):
    id: int
    farmer_id: int
    farmer_name: str
    contributed_kg: float
    percentage_share: float
    gross_payout: float
    transport_share: float
    platform_fee_share: float
    net_payout: float
    status: str
    created_at: datetime

class SaleResponse(BaseModel):
    id: int
    team_id: int
    team_name: str
    buyer_id: int
    buyer_name: str
    buyer_business: Optional[str] = None
    total_quantity_kg: float
    price_per_kg: float
    gross_amount: float
    transport_deduction: float
    platform_fee: float
    net_distributable_amount: float
    payment_status: str
    payment_reference: Optional[str] = None
    settlements: List[SettlementRecordResponse] = []
    lot_code: Optional[str] = None
    created_at: datetime

# Wallet Schemas
class WalletTransactionResponse(BaseModel):
    id: int
    amount: float
    type: str
    description: str
    reference_id: Optional[str] = None
    created_at: datetime

class WalletResponse(BaseModel):
    id: int
    user_id: int
    available_balance: float
    pending_balance: float
    total_earned: float
    total_withdrawn: float
    transactions: List[WalletTransactionResponse] = []

class WithdrawRequest(BaseModel):
    amount: float = Field(..., gt=0)
    bank_account_or_upi: str

# Digital Passport Schema
class LotPassportResponse(BaseModel):
    id: int
    lot_code: str
    team_id: int
    team_name: str
    crop: str
    grade: str
    total_kg: float
    farmer_count: int
    harvest_window: str
    collection_point: str
    buyer_name: Optional[str] = None
    final_price: Optional[float] = None
    qr_data: Optional[str] = None
    created_at: datetime

# Notification Schema
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    category: str
    link: Optional[str] = None
    read: bool
    created_at: datetime

# Admin Schemas
class AdminStatsResponse(BaseModel):
    total_farmers: int
    total_buyers: int
    total_teams: int
    active_teams: int
    completed_sales: int
    total_aggregated_volume_kg: float
    total_gross_turnover_rs: float
    total_platform_commission_rs: float
    volume_by_crop: List[Dict[str, Any]]
    monthly_sales_trend: List[Dict[str, Any]]
    top_districts: List[Dict[str, Any]]

class UserVerificationUpdate(BaseModel):
    kyc_verified: bool

class PlatformConfigUpdate(BaseModel):
    key: str
    value: str

# AI Explanation Schemas
class AIExplainRequest(BaseModel):
    query_type: str  # 'team_recommendation', 'join_eligibility', 'buyer_net_realization', 'transport_savings'
    target_id: int  # team_id, buyer_requirement_id, etc.
    farmer_produce_id: Optional[int] = None
    custom_question: Optional[str] = None

class AIExplainResponse(BaseModel):
    title: str
    explanation: str
    key_factors: List[Dict[str, Any]]
    recommendation_verdict: str
