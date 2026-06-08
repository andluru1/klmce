import React from 'react';
import prisma from '@/lib/prisma';
import { GlassCard } from '@/components/ui/VibeCard';
import { BellRing, CheckCircle2 } from 'lucide-react';
import { markNotificationRead } from '../../admin/actions';

import { getSessionUser } from '@/lib/auth';

export default async function StudentNotificationsPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;

  const student = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      notifications: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!student) return null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-rose-500/20 rounded-lg">
            <BellRing className="w-6 h-6 text-rose-400" />
          </div>
          My Inbox
        </h1>
        <p className="text-slate-400">View direct messages and alerts from the administration.</p>
      </div>

      <div className="space-y-4">
        {student.notifications.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-700 rounded-xl text-slate-500">
            Your inbox is empty.
          </div>
        ) : (
          student.notifications.map(n => (
            <GlassCard key={n.id} className={`p-5 border-slate-800 flex items-start gap-4 ${n.isRead ? 'bg-slate-900/30 opacity-70' : 'bg-slate-900/80 shadow-md shadow-rose-500/5'}`}>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-bold text-lg">{n.title}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                      n.type === 'ATTENDANCE' ? 'bg-rose-500/20 text-rose-400' :
                      n.type === 'FEE' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-indigo-500/20 text-indigo-400'
                    }`}>
                      {n.type}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-slate-300 text-sm">{n.message}</p>
              </div>

              {!n.isRead && (
                <form action={async () => {
                  'use server';
                  await markNotificationRead(n.id);
                }}>
                  <button type="submit" className="p-2 text-slate-400 hover:text-emerald-400 transition-colors" title="Mark as Read">
                    <CheckCircle2 className="w-6 h-6" />
                  </button>
                </form>
              )}
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
