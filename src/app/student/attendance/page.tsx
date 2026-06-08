import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { GlassCard } from '@/components/ui/VibeCard';
import { AlertTriangle, CheckCircle2, History, User, MapPin, Clock } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function StudentAttendancePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/login?error=SessionExpired');

  const student = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      attendance: {
        include: {
          subject: true,
          schedule: {
            include: { faculty: true, room: true }
          }
        },
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!student) return <div>Student not found.</div>;

  const totalClasses = student.attendance.length;
  const attendedClasses = student.attendance.filter(a => a.status === 'Present').length;
  const currentPct = totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(1) : student.attendancePct || 0;

  // Group attendance records by Date
  const groupedByDate = student.attendance.reduce((acc, record) => {
    const dateStr = new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(record);
    return acc;
  }, {} as Record<string, typeof student.attendance>);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12 pt-8 px-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 rounded-xl">
              <History className="w-8 h-8 text-rose-400" />
            </div>
            Attendance Ledger
          </h1>
          <p className="text-slate-400 text-lg">View your detailed class history, including lecturer and location.</p>
        </div>
        <div className={`text-right px-8 py-4 rounded-2xl border ${Number(currentPct) < 75 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
          <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${Number(currentPct) < 75 ? 'text-rose-400/70' : 'text-emerald-400/70'}`}>Overall Percentage</p>
          <p className={`text-5xl font-black ${Number(currentPct) < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>{currentPct}%</p>
        </div>
      </div>

      {Number(currentPct) < 75 && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-rose-400 font-bold mb-1">Condonation Warning</h3>
            <p className="text-rose-300/80 text-sm">Your attendance is below the 75% mandatory threshold. You are at risk of being barred from final exams.</p>
          </div>
        </div>
      )}

      {/* Detailed Ledger Timeline */}
      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([dateStr, records]) => (
          <div key={dateStr} className="bg-slate-900/40 border border-slate-800/50 rounded-2xl overflow-hidden">
            <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-white font-bold">{dateStr}</h3>
              <span className="text-xs text-slate-500 font-mono">{records.length} Classes</span>
            </div>
            
            <div className="divide-y divide-slate-800/50">
              {records.map(record => (
                <div key={record.id} className="p-6 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row gap-6 md:items-center">
                  
                  {/* Status Indicator */}
                  <div className="shrink-0 flex md:flex-col items-center gap-3 md:w-24 border-r border-slate-800/50 pr-6">
                    {record.status === 'Present' ? (
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    )}
                    <span className={`text-sm font-bold tracking-widest uppercase ${record.status === 'Present' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {record.status}
                    </span>
                  </div>

                  {/* Class Info */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="text-lg font-bold text-white">{record.subject.name}</h4>
                      <p className="text-sm text-slate-400 font-mono">{record.subject.code}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      {record.schedule ? (
                        <>
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Clock className="w-4 h-4 text-indigo-400" />
                            {record.schedule.startTime} - {record.schedule.endTime}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <User className="w-4 h-4 text-blue-400" />
                            {record.schedule.faculty.name}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <MapPin className="w-4 h-4 text-rose-400" />
                            Room {record.schedule.room.number}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-500 italic">No schedule data available</span>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
