const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Injecting Hyper-Realistic Enterprise Data...");

  // Clean Database
  await prisma.transaction.deleteMany();
  await prisma.studentResult.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.disciplinaryRecord.deleteMany();
  await prisma.auditLog.deleteMany();
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

  // 1. Departments
  const deptCSE = await prisma.department.create({ data: { name: 'Computer Science & Engineering', code: '05' } });
  const deptECE = await prisma.department.create({ data: { name: 'Electronics & Communication', code: '04' } });
  const deptMECH = await prisma.department.create({ data: { name: 'Mechanical Engineering', code: '03' } });

  // 2. Class Sections
  const cseA = await prisma.classSection.create({ data: { name: 'CSE-A-III', semester: 'III-I', departmentId: deptCSE.id } });
  const cseB = await prisma.classSection.create({ data: { name: 'CSE-B-III', semester: 'III-I', departmentId: deptCSE.id } });
  const eceA = await prisma.classSection.create({ data: { name: 'ECE-A-II', semester: 'II-II', departmentId: deptECE.id } });

  // 3. Admin User
  const admin = await prisma.user.create({
    data: { rollNumber: 'ADMIN-01', passwordHash, role: 'ADMIN', name: 'Dr. V.S.S. Murthy', phone: '9848012345' }
  });

  // 4. Faculty Users
  const faculty1 = await prisma.user.create({
    data: { rollNumber: 'FAC-CSE-01', passwordHash, role: 'FACULTY', name: 'Dr. V. Lokeswara Reddy', phone: '9876543210', departmentId: deptCSE.id }
  });
  const faculty2 = await prisma.user.create({
    data: { rollNumber: 'FAC-CSE-02', passwordHash, role: 'FACULTY', name: 'Prof. M.V. Narayana', phone: '9876543211', departmentId: deptCSE.id }
  });
  const faculty3 = await prisma.user.create({
    data: { rollNumber: 'FAC-ECE-01', passwordHash, role: 'FACULTY', name: 'Dr. G. Hemalatha', phone: '9876543212', departmentId: deptECE.id }
  });

  // 5. Subjects
  // Semester I-I (Past)
  const subjMath1 = await prisma.subject.create({ data: { code: 'MA101', name: 'Engineering Mathematics I', credits: 4, semester: 'I-I', departmentId: deptCSE.id } });
  const subjPhy = await prisma.subject.create({ data: { code: 'PH101', name: 'Engineering Physics', credits: 3, semester: 'I-I', departmentId: deptCSE.id } });
  
  // Semester II-I (Past)
  const subjC = await prisma.subject.create({ data: { code: 'CS201', name: 'Programming in C', credits: 4, semester: 'II-I', departmentId: deptCSE.id } });

  // Semester III-I (Current for CSE)
  const subjDS = await prisma.subject.create({ data: { code: 'CS301', name: 'Data Structures & Algorithms', credits: 4, semester: 'III-I', departmentId: deptCSE.id } });
  const subjDB = await prisma.subject.create({ data: { code: 'CS302', name: 'Database Management Systems', credits: 3, semester: 'III-I', departmentId: deptCSE.id } });
  const subjOS = await prisma.subject.create({ data: { code: 'CS303', name: 'Operating Systems', credits: 4, semester: 'III-I', departmentId: deptCSE.id } });
  
  // Semester IV-I (Upcoming for CSE)
  const subjAI = await prisma.subject.create({ data: { code: 'CS401', name: 'Artificial Intelligence', credits: 4, semester: 'IV-I', departmentId: deptCSE.id } });
  const subjML = await prisma.subject.create({ data: { code: 'CS402', name: 'Machine Learning', credits: 4, semester: 'IV-I', departmentId: deptCSE.id } });

  // ECE Subject
  const subjSS = await prisma.subject.create({ data: { code: 'EC201', name: 'Signals and Systems', credits: 4, semester: 'II-II', departmentId: deptECE.id } });

  // 6. Rooms
  const r101 = await prisma.room.create({ data: { number: '101', capacity: 60, type: 'Classroom' } });
  const r102 = await prisma.room.create({ data: { number: '102', capacity: 60, type: 'Classroom' } });
  const rLab1 = await prisma.room.create({ data: { number: 'Lab-1', capacity: 30, type: 'Lab' } });

  // 7. Synthetic Students
  const firstNames = ['Arjun', 'Priya', 'Rahul', 'Sneha', 'Karthik', 'Ananya', 'Vikram', 'Divya', 'Sanjay', 'Neha'];
  const lastNames = ['Reddy', 'Sharma', 'Patel', 'Rao', 'Kumar', 'Singh', 'Deshmukh', 'Iyer', 'Nair', 'Menon'];

  const students = [];
  let rollIdx = 1;
  for (const fName of firstNames) {
    for (const lName of lastNames) {
      if (rollIdx > 30) break; // Limit to 30 students
      
      const isCSE = rollIdx <= 20;
      const sectionId = isCSE ? (rollIdx <= 10 ? cseA.id : cseB.id) : eceA.id;
      const deptId = isCSE ? deptCSE.id : deptECE.id;
      const code = rollIdx.toString().padStart(2, '0');
      const rollNum = `209Y1A${isCSE ? '05' : '04'}${code}`;

      const student = await prisma.user.create({
        data: {
          rollNumber: rollNum,
          passwordHash,
          role: 'STUDENT',
          name: `${fName} ${lName}`,
          phone: `9${Math.floor(Math.random() * 900000000 + 100000000)}`,
          departmentId: deptId,
          classSectionId: sectionId,
          currentSem: isCSE ? 'III-I' : 'II-II',
          attendancePct: Math.floor(Math.random() * 30 + 65), // 65% to 95%
          rfidTag: `RFID-${rollNum}`
        }
      });
      students.push(student);
      rollIdx++;
    }
  }

  // 8. Financial Transactions (Ledger Data)
  for (const s of students) {
    const feeAmount = 45000;
    const isPaid = Math.random() > 0.4; // 60% paid, 40% pending

    const fee = await prisma.fee.create({
      data: {
        feeType: 'Tuition Fee 2024-25',
        amount: feeAmount,
        isPaid: isPaid,
        paidDate: isPaid ? new Date(Date.now() - Math.random() * 10000000000) : null,
        paymentMode: isPaid ? 'Mock Gateway' : null,
        paymentRef: isPaid ? `MOCK-PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}` : null,
        dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        userId: s.id,
        remarks: 'Mandatory semester fee'
      }
    });

    if (isPaid) {
      await prisma.transaction.create({
        data: {
          userId: s.id,
          amount: feeAmount,
          status: 'SUCCESS',
          receiptNumber: `REC-${Math.floor(Math.random() * 1000000)}`,
          gatewayReference: fee.paymentRef,
          transactionDate: fee.paidDate
        }
      });
    }
  }

  // 9. Examinations & Results (For NAAC / Zero-Backlog Calculation)
  // Past Exams (Sem I-I and II-I)
  const examMath1 = await prisma.exam.create({ data: { subjectId: subjMath1.id, date: new Date('2023-12-15'), startTime: '09:30', endTime: '12:30', roomId: r101.id, maxMarks: 100, examType: 'Final' } });
  const examPhy = await prisma.exam.create({ data: { subjectId: subjPhy.id, date: new Date('2023-12-18'), startTime: '14:00', endTime: '17:00', roomId: r102.id, maxMarks: 100, examType: 'Final' } });
  const examC = await prisma.exam.create({ data: { subjectId: subjC.id, date: new Date('2024-12-15'), startTime: '09:30', endTime: '12:30', roomId: r101.id, maxMarks: 100, examType: 'Final' } });

  // Current Exams (Sem III-I)
  const examDS = await prisma.exam.create({ data: { subjectId: subjDS.id, date: new Date('2025-05-10'), startTime: '10:00', endTime: '13:00', roomId: r101.id, maxMarks: 100, examType: 'Mid-Term' } });
  const examDB = await prisma.exam.create({ data: { subjectId: subjDB.id, date: new Date('2025-05-12'), startTime: '14:00', endTime: '17:00', roomId: r102.id, maxMarks: 100, examType: 'Mid-Term' } });

  // Upcoming Exam (In the future)
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 10);
  const examOSUpcoming = await prisma.exam.create({ data: { subjectId: subjOS.id, date: futureDate, startTime: '09:00', endTime: '12:00', roomId: r101.id, maxMarks: 100, examType: 'Final' } });

  for (const s of students) {
    if (s.departmentId === deptCSE.id) {
      // Inject Past Results
      const pastExams = [examMath1, examPhy, examC];
      for (const e of pastExams) {
        const marks = Math.floor(Math.random() * 50 + 45); // 45 to 95
        await prisma.studentResult.create({
          data: {
            studentId: s.id,
            examId: e.id,
            marksObtained: marks,
            gradePoint: marks >= 90 ? 10 : marks >= 80 ? 9 : marks >= 70 ? 8 : marks >= 60 ? 7 : marks >= 50 ? 6 : marks >= 40 ? 5 : 0
          }
        });
      }

      // Inject Current Results
      const currentExams = [examDS, examDB];
      for (const e of currentExams) {
        const marks = Math.floor(Math.random() * 60 + 35); // 35 to 95
        await prisma.studentResult.create({
          data: {
            studentId: s.id,
            examId: e.id,
            marksObtained: marks,
            gradePoint: marks >= 90 ? 10 : marks >= 80 ? 9 : marks >= 70 ? 8 : marks >= 60 ? 7 : marks >= 50 ? 6 : marks >= 40 ? 5 : 0
          }
        });
      }
    }
  }
  // 10. Schedules (Timetable)
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const createdSchedules = [];
  for (const day of days) {
    // CSE-A-III Schedule
    const sch1 = await prisma.schedule.create({
      data: {
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '10:00',
        subjectId: subjDS.id,
        facultyId: faculty1.id,
        roomId: r101.id,
        classSectionId: cseA.id
      }
    });
    const sch2 = await prisma.schedule.create({
      data: {
        dayOfWeek: day,
        startTime: '10:15',
        endTime: '11:15',
        subjectId: subjDB.id,
        facultyId: faculty2.id,
        roomId: r102.id,
        classSectionId: cseA.id
      }
    });
    // ECE-A-II Schedule
    const sch3 = await prisma.schedule.create({
      data: {
        dayOfWeek: day,
        startTime: '11:30',
        endTime: '12:30',
        subjectId: subjSS.id,
        facultyId: faculty3.id,
        roomId: r101.id,
        classSectionId: eceA.id
      }
    });
    createdSchedules.push(sch1, sch2, sch3);
  }

  // 10.5 Detailed Historical Attendance Ledger
  // Simulate past 14 days of classes
  const now = new Date();
  for (const s of students) {
    for (let i = 0; i < 14; i++) {
      const pastDate = new Date(now);
      pastDate.setDate(now.getDate() - i);
      const dayName = days[pastDate.getDay()];

      // Find schedules for this student's class section on this day
      const dailySchedules = createdSchedules.filter(sch => sch.dayOfWeek === dayName && sch.classSectionId === s.classSectionId);

      for (const sch of dailySchedules) {
        const isPresent = Math.random() > 0.15; // 85% chance of being present
        await prisma.attendanceRecord.create({
          data: {
            date: pastDate,
            status: isPresent ? 'Present' : 'Absent',
            userId: s.id,
            subjectId: sch.subjectId,
            scheduleId: sch.id
          }
        });
      }
    }
  }

  // 11. Notifications
  for (const s of students) {
    await prisma.notification.create({
      data: {
        recipientId: s.id,
        title: 'Mid-Term Exam Schedule',
        message: 'The Mid-1 examinations will commence from next week. Check your portal for the detailed timetable.',
        type: 'ACADEMIC',
        isRead: false
      }
    });

    const pendingFee = await prisma.fee.findFirst({ where: { userId: s.id, isPaid: false } });
    if (pendingFee) {
      await prisma.notification.create({
        data: {
          recipientId: s.id,
          title: 'Fee Payment Reminder',
          message: `Your fee of ₹${pendingFee.amount} is pending. Please clear your dues immediately.`,
          type: 'FEE',
          isRead: false
        }
      });
    }
  }

  // 12. Create Mock Disciplinary Records
  console.log('Seeding Disciplinary Records...');
  await prisma.disciplinaryRecord.createMany({
    data: [
      {
        studentId: students[0].id,
        facultyId: faculty1.id,
        severity: "Low",
        description: "Using mobile phone during Data Structures lecture despite repeated warnings.",
        status: "PENDING"
      },
      {
        studentId: students[0].id,
        facultyId: faculty2.id,
        severity: "High",
        description: "Caught engaging in a physical altercation in the hallway near Lab-3.",
        adminAction: "Suspended for 3 days and parents informed.",
        status: "RESOLVED"
      }
    ]
  });

  console.log('🎉 Database seeding complete!');
  console.log(`Successfully generated ${students.length} students with hyper-realistic schedules, financial ledgers, and academic results!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
