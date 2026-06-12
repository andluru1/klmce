'use server';

import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// We rely on standard Vercel environment routing.

export async function createOnlineExam(data: {
  title: string;
  subjectId: string;
  type: string;
  durationMin: number;
  isProctored: boolean;
  questions: {
    text: string;
    marks: number;
    options: { text: string; isCorrect: boolean }[];
  }[];
}) {
  const session = await getSessionUser();
  if (!session || session.role !== 'FACULTY') return { error: 'Unauthorized' };

  try {
    const exam = await prisma.onlineExam.create({
      data: {
        title: data.title,
        subjectId: data.subjectId,
        type: data.type,
        durationMin: data.durationMin,
        isProctored: data.isProctored,
        questions: {
          create: data.questions.map(q => ({
            text: q.text,
            marks: q.marks,
            options: {
              create: q.options.map(o => ({
                text: o.text,
                isCorrect: o.isCorrect
              }))
            }
          }))
        }
      }
    });
    
    revalidatePath('/faculty/exams');
    return { success: true, examId: exam.id };
  } catch (error) {
    console.error('Error creating exam:', error);
    return { error: 'Failed to create exam' };
  }
}

export async function logProctorViolation(attemptId: string, violationType: string) {
  const session = await getSessionUser();
  if (!session || session.role !== 'STUDENT') return { error: 'Unauthorized' };

  try {
    await prisma.proctorLog.create({
      data: {
        attemptId,
        violation: violationType
      }
    });

    // If violations exceed 3, automatically terminate the exam attempt
    const logs = await prisma.proctorLog.count({ where: { attemptId } });
    if (logs >= 3) {
      await prisma.examAttempt.update({
        where: { id: attemptId },
        data: { status: 'VIOLATED', completedAt: new Date() }
      });
      return { action: 'TERMINATE' };
    }

    return { action: 'WARN' };
  } catch (error) {
    console.error('Proctoring Error:', error);
    return { error: 'Failed to log violation' };
  }
}

export async function submitExam(attemptId: string, answers: Record<string, string>) {
  const session = await getSessionUser();
  if (!session || session.role !== 'STUDENT') return { error: 'Unauthorized' };

  try {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { exam: { include: { questions: { include: { options: true } } } } }
    });

    if (!attempt || attempt.studentId !== session.id) return { error: 'Invalid attempt' };
    if (attempt.status !== 'IN_PROGRESS') return { error: 'Exam already completed' };

    let totalScore = 0;
    let maxPossibleScore = 0;

    // Auto-Evaluation Engine
    for (const question of attempt.exam.questions) {
      maxPossibleScore += question.marks;
      const studentAnswer = answers[question.id];

      if (!studentAnswer) continue;

      if (question.options.length > 0) {
        // MCQ Evaluation
        const correctOption = question.options.find(o => o.isCorrect);
        if (correctOption && correctOption.id === studentAnswer) {
          totalScore += question.marks;
        }
      } else {
        // Text-Matching Evaluation (Basic keyword inclusion for short answers)
        // In a production system, this could invoke an AI evaluation route
        const expectedKeywords = question.text.split('|||')[1]?.split(',') || []; 
        if (expectedKeywords.length > 0) {
          const matchCount = expectedKeywords.filter(kw => 
            studentAnswer.toLowerCase().includes(kw.toLowerCase().trim())
          ).length;
          
          if (matchCount > 0) {
            // Partial grading based on keyword matches
            const ratio = matchCount / expectedKeywords.length;
            totalScore += Math.floor(question.marks * ratio);
          }
        }
      }
    }

    // Mark attempt as completed
    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'COMPLETED',
        score: totalScore,
        completedAt: new Date()
      }
    });

    // If it's a CA or MID_TERM, inject into official StudentResult table
    if (attempt.exam.type === 'CA' || attempt.exam.type === 'MID_TERM') {
      // Convert to 10-point grade scale
      const percentage = (totalScore / maxPossibleScore) * 100;
      let gradePoint = 0;
      if (percentage >= 90) gradePoint = 10;
      else if (percentage >= 80) gradePoint = 9;
      else if (percentage >= 70) gradePoint = 8;
      else if (percentage >= 60) gradePoint = 7;
      else if (percentage >= 50) gradePoint = 6;
      else if (percentage >= 40) gradePoint = 5;

      // Note: This assumes Exam mapping exists. We use attemptId as a placeholder or create a linked actual Exam.
      // For simplicity, we just save the score to the Attempt record for now since it's fully tracked.
    }

    revalidatePath('/student/exam-center');
    return { success: true, score: totalScore, max: maxPossibleScore };

  } catch (error) {
    console.error('Evaluation Error:', error);
    return { error: 'Evaluation failed' };
  }
}

export async function syncExamProgress(attemptId: string, progressData: any) {
  const session = await getSessionUser();
  if (!session || session.role !== 'STUDENT') return { error: 'Unauthorized' };

  try {
    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: { progressData }
    });
    return { success: true };
  } catch (error) {
    console.error('Auto-save error:', error);
    return { error: 'Failed to auto-save' };
  }
}
