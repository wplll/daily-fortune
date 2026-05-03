import AsyncStorage from '@react-native-async-storage/async-storage';
import { FortuneRecord } from '../types/fortune';
import {
  AI_SETTINGS_STORAGE_KEY,
  AIModelSettings,
  ALMANAC_SETTINGS_STORAGE_KEY,
  AlmanacApiSettings,
} from '../types/settings';

const RECORDS_KEY = '@daily_fortune_records';
const PROFILE_KEY = '@daily_fortune_profile';

export const storageService = {
  async loadRecords(): Promise<FortuneRecord[]> {
    try {
      const json = await AsyncStorage.getItem(RECORDS_KEY);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  },

  async saveRecords(records: FortuneRecord[]): Promise<void> {
    await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  },

  async loadProfile(): Promise<Record<string, unknown> | null> {
    try {
      const json = await AsyncStorage.getItem(PROFILE_KEY);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  },

  async saveProfile(profile: Record<string, unknown>): Promise<void> {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },

  async loadAISettings(): Promise<AIModelSettings | null> {
    try {
      const json = await AsyncStorage.getItem(AI_SETTINGS_STORAGE_KEY);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  },

  async saveAISettings(settings: AIModelSettings): Promise<void> {
    await AsyncStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  },

  async loadAlmanacSettings(): Promise<AlmanacApiSettings | null> {
    try {
      const json = await AsyncStorage.getItem(ALMANAC_SETTINGS_STORAGE_KEY);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  },

  async saveAlmanacSettings(settings: AlmanacApiSettings): Promise<void> {
    await AsyncStorage.setItem(ALMANAC_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([
      RECORDS_KEY,
      PROFILE_KEY,
      AI_SETTINGS_STORAGE_KEY,
      ALMANAC_SETTINGS_STORAGE_KEY,
    ]);
  },
};
