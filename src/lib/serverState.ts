import { getLineConfigFromDb, saveLineConfigToDb } from '@/src/lib/db';

export interface WebhookLogItem {
  id: string;
  timestamp: string;
  source: 'real_line_webhook' | 'simulator';
  eventType: string;
  userId: string;
  payload: any;
  botReply: string;
  quickReplyAction?: string;
}

export interface LineRuntimeConfig {
  botName?: string;
  botBasicId?: string;
  channelId?: string;
  channelAccessToken?: string;
  channelSecret?: string;
  targetUserId: string;
  enabled: boolean;
  reminderDaysAhead: number;
  latestCapturedUser?: {
    userId: string;
    type: string;
    timestamp: string;
  };
}

export interface StripeRuntimeConfig {
  secretKey?: string;
  publishableKey?: string;
  webhookSecret?: string;
  priceAmountThb: number; // 39
  trialDays: number; // 3
}

export interface SubscriptionItem {
  id: string;
  userId: string;
  userEmail?: string;
  planName: string;
  status: 'trialing' | 'active' | 'canceled' | 'past_due';
  trialEndsAt: string;
  currentPeriodEnd: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
}

// Global server state singleton for Next.js runtime
declare global {
  var __tsundokuLogs: WebhookLogItem[] | undefined;
  var __tsundokuLineConfig: LineRuntimeConfig | undefined;
  var __tsundokuStripeConfig: StripeRuntimeConfig | undefined;
  var __tsundokuSubscriptions: SubscriptionItem[] | undefined;
}

if (!globalThis.__tsundokuLogs) {
  globalThis.__tsundokuLogs = [];
}

if (!globalThis.__tsundokuLineConfig) {
  globalThis.__tsundokuLineConfig = {
    botName: process.env.LINE_BOT_NAME || 'Bunnarak',
    botBasicId: process.env.LINE_BOT_ID || '@869uobem',
    channelId: process.env.LINE_CHANNEL_ID || '2011678531',
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
    targetUserId: process.env.LINE_TARGET_USER_ID || 'U9330ea2a3097a7e8ea7b81a9eeb82088',
    enabled: true,
    reminderDaysAhead: 1,
  };
}

if (!globalThis.__tsundokuStripeConfig) {
  globalThis.__tsundokuStripeConfig = {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    priceAmountThb: 39,
    trialDays: 3,
  };
}

if (!globalThis.__tsundokuSubscriptions) {
  globalThis.__tsundokuSubscriptions = [];
}

export const webhookLogs = globalThis.__tsundokuLogs;
export const lineConfig = globalThis.__tsundokuLineConfig;
export const stripeConfig = globalThis.__tsundokuStripeConfig;
export const subscriptions = globalThis.__tsundokuSubscriptions;

export function addWebhookLog(log: WebhookLogItem) {
  webhookLogs.push(log);
  if (webhookLogs.length > 50) webhookLogs.shift();
}

export function saveSubscription(item: SubscriptionItem) {
  const idx = subscriptions.findIndex(s => s.userId === item.userId || s.id === item.id);
  if (idx >= 0) {
    subscriptions[idx] = { ...subscriptions[idx], ...item };
  } else {
    subscriptions.unshift(item);
  }

  // Persist to PostgreSQL subscriptions table
  import('@/src/lib/postgres').then(({ queryPostgres }) => {
    queryPostgres(`
      INSERT INTO subscriptions (
        id, user_id, user_email, plan_name, status, trial_ends_at, current_period_end, stripe_customer_id, stripe_subscription_id, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        trial_ends_at = EXCLUDED.trial_ends_at,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = NOW();
    `, [
      item.id,
      item.userId,
      item.userEmail || null,
      item.planName,
      item.status,
      item.trialEndsAt || null,
      item.currentPeriodEnd || null,
      item.stripeCustomerId || null,
      item.stripeSubscriptionId || null,
    ]).catch(() => {});
  });
}

export async function hydrateLineConfig(): Promise<LineRuntimeConfig> {
  const latest = await getLineConfigFromDb();
  if (lineConfig) {
    Object.assign(lineConfig, latest);
  }
  return lineConfig!;
}

export async function updateLineConfig(updates: Partial<LineRuntimeConfig>): Promise<LineRuntimeConfig> {
  const updated = await saveLineConfigToDb(updates);
  if (lineConfig) {
    Object.assign(lineConfig, updated);
  }
  return lineConfig!;
}
