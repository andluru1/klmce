'use client';

import React, { useState, useRef } from 'react';
import { GlassCard } from '@/components/ui/VibeCard';
import { postAnnouncement } from '../actions';
import { Megaphone, UploadCloud, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnnouncementForm({ authorId }: { authorId: string }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Academic');
  const [importance, setImportance] = useState('Medium');
  const [file, setFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let attachmentUrl = null;
    
    // In a real production app, we would upload this file to S3 or a cloud bucket.
    // For local dev, we will convert small files to Base64 to store in the DB temporarily 
    // or simulate an upload. We'll use Base64 for the attachmentUrl.
    if (file) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      attachmentUrl = `data:${file.type};base64,${base64}`;
    }

    try {
      await postAnnouncement({ title, content, authorId, category, importance, attachmentUrl });
      setSuccess(true);
      setTitle('');
      setContent('');
      setFile(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to post announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
      <GlassCard className="p-6 bg-slate-900/50 border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Megaphone className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Post Announcement</h2>
            <p className="text-sm text-slate-400">Broadcast news to students</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
              <select 
                value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="Academic">Academic</option>
                <option value="Administrative">Administrative</option>
                <option value="Co-curricular">Co-curricular</option>
                <option value="Placement">Placement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Importance</label>
              <select 
                value={importance} onChange={e => setImportance(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="Low">Low (Green)</option>
                <option value="Medium">Medium (Blue)</option>
                <option value="High">High (Red)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-indigo-500 transition-colors" 
              required 
              placeholder="e.g., Midterm Exam Schedule"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Content</label>
            <textarea 
              value={content} 
              onChange={e => setContent(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-indigo-500 transition-colors h-32 resize-none" 
              required 
              placeholder="Write the full announcement here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Attachment (Optional)</label>
            <div 
              className="w-full border-2 border-dashed border-slate-700 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors bg-slate-800/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={e => setFile(e.target.files?.[0] || null)}
                accept=".pdf,image/*"
              />
              {file ? (
                <div className="flex items-center gap-2 text-indigo-400">
                  <Paperclip className="w-4 h-4" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400">
                  <UploadCloud className="w-5 h-5" />
                  <span className="text-sm">Click to upload PDF or Image</span>
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-bold transition-all ${
              success ? 'bg-green-500 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
          >
            {success ? 'Broadcasted!' : isSubmitting ? 'Posting...' : 'Post Announcement'}
          </button>
        </form>
      </GlassCard>
    </motion.div>
  );
}
