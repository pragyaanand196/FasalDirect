import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AIExplanationModal } from "@/components/AIExplanationModal";
import {
  Users,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  HelpCircle,
  X,
  ArrowRight,
  TrendingUp
} from "lucide-react";

export default function FindMyTeamPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [produceLots, setProduceLots] = useState<any[]>([]);
  const [selectedProduceId, setSelectedProduceId] = useState<number | null>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Join Request Modal
  const [joinModalTeam, setJoinModalTeam] = useState<any | null>(null);
  const [joinMessage, setJoinMessage] = useState("");
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);

  // AI Explanation Modal
  const [aiModalTeam, setAiModalTeam] = useState<any | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const pList = await api.getMyProduce();
        const available = pList.filter((p: any) => p.status === "available");
        setProduceLots(available);

        let initialProduceId = null;
        if (router.query.produce_id) {
          initialProduceId = Number(router.query.produce_id);
        } else if (available.length > 0) {
          initialProduceId = available[0].id;
        }

        setSelectedProduceId(initialProduceId);

        if (initialProduceId) {
          const opps = await api.findCompatibleTeams(initialProduceId);
          setOpportunities(opps);
        } else {
          const recent = await api.getRecentlyCreatedTeams();
          setOpportunities(recent);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router.query.produce_id]);

  const handleSelectProduce = async (pId: number) => {
    setSelectedProduceId(pId);
    try {
      setLoading(true);
      setError(null);
      const opps = await api.findCompatibleTeams(pId);
      setOpportunities(opps);
    } catch (err: any) {
      setError(err.message || "Failed to load compatible teams.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendJoinRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinModalTeam || !selectedProduceId) return;

    try {
      setIsSubmittingJoin(true);
      setError(null);
      await api.createJoinRequest(joinModalTeam.team_id, {
        team_id: joinModalTeam.team_id,
        produce_lot_id: selectedProduceId,
        message: joinMessage || "Ready to aggregate and sell collectively.",
      });

      setSuccessMsg(`Join request submitted to representative of '${joinModalTeam.name}'! You will receive a notification upon review.`);
      setJoinModalTeam(null);
      setJoinMessage("");
    } catch (err: any) {
      setError(err.message || "Could not submit join request.");
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  const selectedProduce = produceLots.find((p) => p.id === selectedProduceId);

  return (
    <div className="space-y-6">
      <Breadcrumb
        backHref="/dashboard"
        backLabel="Dashboard"
        items={[{ label: "Find My Team" }]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-agri-700" />
            <span>Smart Team Opportunity Engine</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked matching based on crop, quality grade, harvest dates, and logistics proximity.
          </p>
        </div>

        <Link
          href="/dashboard/teams/create"
          className="px-4 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Team</span>
        </Link>
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

      {/* Produce Selector Ribbon */}
      {produceLots.length > 0 ? (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Select Your Produce Lot to Match:
          </span>
          <div className="flex flex-wrap gap-2">
            {produceLots.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectProduce(p.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                  selectedProduceId === p.id
                    ? "bg-agri-700 text-white border-agri-800 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{p.crop} ({p.variety}) - {p.quantity_kg} kg Grade {p.grade}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-ochre-50 border border-ochre-200 rounded-2xl text-xs text-ochre-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-ochre-700 shrink-0" />
            <span>You have no available produce lots listed. Add a crop produce lot to activate personalized compatibility matching.</span>
          </div>
          <Link href="/dashboard/produce" className="font-bold underline text-ochre-950">Add Produce</Link>
        </div>
      )}

      {/* Compatible Teams Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            {selectedProduce
              ? `Compatible Teams for ${selectedProduce.crop} (${selectedProduce.quantity_kg} kg)`
              : "Recently Created Compatible Teams in Region"}
          </h2>
          <span className="text-xs text-slate-400">
            {opportunities.length} Team{opportunities.length !== 1 ? 's' : ''} Found
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            Calculating multidimensional compatibility scores...
          </div>
        ) : opportunities.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No compatible open teams currently found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are no existing open teams matching your crop and harvest timeline in the database right now. Be the first to create a team in your area!
            </p>
            <Link
              href="/dashboard/teams/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" /> Create New 4-Farmer Team
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((team) => (
              <div
                key={team.team_id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-agri-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-black text-slate-900">{team.name}</h3>
                      <p className="text-xs font-semibold text-agri-700 mt-0.5">
                        {team.crop} ({team.variety}) • Grade {team.grade}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Match Score</span>
                      <span className={`text-base font-black px-2 py-0.5 rounded-lg inline-block ${
                        team.compatibility_percentage >= 85
                          ? "bg-emerald-100 text-emerald-800"
                          : team.compatibility_percentage >= 75
                          ? "bg-agri-100 text-agri-800"
                          : "bg-ochre-100 text-ochre-800"
                      }`}>
                        {team.compatibility_percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Badges / Metrics */}
                  <div className="grid grid-cols-3 gap-2 my-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Capacity</span>
                      <span className="font-bold text-slate-800">{team.current_members_count}/4 Farmers</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Combined kg</span>
                      <span className="font-bold text-slate-800">{team.combined_quantity_kg.toLocaleString()} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Proximity</span>
                      <span className="font-bold text-slate-800">~{team.distance_km || 15} km</span>
                    </div>
                  </div>

                  {/* Natural Language Explanation */}
                  <p className="text-xs text-slate-600 bg-agri-50/50 p-2.5 rounded-lg border border-agri-100 leading-relaxed">
                    {team.explanation}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setAiModalTeam(team)}
                    className="text-xs font-semibold text-slate-600 hover:text-agri-800 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-agri-600" />
                    <span>Explain Match</span>
                  </button>

                  <button
                    onClick={() => setJoinModalTeam(team)}
                    disabled={!selectedProduceId}
                    className="px-4 py-2 bg-agri-700 hover:bg-agri-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Request to Join</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Join Request Modal */}
      {joinModalTeam && selectedProduce && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <button
              onClick={() => setJoinModalTeam(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-black text-slate-900">
                Request to Join Team '{joinModalTeam.name}'
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Send a formal application to Team Representative {joinModalTeam.representative_name}.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p><strong>Your Produce:</strong> {selectedProduce.crop} ({selectedProduce.variety}) Grade {selectedProduce.grade}</p>
              <p><strong>Contributed Volume:</strong> {selectedProduce.quantity_kg} kg</p>
              <p><strong>Compatibility:</strong> {joinModalTeam.compatibility_percentage}% Match</p>
            </div>

            <form onSubmit={handleSendJoinRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message for Representative (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Produce is harvested, sorted Grade A, and ready for central pickup depot."
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setJoinModalTeam(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingJoin}
                  className="px-5 py-2 bg-agri-700 hover:bg-agri-800 disabled:bg-agri-400 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {isSubmittingJoin ? "Sending..." : "Submit Join Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Explanation Modal */}
      {aiModalTeam && (
        <AIExplanationModal
          isOpen={!!aiModalTeam}
          onClose={() => setAiModalTeam(null)}
          queryType="team_recommendation"
          targetId={aiModalTeam.team_id}
          produceId={selectedProduceId || undefined}
        />
      )}
    </div>
  );
}
