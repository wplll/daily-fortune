import { AlmanacResult } from '../types/fortune';
import { dateSeed, createSeededRandom, seededPick, seededInt } from '../utils/random';

const suitablePool = [
  '出行', '会友', '订婚', '结婚', '搬家', '开业',
  '交易', '签约', '装修', '动土', '安葬', '祭祀',
  '祈福', '求嗣', '入学', '求职', '上任', '开市',
];

const unsuitablePool = [
  '动土', '安葬', '出行', '搬家', '开业', '结婚',
  '诉讼', '签约', '投资', '远行', '修缮', '破土',
];

const clashPool = [
  '冲鼠(甲子)煞北',
  '冲牛(乙丑)煞西',
  '冲虎(丙寅)煞南',
  '冲兔(丁卯)煞东',
  '冲龙(戊辰)煞北',
  '冲蛇(己巳)煞西',
  '冲马(庚午)煞南',
  '冲羊(辛未)煞东',
  '冲猴(壬申)煞北',
  '冲鸡(癸酉)煞西',
  '冲狗(甲戌)煞南',
  '冲猪(乙亥)煞东',
];

const directionPool = ['正东', '正南', '正西', '正北', '东北', '东南', '西南', '西北'];

const colorPool = ['红色', '黄色', '白色', '黑色', '蓝色', '绿色', '紫色', '金色', '银色', '粉色'];

const advicePool = [
  '今日宜保持平和心态，稳步推进计划中的事务。适合处理人际关系的调整和优化。',
  '今天适合进行长期规划，不宜急于求成。着眼未来，做对的事而不是快的事。',
  '今日气场较旺，适合社交和商务活动。把握机会，展现你的专业和诚意。',
  '今天适合反思和沉淀，不宜大动干戈。安静地做好手头的工作，一步一个脚印。',
  '今日运势平稳，适合处理日常事务。保持谦虚谨慎的态度，多听少说。',
  '今天可能会遇到小阻力，但只需保持耐心就能顺利度过。多做准备总没错。',
  '今日创意和灵感较多，适合头脑风暴和新项目的启动。大胆想象，细心落地。',
  '今天适合与家人朋友共度时光，良好的人际关系是最好的运势加持。',
  '今日适合处理财务和合同相关的事务，仔细审查每一个细节。',
  '今天是一个休整的好日子，放慢节奏，给身心充充电。休息也是前进的一部分。',
];

/**
 * Generate a stable almanac result based on date.
 * Same date = same result.
 */
export function generateAlmanacResult(date: string): AlmanacResult {
  const seed = dateSeed(date);
  const rng = createSeededRandom(seed);

  // Divide suitables and unsuitables into distinct groups
  const shuffledSuitables = [...suitablePool];
  for (let i = shuffledSuitables.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffledSuitables[i], shuffledSuitables[j]] = [shuffledSuitables[j], shuffledSuitables[i]];
  }

  const suitCount = seededInt(2, 4, rng);
  const unsuitCount = seededInt(2, 3, rng);

  return {
    date,
    lunarDate: `农历${['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'][seededInt(0, 11, rng)]}月${['初', '十', '廿'][seededInt(0, 2, rng)]}${['一', '二', '三', '四', '五', '六', '七', '八', '九'][seededInt(0, 8, rng)]}`,
    suitable: shuffledSuitables.slice(0, suitCount),
    unsuitable: shuffledSuitables.slice(suitCount, suitCount + unsuitCount),
    clash: seededPick(clashPool, rng),
    wealthDirection: seededPick(directionPool, rng),
    joyDirection: seededPick(directionPool, rng),
    luckyColor: seededPick(colorPool, rng),
    luckyNumber: seededInt(1, 99, rng),
    advice: seededPick(advicePool, rng),
    source: 'fallback' as const,
  };
}
