import { AlmanacResult } from '../types/fortune';
import { generateFallbackAlmanac } from './almanac/almanacFallback';
import { adaptCustomAlmanacResponse } from './almanac/customAlmanacAdapter';
import { adaptApihzResponse } from './almanac/apihzAdapter';
import { getCachedAlmanac, setCachedAlmanac } from './almanac/almanacCache';
import { AlmanacApiSettings } from '../types/fortune';

const TIMEOUT_MS = 10_000;
const APIHZ_BASE = 'https://cn.apihz.cn/api/time/getday.php';

/**
 * Fetch almanac data for a given date.
 * Order: cache → API (apihz or custom) → fallback
 */
export async function getAlmanacByDate(
  date: string,
  settings: AlmanacApiSettings,
): Promise<AlmanacResult> {
  // 1. Check cache
  const cached = await getCachedAlmanac(date);
  if (cached) return cached.data;

  // 2. Try API if enabled
  if (settings.enabled) {
    try {
      let data: AlmanacResult;
      if (settings.provider === 'apihz') {
        data = await fetchFromApihz(date, settings);
      } else if (settings.provider === 'custom' && settings.endpoint) {
        data = await fetchFromCustomAPI(date, settings);
      } else {
        throw new Error('Invalid provider');
      }
      await setCachedAlmanac({ date, data, cachedAt: new Date().toISOString() });
      return data;
    } catch {
      // Fall through to fallback
    }
  }

  // 3. Use fallback
  const fallback = generateFallbackAlmanac(date);
  await setCachedAlmanac({ date, data: fallback, cachedAt: new Date().toISOString() });
  return fallback;
}

/**
 * Force refresh — skip cache, try API first, then fallback.
 */
export async function refreshAlmanac(
  date: string,
  settings: AlmanacApiSettings,
): Promise<AlmanacResult> {
  if (settings.enabled) {
    try {
      let data: AlmanacResult;
      if (settings.provider === 'apihz') {
        data = await fetchFromApihz(date, settings);
      } else if (settings.provider === 'custom' && settings.endpoint) {
        data = await fetchFromCustomAPI(date, settings);
      } else {
        throw new Error('Invalid provider');
      }
      await setCachedAlmanac({ date, data, cachedAt: new Date().toISOString() });
      return data;
    } catch {
      // Fall through
    }
  }

  const fallback = generateFallbackAlmanac(date);
  await setCachedAlmanac({ date, data: fallback, cachedAt: new Date().toISOString() });
  return fallback;
}

// ── apihz.cn fetcher ──

async function fetchFromApihz(
  date: string,
  settings: AlmanacApiSettings,
): Promise<AlmanacResult> {
  if (!settings.userId || !settings.userKey) {
    throw new Error('apihz.cn 需要配置用户ID和通讯秘钥');
  }

  const url = `${APIHZ_BASE}?id=${encodeURIComponent(settings.userId)}&key=${encodeURIComponent(settings.userKey)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const json = await response.json();

    if (json.code !== 200) {
      throw new Error(json.msg || `API 返回错误码: ${json.code}`);
    }

    return adaptApihzResponse(date, json);
  } finally {
    clearTimeout(timer);
  }
}

// ── Custom provider fetcher ──

async function fetchFromCustomAPI(
  date: string,
  settings: AlmanacApiSettings,
): Promise<AlmanacResult> {
  const url = `${settings.endpoint}?date=${encodeURIComponent(date)}`;

  const headers: Record<string, string> = {};
  if (settings.apiKey) {
    headers['Authorization'] = `Bearer ${settings.apiKey}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const json = await response.json();
    return adaptCustomAlmanacResponse(date, json);
  } finally {
    clearTimeout(timer);
  }
}
