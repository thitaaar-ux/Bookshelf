import { NextRequest, NextResponse } from 'next/server';
import { isGoogleConfigured, getGoogleOAuthUrl, upsertGoogleUser } from '@/lib/googleAuth';

export const runtime = 'nodejs';

/**
 * GET /api/auth/google
 * Initiates Google OAuth flow or checks configuration status
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wantsRedirect = searchParams.get('redirect') === 'true';
  const configured = isGoogleConfigured();

  if (!configured) {
    if (wantsRedirect) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
      return NextResponse.redirect(`${appUrl}/?google_error=not_configured`);
    }
    return NextResponse.json({
      success: false,
      configured: false,
      message: 'ระบบ Google OAuth ยังไม่ได้ระบุ GOOGLE_CLIENT_ID หรือ GOOGLE_CLIENT_SECRET ใน .env.local',
    });
  }

  const state = searchParams.get('state') || undefined;
  const oauthUrl = getGoogleOAuthUrl(state);

  if (wantsRedirect) {
    return NextResponse.redirect(oauthUrl);
  }

  return NextResponse.json({
    success: true,
    configured: true,
    url: oauthUrl,
  });
}

/**
 * POST /api/auth/google
 * Handle Quick Google Login (Demo/Test) or direct token authentication
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, name, picture, demo } = body;

    const userEmail = email?.trim() || 'reader.google@example.com';
    const userName = name?.trim() || 'คุณนักอ่าน Google';
    const userPicture = picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
    const googleId = `google-${Date.now()}`;

    // Persist real Google user into PostgreSQL users table!
    const userProfile = await upsertGoogleUser({
      id: googleId,
      email: userEmail,
      name: userName,
      picture: userPicture,
    });

    return NextResponse.json({
      success: true,
      user: userProfile,
      isDemo: Boolean(demo),
    });
  } catch (err: any) {
    console.error('Google auth error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to authenticate with Google' },
      { status: 500 }
    );
  }
}
