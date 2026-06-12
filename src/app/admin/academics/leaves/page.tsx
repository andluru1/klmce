import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import AdminLeaveClient from './AdminLeaveClient';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLeavesPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'ADMIN') redirect('/login');

  const leaves = await prisma.leaveRequest.findMany({
    where: { 
      status: {
        in: ['HOD_APPROVED', 'APPROVED', 'REJECTED']
      }
    },
    include: {
      faculty: { include: { department: true } },
      messages: {
        include: { sender: true },
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-8 pb-24">
      <div className="mb-8">
        <Link href="/admin/academics" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Academics
        </Link>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Clock className="w-8 h-8 text-amber-500" />
          Leave Approvals
        </h1>
        <p className="text-slate-400 mt-2">
          Review leaves that have been approved by Department Heads, and provide final Admin authorization.
        </p>
      </div>

      <AdminLeaveClient leaves={leaves} currentUserId={sessionUser.id} />
    </div>
  );
}
