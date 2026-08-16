import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  Users,
  Check,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  ShieldCheck
} from "lucide-react";

export default function JoinRequestsReviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { team_id } = router.query;

  const [team, setTeam] = useState<any | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadRequests = async () => {
    if (!team_id) return;
    try {
      setLoading(true);
      const [tData, reqData] = await Promise.all([
        api.getTeamById(Number(team_id)),
        api.getTeamJoinRequests(Number(team_id))
      ]);
      setTeam(tData);
      setRequests(reqData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load join requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (team_id) {
      loadRequests();
    }
  }, [team_id]);

  const handleReview = async (reqId: number, action: "approve" | "reject") => {
    if (!team_id) return;
    try {
      setError(null);
      await api.reviewJoinRequest(Number(team_id), reqId, action);
      setSuccessMsg(`Join request has been ${action}d!`);
      await loadRequests();
    } catch (err: any) {
      setError(err.message || "Failed to process join request");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb
        backHref={team_id ? `/dashboard/teams/${team_id}` : "/dashboard/teams"}
        backLabel="Team Hub"
        items={[
          { label: team ? team.name : "Team", href: team_id ? `/dashboard/teams/${team_id}` : undefined },
          { label: "Join Requests" }
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-agri-700" />
            <span>Review Join Requests</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {team ? `Team '${team.name}' (${team.current_members_count}/4 Members Confirmed)` : "Pending farmer applications"}
          </p>
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
        <div className="py-20 text-center text-slate-400 text-xs">Loading applicant requests...</div>
      ) : requests.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No pending join requests</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When compatible farmers in your district discover your team and apply, their applications will appear here.
          </p>
          {team_id && (
            <Link
              href={`/dashboard/teams/${team_id}`}
              className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              Return to Team Hub
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-900">{req.farmer_name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {req.farmer_village || "Local Village"}, {req.farmer_district || "District"}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-500">Compatibility:</span>
                  <span className="text-base font-black text-agri-800 bg-agri-100 px-2.5 py-0.5 rounded-lg">
                    {req.compatibility_score}% Match
                  </span>
                </div>
              </div>

              {/* Applicant Produce Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Crop & Variety</span>
                  <span className="font-bold text-slate-800">{req.crop} ({req.variety})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Quality Grade</span>
                  <span className="font-bold text-slate-800">Grade {req.grade}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Contributed kg</span>
                  <span className="font-bold text-agri-950">{req.contributed_kg} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Harvest Date</span>
                  <span className="font-bold text-slate-800">{req.harvest_date}</span>
                </div>
              </div>

              {/* Match Reasons */}
              {req.match_reasons && req.match_reasons.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-600 block">Identified Synergy:</span>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {req.match_reasons.map((r: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-agri-600 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {req.message && (
                <div className="p-3 bg-agri-50/50 rounded-xl border border-agri-100 text-xs text-slate-700 italic">
                  "{req.message}"
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => handleReview(req.id, "reject")}
                  className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
                <button
                  onClick={() => handleReview(req.id, "approve")}
                  className="px-5 py-2 bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Approve Farmer into Team
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
