import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlmanacCacheEntry, ALMANAC_CACHE_KEY_PREFIX, isCacheValid } from './almanacTypes';

export async function getCachedAlmanac(date: string): Promise<AlmanacCacheEntry | null> {
  try {
    const json = await AsyncStorage.getItem(ALMANAC_CACHE_KEY_PREFIX + date);
    if (!json) return null;
    const entry: AlmanacCacheEntry = JSON.parse(json);
    if (!isCacheValid(entry)) return null;
    return entry;
  } catch {
    return null;
  }
}

export async function setCachedAlmanac(entry: AlmanacCacheEntry): Promise<void> {
  try {
    await AsyncStorage.setItem(ALMANAC_CACHE_KEY_PREFIX + entry.date, JSON.stringify(entry));
  } catch {
    // Silently fail cache writes
  }
}

export async function clearAlmanacCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(ALMANAC_CACHE_KEY_PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch {
    // Silently fail
  }
}
