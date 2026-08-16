import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/Breadcrumb";
import { saveOfflineDraft, getOfflineDrafts, deleteOfflineDraft } from "@/lib/indexedDB";
import {
  Layers,
  Plus,
  Trash2,
  Users,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  WifiOff,
  RefreshCw,
  ArrowRight,
  X
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

export default function ProducePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [produceList, setProduceList] = useState<any[]>([]);
  const [offlineDrafts, setOfflineDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    crop: "Onion",
    variety: "Nasik Red",
    quantity_kg: 500,
    grade: "A",
    harvest_date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    expected_selling_date: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
    min_price_per_kg: 25,
  });

  const loadProduce = async () => {
    try {
      setLoading(true);
      const data = await api.getMyProduce();
      setProduceList(data);
      const drafts = await getOfflineDrafts();
      setOfflineDrafts(drafts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduce();
  }, []);

  const handleCreateProduce = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!navigator.onLine) {
        // Save as offline draft
        await saveOfflineDraft(form);
        setSuccessMsg("Saved locally as an Offline Draft. It will sync when connection returns.");
        setShowAddModal(false);
        const drafts = await getOfflineDrafts();
        setOfflineDrafts(drafts);
      } else {
        await api.createProduce({
          crop: form.crop,
          variety: form.variety,
          quantity_kg: Number(form.quantity_kg),
          grade: form.grade,
          harvest_date: form.harvest_date,
          expected_selling_date: form.expected_selling_date,
          min_price_per_kg: Number(form.min_price_per_kg),
        });
        setSuccessMsg("Produce lot added successfully!");
        setShowAddModal(false);
        await loadProduce();
      }
    } catch (err: any) {
      setError(err.message || "Failed to add produce lot.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncDraft = async (draft: any) => {
    try {
      await api.createProduce({
        crop: draft.crop,
        variety: draft.variety,
        quantity_kg: Number(draft.quantity_kg),
        grade: draft.grade,
        harvest_date: draft.harvest_date,
        expected_selling_date: draft.expected_selling_date,
        min_price_per_kg: Number(draft.min_price_per_kg),
      });
      await deleteOfflineDraft(draft.id);
      setSuccessMsg(`Draft ${draft.crop} synced to server!`);
      await loadProduce();
    } catch (err: any) {
      setError(err.message || "Failed to sync draft");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this produce listing?")) return;
    try {
      await api.deleteProduce(id);
      setSuccessMsg("Produce lot deleted.");
      await loadProduce();
    } catch (err: any) {
      setError(err.message || "Cannot delete locked produce.");
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        backHref="/dashboard"
        backLabel="Dashboard"
        items={[{ label: "My Produce" }]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-agri-700" />
            <span>My Produce Lots</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your crop inventory and submit lots for collective team aggregation.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Produce Lot</span>
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

      {/* Offline Drafts Alert if present */}
      {offlineDrafts.length > 0 && (
        <div className="p-4 bg-ochre-50 border border-ochre-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-ochre-900">
              <WifiOff className="w-4 h-4 text-ochre-700" />
              <span>Offline Drafts Stored Locally ({offlineDrafts.length})</span>
            </div>
            <span className="text-[11px] text-ochre-700">IndexedDB Storage</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {offlineDrafts.map((d) => (
              <div key={d.id} className="p-3 bg-white rounded-xl border border-ochre-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">{d.crop} ({d.variety})</p>
                  <p className="text-[11px] text-slate-500">{d.quantity_kg} kg • Grade {d.grade}</p>
                </div>
                <button
                  onClick={() => handleSyncDraft(d)}
                  className="px-2.5 py-1 bg-ochre-600 hover:bg-ochre-700 text-white font-bold text-[11px] rounded-lg flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Sync Online
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Produce List Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading produce lots...</div>
      ) : produceList.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No produce lots listed yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            List your crop harvest with quantity and grade. Our Opportunity Engine will automatically rank compatible 4-farmer teams for you.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-agri-700 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Add Your First Produce Lot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {produceList.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">{p.crop}</h3>
                  <p className="text-xs font-semibold text-agri-700">{p.variety}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  p.status === "available"
                    ? "bg-emerald-100 text-emerald-800"
                    : p.status === "locked_in_team"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-200 text-slate-700"
                }`}>
                  {p.status.replace(/_/g, " ")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Quantity</span>
                  <span className="font-bold text-slate-800">{p.quantity_kg.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Quality Grade</span>
                  <span className="font-bold text-slate-800">Grade {p.grade}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Min Rate</span>
                  <span className="font-bold text-slate-800">₹{p.min_price_per_kg}/kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Expected Sell</span>
                  <span className="font-bold text-slate-800">{p.expected_selling_date}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {p.status === "available" ? (
                  <Link
                    href={`/dashboard/teams?produce_id=${p.id}`}
                    className="text-xs font-bold text-agri-700 hover:text-agri-900 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Find Compatible Teams</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="text-xs font-medium text-slate-500">
                    {p.status === "locked_in_team" ? "Committed to active team" : "Lot Sold & Settled"}
                  </span>
                )}

                {p.status === "available" && (
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Delete produce lot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Produce Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-agri-700" />
              <span>Add Produce Lot</span>
            </h3>

            <form onSubmit={handleCreateProduce} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Crop Type *</label>
                  <select
                    value={form.crop}
                    onChange={(e) => {
                      const sel = CROPS.find((c) => c.name === e.target.value);
                      setForm({
                        ...form,
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
                    value={form.variety}
                    onChange={(e) => setForm({ ...form, variety: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (kg) *</label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    required
                    value={form.quantity_kg}
                    onChange={(e) => setForm({ ...form, quantity_kg: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quality Grade *</label>
                  <select
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  >
                    <option value="A">Grade A (Premium)</option>
                    <option value="B">Grade B (Standard)</option>
                    <option value="C">Grade C (Processing)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Harvest Date *</label>
                  <input
                    type="date"
                    required
                    value={form.harvest_date}
                    onChange={(e) => setForm({ ...form, harvest_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expected Selling Date *</label>
                  <input
                    type="date"
                    required
                    value={form.expected_selling_date}
                    onChange={(e) => setForm({ ...form, expected_selling_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Price (₹/kg) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={form.min_price_per_kg}
                    onChange={(e) => setForm({ ...form, min_price_per_kg: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-agri-700 hover:bg-agri-800 disabled:bg-agri-400 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {isSubmitting ? "Saving..." : "Save Produce Lot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
