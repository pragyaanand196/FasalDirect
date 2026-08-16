import React from "react";
import { Lock, Unlock, ShoppingBag, MapPin, Calendar, ArrowRight } from "lucide-react";

interface BuyerUnlockProps {
  buyerName: string;
  location: string;
  targetQuantityKg: number;
  currentQuantityKg: number;
  kgNeeded: number;
  progressPercent: number;
  offeredPrice: number;
  isUnlocked: boolean;
  targetDate?: string;
  onInviteFarmer?: () => void;
}

export const BuyerUnlockCard: React.FC<BuyerUnlockProps> = ({
  buyerName,
  location,
  targetQuantityKg,
  currentQuantityKg,
  kgNeeded,
  progressPercent,
  offeredPrice,
  isUnlocked,
  targetDate,
  onInviteFarmer,
}) => {
  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isUnlocked
        ? "bg-agri-50/70 border-agri-300 shadow-xs"
        : "bg-white border-slate-200 shadow-2xs hover:border-slate-300"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isUnlocked ? "bg-agri-600 text-white" : "bg-slate-100 text-slate-500"
          }`}>
            {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>{buyerName}</span>
              {isUnlocked && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-agri-200 text-agri-900">
                  Unlocked
                </span>
              )}
            </h4>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {location}</span>
              {targetDate && (
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> Delivery by {targetDate}</span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-slate-500 block">Offered Rate</span>
          <span className="text-base font-black text-agri-800">₹{offeredPrice}/kg</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3.5">
        <div className="flex items-center justify-between text-xs font-semibold mb-1">
          <span className="text-slate-600">
            {currentQuantityKg.toLocaleString()} / {targetQuantityKg.toLocaleString()} kg
          </span>
          <span className={isUnlocked ? "text-agri-700 font-bold" : "text-ochre-700 font-bold"}>
            {isUnlocked ? "Target Met!" : `${kgNeeded.toLocaleString()} kg more needed`}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isUnlocked ? "bg-agri-600" : "bg-ochre-500"
            }`}
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>
      </div>

      {!isUnlocked && onInviteFarmer && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Fill empty team slot to unlock this premium deal
          </span>
          <button
            onClick={onInviteFarmer}
            className="text-xs font-bold text-agri-700 hover:text-agri-800 flex items-center gap-1"
          >
            <span>Find Neighbor Farmer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
