import React, { useState } from "react";
import { TrendingUp, Truck, ShieldAlert, ArrowRight, CheckCircle2, Sparkles, RotateCcw } from "lucide-react";

interface WhatIfSimulatorProps {
  produceQuantity?: number;
  cropName?: string;
  defaultSoloPrice?: number;
  defaultTeamPrice?: number;
}

const DEFAULT_QUANTITY = 500;
const DEFAULT_SOLO_PRICE = 24;
const DEFAULT_TEAM_PRICE = 29;

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  produceQuantity = DEFAULT_QUANTITY,
  cropName = "Produce",
  defaultSoloPrice = DEFAULT_SOLO_PRICE,
  defaultTeamPrice = DEFAULT_TEAM_PRICE,
}) => {
  const [quantity, setQuantity] = useState<number>(produceQuantity);
  const [soloPrice, setSoloPrice] = useState<number>(defaultSoloPrice);
  const [teamPrice, setTeamPrice] = useState<number>(defaultTeamPrice);
  const [distanceKm, setDistanceKm] = useState<number>(35);

  const handleReset = () => {
    setQuantity(DEFAULT_QUANTITY);
    setSoloPrice(DEFAULT_SOLO_PRICE);
    setTeamPrice(DEFAULT_TEAM_PRICE);
  };

  // Solo Calculations:
  // Farmer rents individual pickup tempo (base ₹800 + ₹18/km)
  const soloTransport = 800 + (distanceKm * 18);
  const soloGross = quantity * soloPrice;
  const soloNet = Math.max(0, soloGross - soloTransport);
  const soloPerKg = quantity > 0 ? (soloNet / quantity).toFixed(2) : "0";

  // Team Calculations:
  // Consolidated 4-farmer truck (~₹1400 base + ₹25/km) split by 4 farmers
  const totalTeamTruckCost = 1400 + (distanceKm * 25);
  const teamSharedTransport = totalTeamTruckCost / 4;
  const teamGross = quantity * teamPrice;
  const platformFee = teamGross * 0.02; // 2% platform fee
  const teamNet = Math.max(0, teamGross - teamSharedTransport - platformFee);
  const teamPerKg = quantity > 0 ? (teamNet / quantity).toFixed(2) : "0";

  const netGain = Math.round(teamNet - soloNet);
  const netGainPercent = soloNet > 0 ? Math.round(((teamNet - soloNet) / soloNet) * 100) : 0;
  const transportSaved = Math.round(soloTransport - teamSharedTransport);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 xl:p-10 shadow-sm">
      <div className="flex items-center pb-5 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-ochre-100 flex items-center justify-center text-ochre-700 shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">Group Selling Earnings Calculator</h3>
            <p className="text-xs sm:text-sm text-slate-500">Compare individual distress selling vs 4-farmer collective bargaining</p>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="my-6 bg-slate-50 p-5 sm:p-6 lg:p-7 rounded-2xl border border-slate-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Your Produce Quantity (kg)</label>
            <input
              type="number"
              min="50"
              max="10000"
              step="50"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-agri-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Solo Distress Price (₹/kg)</label>
            <input
              type="number"
              min="5"
              max="500"
              value={soloPrice}
              onChange={(e) => setSoloPrice(Number(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-agri-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">Team Bulk Buyer Price (₹/kg)</label>
            <input
              type="number"
              min="5"
              max="500"
              value={teamPrice}
              onChange={(e) => setTeamPrice(Number(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-bold text-agri-700 focus:outline-hidden focus:ring-2 focus:ring-agri-500 shadow-2xs"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 mt-4 border-t border-slate-200/60">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 hover:text-slate-900 border border-slate-300 rounded-xl shadow-2xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-agri-500 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Reset
          </button>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
        {/* Solo Card */}
        <div className="p-5 sm:p-6 lg:p-7 rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">Selling Alone</span>
            <span className="text-xs sm:text-sm font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md">High Overhead</span>
          </div>

          <div className="mt-4 space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Gross Produce Value:</span>
              <span className="font-semibold text-slate-800">₹{soloGross.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-slate-400" />
                Solo Dedicated Tempo Fare:
              </span>
              <span className="font-semibold text-rose-600">-₹{Math.round(soloTransport).toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between text-sm sm:text-base font-bold text-slate-900">
              <span>Net In-Hand Realization:</span>
              <span className="text-slate-800">₹{Math.round(soloNet).toLocaleString()}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 text-right">Effective: ₹{soloPerKg}/kg</p>
          </div>
        </div>

        {/* Team Card */}
        <div className="p-5 sm:p-6 lg:p-7 rounded-2xl border-2 border-agri-500 bg-agri-50/40 relative overflow-hidden shadow-2xs">
          <div className="absolute top-0 right-0 bg-agri-600 text-white text-[11px] sm:text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Recommended
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-agri-200">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-agri-900">In 4-Farmer Team</span>
            <span className="text-xs sm:text-sm font-bold text-agri-800 bg-agri-200/80 px-2.5 py-0.5 rounded-md">+{netGainPercent}% Higher</span>
          </div>

          <div className="mt-4 space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Bulk Buyer Gross Value:</span>
              <span className="font-semibold text-agri-950">₹{teamGross.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-agri-600" />
                Shared 1/4th Freight:
              </span>
              <span className="font-semibold text-slate-700">-₹{Math.round(teamSharedTransport).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Platform Settlement (2%):</span>
              <span className="font-semibold text-slate-700">-₹{Math.round(platformFee).toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-agri-200 flex justify-between text-sm sm:text-base font-bold text-agri-950">
              <span>Net In-Hand Realization:</span>
              <span className="text-agri-800 font-black">₹{Math.round(teamNet).toLocaleString()}</span>
            </div>
            <p className="text-xs sm:text-sm text-agri-700 font-semibold text-right">Effective: ₹{teamPerKg}/kg</p>
          </div>
        </div>
      </div>

      {/* Bottom Summary Banner */}
      <div className="mt-5 p-4 sm:p-5 bg-gradient-to-r from-agri-700 to-agri-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center space-x-2.5">
          <CheckCircle2 className="w-5 h-5 text-ochre-300 shrink-0" />
          <span>
            Aggregating in a 4-farmer team gives you <strong className="text-ochre-300 font-bold">+₹{netGain.toLocaleString()} extra in-hand</strong> (+{netGainPercent}%) and saves <strong className="text-ochre-300 font-bold">₹{transportSaved.toLocaleString()}</strong> on freight!
          </span>
        </div>
      </div>
    </div>
  );
};
