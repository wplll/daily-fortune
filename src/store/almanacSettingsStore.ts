import { useSettingsStore } from './settingsStore';
import { AlmanacApiSettings } from '../types/settings';

interface AlmanacSettingsState {
  almanacSettings: AlmanacApiSettings;
  setAlmanacSettings: (settings: Partial<AlmanacApiSettings>) => void;
  resetSettings: () => void;
  settings: AlmanacApiSettings;
  setSettings: (settings: Partial<AlmanacApiSettings>) => void;
}

export const useAlmanacSettingsStore = useSettingsStore as unknown as {
  <T>(selector: (state: AlmanacSettingsState) => T): T;
  getState: () => AlmanacSettingsState;
};
