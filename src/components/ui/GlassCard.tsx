import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
