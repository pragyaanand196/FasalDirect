import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

# Use in-memory SQLite with StaticPool so all connections share the same in-memory DB
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

def test_health_and_root():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["service"] == "FasalDirect API"

    h = client.get("/health")
    assert h.status_code == 200
    assert h.json()["status"] == "healthy"

def test_complete_4_farmer_collective_workflow_and_settlement():
    """
    Comprehensive E2E test verifying:
    1. Registration of 4 compatible farmers with produce lots
    2. Team creation by Farmer 1 (becomes Representative, Member #1)
    3. Joining of Farmers 2, 3, 4 (strictly reaching max 4 members)
    4. Rejection of 5th farmer (4-member capacity limit)
    5. Buyer registration with crop procurement demand
    6. Buyer discovery of compatible 4-farmer team
    7. Buyer offer submission
    8. Representative counter-offer
    9. Member voting
    10. Deal agreement & competing offer rejection
    11. Checkout sale creation & idempotency
    12. Payment simulation & automatic contribution-based settlement
    13. Exact penny reconciliation & wallet verification for all 4 farmers
    14. Digital Lot Passport generation and verification
    """
    # -------------------------------------------------------------
    # 1. Register 4 Farmers
    # -------------------------------------------------------------
    farmer_data = [
        {"phone": "9876543210", "name": "Ramesh Patil", "village": "Pimpalgaon", "qty": 500.0, "price": 25.0},
        {"phone": "9876543211", "name": "Suresh Jadhav", "village": "Ozar", "qty": 400.0, "price": 25.0},
        {"phone": "9876543212", "name": "Ganesh Shinde", "village": "Dindori", "qty": 350.0, "price": 26.0},
        {"phone": "9876543213", "name": "Anil Deshmukh", "village": "Sinnar", "qty": 250.0, "price": 25.5},
    ]

    tokens = []
    headers = []
    produce_ids = []

    for idx, f in enumerate(farmer_data):
        res = client.post("/api/v1/auth/register/farmer", json={
            "phone": f["phone"],
            "password": "FarmerPassword123",
            "full_name": f["name"],
            "village": f["village"],
            "district": "Nashik",
            "state": "Maharashtra",
            "latitude": 20.0 + idx * 0.05,
            "longitude": 73.8 + idx * 0.05,
            "preferred_language": "mr",
            "crop": "Onion",
            "variety": "Nasik Red",
            "quantity_kg": f["qty"],
            "grade": "A",
            "harvest_date": "2026-08-20",
            "expected_selling_date": "2026-08-25",
            "min_price_per_kg": f["price"]
        })
        assert res.status_code == 200, res.text
        t = res.json()["access_token"]
        tokens.append(t)
        h = {"Authorization": f"Bearer {t}"}
        headers.append(h)

        p_list = client.get("/api/v1/produce/my", headers=h).json()
        assert len(p_list) == 1
        assert p_list[0]["status"] == "available"
        produce_ids.append(p_list[0]["id"])

    # -------------------------------------------------------------
    # 2. Farmer 1 creates Team (Representative)
    # -------------------------------------------------------------
    res_team = client.post("/api/v1/teams", json={
        "name": "Nashik Premium Onion Alliance",
        "produce_lot_id": produce_ids[0]
    }, headers=headers[0])
    assert res_team.status_code == 200
    team = res_team.json()
    team_id = team["id"]
    assert team["current_members_count"] == 1
    assert team["available_slots"] == 3
    assert team["combined_quantity_kg"] == 500.0
    assert team["representative_id"] == team["members"][0]["farmer_id"]

    # Verify Farmer 1 produce is locked
    p1 = client.get(f"/api/v1/produce/{produce_ids[0]}", headers=headers[0]).json()
    assert p1["status"] == "locked_in_team"

    # Cannot delete locked produce
    del_res = client.delete(f"/api/v1/produce/{produce_ids[0]}", headers=headers[0])
    assert del_res.status_code == 400

    # -------------------------------------------------------------
    # 3. Farmers 2, 3, 4 join the team
    # -------------------------------------------------------------
    for i in range(1, 4):
        # Discover compatible teams
        opps = client.get(f"/api/v1/teams/compatible?produce_lot_id={produce_ids[i]}", headers=headers[i]).json()
        assert len(opps) >= 1
        assert opps[0]["team_id"] == team_id
        assert opps[0]["compatibility_percentage"] >= 75.0

        # Send join request
        req_res = client.post(f"/api/v1/teams/{team_id}/join-request", json={
            "team_id": team_id,
            "produce_lot_id": produce_ids[i],
            "message": f"Farmer {i+1} ready to join collective"
        }, headers=headers[i])
        assert req_res.status_code == 200
        req_id = req_res.json()["id"]

        # Farmer 1 (Representative) approves request
        app_res = client.post(f"/api/v1/teams/{team_id}/join-requests/{req_id}/review", json={
            "action": "approve"
        }, headers=headers[0])
        assert app_res.status_code == 200

    # Verify team is now full (4 members, 1500 kg total)
    team_full = client.get(f"/api/v1/teams/{team_id}", headers=headers[0]).json()
    assert team_full["current_members_count"] == 4
    assert team_full["available_slots"] == 0
    assert team_full["combined_quantity_kg"] == 500.0 + 400.0 + 350.0 + 250.0  # 1500 kg
    assert team_full["status"] == "full"

    # -------------------------------------------------------------
    # 4. Strict 4-Member Limit: Farmer 5 cannot join
    # -------------------------------------------------------------
    client.post("/api/v1/auth/register/farmer", json={
        "phone": "9876543214",
        "password": "FarmerPassword123",
        "full_name": "Fifth Farmer",
        "village": "Nashik",
        "district": "Nashik",
        "state": "Maharashtra",
        "crop": "Onion",
        "variety": "Nasik Red",
        "quantity_kg": 200.0,
        "grade": "A",
        "harvest_date": "2026-08-20",
        "expected_selling_date": "2026-08-25",
        "min_price_per_kg": 25.0
    })
    l5 = client.post("/api/v1/auth/login", json={"phone": "9876543214", "password": "FarmerPassword123"}).json()
    h5 = {"Authorization": f"Bearer {l5['access_token']}"}
    p5 = client.get("/api/v1/produce/my", headers=h5).json()[0]

    # Joining a full team must be rejected
    join5_res = client.post(f"/api/v1/teams/{team_id}/join-request", json={
        "team_id": team_id,
        "produce_lot_id": p5["id"],
        "message": "Attempting 5th member join"
    }, headers=h5)
    assert join5_res.status_code == 400
    assert "already full" in join5_res.json()["detail"]

    # -------------------------------------------------------------
    # 5. Buyer Registration & Demand Posting
    # -------------------------------------------------------------
    buyer_res = client.post("/api/v1/auth/register/buyer", json={
        "phone": "9123456789",
        "password": "BuyerPassword123",
        "full_name": "Vikram Mehta",
        "business_name": "AgroFresh Logistics Mumbai",
        "buyer_type": "Wholesaler",
        "business_address": "Vashi APMC Market, Navi Mumbai",
        "gst_or_license": "27AAACA1234A1Z5",
        "delivery_district": "Mumbai Suburban",
        "delivery_state": "Maharashtra",
        "delivery_lat": 19.0760,
        "delivery_lng": 72.8777,
        "crop": "Onion",
        "variety": "Nasik Red",
        "min_quantity_kg": 1000.0,
        "max_quantity_kg": 2000.0,
        "preferred_grade": "A",
        "target_delivery_date": "2026-08-30",
        "offered_price_per_kg": 29.5,
        "buying_preferences": "Sorted Grade A in 50kg export mesh bags"
    })
    assert buyer_res.status_code == 200
    buyer_token = buyer_res.json()["access_token"]
    hb = {"Authorization": f"Bearer {buyer_token}"}

    # Verify buyer requirements persisted
    b_reqs = client.get("/api/v1/buyers/requirements/my", headers=hb).json()
    assert len(b_reqs) == 1
    assert b_reqs[0]["min_quantity_kg"] == 1000.0
    req_id = b_reqs[0]["id"]

    # -------------------------------------------------------------
    # 6. Buyer Discovers Compatible 4-Farmer Team
    # -------------------------------------------------------------
    discovered_teams = client.get("/api/v1/teams/recently-created", headers=hb).json()
    assert len(discovered_teams) >= 1
    matching_team = next((t for t in discovered_teams if t["team_id"] == team_id), None)
    assert matching_team is not None
    assert matching_team["combined_quantity_kg"] == 1500.0
    assert matching_team["current_members_count"] == 4
    assert matching_team["compatibility_percentage"] >= 80.0

    # -------------------------------------------------------------
    # 7. Buyer Submits Purchase Offer
    # -------------------------------------------------------------
    offer_res = client.post("/api/v1/negotiations/offer", json={
        "team_id": team_id,
        "offered_price_per_kg": 29.5,
        "buyer_requirement_id": req_id,
        "notes": "Prompt payment upon consolidated delivery"
    }, headers=hb)
    assert offer_res.status_code == 200
    neg = offer_res.json()
    neg_id = neg["id"]
    assert neg["total_quantity_kg"] == 1500.0
    assert neg["gross_total_amount"] == 1500.0 * 29.5  # 44,250.0

    # -------------------------------------------------------------
    # 8. Representative Counters with ₹31.0/kg
    # -------------------------------------------------------------
    counter_res = client.post(f"/api/v1/negotiations/{neg_id}/counter", json={
        "counter_price_per_kg": 31.0,
        "notes": "Consolidated single-point loading Grade A lot"
    }, headers=headers[0])
    assert counter_res.status_code == 200
    assert counter_res.json()["counter_price_per_kg"] == 31.0

    # Unauthorized non-representative counter attempt rejected
    unauth_counter = client.post(f"/api/v1/negotiations/{neg_id}/counter", json={
        "counter_price_per_kg": 35.0
    }, headers=headers[1])
    assert unauth_counter.status_code == 403

    # -------------------------------------------------------------
    # 9. All 4 Members Vote on Deal
    # -------------------------------------------------------------
    for i in range(4):
        v_res = client.post(f"/api/v1/negotiations/{neg_id}/vote", json={"vote": "approved"}, headers=headers[i])
        assert v_res.status_code == 200

    # -------------------------------------------------------------
    # 10. Buyer Accepts Counter-Offer (₹31.0/kg)
    # -------------------------------------------------------------
    acc_res = client.post(f"/api/v1/negotiations/{neg_id}/accept", headers=hb)
    assert acc_res.status_code == 200
    agreed_neg = acc_res.json()
    assert agreed_neg["status"] == "deal_agreed"
    assert agreed_neg["final_agreed_price_per_kg"] == 31.0

    # -------------------------------------------------------------
    # 11. Checkout & Sale Creation (Idempotent)
    # -------------------------------------------------------------
    sale_res = client.post("/api/v1/sales/checkout", json={"negotiation_id": neg_id}, headers=hb)
    assert sale_res.status_code == 200
    sale = sale_res.json()
    sale_id = sale["id"]
    assert sale["total_quantity_kg"] == 1500.0
    assert sale["price_per_kg"] == 31.0
    expected_gross = 1500.0 * 31.0  # 46,500.0
    assert sale["gross_amount"] == expected_gross
    assert sale["payment_status"] == "pending"

    # Idempotent re-checkout returns same sale
    re_sale = client.post("/api/v1/sales/checkout", json={"negotiation_id": neg_id}, headers=hb).json()
    assert re_sale["id"] == sale_id

    # -------------------------------------------------------------
    # 12. Payment Simulation & Automatic Settlement
    # -------------------------------------------------------------
    pay_res = client.post(f"/api/v1/sales/{sale_id}/simulate-payment", json={
        "payment_method": "UPI_Escrow",
        "transaction_reference": "UPI-SETTLED-LIVE-2026"
    }, headers=hb)
    assert pay_res.status_code == 200
    settled = pay_res.json()
    assert settled["payment_status"] == "completed"
    assert len(settled["settlements"]) == 4

    # Duplicate payment simulation rejected
    dup_pay = client.post(f"/api/v1/sales/{sale_id}/simulate-payment", json={
        "payment_method": "UPI_Escrow"
    }, headers=hb)
    assert dup_pay.status_code == 400

    # -------------------------------------------------------------
    # 13. Exact Distribution & Penny-Perfect Reconciliation
    # -------------------------------------------------------------
    settlements = settled["settlements"]
    sum_gross_payouts = sum(s["gross_payout"] for s in settlements)
    sum_transport = sum(s["transport_share"] for s in settlements)
    sum_platform = sum(s["platform_fee_share"] for s in settlements)
    sum_net_payouts = sum(s["net_payout"] for s in settlements)

    assert round(sum_gross_payouts, 2) == round(sale["gross_amount"], 2)
    assert round(sum_transport, 2) == round(sale["transport_deduction"], 2)
    assert round(sum_platform, 2) == round(sale["platform_fee"], 2)
    assert round(sum_net_payouts, 2) == round(sale["net_distributable_amount"], 2)

    # Verify each farmer received exact credit in their wallet
    expected_contributions = [500.0, 400.0, 350.0, 250.0]
    for idx, h in enumerate(headers):
        w = client.get("/api/v1/wallet/my", headers=h).json()
        assert w["available_balance"] > 0
        assert w["total_earned"] == w["available_balance"]
        assert len(w["transactions"]) == 1
        assert w["transactions"][0]["type"] == "credit_payout"

        # Verify contribution proportion
        settle_rec = next(s for s in settlements if s["contributed_kg"] == expected_contributions[idx])
        assert round(w["available_balance"], 2) == round(settle_rec["net_payout"], 2)

        # Verify produce lot status is sold
        p = client.get(f"/api/v1/produce/{produce_ids[idx]}", headers=h).json()
        assert p["status"] == "sold"
        assert p["available_quantity_kg"] == 0.0

    # -------------------------------------------------------------
    # 14. Lot Passport Verification
    # -------------------------------------------------------------
    lot_code = settled["lot_code"]
    passport_res = client.get(f"/api/v1/sales/passport/{lot_code}")
    assert passport_res.status_code == 200
    passport = passport_res.json()
    assert passport["lot_code"] == lot_code
    assert passport["total_kg"] == 1500.0
    assert passport["farmer_count"] == 4
    assert passport["final_price"] == 31.0
    assert passport["crop"] == "Onion"
    assert passport["grade"] == "A"

