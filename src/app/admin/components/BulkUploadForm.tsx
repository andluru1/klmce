'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/VibeCard';
import { FileText, UploadCloud } from 'lucide-react';
import { uploadAttendance, uploadFees } from '../actions';

export default function BulkUploadForm() {
  const [uploadType, setUploadType] = useState('attendance');
  const [feeType, setFeeType] = useState('JNTU Fee');
  const [dueDate, setDueDate] = useState('');
  
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file.");
      return;
    }
    
    if (uploadType === 'fees' && !dueDate) {
      alert("Please select a due date for the fees.");
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return setIsUploading(false);

      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      
      // Skip header if it exists
      if (lines[0].toLowerCase().includes('roll')) {
        lines.shift();
      }

      try {
        if (uploadType === 'attendance') {
          // Format: RollNo, Attendance
          const records = lines.map(line => {
            const [rollNo, attendance] = line.split(',');
            return { rollNo: rollNo?.trim(), attendance: parseFloat(attendance?.trim()) };
          }).filter(r => r.rollNo && !isNaN(r.attendance));

          if (records.length === 0) throw new Error("No valid records found. Format: RollNo, Attendance%");

          const res = await uploadAttendance(records);
          alert(`Successfully updated attendance for ${res.count} out of ${res.total} students!`);
        } else {
          // Format: RollNo, Amount
          const records = lines.map(line => {
            const [rollNo, amount] = line.split(',');
            return { rollNo: rollNo?.trim(), feeType, amount: parseFloat(amount?.trim()), dueDate };
          }).filter(r => r.rollNo && !isNaN(r.amount));

          if (records.length === 0) throw new Error("No valid records found. Format: RollNo, Amount");

          const res = await uploadFees(records);
          alert(`Successfully added pending fees for ${res.count} out of ${res.total} students!`);
        }
        
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        alert("Error: " + err.message);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
      <GlassCard className="p-6 bg-slate-900/50 border-slate-800 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Bulk Data Upload (CSV)</h2>
        </div>
        
        <form onSubmit={handleUpload} className="flex flex-col gap-4 flex-1">
          <select 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
            required
          >
            <option value="attendance">Update Attendance (%)</option>
            <option value="fees">Assign Pending Fees (₹)</option>
          </select>
          
          {uploadType === 'fees' && (
            <div className="grid grid-cols-2 gap-4">
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                value={feeType}
                onChange={(e) => setFeeType(e.target.value)}
                required
              >
                <option value="JNTU Fee">JNTU Fee</option>
                <option value="Condonation">Condonation</option>
                <option value="Transport">Transport</option>
                <option value="Tuition">Tuition</option>
              </select>
              <input 
                type="date"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          )}

          <div 
            className="relative mt-4 border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-800/30 transition-colors cursor-pointer group flex-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="p-4 bg-slate-800 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="text-white font-medium mb-1">
              {file ? file.name : 'Select CSV File'}
            </h4>
            <p className="text-slate-500 text-sm">
              {uploadType === 'attendance' ? 'Format: RollNo, Attendance%' : 'Format: RollNo, Amount'}
            </p>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          <button 
            type="submit" 
            disabled={isUploading || !file}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all mt-2 disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Process & Upload Data'}
          </button>
        </form>
      </GlassCard>
    </motion.div>
  );
}
