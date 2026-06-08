import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { updateLeaveStatus } from '../../../faculty/actions';
import { GlassCard } from '@/components/ui/VibeCard';
import { revalidatePath } from 'next/cache';

export default async function AdminLeavesPage() {
  const leaves = await prisma.leaveRequest.findMany({
    where: { status: 'PENDING' },
    include: {
      faculty: {
        include: { department: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const handleStatusUpdate = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    const status = formData.get('status') as string;
    await prisma.leaveRequest.update({
      where: { id },
      data: { status }
    });
    revalidatePath('/admin/academics/leaves');
    revalidatePath('/faculty/leaves');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <Link href="/admin/academics" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Academics
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          Pending Leave Requests
        </h1>
        <p className="text-slate-400">Review and approve faculty time-off requests.</p>
      </div>

      {leaves.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-700 rounded-xl text-slate-500">
          No pending leave requests at this time.
        </div>
      ) : (
        <div className="space-y-4">
          {leaves.map(l => (
            <GlassCard key={l.id} className="p-5 bg-slate-900/50 border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold">{l.faculty.name} <span className="text-xs text-slate-500 font-normal">({l.faculty.department?.name})</span></h3>
                <p className="text-sm text-amber-400 font-medium my-1">
                  {l.startDate.toLocaleDateString()} to {l.endDate.toLocaleDateString()}
                </p>
                <p className="text-sm text-slate-400">"{l.reason}"</p>
              </div>

              <div className="flex gap-2">
                <form action={handleStatusUpdate}>
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="status" value="APPROVED" />
                  <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-bold rounded-lg transition-colors border border-emerald-500/20">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                </form>
                
                <form action={handleStatusUpdate}>
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="status" value="REJECTED" />
                  <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-bold rounded-lg transition-colors border border-rose-500/20">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </form>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
