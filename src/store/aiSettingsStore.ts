import { useSettingsStore } from './settingsStore';
import { AIModelSettings, DEFAULT_AI_SETTINGS } from '../types/settings';

interface AISettingsState {
  aiSettings: AIModelSettings;
  setAISettings: (settings: Partial<AIModelSettings>) => void;
  resetAISettings: () => void;
}

export const useAISettingsStore = useSettingsStore as unknown as {
  <T>(selector: (state: AISettingsState) => T): T;
  getState: () => AISettingsState;
};

void DEFAULT_AI_SETTINGS;
