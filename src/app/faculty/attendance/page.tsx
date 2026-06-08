import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import AttendanceClient from './AttendanceClient';

export default async function FacultyAttendancePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return <div>Access Denied</div>;

  // Find all distinct subjects and sections this faculty teaches
  const schedules = await prisma.schedule.findMany({
    where: { facultyId: sessionUser.id },
    include: {
      subject: true,
      classSection: true,
    },
  });

  // Extract unique sections
  const uniqueSectionsMap = new Map();
  schedules.forEach((s) => {
    if (!uniqueSectionsMap.has(s.classSection.id)) {
      uniqueSectionsMap.set(s.classSection.id, s.classSection);
    }
  });
  const sections = Array.from(uniqueSectionsMap.values());

  // Extract unique subjects
  const uniqueSubjectsMap = new Map();
  schedules.forEach((s) => {
    if (!uniqueSubjectsMap.has(s.subject.id)) {
      uniqueSubjectsMap.set(s.subject.id, s.subject);
    }
  });
  const subjects = Array.from(uniqueSubjectsMap.values());

  // Fetch all students (this could be optimized to fetch per section via an API, but for EMS we can pass them in to the client if the dataset is small. However, better to fetch all students that belong to the faculty's sections)
  const students = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      classSectionId: { in: sections.map((s) => s.id) },
    },
    select: {
      id: true,
      name: true,
      rollNumber: true,
      classSectionId: true,
      attendancePct: true,
    },
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mark Attendance</h1>
        <p className="text-slate-400">Record daily attendance for your assigned classes.</p>
      </div>

      <AttendanceClient 
        sections={sections} 
        subjects={subjects} 
        students={students} 
      />
    </div>
  );
}
