'use client';

import React, { useState } from 'react';
import { Fee } from '@prisma/client';
import EditFeeModal from './EditFeeModal';
import { Edit2, IndianRupee, Clock, CalendarDays, Wallet } from 'lucide-react';

type FeeWithUser = Fee & {
  user: {
    name: string;
    rollNumber: string;
    department: { code: string } | null;
  }
};

export default function FeesTable({ fees, isPending }: { fees: FeeWithUser[], isPending: boolean }) {
  const [selectedFee, setSelectedFee] = useState<FeeWithUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFees = fees.filter(f => 
    f.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.user.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.feeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.paymentRef && f.paymentRef.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">{isPending ? 'Pending Fees' : 'Collected Fees'}</h2>
        <input 
          type="text" 
          placeholder="Search roll number, name, txn hash..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500 w-72"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Fee Type</th>
              <th className="py-3 px-4 text-right">Amount (₹)</th>
              {!isPending && (
                <>
                  <th className="py-3 px-4 text-center">Payment Mode</th>
                  <th className="py-3 px-4">Ref / Txn ID</th>
                  <th className="py-3 px-4">Paid Date</th>
                </>
              )}
              {isPending && (
                <th className="py-3 px-4">Due Date</th>
              )}
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFees.map((fee) => (
              <tr key={fee.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-medium text-white">{fee.user.name}</p>
                  <p className="text-xs text-slate-500">{fee.user.rollNumber} • {fee.user.department?.code}</p>
                </td>
                <td className="py-3 px-4 text-slate-300">{fee.feeType}</td>
                <td className={`py-3 px-4 text-right font-medium ${isPending ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {fee.amount.toLocaleString()}
                </td>
                
                {!isPending && (
                  <>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                        <Wallet className="w-3.5 h-3.5" />
                        {fee.paymentMode || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-xs">{fee.paymentRef || '—'}</td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : '—'}
                    </td>
                  </>
                )}

                {isPending && (
                  <td className="py-3 px-4 text-xs">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </span>
                      {new Date(fee.dueDate) < new Date() ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 font-medium text-[10px] uppercase tracking-wider">
                          Overdue
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-medium text-[10px] uppercase tracking-wider">
                          Upcoming
                        </span>
                      )}
                    </div>
                  </td>
                )}

                <td className="py-3 px-4 text-center">
                  <button 
                    onClick={() => setSelectedFee(fee)}
                    className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
                    title="Edit Record"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            
            {filteredFees.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No fee records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EditFeeModal 
        fee={selectedFee} 
        onClose={() => setSelectedFee(null)} 
      />
    </div>
  );
}
