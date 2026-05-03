import { useSettingsStore } from '../store/settingsStore';
import { AIModelSettings } from '../types/settings';
import { FortuneType, AppError } from '../types/fortune';
import { createChatCompletion, testDeepSeekConnection } from './deepseekClient';

export interface AnalyzeFortuneRequest {
  type: FortuneType;
  date: string;
  result: unknown;
  userProfile?: {
    name?: string;
    zodiacSign?: string;
    birthDate?: string;
  };
}

export interface AnalyzeFortuneResponse {
  analysis: string;
}

function requireAISettings(settings: AIModelSettings): void {
  if (!settings.enabled) {
    throw new AppError('AI_DISABLED', 'AI 解读功能未启用，请在设置页开启');
  }
  if (!settings.apiKey.trim()) {
    throw new AppError('NO_API_KEY', '请先在设置页填写 API Key');
  }
  if (!settings.baseURL.trim()) {
    throw new AppError('NO_BASE_URL', '请检查 API Base URL');
  }
  if (!settings.model.trim()) {
    throw new AppError('NO_MODEL', '模型不存在或不可用，请检查模型名称');
  }
}

function getTypeName(type: FortuneType): string {
  const names: Record<FortuneType, string> = {
    tarot: '塔罗',
    iching: '卦象',
    zodiac: '星座',
    almanac: '黄历',
    summary: '综合运势',
  };
  return names[type];
}

function buildPrompt(request: AnalyzeFortuneRequest): string {
  const profile = request.userProfile;
  return [
    `请基于下面的${getTypeName(request.type)}结果，生成一段中文每日运势解读。`,
    `日期：${request.date}`,
    profile?.name ? `用户昵称：${profile.name}` : undefined,
    profile?.zodiacSign ? `用户星座：${profile.zodiacSign}` : undefined,
    profile?.birthDate ? `出生日期：${profile.birthDate}` : undefined,
    '要求：用温和、理性、可执行的语气，避免绝对预测；包含象征意义、今日提醒和行动建议。',
    `结果数据：${JSON.stringify(request.result, null, 2)}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export async function analyzeFortune(
  request: AnalyzeFortuneRequest,
): Promise<AnalyzeFortuneResponse> {
  const settings = useSettingsStore.getState().aiSettings;
  requireAISettings(settings);

  const analysis = await createChatCompletion(settings, buildPrompt(request));
  return { analysis };
}

export async function testAIConnection(settings: AIModelSettings): Promise<boolean> {
  requireAISettings({ ...settings, enabled: true });
  return testDeepSeekConnection(settings);
}
