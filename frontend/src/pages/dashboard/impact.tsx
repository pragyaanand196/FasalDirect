import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  TrendingUp,
  Truck,
  Leaf,
  Fuel,
  Globe2,
  Users,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function SustainabilityImpactPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const sData = await api.getMySales();
        setSales(sData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalAggregatedKg = sales.reduce((acc, s) => acc + (s.total_quantity_kg || 0), 0);
  const completedDeals = sales.length;
  // For each completed 4-farmer batch, 3 individual trips are eliminated
  const tripsAvoided = completedDeals * 3;
  const kmSaved = tripsAvoided * 45; // average 45km round trip
  const dieselSavedLiters = Math.round(kmSaved * 0.09); // ~0.09 L/km
  const co2AvoidedKg = Math.round(dieselSavedLiters * 2.68); // ~2.68 kg CO2/L
  const freightSavedRs = tripsAvoided * 850; // ~₹850 net freight savings per avoided trip

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb
        backHref="/dashboard"
        backLabel="Dashboard"
        items={[{ label: "Sustainability & Impact" }]}
      />

      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Leaf className="w-6 h-6 text-agri-700" />
          <span>Collective Sustainability & Logistical Impact</span>
        </h1>
        <p className="text-xs text-slate-500">
          Environmental and logistics efficiency calculated from your genuine collective aggregation batches.
        </p>
      </div>

      {/* Impact Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-agri-700">
            <span className="text-xs font-semibold text-slate-500">Trips Avoided</span>
            <Truck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900">{tripsAvoided}</p>
          <p className="text-[11px] text-slate-400">Single truck consolidated</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-ochre-600">
            <span className="text-xs font-semibold text-slate-500">Distance Saved</span>
            <Globe2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900">{kmSaved.toLocaleString()} km</p>
          <p className="text-[11px] text-slate-400">Optimized logistics route</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold text-slate-500">Diesel Saved</span>
            <Fuel className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900">{dieselSavedLiters} L</p>
          <p className="text-[11px] text-slate-400">Reduced vehicle fuel</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-agri-600">
            <span className="text-xs font-semibold text-slate-500">CO₂ Avoided</span>
            <Leaf className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900">{co2AvoidedKg} kg</p>
          <p className="text-[11px] text-slate-400">Emissions reduced</p>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-agri-700" />
          <span>Why Collective Transport is Cleaner & Cheaper</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800">Old Solo Mandi Model</h4>
            <p className="leading-relaxed">
              4 smallholder farmers in the same village each rent separate small pick-up tempos, burn individual diesel for 4 separate 45km round trips, and pay independent tolls and loading fees.
            </p>
          </div>

          <div className="p-4 bg-agri-50 border border-agri-200 rounded-xl space-y-2">
            <h4 className="font-bold text-agri-950">FasalDirect 4-Farmer Model</h4>
            <p className="leading-relaxed text-agri-900">
              Produce is combined at one Smart Collection Point centroid. 1 consolidated truck picks up all 4 batches at once, cutting freight costs by 50% and eliminating 3 vehicle runs.
            </p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-agri-800 to-agri-950 text-white rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-ochre-300 shrink-0" />
            <span>
              Estimated combined freight savings generated: <strong className="text-ochre-300 font-bold">₹{freightSavedRs.toLocaleString()}</strong> across {completedDeals} completed collective batches.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
