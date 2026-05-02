import { Platform } from 'react-native';

const DEV_SERVER_PORT = 3001;

/**
 * Returns the default backend proxy URL based on platform.
 * - Android emulator: 10.0.2.2 (host machine)
 * - iOS simulator: localhost
 * - Real device: user must configure in settings (falls back to localhost)
 */
export function getDefaultApiBaseURL(): string {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return `http://10.0.2.2:${DEV_SERVER_PORT}`;
    }
    return `http://localhost:${DEV_SERVER_PORT}`;
  }
  return `http://localhost:${DEV_SERVER_PORT}`;
}

export const DEFAULT_API_BASE_URL = getDefaultApiBaseURL();
