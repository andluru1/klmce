import React from 'react';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import FinanceClient from './FinanceClient';

import { redirect } from 'next/navigation';

export default async function StudentFinancePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/login?error=SessionExpired');

  // Find all successful transactions for this student
  const transactions = await prisma.transaction.findMany({
    where: { 
      userId: sessionUser.id,
      status: 'SUCCESS' 
    },
    orderBy: { transactionDate: 'desc' }
  });

  const totalPaid = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  
  // Hardcoded semester fee for this example scenario
  const SEMESTER_FEE = 45000;
  const pendingDues = Math.max(0, SEMESTER_FEE - totalPaid);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Financial Ledger</h1>
        <p className="text-slate-400">View your pending semester dues and secure payment history.</p>
      </div>

      <FinanceClient 
        pendingDues={pendingDues} 
        transactions={transactions} 
      />
    </div>
  );
}
