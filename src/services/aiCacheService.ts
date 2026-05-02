import AsyncStorage from '@react-native-async-storage/async-storage';
import { FortuneType } from '../types/fortune';

const AI_CACHE_PREFIX = '@ai_cache_';

function cacheKey(type: FortuneType, date: string): string {
  return `${AI_CACHE_PREFIX}${type}_${date}`;
}

export async function loadAICache(type: FortuneType, date: string): Promise<string | null> {
  try {
    const val = await AsyncStorage.getItem(cacheKey(type, date));
    return val;
  } catch {
    return null;
  }
}

export async function saveAICache(type: FortuneType, date: string, analysis: string): Promise<void> {
  try {
    await AsyncStorage.setItem(cacheKey(type, date), analysis);
  } catch {
    // Silently fail
  }
}

export async function clearAICache(type: FortuneType, date: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(cacheKey(type, date));
  } catch {
    // Silently fail
  }
}
