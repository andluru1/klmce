import React from 'react';
import prisma from '@/lib/prisma';
import { Send, Megaphone, Users } from 'lucide-react';
import BulkMessageClient from './components/BulkMessageClient';

export default async function CommunicationsPage() {
  const departments = await prisma.department.findMany();

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Megaphone className="w-6 h-6 text-indigo-400" />
          </div>
          Targeted Communications
        </h1>
        <p className="text-slate-400">Send direct bulk messages and alerts to specific groups of students or faculty.</p>
      </div>

      <BulkMessageClient departments={departments} />
    </div>
  );
}
