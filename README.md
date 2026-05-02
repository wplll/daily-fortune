# Daily Fortune（每日运势）

一款基于 React Native + Expo + TypeScript 的每日运势聚合 App。

支持黄历、卦象、塔罗牌、星座等多种运势查看方式，并可接入 DeepSeek API 进行 AI 深度解读。

---

## 功能特性

- **黄历**：今日宜忌、冲煞、财神方位、干支信息（支持真实 API + 本地 fallback）
- **卦象**：点击抽取易经卦象，获取事业、感情、财运建议
- **塔罗**：点击抽取每日一牌（大阿卡那），正位/逆位解读
- **星座**：12 星座每日运势，综合/爱情/事业/财运/健康评分
- **AI 深度解读**：通过 DeepSeek API 生成个性化分析（用户可自定义 provider/model/baseURL/apiKey）
- **分享功能**：生成运势分享图，通过系统分享/保存到相册
- **历史记录**：保存每日运势，日历视图回顾
- **个人信息**：设置昵称、星座、出生日期

---

## 免责声明

本应用内容仅供娱乐和自我反思参考，不构成任何形式的预测或建议。

---

## 技术栈

| 层级       | 技术                              |
| ---------- | --------------------------------- |
| 移动端框架 | React Native 0.76 + Expo 52       |
| 路由       | Expo Router 4                     |
| 语言       | TypeScript                        |
| 状态管理   | Zustand                           |
| 日期处理   | dayjs                             |
| 本地存储   | AsyncStorage                      |
| 截图分享   | react-native-view-shot + expo-sharing |
| 后端       | Node.js + Express + tsx           |
| AI API     | DeepSeek API / OpenAI Compatible  |

---

## 项目结构

```
Daily-Fortune/
├── app/                        # Expo Router 页面
│   ├── _layout.tsx             # 根布局（加载所有持久化数据）
│   ├── index.tsx               # 首页
│   ├── fortune/
│   │   ├── _layout.tsx
│   │   ├── almanac.tsx         # 黄历（API + fallback + 缓存）
│   │   ├── iching.tsx          # 卦象（抽取流程）
│   │   ├── tarot.tsx           # 塔罗（抽取流程 + 动画）
│   │   └── zodiac.tsx          # 星座
│   ├── calendar/
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # 日历
│   │   └── [date].tsx          # 日期详情
│   └── settings/
│       └── index.tsx           # 设置（含 AI/黄历/后端配置）
├── src/
│   ├── config/
│   │   └── api.ts              # 平台感知的 API 地址
│   ├── components/
│   │   ├── FortuneCard.tsx
│   │   ├── ActionButton.tsx
│   │   ├── CalendarView.tsx
│   │   ├── ResultSection.tsx
│   │   ├── LoadingOverlay.tsx
│   │   ├── Toast.tsx
│   │   ├── FortuneShareCard.tsx # 分享图卡片
│   │   └── ShareActions.tsx     # 分享按钮组
│   ├── data/                   # 静态数据
│   ├── services/
│   │   ├── aiService.ts        # AI 统一服务（超时、错误处理）
│   │   ├── almanacService.ts   # 黄历服务（API + fallback + 缓存）
│   │   ├── almanac/            # 黄历适配器
│   │   ├── fortuneGenerator.ts
│   │   ├── shareService.ts     # 分享服务
│   │   └── storageService.ts
│   ├── store/
│   │   ├── userStore.ts
│   │   ├── fortuneStore.ts
│   │   ├── aiSettingsStore.ts
│   │   └── almanacSettingsStore.ts
│   ├── types/
│   │   └── fortune.ts          # 所有类型定义
│   └── utils/
├── server/                     # 后端代理
│   ├── index.ts                # Express 服务
│   ├── aiClient.ts             # AI 客户端（支持动态配置）
│   ├── deepseek.ts             # 旧版（已不使用）
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## 快速开始

### 1. 安装依赖

```bash
# 移动端
npm install

# 后端
cd server && npm install && cd ..
```

### 2. 启动后端代理服务

```bash
npm run server:dev
# 或
cd server && npm run dev
```

服务运行在 `http://localhost:3001`。

### 3. 启动移动端

```bash
npm start
```

使用 Expo Go App 扫码运行。

---

## API 地址配置（重要）

### Android 模拟器

在设置页 → 后端代理设置 → 后端 API 地址 填：

```
http://10.0.2.2:3001
```

### iOS 模拟器

```
http://localhost:3001
```

### 真机调试

1. 确保手机和电脑在同一局域网
2. 查看电脑局域网 IP（如 192.168.1.100）
3. 在设置页填写：

```
http://192.168.x.x:3001
```

### 默认模型

