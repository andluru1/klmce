'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/VibeCard';
import { createSchedule } from '../../../../actions';
import { Clock, Plus, AlertCircle, MapPin, User, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:15', end: '12:15' },
  { start: '12:15', end: '13:15' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
];

export default function TimetableGrid({ sectionId, initialSchedules, rooms, subjects, facultyList }: any) {
  const [schedules, setSchedules] = useState(initialSchedules);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string, start: string, end: string } | null>(null);
  
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formFacultyId, setFormFacultyId] = useState('');
  const [formRoomId, setFormRoomId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getScheduleForSlot = (day: string, start: string) => {
    return schedules.find((s: any) => s.dayOfWeek === day && s.startTime === start);
  };

  const handleSlotClick = (day: string, start: string, end: string) => {
    if (getScheduleForSlot(day, start)) return; // Already booked
    setSelectedSlot({ day, start, end });
    setFormSubjectId('');
    setFormFacultyId('');
    setFormRoomId('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const newSchedule = await createSchedule({
        dayOfWeek: selectedSlot.day,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        subjectId: formSubjectId,
        facultyId: formFacultyId,
        roomId: formRoomId,
        classSectionId: sectionId
      });

      // Optimistically update UI
      const subject = subjects.find((s: any) => s.id === formSubjectId);
      const faculty = facultyList.find((f: any) => f.id === formFacultyId);
      const room = rooms.find((r: any) => r.id === formRoomId);

      setSchedules([...schedules, { ...newSchedule, subject, faculty, room }]);
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to schedule class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <div className="overflow-x-auto pb-4">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-left font-medium text-slate-400 border-b border-slate-800/50 w-24">Day</th>
              {TIME_SLOTS.map((slot, i) => (
                <th key={i} className="p-3 text-center font-medium text-slate-400 border-b border-slate-800/50">
                  <div className="flex flex-col items-center">
                    <span>{slot.start}</span>
                    <span className="text-xs text-slate-500">{slot.end}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day} className="border-b border-slate-800/50 group hover:bg-slate-800/20">
                <td className="p-3 font-bold text-slate-300">{day}</td>
                {TIME_SLOTS.map((slot, i) => {
                  const schedule = getScheduleForSlot(day, slot.start);
                  return (
                    <td key={i} className="p-2 h-24 w-40">
                      {schedule ? (
                        <div className="w-full h-full p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg flex flex-col justify-between hover:border-indigo-500/50 transition-colors">
                          <h4 className="text-sm font-bold text-indigo-400 leading-tight">{schedule.subject?.name}</h4>
                          <div className="space-y-0.5 mt-2">
                            <p className="text-xs text-slate-400 flex items-center gap-1"><User className="w-3 h-3" /> {schedule.faculty?.name.replace('Prof. ', '')}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {schedule.room?.number}</p>
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={() => handleSlotClick(day, slot.start, slot.end)}
                          className="w-full h-full border-2 border-dashed border-slate-800 rounded-lg flex items-center justify-center text-slate-600 hover:text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/5 cursor-pointer transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <GlassCard className="p-6 bg-slate-900 border-slate-700 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-1">Assign Class</h2>
                <p className="text-sm text-slate-400 mb-6 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {selectedSlot.day}, {selectedSlot.start} - {selectedSlot.end}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3"/> Subject</label>
                    <select 
                      required
                      value={formSubjectId}
                      onChange={e => setFormSubjectId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 appearance-none"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><User className="w-3 h-3"/> Faculty Member</label>
                    <select 
                      required
                      value={formFacultyId}
                      onChange={e => setFormFacultyId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 appearance-none"
                    >
                      <option value="">Select Faculty</option>
                      {facultyList.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Room</label>
                    <select 
                      required
                      value={formRoomId}
                      onChange={e => setFormRoomId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 appearance-none"
                    >
                      <option value="">Select Room</option>
                      {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.number} ({r.type}, Cap: {r.capacity})</option>)}
                    </select>
                  </div>

                  {errorMsg && (
                    <div className="text-xs text-rose-400 flex items-start gap-1.5 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-slate-800">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : 'Confirm Slot'}
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
