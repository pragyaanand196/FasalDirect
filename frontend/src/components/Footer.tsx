import React from "react";
import Link from "next/link";
import { Sprout, ShieldCheck, Truck, Scale, Award } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-agri-600 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5 text-ochre-300" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Fasal<span className="text-ochre-400">Direct</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering smallholder Indian farmers through 4-farmer collective aggregation, shared freight logistics, direct buyer bargaining, and automated rupee-for-rupee wallet settlements.
            </p>
            <div className="flex items-center space-x-2 text-xs text-agri-400 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero middlemen • 100% Direct Payouts</span>
            </div>
          </div>

          {/* Col 2: Farmer Collective Innovation */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Collective Selling</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><Link href="/register" className="hover:text-white transition-colors">Create or Join 4-Farmer Team</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">What-If Benefit Simulator</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Smart Collection Centroid</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Digital Lot Passport Traceability</Link></li>
            </ul>
          </div>

          {/* Col 3: Institutional Buyers */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Institutional Buyers</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><Link href="/register" className="hover:text-white transition-colors">Direct Farm Aggregation</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Post Crop Bulk Demand</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Batch Quality Assurance</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Escrow-Backed Settlement</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform Standards */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Platform Assurance</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start space-x-2">
                <Scale className="w-4 h-4 text-ochre-400 shrink-0 mt-0.5" />
                <span>Transparent mathematical score based on crop, grade, harvest timing, and location.</span>
              </div>
              <div className="flex items-start space-x-2">
                <Truck className="w-4 h-4 text-ochre-400 shrink-0 mt-0.5" />
                <span>Single consolidated vehicle freight saving up to 50% on transport.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} FasalDirect Platform. Built for Indian smallholder farmers.</p>
          <div className="flex items-center space-x-4">
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
