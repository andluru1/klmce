import React from 'react';
import prisma from '@/lib/prisma';
import { CalendarClock } from 'lucide-react';
import LeaveApplicationForm from './components/LeaveApplicationForm';

export default async function FacultyLeavesPage() {
  const faculty = await prisma.user.findFirst({
    where: { role: 'FACULTY' },
    include: {
      leaves: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!faculty) return null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <CalendarClock className="w-6 h-6 text-amber-400" />
          </div>
          Leave Requests
        </h1>
        <p className="text-slate-400">Apply for time off and track the status of your applications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <LeaveApplicationForm facultyId={faculty.id} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Leave History</h2>
          {faculty.leaves.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-700 rounded-xl text-slate-500">
              No previous leave requests found.
            </div>
          ) : (
            <div className="space-y-3">
              {faculty.leaves.map(l => (
                <div key={l.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-white">
                      {l.startDate.toLocaleDateString()} &rarr; {l.endDate.toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                      l.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                      l.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {l.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{l.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
