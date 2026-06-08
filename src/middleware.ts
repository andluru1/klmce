import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/session';

export async function middleware(request: NextRequest) {
  // Pass through public routes
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname === '/'
  ) {
    return NextResponse.next();
  }

  const session = await verifySession();

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // RBAC: Admin Portal
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/student', request.url)); // Send them to lowest privilege dashboard
    }
  }

  // RBAC: Faculty Portal
  if (request.nextUrl.pathname.startsWith('/faculty')) {
    if (session.role !== 'ADMIN' && session.role !== 'FACULTY') {
      return NextResponse.redirect(new URL('/student', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
