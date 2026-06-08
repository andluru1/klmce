'use server';

import prisma from '@/lib/prisma';
import { createSession } from '@/lib/session';

export async function verifyOTP(formData: FormData) {
  const rollNumber = formData.get('rollNumber') as string;
  const otpCode = formData.get('otpCode') as string;

  if (!rollNumber || !otpCode) {
    return { error: 'Invalid submission.' };
  }

  const user = await prisma.user.findUnique({
    where: { rollNumber }
  });

  if (!user || user.otpSecret !== otpCode) {
    return { error: 'Invalid or expired OTP.' };
  }

  // Clear OTP and create session
  await prisma.user.update({
    where: { id: user.id },
    data: { otpSecret: null }
  });

  await createSession(user.id, user.role);

  return { success: true, role: user.role };
}
