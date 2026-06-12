import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ExamCreatorClient from './ExamCreatorClient';
import { FileSpreadsheet } from 'lucide-react';

export default async function ExamCreatorPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'FACULTY') redirect('/login');

  const faculty = await prisma.user.findUnique({
    where: { id: sessionUser.id }
  });

  const subjects = await prisma.subject.findMany({
    where: { departmentId: faculty?.departmentId || undefined }
  });

  return (
    <div className="w-full max-w-5xl mx-auto p-8 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-indigo-500" />
          Exam Engine: Creator
        </h1>
        <p className="text-slate-400 mt-2">
          Design CAs, Mid-Terms, and Practice Tests with auto-evaluation rules.
        </p>
      </div>

      <ExamCreatorClient subjects={subjects.map(s => ({ id: s.id, name: s.name, code: s.code }))} />
    </div>
  );
}
