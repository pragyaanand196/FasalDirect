import React from "react";
import Link from "next/link";
import { Sprout, ShieldCheck, Truck, Scale, Award } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 bg-slate-900 text-slate-300 pt-10 sm:pt-12 pb-8 sm:pb-9 border-t border-slate-800">
      <div className="w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 lg:gap-8 xl:gap-10 pb-8 sm:pb-10 border-b border-slate-800">
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-3.5 lg:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-agri-600 flex items-center justify-center text-white shrink-0">
                <Sprout className="w-5 h-5 text-ochre-300" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Fasal<span className="text-ochre-400">Direct</span>
              </span>
            </div>
            <p className="text-xs sm:text-[12.5px] text-slate-400 leading-relaxed">
              Empowering smallholder Indian farmers through 4-farmer collective aggregation, shared freight logistics, direct buyer bargaining, and automated rupee-for-rupee wallet settlements.
            </p>
            <div className="flex items-center space-x-2 text-xs sm:text-[12.5px] text-agri-400 pt-1">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Zero middlemen • 100% Direct Payouts</span>
            </div>
          </div>

          {/* Col 2: Farmer Collective Innovation */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-[13.5px] font-bold uppercase tracking-wider text-slate-200 mb-3 sm:mb-3.5">Collective Selling</h4>
            <ul className="space-y-2 text-xs sm:text-[12.5px] text-slate-400">
              <li><Link href="/register" className="hover:text-white transition-colors block py-0.5">Create or Join 4-Farmer Team</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors block py-0.5">What-If Benefit Simulator</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors block py-0.5">Smart Collection Centroid</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors block py-0.5">Digital Lot Passport Traceability</Link></li>
            </ul>
          </div>

          {/* Col 3: Institutional Buyers */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-[13.5px] font-bold uppercase tracking-wider text-slate-200 mb-3 sm:mb-3.5">Institutional Buyers</h4>
            <ul className="space-y-2 text-xs sm:text-[12.5px] text-slate-400">
              <li><Link href="/register" className="hover:text-white transition-colors block py-0.5">Direct Farm Aggregation</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors block py-0.5">Post Crop Bulk Demand</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors block py-0.5">Batch Quality Assurance</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors block py-0.5">Escrow-Backed Settlement</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform Standards */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-[13.5px] font-bold uppercase tracking-wider text-slate-200 mb-3 sm:mb-3.5">Platform Assurance</h4>
            <div className="space-y-2.5 text-xs sm:text-[12.5px] text-slate-400">
              <div className="flex items-start space-x-2.5">
                <Scale className="w-4 h-4 text-ochre-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">Transparent mathematical score based on crop, grade, harvest timing, and location.</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <Truck className="w-4 h-4 text-ochre-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">Single consolidated vehicle freight saving up to 50% on transport.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 sm:pt-7 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-[12px] text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} FasalDirect Platform. Built for Indian smallholder farmers.</p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span>Offline PWA Ready</span>
            <span>•</span>
            <span>Digital Lot Verification</span>
            <span>•</span>
            <span>Direct Bank / UPI Settlement</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
