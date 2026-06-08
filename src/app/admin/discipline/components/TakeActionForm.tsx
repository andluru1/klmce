'use client';

import React, { useState } from 'react';
import { resolveMisconduct } from '../actions';
import { Loader2, CheckCircle2, Gavel } from 'lucide-react';

export default function TakeActionForm({ recordId }: { recordId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.append('recordId', recordId);
    const result = await resolveMisconduct(formData);

    setLoading(false);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Something went wrong');
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
        <CheckCircle2 className="w-5 h-5" />
        Action Enforced and Case Resolved
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 items-end">
      <div className="flex-1 w-full space-y-1.5">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Gavel className="w-3.5 h-3.5 text-indigo-400" /> Enter Official Action Taken
        </label>
        <input 
          type="text" 
          name="adminAction" 
          required 
          placeholder="e.g. Warning issued to parents, 2-day suspension..." 
          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-w-[140px]"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enforce & Resolve'}
      </button>
      {error && <p className="text-rose-400 text-xs font-bold absolute -bottom-6">{error}</p>}
    </form>
  );
}
