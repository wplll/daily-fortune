import { AppError } from './AppError';

export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 30000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      (error instanceof Error && error.name === 'AbortError') ||
      message.toLowerCase().includes('abort')
    ) {
      throw new AppError('TIMEOUT', '请求超时，请稍后重试', message);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
