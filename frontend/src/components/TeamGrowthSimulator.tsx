import React from "react";
import { Users, TrendingUp, Sparkles, AlertCircle } from "lucide-react";

interface TeamGrowthSimulatorProps {
  currentMembers: number;
  currentQuantity: number;
  cropName: string;
  projectedQuantity?: number;
  highestPrice?: number;
}

export const TeamGrowthSimulator: React.FC<TeamGrowthSimulatorProps> = ({
  currentMembers,
  currentQuantity,
  cropName,
  projectedQuantity,
  highestPrice = 30.0,
}) => {
  const slotsLeft = Math.max(0, 4 - currentMembers);
  const avgPerMember = currentMembers > 0 ? currentQuantity / currentMembers : 500;
  const targetQuantity = projectedQuantity || Math.round(currentQuantity + (slotsLeft * avgPerMember));

  const currentEstValue = Math.round(currentQuantity * 24);
  const projectedEstValue = Math.round(targetQuantity * highestPrice);
  const potentialGain = Math.max(0, projectedEstValue - currentEstValue);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-agri-100 flex items-center justify-center text-agri-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Team Growth Simulator</h3>
            <p className="text-xs text-slate-500">Forecast batch potential when remaining slots are filled</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-ochre-100 text-ochre-800">
          {slotsLeft} Slot{slotsLeft !== 1 ? 's' : ''} Open
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 block">Current Lot Size</span>
          <span className="text-lg font-black text-slate-800">{currentQuantity.toLocaleString()} kg</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">{currentMembers} of 4 Farmers</span>
        </div>

        <div className="p-3.5 bg-agri-50 rounded-xl border border-agri-200">
          <span className="text-[11px] font-semibold text-agri-700 block">Projected 4-Farmer Lot</span>
          <span className="text-lg font-black text-agri-950">~{targetQuantity.toLocaleString()} kg</span>
          <span className="text-[11px] text-agri-600 block mt-0.5">+{(targetQuantity - currentQuantity).toLocaleString()} kg Aggregated</span>
        </div>

        <div className="p-3.5 bg-ochre-50 rounded-xl border border-ochre-200">
          <span className="text-[11px] font-semibold text-ochre-700 block">Potential Batch Value</span>
          <span className="text-lg font-black text-ochre-900">₹{projectedEstValue.toLocaleString()}</span>
          <span className="text-[11px] text-ochre-600 block mt-0.5">@ ~₹{highestPrice}/kg bulk rate</span>
        </div>
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Adding compatible neighboring {cropName} farmers into the final {slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} expands your collective batch to {targetQuantity.toLocaleString()} kg, unlocking institutional buyers who require full truckload procurement.
        </span>
      </div>
    </div>
  );
};
