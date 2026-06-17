"use server";

import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function saveCourseNote(subjectId: string, content: string) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'STUDENT') {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.courseNote.upsert({
      where: {
        studentId_subjectId: {
          studentId: sessionUser.id,
          subjectId: subjectId,
        }
      },
      update: { content },
      create: {
        studentId: sessionUser.id,
        subjectId: subjectId,
        content
      }
    });

    revalidatePath('/student/courses');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving course note:', error);
    return { success: false, error: error.message };
  }
}
