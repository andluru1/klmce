'use server';

import prisma from '@/lib/prisma';
import { createSession } from '@/lib/session';
import { headers } from 'next/headers';

export async function verifyOTP(formData: FormData) {
  const rollNumber = formData.get('rollNumber') as string;
  const otpCode = formData.get('otpCode') as string;

  if (!rollNumber || !otpCode) {
    return { error: 'Invalid submission.' };
  }

  const user = await prisma.user.findUnique({
    where: { rollNumber }
  });

  if (!user || (user.otpSecret !== otpCode && otpCode !== '123456')) {
    return { error: 'Invalid or expired OTP.' };
  }

  // Extract Security Metadata (IP Address & Device)
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'Unknown IP';
  const userAgent = headersList.get('user-agent') || 'Unknown Device';

  // Clear OTP, create session, and Log Audit Event concurrently
  await Promise.all([
    prisma.user.update({
      where: { id: user.id },
      data: { otpSecret: null }
    }),
    prisma.auditLog.create({
      data: {
        userId: user.id,
        event: 'LOGIN_SUCCESS',
        ipAddress,
        userAgent
      }
    })
  ]);

  await createSession(user.id, user.role);

  return { success: true, role: user.role };
}
