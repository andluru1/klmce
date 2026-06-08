'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/VibeCard';
import { Check, X, Loader2, Save } from 'lucide-react';
import { markAttendance } from '@/app/actions/attendance';

type Student = {
  id: string;
  name: string;
  rollNumber: string;
  classSectionId: string | null;
  attendancePct: number | null;
};

export default function AttendanceClient({
  sections,
  subjects,
  students,
}: {
  sections: any[];
  subjects: any[];
  students: Student[];
}) {
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [attendanceState, setAttendanceState] = useState<Record<string, 'Present' | 'Absent'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const filteredStudents = students.filter(s => s.classSectionId === selectedSection);

  // Initialize all to Present when section changes
  React.useEffect(() => {
    if (selectedSection) {
      const initialState: Record<string, 'Present' | 'Absent'> = {};
      filteredStudents.forEach(s => {
        initialState[s.id] = 'Present';
      });
      setAttendanceState(initialState);
    }
  }, [selectedSection]);

  const toggleStatus = (studentId: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
    }));
  };

  const handleSubmit = async () => {
    if (!selectedSection || !selectedSubject || !date) {
      setMessage('Please select Section, Subject, and Date.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    const records = filteredStudents.map(s => ({
      userId: s.id,
      status: attendanceState[s.id] || 'Absent'
    }));

    const res = await markAttendance(selectedSection, selectedSubject, date, records);

    if (res.error) {
      setMessage(`Error: ${res.error}`);
    } else {
      setMessage('Attendance successfully marked and percentages recalculated!');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Configuration Panel */}
      <div className="lg:col-span-1 space-y-6">
        <GlassCard className="p-6 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white mb-4">Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
              <input 
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Class Section</label>
              <select 
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">-- Select Section --</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.semester})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
              <select 
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">-- Select Subject --</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedSection || !selectedSubject}
              className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-blue-500/25 flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSubmitting ? 'Saving...' : 'Submit Attendance'}
            </button>

            {message && (
              <div className={`p-3 rounded-lg text-sm mt-4 ${message.includes('Error') ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                {message}
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Student List Panel */}
      <div className="lg:col-span-2">
        <GlassCard className="p-6 bg-slate-900/50 min-h-[500px]">
          <h2 className="text-xl font-bold text-white mb-6">Student Roster</h2>
          
          {!selectedSection ? (
            <div className="flex items-center justify-center h-64 text-slate-500">
              Please select a Class Section to view the roster.
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-slate-500">
              No students found in this section.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStudents.map(student => {
                const isPresent = attendanceState[student.id] === 'Present';
                return (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                    <div>
                      <div className="text-white font-medium">{student.name}</div>
                      <div className="text-slate-400 text-sm">{student.rollNumber} • Prev: {student.attendancePct ?? 100}%</div>
                    </div>
                    
                    <button
                      onClick={() => toggleStatus(student.id)}
                      className={`relative flex items-center justify-center w-24 h-10 rounded-lg font-bold transition-all ${
                        isPresent 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                      }`}
                    >
                      {isPresent ? (
                        <div className="flex items-center gap-1.5"><Check className="w-4 h-4"/> Present</div>
                      ) : (
                        <div className="flex items-center gap-1.5"><X className="w-4 h-4"/> Absent</div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
