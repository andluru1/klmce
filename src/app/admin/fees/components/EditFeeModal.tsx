'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/VibeCard';
import { X, CheckCircle2 } from 'lucide-react';
import { updateFee } from '../../actions';
import { Fee } from '@prisma/client';

export default function EditFeeModal({ fee, onClose }: { fee: Fee | null, onClose: () => void }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  // Local state for edits
  const [isPaid, setIsPaid] = useState(fee?.isPaid ?? false);
  const [amount, setAmount] = useState(fee?.amount?.toString() ?? '0');
  const [paymentMode, setPaymentMode] = useState(fee?.paymentMode ?? 'Cash');
  const [paymentRef, setPaymentRef] = useState(fee?.paymentRef ?? '');
  const [remarks, setRemarks] = useState(fee?.remarks ?? '');

  if (!fee) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccess(false);

    try {
      await updateFee(fee.id, {
        isPaid,
        amount: parseFloat(amount),
        paymentMode: isPaid ? paymentMode : null,
        paymentRef: isPaid ? paymentRef : null,
        remarks: remarks || null,
        paidDate: isPaid ? (fee.paidDate || new Date()) : null
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      alert('Failed to update fee');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-6 bg-slate-900 border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Fee Record</h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Fee Type</label>
                <input type="text" value={fee.feeType} disabled className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-400 cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-white outline-none transition-colors" 
                  required
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input 
                  type="checkbox" 
                  id="isPaid" 
                  checked={isPaid} 
                  onChange={e => setIsPaid(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-700 text-indigo-500 focus:ring-indigo-500 bg-slate-800"
                />
                <label htmlFor="isPaid" className="text-white font-medium">Mark as Paid</label>
              </div>

              {isPaid && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Payment Mode</label>
                    <select 
                      value={paymentMode} 
                      onChange={e => setPaymentMode(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-white outline-none transition-colors"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="NEFT">NEFT / RTGS</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Demand Draft">Demand Draft</option>
                      <option value="Card">Debit/Credit Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Reference ID / Txn Hash</label>
                    <input 
                      type="text" 
                      value={paymentRef} 
                      onChange={e => setPaymentRef(e.target.value)}
                      placeholder="e.g. TXN123456789"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-white outline-none transition-colors" 
                    />
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Remarks</label>
                <input 
                  type="text" 
                  value={remarks} 
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Any internal notes"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-white outline-none transition-colors" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isUpdating || success}
                className={`w-full py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  success ? 'bg-green-500 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
              >
                {success ? (
                  <><CheckCircle2 className="w-5 h-5" /> Saved Successfully!</>
                ) : isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
