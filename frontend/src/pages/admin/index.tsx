import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Shield,
  Users,
  Building2,
  Layers,
  FileCheck2,
  TrendingUp,
  Settings,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Sliders,
  Sparkles
} from "lucide-react";

const COLORS = ["#285d3b", "#eb9218", "#3b82f6", "#8b5cf6", "#ec4899", "#10b981"];

export default function AdminPortalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "teams" | "config">("overview");

  // Config edit state
  const [feePercent, setFeePercent] = useState("2.0");
  const [threshold, setThreshold] = useState("75.0");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, authLoading]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [sData, uData, tData, cData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminTeams(),
        api.getAdminConfig()
      ]);
      setStats(sData);
      setUsers(uData);
      setTeams(tData);
      setConfigs(cData);
      if (cData.default_platform_fee_percent) setFeePercent(cData.default_platform_fee_percent);
      if (cData.default_compatibility_threshold) setThreshold(cData.default_compatibility_threshold);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      loadAdminData();
    }
  }, [user]);

  const handleToggleKYC = async (userId: number, currentKyc: boolean) => {
    try {
      await api.verifyUser(userId, !currentKyc);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, kyc_verified: !currentKyc } : u))
      );
      setSuccessMsg(`KYC status updated for User #${userId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateAdminConfig("default_platform_fee_percent", feePercent);
      await api.updateAdminConfig("default_compatibility_threshold", threshold);
      setSuccessMsg("Platform configurations updated successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || !user) {
    return <div className="py-20 text-center text-slate-400 text-xs">Loading admin portal...</div>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        backHref="/"
        backLabel="Home"
        items={[{ label: "System Administration" }]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-slate-800" />
            <span>Platform Administrative Portal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            System metrics, user KYC verification, collective team audits, and platform configuration.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-bold self-start sm:self-auto">
          {[
            { id: "overview", label: "Analytics Overview" },
            { id: "users", label: "Users & KYC" },
            { id: "teams", label: "Teams Audit" },
            { id: "config", label: "Parameters" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW & RECHARTS */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">Registered Farmers</span>
              <p className="text-2xl font-black text-agri-800 mt-1">{stats?.total_farmers || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">Registered Buyers</span>
              <p className="text-2xl font-black text-ochre-700 mt-1">{stats?.total_buyers || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">Aggregated Volume</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{(stats?.total_aggregated_volume_kg || 0).toLocaleString()} kg</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">Platform Commission</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">₹{(stats?.total_platform_commission_rs || 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Recharts Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Volume by Crop */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-agri-700" />
                <span>Crop Volume Aggregation Breakdown</span>
              </h3>

              {!stats?.volume_by_crop || stats.volume_by_crop.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                  No crop sales recorded yet. Data will visualize dynamically upon team completions.
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.volume_by_crop}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="crop" fontSize={11} stroke="#64748b" />
                      <YAxis fontSize={11} stroke="#64748b" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#285d3b" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Top Regional Districts */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-ochre-600" />
                <span>Top Regional Districts Participating</span>
              </h3>

              {!stats?.top_districts || stats.top_districts.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                  No district data available.
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {stats.top_districts.map((d: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{d.district}</span>
                      <span className="font-bold text-agri-800 bg-agri-100 px-2 py-0.5 rounded">
                        {d.farmers_count} Farmers Active
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS DIRECTORY & KYC */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">User Directory & Verification</h3>
            <span className="text-xs text-slate-400">{users.length} Total Users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Location / Business</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">KYC Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {u.full_name}
                      <span className="block text-[10px] text-slate-400 font-normal">{u.phone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        u.role === "farmer" ? "bg-agri-100 text-agri-800" : (u.role === "buyer" ? "bg-ochre-100 text-ochre-800" : "bg-slate-200 text-slate-800")
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.role === "farmer" ? `${u.village || ''}, ${u.district || ''}` : (u.business_name || `${u.district || ''}`)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                        u.kyc_verified ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {u.kyc_verified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleKYC(u.id, u.kyc_verified)}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
                      >
                        {u.kyc_verified ? "Revoke KYC" : "Verify KYC"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TEAMS AUDIT */}
      {activeTab === "teams" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">4-Farmer Teams Activity Audit</h3>
            <span className="text-xs text-slate-400">{teams.length} Teams Registered</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Team Name</th>
                  <th className="py-3 px-4">Crop & Grade</th>
                  <th className="py-3 px-4">Representative</th>
                  <th className="py-3 px-4">Members</th>
                  <th className="py-3 px-4">Volume (kg)</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {teams.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{t.name}</td>
                    <td className="py-3.5 px-4">{t.crop} (Grade {t.grade})</td>
                    <td className="py-3.5 px-4">{t.representative}</td>
                    <td className="py-3.5 px-4 font-bold">{t.members_count}/4 Farmers</td>
                    <td className="py-3.5 px-4 font-black text-slate-900">{t.total_quantity_kg.toLocaleString()} kg</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {t.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PLATFORM CONFIG */}
      {activeTab === "config" && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-xl space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-slate-700" />
            <span>Platform Rule & Parameter Configuration</span>
          </h3>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Platform Commission Fee (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={feePercent}
                onChange={(e) => setFeePercent(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
              />
              <p className="text-[11px] text-slate-400 mt-1">Deducted transparently upon successful payment settlement (Default: 2.0%)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Opportunity Engine Minimum Threshold (%)
              </label>
              <input
                type="number"
                step="1"
                min="50"
                max="95"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
              />
              <p className="text-[11px] text-slate-400 mt-1">Minimum compatibility score for auto-recommendation (Default: 75%)</p>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Save Platform Parameters
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