def test_negative_validations_and_security():
    """Test negative cases and permission constraints."""
    # 1. Invalid produce (negative quantity, negative price)
    res_f = client.post("/api/v1/auth/register/farmer", json={
        "phone": "9998887770",
        "password": "Password123",
        "full_name": "Test Farmer",
        "village": "Village",
        "district": "Nashik",
        "state": "Maharashtra"
    })
    t_farmer = res_f.json()["access_token"]
    h_farmer = {"Authorization": f"Bearer {t_farmer}"}

    bad_produce = client.post("/api/v1/produce", json={
        "crop": "Onion",
        "variety": "Nasik Red",
        "quantity_kg": -100.0,
        "grade": "A",
        "harvest_date": "2026-08-20",
        "expected_selling_date": "2026-08-25",
        "min_price_per_kg": 25.0
    }, headers=h_farmer)
    assert bad_produce.status_code in [422, 400]

    # 2. Buyer cannot access farmer endpoints
    res_b = client.post("/api/v1/auth/register/buyer", json={
        "phone": "9998887771",
        "password": "Password123",
        "full_name": "Test Buyer",
        "business_name": "Buyer Co",
        "buyer_type": "Wholesaler",
        "business_address": "Market",
        "delivery_district": "Mumbai",
        "delivery_state": "Maharashtra"
    })
    t_buyer = res_b.json()["access_token"]
    h_buyer = {"Authorization": f"Bearer {t_buyer}"}

    buyer_create_produce = client.post("/api/v1/produce", json={
        "crop": "Onion", "variety": "Nasik Red", "quantity_kg": 100.0,
        "grade": "A", "harvest_date": "2026-08-20", "expected_selling_date": "2026-08-25",
        "min_price_per_kg": 25.0
    }, headers=h_buyer)
    assert buyer_create_produce.status_code == 403

    # 3. Farmer cannot access buyer offer creation
    farmer_create_offer = client.post("/api/v1/negotiations/offer", json={
        "team_id": 1, "offered_price_per_kg": 30.0
    }, headers=h_farmer)
    assert farmer_create_offer.status_code == 403

    # 4. Wallet withdrawal exceeding balance rejected
    bad_withdraw = client.post("/api/v1/wallet/withdraw", json={
        "amount": 50000.0,
        "bank_account_or_upi": "farmer@upi"
    }, headers=h_farmer)
    assert bad_withdraw.status_code == 400
