import { AlmanacResult } from '../../types/fortune';

/**
 * Adapter for apihz.cn almanac API (https://cn.apihz.cn/api/time/getday.php).
 *
 * API params: GET ?id={userId}&key={userKey}
 *
 * Response fields (code=200):
 *   ynian, yyue, yri — 阳历年月日
 *   nyue, nri — 农历月日
 *   ganzhinian, ganzhiyue, ganzhiri — 干支年月日
 *   xingqi — 星期几
 *   yi — 宜 (pipe-separated)
 *   ji — 忌 (pipe-separated)
 *   jieri — 节日 (pipe-separated)
 *   shengxiao — 生肖
 *   xingzuo — 星座
 *   xiangchong — 相冲
 *   jijie — 季节
 *   nianwuxing, yuewuxing, riwuxing — 五行
 *   xingxiu — 星宿
 *   liuyao — 六曜
 *   shiershen — 十二神
 *   pengzu — 彭祖百忌
 *   taishen — 胎神占方
 *   jieqi — 节气
 *   jieqimsg — 节气描述
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptApihzResponse(date: string, raw: any): AlmanacResult {
  const yi = parsePipeList(raw.yi);
  const ji = parsePipeList(raw.ji);
  const holidays = parsePipeList(raw.jieri);

  // Build lunar date string
  const lunarDate = raw.nyue && raw.nri
    ? `农历${raw.nyue}${raw.nri}`
    : '';

  return {
    date,
    lunarDate,
    ganzhiYear: raw.ganzhinian || undefined,
    ganzhiMonth: raw.ganzhiyue || undefined,
    ganzhiDay: raw.ganzhiri || undefined,
    weekday: raw.xingqi || undefined,
    shengxiao: raw.shengxiao || undefined,
    constellation: raw.xingzuo || undefined,
    holidays: holidays.length > 0 ? holidays : undefined,
    season: raw.jijie || undefined,
    yearWuxing: raw.nianwuxing || undefined,
    monthWuxing: raw.yuewuxing || undefined,
    dayWuxing: raw.riwuxing || undefined,
    xingxiu: raw.xingxiu || undefined,
    liuyao: raw.liuyao || undefined,
    shiershen: raw.shiershen || undefined,
    pengzu: raw.pengzu || undefined,
    taishen: raw.taishen || undefined,
    jieqi: raw.jieqi || undefined,
    jieqiMsg: raw.jieqimsg || undefined,
    suitable: yi,
    unsuitable: ji,
    clash: raw.xiangchong || '',
    wealthDirection: '',
    joyDirection: '',
    luckyColor: '',
    luckyNumber: 0,
    advice: '',
    source: 'api',
  };
}

function parsePipeList(raw: string | undefined | null): string[] {
  if (!raw || typeof raw !== 'string') return [];
  return raw.split('|').map((s) => s.trim()).filter(Boolean);
}
