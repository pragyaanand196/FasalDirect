import React from "react";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  Truck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Wallet,
  Scale,
  MapPin,
  FileCheck2,
  Building2,
  Sprout
} from "lucide-react";
import { WhatIfSimulator } from "@/components/WhatIfSimulator";

export default function LandingPage() {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-agri-900 via-agri-800 to-agri-950 text-white p-8 sm:p-12 lg:p-16 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-agri-700/60 border border-agri-500/40 text-ochre-300 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Farmer-First Collective Produce Aggregation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Stop Selling Alone at Distress Mandi Prices. <br className="hidden sm:inline" />
            <span className="text-ochre-400">Team Up with 3 Neighbors</span> for Direct Bulk Rates.
          </h1>

          <p className="text-sm sm:text-base text-agri-100/90 leading-relaxed font-normal">
            FasalDirect connects up to 4 compatible local farmers growing identical crop and grade. Combine your produce into a commercial lot, share one transport truck, negotiate directly with institutional buyers, and get guaranteed automated payouts in your wallet.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/register?role=farmer"
              className="px-6 py-3.5 rounded-xl bg-ochre-500 hover:bg-ochre-400 text-slate-950 font-black text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Sprout className="w-4 h-4 text-slate-900" />
              <span>Register as Farmer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/register?role=buyer"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-ochre-300" />
              <span>Register as Buyer</span>
            </Link>

            <Link
              href="/login"
              className="px-5 py-3.5 text-sm font-semibold text-agri-200 hover:text-white transition-colors"
            >
              Existing Member? Login →
            </Link>
          </div>

          {/* Core Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-agri-700/60 text-xs text-agri-100">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-ochre-400 shrink-0" />
              <span>Strict 4-Farmer Team Limit</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-ochre-400 shrink-0" />
              <span>50% Shared Freight Savings</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-ochre-400 shrink-0" />
              <span>Direct Proportional Wallet Settlement</span>
            </div>
          </div>
        </div>

        {/* Decorative subtle ambient graphic */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
          <Sprout className="w-96 h-96 text-white" />
        </div>
      </section>

      {/* The 4-Step Collective Workflow */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            How 4-Farmer Collective Selling Works
          </h2>
          <p className="text-sm text-slate-600">
            A practical, transparent platform designed specifically for Indian smallholder farmers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <span className="w-8 h-8 rounded-full bg-agri-100 text-agri-800 font-bold text-sm flex items-center justify-center mb-4">
              1
            </span>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Submit Your Produce</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your crop, variety, quantity (e.g. 500 kg), grade, harvest date, and farm village. Works smoothly even in offline mode.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <span className="w-8 h-8 rounded-full bg-agri-100 text-agri-800 font-bold text-sm flex items-center justify-center mb-4">
              2
            </span>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Smart Team Matching</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our Opportunity Engine matches you with up to 3 nearby farmers growing the same crop. Review compatibility scores and join request.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <span className="w-8 h-8 rounded-full bg-agri-100 text-agri-800 font-bold text-sm flex items-center justify-center mb-4">
              3
            </span>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Collective Bargaining</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The Team Representative negotiates bulk pricing with verified buyers. All 4 members vote on final offer acceptance before confirming.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <span className="w-8 h-8 rounded-full bg-agri-100 text-agri-800 font-bold text-sm flex items-center justify-center mb-4">
              4
            </span>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Automatic Settlement</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Once buyer completes payment, our settlement engine calculates every farmer’s exact rupee share and instantly credits your wallet.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive What-If Simulator Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            See Your Collective Advantage in Numbers
          </h2>
          <p className="text-sm text-slate-600">
            Test the benefit of pooling produce and splitting freight costs.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <WhatIfSimulator produceQuantity={500} cropName="Onion" defaultSoloPrice={24} defaultTeamPrice={29} />
        </div>
      </section>

      {/* Core Innovations Section */}
      <section className="bg-slate-100/80 rounded-3xl p-8 sm:p-12 border border-slate-200 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-agri-700">Platform Features</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Built for Real Field Realities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-agri-50 text-agri-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Buyer Unlock Engine</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an institutional buyer requires 2,000 kg, the platform calculates exactly how much produce is needed and helps your team invite the right neighbor to unlock the deal.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-ochre-50 text-ochre-700 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Smart Collection Centroid</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculates the optimal pickup depot between all 4 member farms and the buyer route using OpenStreetMap, minimizing local loading delays.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Digital Collective Lot Passport</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every completed collective batch generates a verifiable digital passport with traceability, grade authenticity, and transparent provenance.
            </p>
          </div>
        </div>
      </section>

      {/* Role Selection Call to Action */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          Ready to Get Started?
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Create your account today. Enter your produce or buying demand to start participating in the verified FasalDirect collective network.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <Link
            href="/register?role=farmer"
            className="p-5 rounded-2xl border-2 border-agri-600 bg-agri-50 hover:bg-agri-100 text-agri-950 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-base text-agri-900">Farmer Registration</span>
              <ArrowRight className="w-4 h-4 text-agri-700 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-slate-600">List produce, find 3 neighbors, and unlock bulk pricing.</p>
          </Link>

          <Link
            href="/register?role=buyer"
            className="p-5 rounded-2xl border-2 border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-900 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-base text-slate-900">Buyer Registration</span>
              <ArrowRight className="w-4 h-4 text-slate-700 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-slate-600">Post crop demand and buy uniform 4-farmer collective lots.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
