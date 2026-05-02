import { AIAnalyzeRequest, AIAnalyzeResponse, AITestRequest, AppError } from '../types/fortune';

const TIMEOUT_MS = 30_000;

function getApiBase(): string {
  try {
    const { useAISettingsStore } = require('../store/aiSettingsStore');
    return useAISettingsStore.getState().backendSettings.apiBaseURL;
  } catch {
    return 'http://localhost:3001';
  }
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AppError('TIMEOUT', '请求超时，网络较慢，请稍后重试');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function mapNetworkError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  const message = err instanceof Error ? err.message : String(err);

  if (message.includes('Network request failed') || message.includes('Failed to fetch') || message.includes('TypeError')) {
    return new AppError(
      'NETWORK_ERROR',
      '无法连接到后端服务，请检查后端服务是否已启动',
      message,
    );
  }

  if (message.includes('abort') || message.includes('AbortError') || message.includes('timeout')) {
    return new AppError('TIMEOUT', '请求超时，网络较慢，请稍后重试');
  }

  return new AppError('UNKNOWN', `请求失败: ${message}`, message);
}

export async function analyzeFortune(
  request: AIAnalyzeRequest
): Promise<AIAnalyzeResponse> {
  if (!request.aiSettings.enabled) {
    throw new AppError('AI_DISABLED', 'AI 解读功能未启用，请在设置中开启');
  }

  if (!request.aiSettings.apiKey) {
    throw new AppError('NO_API_KEY', '请先在设置页配置 API Key');
  }

  const apiBase = getApiBase();

  try {
    const response = await fetchWithTimeout(
      `${apiBase}/api/analyze-fortune`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      },
      TIMEOUT_MS,
    );

    const json = await response.json();

    if (!response.ok) {
      const errMsg = json?.error?.message || json?.error || `服务器错误 (${response.status})`;
      throw new AppError(
        'API_ERROR',
        typeof errMsg === 'string' ? errMsg : 'AI 服务返回了错误',
        JSON.stringify(json),
      );
    }

    // Support both response formats: { ok: true, data: { analysis } } and { analysis }
    const analysis = json?.data?.analysis || json?.analysis;
    if (!analysis) {
      throw new AppError('EMPTY_RESPONSE', 'AI 返回了空结果，请稍后重试');
    }

    return { analysis, model: json?.model || json?.data?.model };
  } catch (err: unknown) {
    throw mapNetworkError(err);
  }
}

export async function testAIConnection(request: AITestRequest): Promise<string> {
  if (!request.apiKey) {
    throw new AppError('NO_API_KEY', '请先填写 API Key');
  }

  const apiBase = getApiBase();

  try {
    const response = await fetchWithTimeout(
      `${apiBase}/api/test-ai`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      },
      TIMEOUT_MS,
    );

    const json = await response.json();

    if (!response.ok) {
      const errMsg = json?.error?.message || json?.error || `连接测试失败 (${response.status})`;
      throw new AppError('TEST_FAILED', typeof errMsg === 'string' ? errMsg : '连接测试失败');
    }

    return json?.data?.message || json?.message || '连接成功';
  } catch (err: unknown) {
    throw mapNetworkError(err);
  }
}
