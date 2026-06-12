import React, { Suspense } from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { GlassCard } from '@/components/ui/VibeCard';
import { Users, Search, GraduationCap } from 'lucide-react';

async function StudentsList() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'FACULTY') redirect('/login');

  // Find the faculty's department to show relevant students
  const faculty = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { department: true }
  });

  const students = await prisma.user.findMany({
    where: { 
      role: 'STUDENT',
      departmentId: faculty?.departmentId 
    },
    include: { department: true },
    orderBy: { rollNumber: 'asc' }
  });

  if (students.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20 text-slate-500">
        No students currently assigned to your department.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {students.map(student => (
        <GlassCard key={student.id} className="p-5 bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">{student.name}</h3>
              <p className="text-slate-400 font-mono text-sm mt-1">{student.rollNumber}</p>
              <div className="mt-3 inline-flex px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 border border-slate-700">
                {student.department?.name || 'Unassigned Dept'}
              </div>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

export default function FacultyStudentsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto p-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-500" />
            My Students
          </h1>
          <p className="text-slate-400 mt-2">
            Directory of students enrolled in your department.
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 animate-pulse">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-32 bg-slate-800/50 rounded-xl border border-slate-700/50"></div>
          ))}
        </div>
      }>
        <StudentsList />
      </Suspense>
    </div>
  );
}
