import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import { GlassCard } from '@/components/ui/VibeCard';

export default async function FacultyNotificationsPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'FACULTY') redirect('/login');

  const notifications = await prisma.notification.findMany({
    where: { recipientId: sessionUser.id },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-8 pb-24 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Bell className="w-6 h-6 text-indigo-400" />
          </div>
          Inbox & Alerts
        </h1>
        <p className="text-slate-400 mt-2">
          Review your system alerts, including messages from your HOD regarding leave applications.
        </p>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            You're all caught up! No notifications yet.
          </div>
        ) : (
          notifications.map(n => (
            <GlassCard key={n.id} className="p-5 border-slate-800 flex gap-4">
              <div className="mt-1 shrink-0">
                {n.type === 'GENERAL' ? (
                  <Bell className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-white">{n.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{n.message}</p>
                <p className="text-xs text-slate-500 mt-3">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
