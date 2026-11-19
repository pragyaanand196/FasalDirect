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
import { HowItWorksCarousel } from "@/components/HowItWorksCarousel";

export default function LandingPage() {
  return (
    <div className="space-y-16 sm:space-y-20 lg:space-y-24 py-2 sm:py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-agri-900 via-agri-800 to-agri-950 text-white p-6 sm:p-10 lg:p-12 xl:p-14 shadow-xl">
        <div className="relative z-10 max-w-xl md:max-w-[58%] lg:max-w-2xl xl:max-w-3xl space-y-5 lg:space-y-6">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-agri-700/60 border border-agri-500/40 text-ochre-300 text-xs sm:text-sm font-bold tracking-wide uppercase text-center">
            <span>COLLECTIVE FARMING, BETTER OPPORTUNITIES</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-black tracking-tight text-white leading-tight xl:leading-[1.18]">
            Stop Selling Alone at Distress Mandi Prices. <br className="hidden sm:inline" />
            <span className="text-ochre-400">Team Up with 3 Neighbors</span> for Direct Bulk Rates.
          </h1>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-1 sm:pt-2">
            <Link
              href="/register?role=farmer"
              className="px-7 py-4 rounded-xl bg-ochre-500 hover:bg-ochre-400 text-slate-950 font-black text-sm sm:text-base shadow-lg hover:shadow-xl transition-all flex items-center gap-2.5"
            >
              <Sprout className="w-5 h-5 text-slate-900" />
              <span>Register as Farmer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/register?role=buyer"
              className="px-7 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm sm:text-base transition-all flex items-center gap-2.5"
            >
              <Building2 className="w-5 h-5 text-ochre-300" />
              <span>Register as Buyer</span>
            </Link>

            <Link
              href="/login"
              className="px-5 py-4 text-sm sm:text-base font-semibold text-agri-200 hover:text-white transition-colors"
            >
              Existing Member? Login →
            </Link>
          </div>

          {/* Mobile Stacked Produce Image (< md screens) */}
          <div className="block md:hidden pt-2">
            <div className="w-full h-48 sm:h-56 rounded-2xl overflow-hidden border-t-4 border-ochre-400 shadow-md">
              <img
                src="/images/mandi-produce.jpg"
                alt="Fresh Indian agricultural market produce"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Core Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-8 pt-5 sm:pt-6 border-t border-agri-700/60 text-xs sm:text-sm text-agri-100 font-medium">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-ochre-400 shrink-0" />
              <span>Strict 4-Farmer Team Limit</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-ochre-400 shrink-0" />
              <span>50% Shared Freight Savings</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-ochre-400 shrink-0" />
              <span>Direct Proportional Wallet Settlement</span>
            </div>
          </div>
        </div>

        {/* Right Hero Image with Angled Ochre Divider Line matching required reference */}
        <div
          className="hidden md:block absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0"
          aria-hidden="true"
        >
          {/* Clipped Image Container */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              clipPath: "polygon(71.7% 0%, 100% 0%, 100% 100%, 61.9% 100%)",
            }}
          >
            <img
              src="/images/mandi-produce.jpg"
              alt="Fresh Indian agricultural market produce"
              className="absolute inset-y-0 right-0 w-[42%] xl:w-[40%] h-full object-cover object-center"
            />
          </div>

          {/* Angled Ochre Divider Line matching required reference */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <line
              x1="71.7"
              y1="0"
              x2="61.9"
              y2="100"
              stroke="#f1ad3c"
              strokeWidth="5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </section>

      {/* The 4-Step Collective Workflow — Centre-focused Carousel */}
      <section className="space-y-8 lg:space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-2.5">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            How 4-Farmer Collective Selling Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            A practical, transparent platform designed specifically for Indian smallholder farmers.
          </p>
        </div>

        {/* Carousel wrapper — overflow-hidden prevents adjacent-card peeks from
            causing horizontal scroll while still allowing the visual peek effect */}
        <div className="w-full overflow-hidden">
          <HowItWorksCarousel />
        </div>
      </section>

      {/* Interactive What-If Simulator Section */}
      <section className="space-y-6 lg:space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Compare Your Individual and Group Earnings
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Test the benefit of pooling produce and splitting freight costs.
          </p>
        </div>

        <div className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
          <WhatIfSimulator produceQuantity={500} cropName="Onion" defaultSoloPrice={24} defaultTeamPrice={29} />
        </div>
      </section>

      {/* Core Innovations Section */}
      <section className="bg-slate-100/80 rounded-3xl p-8 sm:p-12 lg:p-14 xl:p-16 border border-slate-200 space-y-8 lg:space-y-10">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-agri-700">Platform Features</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Built for Real Field Realities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div className="bg-white p-6 sm:p-7 lg:p-8 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5 flex flex-col justify-start">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-agri-50 text-agri-700 flex items-center justify-center">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900">Buyer Unlock Engine</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              If an institutional buyer requires 2,000 kg, the platform calculates exactly how much produce is needed and helps your team invite the right neighbor to unlock the deal.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-7 lg:p-8 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5 flex flex-col justify-start">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-ochre-50 text-ochre-700 flex items-center justify-center">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900">Smart Collection Centroid</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Calculates the optimal pickup depot between all 4 member farms and the buyer route using OpenStreetMap, minimizing local loading delays.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-7 lg:p-8 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5 flex flex-col justify-start">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900">Digital Collective Lot Passport</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every completed collective batch generates a verifiable digital passport with traceability, grade authenticity, and transparent provenance.
            </p>
          </div>
        </div>
      </section>

      {/* Role Selection Call to Action */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200 shadow-sm text-center w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto space-y-6 lg:space-y-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          Ready to Get Started?
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Create your account today. Enter your produce or buying demand to start participating in the verified FasalDirect collective network.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl lg:max-w-4xl mx-auto pt-2">
          <Link
            href="/register?role=farmer"
            className="p-6 sm:p-8 rounded-2xl border-2 border-agri-600 bg-agri-50 hover:bg-agri-100 text-agri-950 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-black text-lg sm:text-xl text-agri-900">Farmer Registration</span>
              <ArrowRight className="w-5 h-5 text-agri-700 group-hover:translate-x-1.5 transition-transform" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">List produce, find 3 neighbors, and unlock bulk pricing.</p>
          </Link>

          <Link
            href="/register?role=buyer"
            className="p-6 sm:p-8 rounded-2xl border-2 border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-900 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-black text-lg sm:text-xl text-slate-900">Buyer Registration</span>
              <ArrowRight className="w-5 h-5 text-slate-700 group-hover:translate-x-1.5 transition-transform" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Post crop demand and buy uniform 4-farmer collective lots.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
