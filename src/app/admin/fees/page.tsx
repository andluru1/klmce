import React from 'react';
import prisma from '@/lib/prisma';
import { GlassCard } from '@/components/ui/VibeCard';
import FeesTable from './components/FeesTable';
import { IndianRupee, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function FeesPage({ searchParams }: { searchParams: { tab?: string } }) {
  const tab = searchParams.tab || 'collected'; // 'collected' | 'pending'
  const isPending = tab === 'pending';

  // Fetch fees with user relation
  const fees = await prisma.fee.findMany({
    where: {
      isPaid: !isPending
    },
    include: {
      user: {
        include: { department: true }
      }
    },
    orderBy: isPending ? { dueDate: 'asc' } : { paidDate: 'desc' }
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <Link href="/admin" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <IndianRupee className="w-6 h-6 text-indigo-400" />
          </div>
          Detailed Fee Tracking
        </h1>
        <p className="text-slate-400">View detailed transactions, filter by status, and manually edit records.</p>
      </div>

      <GlassCard className="p-1">
        <div className="flex border-b border-slate-800">
          <Link 
            href="?tab=collected" 
            className={`flex-1 text-center py-4 text-sm font-medium transition-colors ${!isPending ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Collected Fees
          </Link>
          <Link 
            href="?tab=pending" 
            className={`flex-1 text-center py-4 text-sm font-medium transition-colors ${isPending ? 'text-rose-400 border-b-2 border-rose-500' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Pending Dues
          </Link>
        </div>
        
        <div className="p-6">
          <FeesTable fees={fees} isPending={isPending} />
        </div>
      </GlassCard>
    </div>
  );
}
