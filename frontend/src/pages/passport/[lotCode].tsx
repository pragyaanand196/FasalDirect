import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  FileCheck2,
  ShieldCheck,
  Award,
  Users,
  MapPin,
  Calendar,
  Layers,
  Sprout,
  CheckCircle2,
  QrCode
} from "lucide-react";

export default function LotPassportPage() {
  const router = useRouter();
  const { lotCode } = router.query;

  const [passport, setPassport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lotCode) {
      api.getLotPassport(lotCode as string)
        .then((data) => setPassport(data))
        .catch((err) => setError(err.message || "Passport not found"))
        .finally(() => setLoading(false));
    }
  }, [lotCode]);

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-xs">Verifying Digital Lot Passport...</div>;
  }

  if (error || !passport) {
    return (
      <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8 max-w-lg mx-auto">
        <FileCheck2 className="w-12 h-12 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Lot Passport Not Found</h3>
        <p className="text-xs text-slate-500">{error || "Could not retrieve certificate."}</p>
        <Link href="/" className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl">
          Return to FasalDirect
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Breadcrumb
        backHref="/dashboard"
        backLabel="Dashboard"
        items={[{ label: `Lot Passport (${passport.lot_code})` }]}
      />

      {/* Official Certificate Card */}
      <div className="bg-white rounded-3xl border-2 border-agri-600 shadow-lg p-6 sm:p-10 space-y-6 relative overflow-hidden">
        {/* Certificate Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-agri-100 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-agri-600 to-agri-800 flex items-center justify-center text-white shadow-sm">
              <Award className="w-7 h-7 text-ochre-300" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-agri-800">
                Official Provenance Certificate
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Digital Collective Lot Passport
              </h1>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Unique Lot Code</span>
            <span className="text-base sm:text-lg font-mono font-black text-agri-900 bg-agri-50 px-3 py-1 rounded-xl border border-agri-200 inline-block">
              {passport.lot_code}
            </span>
          </div>
        </div>

        {/* Core Certificate Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 font-semibold block text-[11px]">Crop & Quality Grade</span>
            <p className="text-base font-black text-slate-900">{passport.crop}</p>
            <span className="text-[10px] font-bold text-agri-700 bg-agri-100 px-2 py-0.5 rounded inline-block">
              Grade {passport.grade} Authenticated
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 font-semibold block text-[11px]">Total Aggregated Volume</span>
            <p className="text-base font-black text-agri-950">{passport.total_kg.toLocaleString()} kg</p>
            <span className="text-[10px] text-slate-500 block">Single consolidated batch</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 font-semibold block text-[11px]">Participating Farmers</span>
            <p className="text-base font-black text-slate-900">{passport.farmer_count} Farmers</p>
            <span className="text-[10px] text-slate-500 block">4-Farmer Collective Team</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 font-semibold block text-[11px]">Harvest Window</span>
            <p className="text-sm font-bold text-slate-800">{passport.harvest_window}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 font-semibold block text-[11px]">Procured By</span>
            <p className="text-sm font-bold text-slate-800">{passport.buyer_name || "Verified Bulk Buyer"}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-slate-400 font-semibold block text-[11px]">Agreed Settlement Rate</span>
            <p className="text-base font-black text-emerald-700">₹{passport.final_price}/kg</p>
          </div>
        </div>

        {/* Central Pickup Depot */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center space-x-3">
          <MapPin className="w-5 h-5 text-ochre-600 shrink-0" />
          <div>
            <span className="font-bold text-slate-900">Consolidated Loading Depot:</span>
            <p className="text-slate-600 mt-0.5">{passport.collection_point}</p>
          </div>
        </div>

        {/* QR Verification Block */}
        <div className="p-4 bg-agri-50/70 rounded-2xl border border-agri-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-agri-950">
              <ShieldCheck className="w-4 h-4 text-agri-700" />
              <span>Immutable Provenance Traceability</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              This digital passport certifies that this agricultural lot was collectively aggregated by verified smallholder farmers with direct rupee settlement.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-agri-200 shrink-0">
            <QrCode className="w-6 h-6 text-agri-800" />
            <div className="text-[10px] text-slate-500 font-mono leading-tight">
              <span>QR Traceable</span><br />
              <strong className="text-slate-800">FasalDirect Verified</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
