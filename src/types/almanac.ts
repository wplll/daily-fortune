export interface AlmanacResult {
  date: string;
  lunarDate?: string;
  ganzhiYear?: string;
  ganzhiMonth?: string;
  ganzhiDay?: string;
  yi: string[];
  ji: string[];
  chongsha?: string;
  caishen?: string;
  xishen?: string;
  fushen?: string;
  luckyColor?: string;
  luckyNumber?: number;
  summary?: string;
  source: 'api' | 'fallback';

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
  suitable: string[];
  unsuitable: string[];
  clash: string;
  wealthDirection: string;
  joyDirection: string;
  advice: string;
}
