import { NextRequest, NextResponse } from 'next/server';
import { exchangeGoogleCode, getGoogleUserProfile, upsertGoogleUser } from '@/lib/googleAuth';

export const runtime = 'nodejs';

/**
 * GET /api/auth/google/callback
 * Handles OAuth callback from Google Accounts
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

  if (error) {
    return NextResponse.redirect(`${appUrl}/?google_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/?google_error=no_code_provided`);
  }

  try {
    // 1. Exchange code for tokens
    const tokens = await exchangeGoogleCode(code);

    // 2. Fetch Google User Profile
    const profile = await getGoogleUserProfile(tokens.access_token);

    // 3. Persist in PostgreSQL users table
    const userProfile = await upsertGoogleUser(profile);

    // 4. Redirect user back with user profile in query string for client hydration
    const userParam = encodeURIComponent(JSON.stringify(userProfile));
    return NextResponse.redirect(`${appUrl}/?google_login=success&user=${userParam}`);
  } catch (err: any) {
    console.error('Error during Google OAuth callback:', err);
    return NextResponse.redirect(
      `${appUrl}/?google_error=${encodeURIComponent(err.message || 'Authentication failed')}`
    );
  }
}
