import AsyncStorage from '@react-native-async-storage/async-storage';
import { FortuneRecord, AIModelSettings, BackendSettings, AlmanacApiSettings } from '../types/fortune';

const RECORDS_KEY = '@daily_fortune_records';
const PROFILE_KEY = '@daily_fortune_profile';
const AI_SETTINGS_KEY = '@daily_fortune_ai_settings';
const BACKEND_SETTINGS_KEY = '@daily_fortune_backend_settings';
const ALMANAC_SETTINGS_KEY = '@daily_fortune_almanac_settings';

export const storageService = {
  // ── Fortune Records ──

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

  // ── User Profile ──

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

  // ── AI Settings ──

  async loadAISettings(): Promise<AIModelSettings | null> {
    try {
      const json = await AsyncStorage.getItem(AI_SETTINGS_KEY);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  },

  async saveAISettings(settings: AIModelSettings): Promise<void> {
    await AsyncStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
  },

  // ── Backend Settings ──

  async loadBackendSettings(): Promise<BackendSettings | null> {
    try {
      const json = await AsyncStorage.getItem(BACKEND_SETTINGS_KEY);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  },

  async saveBackendSettings(settings: BackendSettings): Promise<void> {
    await AsyncStorage.setItem(BACKEND_SETTINGS_KEY, JSON.stringify(settings));
  },

  // ── Almanac API Settings ──

  async loadAlmanacSettings(): Promise<AlmanacApiSettings | null> {
    try {
      const json = await AsyncStorage.getItem(ALMANAC_SETTINGS_KEY);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  },

  async saveAlmanacSettings(settings: AlmanacApiSettings): Promise<void> {
    await AsyncStorage.setItem(ALMANAC_SETTINGS_KEY, JSON.stringify(settings));
  },

  // ── Clear all ──

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([
      RECORDS_KEY,
      PROFILE_KEY,
      AI_SETTINGS_KEY,
      BACKEND_SETTINGS_KEY,
      ALMANAC_SETTINGS_KEY,
    ]);
  },
};
