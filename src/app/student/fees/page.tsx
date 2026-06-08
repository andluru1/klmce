import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { GlassCard } from '@/components/ui/VibeCard';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import PaymentClient from './components/PaymentClient';

import { redirect } from 'next/navigation';

export default async function StudentFeesPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'STUDENT') {
    redirect('/login?error=SessionExpired');
  }

  const fees = await prisma.fee.findMany({
    where: { userId: sessionUser.id },
    orderBy: { dueDate: 'asc' }
  });

  const transactions = await prisma.transaction.findMany({
    where: { userId: sessionUser.id },
    orderBy: { transactionDate: 'desc' }
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <CreditCard className="w-6 h-6 text-emerald-400" />
          </div>
          Fee Payments
        </h1>
        <p className="text-slate-400">Manage your pending dues and view transaction history.</p>
      </div>

      {fees.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-700 rounded-xl text-slate-500">
          You have no fee records at this time.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fees.map(fee => (
            <GlassCard key={fee.id} className="p-6 bg-slate-900 border-slate-800">
              <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{fee.feeType}</h3>
                  <p className="text-sm text-slate-400">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">₹{fee.amount.toLocaleString()}</p>
                  {fee.isPaid ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 mt-1">
                      <CheckCircle className="w-3 h-3" /> PAID
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 mt-1">
                      <AlertCircle className="w-3 h-3" /> PENDING
                    </span>
                  )}
                </div>
              </div>

              {fee.remarks && (
                <div className="mb-4 text-sm text-slate-400 bg-slate-950 p-3 rounded-lg">
                  {fee.remarks}
                </div>
              )}

              <PaymentClient fee={fee} />
            </GlassCard>
          ))}
        </div>
      )}

      {/* Transaction Ledger */}
      <div className="mt-12 pt-8 border-t border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-6">Payment History</h2>
        
        {transactions.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-dashed border-slate-700">
            <p className="text-slate-500">No payment transactions found.</p>
          </div>
        ) : (
          <div className="bg-slate-900/40 rounded-2xl overflow-hidden border border-slate-800/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-sm">
                    <th className="p-4 font-bold uppercase tracking-wider">Date</th>
                    <th className="p-4 font-bold uppercase tracking-wider">Transaction ID</th>
                    <th className="p-4 font-bold uppercase tracking-wider">Amount</th>
                    <th className="p-4 font-bold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {transactions.map(txn => (
                    <tr key={txn.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-slate-300">{new Date(txn.transactionDate).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded">{txn.receiptNumber}</span>
                      </td>
                      <td className="p-4 font-bold text-white">₹{txn.amount.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          txn.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' :
                          txn.status === 'FAILED' ? 'bg-rose-500/10 text-rose-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
