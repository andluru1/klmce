'use client';

import React, { useState } from 'react';
import { logAttendance } from '../actions';
import { CheckCircle2, Loader2, User, Clock, CalendarDays, UserCheck } from 'lucide-react';

interface FormProps {
  students: { id: string; name: string; rollNumber: string }[];
  schedules: { id: string; subject: { name: string }; faculty: { name: string }; dayOfWeek: string; startTime: string }[];
}

export default function LogAttendanceForm({ students, schedules }: FormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await logAttendance(formData);

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
        
        {/* Date */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" /> Date
          </label>
          <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>

        {/* Schedule */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" /> Class Session
          </label>
          <select name="scheduleId" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors">
            <option value="">Select Scheduled Class...</option>
            {schedules.map(s => (
              <option key={s.id} value={s.id}>
                {s.subject.name} ({s.dayOfWeek} {s.startTime}) - {s.faculty.name}
              </option>
            ))}
          </select>
        </div>

        {/* Student */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Student
          </label>
          <select name="userId" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors">
            <option value="">Select Student...</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
          </select>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Status
          </label>
          <select name="status" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors">
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

      </div>

      {error && <p className="text-rose-400 text-xs font-bold">{error}</p>}
      
      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : success ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Attendance Logged!
          </>
        ) : (
          'Log Attendance Record'
        )}
      </button>
    </form>
  );
}
