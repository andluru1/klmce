'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/VibeCard';
import { Search, UserMinus, Phone, UserPlus, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvailableFaculty, substituteFaculty } from '../../../actions';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:15', end: '12:15' },
  { start: '12:15', end: '13:15' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
];

export default function AdjustmentsClient({ schedules, departments }: any) {
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0].start);
  
  const [activeSubstituteSlot, setActiveSubstituteSlot] = useState<any>(null);
  const [availableFaculty, setAvailableFaculty] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Filter schedules to only show classes happening at the selected day/time
  const activeClasses = schedules.filter((s: any) => s.dayOfWeek === selectedDay && s.startTime === selectedTime);

  const handleOpenSubstitute = async (schedule: any) => {
    setActiveSubstituteSlot(schedule);
    setIsSearching(true);
    try {
      const faculty = await getAvailableFaculty(selectedDay, selectedTime, schedule.subject.departmentId);
      setAvailableFaculty(faculty);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAssignSubstitute = async (facultyId: string) => {
    setIsAssigning(true);
    try {
      await substituteFaculty(activeSubstituteSlot.id, facultyId);
      // Let Next.js revalidate refresh the data, just close modal for now
      setActiveSubstituteSlot(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 bg-slate-900/50 border-slate-800">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-indigo-400" /> Filter Time Slot
        </h2>
        <div className="flex gap-4">
          <select 
            value={selectedDay}
            onChange={e => setSelectedDay(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 appearance-none font-medium"
          >
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          
          <select 
            value={selectedTime}
            onChange={e => setSelectedTime(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 appearance-none font-medium"
          >
            {TIME_SLOTS.map(t => <option key={t.start} value={t.start}>{t.start} - {t.end}</option>)}
          </select>
        </div>
      </GlassCard>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-300">Active Classes ({activeClasses.length})</h3>
        
        {activeClasses.length === 0 ? (
          <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No classes scheduled for this time slot.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeClasses.map((cls: any) => (
              <GlassCard key={cls.id} className="p-5 bg-slate-900/50 border-slate-800 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-bold">{cls.subject.name}</h4>
                    <p className="text-xs text-slate-400">{cls.classSection.name} • Room {cls.room.number}</p>
                  </div>
                  <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 font-medium">
                    {cls.startTime}
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold">
                    {cls.faculty.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{cls.faculty.name}</p>
                    <p className="text-xs text-slate-500">{cls.faculty.phone || 'No contact info'}</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleOpenSubstitute(cls)}
                  className="w-full mt-2 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-rose-500/20"
                >
                  <UserMinus className="w-4 h-4" /> Find Substitute
                </button>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeSubstituteSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl"
            >
              <GlassCard className="p-6 bg-slate-900 border-slate-700 shadow-2xl flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Available Substitutes</h2>
                    <p className="text-sm text-slate-400 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" /> {selectedDay}, {selectedTime} 
                      <span className="mx-2">•</span> 
                      {activeSubstituteSlot.subject.name} ({activeSubstituteSlot.classSection.name})
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveSubstituteSlot(null)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </div>

                {isSearching ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                    Scanning department for free faculty...
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {availableFaculty.length === 0 ? (
                      <div className="p-8 text-center text-rose-400 border border-dashed border-rose-500/30 bg-rose-500/5 rounded-xl">
                        No faculty available in this department at {selectedTime}.
                      </div>
                    ) : (
                      availableFaculty.map(faculty => (
                        <div key={faculty.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-lg">
                              {faculty.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-white font-bold">{faculty.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs rounded font-medium flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {faculty.phone || 'No phone'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleAssignSubstitute(faculty.id)}
                            disabled={isAssigning}
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                          >
                            <UserPlus className="w-4 h-4" /> 
                            {isAssigning ? 'Assigning...' : 'Assign'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
