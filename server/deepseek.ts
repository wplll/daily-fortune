import OpenAI from 'openai';

const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey) {
  console.warn('[deepseek] DEEPSEEK_API_KEY not set. AI analysis will fail.');
}

const client = apiKey
  ? new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey,
    })
  : null;

export interface AnalyzeRequest {
  type: 'tarot' | 'iching' | 'zodiac' | 'almanac' | 'summary';
  date: string;
  result: Record<string, unknown>;
  userProfile: {
    zodiacSign: string;
    birthDate: string;
    name: string;
  };
}

function buildPrompt(req: AnalyzeRequest): string {
  const { type, date, result, userProfile } = req;
  const resultStr = JSON.stringify(result, null, 2);
  const userName = userProfile.name || '用户';

  const typeLabel: Record<string, string> = {
    almanac: '黄历',
    iching: '卦象（易经）',
    tarot: '塔罗牌',
    zodiac: '星座',
    summary: '每日综合运势',
  };

  return `你是一个温和、理性、善于解释象征意义的每日运势分析师。请根据用户提供的运势结果，生成一段中文分析。

用户信息：
- 昵称：${userName}
- 星座：${userProfile.zodiacSign || '未设置'}
- 出生日期：${userProfile.birthDate || '未设置'}

运势类型：${typeLabel[type] || type}
日期：${date}

运势原始结果：
\`\`\`json
${resultStr}
\`\`\`

请按要求生成分析。规则如下：
- 不要恐吓用户
- 不要做绝对化预测
- 不要声称能真实预知未来
- 内容应以娱乐、反思、行动建议为主
- 结构包括：
  1. 今日整体氛围（一段话概括今天的能量和主题）
  2. 事业 / 学习建议
  3. 感情 / 人际建议
  4. 财务建议
  5. 今日行动建议（具体可行的1-3个建议）
- 语气温暖、清晰、具体，像一位善解人意的朋友在聊天
- 字数控制在 300 到 600 字
- 可以适当引用运势数据中的具体内容进行解读`;
}

export async function analyzeFortune(req: AnalyzeRequest): Promise<string> {
  if (!client) {
    throw new Error('DeepSeek API 未配置。请设置 DEEPSEEK_API_KEY 环境变量。');
  }

  const model = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: '你是一位温和、理性、善于解释象征意义的每日运势分析师。所有内容仅供娱乐参考，不构成实际预测。' },
      { role: 'user', content: buildPrompt(req) },
    ],
    temperature: 0.7,
    max_tokens: 1200,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('DeepSeek API 返回了空结果');
  }

  return content;
}
