// Telegram WebApp helper — abstraction over window.Telegram.WebApp with dev fallback.

interface TgUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

interface TgWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TgUser;
    auth_date?: number;
    hash?: string;
    start_param?: string;
  };
  version: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  ready: () => void;
  expand: () => void;
  close: () => void;
  showAlert: (msg: string, cb?: () => void) => void;
  showConfirm: (msg: string, cb?: (ok: boolean) => void) => void;
  requestContact?: (cb: (shared: boolean, response?: { responseUnsafe?: any; status?: 'sent' | 'cancelled'; response?: string }) => void) => void;
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  BackButton?: {
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  MainButton?: {
    show: () => void;
    hide: () => void;
    setText: (text: string) => void;
    onClick: (cb: () => void) => void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TgWebApp };
  }
}

export function getTelegramWebApp(): TgWebApp | null {
  return typeof window !== 'undefined' && window.Telegram?.WebApp ? window.Telegram.WebApp : null;
}

export function getInitData(): string {
  return getTelegramWebApp()?.initData || '';
}

export function getInitUser(): TgUser | null {
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe?.user || null;
}

export function isInTelegram(): boolean {
  const tg = getTelegramWebApp();
  return !!(tg && tg.initData && tg.initDataUnsafe?.user);
}

/**
 * Requests the user's contact (phone number) via Telegram's native popup.
 * Returns the raw contact response payload string (signed by Telegram), or null if cancelled.
 *
 * Newer Telegram clients (Bot API 6.9+) support this. On older clients we resolve to null.
 */
export function requestContactPayload(): Promise<string | null> {
  return new Promise((resolve) => {
    const tg = getTelegramWebApp();
    if (!tg || typeof tg.requestContact !== 'function') {
      resolve(null);
      return;
    }
    try {
      tg.requestContact((shared, response) => {
        if (!shared) {
          resolve(null);
          return;
        }
        // response shape varies by client version.
        const payload =
          (response && typeof (response as any).response === 'string' && (response as any).response) ||
          (response && (response as any).responseUnsafe && JSON.stringify((response as any).responseUnsafe)) ||
          '';
        resolve(payload || '');
      });
    } catch {
      resolve(null);
    }
  });
}

export function tgHaptic(type: 'success' | 'error' | 'warning' | 'light' = 'light') {
  const tg = getTelegramWebApp();
  if (!tg?.HapticFeedback) return;
  if (type === 'light') tg.HapticFeedback.impactOccurred('light');
  else tg.HapticFeedback.notificationOccurred(type);
}

export function tgReady() {
  const tg = getTelegramWebApp();
  if (tg) {
    try {
      tg.ready();
      tg.expand();
    } catch {}
  }
}
