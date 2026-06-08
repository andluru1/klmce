'use server';

import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/session';

export async function markAttendance(
  classSectionId: string,
  subjectId: string,
  dateIso: string,
  records: { userId: string; status: 'Present' | 'Absent' }[]
) {
  // 1. Re-verify the session cookie inside the action (Zero-Trust)
  const session = await verifySession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'FACULTY')) {
    throw new Error('Unauthorized Access Attempt Flagged');
  }

  const date = new Date(dateIso);
  const userIds = records.map((r) => r.userId);

  try {
    // Enterprise Grade: Wrap mutations in a Prisma $transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete any existing attendance records for this subject + date + users
      await tx.attendanceRecord.deleteMany({
        where: {
          subjectId,
          date: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lte: new Date(date.setHours(23, 59, 59, 999)),
          },
          userId: { in: userIds },
        },
      });

      // 2. Insert new attendance records
      await tx.attendanceRecord.createMany({
        data: records.map((r) => ({
          userId: r.userId,
          subjectId,
          date: new Date(dateIso),
          status: r.status,
        })),
      });

      // 3. Recalculate attendance percentage for all affected students
      for (const userId of userIds) {
        const studentRecords = await tx.attendanceRecord.findMany({
          where: { userId },
          select: { status: true },
        });

        if (studentRecords.length === 0) continue;

        const presentCount = studentRecords.filter((r) => r.status === 'Present').length;
        const pct = (presentCount / studentRecords.length) * 100;

        await tx.user.update({
          where: { id: userId },
          data: { attendancePct: parseFloat(pct.toFixed(2)) },
        });
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Attendance Transaction Failed:', error);
    return { error: 'Failed to save attendance. Transaction rolled back.' };
  }
}
