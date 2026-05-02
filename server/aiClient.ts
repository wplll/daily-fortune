import OpenAI from 'openai';

export interface AISettings {
  provider: 'deepseek' | 'openai-compatible';
  baseURL: string;
  model: string;
  apiKey: string;
}

export interface AnalyzeRequest {
  type: 'tarot' | 'iching' | 'zodiac' | 'almanac' | 'summary';
  date: string;
  result: unknown;
  userProfile?: {
    name?: string;
    zodiacSign?: string;
    birthDate?: string;
  };
  aiSettings: AISettings;
}

function buildPrompt(req: AnalyzeRequest): string {
  const { type, date, result, userProfile } = req;
  const resultStr = JSON.stringify(result, null, 2);
  const userName = userProfile?.name || '用户';

  const typeLabel: Record<string, string> = {
    almanac: '黄历',
    iching: '卦象（易经）',
    tarot: '塔罗牌',
    zodiac: '星座',
    summary: '每日综合运势',
  };

  // Extract question for tarot
  const questionText = (result as Record<string, unknown>)?.question as string | undefined;

  return `请根据以下每日运势结果，生成中文深度解读。${questionText ? `\n\n用户提问：${questionText}\n请针对这个问题，结合抽取到的塔罗牌进行针对性解读。` : ''}

用户信息：
- 昵称：${userName}
- 星座：${userProfile?.zodiacSign || '未设置'}
- 出生日期：${userProfile?.birthDate || '未设置'}

运势类型：${typeLabel[type] || type}
日期：${date}

运势原始结果：
\`\`\`json
${resultStr}
\`\`\`

要求：
1. 内容仅供娱乐与自我反思
2. 不要恐吓用户
3. 不要做绝对化预测
4. 不要声称能真实预知未来
5. 语气温暖、清晰、具体
6. 字数控制在 300 到 600 字

请按以下结构输出：

一、今日整体氛围
二、事业 / 学习建议
三、感情 / 人际建议
四、财务建议
五、今日行动建议`;
}

export async function runAIAnalysis(req: AnalyzeRequest): Promise<string> {
  const { aiSettings } = req;

  const client = new OpenAI({
    baseURL: aiSettings.baseURL,
    apiKey: aiSettings.apiKey,
  });

  const completion = await client.chat.completions.create({
    model: aiSettings.model,
    messages: [
      {
        role: 'system',
        content:
          '你是一个温和、理性、善于解释象征意义的每日运势分析师。你提供的是娱乐、心理反思和行动建议，不做绝对预测，不制造焦虑，不宣称能够真实预知未来。',
      },
      { role: 'user', content: buildPrompt(req) },
    ],
    temperature: 0.7,
    max_tokens: 1200,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('AI 返回了空结果');
  }

  return content;
}

export async function testAIConnection(aiSettings: AISettings): Promise<string> {
  const client = new OpenAI({
    baseURL: aiSettings.baseURL,
    apiKey: aiSettings.apiKey,
  });

  const completion = await client.chat.completions.create({
    model: aiSettings.model,
    messages: [{ role: 'user', content: '你好，请回复"连接成功"。' }],
    max_tokens: 20,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('AI 返回了空结果');
  }

  return content;
}
