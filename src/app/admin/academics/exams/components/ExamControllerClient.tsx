'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/VibeCard';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, FileText, UserCheck, Activity } from 'lucide-react';
import { submitStudentMark } from '../../../../actions/calculateGPA';

export default function ExamControllerClient({ exams, subjects, students }: any) {
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [marksObtained, setMarksObtained] = useState<number | ''>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [latestSGPA, setLatestSGPA] = useState<number | null>(null);

  const selectedExam = exams.find((e: any) => e.id === selectedExamId);
  const selectedStudent = students.find((s: any) => s.id === selectedStudentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !selectedStudent || marksObtained === '') return;

    if (marksObtained > selectedExam.maxMarks) {
      setStatusMsg({ type: 'error', text: `Marks cannot exceed max marks (${selectedExam.maxMarks})` });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);
    setLatestSGPA(null);

    try {
      const res = await submitStudentMark({
        studentId: selectedStudentId,
        examId: selectedExamId,
        marksObtained: Number(marksObtained),
        maxMarks: selectedExam.maxMarks
      });

      setStatusMsg({ type: 'success', text: `Successfully graded. Grade Point: ${res.gradePoint}` });
      setLatestSGPA(res.newSGPA);
      setMarksObtained('');
    } catch (error: any) {
      setStatusMsg({ type: 'error', text: error.message || 'Failed to submit marks' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Grade Entry Form */}
      <GlassCard className="p-6 bg-slate-900 border-slate-800 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-pink-400" /> Grade Entry
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Select Exam</label>
            <select 
              required
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 appearance-none"
            >
              <option value="">-- Choose Exam --</option>
              {exams.map((exam: any) => (
                <option key={exam.id} value={exam.id}>
                  {exam.subject.name} ({exam.examType}) - {new Date(exam.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Select Student</label>
            <select 
              required
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 appearance-none"
            >
              <option value="">-- Choose Student --</option>
              {students.map((student: any) => (
                <option key={student.id} value={student.id}>
                  {student.rollNumber} - {student.name}
                </option>
              ))}
            </select>
          </div>

          {selectedExam && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Marks Obtained (Max: {selectedExam.maxMarks})
              </label>
              <input 
                type="number" 
                required
                min={0}
                max={selectedExam.maxMarks}
                value={marksObtained}
                onChange={e => setMarksObtained(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Enter score"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              />
            </motion.div>
          )}

          {statusMsg && (
            <div className={`p-3 rounded-lg flex items-start gap-2 text-sm border ${
              statusMsg.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting || !selectedExamId || !selectedStudentId}
              className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Grade & Calculate'}
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Live SGPA Calculation Panel */}
      <div className="space-y-6">
        <GlassCard className="p-6 bg-slate-900 border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-indigo-400" /> SGPA Calculation Engine
          </h2>
          {latestSGPA !== null ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-indigo-500/50 rounded-2xl bg-indigo-500/5"
            >
              <div className="text-sm font-medium text-indigo-300 uppercase tracking-wider mb-2">
                New SGPA for {selectedStudent?.rollNumber}
              </div>
              <div className="text-6xl font-black text-white drop-shadow-lg">
                {latestSGPA.toFixed(2)}
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500 h-48">
              <UserCheck className="w-12 h-12 mb-3 opacity-20" />
              <p>Select a student and submit marks to instantly calculate their SGPA.</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
