import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/VibeCard';
import { FileSpreadsheet, Plus, Users, Clock, AlertTriangle } from 'lucide-react';

export default async function FacultyExamsDashboard() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'FACULTY') redirect('/login');

  const faculty = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { department: true }
  });

  const exams = await prisma.onlineExam.findMany({
    where: { subject: { departmentId: faculty?.departmentId || undefined } },
    include: {
      subject: true,
      attempts: { include: { proctorLogs: true } },
      _count: { select: { questions: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-indigo-500" />
            Exam Engine
          </h1>
          <p className="text-slate-400 mt-2">
            Manage Continuous Assessments, Practice Tests, and track Proctor violations.
          </p>
        </div>
        <Link 
          href="/faculty/exams/create"
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2 w-fit"
        >
          <Plus className="w-5 h-5" />
          Create New Exam
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map(exam => {
          const totalAttempts = exam.attempts.length;
          const completedAttempts = exam.attempts.filter(a => a.status === 'COMPLETED').length;
          const totalViolations = exam.attempts.reduce((sum, a) => sum + a.proctorLogs.length, 0);

          return (
            <GlassCard key={exam.id} className="p-6 border-slate-800 hover:bg-slate-800/40 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="inline-flex px-2 py-1 rounded bg-indigo-500/10 text-xs font-bold text-indigo-400 border border-indigo-500/20">
                  {exam.type}
                </div>
                {exam.isProctored && (
                  <div className="inline-flex px-2 py-1 rounded bg-rose-500/10 text-xs font-bold text-rose-400 border border-rose-500/20">
                    Proctored
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-white leading-tight mb-1">{exam.title}</h3>
              <p className="text-slate-400 text-sm mb-6">{exam.subject.code} - {exam.subject.name}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                  <div className="text-slate-500 text-xs font-medium mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Duration</div>
                  <div className="text-white font-mono text-sm">{exam.durationMin} mins</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                  <div className="text-slate-500 text-xs font-medium mb-1 flex items-center gap-1"><FileSpreadsheet className="w-3 h-3" /> Questions</div>
                  <div className="text-white font-mono text-sm">{exam._count.questions} Qs</div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-slate-300">
                    <Users className="w-4 h-4 text-slate-500" />
                    {completedAttempts}/{totalAttempts}
                  </div>
                  {totalViolations > 0 && (
                    <div className="flex items-center gap-1 text-rose-400 font-medium">
                      <AlertTriangle className="w-4 h-4" />
                      {totalViolations} Flags
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}

        {exams.length === 0 && (
          <div className="col-span-full p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
            <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Exams Published</h3>
            <p className="text-slate-500">Create your first Exam or Practice Test to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
