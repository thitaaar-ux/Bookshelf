import { NextRequest, NextResponse } from 'next/server';
import { exchangeLineCode, getLineUserProfile, upsertLineUser } from '@/lib/lineAuth';

export const runtime = 'nodejs';

/**
 * GET /api/auth/line/callback
 * Handles OAuth callback from LINE Login
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

  if (error) {
    return NextResponse.redirect(`${appUrl}/?line_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/?line_error=no_code_provided`);
  }

  try {
    // 1. Exchange code for tokens
    const tokens = await exchangeLineCode(code);

    // 2. Fetch LINE User Profile
    const profile = await getLineUserProfile(tokens.access_token);

    // 3. Persist in PostgreSQL users table
    const userProfile = await upsertLineUser(profile);

    // 4. Redirect user back with user profile in query string for client hydration
    const userParam = encodeURIComponent(JSON.stringify(userProfile));
    return NextResponse.redirect(`${appUrl}/?line_login=success&user=${userParam}`);
  } catch (err: any) {
    console.error('Error during LINE OAuth callback:', err);
    return NextResponse.redirect(
      `${appUrl}/?line_error=${encodeURIComponent(err.message || 'Authentication failed')}`
    );
  }
}
