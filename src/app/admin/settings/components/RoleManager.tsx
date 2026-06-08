'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/VibeCard';
import { updateUserRole } from '../../actions';
import { Search, ShieldAlert, Shield, XCircle } from 'lucide-react';

export default function RoleManager({ currentAdmins }: { currentAdmins: { id: string, name: string, rollNumber: string }[] }) {
  const [rollNumber, setRollNumber] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber) return;
    setIsUpdating(true);
    try {
      await updateUserRole(rollNumber, 'ADMIN');
      setRollNumber('');
      alert('User promoted to ADMIN successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to promote user. Check if roll number exists.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevoke = async (adminRollNumber: string) => {
    if (!confirm(`Are you sure you want to revoke ADMIN access for ${adminRollNumber}?`)) return;
    try {
      await updateUserRole(adminRollNumber, 'STUDENT');
    } catch (err) {
      console.error(err);
      alert('Failed to revoke admin access.');
    }
  };

  return (
    <GlassCard className="p-6 bg-slate-900/50 border-slate-800 space-y-6">
      
      {/* Promote User Form */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-3">Promote User to Admin</h3>
        <form onSubmit={handlePromote} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={rollNumber}
              onChange={e => setRollNumber(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:border-rose-500 transition-colors"
              placeholder="Enter Roll Number"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={isUpdating}
            className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            Promote
          </button>
        </form>
      </div>

      <div className="h-px bg-slate-800 w-full my-6"></div>

      {/* Current Admins List */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-3">Current Superadmins</h3>
        <div className="space-y-3">
          {currentAdmins.map(admin => (
            <div key={admin.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-md">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{admin.name}</p>
                  <p className="text-xs text-slate-400">{admin.rollNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => handleRevoke(admin.rollNumber)}
                className="text-slate-500 hover:text-rose-400 transition-colors"
                title="Revoke Admin Access"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          ))}
          {currentAdmins.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">No active admins found.</p>
          )}
        </div>
      </div>

    </GlassCard>
  );
}
