'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { verifySession } from '@/lib/session';

export async function resolveMisconduct(formData: FormData) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const recordId = formData.get('recordId') as string;
    const adminAction = formData.get('adminAction') as string;

    if (!recordId || !adminAction) {
      return { success: false, error: 'All fields are required.' };
    }

    const record = await prisma.disciplinaryRecord.update({
      where: { id: recordId },
      data: {
        adminAction,
        status: 'RESOLVED'
      }
    });

    revalidatePath('/admin/discipline');
    revalidatePath('/faculty/discipline');
    revalidatePath('/student/vault'); // Assuming vault shows disciplinary history
    revalidatePath('/student');

    return { success: true, record };
  } catch (error) {
    console.error('Failed to resolve misconduct:', error);
    return { success: false, error: 'Failed to save admin action.' };
  }
}
