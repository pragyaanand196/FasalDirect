import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  FileCheck2,
  Calendar,
  Layers,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award
} from "lucide-react";

export default function BuyerPurchasesPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPurchases = async () => {
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
    loadPurchases();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Breadcrumb
        backHref="/buyer"
        backLabel="Buyer Hub"
        items={[{ label: "Purchases & Passports" }]}
      />

      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-agri-700" />
          <span>Fulfilled Purchases & Digital Lot Passports</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verifiable record of completed 4-farmer collective procurements and traceability passports.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading purchases...</div>
      ) : sales.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No completed purchases yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once you finalize negotiations and complete escrow payment checkout, your digital lot passports will appear here.
          </p>
          <Link
            href="/buyer/lots"
            className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
          >
            Browse Teams
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
                    Team: {sale.team_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Purchased on {new Date(sale.created_at).toLocaleDateString()} • Ref: {sale.payment_reference}
                  </p>
                </div>

                {sale.lot_code && (
                  <Link
                    href={`/passport/${sale.lot_code}`}
                    className="px-4 py-2 bg-agri-700 hover:bg-agri-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-ochre-300" />
                    <span>View Digital Lot Passport ({sale.lot_code})</span>
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Volume</span>
                  <span className="font-bold text-slate-800">{sale.total_quantity_kg.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Final Price</span>
                  <span className="font-bold text-slate-800">₹{sale.price_per_kg}/kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Amount Paid</span>
                  <span className="font-bold text-slate-900">₹{sale.gross_amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Farmers Benefited</span>
                  <span className="font-bold text-agri-800">{sale.settlements?.length || 4} Farmers</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
