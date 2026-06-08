import React from 'react';
import prisma from '@/lib/prisma';
import { Briefcase, Users, Mail, BookOpen } from 'lucide-react';
import { GlassCard } from '@/components/ui/VibeCard';

export default async function FacultyDirectoryPage() {
  const departments = await prisma.department.findMany({
    include: {
      users: {
        where: { role: 'FACULTY' },
        include: {
          schedules: {
            include: { subject: true }
          }
        }
      }
    }
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Briefcase className="w-6 h-6 text-indigo-400" />
          </div>
          Faculty Directory
        </h1>
        <p className="text-slate-400">Department-wise staff details and academic workload.</p>
      </div>

      <div className="space-y-12">
        {departments.map(dept => {
          if (dept.users.length === 0) return null;
          return (
            <div key={dept.id} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                <h2 className="text-2xl font-bold text-white">{dept.name}</h2>
                <span className="px-2.5 py-1 bg-slate-800 text-slate-400 text-xs font-medium rounded-md">
                  {dept.users.length} Faculty
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dept.users.map(faculty => (
                  <GlassCard key={faculty.id} className="p-5 bg-slate-900/50 border-slate-800 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold text-xl">
                          {faculty.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-white font-bold">{faculty.name}</h3>
                          <p className="text-xs text-slate-400">{faculty.rollNumber}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <BookOpen className="w-4 h-4 text-slate-500" />
                        <span>{faculty.schedules.length} Assigned Classes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <span className="text-xs">{faculty.rollNumber.toLowerCase()}@ksrmce.ac.in</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-800/50 flex gap-2">
                      <button className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-md transition-colors">
                        View Schedule
                      </button>
                      <button className="flex-1 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium rounded-md transition-colors">
                        Assign Subject
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