后端默认使用 DeepSeek API，用户可在 App 设置页面自定义：
- API Provider（DeepSeek / OpenAI Compatible）
- API Base URL
- 模型名称
- API Key

---

## DeepSeek API Key 配置

有两种方式：

### 方式一：App 设置页配置（推荐）

1. 打开 App → 设置 → AI 模型设置
2. 填写 API Key
3. 点击"测试连接"验证
4. 点击"保存 AI 设置"

### 方式二：服务端环境变量（向后兼容）

```bash
cp server/.env.example server/.env
# 编辑 server/.env
DEEPSEEK_API_KEY=sk-your-key-here
```

注意：如果用户在 App 中配置了 API Key，客户端发送的 API Key 优先。

---

## 黄历 API 配置

默认使用本地 fallback 数据。如需接入真实黄历 API：

1. 打开 App → 设置 → 黄历 API 设置
2. 开启"启用自定义黄历 API"
3. 填写 API Endpoint（如 `https://your-api.com/almanac`）
4. 如有需要填写 API Key
5. 保存设置

请求格式：`GET {endpoint}?date=YYYY-MM-DD`
API Key 通过 `Authorization: Bearer {key}` header 发送。

如果 API 请求失败，自动回退到本地数据。

---

## 后端 API 端点

### GET /api/health

健康检查。

### POST /api/analyze-fortune

AI 深度解读。

请求体：
```json
{
  "type": "tarot",
  "date": "2026-05-03",
  "result": { ... },
  "userProfile": { "zodiacSign": "双鱼座", "birthDate": "", "name": "用户" },
  "aiSettings": {
    "provider": "deepseek",
    "baseURL": "https://api.deepseek.com",
    "model": "deepseek-v4-flash",
    "apiKey": "sk-..."
  }
}
```

### POST /api/test-ai

测试 AI 连接。

请求体：
```json
{
  "provider": "deepseek",
  "baseURL": "https://api.deepseek.com",
  "model": "deepseek-v4-flash",
  "apiKey": "sk-..."
}
```

---

## 分享功能说明

### 当前可用（Expo Go / Dev Build）

- **生成分享图**：将运势结果渲染为卡片图片
- **系统分享**：通过 iOS/Android 系统分享面板分享
- **保存图片**：保存到设备相册

### 需要 EAS Build / 自定义 Dev Client

- **微信原生分享**：需要微信 Open SDK + AppID
- **QQ 原生分享**：需要 QQ 互联 SDK + AppID

当前微信/QQ 按钮会提示用户并通过系统分享 fallback。

---

## 修改文件清单（v2 优化）

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/types/fortune.ts` | 修改 | 新增 AI/黄历/后端设置类型、AppError、draw state 类型 |
| `src/config/api.ts` | 新增 | 平台感知的 API 地址 |
| `src/store/aiSettingsStore.ts` | 新增 | AI + 后端设置持久化 store |
| `src/store/almanacSettingsStore.ts` | 新增 | 黄历 API 设置 store |
| `src/services/aiService.ts` | 重写 | 超时控制、错误分类、读取用户 AI 设置 |
| `src/services/almanacService.ts` | 新增 | API + fallback + 缓存黄历服务 |
| `src/services/almanac/*.ts` | 新增 | 黄历适配器模式 |
| `src/services/shareService.ts` | 新增 | 截图、分享、保存服务 |
| `src/services/storageService.ts` | 修改 | 新增 AI/后端/黄历设置持久化 |
| `src/components/FortuneShareCard.tsx` | 新增 | 可截图分享卡片 |
| `src/components/ShareActions.tsx` | 新增 | 分享按钮组 |
| `src/data/almanacData.ts` | 修改 | 新增 source 字段 |
| `app/_layout.tsx` | 修改 | 启动时加载所有持久化数据 |
| `app/fortune/tarot.tsx` | 重写 | 抽取流程（idle→drawing→drawn）+ 分享 |
| `app/fortune/iching.tsx` | 重写 | 抽取流程（idle→casting→cast）+ 分享 |
| `app/fortune/almanac.tsx` | 重写 | API + fallback + 刷新 + 分享 |
| `app/fortune/zodiac.tsx` | 修改 | 分享按钮 + AppError 处理 |
| `app/settings/index.tsx` | 重写 | AI/黄历/后端配置区 |
| `server/index.ts` | 重写 | 接受客户端 aiSettings，/test-ai 端点 |
| `server/aiClient.ts` | 新增 | 动态 AI 客户端 |
| `server/package.json` | 修改 | tsx 替代 ts-node |

---

## 环境要求

- Node.js >= 18
- npm >= 9
- Expo Go App（iOS / Android）或模拟器
