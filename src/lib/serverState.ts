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
  globalThis.__tsundokuLogs = [
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString('th-TH'),
      source: 'real_line_webhook',
      eventType: 'system_boot',
      userId: 'U9330ea2a3097a7e8ea7b81a9eeb82088',
      payload: { status: 'Next.js App Router API active', db: 'PostgreSQL' },
      botReply: 'ระบบ TSUNDOKU Next.js พร้อมทำงาน (เชื่อมต่อกับ PostgreSQL สำเร็จ)',
    }
  ];
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
  const now = new Date();
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const oneMonthLater = new Date(now.getTime() + 33 * 24 * 60 * 60 * 1000);

  globalThis.__tsundokuSubscriptions = [
    {
      id: 'sub_demo_01',
      userId: 'U256aa66d5563c7dd1f7ee2967b9f92d9',
      userEmail: 'somchai.reader@line.me',
      planName: 'Tsundoku Pro (3 วันแรกฟรี จากนั้น 39 บ./เดือน)',
      status: 'trialing',
      trialEndsAt: threeDaysLater.toISOString(),
      currentPeriodEnd: oneMonthLater.toISOString(),
      stripeCustomerId: 'cus_demo_tsundoku_01',
      stripeSubscriptionId: 'sub_demo_stripe_trial_01',
      createdAt: now.toISOString(),
    },
    {
      id: 'sub_demo_02',
      userId: 'U998bb12c8842d11eef00a1245a9b1c2',
      userEmail: 'thanakorn.dev@gmail.com',
      planName: 'Tsundoku Pro (39 บ./เดือน)',
      status: 'active',
      trialEndsAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      currentPeriodEnd: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      stripeCustomerId: 'cus_demo_tsundoku_02',
      stripeSubscriptionId: 'sub_demo_stripe_active_02',
      createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ];
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
