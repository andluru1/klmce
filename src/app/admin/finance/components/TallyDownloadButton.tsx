'use client';

import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { generateTallyXML } from '@/app/actions/finance';

export default function TallyDownloadButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const xmlData = await generateTallyXML();
      if (!xmlData) {
        alert("No successful transactions found for today.");
        return;
      }

      const blob = new Blob([xmlData], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Tally_Vouchers_${new Date().toISOString().split('T')[0]}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert("Failed to generate XML: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={isGenerating}
      className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-colors disabled:opacity-50"
    >
      {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
      Export to Tally
    </button>
  );
}
