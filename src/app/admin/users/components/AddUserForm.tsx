'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/VibeCard';
import { UserPlus } from 'lucide-react';
import { registerUser } from '../../actions';

type Department = { id: string; name: string; code: string };
type ClassSection = { id: string; name: string };

export default function AddUserForm({ departments, sections }: { departments: Department[], sections: ClassSection[] }) {
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [classSectionId, setClassSectionId] = useState('');
  const [currentSem, setCurrentSem] = useState('');
  const [busRoute, setBusRoute] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await registerUser({ rollNumber, password, role, name, departmentId, currentSem, busRoute, classSectionId });
      alert('User added successfully!');
      setRollNumber('');
      setPassword('');
      setName('');
      setDepartmentId('');
      setClassSectionId('');
      setCurrentSem('');
      setBusRoute('');
    } catch (error: any) {
      alert(error.message || 'Failed to add user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <GlassCard className="p-6 bg-slate-900/50 border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-pink-500/20 rounded-lg">
            <UserPlus className="w-5 h-5 text-pink-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Register New User</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Roll No (e.g. 209Y1A0501)" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
            />
            <input 
              type="text" 
              placeholder="Full Name" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="password" 
              placeholder="Temporary Password" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 appearance-none"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="STUDENT">Student</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 appearance-none"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              required
            >
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {role === 'STUDENT' && (
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 appearance-none"
                value={classSectionId}
                onChange={(e) => setClassSectionId(e.target.value)}
              >
                <option value="">Select Section</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Semester (e.g. III-I)" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              value={currentSem}
              onChange={(e) => setCurrentSem(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Bus Route (Optional)" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              value={busRoute}
              onChange={(e) => setBusRoute(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all mt-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Registering...' : 'Register User'}
          </button>
        </form>
      </GlassCard>
    </motion.div>
  );
}
