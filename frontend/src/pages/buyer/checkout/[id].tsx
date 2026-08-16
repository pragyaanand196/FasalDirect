import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  ArrowRight,
  Lock,
  Wallet,
  Sparkles
} from "lucide-react";

export default function CheckoutPaymentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [sale, setSale] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("UPI_Simulated_Escrow");
  const [txRef, setTxRef] = useState(`UPI-${Date.now().toString().slice(-6)}`);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settledSale, setSettledSale] = useState<any | null>(null);

  const loadSale = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.getSaleDetail(Number(id));
      setSale(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load checkout details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadSale();
    }
  }, [id]);

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sale) return;

    try {
      setIsProcessing(true);
      setError(null);
      const res = await api.simulatePayment(sale.id, {
        payment_method: paymentMethod,
        transaction_reference: txRef,
      });

      setSettledSale(res);
    } catch (err: any) {
      setError(err.message || "Payment simulation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-xs">Loading checkout...</div>;
  }

  if (!sale) {
    return (
      <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8">
        <CreditCard className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">Checkout record not found</h3>
        <Link href="/buyer/negotiations" className="text-xs text-agri-700 font-bold underline">
          Back to Negotiations
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Breadcrumb
        backHref="/buyer/negotiations"
        backLabel="Negotiations"
        items={[{ label: `Checkout #${sale.id}` }]}
      />

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success State: Payout Completed */}
      {settledSale ? (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900">
              Payment Confirmed & Automatic Settlement Complete!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              ₹{settledSale.gross_amount.toLocaleString()} was successfully received and distributed rupee-for-rupee to all {settledSale.settlements.length} participating farmers according to their exact contributed quantity.
            </p>
          </div>

          {/* Settled Shares Summary */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Contribution-Based Wallet Credits:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {settledSale.settlements.map((s: any) => (
                <div key={s.id} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-800">{s.farmer_name}</span>
                    <span className="text-[11px] text-slate-400 block">{s.contributed_kg} kg ({s.percentage_share}%)</span>
                  </div>
                  <span className="font-black text-emerald-700">₹{s.net_payout.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {settledSale.lot_code && (
              <Link
                href={`/passport/${settledSale.lot_code}`}
                className="px-5 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>View Digital Lot Passport ({settledSale.lot_code})</span>
              </Link>
            )}

            <Link
              href="/buyer/purchases"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
            >
              Go to My Purchases
            </Link>
          </div>
        </div>
      ) : (
        /* Checkout Invoice & Payment Form */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-ochre-600" />
              <span>Simulated Escrow Payment & Settlement Checkout</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Completing this payment will automatically invoke the Contribution-Based Settlement Engine to credit each farmer's wallet.
            </p>
          </div>

          {/* Invoice Summary */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
              <span className="font-bold text-slate-700">Collective Batch Details:</span>
              <span className="font-semibold text-agri-800">Team: {sale.team_name}</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Aggregated Produce Volume:</span>
                <span className="font-bold text-slate-800">{sale.total_quantity_kg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Agreed Collective Rate:</span>
                <span className="font-bold text-slate-800">₹{sale.price_per_kg}/kg</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Gross Purchase Total:</span>
                <span className="font-bold text-slate-900">₹{sale.gross_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Consolidated Transport Deductions:</span>
                <span className="font-semibold text-slate-700">-₹{sale.transport_deduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform Commission (2%):</span>
                <span className="font-semibold text-slate-700">-₹{sale.platform_fee.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                <span>Net Distributable to 4 Farmers:</span>
                <span className="text-emerald-700 font-black">₹{sale.net_distributable_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <form onSubmit={handleCompletePayment} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Select Prototype Payment Provider / Method:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {["UPI_Simulated_Escrow", "IMPS_Direct_Bank", "APMC_Settlement_Mock"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                      paymentMethod === m
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {m.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Transaction Reference Number (Simulated)
              </label>
              <input
                type="text"
                required
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium focus:bg-white focus:ring-2 focus:ring-slate-700"
              />
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                <strong>Platform Assurance:</strong> Once marked complete, funds are allocated directly and instantaneously into each verified farmer's wallet without intermediary custody delays.
              </span>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? "Executing Automatic Settlement Engine..." : `Mark Payment Received & Trigger Automatic Settlement (₹${sale.gross_amount.toLocaleString()})`}
              {!isProcessing && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
