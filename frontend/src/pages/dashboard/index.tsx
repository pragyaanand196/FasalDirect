import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import {
  Layers,
  Users,
  ShoppingBag,
  Wallet,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  ChevronRight
} from "lucide-react";

export default function FarmerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [produceLots, setProduceLots] = useState<any[]>([]);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "farmer")) {
      router.push("/login");
    }
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [pData, tData, wData] = await Promise.all([
        api.getMyProduce(),
        api.getMyTeams(),
        api.getMyWallet()
      ]);
      setProduceLots(pData);
      setMyTeams(tData);
      setWallet(wData);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "farmer") {
      loadDashboardData();
    }
  }, [user]);

  if (authLoading || !user) {
    return <div className="py-20 text-center text-slate-500 text-sm">Loading farmer portal...</div>;
  }

  const activeTeam = myTeams.length > 0 ? myTeams[0] : null;
  const availableProduce = produceLots.filter((p) => p.status === "available");
  const totalListedKg = produceLots.reduce((acc, p) => acc + (p.quantity_kg || 0), 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-agri-900 to-agri-800 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-agri-700 text-ochre-300 text-xs font-bold">
            <Sparkles className="w-3 h-3" />
            <span>Farmer Collective Hub • {user.district || "India"}, {user.state || ""}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Namaste, {user.full_name}
          </h1>

          <p className="text-xs sm:text-sm text-agri-100 font-normal leading-relaxed">
            {activeTeam
              ? `You are currently in team '${activeTeam.name}' (${activeTeam.current_members_count}/4 farmers, ${activeTeam.combined_quantity_kg} kg ${activeTeam.crop}).`
              : "Aggregate your produce with neighboring farmers to unlock direct bulk buyer pricing and reduce individual transport costs."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!activeTeam ? (
              <>
                <Link
                  href="/dashboard/teams"
                  className="px-4 py-2.5 rounded-xl bg-ochre-500 hover:bg-ochre-400 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span>Find My Team</span>
                </Link>
                <Link
                  href="/dashboard/teams/create"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create 4-Farmer Team</span>
                </Link>
              </>
            ) : (
              <Link
                href={`/dashboard/teams/${activeTeam.id}`}
                className="px-5 py-2.5 rounded-xl bg-ochre-500 hover:bg-ochre-400 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>Open Team Hub ({activeTeam.name})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Team</span>
            <Users className="w-4 h-4 text-agri-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {activeTeam ? `${activeTeam.current_members_count}/4 Members` : "No Team Yet"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 capitalize">
            {activeTeam ? `Status: ${activeTeam.status.replace(/_/g, " ")}` : "Ready to join"}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Produce Listed</span>
            <Layers className="w-4 h-4 text-agri-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {totalListedKg.toLocaleString()} kg
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {produceLots.length} Crop Lot{produceLots.length !== 1 ? "s" : ""} registered
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Wallet Balance</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-700">
            ₹{(wallet?.available_balance || 0).toLocaleString()}
          </p>
          <Link href="/dashboard/wallet" className="text-[11px] text-agri-700 hover:underline font-semibold mt-1 block">
            View Payouts →
          </Link>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Earned</span>
            <TrendingUp className="w-4 h-4 text-ochre-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            ₹{(wallet?.total_earned || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            From direct settlements
          </p>
        </div>
      </div>

      {/* Main Grid: My Active Team & Produce Lots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Active Team or Meaningful Empty State */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-agri-700" />
                <span>My 4-Farmer Collective Team</span>
              </h2>
              {activeTeam && (
                <Link
                  href={`/dashboard/teams/${activeTeam.id}`}
                  className="text-xs font-bold text-agri-700 hover:underline flex items-center gap-1"
                >
                  <span>Open Full Team Hub</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading team status...</div>
            ) : !activeTeam ? (
              <div className="py-10 text-center space-y-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6">
                <div className="w-12 h-12 rounded-2xl bg-agri-100 text-agri-700 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">You have not joined a collective team yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Our Smart Opportunity Engine analyzes your produce lot to find open compatible teams in your district with matching crop, grade, and harvest timing.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <Link
                    href="/dashboard/teams"
                    className="px-4 py-2 bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Find Compatible Teams
                  </Link>
                  <Link
                    href="/dashboard/teams/create"
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl"
                  >
                    Create New Team
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-agri-50/70 border border-agri-200 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-agri-950">{activeTeam.name}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Aggregating {activeTeam.crop} ({activeTeam.variety}) Grade {activeTeam.grade} • Target Date: {activeTeam.target_selling_date}
                    </p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-agri-200 text-agri-900">
                    {activeTeam.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* 4 Member Slots Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                    <span>Member Capacity ({activeTeam.current_members_count}/4 Farmers)</span>
                    <span className="font-bold text-agri-800">{activeTeam.combined_quantity_kg.toLocaleString()} kg Total</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3].map((slotIdx) => {
                      const member = activeTeam.members[slotIdx];
                      return (
                        <div
                          key={slotIdx}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            member
                              ? "bg-white border-agri-400 shadow-2xs"
                              : "bg-slate-50 border-dashed border-slate-300 text-slate-400"
                          }`}
                        >
                          {member ? (
                            <>
                              <span className="text-[10px] font-bold text-agri-700 block truncate">
                                {member.farmer_name}
                              </span>
                              <span className="text-xs font-black text-slate-900 block mt-0.5">
                                {member.contributed_kg} kg
                              </span>
                              <span className="text-[9px] text-slate-400 block mt-0.5">
                                {member.is_representative ? "Representative" : "Member"}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-[10px] font-semibold text-slate-400 block">Slot {slotIdx + 1}</span>
                              <span className="text-xs font-bold text-slate-400 block mt-0.5">Open</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href={`/dashboard/teams/${activeTeam.id}`}
                    className="text-xs font-bold text-agri-800 hover:text-agri-900 flex items-center gap-1"
                  >
                    <span>Manage Collective Team & Negotiations</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Quick Produce Lots Overview */}
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-agri-700" />
                <span>My Produce</span>
              </h2>
              <Link
                href="/dashboard/produce"
                className="text-xs font-bold text-agri-700 hover:underline flex items-center gap-1"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {produceLots.length === 0 ? (
              <div className="py-8 text-center space-y-2 bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500">No produce lots listed yet.</p>
                <Link
                  href="/dashboard/produce"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-agri-700 text-white rounded-lg text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Produce
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {produceLots.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{p.crop} ({p.variety})</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Grade {p.grade} • {p.quantity_kg} kg • Min ₹{p.min_price_per_kg}/kg
                      </p>
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
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
