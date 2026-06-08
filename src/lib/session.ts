import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.SESSION_SECRET || 'super-secure-secret-key-12345';
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(userId: string, role: string) {
  const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

  const session = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(encodedKey);

  const cookieStore = await cookies();
  cookieStore.set('ksrm_session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function verifySession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('ksrm_session')?.value;

  if (!sessionCookie) return null;

  try {
    const { payload } = await jwtVerify(sessionCookie, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as { userId: string; role: string; exp: number };
  } catch (error) {
    console.error('Failed to verify session');
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('ksrm_session');
}
