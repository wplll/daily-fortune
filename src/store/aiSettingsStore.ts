import { create } from 'zustand';
import { AIModelSettings, DEFAULT_AI_SETTINGS, BackendSettings } from '../types/fortune';
import { DEFAULT_API_BASE_URL } from '../config/api';

interface AISettingsState {
  aiSettings: AIModelSettings;
  backendSettings: BackendSettings;
  setAISettings: (settings: Partial<AIModelSettings>) => void;
  setBackendSettings: (settings: Partial<BackendSettings>) => void;
  resetAISettings: () => void;
}

export const useAISettingsStore = create<AISettingsState>((set) => ({
  aiSettings: { ...DEFAULT_AI_SETTINGS },
  backendSettings: {
    apiBaseURL: DEFAULT_API_BASE_URL,
  },
  setAISettings: (settings) =>
    set((state) => ({
      aiSettings: { ...state.aiSettings, ...settings },
    })),
  setBackendSettings: (settings) =>
    set((state) => ({
      backendSettings: { ...state.backendSettings, ...settings },
    })),
  resetAISettings: () =>
    set({ aiSettings: { ...DEFAULT_AI_SETTINGS } }),
}));
