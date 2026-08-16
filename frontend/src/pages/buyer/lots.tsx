import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  Layers,
  Users,
  Send,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  Filter
} from "lucide-react";

export default function BrowseLotsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<string>("");

  // Offer Modal
  const [offerModalTeam, setOfferModalTeam] = useState<any | null>(null);
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [offerNotes, setOfferNotes] = useState<string>("");
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await api.getRecentlyCreatedTeams();
      setTeams(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerModalTeam || !offerPrice) return;

    try {
      setIsSubmittingOffer(true);
      setError(null);
      await api.createOffer({
        team_id: offerModalTeam.team_id,
        offered_price_per_kg: Number(offerPrice),
        notes: offerNotes || "Direct buyer offer from verified firm.",
      });

      setSuccessMsg(`Offer of ₹${offerPrice}/kg submitted to Team Representative of '${offerModalTeam.name}'!`);
      setOfferModalTeam(null);
      setOfferPrice(0);
      setOfferNotes("");
    } catch (err: any) {
      setError(err.message || "Failed to submit offer.");
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  const filteredTeams = selectedCrop
    ? teams.filter((t) => t.crop.toLowerCase() === selectedCrop.toLowerCase())
    : teams;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Breadcrumb
        backHref="/buyer"
        backLabel="Buyer Hub"
        items={[{ label: "Browse 4-Farmer Teams" }]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-agri-700" />
            <span>Browse 4-Farmer Collective Lots</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover aggregated, single-origin lots with consolidated transport depots.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="">All Crops</option>
            <option value="Onion">Onion</option>
            <option value="Tomato">Tomato</option>
            <option value="Wheat">Wheat</option>
            <option value="Soybean">Soybean</option>
            <option value="Potato">Potato</option>
            <option value="Cotton">Cotton</option>
          </select>
        </div>
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
        <div className="py-20 text-center text-slate-400 text-xs">Loading collective lots...</div>
      ) : filteredTeams.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No collective teams available</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When registered farmers create and fill 4-farmer collective teams, they will appear here for procurement.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTeams.map((team) => (
            <div
              key={team.team_id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">{team.name}</h3>
                    <p className="text-xs font-semibold text-agri-700 mt-0.5">
                      {team.crop} ({team.variety}) • Grade {team.grade}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-agri-100 text-agri-900">
                    {team.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center text-xs my-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Members</span>
                    <span className="font-bold text-slate-800">{team.current_members_count}/4 Farmers</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Current Batch</span>
                    <span className="font-bold text-slate-800">{team.combined_quantity_kg.toLocaleString()} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Target Window</span>
                    <span className="font-bold text-slate-800">{team.target_selling_date}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Depot: {team.representative_location}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    setOfferModalTeam(team);
                    setOfferPrice(28);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-ochre-400" />
                  <span>Send Purchase Offer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offer Modal */}
      {offerModalTeam && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <button
              onClick={() => setOfferModalTeam(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-black text-slate-900">
                Send Purchase Offer to '{offerModalTeam.name}'
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Volume: <strong>{offerModalTeam.combined_quantity_kg.toLocaleString()} kg</strong> of {offerModalTeam.crop} (Grade {offerModalTeam.grade})
              </p>
            </div>

            <form onSubmit={handleSendOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Offered Price (₹/kg) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  required
                  value={offerPrice || ""}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes & Delivery Terms (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Clean sorted produce in export bags. Payment within 24 hours of delivery."
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOfferModalTeam(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOffer}
                  className="px-5 py-2 bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {isSubmittingOffer ? "Sending..." : "Submit Formal Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
