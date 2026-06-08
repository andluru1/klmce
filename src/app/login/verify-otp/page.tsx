'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { GlassCard } from '@/components/ui/VibeCard';
import { verifyOTP } from './actions';
import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyOTPForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const rollNumber = searchParams.get('rollNumber');

  useEffect(() => {
    if (!rollNumber) {
      router.push('/login');
    }
  }, [rollNumber, router]);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsLoading(true);
    formData.append('rollNumber', rollNumber || '');
    
    const res = await verifyOTP(formData);
    
    if (res.error) {
      setError(res.error);
      setIsLoading(false);
    } else if (res.success && res.role) {
      if (res.role === 'ADMIN') window.location.href = '/admin';
      else if (res.role === 'FACULTY') window.location.href = '/faculty';
      else window.location.href = '/student';
    }
  }

  if (!rollNumber) return null;

  return (
    <>
      <GlassCard className="w-full max-w-md p-8 bg-slate-900/80 border-slate-800 z-10 relative shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-emerald-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Two-Factor Auth</h1>
          <p className="text-slate-400">Enter the 6-digit code sent to your device.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-300">{error}</p>
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <input
              type="text"
              name="otpCode"
              required
              maxLength={6}
              className="w-full bg-slate-950 border border-slate-800 text-white text-center text-2xl tracking-[1em] font-mono rounded-xl py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-indigo-500 hover:from-emerald-600 hover:to-indigo-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify & Login'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            Check the terminal (console.log) for your mock OTP.
          </p>
        </div>
      </GlassCard>
    </>
  );
}

export default function VerifyOTPPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-emerald-500" />}>
        <VerifyOTPForm />
      </Suspense>
    </div>
  );
}
