import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { GlassCard } from '@/components/ui/VibeCard';
import { Users, CalendarDays, Clock, BookOpen, AlertCircle } from 'lucide-react';

export default async function FacultyDashboard() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'FACULTY') return <div>Access Denied</div>;

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' }); // e.g. "Monday"

  // Fetch today's schedule for this faculty
  const todaySchedules = await prisma.schedule.findMany({
    where: { facultyId: sessionUser.id, dayOfWeek: todayStr },
    include: { subject: true, room: true, classSection: true },
    orderBy: { startTime: 'asc' }
  });

  const studentsCount = await prisma.user.count({
    where: { role: 'STUDENT', departmentId: sessionUser.departmentId } // Simplified. Should technically count unique students in assigned sections.
  });

  const activeRemarks = await prisma.disciplinaryRecord.count({
    where: { facultyId: sessionUser.id, status: 'PENDING' }
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {sessionUser.name.split(' ')[0]}!</h1>
        <p className="text-slate-400">Here is your teaching overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <CalendarDays className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Classes Today</p>
              <h3 className="text-2xl font-bold text-white">{todaySchedules.length}</h3>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Students</p>
              <h3 className="text-2xl font-bold text-white">{studentsCount}</h3>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/20 rounded-xl">
              <AlertCircle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Pending Incidents</p>
              <h3 className="text-2xl font-bold text-white">{activeRemarks}</h3>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6 bg-slate-900/50 border-indigo-500/20">
        <h2 className="text-xl font-bold text-white mb-6">Today's Schedule</h2>
        
        {todaySchedules.length === 0 ? (
          <div className="text-center p-8 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
            <p className="text-slate-400">No classes scheduled for today.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaySchedules.map(sch => (
              <div key={sch.id} className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-indigo-500/50 transition-colors">
                <div className="flex items-center justify-between border-b border-slate-700/50 pb-3 mb-3">
                  <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                    {sch.startTime} - {sch.endTime}
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 60m
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight mb-1">{sch.subject.name}</h3>
                <p className="text-sm text-slate-400 font-mono mb-4">{sch.classSection.name}</p>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <BookOpen className="w-4 h-4 text-emerald-400" /> {sch.room.type} {sch.room.number}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

    </div>
  );
}
