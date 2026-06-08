'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/VibeCard';
import { updateSystemConfig } from '../../actions';
import { Save } from 'lucide-react';

export default function PreferencesForm({ initialAcademicYear, initialMaintenanceMode }: { initialAcademicYear: string, initialMaintenanceMode: boolean }) {
  const [academicYear, setAcademicYear] = useState(initialAcademicYear);
  const [maintenanceMode, setMaintenanceMode] = useState(initialMaintenanceMode);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSystemConfig('currentAcademicYear', academicYear);
      await updateSystemConfig('maintenanceMode', maintenanceMode.toString());
      alert('Preferences saved successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <GlassCard className="p-6 bg-slate-900/50 border-slate-800 space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Current Academic Year</label>
        <input 
          type="text" 
          value={academicYear} 
          onChange={e => setAcademicYear(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-indigo-500 transition-colors" 
          placeholder="e.g., 2025-2026"
        />
        <p className="text-xs text-slate-500 mt-2">This year is automatically applied to newly generated fees and reports.</p>
      </div>

      <div className="flex items-center justify-between p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">
        <div>
          <h3 className="font-bold text-rose-400">Maintenance Mode</h3>
          <p className="text-xs text-rose-400/80 mt-1">If enabled, students will see a maintenance screen and cannot log in.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={maintenanceMode}
            onChange={e => setMaintenanceMode(e.target.checked)}
          />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
        </label>
      </div>

      <button 
        onClick={handleSave}
        disabled={isSaving}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors"
      >
        <Save className="w-4 h-4" />
        {isSaving ? 'Saving...' : 'Save Preferences'}
      </button>
    </GlassCard>
  );
}
