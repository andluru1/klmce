import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, UserMinus } from 'lucide-react';
import AdjustmentsClient from './components/AdjustmentsClient';

export default async function AdjustmentsPage() {
  const departments = await prisma.department.findMany();
  
  // Fetch all schedules with full relations for viewing
  const schedules = await prisma.schedule.findMany({
    include: {
      faculty: true,
      subject: true,
      room: true,
      classSection: true,
    }
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <Link href="/admin/academics" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Academics
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-rose-500/20 rounded-lg">
            <UserMinus className="w-6 h-6 text-rose-400" />
          </div>
          Lecture Adjustments & Substitutions
        </h1>
        <p className="text-slate-400">Assign substitute faculty for absent teachers by finding available staff in real-time.</p>
      </div>

      <AdjustmentsClient 
        schedules={schedules} 
        departments={departments}
      />
    </div>
  );
}
