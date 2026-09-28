import { NextRequest, NextResponse } from 'next/server';
import { isLineLoginConfigured, getLineOAuthUrl, upsertLineUser } from '@/lib/lineAuth';

export const runtime = 'nodejs';

/**
 * GET /api/auth/line
 * Initiates LINE Login OAuth flow or checks configuration status
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wantsRedirect = searchParams.get('redirect') === 'true';
  const configured = isLineLoginConfigured();

  if (!configured) {
    if (wantsRedirect) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
      return NextResponse.redirect(`${appUrl}/?line_error=not_configured`);
    }
    return NextResponse.json({
      success: false,
      configured: false,
      message: 'ระบบ LINE Login ยังไม่ได้ระบุ LINE_LOGIN_CHANNEL_ID หรือ LINE_LOGIN_CHANNEL_SECRET ใน .env.local',
    });
  }

  const oauthUrl = getLineOAuthUrl();

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
 * POST /api/auth/line
 * Fast test/demo login for LINE user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const lineId = body.lineId || `U${Math.random().toString(36).substring(2, 12)}`;
    const displayName = body.name || 'คุณนักอ่าน LINE (Bunnarak)';
    const pictureUrl = body.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

    const userProfile = await upsertLineUser({
      userId: lineId,
      displayName,
      pictureUrl,
    });

    return NextResponse.json({
      success: true,
      user: userProfile,
    });
  } catch (err: any) {
    console.error('LINE auth error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to authenticate with LINE' },
      { status: 500 }
    );
  }
}
