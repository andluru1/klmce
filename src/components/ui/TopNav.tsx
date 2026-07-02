'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bell, Search, User, ChevronDown, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function TopNav() {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (window.innerWidth < 1024) {
        if (currentScrollY > lastScrollY && currentScrollY > 60) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }
      
      setIsScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const menus = [
    {
      name: 'About',
      links: [
        { label: 'About KLMCE', href: 'https://KLMCE.ac.in/college.php' },
        { label: 'Correspondent', href: 'https://KLMCE.ac.in/Correspondent%20Maam.php' },
        { label: 'Managing Director', href: 'https://KLMCE.ac.in/director.php' },
        { label: 'Chairman', href: 'https://KLMCE.ac.in/vice%20chairman%20sir.php' },
        { label: 'Principal', href: 'https://KLMCE.ac.in/principal.php' },
      ],
    },
    { name: 'Departments', links: [] },
    { name: 'Academics', links: [] },
    { name: 'Student Services', links: [] },
  ];

  if (pathname === '/login') {
    return null;
  }

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: isVisible ? 0 : -100, 
          opacity: isVisible ? 1 : 0 
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`w-full h-16 md:h-20 ${
          isScrolled 
            ? 'bg-[#1a1c29]/95 backdrop-blur-xl border-b border-white/10 shadow-lg' 
            : 'bg-white/5 backdrop-blur-sm border-b border-white/10'
        } fixed top-0 left-0 z-50 transition-colors duration-300 px-4 md:px-6 flex items-center justify-between`}
      >
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-white/80 hover:text-white p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-white rounded-full p-1 shadow-md flex-shrink-0">
              <Image 
                src="/klmce-logo.png" 
                alt="KLMCE Logo" 
                fill
                className="object-contain p-1"
                unoptimized
              />
            </div>
            <div className="hidden sm:block flex-col">
              <h1 className="text-white font-bold text-sm md:text-base leading-tight tracking-wide">KLMCE</h1>
              <p className="text-white/60 text-[10px] md:text-xs leading-none">Kadapa</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 ml-4">
            {menus.map((menu) => (
              <div
                key={menu.name}
                className="relative group h-full flex items-center"
                onMouseEnter={() => setActiveDropdown(menu.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white transition-colors py-6">
                  {menu.name}
                  {menu.links.length > 0 && <ChevronDown className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />}
                  <div className="absolute bottom-4 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 to-rose-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
                </button>

                <AnimatePresence>
                  {activeDropdown === menu.name && menu.links.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-[80%] left-0 w-64 bg-[#1a1c29]/95 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-xl py-2 overflow-hidden z-50"
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

        <div className="flex items-center gap-3 md:gap-5">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="Search..."
              className="w-48 lg:w-64 h-9 bg-black/20 border border-white/10 rounded-full pl-9 pr-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all"
            />
          </div>

          <button className="relative p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors">
            <Bell className="w-5 h-5 md:w-5 md:h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          </button>

          <button className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 shadow-md hover:shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-105 border border-white/20 text-white">
            <User className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </motion.header>

      {/* Spacer to prevent content from jumping when header becomes fixed */}
      <div className="h-16 md:h-20 w-full shrink-0"></div>
    </>
  );
}
