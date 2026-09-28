import { queryPostgres } from './postgres';
import { UserProfile } from '@/types';

function readEnv(name: string): string {
  const value = process.env[name] || '';
  return value.trim().replace(/^["']|["']$/g, '');
}

export function isGoogleConfigured(): boolean {
  const clientId = readEnv('GOOGLE_CLIENT_ID') || readEnv('NEXT_PUBLIC_GOOGLE_CLIENT_ID');
  const clientSecret = readEnv('GOOGLE_CLIENT_SECRET');
  return Boolean(clientId && clientId.trim() !== '' && clientSecret && clientSecret.trim() !== '');
}

export function getGoogleOAuthUrl(state?: string): string {
  const clientId = readEnv('GOOGLE_CLIENT_ID') || readEnv('NEXT_PUBLIC_GOOGLE_CLIENT_ID');
  const appUrl = readEnv('NEXT_PUBLIC_APP_URL') || 'http://localhost:3001';
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  if (state) {
    params.set('state', state);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string): Promise<{ access_token: string; id_token?: string }> {
  const clientId = readEnv('GOOGLE_CLIENT_ID') || readEnv('NEXT_PUBLIC_GOOGLE_CLIENT_ID');
  const clientSecret = readEnv('GOOGLE_CLIENT_SECRET');
  const appUrl = readEnv('NEXT_PUBLIC_APP_URL') || 'http://localhost:3001';
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google token exchange failed: ${errorText}`);
  }

  return await response.json();
}

export async function getGoogleUserProfile(accessToken: string): Promise<{
  id: string;
  email: string;
  name: string;
  picture?: string;
}> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Google user info: ${errorText}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    email: data.email,
    name: data.name || data.email.split('@')[0],
    picture: data.picture,
  };
}

export async function upsertGoogleUser(profile: {
  id: string;
  email: string;
  name: string;
  picture?: string;
}): Promise<UserProfile> {
  const res = await queryPostgres<any>(`
    INSERT INTO users (email, display_name, avatar_url, google_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO UPDATE SET
      google_id = COALESCE(users.google_id, EXCLUDED.google_id),
      display_name = COALESCE(users.display_name, EXCLUDED.display_name),
      avatar_url = COALESCE(users.avatar_url, EXCLUDED.avatar_url),
      updated_at = NOW()
    RETURNING *;
  `, [profile.email, profile.name, profile.picture || null, profile.id]);

  const user = res[0];
  const isAdmin = profile.email.toLowerCase().includes('admin');

  return {
    id: user.id,
    name: user.display_name,
    email: user.email,
    googleId: user.google_id || profile.id,
    lineUserId: user.line_user_id || undefined,
    pictureUrl: user.avatar_url || profile.picture || undefined,
    role: isAdmin ? 'admin' : 'member',
    streakDays: user.current_streak || 1,
    joinedAt: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  };
}
