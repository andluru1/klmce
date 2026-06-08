'use client';

import React, { useState, useRef } from 'react';
import { GlassCard } from '@/components/ui/VibeCard';
import { UploadCloud, FileDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImportZoneProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  expectedFormat: string;
  sampleHeaders: string;
  sampleData: string;
  onUpload: (csvText: string) => Promise<{ count: number, total?: number }>;
  color: 'indigo' | 'emerald' | 'blue' | 'rose';
}

export default function ImportZone({ title, description, icon, expectedFormat, sampleHeaders, sampleData, onUpload, color }: ImportZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = {
    indigo: 'from-indigo-500 to-indigo-600 text-indigo-400 border-indigo-500/50 bg-indigo-500/10',
    emerald: 'from-emerald-500 to-emerald-600 text-emerald-400 border-emerald-500/50 bg-emerald-500/10',
    blue: 'from-blue-500 to-blue-600 text-blue-400 border-blue-500/50 bg-blue-500/10',
    rose: 'from-rose-500 to-rose-600 text-rose-400 border-rose-500/50 bg-rose-500/10',
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setErrorMsg('');
      } else {
        setErrorMsg('Please upload a valid .csv file');
      }
    }
  };

  const downloadSample = (e: React.MouseEvent) => {
    e.stopPropagation();
    const csvContent = `${sampleHeaders}\n${sampleData}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Sample_${title.replace(/\s+/g, '')}.csv`;
    link.click();
  };

  const processUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setIsUploading(false);
        setErrorMsg('Failed to read file');
        return;
      }

      try {
        const result = await onUpload(text);
        setSuccessMsg(`Successfully processed ${result.count} records!`);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        setErrorMsg(err.message || 'An error occurred during upload');
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file');
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  return (
    <GlassCard className="p-6 bg-slate-900/50 border-slate-800 flex flex-col h-full relative overflow-hidden group">
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors[color]} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex gap-3">
          <div className={`p-2.5 rounded-xl ${colors[color].split(' ')[4]}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          </div>
        </div>
        <button 
          onClick={downloadSample}
          className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
          title="Download Sample CSV Template"
        >
          <FileDown className="w-3.5 h-3.5" /> Template
        </button>
      </div>

      <form onSubmit={processUpload} className="flex flex-col flex-1 relative z-10 mt-2">
        <div 
          className={`relative flex-1 min-h-[140px] border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
            isDragActive 
              ? `border-${color}-500 bg-${color}-500/10` 
              : file 
                ? `border-${color}-500/50 bg-slate-800/50` 
                : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setFile(e.target.files[0]);
                setErrorMsg('');
              }
            }}
          />

          {file ? (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`text-${color}-400 flex flex-col items-center`}>
              <CheckCircle2 className="w-10 h-10 mb-3" />
              <h4 className="font-medium text-white">{file.name}</h4>
              <p className="text-xs opacity-80 mt-1">Ready to process</p>
            </motion.div>
          ) : (
            <>
              <div className="p-3 bg-slate-800 rounded-full mb-3 shadow-inner">
                <UploadCloud className={`w-6 h-6 text-slate-400 group-hover:text-${color}-400 transition-colors`} />
              </div>
              <p className="text-sm font-medium text-slate-300 mb-1">Click or drag CSV here</p>
              <p className="text-xs text-slate-500 px-4">Format: {expectedFormat}</p>
            </>
          )}
        </div>

        {errorMsg && (
          <div className="mt-3 text-xs text-rose-400 flex items-center gap-1.5 bg-rose-500/10 p-2 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mt-3 text-xs text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 p-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {successMsg}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isUploading || !file}
          className={`w-full py-3 mt-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            isUploading 
              ? 'bg-slate-700 text-slate-400' 
              : `bg-gradient-to-r ${colors[color].split(' ').slice(0,2).join(' ')} text-white hover:shadow-lg`
          }`}
        >
          {isUploading ? 'Processing...' : 'Upload Data'}
        </button>
      </form>
    </GlassCard>
  );
}
