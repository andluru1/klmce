'use client';

import React, { useState } from 'react';
import { createExam } from './actions';
import { CalendarDays, Clock, MapPin, Loader2, CheckCircle2 } from 'lucide-react';

interface CreateExamFormProps {
  subjects: { id: string; name: string; code: string }[];
  rooms: { id: string; number: string; type: string }[];
}

export default function CreateExamForm({ subjects, rooms }: CreateExamFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await createExam(formData);

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
    <form onSubmit={handleSubmit} className="space-y-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Subject Selection */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Target Subject</label>
          <select name="subjectId" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors">
            <option value="">Select a Subject...</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-indigo-400" />
            Exam Date
          </label>
          <input type="date" name="date" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>

        {/* Exam Type */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Exam Type</label>
          <select name="examType" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors">
            <option value="Mid-Term">Mid-Term</option>
            <option value="Final">Final</option>
            <option value="Practical">Practical</option>
          </select>
        </div>

        {/* Start Time */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Start Time
          </label>
          <input type="time" name="startTime" defaultValue="10:00" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>

        {/* End Time */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-400" />
            End Time
          </label>
          <input type="time" name="endTime" defaultValue="13:00" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>

        {/* Room */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            Location (Room)
          </label>
          <select name="roomId" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors">
            <option value="">Select a Room...</option>
            {rooms.map(r => (
              <option key={r.id} value={r.id}>{r.type}: Room {r.number}</option>
            ))}
          </select>
        </div>

        {/* Max Marks */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Max Marks</label>
          <input type="number" name="maxMarks" defaultValue="100" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>

      </div>

      {error && <p className="text-rose-400 text-sm font-bold">{error}</p>}
      
      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : success ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Exam Scheduled Successfully!
          </>
        ) : (
          'Schedule Examination'
        )}
      </button>

    </form>
  );
}
