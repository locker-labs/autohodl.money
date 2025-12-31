import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const twclid = request.nextUrl.searchParams.get('twclid');
  const response = NextResponse.next();

  if (twclid) {
    console.log('Middleware - twclid:', twclid);
    response.cookies.set('x_attr_id', twclid, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    console.log('Set x_attr_id cookie in middleware');
  }

  return response;
}

export const config = {
  matcher: '/:path*',
};
