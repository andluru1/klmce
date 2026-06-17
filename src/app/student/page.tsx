import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { GlassCard } from '@/components/ui/VibeCard';
import { BellRing, Clock, GraduationCap, CreditCard, TrendingUp, ChevronRight, CalendarDays, MapPin, Scale, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default async function StudentDashboard() {
  const sessionUser = await getSessionUser();

  if (!sessionUser || sessionUser.role !== 'STUDENT') {
    return <div className="p-8 text-white">Access Denied. Please log in as a student.</div>;
  }

  // 1. Fetch Student Profile & Stats
  const student = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      department: true,
      classSection: true,
      attendance: true,
    }
  });

  if (!student) return <div>Student not found</div>;

  // Calculate Real Attendance
  const totalClasses = student.attendance.length;
  const attendedClasses = student.attendance.filter(a => a.status === 'Present').length;
  const realAttendancePct = totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(1) : student.attendancePct;

  // 2. Fetch Pending Fees
  const pendingFees = await prisma.fee.findMany({
    where: { userId: student.id, isPaid: false }
  });
  const totalPendingAmount = pendingFees.reduce((sum, fee) => sum + fee.amount, 0);

  // 3. Fetch Today's Classes (Schedule)
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysSchedule = await prisma.schedule.findMany({
    where: { 
      classSectionId: student.classSectionId!,
      dayOfWeek: todayName 
    },
    include: { subject: true, room: true, faculty: true },
    orderBy: { startTime: 'asc' }
  });

  // Fetch active disciplinary remarks
  const remarks = await prisma.disciplinaryRecord.findMany({
    where: { studentId: student.id },
    include: { faculty: { select: { name: true } } },
    orderBy: { date: 'desc' }
  });

  // 4. Fetch All Past Results (Chronological History)
  const allResults = await prisma.studentResult.findMany({
    where: { studentId: student.id },
    include: {
      exam: { include: { subject: true } }
    },
    orderBy: { exam: { date: 'desc' } }
  });

  // Calculate current SGPA for the top card (Average of all final grade points per unique subject)
  const finalResultsMap = new Map();
  allResults.forEach(res => {
    // Only consider the most recent Final exam for each subject
    if (res.exam.examType === 'Final') {
      if (!finalResultsMap.has(res.exam.subjectId)) {
        finalResultsMap.set(res.exam.subjectId, res.gradePoint);
      }
    }
  });
  let totalGradePoints = 0;
  finalResultsMap.forEach(gp => totalGradePoints += gp);
  const cgpa = finalResultsMap.size > 0 ? (totalGradePoints / finalResultsMap.size).toFixed(2) : 'N/A';

  // 5. Fetch Upcoming Exams (Scheduled but not yet taken)
  const upcomingExams = await prisma.exam.findMany({
    where: {
      subject: { departmentId: student.departmentId! },
      date: { gte: new Date() }
    },
    include: { subject: true, room: true, invigilator: true },
    orderBy: { date: 'asc' }
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Welcome back, {student.name.split(' ')[0]}!</h1>
          <p className="text-slate-400 text-lg">
            {student.department?.name} • Semester {student.currentSem}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/student/notifications">
            <button className="relative p-3 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
              <BellRing className="w-6 h-6 text-slate-300" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border-2 border-slate-900"></span>
            </button>
          </Link>
          <div className="px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex flex-col items-end">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Roll Number</span>
            <span className="text-lg font-bold text-white font-mono">{student.rollNumber}</span>
          </div>
        </div>
      </div>

      {/* KPI Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attendance KPI */}
        <Link href="/student/attendance">
          <GlassCard className="p-6 bg-slate-900 border-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer group h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <Clock className="w-6 h-6 text-emerald-400" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="text-slate-400 font-medium mb-1">Overall Attendance</h3>
            <p className="text-4xl font-black text-white">{realAttendancePct}%</p>
            {Number(realAttendancePct) < 75 && (
              <p className="text-xs text-rose-400 mt-2 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                Below 75% threshold
              </p>
            )}
          </GlassCard>
        </Link>

        {/* CGPA KPI */}
        <Link href="/student/results">
          <GlassCard className="p-6 bg-slate-900 border-slate-800 hover:border-blue-500/30 transition-all cursor-pointer group h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <GraduationCap className="w-6 h-6 text-blue-400" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
            </div>
            <h3 className="text-slate-400 font-medium mb-1">Cumulative GPA</h3>
            <p className="text-4xl font-black text-white">{cgpa}</p>
            <p className="text-xs text-blue-400 mt-2 font-bold flex items-center gap-1">
               Based on {allResults.length} exams
            </p>
          </GlassCard>
        </Link>

        {/* Financial KPI */}
        <Link href="/student/fees">
          <GlassCard className="p-6 bg-slate-900 border-slate-800 hover:border-rose-500/30 transition-all cursor-pointer group h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-500/10 rounded-xl">
                <CreditCard className="w-6 h-6 text-rose-400" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-rose-400 transition-colors" />
            </div>
            <h3 className="text-slate-400 font-medium mb-1">Pending Dues</h3>
            <p className="text-4xl font-black text-white">₹{totalPendingAmount.toLocaleString()}</p>
            {totalPendingAmount > 0 ? (
              <p className="text-xs text-rose-400 mt-2 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                Action Required
              </p>
            ) : (
               <p className="text-xs text-emerald-400 mt-2 font-bold flex items-center gap-1">
                All dues cleared
              </p>
            )}
          </GlassCard>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Schedules & Exams */}
        <div className="space-y-8">
          
          {/* Upcoming Exams Widget */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-amber-400" />
              Upcoming Exam Schedule
            </h2>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden p-2 space-y-2">
              {upcomingExams.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-slate-500">No upcoming exams scheduled.</p>
                </div>
              ) : (
                upcomingExams.map((exam) => (
                  <div key={exam.id} className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl hover:border-amber-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded">{exam.examType}</span>
                        <span className="text-slate-400 text-xs font-mono">{exam.subject.code}</span>
                      </div>
                      <h4 className="text-white font-bold text-lg leading-tight">{exam.subject.name}</h4>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5 min-w-[160px]">
                      <div className="flex items-center gap-1.5 text-slate-300 text-sm font-medium">
                        <Clock className="w-4 h-4 text-amber-400" />
                        {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {exam.startTime}
                      </div>
                      <div className="flex items-center justify-end gap-3 text-slate-400 text-xs mt-1 w-full">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          {exam.room ? `Room ${exam.room.number}` : 'TBA'}
                        </div>
                        {exam.invigilator && (
                          <div className="flex items-center gap-1 text-slate-500">
                            • {exam.invigilator.name}
                          </div>
                        )}
                        {exam.mode && (
                          <div className="flex items-center gap-1 text-slate-500">
                            • {exam.mode}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Today's Timetable Widget */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Today&apos;s Classes</h2>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden p-2 space-y-2">
              {todaysSchedule.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-slate-500">No classes scheduled for today! Enjoy your day off.</p>
                </div>
              ) : (
                todaysSchedule.map((slot) => (
                  <div key={slot.id} className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-12 bg-indigo-500 rounded-full"></div>
                      <div>
                        <h4 className="text-white font-bold">{slot.subject.name}</h4>
                        <p className="text-slate-400 text-xs">{slot.faculty.name} • Room {slot.room.number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-indigo-400 font-bold font-mono">{slot.startTime}</p>
                      <p className="text-slate-500 text-xs font-mono">{slot.endTime}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Historical Results List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Academic History
            </h2>
            <Link href="/student/results">
              <span className="text-xs text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider cursor-pointer">View Transcript &rarr;</span>
            </Link>
          </div>
          
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-2 space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
            {allResults.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-500">No past results found.</p>
              </div>
            ) : (
              allResults.map((result) => (
                <div key={result.id} className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl hover:border-emerald-500/30 transition-all flex items-center justify-between group">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{new Date(result.exam.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                    <h4 className="text-white font-bold leading-tight group-hover:text-emerald-400 transition-colors">{result.exam.subject.name}</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-white font-bold">{result.marksObtained} <span className="text-slate-500 text-xs">/ {result.exam.maxMarks}</span></p>
                      <p className="text-slate-400 text-[10px] uppercase tracking-wider">Marks</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      result.gradePoint >= 8 ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' :
                      result.gradePoint >= 6 ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' :
                      'border-rose-500/50 bg-rose-500/10 text-rose-400'
                    }`}>
                      <span className="font-black text-lg">{result.gradePoint}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
      </div>

      {/* Disciplinary Record */}
      {remarks.length > 0 && (
        <GlassCard className="p-6 bg-rose-950/20 border-rose-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h2 className="text-xl font-bold text-white">Disciplinary Record</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {remarks.map(record => (
              <div key={record.id} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-1 h-full ${record.severity === 'Severe' ? 'bg-rose-500' : record.severity === 'High' ? 'bg-orange-500' : record.severity === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                <div className="flex justify-between items-start mb-2 ml-2">
                  <div>
                    <h3 className="text-white font-bold text-sm">Reported by {record.faculty.name}</h3>
                    <p className="text-xs text-slate-400">{new Date(record.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${record.severity === 'Severe' ? 'bg-rose-500/20 text-rose-400' : record.severity === 'High' ? 'bg-orange-500/20 text-orange-400' : record.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {record.severity} Severity
                  </span>
                </div>
                <p className="text-slate-300 text-sm ml-2 mt-2 leading-relaxed">&quot;{record.description}&quot;</p>
                {record.adminAction && (
                  <div className="mt-3 ml-2 p-2.5 bg-slate-800/50 rounded-lg border border-slate-700 flex items-start gap-2">
                    <Scale className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Admin Action Taken</p>
                      <p className="text-sm text-slate-300 font-medium">{record.adminAction}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

    </div>
  );
}
