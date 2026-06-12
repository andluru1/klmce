import React from 'react';
import Link from 'next/link';
import { Home, BellRing, LogOut, BookOpen, User, Archive, FileSpreadsheet } from 'lucide-react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950">
      <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col h-full sticky top-0 shrink-0">
        <div className="p-6">
          <Link href="/student" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              S
            </div>
            <span className="text-xl font-bold text-white tracking-tight">KSRM Student</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <Link href="/student" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
            <Home className="w-5 h-5 text-blue-400" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/student/timetable" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span className="font-medium">My Timetable</span>
          </Link>
          <Link href="/student/fees" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
            <User className="w-5 h-5 text-emerald-400" />
            <span className="font-medium">Fee Payments</span>
          </Link>
          <Link href="/student/exam-center" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
            <FileSpreadsheet className="w-5 h-5 text-purple-400" />
            <span className="font-medium">Exam Center</span>
          </Link>
          <Link href="/student/notifications" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
            <BellRing className="w-5 h-5 text-rose-400" />
            <span className="font-medium">Inbox</span>
          </Link>
          <Link href="/student/vault" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors">
            <Archive className="w-5 h-5 text-amber-400" />
            <span className="font-medium">Academic Vault</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/login" className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-950">
        {children}
      </main>
    </div>
  );
}
