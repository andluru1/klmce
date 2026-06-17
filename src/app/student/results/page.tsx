import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { GlassCard } from '@/components/ui/VibeCard';
import { GraduationCap, Award, Calendar, BookOpen, ArrowRight } from 'lucide-react';
import { redirect } from 'next/navigation';
import SubjectResultCard from './components/SubjectResultCard';

const SEMESTER_ORDER = ["I-I", "I-II", "II-I", "II-II", "III-I", "III-II", "IV-I", "IV-II"];

export default async function StudentResultsPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'STUDENT') {
    redirect('/login?error=SessionExpired');
  }

  // Fetch past results
  const results = await prisma.studentResult.findMany({
    where: { studentId: sessionUser.id },
    include: {
      exam: {
        include: { 
          subject: true,
          invigilator: true,
          room: true
        }
      }
    },
    orderBy: { exam: { date: 'asc' } }
  });

  // Fetch upcoming curriculum (subjects in student's department assigned to future semesters)
  const allDepartmentSubjects = await prisma.subject.findMany({
    where: { departmentId: sessionUser.departmentId! }
  });

  const currentSemIndex = SEMESTER_ORDER.indexOf(sessionUser.currentSem || "I-I");
  const upcomingSubjects = allDepartmentSubjects.filter(subj => {
    const subjSemIndex = SEMESTER_ORDER.indexOf(subj.semester);
    return subjSemIndex > currentSemIndex;
  }).sort((a, b) => SEMESTER_ORDER.indexOf(a.semester) - SEMESTER_ORDER.indexOf(b.semester));

  // Group results by semester and then by subject
  type SubjectGroup = {
    subject: any;
    results: typeof results;
    totalMarks: number;
    maxTotalMarks: number;
    finalGradePoint: number;
  };

  const groupedBySemesterAndSubject = results.reduce((acc, curr) => {
    const sem = curr.exam.subject.semester;
    const subjId = curr.exam.subject.id;
    
    if (!acc[sem]) acc[sem] = {};
    if (!acc[sem][subjId]) acc[sem][subjId] = {
      subject: curr.exam.subject,
      results: [],
      totalMarks: 0,
      maxTotalMarks: 0,
      finalGradePoint: 0
    };
    
    const group = acc[sem][subjId];
    group.results.push(curr);
    group.totalMarks += curr.marksObtained;
    group.maxTotalMarks += curr.exam.maxMarks;
    
    // Use the latest or 'Final' exam's grade point as the overall grade point
    if (curr.exam.examType === 'Final' || group.finalGradePoint === 0) {
        group.finalGradePoint = curr.gradePoint;
    }

    return acc;
  }, {} as Record<string, Record<string, SubjectGroup>>);

  // Calculate CGPA (Average of final grade points of all unique subjects taken)
  let totalGradePoints = 0;
  let totalSubjects = 0;
  Object.values(groupedBySemesterAndSubject).forEach(semObj => {
    Object.values(semObj).forEach(subjGroup => {
        totalGradePoints += subjGroup.finalGradePoint;
        totalSubjects += 1;
    });
  });
  const cgpa = totalSubjects > 0 ? (totalGradePoints / totalSubjects).toFixed(2) : 'N/A';

  // Sort the grouped semesters chronologically
  const sortedSemesters = Object.keys(groupedBySemesterAndSubject).sort((a, b) => {
    return SEMESTER_ORDER.indexOf(a) - SEMESTER_ORDER.indexOf(b);
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 pb-12 pt-8 px-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl">
              <GraduationCap className="w-8 h-8 text-indigo-400" />
            </div>
            Academic Transcript
          </h1>
          <p className="text-slate-400 text-lg">View your historical performance and upcoming curriculum map.</p>
        </div>
        <div className="text-right bg-indigo-500/10 border border-indigo-500/20 px-8 py-4 rounded-2xl">
          <p className="text-indigo-400 text-sm font-bold uppercase tracking-wider mb-1">Cumulative GPA</p>
          <p className="text-5xl font-black text-indigo-300">{cgpa}</p>
        </div>
      </div>

      {/* Historical Transcripts grouped by Semester */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-2">Past & Current Semesters</h2>
        {sortedSemesters.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-500">No academic results have been published for you yet.</p>
          </div>
        ) : (
          sortedSemesters.map((sem) => {
            const subjectsObj = groupedBySemesterAndSubject[sem];
            const subjectsList = Object.values(subjectsObj);
            
            // Calculate semester total marks
            const semTotalMarks = subjectsList.reduce((sum, s) => sum + s.totalMarks, 0);
            const semMaxMarks = subjectsList.reduce((sum, s) => sum + s.maxTotalMarks, 0);
            
            // Calculate SGPA properly: average of finalGradePoints
            const semSgpa = subjectsList.length > 0 
                ? (subjectsList.reduce((sum, s) => sum + s.finalGradePoint, 0) / subjectsList.length).toFixed(2) 
                : '0.00';
            
            return (
              <div key={sem} className="bg-slate-900/50 rounded-3xl p-6 border border-slate-800/50 space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 bg-slate-800 text-slate-300 font-bold rounded-lg tracking-widest text-sm">
                      SEMESTER {sem}
                    </span>
                    {sem === sessionUser.currentSem && (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg animate-pulse">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-6 border-t sm:border-t-0 border-slate-800/50 pt-4 sm:pt-0">
                    <div className="text-right">
                        <span className="text-slate-400 text-sm mr-2">Total Marks:</span>
                        <span className="text-md font-bold text-emerald-400">{semTotalMarks} <span className="text-slate-600 text-xs">/ {semMaxMarks}</span></span>
                    </div>
                    <div className="text-right">
                        <span className="text-slate-400 text-sm mr-2">SGPA:</span>
                        <span className="text-xl font-bold text-white">{semSgpa}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjectsList.map((subjGroup) => (
                    <SubjectResultCard key={subjGroup.subject.id} subjGroup={subjGroup} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upcoming Curriculum Map */}
      <div className="space-y-6 pt-6">
        <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-400" />
          Upcoming Curriculum
        </h2>
        {upcomingSubjects.length === 0 ? (
          <p className="text-slate-500 italic">You have no upcoming courses. You are in your final semester!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingSubjects.map((subj) => (
              <GlassCard key={subj.id} className="p-4 bg-slate-900 border-slate-800 hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Sem {subj.semester}</span>
                  <span className="text-xs text-slate-500 font-mono">{subj.code}</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{subj.name}</h4>
                <div className="flex items-center gap-1 text-slate-400 text-xs mt-auto">
                  <ArrowRight className="w-3 h-3" />
                  <span>{subj.credits} Credits</span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
