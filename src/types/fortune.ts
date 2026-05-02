// ── Fortune type enum ──
export type FortuneType = 'almanac' | 'iching' | 'tarot' | 'zodiac' | 'summary';

// ── AI Settings ──
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

// ── Backend Settings ──
export interface BackendSettings {
  apiBaseURL: string;
}

// ── Almanac API Settings ──
export type AlmanacProvider = 'apihz' | 'custom' | 'fallback';

export interface AlmanacApiSettings {
  enabled: boolean;
  provider: AlmanacProvider;
  /** apihz.cn user ID (数字ID) */
  userId: string;
  /** apihz.cn user key (通讯秘钥) */
  userKey: string;
  /** Custom provider endpoint URL */
  endpoint: string;
  /** Custom provider API key (sent as Authorization Bearer) */
  apiKey: string;
}

export const DEFAULT_ALMANAC_SETTINGS: AlmanacApiSettings = {
  enabled: false,
  provider: 'apihz',
  userId: '',
  userKey: '',
  endpoint: '',
  apiKey: '',
};

// ── Almanac (黄历) ──
export interface AlmanacResult {
  date: string;
  /** 农历月日 */
  lunarDate: string;
  /** 干支年 */
  ganzhiYear?: string;
  /** 干支月 */
  ganzhiMonth?: string;
  /** 干支日 */
  ganzhiDay?: string;
  /** 星期几 */
  weekday?: string;
  /** 生肖 */
  shengxiao?: string;
  /** 星座 */
  constellation?: string;
  /** 节日列表 */
  holidays?: string[];
  /** 季节 */
  season?: string;
  /** 年五行 */
  yearWuxing?: string;
  /** 月五行 */
  monthWuxing?: string;
  /** 日五行 */
  dayWuxing?: string;
  /** 星宿 */
  xingxiu?: string;
  /** 六曜 */
  liuyao?: string;
  /** 十二神 */
  shiershen?: string;
  /** 彭祖百忌 */
  pengzu?: string;
  /** 胎神占方 */
  taishen?: string;
  /** 节气 */
  jieqi?: string;
  /** 节气描述 */
  jieqiMsg?: string;
  suitable: string[];
  unsuitable: string[];
  /** 相冲 */
  clash: string;
  /** 财神方位（来自本地 fallback / 适配器推导） */
  wealthDirection: string;
  /** 喜神方位 */
  joyDirection: string;
  /** 幸运颜色 */
  luckyColor: string;
  /** 幸运数字 */
  luckyNumber: number;
  /** 今日建议 */
  advice: string;
  source: 'api' | 'fallback';
}

// ── I-Ching (卦象) ──
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

// ── Tarot ──
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

// ── Zodiac (星座) ──
export type ZodiacSign =
  | '白羊座' | '金牛座' | '双子座' | '巨蟹座'
  | '狮子座' | '处女座' | '天秤座' | '天蝎座'
  | '射手座' | '摩羯座' | '水瓶座' | '双鱼座';

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

// ── Summary (综合) ──
export interface SummaryResult {
  date: string;
  overallScore: number;
  mood: string;
  keywords: string[];
  advice: string;
}

// ── Unified result ──
export type FortuneResult =
  | { type: 'almanac'; data: AlmanacResult }
  | { type: 'iching'; data: IChingResult }
  | { type: 'tarot'; data: TarotResult }
  | { type: 'zodiac'; data: ZodiacResult }
  | { type: 'summary'; data: SummaryResult };

// ── Saved record ──
export interface FortuneRecord {
  id: string;
  date: string;
  type: FortuneType;
  title: string;
  rawResult: Record<string, unknown>;
  aiAnalysis?: string;
  savedAt: string;
}

// ── User profile ──
export interface UserProfile {
  name: string;
  zodiacSign: ZodiacSign;
  birthDate: string;
}

// ── AI request / response ──
export interface AIAnalyzeRequest {
  type: FortuneType;
  date: string;
  result: Record<string, unknown>;
  userProfile: {
    zodiacSign: string;
    birthDate: string;
    name: string;
  };
  aiSettings: AIModelSettings;
}

export interface AIAnalyzeResponse {
  analysis: string;
  model?: string;
}

export interface AITestRequest {
  provider: AIProvider;
  baseURL: string;
  model: string;
  apiKey: string;
}

// ── AppError ──
export class AppError extends Error {
  code: string;
  userMessage: string;

  constructor(code: string, userMessage: string, detail?: string) {
    super(detail || userMessage);
    this.code = code;
    this.userMessage = userMessage;
  }
}
