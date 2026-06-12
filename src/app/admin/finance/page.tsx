import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import AdminFinanceClient from './AdminFinanceClient';
import { IndianRupee, Users, ArrowUpRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/VibeCard';
import AssessFeeForm from './components/AssessFeeForm';
import PaginationControls from '@/components/ui/PaginationControls';

export default async function AdminFinanceLedger({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const currentPage = Number(searchParams?.page) || 1;
  const itemsPerPage = 10;
  const skip = (currentPage - 1) * itemsPerPage;
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'ADMIN') {
    return <div>Access Denied</div>;
  }

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: { id: true, name: true, rollNumber: true },
    orderBy: { rollNumber: 'asc' }
  });

  // Fetch paginated transactions and aggregate global metrics
  const [transactions, totalTxn, grossAgg, uniqueAgg] = await Promise.all([
    prisma.transaction.findMany({
      where: { status: 'SUCCESS' },
      take: itemsPerPage,
      skip: skip,
      include: {
        user: {
          select: { name: true, rollNumber: true, classSectionId: true }
        }
      },
      orderBy: { transactionDate: 'desc' }
    }),
    prisma.transaction.count({ where: { status: 'SUCCESS' } }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS' }
    }),
    prisma.transaction.groupBy({
      by: ['userId'],
      where: { status: 'SUCCESS' }
    })
  ]);

  const totalPages = Math.ceil(totalTxn / itemsPerPage);
  const grossCollections = grossAgg._sum.amount || 0;
  const uniqueStudents = uniqueAgg.length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Finance Ledger</h1>
          <p className="text-slate-400">Master record of all semester fee collections and payment gateways.</p>
        </div>
        <AdminFinanceClient />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <IndianRupee className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Gross Collections</p>
              <h3 className="text-2xl font-bold text-white">₹{grossCollections.toLocaleString()}</h3>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Paying Students</p>
              <h3 className="text-2xl font-bold text-white">{uniqueStudents}</h3>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <ArrowUpRight className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Gateway Status</p>
              <h3 className="text-2xl font-bold text-emerald-400">100% Online</h3>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Col: Fee Assessment */}
        <div className="xl:col-span-1">
          <GlassCard className="p-6 bg-slate-900/50 border-indigo-500/30">
            <h2 className="text-xl font-bold text-white mb-6">Assess New Fee</h2>
            <AssessFeeForm students={students} />
          </GlassCard>
        </div>

        {/* Right Col: Ledger */}
        <div className="xl:col-span-2">
          <GlassCard className="p-6 bg-slate-900/50 h-full">
            <h2 className="text-xl font-bold text-white mb-6">Master Transaction Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Student Name</th>
                <th className="p-4 font-medium">Roll Number</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Receipt No.</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(txn => (
                <tr key={txn.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="p-4 text-slate-300">
                    {new Date(txn.transactionDate).toLocaleString('en-GB', { 
                      day: 'numeric', month: 'short', year: 'numeric', 
                      hour: '2-digit', minute:'2-digit' 
                    })}
                  </td>
                  <td className="p-4 text-white font-medium">{txn.user.name}</td>
                  <td className="p-4 text-slate-400 text-sm font-mono">{txn.user.rollNumber}</td>
                  <td className="p-4 text-emerald-400 font-bold">₹{txn.amount.toLocaleString()}</td>
                  <td className="p-4 font-mono text-sm text-slate-500">{txn.receiptNumber}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 border-t border-slate-800/50 pt-4">
          <PaginationControls totalPages={totalPages} currentPage={currentPage} />
        </div>
      </GlassCard>
      </div>
      </div>
    </div>
  );
}
