import { AIModelSettings } from '../types/settings';
import { AppError } from '../types/fortune';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

const SYSTEM_PROMPT =
  '你是一个温和、理性、善于解释象征意义的每日运势分析师。你提供的是娱乐、心理反思和行动建议，不做绝对预测，不制造焦虑，不宣称能够真实预知未来。';

function buildChatCompletionsURL(baseURL: string): string {
  return `${baseURL.replace(/\/+$/, '')}/chat/completions`;
}

function mapAIHttpError(status: number, body: unknown): AppError {
  const detail = typeof body === 'string' ? body : JSON.stringify(body);

  if (status === 401 || status === 403) {
    return new AppError('AUTH_FAILED', 'API Key 无效或额度不足', detail);
  }
  if (status === 404) {
    return new AppError('MODEL_NOT_FOUND', '模型不存在或不可用，请检查模型名称', detail);
  }
  if (status === 429) {
    return new AppError('RATE_LIMITED', 'API Key 无效或额度不足', detail);
  }
  if (status >= 500) {
    return new AppError('AI_SERVICE_ERROR', 'AI 服务暂时不可用，请稍后重试', detail);
  }

  return new AppError('AI_REQUEST_FAILED', 'AI 请求失败，请检查设置后重试', detail);
}

function mapNetworkError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (typeof error === 'object' && error !== null && 'code' in error && 'userMessage' in error) {
    const appLike = error as { code?: unknown; userMessage?: unknown; detail?: unknown };
    if (typeof appLike.code === 'string' && typeof appLike.userMessage === 'string') {
      return new AppError(
        appLike.code,
        appLike.userMessage,
        typeof appLike.detail === 'string' ? appLike.detail : undefined,
      );
    }
  }

  const message = error instanceof Error ? error.message : String(error);
  if (
    message.includes('Network request failed') ||
    message.includes('Failed to fetch') ||
    message.includes('TypeError')
  ) {
    return new AppError('NETWORK_ERROR', '请检查网络连接', message);
  }

  return new AppError('AI_REQUEST_FAILED', 'AI 请求失败，请稍后重试', message);
}

async function parseJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return await response.text();
  }
}

export async function createChatCompletion(
  settings: AIModelSettings,
  prompt: string,
  timeoutMs = 30000,
): Promise<string> {
  try {
    const response = await fetchWithTimeout(
      buildChatCompletionsURL(settings.baseURL),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.8,
        }),
      },
      timeoutMs,
    );

    const data = await parseJsonSafely(response);

    if (!response.ok) {
      throw mapAIHttpError(response.status, data);
    }

    const analysis =
      typeof data === 'object' && data !== null
        ? (data as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content
        : undefined;

    if (!analysis?.trim()) {
      throw new AppError('EMPTY_RESPONSE', 'AI 返回了空结果，请稍后重试');
    }

    return analysis.trim();
  } catch (error: unknown) {
    throw mapNetworkError(error);
  }
}

export async function testDeepSeekConnection(settings: AIModelSettings): Promise<boolean> {
  await createChatCompletion(settings, '请只回复：连接成功', 15000);
  return true;
}
