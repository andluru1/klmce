'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/VibeCard';
import { Send, MessageSquare } from 'lucide-react';
import { sendLeaveMessage } from '@/app/actions/leaves';

export default function LeaveHistoryClient({ leaves, currentUserId }: { leaves: any[], currentUserId: string }) {
  const [activeLeaveId, setActiveLeaveId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const activeLeave = leaves.find(l => l.id === activeLeaveId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeLeaveId) return;

    setLoading(true);
    await sendLeaveMessage(activeLeaveId, message);
    setMessage('');
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {leaves.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-700 rounded-xl text-slate-500">
          No previous leave requests found.
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map((l) => (
            <div key={l.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors" onClick={() => setActiveLeaveId(activeLeaveId === l.id ? null : l.id)}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-white">
                  {new Date(l.startDate).toLocaleDateString()} &rarr; {new Date(l.endDate).toLocaleDateString()}
                </span>
                <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                  l.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                  l.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400' :
                  l.status === 'HOD_APPROVED' ? 'bg-indigo-500/20 text-indigo-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {l.status}
                </span>
              </div>
              <p className="text-sm text-slate-400 truncate">{l.reason}</p>

              {/* Chat Interface Dropdown */}
              {activeLeaveId === l.id && (
                <div className="mt-4 pt-4 border-t border-slate-800" onClick={e => e.stopPropagation()}>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Leave Discussion</h4>
                  
                  <div className="max-h-48 overflow-y-auto space-y-3 mb-4 pr-2">
                    {l.messages?.map((msg: any) => {
                      const isMe = msg.senderId === currentUserId;
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className="text-[10px] text-slate-500 mb-1 px-1">
                            {isMe ? 'You' : msg.sender.name}
                          </div>
                          <div className={`px-3 py-1.5 text-xs rounded-lg max-w-[90%] ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm'}`}>
                            {msg.message}
                          </div>
                        </div>
                      );
                    })}
                    {(!l.messages || l.messages.length === 0) && (
                      <div className="text-center text-xs text-slate-500 py-2">No messages. Ask your HOD for an update!</div>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input 
                      type="text"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                    />
                    <button type="submit" disabled={loading || !message.trim()} className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center shrink-0">
                      <Send className="w-3 h-3" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
