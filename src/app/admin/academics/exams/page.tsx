import React from 'react';
import prisma from '@/lib/prisma';
import ExamControllerClient from './components/ExamControllerClient';
import { Award } from 'lucide-react';

export default async function ExamsPage() {
  // Fetch existing exams, subjects, and students
  const exams = await prisma.exam.findMany({
    include: { subject: true }
  });
  
  const subjects = await prisma.subject.findMany({
    orderBy: { name: 'asc' }
  });

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: { rollNumber: 'asc' }
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-pink-500/20 rounded-lg">
            <Award className="w-6 h-6 text-pink-400" />
          </div>
          Controller of Exams
        </h1>
        <p className="text-slate-400">Autonomous Examination Engine: Manage exams, input marks, and calculate SGPA instantly.</p>
      </div>

      <ExamControllerClient exams={exams} subjects={subjects} students={students} />
    </div>
  );
}
