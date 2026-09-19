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

// Global server state singleton for Next.js runtime
declare global {
  var __tsundokuLogs: WebhookLogItem[] | undefined;
  var __tsundokuLineConfig: LineRuntimeConfig | undefined;
}

if (!globalThis.__tsundokuLogs) {
  globalThis.__tsundokuLogs = [
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString('th-TH'),
      source: 'real_line_webhook',
      eventType: 'system_boot',
      userId: 'U256aa66d5563c7dd1f7ee2967b9f92d9',
      payload: { status: 'Next.js App Router API active' },
      botReply: 'ระบบ TSUNDOKU Next.js พร้อมทำงาน',
    }
  ];
}

if (!globalThis.__tsundokuLineConfig) {
  globalThis.__tsundokuLineConfig = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
    targetUserId: 'U256aa66d5563c7dd1f7ee2967b9f92d9',
    enabled: true,
    reminderDaysAhead: 1,
    latestCapturedUser: {
      userId: 'U256aa66d5563c7dd1f7ee2967b9f92d9',
      type: 'message',
      timestamp: new Date().toLocaleTimeString('th-TH'),
    }
  };
}

export const webhookLogs = globalThis.__tsundokuLogs;
export const lineConfig = globalThis.__tsundokuLineConfig;

export function addWebhookLog(log: WebhookLogItem) {
  webhookLogs.push(log);
  if (webhookLogs.length > 50) webhookLogs.shift();
}
