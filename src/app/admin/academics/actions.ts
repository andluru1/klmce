'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { verifySession } from '@/lib/session';

export async function createSchedule(formData: FormData) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const classSectionId = formData.get('classSectionId') as string;
    const subjectId = formData.get('subjectId') as string;
    const facultyId = formData.get('facultyId') as string;
    const roomId = formData.get('roomId') as string;
    const dayOfWeek = formData.get('dayOfWeek') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;

    if (!classSectionId || !subjectId || !facultyId || !roomId || !dayOfWeek || !startTime || !endTime) {
      return { success: false, error: 'All fields are required.' };
    }

    const schedule = await prisma.schedule.create({
      data: {
        classSectionId,
        subjectId,
        facultyId,
        roomId,
        dayOfWeek,
        startTime,
        endTime
      }
    });

    revalidatePath('/admin/academics');
    revalidatePath('/student'); // Revalidate the today's classes widget

    return { success: true, schedule };
  } catch (error) {
    console.error('Failed to create schedule:', error);
    return { success: false, error: 'Failed to add class schedule due to internal error.' };
  }
}

export async function logAttendance(formData: FormData) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const scheduleId = formData.get('scheduleId') as string;
    const userId = formData.get('userId') as string;
    const dateStr = formData.get('date') as string;
    const status = formData.get('status') as string;

    if (!scheduleId || !userId || !dateStr || !status) {
      return { success: false, error: 'All fields required' };
    }

    const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) return { success: false, error: 'Schedule not found' };

    const record = await prisma.attendanceRecord.create({
      data: {
        userId,
        scheduleId,
        subjectId: schedule.subjectId,
        date: new Date(dateStr),
        status
      }
    });

    revalidatePath('/admin/academics');
    revalidatePath('/student/attendance');
    revalidatePath('/student');

    return { success: true, record };
  } catch (error) {
    console.error('Failed to log attendance:', error);
    return { success: false, error: 'Failed to log attendance' };
  }
}
