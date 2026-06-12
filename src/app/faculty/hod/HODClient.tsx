'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/VibeCard';
import { CheckCircle, XCircle, MessageSquare, Send } from 'lucide-react';
import { updateLeaveStatus, sendLeaveMessage } from '@/app/actions/leaves';

export default function HODClient({ leaves, currentUserId }: { leaves: any[], currentUserId: string }) {
  const [activeLeaveId, setActiveLeaveId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const activeLeave = leaves.find(l => l.id === activeLeaveId);

  const handleStatus = async (leaveId: string, action: 'HOD_APPROVE' | 'REJECT') => {
    setLoading(true);
    await updateLeaveStatus(leaveId, action);
    setLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeLeaveId) return;

    setLoading(true);
    await sendLeaveMessage(activeLeaveId, message);
    setMessage('');
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        {leaves.map((leave) => (
          <GlassCard 
            key={leave.id} 
            className={`p-4 cursor-pointer transition-colors border-l-4 ${activeLeaveId === leave.id ? 'bg-slate-800/80 border-l-indigo-500' : 'border-l-transparent hover:bg-slate-800/40'}`}
            onClick={() => setActiveLeaveId(leave.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-white text-sm">{leave.faculty.name}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                leave.status === 'PENDING_HOD' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                leave.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              }`}>
                {leave.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">{leave.reason}</p>
            <p className="text-[10px] text-slate-500 mt-2">
              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
            </p>
          </GlassCard>
        ))}
        {leaves.length === 0 && (
          <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No leave requests in your department.
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        {activeLeave ? (
          <GlassCard className="p-0 flex flex-col h-[600px] border-slate-800">
            <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{activeLeave.faculty.name}</h2>
                <p className="text-sm text-slate-400">Department of {activeLeave.faculty.department?.code}</p>
              </div>
              {activeLeave.status === 'PENDING_HOD' && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleStatus(activeLeave.id, 'HOD_APPROVE')}
                    disabled={loading}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-bold rounded border border-emerald-500/50 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve (Send to Admin)
                  </button>
                  <button 
                    onClick={() => handleStatus(activeLeave.id, 'REJECT')}
                    disabled={loading}
                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-sm font-bold rounded border border-rose-500/50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-900/30 border-b border-slate-800">
              <div className="text-sm text-slate-300 mb-4">
                <strong>Reason for Leave:</strong>
                <p className="mt-2 p-3 bg-slate-950 rounded-lg border border-slate-800">{activeLeave.reason}</p>
              </div>
              <div className="text-sm text-slate-400 flex items-center gap-4">
                <span><strong>From:</strong> {new Date(activeLeave.startDate).toLocaleDateString()}</span>
                <span><strong>To:</strong> {new Date(activeLeave.endDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeLeave.messages.map((msg: any) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="text-xs text-slate-500 mb-1 px-1">
                      {isMe ? 'You' : msg.sender.name} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className={`px-4 py-2 rounded-xl max-w-[80%] ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700'}`}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              {activeLeave.messages.length === 0 && (
                <div className="text-center text-slate-500 text-sm mt-10">No messages yet. Start the conversation.</div>
              )}
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input 
                  type="text" 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Message the applicant..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                />
                <button 
                  type="submit" 
                  disabled={loading || !message.trim()}
                  className="w-10 h-10 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg flex items-center justify-center transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </GlassCard>
        ) : (
          <div className="h-[600px] flex items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500">Select a leave request to review and chat.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
