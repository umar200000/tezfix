import { createHash, createHmac } from 'crypto';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

/**
 * Validates Telegram WebApp initData. Returns the parsed user if valid.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyInitData(initData: string): TelegramUser | null {
  if (!initData || !BOT_TOKEN) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const dataCheckString = Array.from(params.entries())
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const computed = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (computed !== hash) return null;

  const userJson = params.get('user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as TelegramUser;
  } catch {
    return null;
  }
}

/**
 * Validates Telegram WebApp.requestContact response payload.
 * Same algorithm as initData but on the contact response.
 */
export function verifyContactPayload(payload: string): { phone_number: string; first_name?: string; last_name?: string; user_id?: number } | null {
  if (!payload || !BOT_TOKEN) return null;
  const params = new URLSearchParams(payload);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const dataCheckString = Array.from(params.entries())
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const computed = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  if (computed !== hash) return null;

  const contactJson = params.get('contact');
  if (!contactJson) return null;
  try {
    return JSON.parse(contactJson);
  } catch {
    return null;
  }
}

/**
 * Sends a Telegram message to a chat (chat_id == user.telegramId for private chat).
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options: { parse_mode?: 'HTML' | 'Markdown'; reply_markup?: any } = {}
): Promise<boolean> {
  if (!BOT_TOKEN) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN not set; skipping sendMessage');
    return false;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options.parse_mode ?? 'HTML',
        reply_markup: options.reply_markup,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn('[telegram] sendMessage failed', res.status, body);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[telegram] sendMessage error', err);
    return false;
  }
}

/**
 * Computes a deterministic hash for a fake telegramId in dev mode (no real Telegram).
 */
export function devTelegramId(seed: string): string {
  return 'dev_' + createHash('sha256').update(seed).digest('hex').slice(0, 12);
}
