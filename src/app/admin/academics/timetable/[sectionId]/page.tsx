import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, MapPin, BookOpen } from 'lucide-react';
import TimetableGrid from './components/TimetableGrid';

export default async function TimetableEditorPage({ params }: { params: { sectionId: string } }) {
  const sectionId = params.sectionId;

  // Fetch Section Info
  const section = await prisma.classSection.findUnique({
    where: { id: sectionId },
    include: { department: true }
  });

  if (!section) return <div className="p-8 text-white">Section not found.</div>;

  // Fetch existing schedules
  const schedules = await prisma.schedule.findMany({
    where: { classSectionId: sectionId },
    include: {
      subject: true,
      faculty: true,
      room: true
    }
  });

  // Fetch dropdown data
  const rooms = await prisma.room.findMany();
  const subjects = await prisma.subject.findMany({
    where: { departmentId: section.departmentId }
  });
  const facultyList = await prisma.user.findMany({
    where: { role: 'FACULTY', departmentId: section.departmentId }
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <Link href="/admin/academics" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Academics
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Calendar className="w-6 h-6 text-amber-400" />
          </div>
          Timetable Editor: {section.name}
        </h1>
        <p className="text-slate-400">Assign faculty and rooms to specific time slots.</p>
      </div>

      <TimetableGrid 
        sectionId={sectionId} 
        initialSchedules={schedules} 
        rooms={rooms}
        subjects={subjects}
        facultyList={facultyList}
      />
    </div>
  );
}
