import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CreateExamForm from './CreateExamForm';
import EnterMarksForm from './components/EnterMarksForm';
import { CalendarDays, Clock, MapPin, Upload } from 'lucide-react';

export default async function AdminExamsPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || (sessionUser.role !== 'ADMIN' && sessionUser.role !== 'SUPER_ADMIN')) {
    redirect('/login?error=Unauthorized');
  }

  // Fetch needed data for the form
  const subjects = await prisma.subject.findMany({ orderBy: { code: 'asc' } });
  const rooms = await prisma.room.findMany({ orderBy: { number: 'asc' } });
  const students = await prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true, name: true, rollNumber: true }, orderBy: { rollNumber: 'asc' } });

  // Fetch all exams
  const exams = await prisma.exam.findMany({
    include: {
      subject: { include: { department: true } },
      room: true,
      _count: { select: { results: true } }
    },
    orderBy: { date: 'desc' }
  });

  const upcomingExams = exams.filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)));
  const pastExams = exams.filter(e => new Date(e.date) < new Date(new Date().setHours(0,0,0,0)));

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Examination Control Center</h1>
        <p className="text-slate-400 text-lg">Schedule new exams, manage rooms, and publish results.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Col: The Form */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-slate-900/40 p-6 rounded-2xl border border-indigo-500/30">
            <h2 className="text-xl font-bold text-white mb-4">Schedule New Exam</h2>
            <CreateExamForm subjects={subjects} rooms={rooms} />
          </div>
        </div>

        {/* Right Col: The Master List */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Upcoming */}
          <div>
             <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-amber-400" />
              Upcoming Scheduled Exams
            </h2>
            <div className="space-y-3">
              {upcomingExams.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-dashed border-slate-700">
                  <p className="text-slate-500">No upcoming exams scheduled.</p>
                </div>
              ) : (
                upcomingExams.map(exam => (
                  <div key={exam.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded">{exam.examType}</span>
                        <span className="text-slate-500 text-xs font-mono">{exam.subject.code}</span>
                      </div>
                      <h3 className="text-white font-bold text-lg">{exam.subject.name}</h3>
                      <p className="text-slate-400 text-xs mt-1">{exam.subject.department.name} Department</p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1 text-sm bg-slate-950 p-3 rounded-lg border border-slate-800/50">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-4 h-4 text-indigo-400" />
                        {new Date(exam.date).toLocaleDateString()} ({exam.startTime} - {exam.endTime})
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPin className="w-4 h-4 text-rose-400" />
                        Room {exam.room?.number || 'TBA'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Past */}
          <div>
             <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              Past Exams & Results
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {pastExams.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-dashed border-slate-700">
                  <p className="text-slate-500">No past exams found.</p>
                </div>
              ) : (
                pastExams.map(exam => (
                  <div key={exam.id} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between group">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-slate-500 text-[10px] font-bold uppercase">{new Date(exam.date).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-white font-bold text-sm">{exam.subject.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-bold">{exam._count.results} <span className="text-slate-500 text-xs">Results</span></p>
                      </div>
                    </div>
                    {/* Inline Marks Entry Form */}
                    <EnterMarksForm examId={exam.id} maxMarks={exam.maxMarks} students={students} />
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
