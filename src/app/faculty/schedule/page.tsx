import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { GlassCard } from '@/components/ui/VibeCard';
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
];

export default async function FacultySchedulePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'FACULTY') {
    return <div className="p-8 text-white">Access Denied.</div>;
  }

  const schedules = await prisma.schedule.findMany({
    where: { facultyId: sessionUser.id },
    include: {
      subject: true,
      classSection: true,
      room: true
    }
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <CalendarDays className="w-6 h-6 text-indigo-400" />
          </div>
          My Teaching Schedule
        </h1>
        <p className="text-slate-400">Your comprehensive weekly timetable across all assigned sections.</p>
      </div>

      <div className="overflow-x-auto pb-8">
        <div className="min-w-[1000px] border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
          <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/50">
            <div className="p-4 border-r border-slate-800 font-bold text-slate-400 text-center flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            {DAYS.map(day => (
              <div key={day} className="p-4 border-r border-slate-800 last:border-0 font-bold text-slate-300 text-center">
                {day}
              </div>
            ))}
          </div>

          <div className="flex flex-col">
            {TIME_SLOTS.map(time => (
              <div key={time} className="grid grid-cols-7 border-b border-slate-800 last:border-0">
                <div className="p-4 border-r border-slate-800 text-slate-400 font-medium text-center flex items-center justify-center bg-slate-950/20">
                  {time}
                </div>
                {DAYS.map(day => {
                  const sch = schedules.find(s => s.dayOfWeek === day && s.startTime === time);
                  if (sch) {
                    return (
                      <div key={`${day}-${time}`} className="p-3 border-r border-slate-800 last:border-0 relative group">
                        <div className="absolute inset-1 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border border-indigo-500/30 rounded-lg p-2 flex flex-col justify-between hover:border-indigo-500/50 transition-colors">
                          <div>
                            <span className="text-xs font-bold text-indigo-400 block truncate">{sch.subject.code}</span>
                            <span className="text-[10px] text-white font-medium line-clamp-2 leading-tight mt-0.5">{sch.subject.name}</span>
                          </div>
                          <div className="space-y-1 mt-2">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {sch.classSection.name}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <MapPin className="w-3 h-3" /> Room {sch.room.number}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return <div key={`${day}-${time}`} className="p-4 border-r border-slate-800 last:border-0"></div>;
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
