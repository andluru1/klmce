'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteAnnouncement } from '../../actions';

export default function DeleteAnnouncementButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    setIsDeleting(true);
    try {
      await deleteAnnouncement(id);
    } catch (err) {
      console.error(err);
      alert('Failed to delete announcement');
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
      title="Delete Announcement"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
