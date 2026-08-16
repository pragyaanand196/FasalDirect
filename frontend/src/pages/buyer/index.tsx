import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import {
  Building2,
  Plus,
  ShoppingBag,
  Layers,
  FileCheck2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

export default function BuyerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [requirements, setRequirements] = useState<any[]>([]);
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "buyer")) {
      router.push("/login");
    }
  }, [user, authLoading]);

  const loadBuyerData = async () => {
    try {
      setLoading(true);
      const [rData, nData, sData] = await Promise.all([
        api.getMyBuyerRequirements(),
        api.getMyBuyerNegotiations(),
        api.getMySales()
      ]);
      setRequirements(rData);
      setNegotiations(nData);
      setSales(sData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "buyer") {
      loadBuyerData();
    }
  }, [user]);

  if (authLoading || !user) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading buyer portal...</div>;
  }

  const activeReqs = requirements.filter((r) => r.status === "active");
  const totalVolumePurchased = sales.reduce((acc, s) => acc + (s.total_quantity_kg || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-ochre-500/20 text-ochre-300 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Verified Institutional Buyer Hub • {user.business_name || user.full_name}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Procure Directly from Aggregated 4-Farmer Teams
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
            Eliminate commission agent friction. Buy sorted, single-origin collective lots with digital lot passports, transparent provenance, and single consolidated truck pickups.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/buyer/requirements"
              className="px-4 py-2.5 rounded-xl bg-ochre-500 hover:bg-ochre-400 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Crop Demand</span>
            </Link>
            <Link
              href="/buyer/lots"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-ochre-300" />
              <span>Browse 4-Farmer Teams</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Active Demands</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{activeReqs.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Live procurement requests</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Active Deals</span>
          <p className="text-2xl font-black text-ochre-700 mt-1">{negotiations.length}</p>
          <Link href="/buyer/negotiations" className="text-[11px] text-agri-700 hover:underline font-semibold mt-1 block">
            View Offers →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Procured</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalVolumePurchased.toLocaleString()} kg</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Through collective lots</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Completed Deals</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{sales.length}</p>
          <Link href="/buyer/purchases" className="text-[11px] text-agri-700 hover:underline font-semibold mt-1 block">
            View Passports →
          </Link>
        </div>
      </div>

      {/* Active Demands & Active Negotiations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Requirements */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-agri-700" />
              <span>My Active Procurement Demands</span>
            </h2>
            <Link href="/buyer/requirements" className="text-xs font-bold text-agri-700 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {requirements.length === 0 ? (
            <div className="py-10 text-center space-y-2 bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500">No active procurement demands posted yet.</p>
              <Link
                href="/buyer/requirements"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-ochre-600 text-white rounded-lg text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Post Your Crop Demand
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {requirements.slice(0, 3).map((r) => (
                <div key={r.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900">{r.crop} ({r.variety || 'Standard'})</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Target: {r.min_quantity_kg.toLocaleString()} - {r.max_quantity_kg.toLocaleString()} kg • Grade {r.preferred_grade}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-agri-800">₹{r.offered_price_per_kg}/kg</span>
                    <span className="text-[10px] text-slate-400 block font-semibold">Delivery: {r.target_delivery_date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Active Negotiations */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-ochre-600" />
              <span>Active Negotiations with Representatives</span>
            </h2>
            <Link href="/buyer/negotiations" className="text-xs font-bold text-agri-700 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {negotiations.length === 0 ? (
            <div className="py-10 text-center space-y-2 bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500">No active negotiations in progress.</p>
              <Link
                href="/buyer/lots"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-agri-700 text-white rounded-lg text-xs font-bold"
              >
                Browse Compatible Teams
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {negotiations.slice(0, 3).map((neg) => (
                <div key={neg.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900">Team: {neg.team_name}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Volume: {neg.total_quantity_kg} kg • Status: <strong className="capitalize">{neg.status.replace(/_/g, " ")}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-agri-800">
                      ₹{neg.final_agreed_price_per_kg || neg.counter_price_per_kg || neg.offered_price_per_kg}/kg
                    </span>
                    <Link href="/buyer/negotiations" className="text-[10px] font-bold text-agri-700 hover:underline block mt-0.5">
                      Respond →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
