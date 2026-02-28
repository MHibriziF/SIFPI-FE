import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Checks if a token is present in the request cookies.
 * If no token is found, redirects the user to the root URL.
 * If a token is found, allows the request to proceed.
 *
 * @param {NextRequest} request - The request to be checked.
 * @returns {NextResponse} - The response to be sent back to the client.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get('SIFPI_TOKEN');

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
