'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOnlineExam } from '@/app/actions/exams';
import { GlassCard } from '@/components/ui/VibeCard';
import { Plus, Trash2, Save, FileText, CheckCircle } from 'lucide-react';

export default function ExamCreatorClient({ subjects }: { subjects: { id: string, name: string, code: string }[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [examData, setExamData] = useState({
    title: '',
    subjectId: subjects.length > 0 ? subjects[0].id : '',
    type: 'PRACTICE',
    durationMin: 60,
    isProctored: false,
    questions: [
      { text: '', marks: 1, options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }
    ]
  });

  const addQuestion = () => {
    setExamData(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', marks: 1, options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }]
    }));
  };

  const removeQuestion = (qIndex: number) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qIndex)
    }));
  };

  const addOption = (qIndex: number) => {
    const newQuestions = [...examData.questions];
    newQuestions[qIndex].options.push({ text: '', isCorrect: false });
    setExamData({ ...examData, questions: newQuestions });
  };

  const handleSave = async () => {
    setLoading(true);
    const res = await createOnlineExam(examData);
    if (res.success) {
      router.push('/faculty/exams');
    } else {
      alert(res.error || 'Failed to create exam');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          Exam Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Exam Title</label>
            <input 
              type="text" 
              value={examData.title}
              onChange={e => setExamData({...examData, title: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500" 
              placeholder="e.g., Mid-Term 1: Arrays & Pointers"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Subject</label>
            <select 
              value={examData.subjectId}
              onChange={e => setExamData({...examData, subjectId: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500"
            >
              {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Exam Type</label>
            <select 
              value={examData.type}
              onChange={e => setExamData({...examData, type: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500"
            >
              <option value="PRACTICE">Practice Test (Self-Assessment)</option>
              <option value="CA">Continuous Assessment (CA)</option>
              <option value="MID_TERM">Mid-Term Examination</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Duration (Minutes)</label>
            <input 
              type="number" 
              value={examData.durationMin}
              onChange={e => setExamData({...examData, durationMin: parseInt(e.target.value) || 0})}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500" 
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
            <input 
              type="checkbox" 
              id="proctored"
              checked={examData.isProctored}
              onChange={e => setExamData({...examData, isProctored: e.target.checked})}
              className="w-5 h-5 accent-indigo-500"
            />
            <label htmlFor="proctored" className="text-white font-medium cursor-pointer">
              Enable strict proctoring (Tab tracking & Fullscreen enforcement)
            </label>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center justify-between">
          <span>Question Bank</span>
          <button 
            onClick={addQuestion}
            className="text-sm px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </h2>

        {examData.questions.map((q, qIndex) => (
          <GlassCard key={qIndex} className="p-6 border-l-4 border-l-indigo-500">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-400 font-bold">Question {qIndex + 1}</span>
              <button onClick={() => removeQuestion(qIndex)} className="text-rose-400 hover:text-rose-300">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-3">
                <label className="block text-sm text-slate-400 mb-1">Question Text (or expected text answers separated by |||)</label>
                <textarea 
                  value={q.text}
                  onChange={e => {
                    const n = [...examData.questions];
                    n[qIndex].text = e.target.value;
                    setExamData({...examData, questions: n});
                  }}
                  className="w-full h-20 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500"
                  placeholder="What is the time complexity of QuickSort? Or for Text Matching: Define OS ||| kernel,memory,process"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Marks</label>
                <input 
                  type="number" 
                  value={q.marks}
                  onChange={e => {
                    const n = [...examData.questions];
                    n[qIndex].marks = parseInt(e.target.value) || 0;
                    setExamData({...examData, questions: n});
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-3 pl-4 border-l border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Options (Leave empty if Text-Matching)</span>
                <button 
                  onClick={() => addOption(qIndex)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Option
                </button>
              </div>
              
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      const n = [...examData.questions];
                      n[qIndex].options.forEach((o, i) => o.isCorrect = (i === oIndex));
                      setExamData({...examData, questions: n});
                    }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${opt.isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-slate-600 text-transparent'}`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <input 
                    type="text" 
                    value={opt.text}
                    onChange={e => {
                      const n = [...examData.questions];
                      n[qIndex].options[oIndex].text = e.target.value;
                      setExamData({...examData, questions: n});
                    }}
                    placeholder={`Option ${oIndex + 1}`}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-1.5 text-white outline-none focus:border-indigo-500 text-sm"
                  />
                  <button 
                    onClick={() => {
                      const n = [...examData.questions];
                      n[qIndex].options = n[qIndex].options.filter((_, i) => i !== oIndex);
                      setExamData({...examData, questions: n});
                    }}
                    className="text-rose-400/50 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="flex justify-end mt-8">
        <button 
          onClick={handleSave}
          disabled={loading || !examData.title || examData.questions.length === 0}
          className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center gap-2"
        >
          {loading ? 'Saving...' : <><Save className="w-5 h-5" /> Publish Exam</>}
        </button>
      </div>
    </div>
  );
}
