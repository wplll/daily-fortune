import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import {
  AI_SETTINGS_STORAGE_KEY,
  AIModelSettings,
  ALMANAC_SETTINGS_STORAGE_KEY,
  AlmanacApiSettings,
  DEFAULT_AI_SETTINGS,
  DEFAULT_ALMANAC_SETTINGS,
} from '../types/settings';

interface SettingsState {
  aiSettings: AIModelSettings;
  almanacSettings: AlmanacApiSettings;
  settings: AlmanacApiSettings;
  setAISettings: (settings: Partial<AIModelSettings>) => void;
  setAlmanacSettings: (settings: Partial<AlmanacApiSettings>) => void;
  setSettings: (settings: Partial<AlmanacApiSettings>) => void;
  resetAISettings: () => void;
  resetAlmanacSettings: () => void;
  resetSettings: () => void;
  loadSettings: () => Promise<void>;
  saveAISettings: (settings?: AIModelSettings) => Promise<void>;
  saveAlmanacSettings: (settings?: AlmanacApiSettings) => Promise<void>;
}

function normalizeAISettings(value: Partial<AIModelSettings> | null): AIModelSettings {
  return {
    ...DEFAULT_AI_SETTINGS,
    ...(value ?? {}),
  };
}

function normalizeAlmanacSettings(value: Partial<AlmanacApiSettings> | null): AlmanacApiSettings {
  return {
    ...DEFAULT_ALMANAC_SETTINGS,
    ...(value ?? {}),
    provider: value?.provider === 'custom' ? 'custom' : 'fallback',
  };
}

async function loadJson<T>(key: string): Promise<T | null> {
  try {
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  aiSettings: { ...DEFAULT_AI_SETTINGS },
  almanacSettings: { ...DEFAULT_ALMANAC_SETTINGS },
  settings: { ...DEFAULT_ALMANAC_SETTINGS },
  setAISettings: (settings) =>
    set((state) => ({
      aiSettings: { ...state.aiSettings, ...settings },
    })),
  setAlmanacSettings: (settings) =>
    set((state) => ({
      almanacSettings: normalizeAlmanacSettings({ ...state.almanacSettings, ...settings }),
      settings: normalizeAlmanacSettings({ ...state.almanacSettings, ...settings }),
    })),
  setSettings: (settings) =>
    set((state) => ({
      almanacSettings: normalizeAlmanacSettings({ ...state.almanacSettings, ...settings }),
      settings: normalizeAlmanacSettings({ ...state.almanacSettings, ...settings }),
    })),
  resetAISettings: () => set({ aiSettings: { ...DEFAULT_AI_SETTINGS } }),
  resetAlmanacSettings: () =>
    set({
      almanacSettings: { ...DEFAULT_ALMANAC_SETTINGS },
      settings: { ...DEFAULT_ALMANAC_SETTINGS },
    }),
  resetSettings: () =>
    set({
      almanacSettings: { ...DEFAULT_ALMANAC_SETTINGS },
      settings: { ...DEFAULT_ALMANAC_SETTINGS },
    }),
  loadSettings: async () => {
    const [aiSettings, almanacSettings] = await Promise.all([
      loadJson<Partial<AIModelSettings>>(AI_SETTINGS_STORAGE_KEY),
      loadJson<Partial<AlmanacApiSettings>>(ALMANAC_SETTINGS_STORAGE_KEY),
    ]);
    set({
      aiSettings: normalizeAISettings(aiSettings),
      almanacSettings: normalizeAlmanacSettings(almanacSettings),
      settings: normalizeAlmanacSettings(almanacSettings),
    });
  },
  saveAISettings: async (settings) => {
    const next = settings ?? get().aiSettings;
    await AsyncStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(next));
  },
  saveAlmanacSettings: async (settings) => {
    const next = settings ?? get().almanacSettings;
    await AsyncStorage.setItem(ALMANAC_SETTINGS_STORAGE_KEY, JSON.stringify(next));
  },
}));
