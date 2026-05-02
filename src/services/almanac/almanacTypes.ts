import { AlmanacResult } from '../../types/fortune';

export const ALMANAC_CACHE_KEY_PREFIX = 'daily_fortune_almanac_';
export const ALMANAC_CACHE_TTL_DAYS = 7;

export interface AlmanacCacheEntry {
  date: string;
  data: AlmanacResult;
  cachedAt: string;
}

export function isCacheValid(entry: AlmanacCacheEntry): boolean {
  const cachedDate = new Date(entry.cachedAt);
  const now = new Date();
  const diffMs = now.getTime() - cachedDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays < ALMANAC_CACHE_TTL_DAYS;
}
