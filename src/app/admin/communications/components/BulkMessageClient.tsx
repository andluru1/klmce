'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/VibeCard';
import { Send, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { sendBulkNotification } from '../../actions';

export default function BulkMessageClient({ departments }: { departments: any[] }) {
  const [role, setRole] = useState('STUDENT');
  const [departmentId, setDepartmentId] = useState('');
  const [semester, setSemester] = useState('');
  const [attendanceStr, setAttendanceStr] = useState('');
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('GENERAL');

  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ count?: number, msg?: string, error?: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setResult(null);

    try {
      const attendanceThreshold = attendanceStr ? parseInt(attendanceStr) : undefined;
      
      const res = await sendBulkNotification({
        title,
        message,
        type,
        targetRole: role,
        departmentId: departmentId || undefined,
        semester: semester || undefined,
        attendanceThreshold
      });

      setResult({ count: res.count, msg: res.message });
      if (res.count > 0) {
        setTitle('');
        setMessage('');
      }
    } catch (err: any) {
      setResult({ error: err.message || 'Failed to send messages.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <GlassCard className="p-6 bg-slate-900 border-slate-800 space-y-4">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Target Audience</h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">User Role</label>
            <select 
              value={role} onChange={e => setRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 appearance-none"
            >
              <option value="ALL">All Users</option>
              <option value="STUDENT">Students Only</option>
              <option value="FACULTY">Faculty Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Department Filter</label>
            <select 
              value={departmentId} onChange={e => setDepartmentId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 appearance-none"
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Semester Filter (e.g. III-I)</label>
            <input 
              type="text" 
              value={semester} onChange={e => setSemester(e.target.value)}
              placeholder="Leave blank for all"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Attendance Below (%)</label>
            <input 
              type="number" 
              value={attendanceStr} onChange={e => setAttendanceStr(e.target.value)}
              placeholder="e.g. 75"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </GlassCard>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <GlassCard className="p-6 bg-slate-900 border-slate-800">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <Send className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Compose Message</h2>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-400 mb-1">Message Title</label>
                <input 
                  type="text" required
                  value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Low Attendance Warning"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="w-48">
                <label className="block text-xs font-medium text-slate-400 mb-1">Message Type</label>
                <select 
                  value={type} onChange={e => setType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 appearance-none"
                >
                  <option value="GENERAL">General</option>
                  <option value="ATTENDANCE">Attendance Alert</option>
                  <option value="FEE">Fee Reminder</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Message Content</label>
              <textarea 
                required rows={6}
                value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Write your message here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {result?.error && (
              <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-sm">
                <AlertCircle className="w-4 h-4" /> {result.error}
              </div>
            )}

            {result?.msg && !result?.error && (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 text-sm">
                <CheckCircle className="w-4 h-4" /> {result.msg}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSending}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSending ? 'Dispatching...' : 'Dispatch Message'}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
