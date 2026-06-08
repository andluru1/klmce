'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function TopNav() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const menus = [
    {
      name: 'About',
      links: [
        { label: 'About KSRMCE', href: 'https://ksrmce.ac.in/college.php' },
        { label: 'Correspondent', href: 'https://ksrmce.ac.in/Correspondent%20Maam.php' },
        { label: 'Managing Director', href: 'https://ksrmce.ac.in/director.php' },
        { label: 'Chairman', href: 'https://ksrmce.ac.in/vice%20chairman%20sir.php' },
        { label: 'Principal', href: 'https://ksrmce.ac.in/principal.php' },
        { label: 'Joint Board of studies', href: 'https://ksrmce.ac.in/jbos.php' },
        { label: 'Orgonogram', href: 'https://ksrmce.ac.in/Organogram_Version-4.JPG' },
        { label: 'Strategic Plan & Deployement Documents', href: 'https://ksrmce.ac.in/strategicplan.php' },
        { label: 'Magazines', href: 'https://ksrmce.ac.in/Magazine.php' },
        { label: 'Institution Core Values', href: 'https://ksrmce.ac.in/NAAC/Institution%20Core%20Values.pdf' },
        { label: 'Code of Professional Conduct', href: 'https://ksrmce.ac.in/NAAC/Code%20of%20Professional%20Conduct.pdf' },
        { label: 'Code of Conduct Handbook', href: 'https://ksrmce.ac.in/CodeofConduct.pdf' },
        { label: 'Faculty Evaluation System', href: 'https://ksrmce.ac.in/NAAC/FacultyEvaluationSystem.pdf' },
        { label: 'Code of Ethics in Research and Innovation', href: 'https://ksrmce.ac.in/NAAC/code%20of%20ethics%20in%20research%20and%20innovation.pdf' },
      ],
    },
    { name: 'Departments', links: [] },
    { name: 'Academics', links: [] },
    { name: 'Student Services', links: [] },
  ];

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full h-16 bg-white/10 backdrop-blur-xl border-b border-white/20 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm"
    >
      <div className="flex items-center gap-8">
        {/* Mega Menu Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {menus.map((menu) => (
            <div
              key={menu.name}
              className="relative group"
              onMouseEnter={() => setActiveDropdown(menu.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 text-white/90 font-medium hover:text-white transition-colors py-5">
                {menu.name}
                {menu.links.length > 0 && <ChevronDown className="w-4 h-4" />}
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {activeDropdown === menu.name && menu.links.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-64 bg-[#1a1c29]/95 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-xl py-2 overflow-hidden z-50"
                  >
                    {menu.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-64 h-9 bg-black/20 border border-white/10 rounded-full pl-9 pr-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all"
          />
        </div>

        <button className="relative p-2 rounded-full hover:bg-white/10 text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>

        <button className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 shadow-md hover:shadow-lg transition-all hover:scale-105 border border-white/20 text-white">
          <User className="w-5 h-5" />
        </button>
      </div>
    </motion.header>
  );
}
