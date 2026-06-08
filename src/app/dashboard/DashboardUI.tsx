"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Bus, CreditCard, GraduationCap } from "lucide-react";

export function DashboardUI({ student }: { student: any }) {
  const isCondonationRequired = student.attendancePct < 75;

  return (
    <main className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-white p-6 md:p-12 font-sans selection:bg-purple-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:justify-between md:items-end gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Welcome, {student.name}
            </h1>
            <p className="text-white/60 mt-2 text-lg">
              Roll No: <span className="font-mono text-purple-400">{student.rollNumber}</span> • {student.branch} ({student.currentSem})
            </p>
          </div>
          <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] border-2 border-white/20"></div>
        </motion.header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Attendance Guard Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`col-span-1 p-6 rounded-3xl backdrop-blur-xl border ${isCondonationRequired ? 'bg-red-950/30 border-red-500/30' : 'bg-white/5 border-white/10'} shadow-2xl relative overflow-hidden`}
          >
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className={isCondonationRequired ? "text-red-400" : "text-purple-400"} />
              <h2 className="text-xl font-semibold">Attendance</h2>
            </div>
            
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative flex items-center justify-center">
                {/* Simple Radial Gauge using SVG */}
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" className="stroke-white/10" strokeWidth="12" fill="none" />
                  <motion.circle 
                    cx="64" cy="64" r="56" 
                    className={isCondonationRequired ? "stroke-red-500" : "stroke-emerald-500"} 
                    strokeWidth="12" fill="none" strokeDasharray="351.86" 
                    initial={{ strokeDashoffset: 351.86 }}
                    animate={{ strokeDashoffset: 351.86 - (351.86 * student.attendancePct) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{student.attendancePct}%</span>
                </div>
              </div>
            </div>

            {isCondonationRequired && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">
                  <strong className="text-red-400 block">Condonation Required</strong>
                  Your attendance is below 75%. Please clear dues to write exams.
                </p>
              </div>
            )}
          </motion.div>

          {/* Fee Ledger Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="col-span-1 md:col-span-2 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CreditCard className="text-pink-400" />
                <h2 className="text-xl font-semibold">Fee Ledger</h2>
              </div>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium border border-white/10">
                {student.fees.filter((f: any) => !f.isPaid).length} Pending
              </span>
            </div>

            <div className="space-y-4">
              {student.fees.length === 0 ? (
                <p className="text-white/40 text-center py-8">No fees on record.</p>
              ) : (
                student.fees.map((fee: any) => (
                  <div key={fee.id} className="group relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-lg">{fee.feeType}</span>
                        {fee.isPaid ? (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded border border-emerald-500/20">Paid</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 text-xs rounded border border-orange-500/20">Pending</span>
                        )}
                      </div>
                      <p className="text-sm text-white/50 mt-1">Due by {new Date(fee.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center gap-4">
                      <span className="text-2xl font-bold tracking-tight text-white">₹{fee.amount.toLocaleString()}</span>
                      {!fee.isPaid && (
                        <button className="px-4 py-2 bg-white text-black rounded-xl font-medium hover:scale-105 active:scale-95 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                          Pay
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Bus Pass Card */}
          {student.busRoute && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="col-span-1 md:col-span-3 p-6 rounded-3xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-xl border border-blue-400/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 opacity-10">
                <Bus size={200} />
              </div>
              <div className="flex items-center gap-4 z-10">
                <div className="h-16 w-16 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-400/30 text-blue-400">
                  <Bus size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Transport / Bus Pass</h2>
                  <p className="text-blue-200/70 mt-1">{student.busRoute}</p>
                </div>
              </div>
              <div className="z-10 bg-black/40 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md text-center">
                <span className="block text-xs text-white/50 uppercase tracking-wider font-semibold mb-1">Status</span>
                {student.busPassValid ? (
                  <span className="text-emerald-400 font-bold tracking-widest text-lg">ACTIVE</span>
                ) : (
                  <span className="text-red-400 font-bold tracking-widest text-lg">EXPIRED</span>
                )}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </main>
  );
}
