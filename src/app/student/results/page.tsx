import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { GlassCard } from '@/components/ui/VibeCard';
import { GraduationCap, Award, Calendar, BookOpen, ArrowRight } from 'lucide-react';
import { redirect } from 'next/navigation';

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
        include: { subject: true }
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

  // Group results by semester
  const groupedResults = results.reduce((acc, curr) => {
    const sem = curr.exam.subject.semester;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(curr);
    return acc;
  }, {} as Record<string, typeof results>);

  // Calculate SGPA (Simplified: average of grade points)
  const totalGradePoints = results.reduce((acc, curr) => acc + curr.gradePoint, 0);
  const cgpa = results.length > 0 ? (totalGradePoints / results.length).toFixed(2) : 'N/A';

  // Sort the grouped semesters chronologically
  const sortedSemesters = Object.keys(groupedResults).sort((a, b) => {
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
            const semResults = groupedResults[sem];
            const semSgpa = (semResults.reduce((sum, r) => sum + r.gradePoint, 0) / semResults.length).toFixed(2);
            
            return (
              <div key={sem} className="bg-slate-900/50 rounded-3xl p-6 border border-slate-800/50 space-y-6">
                <div className="flex justify-between items-center">
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
                  <div className="text-right">
                    <span className="text-slate-400 text-sm mr-2">SGPA:</span>
                    <span className="text-xl font-bold text-white">{semSgpa}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {semResults.map((res) => (
                    <GlassCard key={res.id} className="p-5 bg-slate-950 border-slate-800 relative overflow-hidden hover:border-indigo-500/30 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                          <h3 className="text-md font-bold text-white leading-tight">{res.exam.subject.name}</h3>
                          <p className="text-xs text-slate-500 font-mono">{res.exam.subject.code} • {res.exam.subject.credits} Credits</p>
                        </div>
                        <div className="text-right">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                            res.gradePoint >= 8 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                            res.gradePoint >= 6 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                            'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          }`}>
                            <span className="font-bold text-sm">{res.gradePoint}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-800/50 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Award className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-white font-medium">{res.marksObtained} <span className="text-slate-500">/ {res.exam.maxMarks}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(res.exam.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </GlassCard>
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
