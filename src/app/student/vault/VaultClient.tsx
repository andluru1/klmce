'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/VibeCard';
import { Download, FileText, CheckCircle2, Loader2, FileArchive, QrCode } from 'lucide-react';

interface VaultClientProps {
  studentName: string;
  rollNumber: string;
  departmentName: string;
  semester: string;
  subjects: { id: string, name: string, code: string, credits: number }[];
}

export default function VaultClient({ studentName, rollNumber, departmentName, semester, subjects }: VaultClientProps) {
  const [downloadingSyllabus, setDownloadingSyllabus] = useState<string | null>(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleDownloadSyllabus = (subjectCode: string) => {
    setDownloadingSyllabus(subjectCode);
    // Simulate network delay for downloading PDF
    setTimeout(() => {
      setDownloadingSyllabus(null);
      // In a real app, this would trigger an actual file download
      alert(`Downloaded Official Syllabus for ${subjectCode}.pdf`);
    }, 1500);
  };

  const handleDownloadMasterReport = () => {
    setDownloadingReport(true);
    // Simulate complex PDF generation
    setTimeout(() => {
      setDownloadingReport(false);
      setReportSuccess(true);
      alert(`Consolidated Semester Progress Report generated successfully!`);
      setTimeout(() => setReportSuccess(false), 3000);
    }, 2500);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Actions & ID Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Digital ID Card */}
        <div className="group perspective-1000">
          <div className="relative preserve-3d transition-transform duration-700 w-full group-hover:rotate-y-180">
            {/* Front of ID */}
            <GlassCard className="p-6 bg-gradient-to-br from-indigo-900/80 to-slate-900 border-indigo-500/30 flex flex-col items-center text-center relative overflow-hidden backface-hidden">
              <div className="absolute top-0 w-full h-2 bg-indigo-500"></div>
              <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/50 mb-4 mt-2">
                <span className="text-4xl">👨‍🎓</span>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">{studentName}</h3>
              <p className="text-indigo-300 font-mono text-lg tracking-widest mb-4">{rollNumber}</p>
              
              <div className="w-full bg-slate-950/50 rounded-xl p-3 border border-indigo-500/20 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Department</span>
                  <span className="text-white font-bold">{departmentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Semester</span>
                  <span className="text-white font-bold">{semester}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                Hover to flip <QrCode className="w-3 h-3" />
              </p>
            </GlassCard>

            {/* Back of ID */}
            <GlassCard className="absolute inset-0 p-6 bg-slate-900 border-slate-700 flex flex-col items-center justify-center text-center rotate-y-180 backface-hidden">
              <QrCode className="w-32 h-32 text-white mb-4 opacity-80" />
              <p className="text-sm text-slate-400">Scan for verification</p>
              <div className="mt-6 border-t border-slate-800 pt-4 w-full text-xs text-slate-500">
                Property of KSRM College of Engineering
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Master Report Engine */}
        <GlassCard className="p-8 bg-slate-900 border-slate-800 flex flex-col justify-center">
          <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/30">
            <FileArchive className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Master Progress Report</h2>
          <p className="text-slate-400 mb-8">Generate a unified PDF containing your Attendance Ledger, Financial Statement, and Academic Transcript for the current semester.</p>
          
          <button 
            onClick={handleDownloadMasterReport}
            disabled={downloadingReport}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-xl transition-all flex justify-center items-center gap-2"
          >
            {downloadingReport ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Document...
              </>
            ) : reportSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Ready to Save
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export Complete PDF
              </>
            )}
          </button>
        </GlassCard>

      </div>

      {/* Syllabi List */}
      <div className="space-y-4 pt-6">
        <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">Current Semester Curriculum & Syllabi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map(subj => (
            <div key={subj.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-lg">
                  <FileText className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold">{subj.name}</h4>
                  <p className="text-slate-500 text-xs font-mono">{subj.code} • {subj.credits} Credits</p>
                </div>
              </div>
              
              <button 
                onClick={() => handleDownloadSyllabus(subj.code)}
                disabled={downloadingSyllabus === subj.code}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors"
                title="Download Syllabus PDF"
              >
                {downloadingSyllabus === subj.code ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
