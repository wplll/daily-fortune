import { create } from 'zustand';
import { AlmanacApiSettings, DEFAULT_ALMANAC_SETTINGS } from '../types/fortune';

interface AlmanacSettingsState {
  settings: AlmanacApiSettings;
  setSettings: (settings: Partial<AlmanacApiSettings>) => void;
  resetSettings: () => void;
}

export const useAlmanacSettingsStore = create<AlmanacSettingsState>((set) => ({
  settings: { ...DEFAULT_ALMANAC_SETTINGS },
  setSettings: (pat) =>
    set((state) => ({
      settings: { ...state.settings, ...pat },
    })),
  resetSettings: () =>
    set({ settings: { ...DEFAULT_ALMANAC_SETTINGS } }),
}));
