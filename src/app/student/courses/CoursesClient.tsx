"use client";

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/VibeCard';
import { BookOpen, Calendar, Award, CheckCircle2, Clock, BarChart3, Save } from 'lucide-react';
import { saveCourseNote } from './actions';

interface Course {
  id: string;
  code: string;
  name: string;
  semester: string;
  yearTag: string;
  attendancePct: number;
  result: string;
  status: string;
  note: string;
  progress: number;
}

interface Performance {
  overallAttendance: number;
  overallCgpa: string;
  completedCount: number;
  upcomingCount: number;
}

export default function CoursesClient({ courses, performance }: { courses: Course[], performance: Performance }) {
  const [activeFilter, setActiveFilter] = useState('Semester Wise');
  const [activeSemester, setActiveSemester] = useState('I-I');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // Initialize unique semesters
  const uniqueSemesters = Array.from(new Set(courses.map(c => c.semester))).sort();
  
  // Set default active semester to the first one available if none selected
  React.useEffect(() => {
    if (uniqueSemesters.length > 0 && !uniqueSemesters.includes(activeSemester)) {
        setActiveSemester(uniqueSemesters[0]);
    }
  }, [uniqueSemesters, activeSemester]);

  const filteredCourses = courses.filter(course => {
     if (activeFilter === 'Completed') return course.status === 'Completed';
     if (activeFilter === 'Upcoming') return course.status === 'Upcoming';
     // Semester Wise
     return course.semester === activeSemester;
  });

  const handleNoteChange = (id: string, val: string) => {
    setNotes(prev => ({ ...prev, [id]: val }));
  };

  const handleSaveNote = async (id: string) => {
    setSaving(prev => ({ ...prev, [id]: true }));
    const content = notes[id] !== undefined ? notes[id] : (courses.find(c => c.id === id)?.note || '');
    await saveCourseNote(id, content);
    setSaving(prev => ({ ...prev, [id]: false }));
  };

  return (
     <div className="space-y-8">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
           <h1 className="text-4xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
             <BookOpen className="w-8 h-8 text-indigo-400" />
             My Courses
           </h1>
           <p className="text-slate-400 text-lg">
             Manage your courses, track performance, and save study notes.
           </p>
         </div>
       </div>

       {/* Performance Overview Banner */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard className="p-5 bg-slate-900 border-slate-800 flex items-center gap-4">
             <div className="p-3 bg-emerald-500/10 rounded-xl"><BarChart3 className="w-6 h-6 text-emerald-400" /></div>
             <div><p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Overall CGPA</p><p className="text-2xl font-black text-white">{performance.overallCgpa}</p></div>
          </GlassCard>
          <GlassCard className="p-5 bg-slate-900 border-slate-800 flex items-center gap-4">
             <div className="p-3 bg-blue-500/10 rounded-xl"><Calendar className="w-6 h-6 text-blue-400" /></div>
             <div><p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Overall Attendance</p><p className="text-2xl font-black text-white">{performance.overallAttendance}%</p></div>
          </GlassCard>
          <GlassCard className="p-5 bg-slate-900 border-slate-800 flex items-center gap-4">
             <div className="p-3 bg-indigo-500/10 rounded-xl"><CheckCircle2 className="w-6 h-6 text-indigo-400" /></div>
             <div><p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Completed</p><p className="text-2xl font-black text-white">{performance.completedCount} Courses</p></div>
          </GlassCard>
          <GlassCard className="p-5 bg-slate-900 border-slate-800 flex items-center gap-4">
             <div className="p-3 bg-amber-500/10 rounded-xl"><Clock className="w-6 h-6 text-amber-400" /></div>
             <div><p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Upcoming</p><p className="text-2xl font-black text-white">{performance.upcomingCount} Courses</p></div>
          </GlassCard>
       </div>

       {/* Filters */}
       <div className="flex flex-col gap-4">
         <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 w-fit">
           {['Semester Wise', 'Completed', 'Upcoming'].map(filter => (
             <button
               key={filter}
               onClick={() => setActiveFilter(filter)}
               className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                 activeFilter === filter
                   ? 'bg-indigo-500 text-white shadow-md'
                   : 'text-slate-400 hover:text-slate-200'
               }`}
             >
               {filter}
             </button>
           ))}
         </div>

         {/* Semester sub-filter if Semester Wise is selected */}
         {activeFilter === 'Semester Wise' && (
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             {uniqueSemesters.map(sem => (
               <button
                 key={sem}
                 onClick={() => setActiveSemester(sem)}
                 className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                   activeSemester === sem
                     ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 border'
                     : 'bg-slate-900/40 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                 }`}
               >
                 Semester {sem}
               </button>
             ))}
           </div>
         )}
       </div>

       {/* Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
         {filteredCourses.map(course => (
           <GlassCard key={course.id} className="p-0 bg-slate-900/60 border-slate-800 flex flex-col overflow-hidden group">
             <div className="p-6 pb-4">
                 <div className="flex justify-between items-center mb-3">
                   <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 font-mono text-[10px] font-bold rounded">
                     {course.code}
                   </span>
                   <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${course.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                     {course.status}
                   </span>
                 </div>
                 <h3 className="text-lg font-bold text-white mb-4 leading-tight line-clamp-1 group-hover:text-indigo-400 transition-colors">
                   {course.name}
                 </h3>
                 
                 <div className="grid grid-cols-2 gap-3 mb-4">
                   <div className="bg-slate-900 border border-slate-800/80 p-2.5 rounded-xl">
                     <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold mb-1">
                       <Calendar className="w-3.5 h-3.5" /> Attendance
                     </div>
                     <div className="text-emerald-400 font-black text-lg">
                       {course.attendancePct}%
                     </div>
                   </div>
                   <div className="bg-slate-900 border border-slate-800/80 p-2.5 rounded-xl">
                     <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold mb-1">
                       <Award className="w-3.5 h-3.5" /> Grade
                     </div>
                     <div className="text-emerald-400 font-black text-lg">
                       {course.result}
                     </div>
                   </div>
                 </div>

                 <div className="mb-2">
                   <div className="flex justify-between text-[10px] uppercase font-bold mb-1.5">
                     <span className="text-slate-400">Course Progress</span>
                     <span className="text-slate-300">{course.progress}%</span>
                   </div>
                   <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-indigo-500 rounded-full"
                       style={{ width: `${course.progress}%` }}
                     />
                   </div>
                 </div>
             </div>
             
             {/* Notes Section */}
             <div className="p-4 bg-slate-950/50 border-t border-slate-800 mt-auto">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">My Notes & Key Learnings</span>
                    <button 
                       onClick={() => handleSaveNote(course.id)}
                       disabled={saving[course.id]}
                       className="p-1.5 hover:bg-indigo-500/20 text-indigo-400 rounded-md transition-colors"
                       title="Save Notes"
                    >
                        {saving[course.id] ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>
                </div>
                <textarea 
                   className="w-full h-24 bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
                   placeholder="Add notes about what you learned, key takeaways, or things to review..."
                   value={notes[course.id] !== undefined ? notes[course.id] : course.note}
                   onChange={(e) => handleNoteChange(course.id, e.target.value)}
                />
             </div>
           </GlassCard>
         ))}
         
         {filteredCourses.length === 0 && (
           <div className="col-span-full p-12 text-center bg-slate-900/30 border border-slate-800/50 rounded-2xl">
             <p className="text-slate-500">No courses found for the selected filter.</p>
           </div>
         )}
       </div>
     </div>
  );
}
