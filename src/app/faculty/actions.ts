'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { verifySession } from '@/lib/session';

export async function raiseMisconductRemark(formData: FormData) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'FACULTY') {
      return { success: false, error: 'Unauthorized. Only Faculty can raise remarks.' };
    }

    const studentId = formData.get('studentId') as string;
    const severity = formData.get('severity') as string;
    const description = formData.get('description') as string;

    if (!studentId || !severity || !description) {
      return { success: false, error: 'All fields are required.' };
    }

    const record = await prisma.disciplinaryRecord.create({
      data: {
        studentId,
        facultyId: session.userId,
        severity,
        description,
        status: 'PENDING'
      }
    });

    revalidatePath('/faculty/discipline');
    revalidatePath('/admin/discipline');
    revalidatePath('/student/vault');

    return { success: true, record };
  } catch (error) {
    console.error('Failed to raise remark:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}

export async function createLeaveRequest(data: { facultyId: string, startDate: string, endDate: string, reason: string }) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'FACULTY') throw new Error('Unauthorized');

    await prisma.leaveRequest.create({
      data: {
        facultyId: session.userId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason,
        status: 'PENDING'
      }
    });

    revalidatePath('/faculty/leaves');
    return { success: true };
  } catch (err) {
    console.error(err);
    throw err;
  }
}
