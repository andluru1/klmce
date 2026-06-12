'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logProctorViolation, submitExam, syncExamProgress } from '@/app/actions/exams';
import { GlassCard } from '@/components/ui/VibeCard';
import { ShieldAlert, Maximize, Clock, CheckCircle, Save } from 'lucide-react';

export default function ExamClient({ 
  attemptId, 
  exam, 
  isProctored,
  initialAnswers = {}
}: { 
  attemptId: string, 
  exam: any, 
  isProctored: boolean,
  initialAnswers?: Record<string, string>
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const answersRef = React.useRef(answers);
  const [timeLeft, setTimeLeft] = useState(exam.durationMin * 60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violationWarning, setViolationWarning] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    // Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleForceSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Auto-save loop every 30 seconds
    const autoSaveTimer = setInterval(async () => {
      const currentAnswers = answersRef.current;
      if (Object.keys(currentAnswers).length > 0) {
        await syncExamProgress(attemptId, currentAnswers);
        setLastSaved(new Date());
      }
    }, 30000);
    
    return () => clearInterval(autoSaveTimer);
  }, [attemptId]);

  useEffect(() => {
    if (!isProctored) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        setViolationWarning('Tab switch detected! This has been logged.');
        const res = await logProctorViolation(attemptId, 'TAB_SWITCH');
        if (res.action === 'TERMINATE') {
          alert('Exam Terminated due to multiple proctoring violations.');
          router.push('/student/exam-center');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isProctored, attemptId, router]);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } catch (err) {
      console.error('Fullscreen request failed', err);
    }
  };

  const handleForceSubmit = async () => {
    setSubmitting(true);
    await submitExam(attemptId, answers);
    router.push('/student/exam-center');
  };

  const handleSubmit = async () => {
    if (confirm('Are you sure you want to submit your exam?')) {
      handleForceSubmit();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isProctored && !isFullscreen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <GlassCard className="p-12 max-w-md border-rose-500/30 shadow-2xl shadow-rose-500/10">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white mb-2">Proctored Environment</h2>
          <p className="text-slate-400 mb-8">
            This exam is strictly proctored. You must enter Fullscreen mode to begin. Any attempt to exit fullscreen or switch tabs will result in a violation log and immediate termination.
          </p>
          <button 
            onClick={enterFullscreen}
            className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-3"
          >
            <Maximize className="w-5 h-5" />
            Enter Fullscreen to Start
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 pb-32">
      {violationWarning && (
        <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500 rounded-xl flex items-center gap-3 text-rose-200">
          <ShieldAlert className="w-6 h-6 text-rose-400" />
          <div className="flex-1">
            <h4 className="font-bold">Proctor Violation Logged</h4>
            <p className="text-sm">{violationWarning}</p>
          </div>
          <button onClick={() => setViolationWarning(null)} className="px-3 py-1 bg-rose-500/20 rounded hover:bg-rose-500/40 text-sm">Dismiss</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-8 sticky top-0 bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 z-10">
        <div>
          <h1 className="text-xl font-bold text-white">{exam.title}</h1>
          <p className="text-slate-400 text-sm">{exam.subject.name}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center justify-end gap-1"><Clock className="w-3 h-3" /> Time Remaining</p>
            <p className={`text-2xl font-mono font-black ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
              {formatTime(timeLeft)}
            </p>
            {lastSaved && (
              <p className="text-[10px] text-slate-500 flex items-center justify-end gap-1 mt-1">
                <Save className="w-3 h-3" /> Auto-saved {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
              </p>
            )}
          </div>
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {exam.questions.map((q: any, i: number) => (
          <GlassCard key={q.id} className="p-6 border-slate-800">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-medium text-white leading-relaxed">
                <span className="text-indigo-400 font-black mr-2">{i + 1}.</span> 
                {/* Strip the expected keywords logic for display */}
                {q.text.split('|||')[0]}
              </h3>
              <div className="px-2 py-1 bg-slate-900 rounded text-xs font-bold text-slate-400 border border-slate-800 shrink-0">
                {q.marks} Marks
              </div>
            </div>

            {q.options.length > 0 ? (
              <div className="space-y-3">
                {q.options.map((opt: any) => (
                  <label key={opt.id} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${answers[q.id] === opt.id ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-colors ${answers[q.id] === opt.id ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-600 text-transparent'}`}>
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <input 
                      type="radio" 
                      name={`question-${q.id}`} 
                      value={opt.id}
                      checked={answers[q.id] === opt.id}
                      onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                      className="hidden"
                    />
                    <span className="text-slate-300 select-none">{opt.text}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea 
                value={answers[q.id] || ''}
                onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 resize-none"
                placeholder="Type your answer here..."
              />
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
