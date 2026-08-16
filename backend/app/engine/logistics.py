from typing import List, Dict, Any, Optional, Tuple
from app.engine.compatibility import calculate_haversine_distance

def calculate_smart_collection_point(
    member_coordinates: List[Tuple[float, float]],
    buyer_coordinates: Optional[Tuple[float, float]] = None
) -> Tuple[float, float, str]:
    """
    Computes an optimal central collection centroid for team members.
    Returns: (centroid_lat, centroid_lng, approximate_location_description)
    """
    if not member_coordinates:
        return (19.9975, 73.7898, "Agri Central Collection Hub, Nashik")
    
    valid_coords = [c for c in member_coordinates if c[0] is not None and c[1] is not None]
    if not valid_coords:
        return (19.9975, 73.7898, "Regional Farmer Aggregation Centre")
    
    avg_lat = sum(c[0] for c in valid_coords) / len(valid_coords)
    avg_lng = sum(c[1] for c in valid_coords) / len(valid_coords)

    # Slight weight towards buyer delivery corridor if present
    if buyer_coordinates and buyer_coordinates[0] is not None and buyer_coordinates[1] is not None:
        avg_lat = avg_lat * 0.8 + buyer_coordinates[0] * 0.2
        avg_lng = avg_lng * 0.8 + buyer_coordinates[1] * 0.2

    lat = round(avg_lat, 4)
    lng = round(avg_lng, 4)
    desc = f"Optimal Central Depot ({lat}, {lng})"

    return (lat, lng, desc)

def calculate_shared_transport_savings(
    members_count: int,
    total_quantity_kg: float,
    avg_distance_km: float = 35.0
) -> Dict[str, Any]:
    """
    Calculates estimated freight cost savings from aggregating 4 small loads into one consolidated transport.
    """
    if members_count <= 0:
        members_count = 1
    
    # Solo transport: each farmer rents a small pickup/tempo (min base fare ~₹800 + ₹15/km)
    solo_cost_per_farmer = 800.0 + (avg_distance_km * 18.0)
    total_solo_transport_cost = solo_cost_per_farmer * members_count

    # Consolidated collective transport: 1 medium truck (e.g. 1.5 - 3 ton vehicle base fare ~₹1400 + ₹24/km)
    collective_transport_cost = 1400.0 + (avg_distance_km * 25.0)

    total_savings = max(0.0, total_solo_transport_cost - collective_transport_cost)
    savings_per_farmer = total_savings / members_count if members_count > 0 else 0.0
    savings_percent = round((total_savings / total_solo_transport_cost) * 100, 1) if total_solo_transport_cost > 0 else 0.0

    return {
        "solo_transport_per_farmer": round(solo_cost_per_farmer, 2),
        "total_solo_cost": round(total_solo_transport_cost, 2),
        "collective_transport_cost": round(collective_transport_cost, 2),
        "total_transport_savings": round(total_savings, 2),
        "savings_per_farmer": round(savings_per_farmer, 2),
        "savings_percentage": savings_percent
    }

def calculate_sustainability_impact(
    completed_teams_data: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Calculates real environmental and logistical impact from actual completed collective sales.
    """
    total_volume_kg = sum(d.get("total_kg", 0) for d in completed_teams_data)
    total_farmers_benefited = sum(d.get("farmer_count", 0) for d in completed_teams_data)
    
    # For every team with N farmers, N-1 solo vehicle trips were saved
    trips_avoided = sum(max(0, d.get("farmer_count", 1) - 1) for d in completed_teams_data)
    
    # Distance saved
    distance_saved_km = trips_avoided * 45.0
    
    # Fuel saved (approx 0.09 L diesel per km for small commercial vehicle)
    diesel_saved_liters = round(distance_saved_km * 0.09, 1)
    
    # CO2 saved (2.68 kg CO2 per liter of diesel burned)
    co2_saved_kg = round(diesel_saved_liters * 2.68, 1)

    return {
        "total_volume_aggregated_kg": total_volume_kg,
        "farmers_benefited": total_farmers_benefited,
        "trips_avoided": trips_avoided,
        "distance_saved_km": round(distance_saved_km, 1),
        "diesel_saved_liters": diesel_saved_liters,
        "co2_saved_kg": co2_saved_kg
    }
