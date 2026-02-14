import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function generateUUID(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);

  // Set version to 4
  array[6] = (array[6] & 0x0f) | 0x40;
  array[8] = (array[8] & 0x3f) | 0x80;

  const hex = Array.from(array)
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const twclid = request.nextUrl.searchParams.get('twclid');
  let response: NextResponse;

  // Generate anonymousId cookie if it doesn't exist
  if (!request.cookies.get('autohodl_anonymous_id')) {
    response = NextResponse.next();
    response.cookies.set('autohodl_anonymous_id', generateUUID(), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
  } else {
    response = NextResponse.next();
  }

  // Handle twclid parameter
  if (twclid && !request.cookies.get('x_attr_id')) {
    // Remove twclid from URL
    const cleanUrl = new URL(url.pathname, request.url);
    response = NextResponse.redirect(cleanUrl);
    response.cookies.set('x_attr_id', twclid, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: '/:path*',
};
