'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/VibeCard';
import { Users, CreditCard, FileSpreadsheet } from 'lucide-react';

export default function ExportModule({ users, fees }: { users: any[], fees: any[] }) {
  
  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }
    
    // Extract headers
    const headers = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');
    
    // Convert to CSV
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          let val = row[header];
          if (val === null || val === undefined) val = '';
          // Wrap in quotes if it contains comma
          if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
          return val;
        }).join(',')
      )
    ].join('\n');

    // Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportStudents = () => {
    const studentData = users.map(u => ({
      RollNumber: u.rollNumber,
      Name: u.name,
      Role: u.role,
      Department: u.departmentId || 'N/A',
      Semester: u.currentSem || 'N/A',
      AttendancePct: u.attendancePct,
    }));
    downloadCSV(studentData, 'ums_students_export');
  };

  const exportFees = () => {
    const feeData = fees.map(f => ({
      FeeID: f.id,
      StudentRollNo: f.user?.rollNumber || 'Unknown',
      StudentName: f.user?.name || 'Unknown',
      FeeType: f.feeType,
      Amount: f.amount,
      IsPaid: f.isPaid ? 'YES' : 'NO',
      DueDate: new Date(f.dueDate).toLocaleDateString(),
      PaidDate: f.paidDate ? new Date(f.paidDate).toLocaleDateString() : 'N/A',
      PaymentMode: f.paymentMode || 'N/A',
      ReferenceNo: f.paymentRef || 'N/A'
    }));
    downloadCSV(feeData, 'ums_fees_export');
  };

  return (
    <GlassCard className="p-6 bg-slate-900/50 border-slate-800 space-y-4">
      <p className="text-sm text-slate-400 mb-4">
        Generate instant CSV backups of your database records.
      </p>

      <button 
        onClick={exportStudents}
        className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-white font-bold group-hover:text-indigo-400 transition-colors">Export User Data</h3>
            <p className="text-xs text-slate-500">Download all student profiles and attendance records</p>
          </div>
        </div>
        <FileSpreadsheet className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" />
      </button>

      <button 
        onClick={exportFees}
        className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-white font-bold group-hover:text-emerald-400 transition-colors">Export Financials</h3>
            <p className="text-xs text-slate-500">Download all fee transactions (Paid & Pending)</p>
          </div>
        </div>
        <FileSpreadsheet className="w-5 h-5 text-slate-500 group-hover:text-emerald-400" />
      </button>

    </GlassCard>
  );
}
