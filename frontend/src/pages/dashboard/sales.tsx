import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  ShoppingBag,
  FileCheck2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Users
} from "lucide-react";

export default function FarmerSalesPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSales = async () => {
      try {
        setLoading(true);
        const data = await api.getMySales();
        setSales(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSales();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb
        backHref="/dashboard"
        backLabel="Dashboard"
        items={[{ label: "My Collective Sales" }]}
      />

      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-agri-700" />
          <span>My Collective Sales & Lot Passports</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          History of all completed collective batches, buyer settlements, and digital provenance passports.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading sales history...</div>
      ) : sales.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No completed collective sales yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once your 4-farmer team accepts a buyer offer and payment is verified, your sale records and Lot Passports will appear here.
          </p>
          <Link
            href="/dashboard/teams"
            className="inline-block px-4 py-2 bg-agri-700 text-white text-xs font-bold rounded-xl"
          >
            Go to Team Hub
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Payment Settled
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">
                    Team: {sale.team_name} • Buyer: {sale.buyer_business || sale.buyer_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Completed on {new Date(sale.created_at).toLocaleDateString()} • Ref: {sale.payment_reference}
                  </p>
                </div>

                {sale.lot_code && (
                  <Link
                    href={`/passport/${sale.lot_code}`}
                    className="px-3.5 py-1.5 bg-agri-50 hover:bg-agri-100 text-agri-900 border border-agri-200 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-agri-700" />
                    <span>View Lot Passport ({sale.lot_code})</span>
                  </Link>
                )}
              </div>

              {/* Settlement Distribution Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Sold Volume</span>
                  <span className="font-bold text-slate-800">{sale.total_quantity_kg} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Final Price</span>
                  <span className="font-bold text-slate-800">₹{sale.price_per_kg}/kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Gross Turnover</span>
                  <span className="font-bold text-slate-800">₹{sale.gross_amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Net Distributed</span>
                  <span className="font-bold text-emerald-700">₹{sale.net_distributable_amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Individual Farmer Shares */}
              {sale.settlements && sale.settlements.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-600 block">Proportional Farmer Payout Breakdown:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sale.settlements.map((s: any) => (
                      <div key={s.id} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-800">{s.farmer_name}</span>
                          <span className="text-[11px] text-slate-500 block">{s.contributed_kg} kg ({s.percentage_share}%)</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-emerald-700 text-sm">₹{s.net_payout.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-400 block font-semibold">Credited to Wallet</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
