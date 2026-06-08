import React from 'react';
import prisma from '@/lib/prisma';
import { Settings as SettingsIcon, ShieldAlert, Download, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PreferencesForm from './components/PreferencesForm';
import RoleManager from './components/RoleManager';
import ExportModule from './components/ExportModule';

export default async function SettingsPage() {
  const configs = await prisma.systemConfig.findMany();
  const configMap = new Map(configs.map(c => [c.key, c.value]));
  
  const currentAcademicYear = configMap.get('currentAcademicYear') || '2025-2026';
  const maintenanceMode = configMap.get('maintenanceMode') === 'true';

  // Fetch only users with ADMIN role to display in Role Manager
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, name: true, rollNumber: true }
  });

  // Fetch all data for the client-side export module
  // In a real production app, you would use an API route for heavy exports.
  const allUsers = await prisma.user.findMany();
  const allFees = await prisma.fee.findMany({ include: { user: true } });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 pt-8 px-8">
      <div>
        <Link href="/admin" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <SettingsIcon className="w-6 h-6 text-indigo-400" />
          </div>
          Settings & Admin Controls
        </h1>
        <p className="text-slate-400">Manage global system configurations, roles, and data backups.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Section 1: System Preferences */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
              System Preferences
            </h2>
            <PreferencesForm 
              initialAcademicYear={currentAcademicYear} 
              initialMaintenanceMode={maintenanceMode} 
            />
          </section>

          {/* Section 3: Data Exports */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" />
              Data Exports & Backups
            </h2>
            <ExportModule 
              users={allUsers} 
              fees={allFees} 
            />
          </section>
        </div>

        <div className="space-y-8">
          {/* Section 2: Role Management */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Admin Role Management
            </h2>
            <RoleManager currentAdmins={admins} />
          </section>
        </div>
      </div>
    </div>
  );
}
