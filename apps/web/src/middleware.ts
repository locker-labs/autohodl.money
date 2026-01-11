import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const twclid = request.nextUrl.searchParams.get('twclid');

  if (twclid && !request.cookies.get('x_attr_id')) {
    // Remove twclid from URL
    const cleanUrl = new URL(url.pathname, request.url);

    const response = NextResponse.redirect(cleanUrl);

    response.cookies.set('x_attr_id', twclid, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
