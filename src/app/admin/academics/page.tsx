import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { GraduationCap, MapPin, BookOpen, Clock, PlusCircle, UserCheck } from 'lucide-react';
import { GlassCard } from '@/components/ui/VibeCard';
import CreateScheduleForm from './components/CreateScheduleForm';
import LogAttendanceForm from './components/LogAttendanceForm';

export default async function AcademicsPage() {
  const rooms = await prisma.room.findMany();
  const subjects = await prisma.subject.findMany({ include: { department: true } });
  const sections = await prisma.classSection.findMany({ include: { department: true } });
  const faculty = await prisma.user.findMany({ where: { role: 'FACULTY' }, select: { id: true, name: true } });
  const students = await prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true, name: true, rollNumber: true }, orderBy: { rollNumber: 'asc' } });
  const schedules = await prisma.schedule.findMany({ include: { subject: true, faculty: true }, orderBy: { dayOfWeek: 'asc' } });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
          </div>
          Academic Command Center
        </h1>
        <p className="text-slate-400">Manage classrooms, subjects, timetables, and sections.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Rooms Overview */}
        <GlassCard className="p-6 bg-slate-900/50 border-slate-800 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <MapPin className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-bold text-white">Campus Rooms</h2>
          </div>
          <div className="space-y-3">
            {rooms.map(room => (
              <div key={room.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <div>
                  <h3 className="text-white font-medium">{room.number}</h3>
                  <p className="text-xs text-slate-400">{room.type}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                    Cap: {room.capacity}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors">
            + Add Room
          </button>
        </GlassCard>

        {/* Subjects Overview */}
        <GlassCard className="p-6 bg-slate-900/50 border-slate-800 space-y-4 lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Course Catalog</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map(subject => (
              <div key={subject.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-white font-bold text-sm leading-tight">{subject.name}</h3>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold whitespace-nowrap">
                    {subject.code}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-auto pt-2 text-xs text-slate-400">
                  <span>{subject.department.code} Dept</span>
                  <span>•</span>
                  <span>{subject.credits} Credits</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors">
            + Add Subject
          </button>
        </GlassCard>

      </div>

      {/* Class Sections & Timetables */}
      <GlassCard className="p-6 bg-slate-900/50 border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Sections & Timetables</h2>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/academics/leaves" className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-sm font-bold rounded-lg transition-colors">
              Approve Leaves
            </Link>
            <Link href="/admin/academics/adjustments" className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 text-sm font-bold rounded-lg transition-colors">
              Lecture Adjustments
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map(sec => (
            <div key={sec.id} className="p-5 bg-slate-800/40 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-colors cursor-pointer group">
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">{sec.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{sec.department.name} • {sec.semester}</p>
              
              <div className="flex gap-2">
                <Link 
                  href={`/admin/academics/timetable/${sec.id}`}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-md transition-colors text-center"
                >
                  View Timetable
                </Link>
                <button className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-md transition-colors">
                  Assign Students
                </button>
              </div>
            </div>
          ))}

          {/* Add Schedule Form Widget */}
          <div className="p-5 bg-slate-800/40 rounded-xl border border-indigo-500/30">
            <div className="flex items-center gap-2 mb-4 text-white">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold">Schedule New Class</h3>
            </div>
            <CreateScheduleForm sections={sections} subjects={subjects} rooms={rooms} faculty={faculty} />
          </div>

          {/* Attendance Tracker Widget */}
          <div className="p-5 bg-slate-800/40 rounded-xl border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-4 text-white">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold">Log Attendance</h3>
            </div>
            <LogAttendanceForm students={students} schedules={schedules} />
          </div>

        </div>
      </GlassCard>

    </div>
  );
}
