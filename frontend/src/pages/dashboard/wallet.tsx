import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  Wallet as WalletIcon,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard
} from "lucide-react";

export default function FarmerWalletPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [bankOrUpi, setBankOrUpi] = useState("");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const data = await api.getMyWallet();
      setWallet(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || withdrawAmount <= 0) {
      setError("Please enter a valid withdrawal amount.");
      return;
    }
    if (!bankOrUpi) {
      setError("Please provide a Bank Account or UPI ID.");
      return;
    }

    try {
      setIsSubmittingWithdraw(true);
      setError(null);
      await api.withdrawWallet({
        amount: withdrawAmount,
        bank_account_or_upi: bankOrUpi,
      });

      setSuccessMsg(`₹${withdrawAmount.toLocaleString()} transfer initiated to ${bankOrUpi}!`);
      setShowWithdrawModal(false);
      setWithdrawAmount(0);
      setBankOrUpi("");
      await loadWallet();
    } catch (err: any) {
      setError(err.message || "Withdrawal failed.");
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb
        backHref="/dashboard"
        backLabel="Dashboard"
        items={[{ label: "Farmer Wallet" }]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <WalletIcon className="w-6 h-6 text-emerald-600" />
            <span>Farmer Wallet & Settlement Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated rupee-for-rupee distribution directly calculated from your contributed produce.
          </p>
        </div>

        <button
          onClick={() => setShowWithdrawModal(true)}
          disabled={!wallet || wallet.available_balance <= 0}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <CreditCard className="w-4 h-4" />
          <span>Transfer to Bank / UPI</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Balance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-emerald-200 block">Available Balance</span>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">
            ₹{(wallet?.available_balance || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-300 mt-2 block">
            Ready for instant bank payout
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Lifetime Earnings</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            ₹{(wallet?.total_earned || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-2 block">
            From 4-farmer collective sales
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Withdrawn</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            ₹{(wallet?.total_withdrawn || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Settled to your verified bank/UPI
          </span>
        </div>
      </div>

      {/* Transactions History */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Transaction History & Settlement Log</h3>
          <span className="text-xs text-slate-400">
            {wallet?.transactions?.length || 0} Transactions
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading ledger records...</div>
        ) : !wallet?.transactions || wallet.transactions.length === 0 ? (
          <div className="py-16 text-center space-y-2 bg-slate-50 rounded-xl p-8">
            <WalletIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">No transactions recorded yet</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              When your team completes a collective sale and the buyer pays, your proportional payout will be credited here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {wallet.transactions.map((tx: any) => (
              <div
                key={tx.id}
                className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.type === "credit_payout"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-700"
                  }`}>
                    {tx.type === "credit_payout" ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{tx.description}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Ref: {tx.reference_id || 'N/A'} • {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-black ${
                    tx.type === "credit_payout" ? "text-emerald-700" : "text-slate-800"
                  }`}>
                    {tx.type === "credit_payout" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-semibold capitalize">
                    {tx.type.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && wallet && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-black text-slate-900">Withdraw Wallet Funds</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Available Balance: <strong className="text-emerald-700">₹{wallet.available_balance.toLocaleString()}</strong>
              </p>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Withdrawal Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={wallet.available_balance}
                  step="1"
                  required
                  placeholder="Enter amount"
                  value={withdrawAmount || ""}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bank Account Number or UPI ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210@upi or SBIN0001234 / 1234567890"
                  value={bankOrUpi}
                  onChange={(e) => setBankOrUpi(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {isSubmittingWithdraw ? "Processing Transfer..." : "Confirm Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
