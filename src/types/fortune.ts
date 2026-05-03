export type FortuneType = 'almanac' | 'iching' | 'tarot' | 'zodiac' | 'summary';

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

export type AlmanacProvider = 'custom' | 'fallback';

export interface AlmanacApiSettings {
  enabled: boolean;
  provider: AlmanacProvider;
  endpoint: string;
  apiKey: string;
}

export const DEFAULT_ALMANAC_SETTINGS: AlmanacApiSettings = {
  enabled: false,
  provider: 'fallback',
  endpoint: '',
  apiKey: '',
};

export interface AlmanacResult {
  date: string;
  lunarDate: string;
  ganzhiYear?: string;
  ganzhiMonth?: string;
  ganzhiDay?: string;
  weekday?: string;
  shengxiao?: string;
  constellation?: string;
  holidays?: string[];
  season?: string;
  yearWuxing?: string;
  monthWuxing?: string;
  dayWuxing?: string;
  xingxiu?: string;
  liuyao?: string;
  shiershen?: string;
  pengzu?: string;
  taishen?: string;
  jieqi?: string;
  jieqiMsg?: string;
  yi: string[];
  ji: string[];
  suitable: string[];
  unsuitable: string[];
  chongsha?: string;
  clash: string;
  caishen?: string;
  wealthDirection: string;
  xishen?: string;
  fushen?: string;
  joyDirection: string;
  luckyColor: string;
  luckyNumber: number;
  summary?: string;
  advice: string;
  source: 'api' | 'fallback';
}

export interface Hexagram {
  id: number;
  name: string;
  symbol: string;
  upperTrigram: string;
  lowerTrigram: string;
  judgment: string;
  image: string;
  career: string;
  love: string;
  wealth: string;
  action: string;
}

export interface IChingResult {
  date: string;
  hexagram: Hexagram;
}

export type TarotOrientation = 'upright' | 'reversed';
export type TarotDrawState = 'input' | 'drawing' | 'result';
export type IChingDrawState = 'idle' | 'casting' | 'cast';

export interface TarotCard {
  id: number;
  name: string;
  nameZh: string;
  keywords: string[];
  keywordsReversed: string[];
  meaning: string;
  meaningReversed: string;
  love: string;
  loveReversed: string;
  career: string;
  careerReversed: string;
  wealth: string;
  wealthReversed: string;
  action: string;
  actionReversed: string;
}

export interface TarotResult {
  date: string;
  question: string;
  card: TarotCard;
  orientation: TarotOrientation;
}

export interface TarotHistoryItem {
  id: string;
  date: string;
  question: string;
  cardId: number;
  cardNameZh: string;
  orientation: TarotOrientation;
  aiAnalysis?: string;
  drawnAt: string;
}

export type ZodiacSign = string;

export interface ZodiacResult {
  date: string;
  sign: ZodiacSign;
  overall: number;
  love: number;
  career: number;
  wealth: number;
  health: number;
  luckyColor: string;
  luckyNumber: number;
  bestMatch: ZodiacSign;
  advice: string;
}

export interface SummaryResult {
  date: string;
  overallScore: number;
  mood: string;
  keywords: string[];
  advice: string;
}

export type FortuneResult =
  | { type: 'almanac'; data: AlmanacResult }
  | { type: 'iching'; data: IChingResult }
  | { type: 'tarot'; data: TarotResult }
  | { type: 'zodiac'; data: ZodiacResult }
  | { type: 'summary'; data: SummaryResult };

export interface FortuneRecord {
  id: string;
  date: string;
  type: FortuneType;
  title: string;
  rawResult: Record<string, unknown>;
  aiAnalysis?: string;
  savedAt: string;
}

export interface UserProfile {
  name: string;
  zodiacSign: ZodiacSign;
  birthDate: string;
}

export interface AIAnalyzeRequest {
  type: FortuneType;
  date: string;
  result: unknown;
  userProfile?: {
    zodiacSign?: string;
    birthDate?: string;
    name?: string;
  };
}

export interface AIAnalyzeResponse {
  analysis: string;
  model?: string;
}

export { AppError } from '../utils/AppError';
