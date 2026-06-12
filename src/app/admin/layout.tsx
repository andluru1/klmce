import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, FileText, Settings, BellRing, Briefcase, GraduationCap, CalendarDays, Home, BookOpen, IndianRupee, PenTool, ShieldAlert, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

function AdminSidebar() {
  const links = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Academics', icon: BookOpen, href: '/admin/academics' },
    { name: 'Examinations', icon: PenTool, href: '/admin/exams' },
    { name: 'Finance Ledger', icon: IndianRupee, href: '/admin/finance' },
    { name: 'Discipline', icon: ShieldAlert, href: '/admin/discipline' },
    { name: 'User Management', icon: Users, href: '/admin/users' },
    { name: 'Communications', icon: MessageSquare, href: '/admin/communications' },
    { name: 'Security Logs', icon: ShieldAlert, href: '/admin/security' },
    { name: 'Bulk Upload', icon: FileText, href: '/admin/bulkupload' },
    { name: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <aside className="w-64 h-screen hidden md:flex flex-col bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50 p-4 sticky top-0 shadow-2xl">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
          K
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
          ADMIN
        </h2>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all group"
            >
              <Icon className="w-5 h-5 text-pink-400" />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function AdminNavbar() {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-400">
          <span>Admin Portal</span>
          <span>/</span>
          <span className="text-white">Dashboard</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <BellRing className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-800 mx-2"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
            A
          </div>
          <div className="hidden md:block text-sm">
            <p className="text-white font-medium group-hover:text-indigo-400 transition-colors">Admin User</p>
            <form action="/login/actions/logout" method="POST" className="inline">
              <button type="submit" formAction={async () => {
                'use server';
                const { logout } = await import('@/app/login/actions');
                await logout();
              }} className="text-rose-400 text-xs hover:underline">
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950 overflow-hidden font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
