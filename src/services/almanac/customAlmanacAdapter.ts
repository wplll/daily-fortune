import { AlmanacResult } from '../../types/fortune';

/**
 * Adapt a custom almanac API response into the unified AlmanacResult format.
 * The custom endpoint is expected to return JSON — this adapter does a best-effort
 * mapping. Modify field mappings to match your specific API provider.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptCustomAlmanacResponse(date: string, raw: any): AlmanacResult {
  return {
    date,
    lunarDate: raw.lunarDate || raw.lunar || raw.lunar_date || raw.nongli || '',
    ganzhiYear: raw.ganzhiYear || raw.ganzhi_year || raw.yearGanzhi,
    ganzhiMonth: raw.ganzhiMonth || raw.ganzhi_month || raw.monthGanzhi,
    ganzhiDay: raw.ganzhiDay || raw.ganzhi_day || raw.dayGanzhi,
    suitable: Array.isArray(raw.yi) ? raw.yi : Array.isArray(raw.suitable) ? raw.suitable : [],
    unsuitable: Array.isArray(raw.ji) ? raw.ji : Array.isArray(raw.unsuitable) ? raw.unsuitable : [],
    clash: raw.chongsha || raw.chongSha || raw.clash || '',
    wealthDirection: raw.caishen || raw.caiShen || raw.wealthDirection || raw.wealth_direction || '',
    joyDirection: raw.xishen || raw.xiShen || raw.joyDirection || raw.joy_direction || '',
    luckyColor: raw.luckyColor || raw.lucky_color || '',
    luckyNumber: Number(raw.luckyNumber || raw.lucky_number || 0),
    advice: raw.summary || raw.advice || raw.jianyi || '',
    source: 'api',
  };
}
