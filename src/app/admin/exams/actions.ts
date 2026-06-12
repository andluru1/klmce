'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { verifySession } from '@/lib/session';

export async function createExam(formData: FormData) {
  try {
    const subjectId = formData.get('subjectId') as string;
    const dateStr = formData.get('date') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const roomId = formData.get('roomId') as string;
    const examType = formData.get('examType') as string;
    const maxMarks = parseInt(formData.get('maxMarks') as string, 10);

    if (!subjectId || !dateStr || !startTime || !endTime || !roomId || !examType || isNaN(maxMarks)) {
      return { success: false, error: 'All fields are required.' };
    }

    const date = new Date(dateStr);

    const exam = await prisma.exam.create({
      data: {
        subjectId,
        date,
        startTime,
        endTime,
        roomId,
        examType,
        maxMarks
      }
    });

    // Instantly revalidate the student dashboard so the new exam appears
    revalidatePath('/student');
    revalidatePath('/admin/exams');

    return { success: true, exam };
  } catch (error) {
    console.error('Failed to create exam:', error);
    return { success: false, error: 'Failed to schedule the examination in the database.' };
  }
}

export async function enterMarks(formData: FormData) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const examId = formData.get('examId') as string;
    const studentId = formData.get('studentId') as string;
    const marksObtainedStr = formData.get('marksObtained') as string;

    if (!examId || !studentId || !marksObtainedStr) {
      return { success: false, error: 'All fields are required.' };
    }

    const marksObtained = parseInt(marksObtainedStr, 10);

    // Calculate Grade Point (Mock Logic)
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) return { success: false, error: 'Exam not found' };
    
    const percentage = (marksObtained / exam.maxMarks) * 100;
    let gradePoint = 0;
    if (percentage >= 90) gradePoint = 10;
    else if (percentage >= 80) gradePoint = 9;
    else if (percentage >= 70) gradePoint = 8;
    else if (percentage >= 60) gradePoint = 7;
    else if (percentage >= 50) gradePoint = 6;
    else if (percentage >= 40) gradePoint = 5;

    const result = await prisma.studentResult.create({
      data: {
        examId,
        studentId,
        marksObtained,
        gradePoint
      }
    });

    revalidatePath('/admin/exams');
    revalidatePath('/student/results');
    revalidatePath('/student');

    return { success: true, result };
  } catch (error) {
    console.error('Failed to enter marks:', error);
    return { success: false, error: 'Failed to enter marks.' };
  }
}
