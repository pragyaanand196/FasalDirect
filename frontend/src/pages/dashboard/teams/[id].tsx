import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/Breadcrumb";
import { LeafletMap } from "@/components/LeafletMap";
import { WhatIfSimulator } from "@/components/WhatIfSimulator";
import { TeamGrowthSimulator } from "@/components/TeamGrowthSimulator";
import { BuyerUnlockCard } from "@/components/BuyerUnlockCard";
import { AIExplanationModal } from "@/components/AIExplanationModal";
import {
  Users,
  ShieldCheck,
  MapPin,
  Calendar,
  Lock,
  Unlock,
  TrendingUp,
  ShoppingBag,
  Send,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  LogOut,
  Sparkles,
  ArrowRight,
  Check,
  X,
  Vote
} from "lucide-react";

export default function TeamHubPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [team, setTeam] = useState<any | null>(null);
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [health, setHealth] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Counter offer state
  const [counterPrice, setCounterPrice] = useState<number>(0);
  const [counterNotes, setCounterNotes] = useState<string>("");
  const [isSubmittingCounter, setIsSubmittingCounter] = useState(false);

  // AI Modal
  const [showAiModal, setShowAiModal] = useState(false);

  const loadTeamData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const teamId = Number(id);
      const [tData, negData, hData] = await Promise.all([
        api.getTeamById(teamId),
        api.getTeamNegotiations(teamId),
        api.getTeamHealth(teamId)
      ]);
      setTeam(tData);
      setNegotiations(negData);
      setHealth(hData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadTeamData();
    }
  }, [id]);

  const handleVote = async (negId: number, vote: "approved" | "rejected") => {
    try {
      await api.voteOffer(negId, vote);
      setSuccessMsg(`Your vote has been registered as '${vote}'!`);
      await loadTeamData();
    } catch (err: any) {
      setError(err.message || "Failed to submit vote");
    }
  };

  const handleSendCounter = async (negId: number) => {
    if (!counterPrice || counterPrice <= 0) {
      setError("Please enter a valid counter price.");
      return;
    }
    try {
      setIsSubmittingCounter(true);
      setError(null);
      await api.sendCounterOffer(negId, {
        counter_price_per_kg: counterPrice,
        notes: counterNotes || "Counter offer submitted on behalf of 4-farmer collective.",
      });
      setSuccessMsg(`Counter offer of ₹${counterPrice}/kg sent to buyer!`);
      setCounterPrice(0);
      setCounterNotes("");
      await loadTeamData();
    } catch (err: any) {
      setError(err.message || "Failed to send counter offer");
    } finally {
      setIsSubmittingCounter(false);
    }
  };

  const handleAcceptNegotiation = async (negId: number) => {
    if (!confirm("Are you sure you want to finalize and accept this collective sale deal?")) return;
    try {
      await api.acceptNegotiation(negId);
      setSuccessMsg("Deal accepted! Sale confirmation sent to buyer.");
      await loadTeamData();
    } catch (err: any) {
      setError(err.message || "Failed to accept deal");
    }
  };

  const handleWithdraw = async () => {
    if (!confirm("Are you sure you want to withdraw from this team? Your produce lot will be unlocked.")) return;
    try {
      await api.withdrawFromTeam(Number(id));
      router.push("/dashboard/teams");
    } catch (err: any) {
      setError(err.message || "Could not withdraw from team");
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-xs">Loading Team Hub...</div>;
  }

  if (!team) {
    return (
      <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8">
        <Users className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">Team not found</h3>
        <Link href="/dashboard/teams" className="text-xs text-agri-700 font-bold underline">
          Back to Teams
        </Link>
      </div>
    );
  }

  const isRepresentative = team.is_current_user_representative;
  const isMember = team.is_current_user_member;

  // Prepare map markers
  const mapMarkers = [
    ...(team.members || []).map((m: any) => ({
      lat: 20.0 + (Math.random() * 0.08 - 0.04), // nearby coordinates
      lng: 73.8 + (Math.random() * 0.08 - 0.04),
      label: `${m.farmer_name} (${m.contributed_kg} kg)`,
      type: "farmer" as const,
      detail: `${m.village || 'Farm'}, ${m.district || ''}`
    })),
    ...(team.collection_lat && team.collection_lng ? [{
      lat: team.collection_lat,
      lng: team.collection_lng,
      label: `Collection Point: ${team.collection_address || 'Central Depot'}`,
      type: "collection" as const,
      detail: "Suggested Central Vehicle Loading Centroid"
    }] : [])
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb
        backHref="/dashboard/teams"
        backLabel="My Teams"
        items={[{ label: team.name }]}
      />

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

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                team.status === "open"
                  ? "bg-agri-100 text-agri-900"
                  : team.status === "full" || team.status === "ready_to_sell"
                  ? "bg-blue-100 text-blue-900"
                  : team.status === "selling"
                  ? "bg-ochre-100 text-ochre-900"
                  : "bg-emerald-100 text-emerald-900"
              }`}>
                Lifecycle: {team.status.replace(/_/g, " ")}
              </span>

              {isRepresentative && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 text-white flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-ochre-400" />
                  You are Team Representative
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{team.name}</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Aggregating <strong className="text-slate-900">{team.crop} ({team.variety})</strong> • Grade <strong className="text-slate-900">{team.grade}</strong> • Target Window: <strong className="text-slate-900">{team.target_selling_date}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {isRepresentative && (
              <Link
                href={`/dashboard/teams/requests?team_id=${team.id}`}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Users className="w-4 h-4 text-ochre-400" />
                <span>Review Join Requests</span>
              </Link>
            )}

            {isMember && team.status !== "sold" && team.status !== "completed" && (
              <button
                onClick={handleWithdraw}
                className="px-3 py-2 border border-slate-300 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
                title="Withdraw and unlock your produce"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Withdraw</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Member Slots Visual Progression */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>4-Farmer Team Capacity ({team.current_members_count}/4 Slots Filled)</span>
            <span className="font-black text-agri-800">{team.combined_quantity_kg.toLocaleString()} kg Aggregated</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((idx) => {
              const m = (team.members || [])[idx];
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    m
                      ? "bg-white border-agri-300 shadow-2xs"
                      : "bg-slate-50 border-dashed border-slate-300 text-slate-400"
                  }`}
                >
                  {m ? (
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 truncate">{m.farmer_name}</span>
                        {m.is_representative && (
                          <span className="text-[9px] font-bold bg-slate-900 text-white px-1.5 py-0.2 rounded">
                            Rep
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{m.village || "Local Farm"}</p>
                      <div className="pt-1 flex items-baseline justify-between border-t border-slate-100">
                        <span className="text-sm font-black text-agri-950">{m.contributed_kg} kg</span>
                        <span className="text-[11px] font-bold text-agri-700">{m.percentage}% Share</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-center text-xs">
                      <span className="text-slate-400 font-semibold block">Slot {idx + 1}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">Open for Neighbor</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Two-Column Hub Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Negotiations, Buyer Unlocks, and Leaflet Map */}
        <div className="lg:col-span-2 space-y-6">
          {/* Collective Negotiations Section */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-ochre-100 flex items-center justify-center text-ochre-700">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Collective Negotiations & Deals</h3>
                  <p className="text-xs text-slate-500">Representative negotiates bulk rate • All members vote</p>
                </div>
              </div>
            </div>

            {negotiations.length === 0 ? (
              <div className="py-10 text-center space-y-2 bg-slate-50 rounded-xl p-6">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No active buyer offers received yet</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  When institutional buyers post crop procurement offers for your lot size, they will appear here for collective negotiation.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {negotiations.map((neg) => (
                  <div
                    key={neg.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{neg.buyer_business || neg.buyer_name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Status: <span className="font-semibold capitalize">{neg.status.replace(/_/g, " ")}</span></p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-semibold">Active Offer</span>
                        <span className="text-base font-black text-agri-800">
                          ₹{neg.final_agreed_price_per_kg || neg.counter_price_per_kg || neg.offered_price_per_kg}/kg
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-slate-200 text-center text-xs">
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

                    {/* Member Consensus Voting */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center space-x-2">
                        <Vote className="w-4 h-4 text-agri-600 shrink-0" />
                        <span>
                          Member Approvals: <strong className="text-agri-800">{neg.approval_votes_count}/{neg.total_members_count} Farmers</strong>
                          {neg.current_user_voted && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                              Your Vote: {neg.current_user_voted}
                            </span>
                          )}
                        </span>
                      </div>

                      {isMember && neg.status !== "deal_agreed" && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleVote(neg.id, "approved")}
                            className="px-3 py-1.5 bg-agri-700 hover:bg-agri-800 text-white font-bold rounded-lg flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve Offer
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

                    {/* Representative Actions: Counter-Offer & Acceptance */}
                    {isRepresentative && neg.status !== "deal_agreed" && (
                      <div className="pt-3 border-t border-slate-200 space-y-3">
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <input
                            type="number"
                            step="0.5"
                            placeholder="Counter Price (₹/kg)"
                            value={counterPrice || ""}
                            onChange={(e) => setCounterPrice(Number(e.target.value))}
                            className="w-full sm:w-48 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                          />
                          <input
                            type="text"
                            placeholder="Counter notes (e.g. sorted Grade A in 50kg bags)"
                            value={counterNotes}
                            onChange={(e) => setCounterNotes(e.target.value)}
                            className="flex-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                          />
                          <button
                            onClick={() => handleSendCounter(neg.id)}
                            disabled={isSubmittingCounter}
                            className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs whitespace-nowrap"
                          >
                            Send Counter
                          </button>
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => handleAcceptNegotiation(neg.id)}
                            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirm & Accept Collective Sale Deal</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buyer Unlock Capability Feed */}
          {team.buyer_unlocks && team.buyer_unlocks.length > 0 && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-agri-700" />
                  <span>Buyer Unlock Meter</span>
                </h3>
                <span className="text-xs text-slate-400">Target Demand Matching</span>
              </div>

              <div className="space-y-3">
                {team.buyer_unlocks.map((b: any) => (
                  <BuyerUnlockCard
                    key={b.requirement_id}
                    buyerName={b.buyer_name}
                    location={b.buyer_location}
                    targetQuantityKg={b.target_min_quantity_kg}
                    currentQuantityKg={b.current_team_quantity_kg}
                    kgNeeded={b.kg_needed_to_unlock}
                    progressPercent={b.progress_percentage}
                    offeredPrice={b.offered_price_per_kg}
                    isUnlocked={b.is_unlocked}
                    targetDate={b.target_delivery_date}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Smart Collection Centroid Map */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-ochre-600" />
                <span>Smart Collection Point (Logistics Centroid)</span>
              </h3>
              <span className="text-xs text-slate-500">OpenStreetMap Route</span>
            </div>
            <p className="text-xs text-slate-500">
              Optimal central depot calculated from all member farms to minimize individual tempo loading trips.
            </p>
            <LeafletMap height="280px" markers={mapMarkers} />
          </div>
        </div>

        {/* Right Col: Simulators & Health */}
        <div className="space-y-6">
          {/* Team Health Monitor */}
          {health && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Team Health Monitor</span>
                <span className="text-xs font-bold text-agri-800 bg-agri-100 px-2 py-0.5 rounded">
                  {health.overall_health}
                </span>
              </div>
              <div className="space-y-2">
                {health.checks.map((c: any, i: number) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
                    <span className="font-semibold text-slate-700">{c.check}</span>
                    <span className="text-[11px] text-slate-600">{c.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Growth Simulator */}
          <TeamGrowthSimulator
            currentMembers={team.current_members_count}
            currentQuantity={team.combined_quantity_kg}
            cropName={team.crop}
          />

          {/* What-If Simulator */}
          <WhatIfSimulator
            produceQuantity={500}
            cropName={team.crop}
            defaultSoloPrice={24}
            defaultTeamPrice={29}
          />
        </div>
      </div>

      {/* AI Explanation Modal */}
      {showAiModal && (
        <AIExplanationModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          queryType="team_recommendation"
          targetId={team.id}
        />
      )}
    </div>
  );
}
