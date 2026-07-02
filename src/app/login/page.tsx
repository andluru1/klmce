'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { GlassCard } from '@/components/ui/VibeCard';
import { loginWithCredentials } from './actions';
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsLoading(true);
    
    const res = await loginWithCredentials(formData);
    
    if (res.error) {
      setError(res.error);
      setIsLoading(false);
    } else if (res.require2FA) {
      window.location.href = `/login/verify-otp?rollNumber=${res.rollNumber}`;
    } else if (res.success && res.role) {
      if (res.role === 'ADMIN') window.location.href = '/admin';
      else if (res.role === 'FACULTY') window.location.href = '/faculty';
      else if (res.role === 'STUDENT') window.location.href = '/student';
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <GlassCard className="w-full max-w-md p-8 bg-slate-900/80 border-slate-800 z-10 relative shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto bg-white rounded-full p-2 flex items-center justify-center mb-4 shadow-xl border-4 border-indigo-500/20">
            <div className="relative w-full h-full">
              <Image 
                src="/klmce-logo.png" 
                alt="KLMCE Logo" 
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your KLMCE account.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-300">{error}</p>
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Roll Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                name="rollNumber"
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                placeholder="e.g. 209Y1A0501"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot Password?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="password"
                name="password"
                required
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            For demo purposes, default passwords are <code className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">password123</code>.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
