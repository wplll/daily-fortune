export type AIProvider = 'deepseek' | 'openai-compatible';

export interface AIModelSettings {
  enabled: boolean;
  provider: AIProvider;
  baseURL: string;
  model: string;
  apiKey: string;
}

export const DEFAULT_AI_SETTINGS: AIModelSettings = {
  enabled: true,
  provider: 'deepseek',
  baseURL: 'https://api.deepseek.com',
  model: 'deepseek-v4-flash',
  apiKey: '',
};

export const AI_SETTINGS_STORAGE_KEY = 'daily_fortune_ai_settings';

export interface AlmanacApiSettings {
  enabled: boolean;
  provider: 'custom' | 'fallback';
  endpoint: string;
  apiKey?: string;
}

export const DEFAULT_ALMANAC_SETTINGS: AlmanacApiSettings = {
  enabled: false,
  provider: 'fallback',
  endpoint: '',
  apiKey: '',
};

export const ALMANAC_SETTINGS_STORAGE_KEY = 'daily_fortune_almanac_settings';
