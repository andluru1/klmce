'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { generateTallyXML } from '@/app/actions/finance';

export default function AdminFinanceClient() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const xmlData = await generateTallyXML();
      if (!xmlData) {
        alert('No successful transactions available to generate Tally XML.');
        setIsDownloading(false);
        return;
      }

      // Simulate a small delay for generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Real download logic
      const blob = new Blob([xmlData], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tally_import_${new Date().toISOString().split('T')[0]}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('XML Generation Initiated. Tally file downloaded successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to generate XML.');
    }

    setIsDownloading(false);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
    >
      {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
      {isDownloading ? 'Generating...' : 'Download Tally XML'}
    </button>
  );
}
