import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  ShoppingBag,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Send,
  CreditCard
} from "lucide-react";

export default function BuyerNegotiationsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadNegotiations = async () => {
    try {
      setLoading(true);
      const data = await api.getMyBuyerNegotiations();
      setNegotiations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNegotiations();
  }, []);

  const handleAcceptCounter = async (negId: number) => {
    if (!confirm("Are you sure you want to accept this counter-offer and agree on the deal?")) return;
    try {
      setError(null);
      await api.acceptNegotiation(negId);
      setSuccessMsg("Deal agreed! You can now proceed to simulated escrow checkout.");
      await loadNegotiations();
    } catch (err: any) {
      setError(err.message || "Failed to accept offer");
    }
  };

  const handleProceedToCheckout = async (negId: number) => {
    try {
      setError(null);
      const sale = await api.checkoutSale(negId);
      router.push(`/buyer/checkout/${sale.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create checkout transaction");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb
        backHref="/buyer"
        backLabel="Buyer Hub"
        items={[{ label: "Negotiations Hub" }]}
      />

      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-ochre-600" />
          <span>Buyer Negotiations & Deal Acceptance</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Negotiate directly with Team Representatives and finalize 4-farmer collective purchase contracts.
        </p>
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
        <div className="py-20 text-center text-slate-400 text-xs">Loading negotiations...</div>
      ) : negotiations.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No active negotiations</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse available 4-farmer teams and send purchase offers to start collective negotiations.
          </p>
          <Link
            href="/buyer/lots"
            className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
          >
            Browse Teams
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
                    Collective Lot Volume: {neg.total_quantity_kg.toLocaleString()} kg
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Status: <strong className="capitalize">{neg.status.replace(/_/g, " ")}</strong>
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
                  <span className="text-[10px] text-slate-400 block">Your Initial Offer</span>
                  <span className="font-bold text-slate-800">₹{neg.offered_price_per_kg}/kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Team Counter</span>
                  <span className="font-bold text-ochre-700">
                    {neg.counter_price_per_kg ? `₹${neg.counter_price_per_kg}/kg` : "Awaiting Counter"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Gross Value</span>
                  <span className="font-bold text-slate-900">₹{neg.gross_total_amount.toLocaleString()}</span>
                </div>
              </div>

              {neg.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <strong>Notes / History:</strong>
                  <p className="mt-0.5 whitespace-pre-line">{neg.notes}</p>
                </div>
              )}

              {/* Actions based on status */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Team Farmer Approvals: <strong>{neg.approval_votes_count}/{neg.total_members_count}</strong>
                </span>

                <div className="flex items-center space-x-2">
                  {neg.status === "counter_sent" && (
                    <button
                      onClick={() => handleAcceptCounter(neg.id)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Accept Counter-Offer (₹{neg.counter_price_per_kg}/kg)
                    </button>
                  )}

                  {neg.status === "deal_agreed" && (
                    <button
                      onClick={() => handleProceedToCheckout(neg.id)}
                      className="px-5 py-2.5 bg-ochre-600 hover:bg-ochre-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Proceed to Escrow Checkout</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
