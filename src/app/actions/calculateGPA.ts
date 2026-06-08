'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Calculates the SGPA for a given student based on their exam results.
 * Formula: Sum(Credits * GradePoints) / Sum(Credits)
 */
export async function calculateSGPA(studentId: string) {
  // Fetch all results for the student, including the exam and its subject to get credits
  const results = await prisma.studentResult.findMany({
    where: { studentId },
    include: {
      exam: {
        include: {
          subject: true
        }
      }
    }
  });

  if (results.length === 0) {
    return 0;
  }

  let totalCreditPoints = 0;
  let totalCredits = 0;

  for (const result of results) {
    const credits = result.exam.subject.credits;
    totalCreditPoints += credits * result.gradePoint;
    totalCredits += credits;
  }

  if (totalCredits === 0) return 0;

  const sgpa = totalCreditPoints / totalCredits;
  
  // Return formatted SGPA to 2 decimal places
  return parseFloat(sgpa.toFixed(2));
}

/**
 * Submits a new student mark, and then automatically recalculates and returns their new SGPA.
 */
export async function submitStudentMark(data: { studentId: string; examId: string; marksObtained: number; maxMarks: number }) {
  // Basic percentage to Grade Point conversion (out of 10)
  const percentage = (data.marksObtained / data.maxMarks) * 100;
  let gradePoint = 0;

  if (percentage >= 90) gradePoint = 10;
  else if (percentage >= 80) gradePoint = 9;
  else if (percentage >= 70) gradePoint = 8;
  else if (percentage >= 60) gradePoint = 7;
  else if (percentage >= 50) gradePoint = 6;
  else if (percentage >= 40) gradePoint = 5;
  else gradePoint = 0; // Fail

  // Upsert result to prevent duplicates for the same exam
  await prisma.studentResult.create({
    data: {
      studentId: data.studentId,
      examId: data.examId,
      marksObtained: data.marksObtained,
      gradePoint,
    }
  });

  // Calculate the new SGPA
  const newSGPA = await calculateSGPA(data.studentId);

  revalidatePath('/admin/academics/exams');
  
  return { success: true, newSGPA, gradePoint };
}
