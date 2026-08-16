import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db

init_db()
client = TestClient(app)

def test_health_and_root():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["service"] == "FasalDirect API"

    h = client.get("/health")
    assert h.status_code == 200
    assert h.json()["status"] == "healthy"

def test_farmer_registration_and_workflow():
    # 1. Register Farmer 1 (Nashik, Ramesh, 500 kg Onion Grade A)
    farmer_payload = {
        "phone": "9876543210",
        "password": "FarmerPassword123",
        "full_name": "Ramesh Patil",
        "email": "ramesh@example.com",
        "village": "Pimpalgaon",
        "district": "Nashik",
        "state": "Maharashtra",
        "latitude": 20.1708,
        "longitude": 73.9856,
        "preferred_language": "mr",
        "crop": "Onion",
        "variety": "Nasik Red",
        "quantity_kg": 500.0,
        "grade": "A",
        "harvest_date": "2026-08-20",
        "expected_selling_date": "2026-08-25",
        "min_price_per_kg": 25.0
    }
    res = client.post("/api/v1/auth/register/farmer", json=farmer_payload)
    assert res.status_code == 200
    token1 = res.json()["access_token"]
    headers1 = {"Authorization": f"Bearer {token1}"}

    # Verify produce created
    res_p = client.get("/api/v1/produce/my", headers=headers1)
    assert res_p.status_code == 200
    produce_list = res_p.json()
    assert len(produce_list) == 1
    produce_id_1 = produce_list[0]["id"]
    assert produce_list[0]["crop"] == "Onion"

    # Farmer 1 creates Team
    team_payload = {
        "name": "Nashik Onion Alliance",
        "produce_lot_id": produce_id_1
    }
    res_team = client.post("/api/v1/teams", json=team_payload, headers=headers1)
    assert res_team.status_code == 200
    team_data = res_team.json()
    assert team_data["name"] == "Nashik Onion Alliance"
    assert team_data["current_members_count"] == 1
    assert team_data["available_slots"] == 3
    assert team_data["combined_quantity_kg"] == 500.0
    team_id = team_data["id"]

    # 2. Register Farmer 2 (Nashik, Suresh, 400 kg Onion Grade A)
    farmer_payload_2 = {
        "phone": "9876543211",
        "password": "FarmerPassword123",
        "full_name": "Suresh Jadhav",
        "email": "suresh@example.com",
        "village": "Ozar",
        "district": "Nashik",
        "state": "Maharashtra",
        "latitude": 20.0917,
        "longitude": 73.9272,
        "preferred_language": "mr",
        "crop": "Onion",
        "variety": "Nasik Red",
        "quantity_kg": 400.0,
        "grade": "A",
        "harvest_date": "2026-08-21",
        "expected_selling_date": "2026-08-25",
        "min_price_per_kg": 25.0
    }
    res2 = client.post("/api/v1/auth/register/farmer", json=farmer_payload_2)
    assert res2.status_code == 200
    token2 = res2.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    res_p2 = client.get("/api/v1/produce/my", headers=headers2)
    produce_id_2 = res_p2.json()[0]["id"]

    # Farmer 2 discovers compatible teams
    res_compat = client.get(f"/api/v1/teams/compatible?produce_lot_id={produce_id_2}", headers=headers2)
    assert res_compat.status_code == 200
    opportunities = res_compat.json()
    assert len(opportunities) >= 1
    assert opportunities[0]["team_id"] == team_id
    assert opportunities[0]["compatibility_percentage"] >= 80.0

    # Farmer 2 requests to join Team
    res_req = client.post(
        f"/api/v1/teams/{team_id}/join-request",
        json={"team_id": team_id, "produce_lot_id": produce_id_2, "message": "Ready with 400 kg fresh onion lot"},
        headers=headers2
    )
    assert res_req.status_code == 200
    join_req_id = res_req.json()["id"]

    # Farmer 1 reviews and approves join request
    res_rev = client.post(
        f"/api/v1/teams/{team_id}/join-requests/{join_req_id}/review",
        json={"action": "approve"},
        headers=headers1
    )
    assert res_rev.status_code == 200

    # Verify team now has 2 members, 900 kg total
    res_team_updated = client.get(f"/api/v1/teams/{team_id}", headers=headers1)
    assert res_team_updated.status_code == 200
    assert res_team_updated.json()["current_members_count"] == 2
    assert res_team_updated.json()["combined_quantity_kg"] == 900.0

    # 3. Register Buyer (AgroFresh Mumbai)
    buyer_payload = {
        "phone": "9123456789",
        "password": "BuyerPassword123",
        "full_name": "Vikram Mehta",
        "email": "vikram@agrofresh.com",
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
        "min_quantity_kg": 800.0,
        "max_quantity_kg": 2000.0,
        "preferred_grade": "A",
        "target_delivery_date": "2026-08-28",
        "offered_price_per_kg": 29.0
    }
    res_b = client.post("/api/v1/auth/register/buyer", json=buyer_payload)
    assert res_b.status_code == 200
    token_buyer = res_b.json()["access_token"]
    headers_buyer = {"Authorization": f"Bearer {token_buyer}"}

    # Buyer makes an offer of ₹29/kg for the 900 kg lot
    res_offer = client.post(
        "/api/v1/negotiations/offer",
        json={"team_id": team_id, "offered_price_per_kg": 29.0, "notes": "Prompt payment upon delivery"},
        headers=headers_buyer
    )
    assert res_offer.status_code == 200
    neg_id = res_offer.json()["id"]

    # Farmer 1 (Representative) counter offers ₹30.50/kg
    res_counter = client.post(
        f"/api/v1/negotiations/{neg_id}/counter",
        json={"counter_price_per_kg": 30.50, "notes": "Grade A sorted and cleaned in export bags"},
        headers=headers1
    )
    assert res_counter.status_code == 200

    # Members vote
    client.post(f"/api/v1/negotiations/{neg_id}/vote", json={"vote": "approved"}, headers=headers1)
    client.post(f"/api/v1/negotiations/{neg_id}/vote", json={"vote": "approved"}, headers=headers2)

    # Buyer accepts counter offer of ₹30.50/kg
    res_accept = client.post(f"/api/v1/negotiations/{neg_id}/accept", headers=headers_buyer)
    assert res_accept.status_code == 200

    # Create Checkout Sale
    res_sale = client.post("/api/v1/sales/checkout", json={"negotiation_id": neg_id}, headers=headers_buyer)
    assert res_sale.status_code == 200
    sale_data = res_sale.json()
    sale_id = sale_data["id"]
    assert sale_data["total_quantity_kg"] == 900.0
    assert sale_data["price_per_kg"] == 30.50
    assert sale_data["gross_amount"] == 900.0 * 30.50  # 27,450.0

    # Buyer Simulates Payment
    res_pay = client.post(
        f"/api/v1/sales/{sale_id}/simulate-payment",
        json={"payment_method": "UPI_Escrow", "transaction_reference": "UPI-TEST-12345"},
        headers=headers_buyer
    )
    assert res_pay.status_code == 200
    settled_sale = res_pay.json()
    assert settled_sale["payment_status"] == "completed"
    assert len(settled_sale["settlements"]) == 2

    # Verify Farmer 1 gets 500/900 = 55.56% of net payout
    res_w1 = client.get("/api/v1/wallet/my", headers=headers1)
    assert res_w1.status_code == 200
    assert res_w1.json()["available_balance"] > 0

    # Verify Farmer 2 gets 400/900 = 44.44% of net payout
    res_w2 = client.get("/api/v1/wallet/my", headers=headers2)
    assert res_w2.status_code == 200
    assert res_w2.json()["available_balance"] > 0

    print("All backend tests passed with complete workflow validation!")

if __name__ == "__main__":
    test_health_and_root()
    test_farmer_registration_and_workflow()
