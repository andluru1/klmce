'use server';

import prisma from '@/lib/prisma';

/**
 * Scheduled to run daily at 10:00 AM.
 * Finds all students who had a class in the "09:00" slot but do not have an AttendanceRecord for today.
 */
export async function generateDailyAbsenceReport() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const dayOfWeek = days[today.getDay()];

  // 1. Find all schedules starting at 09:00 today
  const morningSchedules = await prisma.schedule.findMany({
    where: {
      dayOfWeek: dayOfWeek,
      startTime: '09:00'
    },
    include: {
      classSection: {
        include: {
          users: true // All students in this section
        }
      },
      subject: true
    }
  });

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  let missingCount = 0;

  for (const schedule of morningSchedules) {
    const students = schedule.classSection.users.filter(u => u.role === 'STUDENT');
    
    for (const student of students) {
      // Check if student has an AttendanceRecord
      const attendance = await prisma.attendanceRecord.findFirst({
        where: {
          userId: student.id,
          subjectId: schedule.subjectId,
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      if (!attendance) {
        // Log Absence as an internal system notification
        await prisma.notification.create({
          data: {
            recipientId: student.id, // We'll send an alert to the student
            title: "Absent Alert",
            message: `You were marked absent for ${schedule.subject.name} at 09:00.`,
            type: "ATTENDANCE"
          }
        });
        missingCount++;
      }
    }
  }

  return { success: true, absenteesFound: missingCount };
}
