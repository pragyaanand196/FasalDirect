import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  Users,
  Plus,
  Layers,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function CreateTeamPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [produceLots, setProduceLots] = useState<any[]>([]);
  const [selectedLotId, setSelectedLotId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState("");
  const [targetSellingDate, setTargetSellingDate] = useState(
    new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduce = async () => {
      try {
        setLoading(true);
        const data = await api.getMyProduce();
        const available = data.filter((p: any) => p.status === "available");
        setProduceLots(available);
        if (available.length > 0) {
          setSelectedLotId(available[0].id);
          setTeamName(`${available[0].crop} Collective Alliance`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProduce();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLotId || !teamName) {
      setError("Please select a produce lot and provide a team name.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await api.createTeam({
        name: teamName.trim(),
        produce_lot_id: selectedLotId,
        target_selling_date: targetSellingDate,
      });

      router.push(`/dashboard/teams/${res.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Breadcrumb
        backHref="/dashboard/teams"
        backLabel="Find Teams"
        items={[{ label: "Create 4-Farmer Team" }]}
      />

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-agri-700" />
            <span>Form a New 4-Farmer Collective Team</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            As the team creator, you will be the initial Team Representative, authorized to review join requests and negotiate bulk deals with buyers.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {produceLots.length === 0 ? (
          <div className="p-6 bg-ochre-50 border border-ochre-200 rounded-2xl text-center space-y-3">
            <Layers className="w-10 h-10 text-ochre-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No Available Produce Lots Found</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              You need at least one uncommitted produce lot to seed a new team.
            </p>
            <Link
              href="/dashboard/produce"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-agri-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Produce Lot First
            </Link>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Your Seeding Produce Lot *
              </label>
              <select
                value={selectedLotId || ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedLotId(id);
                  const sel = produceLots.find((p) => p.id === id);
                  if (sel) {
                    setTeamName(`${sel.crop} Collective Alliance`);
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
              >
                {produceLots.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.crop} ({p.variety}) - {p.quantity_kg} kg Grade {p.grade} (Min ₹{p.min_price_per_kg}/kg)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Team Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Nashik Onion Alliance"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Selling Date *
              </label>
              <input
                type="date"
                required
                value={targetSellingDate}
                onChange={(e) => setTargetSellingDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-agri-500"
              />
            </div>

            <div className="p-4 bg-agri-50 border border-agri-200 rounded-xl text-xs text-agri-950 space-y-1.5">
              <div className="flex items-center space-x-1.5 font-bold text-agri-900">
                <ShieldCheck className="w-4 h-4 text-agri-700" />
                <span>Representative Governance Model</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                As Representative, you will lead buyer negotiations and approve incoming farmer join requests (strictly max 4 members). Final sale confirmations will require majority approval from all team members.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-agri-700 hover:bg-agri-800 disabled:bg-agri-400 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Creating Team Hub..." : "Create Team & Open for 3 Members"}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
