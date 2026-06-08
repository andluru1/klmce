import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { ShieldAlert, AlertTriangle, Scale, CheckCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/VibeCard';
import TakeActionForm from './components/TakeActionForm';

export default async function AdminDisciplinePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'ADMIN') {
    return <div>Access Denied</div>;
  }

  const records = await prisma.disciplinaryRecord.findMany({
    include: { student: true, faculty: true },
    orderBy: { date: 'desc' }
  });

  const pendingCount = records.filter(r => r.status === 'PENDING').length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Scale className="w-6 h-6 text-indigo-400" />
          </div>
          Disciplinary Review Board
        </h1>
        <p className="text-slate-400">Review faculty reports and enforce administrative actions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Pending Reviews</p>
              <h3 className="text-2xl font-bold text-white">{pendingCount}</h3>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6 bg-slate-900/50 border-slate-800">
        <h2 className="text-xl font-bold text-white mb-6">Master Incident Log</h2>
        <div className="space-y-4">
          {records.map(record => (
            <div key={record.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-start border-b border-slate-700/50 pb-3">
                <div>
                  <h3 className="text-white font-bold text-lg">{record.student.name} <span className="text-slate-500 font-mono text-sm ml-2">{record.student.rollNumber}</span></h3>
                  <p className="text-xs text-slate-400 mt-1">Reported by {record.faculty.name} on {new Date(record.date).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold border ${
                    record.severity === 'Severe' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                    record.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                    record.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {record.severity} Severity
                  </span>
                  <span className={`flex items-center gap-1 text-xs font-bold ${record.status === 'RESOLVED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {record.status === 'RESOLVED' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {record.status}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Incident Description</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{record.description}</p>
              </div>

              {record.status === 'PENDING' ? (
                <div className="mt-2 pt-4 border-t border-slate-700/50">
                  <TakeActionForm recordId={record.id} />
                </div>
              ) : (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5" /> Admin Action Taken
                  </h4>
                  <p className="text-indigo-200 text-sm">{record.adminAction}</p>
                </div>
              )}
            </div>
          ))}

          {records.length === 0 && (
            <div className="text-center p-8 border border-dashed border-slate-700 rounded-xl">
              <p className="text-slate-500">No disciplinary records found in the system.</p>
            </div>
          )}
        </div>
      </GlassCard>

    </div>
  );
}
