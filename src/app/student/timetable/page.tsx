import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { GlassCard } from '@/components/ui/VibeCard';
import { CalendarDays, Clock, MapPin, User } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
];

export default async function StudentTimetablePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !sessionUser.classSectionId) {
    return <div className="p-8 text-white">No section assigned. Cannot view timetable.</div>;
  }

  const schedules = await prisma.schedule.findMany({
    where: { classSectionId: sessionUser.classSectionId },
    include: {
      subject: true,
      faculty: true,
      room: true
    }
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <CalendarDays className="w-6 h-6 text-blue-400" />
          </div>
          My Timetable
        </h1>
        <p className="text-slate-400">Your weekly lecture schedule for {sessionUser.classSection?.name}.</p>
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
                        <div className="absolute inset-1 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-lg p-2 flex flex-col justify-between hover:border-blue-500/40 transition-colors">
                          <div>
                            <span className="text-xs font-bold text-blue-400 block truncate">{sch.subject.code}</span>
                            <span className="text-[10px] text-white font-medium line-clamp-2 leading-tight mt-0.5">{sch.subject.name}</span>
                          </div>
                          <div className="space-y-1 mt-2">
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <User className="w-3 h-3" /> <span className="truncate">{sch.faculty.name}</span>
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
