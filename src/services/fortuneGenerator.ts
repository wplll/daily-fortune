import { FortuneResult, AlmanacResult, IChingResult, TarotResult, ZodiacResult, SummaryResult, TarotOrientation, ZodiacSign } from '../types/fortune';
import { generateAlmanacResult } from '../data/almanacData';
import { hexagrams } from '../data/hexagrams';
import { majorArcana } from '../data/tarotCards';
import { generateZodiacResult } from '../data/zodiacData';
import { today } from '../utils/date';
import { dateSeed, createSeededRandom, seededPick, seededInt } from '../utils/random';

export function generateAlmanac(date?: string): { type: 'almanac'; data: AlmanacResult };
export function generateAlmanac(date?: string): FortuneResult {
  const d = date ?? today();
  const data: AlmanacResult = generateAlmanacResult(d);
  return { type: 'almanac', data };
}

export function generateIChing(date?: string, randomDraw?: boolean): { type: 'iching'; data: IChingResult };
export function generateIChing(date?: string, randomDraw = false): FortuneResult {
  const d = date ?? today();
  const seed = randomDraw ? Date.now() : dateSeed(d);
  const rng = createSeededRandom(seed);
  const hexagram = seededPick(hexagrams, rng);
  const data: IChingResult = { date: d, hexagram };
  return { type: 'iching', data };
}

export function generateTarot(date?: string, question?: string): { type: 'tarot'; data: TarotResult };
export function generateTarot(date?: string, question = ''): FortuneResult {
  const d = date ?? today();
  const hashInput = question.trim() ? `${d}_${question.trim()}` : `${d}_tarot`;
  const seed = dateSeed(hashInput);
  const rng = createSeededRandom(seed);
  const card = seededPick(majorArcana, rng);
  const orientation: TarotOrientation = rng() > 0.5 ? 'upright' : 'reversed';
  const data: TarotResult = { date: d, question: question.trim(), card, orientation };
  return { type: 'tarot', data };
}

export function generateZodiac(date: string, sign: string): { type: 'zodiac'; data: ZodiacResult };
export function generateZodiac(date: string, sign: string): FortuneResult {
  const data: ZodiacResult = generateZodiacResult(date, sign as ZodiacSign);
  return { type: 'zodiac', data };
}

export function generateSummary(date?: string): { type: 'summary'; data: SummaryResult };
export function generateSummary(date?: string): FortuneResult {
  const d = date ?? today();
  const seed = dateSeed(d + '_summary');
  const rng = createSeededRandom(seed);

  const moodOptions = [
    '今天是充满可能性的一天，保持开放的心态，美好会不期而遇。',
    '今天的能量温和而稳定，适合沉淀自己、规划未来。',
    '今天的你会感受到内在的力量，勇敢面对任何挑战。',
    '今天是一个转折点，小变化可能带来意想不到的大收获。',
    '今天的氛围神秘而迷人，相信直觉，它会带你走向正确的方向。',
  ];

  const keywordPool = [
    '宁静', '勇气', '创造', '耐心', '希望', '平衡', '洞察',
    '感恩', '成长', '机遇', '和谐', '专注', '突破', '温暖',
  ];

  const adviceOptions = [
    '保持开放的心态，今天的意外可能成为明天的礼物。',
    '放下过度的控制欲，让事情自然发展。顺其自然也是一种智慧。',
    '关注身边的小美好，今天的幸福感来自于细节。',
    '给自己一些独处的时间，在安静中你会找到答案。',
  ];

  const score = seededInt(55, 95, rng);
  const shuffled = [...keywordPool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const data: SummaryResult = {
    date: d,
    overallScore: score,
    mood: seededPick(moodOptions, rng),
    keywords: shuffled.slice(0, 3),
    advice: seededPick(adviceOptions, rng),
  };

  return { type: 'summary', data };
}
