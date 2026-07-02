import React from 'react';
import { generateNAACReport } from '@/app/actions/generateNAACReport';
import { FileBarChart } from 'lucide-react';
import { GlassCard } from '@/components/ui/VibeCard';
import PrintButton from './components/PrintButton';

export default async function NAACReportsPage() {
  const reportData = await generateNAACReport();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8 print:px-0 print:pt-0">
      
      {/* Header - Screen Only */}
      <div className="flex justify-between items-end print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileBarChart className="w-6 h-6 text-blue-400" />
            </div>
            NAAC/NBA Accreditation Reports
          </h1>
          <p className="text-slate-400">Institutional data aggregation for compliance and reporting.</p>
        </div>
        
        <PrintButton />
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-3xl font-black text-black">KLMCE College of Engineering</h1>
        <h2 className="text-xl font-bold text-black mt-2">NAAC / NBA Accreditation Summary Report</h2>
        <p className="text-sm text-gray-600 mt-1">Generated on: {new Date().toLocaleDateString()}</p>
      </div>

      <GlassCard className="p-0 overflow-hidden bg-slate-900 border-slate-800 print:border-none print:shadow-none print:bg-white">
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 print:bg-gray-100 print:border-black">
          <h3 className="text-lg font-bold text-white print:text-black">Department-wise Metrics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse print:text-black">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 print:bg-gray-50 print:border-black">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider print:text-black print:border print:border-black">Department</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider print:text-black print:border print:border-black text-right">Total Students</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider print:text-black print:border print:border-black text-right">Total Faculty</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider print:text-black print:border print:border-black text-center">Faculty-to-Student Ratio</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider print:text-black print:border print:border-black text-right">Zero-Backlog %</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/20 print:border-black">
                  <td className="p-4 text-sm text-white font-bold print:text-black print:border print:border-black">{row.department}</td>
                  <td className="p-4 text-sm text-slate-300 text-right print:text-black print:border print:border-black">{row.totalStudents}</td>
                  <td className="p-4 text-sm text-slate-300 text-right print:text-black print:border print:border-black">{row.totalFaculty}</td>
                  <td className="p-4 text-sm text-blue-400 font-mono text-center print:text-black print:border print:border-black">{row.ratio}</td>
                  <td className="p-4 text-sm text-emerald-400 font-bold text-right print:text-black print:border print:border-black">{row.passPercentage}</td>
                </tr>
              ))}
              {reportData.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 print:text-black">No department data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block *, table, table * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          table {
            position: absolute;
            left: 0;
            top: 150px;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />
    </div>
  );
}
