import React from 'react';
import { GlassCard } from '@/components/ui/VibeCard';
import { Users, IndianRupee, AlertTriangle, GraduationCap, FileBarChart } from 'lucide-react';
import prisma from '@/lib/prisma';
import AnnouncementForm from './components/AnnouncementForm';
import Link from 'next/link';

export default async function AdminDashboard() {
  // Hardcode admin logic since KSRMMS doesn't have login yet
  const adminId = 'admin-id-placeholder';

  // Fetch real stats
  const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
  
  // Fee Calculations
  const allFees = await prisma.fee.findMany();
  const totalExpectedFees = allFees.reduce((sum, f) => sum + f.amount, 0);
  
  const paidFees = allFees.filter(f => f.isPaid);
  const totalCollected = paidFees.reduce((sum, f) => sum + f.amount, 0);

  const pendingFees = allFees.filter(f => !f.isPaid);
  const totalPendingAmount = pendingFees.reduce((sum, f) => sum + f.amount, 0);
  
  const uniqueStudentsWithPendingFees = new Set(pendingFees.map(f => f.userId)).size;

  // Low Attendance (< 75)
  const lowAttendanceStudents = await prisma.user.count({ 
    where: { 
      role: 'STUDENT', 
      attendancePct: { lt: 75 } 
    } 
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Control Panel</h1>
        <p className="text-slate-400">Manage KSRMMS students, fees, and announcements.</p>
      </div>

      {/* Enterprise Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/academics/exams" className="block h-full">
          <GlassCard className="p-6 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/40 transition-all hover:bg-indigo-500/20 cursor-pointer h-full text-center">
            <div className="p-4 rounded-2xl bg-indigo-500/20 text-indigo-400">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Exams Engine</h3>
              <p className="text-slate-400 text-sm mt-1">Manage Marks & Calculate SGPA</p>
            </div>
          </GlassCard>
        </Link>

        <Link href="/admin/finance" className="block h-full">
          <GlassCard className="p-6 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:bg-emerald-500/20 cursor-pointer h-full text-center">
            <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <IndianRupee className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Finance Ledger</h3>
              <p className="text-slate-400 text-sm mt-1">Export Tally XML & Transactions</p>
            </div>
          </GlassCard>
        </Link>

        <Link href="/admin/reports" className="block h-full">
          <GlassCard className="p-6 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40 transition-all hover:bg-blue-500/20 cursor-pointer h-full text-center">
            <div className="p-4 rounded-2xl bg-blue-500/20 text-blue-400">
              <FileBarChart className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">NAAC Reports</h3>
              <p className="text-slate-400 text-sm mt-1">Accreditation Data & Printing</p>
            </div>
          </GlassCard>
        </Link>
      </div>

      {/* Quick Stats */}
      <h2 className="text-xl font-bold text-white mt-8 mb-4">Quick Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Total Students', value: totalStudents.toLocaleString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', link: '/admin/users' },
          { title: 'Low Attendance (<75%)', value: lowAttendanceStudents.toLocaleString(), icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
          { title: 'Students w/ Pending Dues', value: uniqueStudentsWithPendingFees.toLocaleString(), icon: Users, color: 'text-orange-400', bg: 'bg-orange-500/10', link: '/admin/fees?tab=pending' },
          { title: 'Total Expected Fees (₹)', value: totalExpectedFees.toLocaleString(), icon: IndianRupee, color: 'text-indigo-400', bg: 'bg-indigo-500/10', link: '/admin/fees' },
          { title: 'Total Collected Fees (₹)', value: totalCollected.toLocaleString(), icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/10', link: '/admin/fees?tab=collected' },
          { title: 'Total Pending Dues (₹)', value: totalPendingAmount.toLocaleString(), icon: IndianRupee, color: 'text-rose-400', bg: 'bg-rose-500/10', link: '/admin/fees?tab=pending' },
        ].map((stat, i) => {
          const CardContent = (
            <GlassCard className="p-6 flex items-center gap-4 bg-slate-900/50 border-slate-800 transition-all hover:bg-slate-800/80 cursor-pointer h-full">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
              </div>
            </GlassCard>
          );

          return stat.link ? (
            <Link href={stat.link} key={i} className="block h-full">
              {CardContent}
            </Link>
          ) : (
            <div key={i} className="h-full">
              {CardContent}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <AnnouncementForm authorId={adminId} />
          <Link href="/admin/announcements" className="block text-center w-full py-3 bg-slate-800/50 hover:bg-slate-800 text-indigo-400 font-medium rounded-xl border border-slate-700 transition-colors">
            Manage Previous Announcements &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
