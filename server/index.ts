import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { runAIAnalysis, testAIConnection } from './aiClient';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ── Request debug middleware ──
app.use((req, _res, next) => {
  if (req.path.startsWith('/api/') && req.method === 'POST') {
    console.log(`[req] ${req.method} ${req.path} bodyKeys=${Object.keys(req.body || {}).join(',')}`);
  }
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, status: 'running' });
});

// POST /api/analyze-fortune
app.post('/api/analyze-fortune', async (req, res) => {
  try {
    const body = req.body || {};

    if (!body.type || !body.date || !body.result) {
      const received = JSON.stringify(Object.keys(body));
      console.log(`[analyze] validation failed — received keys: ${received}`);
      res.status(400).json({
        ok: false,
        error: {
          code: 'MISSING_PARAMS',
          message: `缺少必要参数：type, date, result。实际收到: ${received}`,
        },
      });
      return;
    }

    const { type, date, result, userProfile, aiSettings: aiSettingsIn } = body;

    const validTypes = ['tarot', 'iching', 'zodiac', 'almanac', 'summary'];
    if (!validTypes.includes(type)) {
      res.status(400).json({
        ok: false,
        error: { code: 'INVALID_TYPE', message: `无效的运势类型: ${type}` },
      });
      return;
    }

    // Build aiSettings: client-provided > server env vars
    let aiSettings = aiSettingsIn;
    if (!aiSettings || !aiSettings.apiKey) {
      const envKey = process.env.DEEPSEEK_API_KEY;
      if (envKey) {
        console.log('[analyze] using DEEPSEEK_API_KEY from server env');
        aiSettings = {
          provider: (aiSettings?.provider) || 'deepseek',
          baseURL: aiSettings?.baseURL || process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
          model: aiSettings?.model || process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
          apiKey: envKey,
        };
      } else {
        res.status(400).json({
          ok: false,
          error: {
            code: 'NO_API_KEY',
            message: '请先在 App 设置页配置 API Key，或在 server/.env 中设置 DEEPSEEK_API_KEY',
          },
        });
        return;
      }
    }

    // Ensure defaults
    if (!aiSettings.baseURL) aiSettings.baseURL = 'https://api.deepseek.com';
    if (!aiSettings.model) aiSettings.model = 'deepseek-v4-flash';

    console.log(`[analyze] type=${type} date=${date} model=${aiSettings.model}`);

    const analysis = await runAIAnalysis({ type, date, result, userProfile, aiSettings });

    res.json({
      ok: true,
      data: { analysis, model: aiSettings.model },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知服务器错误';
    console.error('[analyze error]', message.slice(0, 300));
    res.status(500).json({
      ok: false,
      error: { code: 'SERVER_ERROR', message: `AI 分析失败: ${message}` },
    });
  }
});

// POST /api/test-ai
app.post('/api/test-ai', async (req, res) => {
  try {
    const body = req.body || {};
    let { provider, baseURL, model, apiKey } = body;

    if (!apiKey) {
      apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        res.status(400).json({
          ok: false,
          error: { code: 'NO_API_KEY', message: '请填写 API Key' },
        });
        return;
      }
    }
    if (!baseURL) baseURL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
    if (!model) model = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';

    console.log(`[test-ai] model=${model} provider=${provider || 'deepseek'} baseURL=${baseURL}`);

    await testAIConnection({
      provider: provider || 'deepseek',
      baseURL,
      model,
      apiKey,
    });

    res.json({
      ok: true,
      data: { message: 'AI 连接测试成功' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知错误';
    console.error('[test-ai error]', message.slice(0, 300));
    res.status(500).json({
      ok: false,
      error: { code: 'TEST_FAILED', message: `连接测试失败: ${message}` },
    });
  }
});

app.listen(PORT, () => {
  console.log(`Daily Fortune Server running on http://localhost:${PORT}`);
  console.log('Endpoints: GET /api/health | POST /api/analyze-fortune | POST /api/test-ai');
  if (process.env.DEEPSEEK_API_KEY) {
    console.log(`DeepSeek API Key: loaded from env (model: ${process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash'})`);
  } else {
    console.log('DeepSeek API Key: not set in env (will use client-provided key)');
  }
});
