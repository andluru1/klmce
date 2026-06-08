'use client';

import React, { useState } from 'react';
import { enterMarks } from '../actions';
import { User, CheckCircle2, Loader2, Upload } from 'lucide-react';

interface FormProps {
  examId: string;
  maxMarks: number;
  students: { id: string; name: string; rollNumber: string }[];
}

export default function EnterMarksForm({ examId, maxMarks, students }: FormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.append('examId', examId);
    const result = await enterMarks(formData);

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
    <form onSubmit={handleSubmit} className="flex items-center gap-3 w-full max-w-lg mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
      <div className="flex-1">
        <select name="studentId" required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors">
          <option value="">Select Student...</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
        </select>
      </div>

      <div className="w-24">
        <input type="number" name="marksObtained" required min="0" max={maxMarks} placeholder={`Max: ${maxMarks}`} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors" />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center disabled:opacity-50 min-w-[80px]"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : success ? <CheckCircle2 className="w-3.5 h-3.5" /> : 'Save'}
      </button>
    </form>
  );
}
