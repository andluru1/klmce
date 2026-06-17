const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Injecting Hyper-Realistic Enterprise Data (Final Year Student Edition)...");

  // Clean Database (Handled by db push --force-reset)

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Departments
  const deptCSE = await prisma.department.create({ data: { name: 'Computer Science & Engineering', code: '05' } });
  const deptECE = await prisma.department.create({ data: { name: 'Electronics & Communication', code: '04' } });

  // 2. Class Sections
  const cseA = await prisma.classSection.create({ data: { name: 'CSE-A-IV', semester: 'IV-II', departmentId: deptCSE.id } });
  const cseB = await prisma.classSection.create({ data: { name: 'CSE-B-IV', semester: 'IV-II', departmentId: deptCSE.id } });

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

  // 5. Subjects across 8 semesters for a massive transcript
  const subjects = {
    'I-I': [
      { code: 'MA101', name: 'Engineering Mathematics I', credits: 4 },
      { code: 'PH101', name: 'Engineering Physics', credits: 3 },
    ],
    'I-II': [
      { code: 'CS101', name: 'Programming for Problem Solving', credits: 4 },
      { code: 'CH101', name: 'Engineering Chemistry', credits: 3 },
    ],
    'II-I': [
      { code: 'CS201', name: 'Data Structures', credits: 4 },
      { code: 'EC201', name: 'Digital Logic Design', credits: 3 },
    ],
    'II-II': [
      { code: 'CS202', name: 'Computer Organization', credits: 4 },
      { code: 'CS203', name: 'Java Programming', credits: 3 },
    ],
    'III-I': [
      { code: 'CS301', name: 'Database Management Systems', credits: 4 },
      { code: 'CS302', name: 'Operating Systems', credits: 4 },
    ],
    'III-II': [
      { code: 'CS303', name: 'Computer Networks', credits: 4 },
      { code: 'CS304', name: 'Web Technologies', credits: 3 },
    ],
    'IV-I': [
      { code: 'CS401', name: 'Machine Learning', credits: 4 },
      { code: 'CS402', name: 'Cloud Computing', credits: 4 },
    ],
    'IV-II': [
      { code: 'CS403', name: 'Project Work Phase II', credits: 8 }, // Current Sem
    ]
  };

  const createdSubjects = [];
  for (const [sem, subs] of Object.entries(subjects)) {
    for (const sub of subs) {
      const created = await prisma.subject.create({
        data: { ...sub, semester: sem, departmentId: deptCSE.id }
      });
      createdSubjects.push(created);
    }
  }

  // 6. Rooms
  const r101 = await prisma.room.create({ data: { number: '101', capacity: 60, type: 'Classroom' } });

  // 7. Synthetic Students
  const firstNames = ['Arjun', 'Priya', 'Rahul', 'Sneha', 'Karthik', 'Ananya'];
  const lastNames = ['Reddy', 'Sharma', 'Patel', 'Rao', 'Kumar', 'Singh'];

  const students = [];
  let rollIdx = 1;
  for (const fName of firstNames) {
    for (const lName of lastNames) {
      if (rollIdx > 20) break;
      
      const code = rollIdx.toString().padStart(2, '0');
      const rollNum = `209Y1A05${code}`;

      // Arjun Reddy is the "Demo User"
      const isDemoUser = rollNum === '209Y1A0501';

      const student = await prisma.user.create({
        data: {
          rollNumber: rollNum,
          passwordHash,
          role: 'STUDENT',
          name: `${fName} ${lName}`,
          phone: `9${Math.floor(Math.random() * 900000000 + 100000000)}`,
          departmentId: deptCSE.id,
          classSectionId: cseA.id,
          currentSem: 'IV-II',
          attendancePct: isDemoUser ? 68.5 : Math.floor(Math.random() * 30 + 65),
          rfidTag: `RFID-${rollNum}`
        }
      });
      students.push(student);
      rollIdx++;
    }
  }

  const demoUser = students[0]; // Arjun Reddy

  // 8. Financial Transactions (Ledger Data)
  for (const s of students) {
    const isDemo = s.id === demoUser.id;
    
    await prisma.fee.create({
      data: {
        feeType: 'Tuition Fee 2024-25',
        amount: 85000,
        isPaid: isDemo ? false : Math.random() > 0.4,
        paidDate: null,
        dueDate: new Date(new Date().setMonth(new Date().getMonth() - 2)), // 2 months overdue
        userId: s.id,
        remarks: 'Mandatory final year tuition fee'
      }
    });

    if (isDemo) {
      await prisma.fee.create({
        data: {
          feeType: 'Late Fee Penalty',
          amount: 5000,
          isPaid: false,
          dueDate: new Date(),
          userId: s.id,
          remarks: 'Penalty applied due to 2 months overdue tuition fee.'
        }
      });
      await prisma.fee.create({
        data: {
          feeType: 'Backlog Exam Registration Fee',
          amount: 3000,
          isPaid: false,
          dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
          userId: s.id,
          remarks: 'Registration fee for Data Structures (CS201) backlog examination.'
        }
      });
    }
  }

  // 9. Examinations & Results
  // Generate historical exams for every subject (except IV-II which is ongoing)
  const allResults = [];
  
  for (const subj of createdSubjects) {
    if (subj.semester === 'IV-II') continue; // Skip current sem

    // Determine exam dates based on semester
    let yearOffset = 0;
    if (subj.semester.startsWith('I-')) yearOffset = -3;
    if (subj.semester.startsWith('II-')) yearOffset = -2;
    if (subj.semester.startsWith('III-')) yearOffset = -1;
    
    const baseDate = new Date();
    baseDate.setFullYear(baseDate.getFullYear() + yearOffset);

    const ca = await prisma.exam.create({ data: { subjectId: subj.id, date: new Date(baseDate.getTime() - 60*24*60*60*1000), startTime: '09:00', endTime: '10:30', roomId: r101.id, invigilatorId: faculty1.id, maxMarks: 20, examType: 'CA', mode: Math.random() > 0.8 ? 'Online' : 'Offline' } });
    const mid = await prisma.exam.create({ data: { subjectId: subj.id, date: new Date(baseDate.getTime() - 30*24*60*60*1000), startTime: '10:00', endTime: '12:00', roomId: r101.id, invigilatorId: faculty2.id, maxMarks: 30, examType: 'Mid-Term', mode: 'Offline' } });
    const final = await prisma.exam.create({ data: { subjectId: subj.id, date: baseDate, startTime: '13:00', endTime: '16:00', roomId: r101.id, invigilatorId: faculty1.id, maxMarks: 50, examType: 'Final', mode: 'Offline' } });

    for (const s of students) {
      const isDemo = s.id === demoUser.id;
      
      // Inject failure for CS201 (Data Structures) in II-I for the demo user
      const shouldFail = isDemo && subj.code === 'CS201';

      let caMarks = shouldFail ? 4 : Math.floor(Math.random() * 10 + 10);
      let midMarks = shouldFail ? 8 : Math.floor(Math.random() * 10 + 20);
      let finalMarks = shouldFail ? 12 : Math.floor(Math.random() * 15 + 35);
      
      const totalMarks = caMarks + midMarks + finalMarks;
      let gradePoint = 0;
      if (!shouldFail) {
          gradePoint = totalMarks >= 90 ? 10 : totalMarks >= 80 ? 9 : totalMarks >= 70 ? 8 : totalMarks >= 60 ? 7 : totalMarks >= 50 ? 6 : totalMarks >= 40 ? 5 : 0;
      }

      allResults.push({ studentId: s.id, examId: ca.id, marksObtained: caMarks, gradePoint: 0, status: shouldFail && caMarks < 5 ? 'ABSENT' : 'ATTENDED' });
      allResults.push({ studentId: s.id, examId: mid.id, marksObtained: midMarks, gradePoint: 0, status: shouldFail && midMarks < 10 ? 'ABSENT' : 'ATTENDED' });
      allResults.push({ studentId: s.id, examId: final.id, marksObtained: finalMarks, gradePoint: gradePoint, status: shouldFail ? 'ABSENT' : 'ATTENDED' });
    }
  }

  // Bulk insert results to drastically speed up seeding
  await prisma.studentResult.createMany({ data: allResults });

  // 10. Schedules & Full 4-Year Attendance History
  console.log("Generating 4 years of Schedule and Attendance data...");
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = [{s: '09:00', e: '10:00'}, {s: '10:00', e: '11:00'}, {s: '11:15', e: '12:15'}, {s: '13:00', e: '14:00'}];
  
  const allAttendance = [];
  
  for (let i = 0; i < createdSubjects.length; i++) {
    const subj = createdSubjects[i];
    
    // Determine exam dates based on semester
    let yearOffset = 0;
    if (subj.semester.startsWith('I-')) yearOffset = -3;
    if (subj.semester.startsWith('II-')) yearOffset = -2;
    if (subj.semester.startsWith('III-')) yearOffset = -1;
    
    // Create 2 schedule slots for this subject
    const day1 = daysOfWeek[i % 5];
    const day2 = daysOfWeek[(i + 2) % 5];
    const time1 = times[i % 4];
    const time2 = times[(i + 1) % 4];
    
    const sched1 = await prisma.schedule.create({
      data: {
        dayOfWeek: day1,
        startTime: time1.s,
        endTime: time1.e,
        subjectId: subj.id,
        facultyId: i % 2 === 0 ? faculty1.id : faculty2.id,
        roomId: r101.id,
        classSectionId: cseA.id
      }
    });
    
    const sched2 = await prisma.schedule.create({
      data: {
        dayOfWeek: day2,
        startTime: time2.s,
        endTime: time2.e,
        subjectId: subj.id,
        facultyId: i % 2 === 0 ? faculty1.id : faculty2.id,
        roomId: r101.id,
        classSectionId: cseA.id
      }
    });

    // Generate 16 weeks of attendance for this subject for the Demo User
    const baseDate = new Date();
    baseDate.setFullYear(baseDate.getFullYear() + yearOffset);
    // Move to roughly start of semester (August for odd sem, Jan for even)
    if (subj.semester.endsWith('-I')) {
      baseDate.setMonth(7); // August
    } else {
      baseDate.setMonth(0); // January
    }
    baseDate.setDate(1);

    for (let week = 0; week < 16; week++) {
      // For sched1
      const classDate1 = new Date(baseDate.getTime() + (week * 7 * 24 * 60 * 60 * 1000));
      // Adjust date to match dayOfWeek roughly (just add random days for simplicity in demo)
      classDate1.setDate(classDate1.getDate() + daysOfWeek.indexOf(day1));
      
      const isPresent1 = Math.random() < 0.75; // 75% attendance rate
      allAttendance.push({
        date: classDate1,
        status: isPresent1 ? 'Present' : 'Absent',
        userId: demoUser.id,
        subjectId: subj.id,
        scheduleId: sched1.id
      });

      // For sched2
      const classDate2 = new Date(baseDate.getTime() + (week * 7 * 24 * 60 * 60 * 1000));
      classDate2.setDate(classDate2.getDate() + daysOfWeek.indexOf(day2));
      
      const isPresent2 = Math.random() < 0.75; 
      allAttendance.push({
        date: classDate2,
        status: isPresent2 ? 'Present' : 'Absent',
        userId: demoUser.id,
        subjectId: subj.id,
        scheduleId: sched2.id
      });
    }
  }

  // Bulk insert attendance
  await prisma.attendanceRecord.createMany({ data: allAttendance });

  // 10. Notifications & Disciplinary
  await prisma.disciplinaryRecord.create({
    data: {
      studentId: demoUser.id,
      facultyId: faculty1.id,
      severity: "Severe",
      description: "Academic Misconduct: Caught plagiarizing in major project documentation (CS403). Active academic hold placed on account.",
      adminAction: "Summoned to HOD office. Project presentation suspended.",
      status: "PENDING"
    }
  });

  await prisma.notification.createMany({
    data: [
      {
        recipientId: demoUser.id,
        title: 'URGENT: Academic Hold Placed',
        message: 'An academic hold has been placed on your account due to a severe disciplinary record (Project Plagiarism). Please contact the HOD (Dr. V.S.S. Murthy) in Room 204 immediately. You will not be allowed to graduate until this is resolved.',
        type: 'ACADEMIC',
        isRead: false
      },
      {
        recipientId: demoUser.id,
        title: 'Final Warning: Overdue Tuition Fee',
        message: 'Your final year tuition fee of ₹85,000 is heavily overdue. A late fee penalty of ₹5,000 has been applied. Pay immediately through the Fee Portal or contact Accounts (Ext 401).',
        type: 'FEE',
        isRead: false
      },
      {
        recipientId: demoUser.id,
        title: 'Backlog Registration Open',
        message: 'Registration for your CS201 (Data Structures) backlog examination is now open. You must pay the fee of ₹3,000 by Friday.',
        type: 'GENERAL',
        isRead: false
      }
    ]
  });

  console.log('🎉 Database seeding complete!');
  console.log(`Successfully generated hyper-realistic demo persona for Arjun Reddy (209Y1A0501) as a FINAL YEAR STUDENT with a full 4-year transcript, backlogs, CA/Mid marks, and financial holds!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
