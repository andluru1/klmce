'use client';

import React from 'react';
import Link from 'next/link';
import { Home, BookOpen, Video, Library, MessageSquare, Menu, FileText, Briefcase, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function Sidebar() {
  const links = [
    { name: 'Dashboard', icon: Home, href: '/student' },
    { name: 'Departments', icon: Users, href: '/student/departments' },
    { name: 'My Courses', icon: Library, href: '/student/courses' },
    { name: 'Live Classes', icon: Video, href: '/student/classes' },
    { name: 'Examinations', icon: FileText, href: '/student/examinations' },
    { name: 'Placements', icon: Briefcase, href: '/student/placements' },
    { name: 'Messages', icon: MessageSquare, href: '/student/messages' },
  ];

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        'w-64 h-screen hidden md:flex flex-col bg-white/10 backdrop-blur-xl border-r border-white/20 p-4 sticky top-0 shadow-2xl'
      )}
    >
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
          K
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
          KSRMMS
        </h2>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
