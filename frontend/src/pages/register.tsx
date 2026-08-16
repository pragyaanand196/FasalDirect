import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { LeafletMap } from "@/components/LeafletMap";
import {
  Sprout,
  Building2,
  Shield,
  Phone,
  User as UserIcon,
  MapPin,
  Lock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Globe,
  Upload
} from "lucide-react";

const INDIAN_STATES = [
  "Maharashtra", "Madhya Pradesh", "Gujarat", "Karnataka", "Punjab",
  "Haryana", "Rajasthan", "Uttar Pradesh", "Andhra Pradesh", "Telangana", "Tamil Nadu", "Bihar"
];

const CROPS = [
  { name: "Onion", varieties: ["Nasik Red", "Garhwa", "Bhima Super", "Agrifound Dark Red"] },
  { name: "Tomato", varieties: ["Vaibhav", "Abhinav", "Sartaj", "Rupali"] },
  { name: "Wheat", varieties: ["Sharbati", "Lokwan", "HD-2967", "Sonalika"] },
  { name: "Soybean", varieties: ["JS-335", "JS-9560", "MACS 1407"] },
  { name: "Potato", varieties: ["Kufri Jyoti", "Kufri Pukhraj", "Kufri Bahar"] },
  { name: "Cotton", varieties: ["BT Cotton", "Bunny", "Ajeet 155"] },
  { name: "Mustard", varieties: ["Pusa Bold", "Varuna", "Giriraj"] },
  { name: "Chili", varieties: ["Guntur Sannam", "Byadgi", "Teja 4"] }
];

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<"farmer" | "buyer" | "admin">("farmer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync role from query string if provided
  useEffect(() => {
    if (router.query.role && ["farmer", "buyer", "admin"].includes(router.query.role as string)) {
      setRole(router.query.role as any);
    }
  }, [router.query.role]);

  // Farmer Form State
  const [farmerForm, setFarmerForm] = useState({
    fullName: "",
    phone: "",
    password: "",
    village: "",
    district: "Nashik",
    state: "Maharashtra",
    latitude: 20.0,
    longitude: 73.8,
    preferredLanguage: "mr",
    crop: "Onion",
    variety: "Nasik Red",
    quantityKg: 500,
    grade: "A",
    harvestDate: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
    expectedSellingDate: new Date(Date.now() + 86400000 * 8).toISOString().split("T")[0],
    minPricePerKg: 25,
  });

  // Buyer Form State
  const [buyerForm, setBuyerForm] = useState({
    fullName: "",
    phone: "",
    password: "",
    businessName: "",
    buyerType: "Wholesaler",
    businessAddress: "",
    gstOrLicense: "",
    deliveryDistrict: "Mumbai Suburban",
    deliveryState: "Maharashtra",
    deliveryLat: 19.076,
    deliveryLng: 72.877,
    crop: "Onion",
    variety: "Nasik Red",
    minQuantityKg: 1000,
    maxQuantityKg: 3000,
    preferredGrade: "A",
    targetDeliveryDate: new Date(Date.now() + 86400000 * 10).toISOString().split("T")[0],
    offeredPricePerKg: 29.0,
    buyingPreferences: "Dry cleaned in 50kg export mesh bags",
  });

  // Admin Form State
  const [adminForm, setAdminForm] = useState({
    fullName: "",
    phone: "",
    password: "",
  });

  const handleFarmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!farmerForm.phone || !farmerForm.fullName || !farmerForm.password) {
      setError("Please fill all required profile fields.");
      return;
    }

    try {
      setLoading(true);
      await api.registerFarmer({
        phone: farmerForm.phone,
        password: farmerForm.password,
        full_name: farmerForm.fullName,
        village: farmerForm.village,
        district: farmerForm.district,
        state: farmerForm.state,
        latitude: farmerForm.latitude,
        longitude: farmerForm.longitude,
        preferred_language: farmerForm.preferredLanguage,
        crop: farmerForm.crop,
        variety: farmerForm.variety,
        quantity_kg: Number(farmerForm.quantityKg),
        grade: farmerForm.grade,
        harvest_date: farmerForm.harvestDate,
        expected_selling_date: farmerForm.expectedSellingDate,
        min_price_per_kg: Number(farmerForm.minPricePerKg),
      });

      // Log in directly
      await login(farmerForm.phone, farmerForm.password);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!buyerForm.phone || !buyerForm.fullName || !buyerForm.businessName || !buyerForm.password) {
      setError("Please fill all required buyer details.");
      return;
    }

    try {
      setLoading(true);
      await api.registerBuyer({
        phone: buyerForm.phone,
        password: buyerForm.password,
        full_name: buyerForm.fullName,
        business_name: buyerForm.businessName,
        buyer_type: buyerForm.buyerType,
        business_address: buyerForm.businessAddress || `${buyerForm.deliveryDistrict}, ${buyerForm.deliveryState}`,
        gst_or_license: buyerForm.gstOrLicense,
        delivery_district: buyerForm.deliveryDistrict,
        delivery_state: buyerForm.deliveryState,
        delivery_lat: buyerForm.deliveryLat,
        delivery_lng: buyerForm.deliveryLng,
        crop: buyerForm.crop,
        variety: buyerForm.variety,
        min_quantity_kg: Number(buyerForm.minQuantityKg),
        max_quantity_kg: Number(buyerForm.maxQuantityKg),
        preferred_grade: buyerForm.preferredGrade,
        target_delivery_date: buyerForm.targetDeliveryDate,
        offered_price_per_kg: Number(buyerForm.offeredPricePerKg),
        buying_preferences: buyerForm.buyingPreferences,
      });

      await login(buyerForm.phone, buyerForm.password);
    } catch (err: any) {
      setError(err.message || "Buyer registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await api.registerAdmin({
        phone: adminForm.phone,
        password: adminForm.password,
        full_name: adminForm.fullName,
      });
      await login(adminForm.phone, adminForm.password);
    } catch (err: any) {
      setError(err.message || "Admin registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Join the FasalDirect Network
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Choose your role below. No mock data: your profile and produce listings will directly participate in live aggregation and negotiations.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole("farmer")}
            className={`py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              role === "farmer"
                ? "bg-white text-agri-900 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sprout className="w-4 h-4 text-agri-600" />
            <span>Farmer</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("buyer")}
            className={`py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              role === "buyer"
                ? "bg-white text-agri-900 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4 text-ochre-600" />
            <span>Buyer</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              role === "admin"
                ? "bg-white text-agri-900 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Shield className="w-4 h-4 text-slate-700" />
            <span>Admin</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* FARMER FORM */}
        {role === "farmer" && (
          <form onSubmit={handleFarmerSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-agri-900 border-b border-slate-100 pb-2">
                1. Farmer Personal & Location Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil"
                    value={farmerForm.fullName}
                    onChange={(e) => setFarmerForm({ ...farmerForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={farmerForm.phone}
                    onChange={(e) => setFarmerForm({ ...farmerForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Create secure password"
                    value={farmerForm.password}
                    onChange={(e) => setFarmerForm({ ...farmerForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Language</label>
                  <select
                    value={farmerForm.preferredLanguage}
                    onChange={(e) => setFarmerForm({ ...farmerForm, preferredLanguage: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  >
                    <option value="en">English</option>
                    <option value="mr">मराठी (Marathi)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="gu">ગુજરાતી (Gujarati)</option>
                    <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                    <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Village / Town *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pimpalgaon Baswant"
                    value={farmerForm.village}
                    onChange={(e) => setFarmerForm({ ...farmerForm, village: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nashik"
                    value={farmerForm.district}
                    onChange={(e) => setFarmerForm({ ...farmerForm, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                  <select
                    value={farmerForm.state}
                    onChange={(e) => setFarmerForm({ ...farmerForm, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interactive Map Picker for Farm GPS Coordinates */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pin Farm Location on OpenStreetMap (for Haversine Proximity Matching)
                </label>
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <LeafletMap
                    selectable
                    height="200px"
                    center={[farmerForm.latitude, farmerForm.longitude]}
                    markers={[{ lat: farmerForm.latitude, lng: farmerForm.longitude, label: "Your Farm Coordinates", type: "farmer" }]}
                    onMapClick={(lat, lng) => setFarmerForm({ ...farmerForm, latitude: lat, longitude: lng })}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Selected GPS: Lat {farmerForm.latitude.toFixed(4)}, Lng {farmerForm.longitude.toFixed(4)}
                </p>
              </div>
            </div>

            {/* Produce Intake */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-agri-900">
                  2. First Crop Produce Details
                </h3>
                <span className="text-[11px] font-semibold text-agri-700 bg-agri-50 px-2 py-0.5 rounded">
                  Activates Opportunity Engine
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Crop Type *</label>
                  <select
                    value={farmerForm.crop}
                    onChange={(e) => {
                      const sel = CROPS.find((c) => c.name === e.target.value);
                      setFarmerForm({
                        ...farmerForm,
                        crop: e.target.value,
                        variety: sel ? sel.varieties[0] : "Standard",
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  >
                    {CROPS.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Crop Variety *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nasik Red"
                    value={farmerForm.variety}
                    onChange={(e) => setFarmerForm({ ...farmerForm, variety: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (kg) *</label>
                  <input
                    type="number"
                    min="50"
                    max="100000"
                    step="50"
                    required
                    value={farmerForm.quantityKg}
                    onChange={(e) => setFarmerForm({ ...farmerForm, quantityKg: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quality Grade *</label>
                  <select
                    value={farmerForm.grade}
                    onChange={(e) => setFarmerForm({ ...farmerForm, grade: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  >
                    <option value="A">Grade A (Export / Premium Cleaned)</option>
                    <option value="B">Grade B (Standard Market Grade)</option>
                    <option value="C">Grade C (Processing Grade)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Harvest Date *</label>
                  <input
                    type="date"
                    required
                    value={farmerForm.harvestDate}
                    onChange={(e) => setFarmerForm({ ...farmerForm, harvestDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expected Selling Date *</label>
                  <input
                    type="date"
                    required
                    value={farmerForm.expectedSellingDate}
                    onChange={(e) => setFarmerForm({ ...farmerForm, expectedSellingDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Acceptable Price (₹/kg) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={farmerForm.minPricePerKg}
                    onChange={(e) => setFarmerForm({ ...farmerForm, minPricePerKg: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-agri-700 hover:bg-agri-800 disabled:bg-agri-400 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Registering & Finding Teams..." : "Complete Registration & Discover Teams"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* BUYER FORM */}
        {role === "buyer" && (
          <form onSubmit={handleBuyerSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-agri-900 border-b border-slate-100 pb-2">
                1. Institutional Buyer Business Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Mehta"
                    value={buyerForm.fullName}
                    onChange={(e) => setBuyerForm({ ...buyerForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9123456789"
                    value={buyerForm.phone}
                    onChange={(e) => setBuyerForm({ ...buyerForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Business / Firm Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AgroFresh Mumbai Wholesalers Pvt Ltd"
                    value={buyerForm.businessName}
                    onChange={(e) => setBuyerForm({ ...buyerForm, businessName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Buyer Type *</label>
                  <select
                    value={buyerForm.buyerType}
                    onChange={(e) => setBuyerForm({ ...buyerForm, buyerType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  >
                    <option value="Wholesaler">Wholesaler / APMC Trader</option>
                    <option value="Food Processor">Food Processor / Mill</option>
                    <option value="Retail Chain">Retail Supermarket Chain</option>
                    <option value="Exporter">Agricultural Exporter</option>
                    <option value="Institutional">Institutional Catering / Bulk Buyer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN or FSSAI License (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 27AAACA1234A1Z5"
                    value={buyerForm.gstOrLicense}
                    onChange={(e) => setBuyerForm({ ...buyerForm, gstOrLicense: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Create secure password"
                    value={buyerForm.password}
                    onChange={(e) => setBuyerForm({ ...buyerForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Destination District *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai Suburban"
                    value={buyerForm.deliveryDistrict}
                    onChange={(e) => setBuyerForm({ ...buyerForm, deliveryDistrict: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery State *</label>
                  <select
                    value={buyerForm.deliveryState}
                    onChange={(e) => setBuyerForm({ ...buyerForm, deliveryState: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Initial Procurement Demand */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-agri-900">
                2. Initial Crop Procurement Requirement
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Required Crop *</label>
                  <select
                    value={buyerForm.crop}
                    onChange={(e) => setBuyerForm({ ...buyerForm, crop: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  >
                    {CROPS.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Target Volume (kg) *</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={buyerForm.minQuantityKg}
                    onChange={(e) => setBuyerForm({ ...buyerForm, minQuantityKg: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Target Volume (kg) *</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={buyerForm.maxQuantityKg}
                    onChange={(e) => setBuyerForm({ ...buyerForm, maxQuantityKg: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Grade</label>
                  <select
                    value={buyerForm.preferredGrade}
                    onChange={(e) => setBuyerForm({ ...buyerForm, preferredGrade: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  >
                    <option value="A">Grade A Preferred</option>
                    <option value="B">Grade B Accepted</option>
                    <option value="Any">Any Uniform Grade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Offered Price (₹/kg) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={buyerForm.offeredPricePerKg}
                    onChange={(e) => setBuyerForm({ ...buyerForm, offeredPricePerKg: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Delivery Date *</label>
                  <input
                    type="date"
                    required
                    value={buyerForm.targetDeliveryDate}
                    onChange={(e) => setBuyerForm({ ...buyerForm, targetDeliveryDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-ochre-600 hover:bg-ochre-700 disabled:bg-ochre-400 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Registering Buyer Account..." : "Create Buyer Account & Browse Teams"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* ADMIN FORM */}
        {role === "admin" && (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              System Administrator Access
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Admin Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Platform Administrator"
                value={adminForm.fullName}
                onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 9999999999"
                value={adminForm.phone}
                onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="Admin password"
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Creating..." : "Initialize Admin Account"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered on FasalDirect?{" "}
          <Link href="/login" className="font-bold text-agri-700 hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
