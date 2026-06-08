'use client';

import React, { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { processMockPayment } from '@/app/actions/finance';

export default function PaymentClient({ fee }: { fee: any }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const res = await processMockPayment(fee.id, fee.userId, fee.amount);
      if (res.success) {
        alert(`Payment Successful! Reference: ${res.reference}`);
      }
    } catch (e: any) {
      alert("Payment failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (fee.isPaid) {
    return (
      <div className="text-xs text-slate-500 flex justify-between">
        <span>Paid on: {fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : 'N/A'}</span>
        <span>Ref: {fee.paymentRef || 'N/A'}</span>
      </div>
    );
  }

  return (
    <button 
      onClick={handlePay}
      disabled={isProcessing}
      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition-colors disabled:opacity-50"
    >
      {isProcessing ? 'Processing Securely...' : 'Pay Now'}
    </button>
  );
}
