import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  ShoppingBag,
  Users,
  Check,
  X,
  Vote,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function FarmerNegotiationsPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadAllNegotiations = async () => {
    try {
      setLoading(true);
      const myTeams = await api.getMyTeams();
      setTeams(myTeams);

      let allNegs: any[] = [];
      for (const t of myTeams) {
        const negs = await api.getTeamNegotiations(t.id);
        allNegs = [...allNegs, ...negs];
      }
      setNegotiations(allNegs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllNegotiations();
  }, []);

  const handleVote = async (negId: number, vote: "approved" | "rejected") => {
    try {
      await api.voteOffer(negId, vote);
      setSuccessMsg(`Your vote has been saved as '${vote}'`);
      await loadAllNegotiations();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb
        backHref="/dashboard"
        backLabel="Dashboard"
        items={[{ label: "Negotiations & Offers" }]}
      />

      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-agri-700" />
          <span>Collective Negotiations & Buyer Offers</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review incoming bulk procurement offers and vote to approve or reject deals collectively.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading negotiations...</div>
      ) : negotiations.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No active negotiations</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When institutional buyers submit offers for your active team lots, they will appear here.
          </p>
          <Link
            href="/dashboard/teams"
            className="inline-block px-4 py-2 bg-agri-700 text-white text-xs font-bold rounded-xl"
          >
            Check Teams
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {negotiations.map((neg) => (
            <div
              key={neg.id}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-agri-700 bg-agri-50 px-2 py-0.5 rounded">
                    Team: {neg.team_name}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">
                    {neg.buyer_business || neg.buyer_name}
                  </h3>
                  <p className="text-xs text-slate-500 capitalize mt-0.5">
                    Status: <strong className="text-slate-800">{neg.status.replace(/_/g, " ")}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold block">Active Rate</span>
                  <span className="text-xl font-black text-agri-800">
                    ₹{neg.final_agreed_price_per_kg || neg.counter_price_per_kg || neg.offered_price_per_kg}/kg
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Volume</span>
                  <span className="font-bold text-slate-800">{neg.total_quantity_kg} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Gross Value</span>
                  <span className="font-bold text-slate-800">₹{neg.gross_total_amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Distributable Net</span>
                  <span className="font-bold text-emerald-700">₹{neg.net_distributable_amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Voting actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <Vote className="w-4 h-4 text-agri-700" />
                  <span>
                    Team Approvals: <strong>{neg.approval_votes_count}/{neg.total_members_count} Farmers</strong>
                    {neg.current_user_voted && (
                      <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">
                        Your vote: {neg.current_user_voted}
                      </span>
                    )}
                  </span>
                </div>

                {neg.status !== "deal_agreed" && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleVote(neg.id, "approved")}
                      className="px-3 py-1.5 bg-agri-700 hover:bg-agri-800 text-white font-bold rounded-lg flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve Deal
                    </button>
                    <button
                      onClick={() => handleVote(neg.id, "rejected")}
                      className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
