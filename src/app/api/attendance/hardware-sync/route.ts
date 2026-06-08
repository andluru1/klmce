import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rfid_tag, timestamp, machine_id } = body;

    if (!rfid_tag || !timestamp) {
      return NextResponse.json({ error: 'Missing rfid_tag or timestamp' }, { status: 400 });
    }

    const scanTime = new Date(timestamp);
    
    // Find Student
    const student = await prisma.user.findUnique({
      where: { rfidTag: rfid_tag }
    });

    if (!student) {
      // Log failure but return 200 so hardware doesn't retry infinitely
      await prisma.hardwareLog.create({
        data: { rfidTag: rfid_tag, timestamp: scanTime, machineId: machine_id || 'UNKNOWN' }
      });
      return NextResponse.json({ error: 'Student not found for this RFID' }, { status: 404 });
    }

    // Determine Day and Time
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[scanTime.getDay()];
    
    // Rough estimation of the current slot based on hour
    const hour = scanTime.getHours();
    const minute = scanTime.getMinutes();
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    // Find the class schedule for the student's section happening RIGHT NOW
    // We check if scan time is within [startTime, endTime] roughly
    // For simplicity in this demo, we'll find any schedule today for their section that covers this time block
    const schedules = await prisma.schedule.findMany({
      where: {
        classSectionId: student.classSectionId!,
        dayOfWeek: dayOfWeek
      }
    });

    let currentSchedule = null;
    for (const s of schedules) {
      // Very basic time comparison string vs string works if format is HH:MM
      if (timeString >= s.startTime && timeString <= s.endTime) {
        currentSchedule = s;
        break;
      }
    }

    // Log the raw hardware ping
    await prisma.hardwareLog.create({
      data: { rfidTag: rfid_tag, timestamp: scanTime, machineId: machine_id || 'UNKNOWN' }
    });

    if (!currentSchedule) {
      return NextResponse.json({ message: 'Ping recorded. No active class found at this time.' });
    }

    // Upsert Attendance Record
    // To avoid creating duplicates for the same day/subject
    const startOfDay = new Date(scanTime);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(scanTime);
    endOfDay.setHours(23, 59, 59, 999);

    const existingRecord = await prisma.attendanceRecord.findFirst({
      where: {
        userId: student.id,
        subjectId: currentSchedule.subjectId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (!existingRecord) {
      await prisma.attendanceRecord.create({
        data: {
          date: scanTime,
          status: 'Present',
          userId: student.id,
          subjectId: currentSchedule.subjectId
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      student: student.name,
      markedPresentFor: currentSchedule.subjectId
    });

  } catch (error: any) {
    console.error("Hardware Sync Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
