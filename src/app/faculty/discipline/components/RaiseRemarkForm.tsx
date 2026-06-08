'use client';

import React, { useState } from 'react';
import { raiseMisconductRemark } from '../../actions';
import { ShieldAlert, User, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';

interface FormProps {
  students: { id: string; name: string; rollNumber: string }[];
}

export default function RaiseRemarkForm({ students }: FormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await raiseMisconductRemark(formData);

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
        
        {/* Student */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Offending Student
          </label>
          <select name="studentId" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors">
            <option value="">Select Student...</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
          </select>
        </div>

        {/* Severity */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Severity Level
          </label>
          <select name="severity" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors">
            <option value="Low">Low - Minor Disruption (e.g. Talking, Phone usage)</option>
            <option value="Medium">Medium - Repeated Disruption or Defiance</option>
            <option value="High">High - Aggressive Behavior or Academic Dishonesty</option>
            <option value="Severe">Severe - Violence, Vandalism, or Severe Misconduct</option>
          </select>
        </div>

        {/* Description */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detailed Description of Misconduct</label>
          <textarea 
            name="description" 
            required 
            rows={4}
            placeholder="Describe exactly what happened, when, and where. Include any warnings given." 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors resize-none"
          />
        </div>

      </div>

      {error && <p className="text-rose-400 text-xs font-bold">{error}</p>}
      
      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3 mt-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-rose-900/20"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : success ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Remark Submitted to Administration!
          </>
        ) : (
          <>
            <ShieldAlert className="w-4 h-4" />
            Raise Disciplinary Remark
          </>
        )}
      </button>
    </form>
  );
}
