import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  Building2,
  Plus,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight
} from "lucide-react";

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

const INDIAN_STATES = [
  "Maharashtra", "Madhya Pradesh", "Gujarat", "Karnataka", "Punjab",
  "Haryana", "Rajasthan", "Uttar Pradesh", "Andhra Pradesh", "Telangana", "Tamil Nadu", "Bihar"
];

export default function BuyerRequirementsPage() {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    crop: "Onion",
    variety: "Nasik Red",
    min_quantity_kg: 1000,
    max_quantity_kg: 3000,
    preferred_grade: "A",
    target_delivery_date: new Date(Date.now() + 86400000 * 10).toISOString().split("T")[0],
    offered_price_per_kg: 29.0,
    delivery_district: user?.district || "Mumbai Suburban",
    delivery_state: user?.state || "Maharashtra",
    delivery_address: user?.business_address || "Vashi APMC Depot",
    buying_preferences: "Sorted Grade A in 50kg export bags",
  });

  const loadReqs = async () => {
    try {
      setLoading(true);
      const data = await api.getMyBuyerRequirements();
      setRequirements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReqs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await api.createBuyerRequirement({
        crop: form.crop,
        variety: form.variety,
        min_quantity_kg: Number(form.min_quantity_kg),
        max_quantity_kg: Number(form.max_quantity_kg),
        preferred_grade: form.preferred_grade,
        target_delivery_date: form.target_delivery_date,
        offered_price_per_kg: Number(form.offered_price_per_kg),
        delivery_state: form.delivery_state,
        delivery_district: form.delivery_district,
        delivery_address: form.delivery_address,
        buying_preferences: form.buying_preferences,
      });

      setSuccessMsg("Procurement demand published! Compatible 4-farmer teams can now discover and unlock your requirements.");
      setShowModal(false);
      await loadReqs();
    } catch (err: any) {
      setError(err.message || "Failed to post requirement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Breadcrumb
        backHref="/buyer"
        backLabel="Buyer Hub"
        items={[{ label: "Procurement Demands" }]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-ochre-600" />
            <span>Procurement Demands & Requirements</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Post bulk volume demands. Farmer teams aggregate their produce to meet your specific quantity tiers.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-ochre-600 hover:bg-ochre-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Crop Demand</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading demands...</div>
      ) : requirements.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No active procurement demands posted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Post your required crops, quality grade, volume range, and offered price. Compatible 4-farmer teams will see your demand in their Buyer Unlock Meter.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-ochre-600 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Post Crop Demand
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">{req.crop}</h3>
                  <p className="text-xs font-semibold text-ochre-700">{req.variety || 'All Varieties'}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {req.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Volume Range</span>
                  <span className="font-bold text-slate-800">{req.min_quantity_kg.toLocaleString()} - {req.max_quantity_kg.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Offered Price</span>
                  <span className="font-bold text-agri-800">₹{req.offered_price_per_kg}/kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Quality Grade</span>
                  <span className="font-bold text-slate-800">Grade {req.preferred_grade}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Target Date</span>
                  <span className="font-bold text-slate-800">{req.target_delivery_date}</span>
                </div>
              </div>

              {req.buying_preferences && (
                <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <strong>Preferences:</strong> {req.buying_preferences}
                </p>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Delivery to: <strong className="text-slate-800">{req.delivery_district}, {req.delivery_state}</strong>
                </span>
                <Link
                  href={`/buyer/lots?crop=${req.crop}`}
                  className="text-xs font-bold text-agri-700 hover:underline flex items-center gap-1"
                >
                  <span>Matching Teams</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-ochre-600" />
              <span>Post Crop Procurement Requirement</span>
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Crop Type *</label>
                  <select
                    value={form.crop}
                    onChange={(e) => setForm({ ...form, crop: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-ochre-500"
                  >
                    {CROPS.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Variety (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Nasik Red"
                    value={form.variety}
                    onChange={(e) => setForm({ ...form, variety: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-ochre-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Target Volume (kg) *</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={form.min_quantity_kg}
                    onChange={(e) => setForm({ ...form, min_quantity_kg: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-ochre-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Target Volume (kg) *</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={form.max_quantity_kg}
                    onChange={(e) => setForm({ ...form, max_quantity_kg: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-ochre-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Offered Price (₹/kg) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={form.offered_price_per_kg}
                    onChange={(e) => setForm({ ...form, offered_price_per_kg: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-ochre-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Delivery Date *</label>
                  <input
                    type="date"
                    required
                    value={form.target_delivery_date}
                    onChange={(e) => setForm({ ...form, target_delivery_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-ochre-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery District *</label>
                  <input
                    type="text"
                    required
                    value={form.delivery_district}
                    onChange={(e) => setForm({ ...form, delivery_district: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-ochre-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery State *</label>
                  <select
                    value={form.delivery_state}
                    onChange={(e) => setForm({ ...form, delivery_state: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-ochre-500"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Buying Preferences (Packaging, Moisture, Grade)
                </label>
                <textarea
                  rows={2}
                  value={form.buying_preferences}
                  onChange={(e) => setForm({ ...form, buying_preferences: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-ochre-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-ochre-600 hover:bg-ochre-700 disabled:bg-ochre-400 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {isSubmitting ? "Publishing..." : "Publish Procurement Demand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
