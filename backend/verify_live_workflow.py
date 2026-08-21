import sys
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

def run_clean_workflow():
    print("==================================================================")
    print("--- FasalDirect Live Full-Stack End-to-End Verification ---")
    print("==================================================================")

    # 1. Clean Database Setup
    test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=test_engine)
    client = TestClient(app)

    # 2. Register Farmer 1 (Ramesh Patil - Team Creator / Representative)
    print("\n[Step 1] Registering Farmer 1 (Ramesh Patil, Pimpalgaon Baswant, 500kg Onion Grade A)...")
    r1 = client.post("/api/v1/auth/register/farmer", json={
        "phone": "9876543210", "password": "Password123", "full_name": "Ramesh Patil",
        "village": "Pimpalgaon Baswant", "district": "Nashik", "state": "Maharashtra",
        "latitude": 20.1708, "longitude": 73.9856, "crop": "Onion", "variety": "Nasik Red",
        "quantity_kg": 500.0, "grade": "A", "harvest_date": "2026-08-20",
        "expected_selling_date": "2026-08-25", "min_price_per_kg": 25.0
    })
    assert r1.status_code == 200, r1.text
    t1 = r1.json()["access_token"]
    h1 = {"Authorization": f"Bearer {t1}"}
    p1 = client.get("/api/v1/produce/my", headers=h1).json()[0]
    print(f"  -> Farmer 1 registered. Produce Lot #{p1['id']} ({p1['quantity_kg']}kg {p1['crop']} Grade {p1['grade']}) status: {p1['status']}")

    # Farmer 1 forms Team
    team_res = client.post("/api/v1/teams", json={
        "name": "Nashik Premium Onion Alliance",
        "produce_lot_id": p1["id"]
    }, headers=h1).json()
    team_id = team_res["id"]
    print(f"  -> Formed Team '{team_res['name']}' (ID: {team_id}). Members: {team_res['current_members_count']}/4. Representative ID: {team_res['representative_id']}")

    # 3. Register Farmers 2, 3, and 4 and join team
    farmers_meta = [
        {"phone": "9876543211", "name": "Suresh Jadhav", "village": "Ozar", "qty": 400.0, "price": 25.0},
        {"phone": "9876543212", "name": "Ganesh Shinde", "village": "Dindori", "qty": 350.0, "price": 26.0},
        {"phone": "9876543213", "name": "Anil Deshmukh", "village": "Sinnar", "qty": 250.0, "price": 25.5},
    ]

    farmer_tokens = [t1]
    farmer_headers = [h1]
    farmer_produce_ids = [p1["id"]]

    for idx, f in enumerate(farmers_meta, start=2):
        print(f"\n[Step {idx}] Registering Farmer {idx} ({f['name']}, {f['village']}, {f['qty']}kg)...")
        rf = client.post("/api/v1/auth/register/farmer", json={
            "phone": f["phone"], "password": "Password123", "full_name": f["name"],
            "village": f["village"], "district": "Nashik", "state": "Maharashtra",
            "latitude": 20.0 + idx * 0.04, "longitude": 73.8 + idx * 0.04,
            "crop": "Onion", "variety": "Nasik Red", "quantity_kg": f["qty"],
            "grade": "A", "harvest_date": "2026-08-20", "expected_selling_date": "2026-08-25",
            "min_price_per_kg": f["price"]
        })
        assert rf.status_code == 200, rf.text
        tf = rf.json()["access_token"]
        hf = {"Authorization": f"Bearer {tf}"}
        pf = client.get("/api/v1/produce/my", headers=hf).json()[0]
        farmer_tokens.append(tf)
        farmer_headers.append(hf)
        farmer_produce_ids.append(pf["id"])

        # Check Opportunity Engine
        opps = client.get(f"/api/v1/teams/compatible?produce_lot_id={pf['id']}", headers=hf).json()
        assert len(opps) >= 1
        print(f"  -> Opportunity Engine evaluated match: {opps[0]['compatibility_percentage']}% synergy")

        # Submit join request
        req = client.post(f"/api/v1/teams/{team_id}/join-request", json={
            "team_id": team_id,
            "produce_lot_id": pf["id"],
            "message": f"Farmer {idx} joining with {f['qty']}kg Grade A lot"
        }, headers=hf).json()

        # Representative approves
        client.post(f"/api/v1/teams/{team_id}/join-requests/{req['id']}/review", json={
            "action": "approve"
        }, headers=h1)
        print(f"  -> Join request approved by Representative. Member #{idx} added.")

    # Verify team is now full at 4 members
    team_full = client.get(f"/api/v1/teams/{team_id}", headers=h1).json()
    print(f"\n[OK] Team Capacity Check: {team_full['current_members_count']}/4 Members Confirmed. Combined Batch: {team_full['combined_quantity_kg']} kg. Status: {team_full['status']}")
    assert team_full["current_members_count"] == 4
    assert team_full["combined_quantity_kg"] == 1500.0
    assert team_full["status"] == "full"

    # 4. Attempt 5th Farmer Join (must be rejected)
    print("\n[Step 5] Testing 5th Farmer capacity constraint limit...")
    client.post("/api/v1/auth/register/farmer", json={
        "phone": "9876543219", "password": "Password123", "full_name": "Fifth Farmer",
        "village": "Nashik", "district": "Nashik", "state": "Maharashtra",
        "crop": "Onion", "variety": "Nasik Red", "quantity_kg": 200.0, "grade": "A",
        "harvest_date": "2026-08-20", "expected_selling_date": "2026-08-25", "min_price_per_kg": 25.0
    })
    l5 = client.post("/api/v1/auth/login", json={"phone": "9876543219", "password": "Password123"}).json()
    h5 = {"Authorization": f"Bearer {l5['access_token']}"}
    p5 = client.get("/api/v1/produce/my", headers=h5).json()[0]
    j5 = client.post(f"/api/v1/teams/{team_id}/join-request", json={
        "team_id": team_id, "produce_lot_id": p5["id"]
    }, headers=h5)
    assert j5.status_code == 400
    print(f"  -> 5th farmer join correctly rejected with 400: '{j5.json()['detail']}'")

    # 5. Register Buyer & Browse Compatible Teams
    print("\n[Step 6] Registering Institutional Buyer (AgroFresh Logistics Mumbai)...")
    rb = client.post("/api/v1/auth/register/buyer", json={
        "phone": "9123456789", "password": "BuyerPassword123", "full_name": "Vikram Mehta",
        "business_name": "AgroFresh Logistics Mumbai", "buyer_type": "Wholesaler",
        "business_address": "Vashi APMC Market, Navi Mumbai", "gst_or_license": "27AAACA1234A1Z5",
        "delivery_district": "Mumbai Suburban", "delivery_state": "Maharashtra",
        "delivery_lat": 19.0760, "delivery_lng": 72.8777,
        "crop": "Onion", "variety": "Nasik Red", "min_quantity_kg": 1000.0, "max_quantity_kg": 2000.0,
        "preferred_grade": "A", "target_delivery_date": "2026-08-30", "offered_price_per_kg": 29.5
    })
    assert rb.status_code == 200
    tb = rb.json()["access_token"]
    hb = {"Authorization": f"Bearer {tb}"}

    discovered = client.get("/api/v1/teams/recently-created", headers=hb).json()
    assert len(discovered) >= 1
    match = next(t for t in discovered if t["team_id"] == team_id)
    print(f"  -> Buyer discovered 4-Farmer Lot: '{match['name']}' ({match['combined_quantity_kg']}kg {match['crop']} Grade {match['grade']}) with {match['compatibility_percentage']}% dynamic compatibility")

    # 6. Negotiation: Offer -> Counter -> Vote -> Agreement
    print("\n[Step 7] Buyer submits offer of Rs 29.50/kg...")
    offer = client.post("/api/v1/negotiations/offer", json={
        "team_id": team_id, "offered_price_per_kg": 29.5, "notes": "Prompt UPI Escrow payment"
    }, headers=hb).json()
    neg_id = offer["id"]

    print("  -> Representative counters with Rs 31.00/kg...")
    client.post(f"/api/v1/negotiations/{neg_id}/counter", json={
        "counter_price_per_kg": 31.0, "notes": "Consolidated single-point loading Grade A lot"
    }, headers=h1)

    print("  -> All 4 team farmers vote to approve deal...")
    for idx, h in enumerate(farmer_headers, start=1):
        client.post(f"/api/v1/negotiations/{neg_id}/vote", json={"vote": "approved"}, headers=h)

    print("  -> Buyer accepts counter offer of Rs 31.00/kg...")
    agreed = client.post(f"/api/v1/negotiations/{neg_id}/accept", headers=hb).json()
    assert agreed["status"] == "deal_agreed"
    assert agreed["final_agreed_price_per_kg"] == 31.0

    # 7. Checkout & Payment Simulation
    print("\n[Step 8] Creating Collective Sale checkout...")
    sale = client.post("/api/v1/sales/checkout", json={"negotiation_id": neg_id}, headers=hb).json()
    sale_id = sale["id"]
    print(f"  -> Sale #{sale_id} created: {sale['total_quantity_kg']}kg @ Rs {sale['price_per_kg']}/kg = Gross Rs {sale['gross_amount']:,.2f}")
    assert sale["total_quantity_kg"] == 1500.0
    assert sale["gross_amount"] == 1500.0 * 31.0  # 46,500.0

    print("  -> Executing Buyer Simulated Escrow Payment & Automatic Settlement...")
    settled = client.post(f"/api/v1/sales/{sale_id}/simulate-payment", json={
        "payment_method": "UPI_Escrow", "transaction_reference": "UPI-LIVE-SETTLED-2026"
    }, headers=hb).json()
    assert settled["payment_status"] == "completed"

    # 8. Verify Exact Proportional Distribution & Wallets
    print("\n[Step 9] Verifying exact rupee-for-rupee distribution & farmer wallets...")
    settlements = settled["settlements"]
    assert len(settlements) == 4

    sum_net = sum(s["net_payout"] for s in settlements)
    assert round(sum_net, 2) == round(settled["net_distributable_amount"], 2)
    print(f"  -> Net Distributable Amount: Rs {settled['net_distributable_amount']:,.2f} exactly equals sum of all farmer payouts: Rs {sum_net:,.2f}")

    for idx, h in enumerate(farmer_headers, start=1):
        w = client.get("/api/v1/wallet/my", headers=h).json()
        s_farmer = next(s for s in settlements if s["farmer_id"] == w["user_id"])
        print(f"  -> Farmer {idx} ({s_farmer['farmer_name']}): Contributed {s_farmer['contributed_kg']}kg ({s_farmer['percentage_share']}%) -> Wallet Credited: Rs {w['available_balance']:,.2f}")
        assert round(w["available_balance"], 2) == round(s_farmer["net_payout"], 2)

    # 9. Digital Collective Lot Passport
    passport = client.get(f"/api/v1/sales/passport/{settled['lot_code']}").json()
    print(f"\n[Step 10] Digital Collective Lot Passport Verified: {passport['lot_code']}")
    print(f"  -> Crop: {passport['crop']} Grade {passport['grade']} | Total: {passport['total_kg']} kg | Farmers: {passport['farmer_count']} | Final Rate: Rs {passport['final_price']}/kg")

    print("\n==================================================================")
    print(" SUCCESS: Complete End-to-End Business Logic Verified & Tested! ")
    print("==================================================================")

if __name__ == "__main__":
    run_clean_workflow()
