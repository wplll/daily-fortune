import { ZodiacSign, ZodiacResult } from '../types/fortune';
import { dateSeed, createSeededRandom, seededInt } from '../utils/random';

interface ZodiacTemplate {
  sign: ZodiacSign;
  luckyColors: string[];
  luckyNumbers: number[];
  bestMatches: ZodiacSign[];
  advicePool: string[];
}

const zodiacTemplates: ZodiacTemplate[] = [
  {
    sign: '白羊座',
    luckyColors: ['红色', '橙色', '金色'],
    luckyNumbers: [1, 7, 9],
    bestMatches: ['狮子座', '射手座', '双子座'],
    advicePool: [
      '保持你一贯的热情和冲劲，但今天记得多听别人的意见。',
      '勇往直前是好事，但偶尔停下来检查方向会让你走得更远。',
      '你的活力和自信是你今天最大的资产，善用它。',
    ],
  },
  {
    sign: '金牛座',
    luckyColors: ['绿色', '粉色', '大地色'],
    luckyNumbers: [2, 6, 8],
    bestMatches: ['处女座', '摩羯座', '巨蟹座'],
    advicePool: [
      '坚持你的节奏，不必被外界的变化打乱步伐。',
      '今天适合享受生活中的小确幸，一顿美食或一段宁静的时光。',
      '你的耐心和稳定是周围人的依靠，继续做那个可靠的人。',
    ],
  },
  {
    sign: '双子座',
    luckyColors: ['黄色', '浅蓝', '白色'],
    luckyNumbers: [3, 5, 11],
    bestMatches: ['天秤座', '水瓶座', '白羊座'],
    advicePool: [
      '你的好奇心和沟通能力是你今天最大的利器。',
      '尝试学习一项新技能或了解一个新领域，今天特别适合。',
      '让你的思维自由飞翔，但记得在决策时回归理性。',
    ],
  },
  {
    sign: '巨蟹座',
    luckyColors: ['银色', '白色', '浅紫'],
    luckyNumbers: [2, 4, 7],
    bestMatches: ['天蝎座', '双鱼座', '金牛座'],
    advicePool: [
      '相信你的直觉和感受，它们往往是正确的。',
      '今天适合照顾自己和你爱的人，温馨的家庭时光最有价值。',
      '不要把所有情绪都藏在心里，分享出来会让负担减半。',
    ],
  },
  {
    sign: '狮子座',
    luckyColors: ['金色', '橙色', '紫色'],
    luckyNumbers: [1, 5, 9],
    bestMatches: ['白羊座', '射手座', '天秤座'],
    advicePool: [
      '舞台属于你，今天适合展现才华和领导力。',
      '你的慷慨和热情会为你赢得更多友谊和支持。',
      '享受被关注的感觉，但别忘了也给他人一些掌声。',
    ],
  },
  {
    sign: '处女座',
    luckyColors: ['灰色', '米色', '深蓝'],
    luckyNumbers: [3, 6, 10],
    bestMatches: ['金牛座', '摩羯座', '天蝎座'],
    advicePool: [
      '你的细致和专注会在今天带来意想不到的收获。',
      '追求完美是好事，但记得给自己一些喘息的空间。',
      '今天适合整理和规划，清晰的思路是高效行动的基础。',
    ],
  },
  {
    sign: '天秤座',
    luckyColors: ['粉色', '浅绿', '蓝色'],
    luckyNumbers: [2, 4, 8],
    bestMatches: ['双子座', '水瓶座', '狮子座'],
    advicePool: [
      '你的公平和优雅会化解许多潜在的冲突。',
      '今天适合做美的相关事务——艺术、设计或简单的家居布置。',
      '在决定之间犹豫时，相信你的直觉和审美。',
    ],
  },
  {
    sign: '天蝎座',
    luckyColors: ['深红', '黑色', '紫色'],
    luckyNumbers: [1, 4, 9],
    bestMatches: ['巨蟹座', '双鱼座', '处女座'],
    advicePool: [
      '你的洞察力在今天尤为锐利，能看到别人忽略的真相。',
      '深度思考和研究会带来突破，但别忘了分享你的发现。',
      '你的专注和决心是你最强大的武器，坚持下去。',
    ],
  },
  {
    sign: '射手座',
    luckyColors: ['紫色', '蓝色', '绿色'],
    luckyNumbers: [3, 7, 12],
    bestMatches: ['白羊座', '狮子座', '水瓶座'],
    advicePool: [
      '保持你的乐观和冒险精神，今天适合尝试新事物。',
      '计划一次旅行或学习一门新课程，扩展视野。',
      '你的坦率和幽默会为你打开许多扇门。',
    ],
  },
  {
    sign: '摩羯座',
    luckyColors: ['棕色', '深灰', '黑色'],
    luckyNumbers: [4, 8, 10],
    bestMatches: ['金牛座', '处女座', '天蝎座'],
    advicePool: [
      '坚持和耐心是你的长项，今天的努力会积累成未来的成果。',
      '设定清晰的短期目标，一步步向更大的梦想前进。',
      '不要只关注工作，给自己安排一些放松的时间。',
    ],
  },
  {
    sign: '水瓶座',
    luckyColors: ['电蓝', '银色', '青色'],
    luckyNumbers: [1, 4, 11],
    bestMatches: ['双子座', '天秤座', '射手座'],
    advicePool: [
      '你的独特视角和创新思维会在今天带来突破。',
      '不要害怕与众不同，你的特别之处正是你的价值所在。',
      '今天适合参与团队讨论或社交活动，你的想法会被认可。',
    ],
  },
  {
    sign: '双鱼座',
    luckyColors: ['海蓝', '紫色', '浅绿'],
    luckyNumbers: [2, 5, 9],
    bestMatches: ['巨蟹座', '天蝎座', '摩羯座'],
    advicePool: [
      '你的同理心和艺术感在今天特别敏锐，适合创作和表达。',
      '偶尔逃离现实不是逃避，是给心灵充电的方式。',
      '相信你的直觉和梦境，它们可能带来重要的启示。',
    ],
  },
];

export function getZodiacSigns(): ZodiacSign[] {
  return zodiacTemplates.map((z) => z.sign);
}

export function getZodiacTemplate(sign: ZodiacSign): ZodiacTemplate {
  return zodiacTemplates.find((z) => z.sign === sign) ?? zodiacTemplates[0];
}

/**
 * Generate a stable zodiac result based on date and sign.
 * Same date + same sign = same result.
 */
export function generateZodiacResult(date: string, sign: ZodiacSign): ZodiacResult {
  const template = getZodiacTemplate(sign);
  const seed = dateSeed(date + sign);
  const rng = createSeededRandom(seed);

  const scores = [
    seededInt(55, 95, rng),
    seededInt(50, 95, rng),
    seededInt(50, 95, rng),
    seededInt(50, 95, rng),
    seededInt(55, 95, rng),
  ];

  return {
    date,
    sign,
    overall: scores[0],
    love: scores[1],
    career: scores[2],
    wealth: scores[3],
    health: scores[4],
    luckyColor: template.luckyColors[seededInt(0, template.luckyColors.length - 1, rng)],
    luckyNumber: template.luckyNumbers[seededInt(0, template.luckyNumbers.length - 1, rng)],
    bestMatch: template.bestMatches[seededInt(0, template.bestMatches.length - 1, rng)],
    advice: template.advicePool[seededInt(0, template.advicePool.length - 1, rng)],
  };
}
