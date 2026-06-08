'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/VibeCard';
import { UploadCloud, FileType2, CheckCircle2 } from 'lucide-react';
import { bulkRegisterUsers } from '../../actions';

export default function DragDropUserCSV() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMsg('Please upload a valid .csv file');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const text = await file.text();
      const rows = text.split('\n').map(r => r.trim()).filter(r => r.length > 0);
      
      if (rows.length < 2) {
        throw new Error("CSV file seems empty or missing headers");
      }

      // We pass the raw CSV text to the server action to handle parsing securely
      const result = await bulkRegisterUsers(text);
      setSuccessMsg(`Successfully imported ${result.count} users!`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process CSV file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
      <GlassCard className="p-6 bg-slate-900/50 border-slate-800 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <FileType2 className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Bulk CSV Import</h2>
        </div>

        <p className="text-sm text-slate-400 mb-4">
          Upload a CSV with headers: <code>rollNumber, name, role, departmentCode, currentSem</code>.
        </p>

        <div 
          className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
            isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/30'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processFile(file);
              e.target.value = ''; // reset
            }} 
          />
          
          <UploadCloud className={`w-12 h-12 mb-3 transition-colors ${isDragging ? 'text-indigo-400' : 'text-slate-500'}`} />
          
          <h3 className="text-lg font-bold text-white mb-1">
            {isUploading ? 'Uploading...' : 'Drag & Drop CSV'}
          </h3>
          <p className="text-slate-400 text-sm">
            or click to browse your computer
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {successMsg}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
