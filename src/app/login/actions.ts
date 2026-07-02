'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { createSession, deleteSession } from '@/lib/session';
export async function loginWithCredentials(formData: FormData) {
  const rollNumber = formData.get('rollNumber') as string;
  const password = formData.get('password') as string;

  if (!rollNumber || !password) {
    return { error: 'Roll number and password are required.' };
  }

  const user = await prisma.user.findUnique({
    where: { rollNumber }
  });

  if (!user) {
    return { error: 'Invalid credentials.' };
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return { error: 'Invalid credentials.' };
  }

  // 2FA Zero-Trust Implementation
  if (user.role === 'ADMIN' || user.role === 'FACULTY') {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await prisma.user.update({
      where: { id: user.id },
      data: { otpSecret: otp }
    });

    console.log(`[MOCK SMS] KLMCE OTP for ${user.rollNumber} is: ${otp}`);
    
    // Return flag requiring 2FA so client can redirect
    return { require2FA: true, rollNumber: user.rollNumber };
  }

  // STUDENT role: direct JWT session
  await createSession(user.id, user.role);

  // Return success so the client can redirect
  return { success: true, role: user.role };
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
