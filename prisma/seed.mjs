import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting Perfect End-to-End Sync Seed...");

  // Clean Database
  await prisma.notification.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.classSection.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.room.deleteMany();
  await prisma.department.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Department
  const deptCSE = await prisma.department.create({
    data: { name: 'Computer Science & Engineering', code: '05' }
  });

  // 2. Class Section
  const cseA = await prisma.classSection.create({
    data: { name: 'CSE-A-III', semester: 'III-I', departmentId: deptCSE.id }
  });

  // 3. Admin User
  const admin = await prisma.user.create({
    data: {
      rollNumber: 'ADMIN-01',
      passwordHash,
      role: 'ADMIN',
      name: 'Super Admin',
      phone: '9999999999'
    }
  });

  // 4. Faculty User
  const faculty = await prisma.user.create({
    data: {
      rollNumber: 'FAC-CSE-01',
      passwordHash,
      role: 'FACULTY',
      name: 'Dr. Alan Turing',
      phone: '9876543210',
      departmentId: deptCSE.id
    }
  });

  // 5. Student User
  const student = await prisma.user.create({
    data: {
      rollNumber: '209Y1A0501',
      passwordHash,
      role: 'STUDENT',
      name: 'Alice Wonderland',
      phone: '8888888888',
      departmentId: deptCSE.id,
      classSectionId: cseA.id,
      currentSem: 'III-I',
      attendancePct: 82.5,
      busRoute: 'Route 1',
      busPassValid: true
    }
  });

  // 6. Subject
  const dsSubject = await prisma.subject.create({
    data: { code: 'CS301', name: 'Data Structures & Algorithms', credits: 4, departmentId: deptCSE.id }
  });
  const dbSubject = await prisma.subject.create({
    data: { code: 'CS302', name: 'Database Management Systems', credits: 3, departmentId: deptCSE.id }
  });

  // 7. Rooms
  const room101 = await prisma.room.create({
    data: { number: '101', capacity: 60, type: 'Classroom' }
  });
  const roomLab1 = await prisma.room.create({
    data: { number: 'Lab-1', capacity: 30, type: 'Lab' }
  });

  // 8. Schedules (The "Sync" Link)
  await prisma.schedule.create({
    data: {
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      subjectId: dsSubject.id,
      facultyId: faculty.id,
      roomId: room101.id,
      classSectionId: cseA.id
    }
  });
  
  await prisma.schedule.create({
    data: {
      dayOfWeek: 'Monday',
      startTime: '10:00',
      endTime: '11:00',
      subjectId: dbSubject.id,
      facultyId: faculty.id,
      roomId: room101.id,
      classSectionId: cseA.id
    }
  });

  // 9. Fee Record for Student
  await prisma.fee.create({
    data: {
      feeType: 'Tuition Fee',
      amount: 45000,
      isPaid: false,
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      userId: student.id,
      remarks: 'First installment'
    }
  });

  // 10. Global Announcement
  await prisma.announcement.create({
    data: {
      title: 'Welcome to Semester III-I',
      content: 'Please ensure you check your updated timetable on the dashboard. Classes start promptly at 9:00 AM.',
      category: 'Academic',
      importance: 'High',
      authorId: admin.id
    }
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
