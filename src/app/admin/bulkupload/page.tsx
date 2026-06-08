'use client';

import React from 'react';
import { Database, Users, GraduationCap, IndianRupee, FileBarChart } from 'lucide-react';
import ImportZone from './components/ImportZone';
import { bulkRegisterUsers, uploadAttendance, uploadFees } from '../actions';

export default function BulkUploadPage() {
  
  // 1. Handlers
  const handleStudents = async (csvText: string) => {
    return await bulkRegisterUsers(csvText);
  };

  const handleAttendance = async (csvText: string) => {
    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l);
    if (lines[0].toLowerCase().includes('roll')) lines.shift();
    
    const records = lines.map(line => {
      const [rollNo, attendance] = line.split(',');
      return { rollNo: rollNo?.trim(), attendance: parseFloat(attendance?.trim()) };
    }).filter(r => r.rollNo && !isNaN(r.attendance));

    if (records.length === 0) throw new Error("No valid records. Ensure format is RollNo, Attendance");
    return await uploadAttendance(records);
  };

  const handleFees = async (csvText: string) => {
    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l);
    if (lines[0].toLowerCase().includes('roll')) lines.shift();

    const records = lines.map(line => {
      const [rollNo, feeType, amount, dueDate] = line.split(',');
      return { 
        rollNo: rollNo?.trim(), 
        feeType: feeType?.trim() || 'General Fee', 
        amount: parseFloat(amount?.trim()), 
        dueDate: dueDate?.trim() || new Date().toISOString() 
      };
    }).filter(r => r.rollNo && !isNaN(r.amount));

    if (records.length === 0) throw new Error("No valid records. Ensure format is RollNo, FeeType, Amount, DueDate");
    return await uploadFees(records);
  };

  const handleMarks = async (csvText: string) => {
    throw new Error("Marks module is currently under development.");
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Database className="w-6 h-6 text-indigo-400" />
          </div>
          Central Data Import Hub
        </h1>
        <p className="text-slate-400">Securely upload and process massive CSV datasets instantly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Student Registration */}
        <ImportZone 
          title="Student Registrations"
          description="Create accounts and passwords in bulk."
          icon={<Users className="w-5 h-5" />}
          color="indigo"
          expectedFormat="RollNumber, Name, Role, DepartmentCode, CurrentSem"
          sampleHeaders="RollNumber,Name,Role,DepartmentCode,CurrentSem"
          sampleData="209Y1A0501,John Doe,STUDENT,05,III-I\n209Y1A0402,Jane Smith,STUDENT,04,II-II"
          onUpload={handleStudents}
        />

        {/* Attendance Updates */}
        <ImportZone 
          title="Attendance Updates"
          description="Instantly update aggregate attendance."
          icon={<GraduationCap className="w-5 h-5" />}
          color="emerald"
          expectedFormat="RollNo, Attendance%"
          sampleHeaders="RollNo,Attendance"
          sampleData="209Y1A0501,85.5\n209Y1A0402,92.0\n209Y1A0303,74.2"
          onUpload={handleAttendance}
        />

        {/* Fee Assignments */}
        <ImportZone 
          title="Fee Assignments"
          description="Assign pending dues to students."
          icon={<IndianRupee className="w-5 h-5" />}
          color="rose"
          expectedFormat="RollNo, FeeType, Amount, DueDate(YYYY-MM-DD)"
          sampleHeaders="RollNo,FeeType,Amount,DueDate"
          sampleData="209Y1A0501,JNTU Fee,1500,2026-10-15\n209Y1A0402,Tuition Fee,45000,2026-12-01"
          onUpload={handleFees}
        />

        {/* Marks & Grades */}
        <ImportZone 
          title="Marks & Grades"
          description="Upload mid-term and semester results."
          icon={<FileBarChart className="w-5 h-5" />}
          color="blue"
          expectedFormat="RollNo, SubjectCode, InternalMarks, ExternalMarks"
          sampleHeaders="RollNo,SubjectCode,InternalMarks,ExternalMarks"
          sampleData="209Y1A0501,CS301,24,65\n209Y1A0402,EC301,22,58"
          onUpload={handleMarks}
        />

      </div>
    </div>
  );
}
