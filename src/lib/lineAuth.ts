import { queryPostgres } from './postgres';
import { UserProfile } from '@/types';

function readEnv(name: string): string {
  const value = process.env[name] || '';
  return value.trim().replace(/^["']|["']$/g, '');
}

export function isLineLoginConfigured(): boolean {
  const channelId = readEnv('LINE_LOGIN_CHANNEL_ID') || readEnv('LINE_CHANNEL_ID');
  const channelSecret = readEnv('LINE_LOGIN_CHANNEL_SECRET') || readEnv('LINE_CHANNEL_SECRET');
  return Boolean(channelId && channelId.trim() !== '' && channelSecret && channelSecret.trim() !== '');
}

export function getLineOAuthUrl(state?: string): string {
  const channelId = readEnv('LINE_LOGIN_CHANNEL_ID') || readEnv('LINE_CHANNEL_ID');
  const appUrl = readEnv('NEXT_PUBLIC_APP_URL') || 'http://localhost:3001';
  const redirectUri = `${appUrl}/api/auth/line/callback`;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: channelId,
    redirect_uri: redirectUri,
    state: state || 'line_state_' + Date.now(),
    scope: 'profile openid email',
  });

  return `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
}

export async function exchangeLineCode(code: string): Promise<{ access_token: string; id_token?: string }> {
  const channelId = readEnv('LINE_LOGIN_CHANNEL_ID') || readEnv('LINE_CHANNEL_ID');
  const channelSecret = readEnv('LINE_LOGIN_CHANNEL_SECRET') || readEnv('LINE_CHANNEL_SECRET');
  const appUrl = readEnv('NEXT_PUBLIC_APP_URL') || 'http://localhost:3001';
  const redirectUri = `${appUrl}/api/auth/line/callback`;

  const response = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: channelId,
      client_secret: channelSecret,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LINE token exchange failed: ${errorText}`);
  }

  return await response.json();
}

export async function getLineUserProfile(accessToken: string): Promise<{
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}> {
  const response = await fetch('https://api.line.me/v2/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch LINE user profile: ${errorText}`);
  }

  return await response.json();
}

export async function upsertLineUser(profile: {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}): Promise<UserProfile> {
  const res = await queryPostgres<any>(`
    INSERT INTO users (line_user_id, display_name, avatar_url, line_connected)
    VALUES ($1, $2, $3, TRUE)
    ON CONFLICT (line_user_id) DO UPDATE SET
      display_name = COALESCE(EXCLUDED.display_name, users.display_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
      line_connected = TRUE,
      updated_at = NOW()
    RETURNING *;
  `, [profile.userId, profile.displayName, profile.pictureUrl || null]);

  const user = res[0];

  return {
    id: user.id,
    name: user.display_name,
    email: user.email || undefined,
    lineUserId: user.line_user_id,
    pictureUrl: user.avatar_url || profile.pictureUrl || undefined,
    role: 'member',
    streakDays: user.current_streak || 1,
    joinedAt: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  };
}
