import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/VibeCard';
import { FileSpreadsheet, Play, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default async function StudentExamCenter() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'STUDENT') redirect('/login');

  const student = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { department: true }
  });

  // Find exams available for the student's department that they haven't completed
  const availableExams = await prisma.onlineExam.findMany({
    where: { 
      subject: { departmentId: student?.departmentId || undefined }
    },
    include: {
      subject: true,
      attempts: { where: { studentId: sessionUser.id } },
      _count: { select: { questions: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-8 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-indigo-500" />
          Exam Center
        </h1>
        <p className="text-slate-400 mt-2">
          Take Practice Tests, Continuous Assessments, and Mid-Term Examinations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableExams.map(exam => {
          const attempt = exam.attempts[0];
          const isCompleted = attempt && attempt.status !== 'IN_PROGRESS';

          return (
            <GlassCard key={exam.id} className={`p-6 border-slate-800 transition-colors ${isCompleted ? 'opacity-70 grayscale-[50%]' : 'hover:bg-slate-800/40'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="inline-flex px-2 py-1 rounded bg-indigo-500/10 text-xs font-bold text-indigo-400 border border-indigo-500/20">
                  {exam.type}
                </div>
                {exam.isProctored && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-500/10 text-xs font-bold text-rose-400 border border-rose-500/20">
                    <ShieldCheck className="w-3 h-3" /> Proctored
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

              {isCompleted ? (
                <div className="border-t border-slate-800 pt-4 text-center">
                  <p className="text-sm font-bold text-emerald-400">Score: {attempt.score}</p>
                  <p className="text-xs text-slate-500 mt-1">Status: {attempt.status}</p>
                </div>
              ) : (
                <div className="border-t border-slate-800 pt-4 flex justify-end">
                  <Link 
                    href={`/student/exam-center/${exam.id}`}
                    className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    {attempt ? 'Resume Exam' : 'Start Exam'} <Play className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </GlassCard>
          );
        })}

        {availableExams.length === 0 && (
          <div className="col-span-full p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
            <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Active Exams</h3>
            <p className="text-slate-500">You do not have any pending exams or practice tests at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
