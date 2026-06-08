'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/VibeCard';
import { CreditCard, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { processMockPayment } from '@/app/actions/finance';

export default function FinanceClient({
  pendingDues,
  transactions,
}: {
  pendingDues: number;
  transactions: any[];
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');
    
    // Server action triggers the simulated delay and database creation
    const res = await processMockPayment(pendingDues);
    
    if (res.success) {
      setSuccessData(res);
    } else {
      setError(res.error || 'Payment Gateway Failed');
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="space-y-8">
      {/* Primary Payment Card */}
      <GlassCard className="p-8 bg-gradient-to-br from-slate-900/80 to-slate-950/90 border-slate-800 relative overflow-hidden">
        {/* Abstract background blobs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Pending Semester Fee</h2>
            {pendingDues > 0 ? (
              <>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  ₹{pendingDues.toLocaleString()}
                </div>
                <p className="text-slate-400 mt-2 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Secure Mock Payment Gateway
                </p>
              </>
            ) : (
              <div className="flex items-center gap-3 text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
                <span className="text-2xl font-bold">No Pending Dues!</span>
              </div>
            )}
          </div>
          
          {pendingDues > 0 && !successData && (
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-3 disabled:opacity-50 min-w-[240px] justify-center"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-6 h-6" />
                  Pay via Razorpay (Mock)
                </>
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg">
            {error}
          </div>
        )}

        {successData && (
          <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-emerald-400">Payment Successful!</h3>
                <p className="text-emerald-200/70 mt-1">Your transaction was completed and your ledger has been updated.</p>
                <div className="mt-4 space-y-2 text-sm font-mono text-emerald-200/90">
                  <div><span className="text-emerald-500/60">Receipt No:</span> {successData.receiptNumber}</div>
                  <div><span className="text-emerald-500/60">Gateway Ref:</span> {successData.gatewayReference}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Transaction Ledger */}
      <GlassCard className="p-6 bg-slate-900/50">
        <h2 className="text-xl font-bold text-white mb-6">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No payment history found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Receipt No.</th>
                  <th className="p-4 font-medium">Gateway Ref</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => (
                  <tr key={txn.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="p-4 text-slate-300">
                      {new Date(txn.transactionDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-white font-bold">₹{txn.amount.toLocaleString()}</td>
                    <td className="p-4 font-mono text-sm text-slate-400">{txn.receiptNumber}</td>
                    <td className="p-4 font-mono text-sm text-slate-500 truncate max-w-[150px]">{txn.gatewayReference}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
