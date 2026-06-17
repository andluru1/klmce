import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import CoursesClient from './CoursesClient';

export default async function CoursesPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'STUDENT') {
    return <div className="p-8 text-white">Access Denied.</div>;
  }

  const student = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      attendance: { include: { subject: true } },
      results: { include: { exam: { include: { subject: true } } } },
      courseNotes: true,
    }
  });

  if (!student) return <div>Not found</div>;

  const subjectsMap = new Map();
  
  // From attendance
  student.attendance.forEach(a => {
    if (!subjectsMap.has(a.subjectId)) {
      subjectsMap.set(a.subjectId, { subject: a.subject, attended: 0, total: 0 });
    }
    const s = subjectsMap.get(a.subjectId);
    s.total++;
    if (a.status === 'Present') s.attended++;
  });

  // From results
  const latestResultsMap = new Map();
  student.results.forEach(r => {
    const subjId = r.exam.subject.id;
    if (!subjectsMap.has(subjId)) {
       subjectsMap.set(subjId, { subject: r.exam.subject, attended: 0, total: 0 });
    }
    if (!latestResultsMap.has(subjId) || latestResultsMap.get(subjId).exam.date < r.exam.date) {
        latestResultsMap.set(subjId, r);
    }
  });

  // From schedule
  if (student.classSectionId) {
     const schedules = await prisma.schedule.findMany({
         where: { classSectionId: student.classSectionId },
         include: { subject: true }
     });
     schedules.forEach(sc => {
         if (!subjectsMap.has(sc.subjectId)) {
             subjectsMap.set(sc.subjectId, { subject: sc.subject, attended: 0, total: 0 });
         }
     });
  }

  // Course Notes mapping
  const notesMap = new Map();
  student.courseNotes.forEach(note => {
      notesMap.set(note.subjectId, note.content);
  });

  let totalAttended = 0;
  let totalClasses = 0;
  let totalGradePoints = 0;
  let gradedCoursesCount = 0;

  const coursesData = Array.from(subjectsMap.values()).map(data => {
      const subject = data.subject;
      const attendancePct = data.total > 0 ? Math.round((data.attended / data.total) * 100) : 100;
      
      totalAttended += data.attended;
      totalClasses += data.total;

      const resultData = latestResultsMap.get(subject.id);
      let resultStr = 'N/A';
      let status = 'Upcoming';

      if (resultData) {
          status = 'Completed';
          gradedCoursesCount++;
          totalGradePoints += resultData.gradePoint;
          
          if (resultData.gradePoint >= 9) resultStr = 'O';
          else if (resultData.gradePoint >= 8) resultStr = 'A+';
          else if (resultData.gradePoint >= 7) resultStr = 'A';
          else if (resultData.gradePoint >= 6) resultStr = 'B+';
          else if (resultData.gradePoint >= 5) resultStr = 'B';
          else resultStr = 'F';
      }

      let yearTag = "1st Year";
      if (subject.semester.startsWith('II-')) yearTag = "2nd Year";
      else if (subject.semester.startsWith('III-')) yearTag = "3rd Year";
      else if (subject.semester.startsWith('IV-')) yearTag = "4th Year";

      return {
          id: subject.id,
          code: subject.code,
          name: subject.name,
          semester: subject.semester,
          yearTag,
          attendancePct,
          result: resultStr,
          status,
          note: notesMap.get(subject.id) || '',
          progress: status === 'Completed' ? 100 : 35
      };
  });

  const overallAttendance = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 100;
  const overallCgpa = gradedCoursesCount > 0 ? (totalGradePoints / gradedCoursesCount).toFixed(2) : 'N/A';

  const performance = {
      overallAttendance,
      overallCgpa,
      completedCount: coursesData.filter(c => c.status === 'Completed').length,
      upcomingCount: coursesData.filter(c => c.status === 'Upcoming').length,
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-12 pt-8 px-8">
      <CoursesClient courses={coursesData} performance={performance} />
    </div>
  );
}
