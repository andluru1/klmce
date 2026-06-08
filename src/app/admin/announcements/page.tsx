import React from 'react';
import prisma from '@/lib/prisma';
import { GlassCard } from '@/components/ui/VibeCard';
import { Megaphone, ArrowLeft, Trash2, Paperclip } from 'lucide-react';
import Link from 'next/link';
import DeleteAnnouncementButton from './components/DeleteAnnouncementButton';

export default async function AnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    include: { author: true },
    orderBy: { createdAt: 'desc' }
  });

  const getImportanceColor = (imp: string) => {
    switch (imp) {
      case 'High': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'Low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <Link href="/admin" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Megaphone className="w-6 h-6 text-indigo-400" />
          </div>
          Manage Announcements
        </h1>
        <p className="text-slate-400">View and delete broadcasted announcements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {announcements.map((ann) => (
          <GlassCard key={ann.id} className="p-6 bg-slate-900/50 border-slate-800 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2">
                <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {ann.category}
                </span>
                <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md border ${getImportanceColor(ann.importance)}`}>
                  {ann.importance}
                </span>
              </div>
              <DeleteAnnouncementButton id={ann.id} />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">{ann.title}</h3>
            <p className="text-slate-400 text-sm flex-1 whitespace-pre-wrap mb-4">{ann.content}</p>

            {ann.attachmentUrl && (
              <a 
                href={ann.attachmentUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 text-indigo-400 text-sm mb-4 hover:text-indigo-300 transition-colors bg-indigo-500/10 p-2 rounded-lg"
              >
                <Paperclip className="w-4 h-4" /> View Attachment
              </a>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
              <span>By {ann.author.name}</span>
              <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
            </div>
          </GlassCard>
        ))}

        {announcements.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No announcements broadcasted yet.
          </div>
        )}
      </div>
    </div>
  );
}
