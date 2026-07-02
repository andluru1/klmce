'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/VibeCard';
import { X, Calendar, Award, BookOpen } from 'lucide-react';

type SubjectResultCardProps = {
  subjGroup: {
    subject: any;
    results: any[];
    totalMarks: number;
    maxTotalMarks: number;
    finalGradePoint: number;
  };
};

export default function SubjectResultCard({ subjGroup }: SubjectResultCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <GlassCard 
        className="p-5 bg-slate-950 border-slate-800 relative overflow-hidden hover:border-indigo-500/50 hover:ring-2 ring-indigo-500/20 transition-all flex flex-col cursor-pointer group"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="space-y-1">
            <h3 className="text-md font-bold text-white leading-tight group-hover:text-indigo-300 transition-colors">{subjGroup.subject.name}</h3>
            <p className="text-xs text-slate-500 font-mono">{subjGroup.subject.code} • {subjGroup.subject.credits} Credits</p>
          </div>
          <div className="text-right">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
              subjGroup.finalGradePoint >= 8 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
              subjGroup.finalGradePoint >= 6 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
              'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              <span className="font-bold text-sm">{subjGroup.finalGradePoint}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-2 mb-4 relative z-10">
          {subjGroup.results.map((res: any) => (
            <div key={res.id} className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">{res.exam.examType}</span>
              <div className="flex items-center gap-3">
                <span className="text-white font-medium">{res.marksObtained} <span className="text-slate-600">/ {res.exam.maxMarks}</span></span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-800/50 flex justify-between items-center text-sm relative z-10">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="font-bold text-indigo-400">Total Score</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
            <span>{subjGroup.totalMarks} <span className="text-indigo-500/50">/ {subjGroup.maxTotalMarks}</span></span>
          </div>
        </div>
      </GlassCard>

      {/* Detail Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div 
            className="glass-card w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 md:p-8 bg-transparent border-b border-white/20 flex justify-between items-start">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl mt-1">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-1 bg-slate-800 text-slate-300 rounded uppercase tracking-widest">
                      SEM {subjGroup.subject.semester}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{subjGroup.subject.code}</span>
                  </div>
                  <h2 className="text-2xl font-black text-white">{subjGroup.subject.name}</h2>
                  <p className="text-sm text-slate-400 mt-1">{subjGroup.subject.credits} Credits</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Detailed Marks Table */}
            <div className="p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 indian-accent">Detailed Assessment Breakdown</h3>
              <div className="bg-white/10 border border-white/30 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="divide-y divide-white/20 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {subjGroup.results.map((res: any) => (
                    <div key={res.id} className="flex flex-col p-5 hover:bg-white/20 transition-colors gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${res.exam.examType === 'Final' ? 'bg-indigo-500' : 'bg-amber-500'}`} />
                          <span className="text-sm font-bold text-white uppercase tracking-wider">{res.exam.examType}</span>
                          {res.exam.mode === 'Online' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">ONLINE</span>
                          )}
                          {res.status === 'ABSENT' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">ABSENT</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`text-xl font-black ${res.status === 'ABSENT' ? 'text-rose-500' : 'text-white'}`}>
                            {res.status === 'ABSENT' ? '0' : res.marksObtained}
                          </span>
                          <span className="text-xs text-slate-500 ml-1">{"/"} {res.exam.maxMarks}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-1">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          {new Date(res.exam.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        {res.exam.startTime && res.exam.endTime && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                            <span className="font-bold text-slate-500">TIME:</span> {res.exam.startTime} - {res.exam.endTime}
                          </div>
                        )}
                        {res.exam.room && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                            <span className="font-bold text-slate-500">ROOM:</span> {res.exam.room.number}
                          </div>
                        )}
                        {res.exam.invigilator && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                            <span className="font-bold text-slate-500">INVIGILATOR:</span> {res.exam.invigilator.name}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-4 p-5 bg-indigo-500/10 border-t border-white/20 items-center">
                  <div className="col-span-3 text-right text-sm font-bold text-indigo-800 tracking-wider uppercase">
                    Total Score
                  </div>
                  <div className="text-right flex items-center justify-end gap-2">
                    <Award className="w-5 h-5 text-indigo-600" />
                    <span className="text-xl font-black text-indigo-900">{subjGroup.totalMarks}</span>
                    <span className="text-sm text-indigo-800/50 font-bold">{"/"} {subjGroup.maxTotalMarks}</span>
                  </div>
                </div>
              </div>

              {subjGroup.finalGradePoint === 0 && (
                <div className="mt-6 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <BookOpen className="w-24 h-24 text-rose-500" />
                  </div>
                  <div className="flex items-center gap-2 text-rose-400 mb-1 relative z-10">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    <h4 className="font-bold uppercase tracking-widest text-sm">Action Required</h4>
                  </div>
                  <p className="text-sm text-slate-300 relative z-10">
                    You have an <strong className="text-white">active backlog</strong> in this subject. Please take the following steps to clear it:
                  </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 relative z-10">
                    <div className="p-4 bg-white/30 rounded-xl border border-white/40 shadow-sm backdrop-blur-md">
                      <h5 className="text-xs font-bold text-rose-800 uppercase mb-2">Next Steps</h5>
                      <ul className="text-sm text-rose-950 space-y-1.5 list-disc list-inside">
                        <li>Register for Supplementary Exams via Exam Center.</li>
                        <li>Pay the pending fee of ₹1,500.</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-white/30 rounded-xl border border-white/40 shadow-sm backdrop-blur-md">
                      <h5 className="text-xs font-bold text-rose-800 uppercase mb-2">Whom to Contact</h5>
                      <ul className="text-sm text-rose-950 space-y-1.5 list-disc list-inside">
                        <li>Prof. Ramesh (HOD, CS Dept)</li>
                        <li>Exam Cell: <a href="mailto:examcell@KLMCE.edu" className="text-indigo-800 font-bold hover:text-indigo-600">examcell@KLMCE.edu</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
