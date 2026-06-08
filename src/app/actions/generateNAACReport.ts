'use server';

import prisma from '@/lib/prisma';

export async function generateNAACReport() {
  const departments = await prisma.department.findMany({
    include: {
      users: true
    }
  });

  const reportData = [];

  for (const dept of departments) {
    const students = dept.users.filter(u => u.role === 'STUDENT');
    const faculty = dept.users.filter(u => u.role === 'FACULTY');

    const totalStudents = students.length;
    const totalFaculty = faculty.length;
    const ratio = totalFaculty > 0 ? `1:${Math.round(totalStudents / totalFaculty)}` : 'N/A';

    // Calculate zero-backlog percentage
    // For this demo, we assume a "backlog" means gradePoint < 5
    let studentsWithoutBacklogs = 0;

    for (const student of students) {
      const results = await prisma.studentResult.findMany({
        where: { studentId: student.id }
      });
      
      if (results.length > 0) {
        const hasBacklog = results.some(r => r.gradePoint < 5);
        if (!hasBacklog) studentsWithoutBacklogs++;
      } else {
        // No results yet, technically no backlogs
        studentsWithoutBacklogs++;
      }
    }

    const passPercentage = totalStudents > 0 ? ((studentsWithoutBacklogs / totalStudents) * 100).toFixed(1) : '0.0';

    reportData.push({
      department: dept.name,
      totalStudents,
      totalFaculty,
      ratio,
      passPercentage: `${passPercentage}%`
    });
  }

  return reportData;
}
