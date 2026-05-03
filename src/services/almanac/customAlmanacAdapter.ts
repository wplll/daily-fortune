import { AlmanacResult } from '../../types/fortune';

/**
 * Adapt a custom almanac API response into the unified AlmanacResult format.
 * The custom endpoint is expected to return JSON — this adapter does a best-effort
 * mapping. Modify field mappings to match your specific API provider.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptCustomAlmanacResponse(date: string, raw: any): AlmanacResult {
  const yi = Array.isArray(raw.yi) ? raw.yi : Array.isArray(raw.suitable) ? raw.suitable : [];
  const ji = Array.isArray(raw.ji) ? raw.ji : Array.isArray(raw.unsuitable) ? raw.unsuitable : [];
  const chongsha = raw.chongsha || raw.chongSha || raw.clash || '';
  const caishen = raw.caishen || raw.caiShen || raw.wealthDirection || raw.wealth_direction || '';
  const xishen = raw.xishen || raw.xiShen || raw.joyDirection || raw.joy_direction || '';
  const summary = raw.summary || raw.advice || raw.jianyi || '';

  return {
    date,
    lunarDate: raw.lunarDate || raw.lunar || raw.lunar_date || raw.nongli || '',
    ganzhiYear: raw.ganzhiYear || raw.ganzhi_year || raw.yearGanzhi,
    ganzhiMonth: raw.ganzhiMonth || raw.ganzhi_month || raw.monthGanzhi,
    ganzhiDay: raw.ganzhiDay || raw.ganzhi_day || raw.dayGanzhi,
    yi,
    ji,
    suitable: yi,
    unsuitable: ji,
    chongsha,
    clash: chongsha,
    caishen,
    wealthDirection: caishen,
    xishen,
    fushen: raw.fushen || raw.fuShen,
    joyDirection: xishen,
    luckyColor: raw.luckyColor || raw.lucky_color || '',
    luckyNumber: Number(raw.luckyNumber || raw.lucky_number || 0),
    summary,
    advice: summary,
    source: 'api',
  };
}
