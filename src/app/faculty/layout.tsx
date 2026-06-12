import React from 'react';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { logout } from '@/app/login/actions';
import { redirect } from 'next/navigation';
import { BookOpen, Users, CalendarDays, LogOut, ShieldAlert, FileSpreadsheet, Bell } from 'lucide-react';
import prisma from '@/lib/prisma';

export default async function FacultyLayout({ children }: { children: React.ReactNode }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'FACULTY') {
    redirect('/login');
  }

  const faculty = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { isHOD: true }
  });

  const navLinks = [
    { href: '/faculty', label: 'Dashboard', icon: <BookOpen className="w-5 h-5" /> },
    { href: '/faculty/students', label: 'My Students', icon: <Users className="w-5 h-5" /> },
    { href: '/faculty/schedule', label: 'Schedule', icon: <CalendarDays className="w-5 h-5" /> },
    { href: '/faculty/exams', label: 'Exam Engine', icon: <FileSpreadsheet className="w-5 h-5" /> },
    { href: '/faculty/attendance', label: 'Attendance', icon: <FileSpreadsheet className="w-5 h-5" /> },
    { href: '/faculty/leaves', label: 'My Leaves', icon: <CalendarDays className="w-5 h-5" /> },
    { href: '/faculty/discipline', label: 'Discipline', icon: <ShieldAlert className="w-5 h-5" /> },
    { href: '/faculty/notifications', label: 'Inbox', icon: <Bell className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
              F
            </div>
            <span className="font-bold text-lg text-white tracking-tight">KSRM Faculty</span>
          </div>
        </div>

        <div className="p-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Command Center</p>
          <nav className="space-y-1.5">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          
          {faculty?.isHOD && (
            <Link 
              href="/faculty/hod" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-emerald-300 font-bold hover:text-emerald-100 hover:bg-emerald-900/30 border border-emerald-500/20 transition-colors mt-4"
            >
              <Users className="w-5 h-5" />
              <span>HOD Dashboard</span>
            </Link>
          )}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              {sessionUser.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">{sessionUser.name}</p>
              <p className="text-xs text-slate-500">{sessionUser.rollNumber}</p>
            </div>
          </div>
          
          <form action={logout}>
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-rose-500/10 hover:text-rose-400 transition-colors w-full">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md md:hidden">
          <span className="font-bold text-lg text-white">KSRM Faculty</span>
        </header>
        
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
