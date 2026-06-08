import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import VaultClient from './VaultClient';

export default async function StudentVaultPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'STUDENT') {
    redirect('/login?error=SessionExpired');
  }

  // Fetch full student details
  const student = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      department: true
    }
  });

  if (!student) redirect('/login?error=SessionExpired');

  // Fetch subjects for the current semester and department
  const subjects = await prisma.subject.findMany({
    where: {
      departmentId: student.departmentId!,
      semester: student.currentSem!
    }
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
      <div className="w-full max-w-5xl mx-auto pb-12 pt-8 px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">The Academic Vault</h1>
          <p className="text-slate-400 text-lg">Your master resources, syllabi, and official documents.</p>
        </div>
        
        <VaultClient 
          studentName={student.name}
          rollNumber={student.rollNumber}
          departmentName={student.department?.name || 'N/A'}
          semester={student.currentSem || 'N/A'}
          subjects={subjects.map(s => ({ id: s.id, name: s.name, code: s.code, credits: s.credits }))}
        />
      </div>
    </>
  );
}
