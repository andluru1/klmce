import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ExamClient from './ExamClient';

export default async function ActiveExamPage({ params }: { params: { examId: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'STUDENT') redirect('/login');

  const { examId } = await params;

  const exam = await prisma.onlineExam.findUnique({
    where: { id: examId },
    include: {
      subject: true,
      questions: {
        include: {
          options: { select: { id: true, text: true } } // Don't send isCorrect to client!
        }
      }
    }
  });

  if (!exam) redirect('/student/exam-center');

  // Check for existing attempt
  let attempt = await prisma.examAttempt.findFirst({
    where: {
      examId: exam.id,
      studentId: sessionUser.id
    }
  });

  if (!attempt) {
    // Start new attempt
    attempt = await prisma.examAttempt.create({
      data: {
        examId: exam.id,
        studentId: sessionUser.id,
        status: 'IN_PROGRESS'
      }
    });
  } else if (attempt.status !== 'IN_PROGRESS') {
    // Already completed or violated
    redirect('/student/exam-center');
  }

  // Ensure the student can't see the expected text keywords for text questions
  const sanitizedExam = {
    ...exam,
    questions: exam.questions.map(q => ({
      ...q,
      text: q.text.split('|||')[0] // Only send the question part, not the keywords
    }))
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30">
      <ExamClient 
        attemptId={attempt.id} 
        exam={sanitizedExam} 
        isProctored={exam.isProctored} 
        initialAnswers={(attempt.progressData as Record<string, string>) || {}}
      />
    </div>
  );
}
