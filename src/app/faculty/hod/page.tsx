import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Users, ShieldAlert } from 'lucide-react';
import HODClient from './HODClient';

export default async function HODDashboard() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'FACULTY') redirect('/login');

  const faculty = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { department: true }
  });

  if (!faculty?.isHOD) {
    redirect('/faculty'); // Kick non-HODs out
  }

  // Fetch leave requests for all faculty in the HOD's department
  const leaves = await prisma.leaveRequest.findMany({
    where: {
      faculty: { departmentId: faculty.departmentId }
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
        <h1 className="text-3xl font-black text-emerald-400 flex items-center gap-3">
          <Users className="w-8 h-8" />
          HOD Dashboard
        </h1>
        <p className="text-slate-400 mt-2">
          Review department leave requests and manage academic affairs for {faculty.department?.name}.
        </p>
      </div>

      <HODClient leaves={leaves} currentUserId={faculty.id} />
    </div>
  );
}
