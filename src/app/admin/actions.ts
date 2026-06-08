'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function postAnnouncement(data: { title: string; content: string; authorId: string; category?: string; importance?: string; attachmentUrl?: string | null }) {
  if (!data.title || !data.content || !data.authorId) {
    throw new Error('Missing required fields');
  }

  await prisma.announcement.create({
    data: {
      title: data.title,
      content: data.content,
      authorId: data.authorId,
      category: data.category || 'General',
      importance: data.importance || 'Medium',
      attachmentUrl: data.attachmentUrl || null,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/dashboard');
}

export async function deleteAnnouncement(id: string) {
  await prisma.announcement.delete({
    where: { id },
  });
  revalidatePath('/admin/announcements');
  revalidatePath('/admin');
}

export async function registerUser(data: { rollNumber: string; password?: string; role: string; name: string; departmentId: string; currentSem: string; busRoute?: string; classSectionId?: string; }) {
  if (!data.rollNumber || !data.name) {
    throw new Error('Missing required fields');
  }

  const existingUser = await prisma.user.findUnique({
    where: { rollNumber: data.rollNumber },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  const passToHash = data.password || 'password123';
  const passwordHash = await bcrypt.hash(passToHash, 10);

  await prisma.user.create({
    data: {
      rollNumber: data.rollNumber,
      passwordHash,
      role: data.role,
      name: data.name,
      departmentId: data.departmentId || null,
      classSectionId: data.classSectionId || null,
      currentSem: data.currentSem || null,
      busRoute: data.busRoute || null,
      attendancePct: 0,
      busPassValid: !!data.busRoute,
    },
  });

  revalidatePath('/admin/users');
  revalidatePath('/admin');
}

export async function bulkRegisterUsers(csvText: string) {
  const rows = csvText.split('\n').map(r => r.trim()).filter(r => r.length > 0);
  if (rows.length < 2) throw new Error('CSV is empty or missing data');

  const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
  
  // Find indices
  const idxRoll = headers.indexOf('rollnumber');
  const idxName = headers.indexOf('name');
  const idxRole = headers.indexOf('role');
  const idxDept = headers.indexOf('departmentcode');
  const idxSem = headers.indexOf('currentsem');

  if (idxRoll === -1 || idxName === -1) {
    throw new Error('CSV must contain rollNumber and name columns');
  }

  const departments = await prisma.department.findMany();
  const deptMap = new Map(departments.map(d => [d.code, d.id]));

  const usersToCreate = [];
  const defaultPass = await bcrypt.hash('password123', 10);

  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i].split(',').map(c => c.trim());
    const rollNumber = cols[idxRoll];
    if (!rollNumber) continue;

    const name = cols[idxName];
    const role = (idxRole !== -1 && cols[idxRole]) ? cols[idxRole].toUpperCase() : 'STUDENT';
    const deptCode = idxDept !== -1 ? cols[idxDept] : '';
    const currentSem = idxSem !== -1 ? cols[idxSem] : null;

    usersToCreate.push({
      rollNumber,
      name,
      role: ['STUDENT', 'ADMIN'].includes(role) ? role : 'STUDENT',
      passwordHash: defaultPass,
      departmentId: deptMap.get(deptCode) || null,
      currentSem,
      attendancePct: 0,
      busPassValid: false,
    });
  }

  if (usersToCreate.length === 0) {
    throw new Error('No valid users found in CSV');
  }

  // Use createMany to insert them (skips existing roll numbers to avoid crash)
  const result = await prisma.user.createMany({
    data: usersToCreate
  });

  revalidatePath('/admin/users');
  revalidatePath('/admin');

  return { count: result.count };
}

export async function updateFee(feeId: string, data: { isPaid: boolean; paidDate?: Date | null; paymentMode?: string | null; paymentRef?: string | null; remarks?: string | null; amount?: number }) {
  await prisma.fee.update({
    where: { id: feeId },
    data: {
      isPaid: data.isPaid,
      paidDate: data.paidDate !== undefined ? data.paidDate : undefined,
      paymentMode: data.paymentMode !== undefined ? data.paymentMode : undefined,
      paymentRef: data.paymentRef !== undefined ? data.paymentRef : undefined,
      remarks: data.remarks !== undefined ? data.remarks : undefined,
      amount: data.amount !== undefined ? data.amount : undefined,
    }
  });

  revalidatePath('/admin/fees');
  revalidatePath('/admin');
}

export async function uploadAttendance(records: { rollNo: string; attendance: number }[]) {
  if (!records || records.length === 0) {
    throw new Error('Invalid input');
  }

  let successful = 0;
  for (const record of records) {
    if (!record.rollNo || isNaN(record.attendance)) continue;

    const user = await prisma.user.findUnique({ where: { rollNumber: record.rollNo } });
    if (!user) continue;

    await prisma.user.update({
      where: { id: user.id },
      data: { attendancePct: record.attendance }
    });
    successful++;
  }

  revalidatePath('/admin/users');
  revalidatePath('/admin');
  return { success: true, count: successful, total: records.length };
}

export async function uploadFees(records: { rollNo: string; feeType: string; amount: number; dueDate: string }[]) {
  if (!records || records.length === 0) {
    throw new Error('Invalid input');
  }

  let successful = 0;
  for (const record of records) {
    if (!record.rollNo || !record.feeType || isNaN(record.amount)) continue;

    const user = await prisma.user.findUnique({ where: { rollNumber: record.rollNo } });
    if (!user) continue;

    await prisma.fee.create({
      data: {
        userId: user.id,
        feeType: record.feeType,
        amount: record.amount,
        isPaid: false,
        dueDate: new Date(record.dueDate || new Date()),
      }
    });
    successful++;
  }

  revalidatePath('/admin/users');
  revalidatePath('/admin');
  return { success: true, count: successful, total: records.length };
}

export async function updateSystemConfig(key: string, value: string) {
  await prisma.systemConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  revalidatePath('/admin/settings');
  revalidatePath('/admin');
}

export async function updateUserRole(rollNumber: string, newRole: string) {
  const user = await prisma.user.update({
    where: { rollNumber },
    data: { role: newRole },
  });
  revalidatePath('/admin/settings');
  revalidatePath('/admin/users');
  revalidatePath('/admin/faculty');
  return user;
}

export async function createSchedule(data: {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  facultyId: string;
  roomId: string;
  classSectionId: string;
}) {
  const roomConflict = await prisma.schedule.findFirst({
    where: {
      roomId: data.roomId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
    }
  });

  if (roomConflict) throw new Error("Room is already booked at this time.");

  const facultyConflict = await prisma.schedule.findFirst({
    where: {
      facultyId: data.facultyId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
    }
  });

  if (facultyConflict) throw new Error("Faculty is already scheduled to teach at this time.");

  const schedule = await prisma.schedule.create({
    data: {
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      subjectId: data.subjectId,
      facultyId: data.facultyId,
      roomId: data.roomId,
      classSectionId: data.classSectionId,
    }
  });

  revalidatePath(`/admin/academics`);
  revalidatePath(`/admin/academics/timetable/${data.classSectionId}`);
  return schedule;
}
export async function getAvailableFaculty(dayOfWeek: string, startTime: string, departmentId: string) {
  // Find faculty in the same department who DO NOT have a schedule at this time
  const faculty = await prisma.user.findMany({
    where: {
      role: 'FACULTY',
      departmentId,
      schedules: {
        none: {
          dayOfWeek,
          startTime
        }
      }
    },
    select: {
      id: true,
      name: true,
      phone: true,
      rollNumber: true,
    }
  });
  return faculty;
}

export async function substituteFaculty(scheduleId: string, newFacultyId: string) {
  const schedule = await prisma.schedule.update({
    where: { id: scheduleId },
    data: { facultyId: newFacultyId }
  });
  revalidatePath('/admin/academics/adjustments');
  revalidatePath('/admin/academics/timetable');
  return schedule;
}

export async function sendBulkNotification(data: {
  title: string;
  message: string;
  type: string;
  targetRole: string; // 'ALL', 'STUDENT', 'FACULTY'
  departmentId?: string; // Optional filter
  semester?: string; // Optional filter
  attendanceThreshold?: number; // Optional filter (e.g. 75 for < 75%)
}) {
  // Build query
  const whereClause: any = {};
  
  if (data.targetRole !== 'ALL') {
    whereClause.role = data.targetRole;
  }
  
  if (data.departmentId) {
    whereClause.departmentId = data.departmentId;
  }
  
  if (data.semester) {
    whereClause.currentSem = data.semester;
  }
  
  if (data.attendanceThreshold !== undefined && data.attendanceThreshold !== null) {
    whereClause.attendancePct = { lt: data.attendanceThreshold };
  }

  // Fetch recipients
  const users = await prisma.user.findMany({
    where: whereClause,
    select: { id: true }
  });

  if (users.length === 0) {
    return { count: 0, message: "No users matched the filters." };
  }

  // Insert notifications
  const notifications = users.map(u => ({
    recipientId: u.id,
    title: data.title,
    message: data.message,
    type: data.type
  }));

  const result = await prisma.notification.createMany({
    data: notifications
  });

  return { count: result.count, message: `Successfully sent to ${result.count} users.` };
}

export async function getUserNotifications(userId: string) {
  return await prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function markNotificationRead(id: string) {
  const notif = await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });
  revalidatePath('/student/notifications');
  revalidatePath('/faculty/notifications');
  return notif;
}
