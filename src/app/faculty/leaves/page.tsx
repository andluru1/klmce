import React from 'react';
import prisma from '@/lib/prisma';
import { CalendarClock } from 'lucide-react';
import LeaveApplicationForm from './components/LeaveApplicationForm';
import LeaveHistoryClient from './LeaveHistoryClient';

export default async function FacultyLeavesPage() {
  const faculty = await prisma.user.findFirst({
    where: { role: 'FACULTY' },
    include: {
      leaves: { 
        orderBy: { createdAt: 'desc' },
        include: {
          messages: {
            include: { sender: true },
            orderBy: { createdAt: 'asc' }
          }
        }
      }
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
          <LeaveHistoryClient leaves={faculty.leaves} currentUserId={faculty.id} />
        </div>
      </div>
    </div>
  );
}
