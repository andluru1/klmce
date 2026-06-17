import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { AlertTriangle, CheckCircle2, History, User, MapPin, Clock, ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function StudentAttendancePage({ searchParams }: { searchParams: Promise<{ page?: string, filter?: string }> }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/login?error=SessionExpired');

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');
  const filter = resolvedSearchParams.filter || 'all';
  const limit = 50;
  const skip = (page - 1) * limit;

  const whereClause: any = { userId: sessionUser.id };
  if (filter === 'absent') {
    whereClause.status = 'Absent';
  } else if (filter === 'present') {
    whereClause.status = 'Present';
  }

  const [totalRecords, records, totalClasses, attendedClasses] = await Promise.all([
    prisma.attendanceRecord.count({ where: whereClause }),
    prisma.attendanceRecord.findMany({
      where: whereClause,
      include: {
        subject: true,
        schedule: {
          include: { faculty: true, room: true }
        }
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit
    }),
    prisma.attendanceRecord.count({ where: { userId: sessionUser.id } }),
    prisma.attendanceRecord.count({ where: { userId: sessionUser.id, status: 'Present' } })
  ]);

  const currentPct = totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(1) : 0;
  const totalPages = Math.ceil(totalRecords / limit);

  // Group attendance records by Date
  const groupedByDate = records.reduce((acc, record) => {
    const dateStr = new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(record);
    return acc;
  }, {} as Record<string, typeof records>);

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
          <p className="text-slate-400 text-lg">Detailed history of {totalClasses} classes spanning 4 years.</p>
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 border-b border-slate-800 pb-4">
        <Link 
          href="/student/attendance?filter=all" 
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          All Classes ({totalClasses})
        </Link>
        <Link 
          href="/student/attendance?filter=present" 
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'present' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Attended ({attendedClasses})
        </Link>
        <Link 
          href="/student/attendance?filter=absent" 
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'absent' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Missed ({totalClasses - attendedClasses})
        </Link>
      </div>

      {/* Detailed Ledger Timeline */}
      {records.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center text-slate-500">
          <SearchX className="w-16 h-16 mb-4 text-slate-600" />
          <p className="text-xl font-medium text-slate-400">No classes found.</p>
          <p>Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([dateStr, dayRecords]) => (
            <div key={dateStr} className="bg-slate-900/40 border border-slate-800/50 rounded-2xl overflow-hidden">
              <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-white font-bold">{dateStr}</h3>
                <span className="text-xs text-slate-500 font-mono">{dayRecords.length} Classes</span>
              </div>
              
              <div className="divide-y divide-slate-800/50">
                {dayRecords.map(record => (
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
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center py-6 border-t border-slate-800">
          <Link 
            href={`/student/attendance?page=${Math.max(1, page - 1)}&filter=${filter}`}
            className={`px-4 py-2 flex items-center gap-2 rounded-lg bg-slate-800 text-white font-bold transition-all hover:bg-slate-700 ${page === 1 ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Link>
          <span className="text-slate-400 font-medium">Page {page} of {totalPages}</span>
          <Link 
            href={`/student/attendance?page=${Math.min(totalPages, page + 1)}&filter=${filter}`}
            className={`px-4 py-2 flex items-center gap-2 rounded-lg bg-slate-800 text-white font-bold transition-all hover:bg-slate-700 ${page === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Next <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

    </div>
  );
}
