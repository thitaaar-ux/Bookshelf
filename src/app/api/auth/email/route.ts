import { NextRequest, NextResponse } from 'next/server';
import { queryPostgres } from '@/lib/postgres';
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken, TOKEN_EXPIRATION_DAYS } from '@/lib/auth';
import { UserProfile } from '@/types';

export const runtime = 'nodejs';

/**
 * GET /api/auth/email
 * Check current 14-day session status
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const cookieToken = request.cookies.get('session_token')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { valid, expired, payload } = verifySessionToken(token);

    if (expired) {
      const response = NextResponse.json(
        { authenticated: false, error: 'SESSION_EXPIRED', message: 'เซสชันหมดอายุ (เกิน 14 วัน)' },
        { status: 401 }
      );
      response.cookies.delete('session_token');
      return response;
    }

    if (!valid || !payload) {
      return NextResponse.json({ authenticated: false, error: 'INVALID_TOKEN' }, { status: 401 });
    }

    const rows = await queryPostgres<any>('SELECT * FROM users WHERE id = $1 LIMIT 1;', [payload.userId]);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ authenticated: false, error: 'USER_NOT_FOUND' }, { status: 404 });
    }

    const user = rows[0];
    const userProfile: UserProfile = {
      id: user.id,
      name: user.display_name,
      email: user.email,
      lineUserId: user.line_user_id || undefined,
      pictureUrl: user.avatar_url || undefined,
      role: user.email?.toLowerCase().includes('admin') ? 'admin' : 'member',
      streakDays: user.current_streak || 1,
      joinedAt: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };

    return NextResponse.json({
      authenticated: true,
      user: userProfile,
      expiresAt: payload.expiresAt,
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/auth/email
 * Handle Email Register & Login with 14-Day Session Token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password, name, isRegister } = body;

    const cleanEmail = email?.trim().toLowerCase();
    const cleanPassword = password?.trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน' },
        { status: 400 }
      );
    }

    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' },
        { status: 400 }
      );
    }

    // --- 1. Mode: Register ---
    if (isRegister) {
      const existing = await queryPostgres<any>('SELECT id FROM users WHERE email = $1 LIMIT 1;', [cleanEmail]);
      if (existing && existing.length > 0) {
        return NextResponse.json(
          { success: false, error: 'อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาเข้าสู่ระบบ' },
          { status: 400 }
        );
      }

      const displayName = name?.trim() || cleanEmail.split('@')[0];
      const passwordHash = hashPassword(cleanPassword);
      const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

      const res = await queryPostgres<any>(`
        INSERT INTO users (email, display_name, password_hash, avatar_url)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `, [cleanEmail, displayName, passwordHash, defaultAvatar]);

      const newUser = res[0];
      const isAdmin = cleanEmail.includes('admin');
      const { token, expiresAt } = createSessionToken({
        userId: newUser.id,
        email: newUser.email,
        role: isAdmin ? 'admin' : 'member',
        name: newUser.display_name,
      });

      const profile: UserProfile = {
        id: newUser.id,
        name: newUser.display_name,
        email: newUser.email,
        pictureUrl: newUser.avatar_url,
        role: isAdmin ? 'admin' : 'member',
        streakDays: 1,
        joinedAt: new Date().toISOString().split('T')[0],
      };

      const response = NextResponse.json({
        success: true,
        user: profile,
        token,
        expiresAt,
        expiresInDays: TOKEN_EXPIRATION_DAYS,
        message: 'สร้างบัญชีผู้ใช้ใหม่เรียบร้อยแล้ว',
      });

      // 14 days HTTP-Only Cookie
      response.cookies.set('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: TOKEN_EXPIRATION_DAYS * 24 * 60 * 60,
        path: '/',
      });

      return response;
    }

    // --- 2. Mode: Login ---
    const userRows = await queryPostgres<any>('SELECT * FROM users WHERE email = $1 LIMIT 1;', [cleanEmail]);
    if (!userRows || userRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบอีเมลหรือสมัครสมาชิก' },
        { status: 400 }
      );
    }

    const user = userRows[0];

    if (!user.password_hash) {
      return NextResponse.json(
        { success: false, error: 'บัญชีนี้ลงทะเบียนผ่าน Google หรือ LINE กรุณาใช้ปุ่มเข้าสู่ระบบด้วย Google หรือ LINE' },
        { status: 400 }
      );
    }

    const isMatch = verifyPassword(cleanPassword, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' },
        { status: 400 }
      );
    }

    const isAdmin = cleanEmail.includes('admin');
    const { token, expiresAt } = createSessionToken({
      userId: user.id,
      email: user.email,
      role: isAdmin ? 'admin' : 'member',
      name: user.display_name,
    });

    const profile: UserProfile = {
      id: user.id,
      name: user.display_name,
      email: user.email,
      lineUserId: user.line_user_id || undefined,
      pictureUrl: user.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      role: isAdmin ? 'admin' : 'member',
      streakDays: user.current_streak || 1,
      joinedAt: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };

    const response = NextResponse.json({
      success: true,
      user: profile,
      token,
      expiresAt,
      expiresInDays: TOKEN_EXPIRATION_DAYS,
      message: 'เข้าสู่ระบบเรียบร้อย',
    });

    // 14 days HTTP-Only Cookie
    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_EXPIRATION_DAYS * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Email authentication error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'เกิดข้อผิดพลาดในการตรวจสอบบัญชีผู้ใช้' },
      { status: 500 }
    );
  }
}
