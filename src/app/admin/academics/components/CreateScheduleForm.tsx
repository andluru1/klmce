'use client';

import React, { useState } from 'react';
import { createSchedule } from '../actions';
import { CalendarDays, Clock, MapPin, Loader2, CheckCircle2, Users, BookOpen } from 'lucide-react';

interface FormProps {
  sections: { id: string; name: string }[];
  subjects: { id: string; name: string; code: string }[];
  faculty: { id: string; name: string }[];
  rooms: { id: string; number: string; type: string }[];
}

export default function CreateScheduleForm({ sections, subjects, faculty, rooms }: FormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await createSchedule(formData);

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
        
        {/* Class Section */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Class Section
          </label>
          <select name="classSectionId" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors">
            <option value="">Select Section...</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Subject
          </label>
          <select name="subjectId" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors">
            <option value="">Select Subject...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>
        </div>

        {/* Faculty */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Faculty
          </label>
          <select name="facultyId" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors">
            <option value="">Select Faculty...</option>
            {faculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>

        {/* Day of Week */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" /> Day of Week
          </label>
          <select name="dayOfWeek" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors">
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
          </select>
        </div>

        {/* Room */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Location (Room)
          </label>
          <select name="roomId" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors">
            <option value="">Select a Room...</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.type}: Room {r.number}</option>)}
          </select>
        </div>

        {/* Start Time */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" /> Start Time
          </label>
          <input type="time" name="startTime" defaultValue="09:00" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>

        {/* End Time */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-rose-400" /> End Time
          </label>
          <input type="time" name="endTime" defaultValue="10:00" required className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
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
            Class Scheduled!
          </>
        ) : (
          'Add to Timetable'
        )}
      </button>
    </form>
  );
}
