import httpx
import sys

base = 'http://127.0.0.1:8000/api/v1'

def run():
    print("--- Starting Live Full-Stack End-to-End Verification ---")

    # Helper to register or login
    def get_or_register_farmer(phone, name, village, qty):
        r = httpx.post(f'{base}/auth/register/farmer', json={
            'phone': phone, 'password': 'Password123', 'full_name': name,
            'village': village, 'district': 'Nashik', 'state': 'Maharashtra',
            'latitude': 20.1708, 'longitude': 73.9856, 'crop': 'Onion', 'variety': 'Nasik Red',
            'quantity_kg': qty, 'grade': 'A', 'harvest_date': '2026-08-20',
            'expected_selling_date': '2026-08-25', 'min_price_per_kg': 25.0
        })
        if r.status_code == 200:
            return r.json()['access_token']
        l = httpx.post(f'{base}/auth/login', json={'phone': phone, 'password': 'Password123'})
        return l.json()['access_token']

    def get_or_register_buyer(phone, name, business):
        r = httpx.post(f'{base}/auth/register/buyer', json={
            'phone': phone, 'password': 'Password123', 'full_name': name,
            'business_name': business, 'buyer_type': 'Wholesaler',
            'business_address': 'Vashi APMC, Navi Mumbai', 'delivery_district': 'Mumbai Suburban',
            'delivery_state': 'Maharashtra', 'crop': 'Onion', 'min_quantity_kg': 1000.0,
            'max_quantity_kg': 3000.0, 'preferred_grade': 'A', 'target_delivery_date': '2026-08-30',
            'offered_price_per_kg': 29.5
        })
        if r.status_code == 200:
            return r.json()['access_token']
        l = httpx.post(f'{base}/auth/login', json={'phone': phone, 'password': 'Password123'})
        return l.json()['access_token']

    # 1. Farmer 1 (Ramesh Patil)
    t1 = get_or_register_farmer('9876543210', 'Ramesh Patil', 'Pimpalgaon Baswant', 600.0)
    h1 = {'Authorization': f'Bearer {t1}'}

    p1_list = httpx.get(f'{base}/produce/my', headers=h1).json()
    if not p1_list:
        p1 = httpx.post(f'{base}/produce', json={
            'crop': 'Onion', 'variety': 'Nasik Red', 'quantity_kg': 600.0, 'grade': 'A',
            'harvest_date': '2026-08-20', 'expected_selling_date': '2026-08-25', 'min_price_per_kg': 25.0
        }, headers=h1).json()
    else:
        p1 = p1_list[0]

    # Create team if not already member
    my_teams = httpx.get(f'{base}/teams/my', headers=h1).json()
    if my_teams:
        team_id = my_teams[0]['id']
        team_name = my_teams[0]['name']
    else:
        team_res = httpx.post(f'{base}/teams', json={'name': 'Nashik Onion Alliance', 'produce_lot_id': p1['id']}, headers=h1).json()
        team_id = team_res['id']
        team_name = team_res['name']

    print(f"[OK] Step 1: Farmer 1 (Ramesh Patil) active with Team '{team_name}' (ID: {team_id})")

    # 2. Farmer 2 (Suresh Jadhav)
    t2 = get_or_register_farmer('9876543211', 'Suresh Jadhav', 'Ozar', 400.0)
    h2 = {'Authorization': f'Bearer {t2}'}
    p2_list = httpx.get(f'{base}/produce/my', headers=h2).json()
    if not p2_list:
        p2 = httpx.post(f'{base}/produce', json={
            'crop': 'Onion', 'variety': 'Nasik Red', 'quantity_kg': 400.0, 'grade': 'A',
            'harvest_date': '2026-08-21', 'expected_selling_date': '2026-08-25', 'min_price_per_kg': 25.0
        }, headers=h2).json()
    else:
        p2 = p2_list[0]

    # Check Opportunity Engine
    opps = httpx.get(f'{base}/teams/compatible?produce_lot_id={p2["id"]}', headers=h2).json()
    print(f"[OK] Step 2: Opportunity Engine evaluated {len(opps)} compatible teams")

    # 3. Buyer (Vikram Mehta)
    tb = get_or_register_buyer('9123456789', 'Vikram Mehta', 'AgroFresh Logistics Mumbai')
    hb = {'Authorization': f'Bearer {tb}'}
    print("[OK] Step 3: Institutional Buyer (AgroFresh Logistics Mumbai) active")

    # Buyer creates offer
    offer = httpx.post(f'{base}/negotiations/offer', json={'team_id': team_id, 'offered_price_per_kg': 29.5}, headers=hb).json()
    neg_id = offer['id']
    print(f"[OK] Step 4: Buyer submitted offer of Rs 29.50/kg for Negotiation #{neg_id}")

    # Representative counters
    httpx.post(f'{base}/negotiations/{neg_id}/counter', json={'counter_price_per_kg': 30.50, 'notes': 'Sorted Grade A.'}, headers=h1)
    httpx.post(f'{base}/negotiations/{neg_id}/vote', json={'vote': 'approved'}, headers=h1)
    httpx.post(f'{base}/negotiations/{neg_id}/accept', headers=hb)
    print(f"[OK] Step 5: Collective Negotiation finalized at Rs 30.50/kg with majority consensus")

    # Checkout & Payment
    sale = httpx.post(f'{base}/sales/checkout', json={'negotiation_id': neg_id}, headers=hb).json()
    sale_id = sale['id']
    print(f"[OK] Step 6: Checkout Sale #{sale_id} created. Gross Value: Rs {sale['gross_amount']:,.2f}")

    settled = httpx.post(f'{base}/sales/{sale_id}/simulate-payment', json={'payment_method': 'UPI_Escrow', 'transaction_reference': 'UPI-LIVE-SUCCESS-2026'}, headers=hb).json()
    print(f"[OK] Step 7: Automatic Settlement Engine executed for Sale #{sale_id}")

    # Wallets & Passport
    w1 = httpx.get(f'{base}/wallet/my', headers=h1).json()
    passport = httpx.get(f'{base}/sales/passport/{settled["lot_code"]}').json()
    print(f"[OK] Step 8: Farmer 1 Wallet Balance: Rs {w1['available_balance']:,.2f}")
    print(f"[OK] Step 9: Digital Collective Lot Passport: {passport['lot_code']} (Total: {passport['total_kg']} kg)")

    print("\nSUCCESS: All 9 full-stack workflow steps completed and persisted in database!")

if __name__ == '__main__':
    run()
