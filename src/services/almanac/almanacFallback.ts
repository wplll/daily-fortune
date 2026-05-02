import { AlmanacResult } from '../../types/fortune';
import { generateAlmanacResult } from '../../data/almanacData';

export function generateFallbackAlmanac(date: string): AlmanacResult {
  const legacyResult = generateAlmanacResult(date);
  return {
    ...legacyResult,
    source: 'fallback',
  };
}
