'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { verifySession } from '@/lib/session';

export async function assessFee(formData: FormData) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = formData.get('userId') as string;
    const feeType = formData.get('feeType') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const dueDateStr = formData.get('dueDate') as string;
    const remarks = formData.get('remarks') as string;

    if (!userId || !feeType || isNaN(amount) || !dueDateStr) {
      return { success: false, error: 'All fields are required.' };
    }

    const fee = await prisma.fee.create({
      data: {
        userId,
        feeType,
        amount,
        dueDate: new Date(dueDateStr),
        remarks,
        isPaid: false
      }
    });

    revalidatePath('/admin/finance');
    revalidatePath('/student/fees');
    revalidatePath('/student'); // Update dashboard KPI

    return { success: true, fee };
  } catch (error) {
    console.error('Failed to assess fee:', error);
    return { success: false, error: 'Failed to assign fee due to internal error.' };
  }
}
