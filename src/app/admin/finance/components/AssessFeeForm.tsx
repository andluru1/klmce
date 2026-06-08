'use client';

import React, { useState } from 'react';
import { assessFee } from '../actions';
import { IndianRupee, Loader2, CheckCircle2, User, CalendarDays } from 'lucide-react';

export default function AssessFeeForm({ students }: { students: { id: string; name: string; rollNumber: string }[] }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await assessFee(formData);

    setLoading(false);
    if (result.success) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Student Selection */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Select Student
          </label>
          <select name="userId" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors">
            <option value="">Choose a Student...</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>
            ))}
          </select>
        </div>

        {/* Fee Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fee Category</label>
          <select name="feeType" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors">
            <option value="Tuition Fee">Tuition Fee</option>
            <option value="JNTU Fee">JNTU Fee</option>
            <option value="Transport Fee">Transport Fee</option>
            <option value="Exam Fee">Exam Fee</option>
            <option value="Library Fine">Library Fine</option>
          </select>
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5" /> Amount (₹)
          </label>
          <input type="number" name="amount" min="1" required placeholder="e.g., 50000" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>

        {/* Due Date */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" /> Due Date
          </label>
          <input type="date" name="dueDate" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>

        {/* Remarks */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remarks (Optional)</label>
          <input type="text" name="remarks" placeholder="e.g., Late fee included" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>

      </div>

      {error && <p className="text-rose-400 text-xs font-bold">{error}</p>}
      
      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : success ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Fee Assigned Successfully!
          </>
        ) : (
          'Assess Fee to Student'
        )}
      </button>
    </form>
  );
}
