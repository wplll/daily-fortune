import { useSettingsStore } from '../store/settingsStore';
import { AlmanacApiSettings } from '../types/settings';
import { AlmanacResult } from '../types/fortune';
import { AppError } from '../utils/AppError';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';
import { generateFallbackAlmanac } from './almanac/almanacFallback';
import { adaptCustomAlmanacResponse } from './almanac/customAlmanacAdapter';
import { getCachedAlmanac, setCachedAlmanac } from './almanac/almanacCache';

const ALMANAC_TIMEOUT_MS = 15000;

function buildURL(endpoint: string, date: string): string {
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}date=${encodeURIComponent(date)}`;
}

async function fetchFromCustomAPI(
  date: string,
  settings: AlmanacApiSettings,
): Promise<AlmanacResult> {
  if (!settings.endpoint.trim()) {
    throw new AppError('NO_ALMANAC_ENDPOINT', '请先填写黄历 API Endpoint');
  }

  const headers: Record<string, string> = {};
  if (settings.apiKey?.trim()) {
    headers.Authorization = `Bearer ${settings.apiKey.trim()}`;
  }

  const response = await fetchWithTimeout(
    buildURL(settings.endpoint.trim(), date),
    { method: 'GET', headers },
    ALMANAC_TIMEOUT_MS,
  );

  if (!response.ok) {
    throw new AppError(
      'ALMANAC_API_ERROR',
      response.status === 401 || response.status === 403
        ? '黄历 API Key 无效或无权限'
        : '黄历 API 请求失败，请检查 Endpoint',
      `HTTP ${response.status}`,
    );
  }

  const json = await response.json();
  return adaptCustomAlmanacResponse(date, json);
}

function shouldUseAPI(settings: AlmanacApiSettings): boolean {
  return settings.enabled && settings.provider === 'custom' && Boolean(settings.endpoint.trim());
}

export async function getAlmanacByDate(date: string): Promise<AlmanacResult>;
export async function getAlmanacByDate(
  date: string,
  settingsOverride: AlmanacApiSettings,
): Promise<AlmanacResult>;
export async function getAlmanacByDate(
  date: string,
  settingsOverride?: AlmanacApiSettings,
): Promise<AlmanacResult> {
  const cached = await getCachedAlmanac(date);
  if (cached) return cached.data;

  const settings = settingsOverride ?? useSettingsStore.getState().almanacSettings;

  if (shouldUseAPI(settings)) {
    try {
      const data = await fetchFromCustomAPI(date, settings);
      await setCachedAlmanac({ date, data, cachedAt: new Date().toISOString() });
      return data;
    } catch {
      // The almanac API is optional. Fallback keeps the app usable offline or with bad settings.
    }
  }

  const fallback = generateFallbackAlmanac(date);
  await setCachedAlmanac({ date, data: fallback, cachedAt: new Date().toISOString() });
  return fallback;
}

export async function refreshAlmanac(date: string): Promise<AlmanacResult>;
export async function refreshAlmanac(
  date: string,
  settingsOverride: AlmanacApiSettings,
): Promise<AlmanacResult>;
export async function refreshAlmanac(
  date: string,
  settingsOverride?: AlmanacApiSettings,
): Promise<AlmanacResult> {
  const settings = settingsOverride ?? useSettingsStore.getState().almanacSettings;

  if (shouldUseAPI(settings)) {
    try {
      const data = await fetchFromCustomAPI(date, settings);
      await setCachedAlmanac({ date, data, cachedAt: new Date().toISOString() });
      return data;
    } catch {
      // Fall back below.
    }
  }

  const fallback = generateFallbackAlmanac(date);
  await setCachedAlmanac({ date, data: fallback, cachedAt: new Date().toISOString() });
  return fallback;
}

export async function testAlmanacConnection(settings: AlmanacApiSettings): Promise<boolean> {
  if (!settings.endpoint.trim()) {
    throw new AppError('NO_ALMANAC_ENDPOINT', '请先填写黄历 API Endpoint');
  }
  const today = new Date().toISOString().slice(0, 10);
  await fetchFromCustomAPI(today, { ...settings, enabled: true, provider: 'custom' });
  return true;
}
