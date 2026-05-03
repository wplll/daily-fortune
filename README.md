# Daily Fortune

Daily Fortune 是一个 React Native + Expo + TypeScript 移动端 App，提供黄历、卦象、塔罗、星座、AI 解读、历史记录和本地分享图生成功能。

当前版本采用纯客户端 App 架构：安装 APK 后即可使用基础功能，不需要启动 Node.js 后端，不需要公网 IP，也不依赖本机开发代理地址。

## 运行开发环境

安装依赖：

```bash
npm install
```

启动 Expo：

```bash
npm start
```

运行 Android：

```bash
npm run android
```

运行 iOS：

```bash
npm run ios
```

## 打包 APK

项目包含 `eas.json`。常见 APK 构建方式：

```bash
npx eas build -p android --profile preview
```

如未登录或未配置 EAS，需要先执行：

```bash
npx eas login
npx eas build:configure
```

Android 设备安装 APK 后，基础运势、塔罗、卦象、星座、黄历 fallback、保存记录和分享功能都可以直接使用。AI 解读和真实黄历 API 是增强功能，需要用户在 App 设置页自行配置。

## 纯客户端模式说明

当前版本不再需要启动 Node.js 后端。App 会直接请求用户在设置页配置的 DeepSeek API 和黄历 API。

`server/` 目录保留为 legacy / optional proxy 参考，不是 APK 使用的必要条件。根项目脚本不再启动或依赖该后端。

## DeepSeek 配置

打开 App 设置页，在“AI 模型设置”中填写：

- API Provider：DeepSeek 或 Custom OpenAI Compatible
- API Base URL
- 模型名称
- API Key

默认值：

```txt
Base URL: https://api.deepseek.com
Model: deepseek-v4-flash
```

App 会直接请求：

```txt
{baseURL}/chat/completions
```

请求使用 OpenAI-compatible Chat Completions 格式，并通过 `Authorization: Bearer {apiKey}` 发送用户填写的 API Key。

## 黄历 API 配置

黄历功能有两种模式：

1. 不配置 API，使用本地 fallback 数据。
2. 在设置页配置自定义黄历 API endpoint。

配置真实黄历 API 后，App 会按下面格式请求：

```txt
{endpoint}?date=YYYY-MM-DD
```

如果填写了黄历 API Key，App 会添加：

```txt
Authorization: Bearer {apiKey}
```

请求失败时会自动回退到本地 fallback 数据。黄历页面会显示数据来源：真实 API / 本地 fallback。

## 分享功能

分享图在客户端本地生成，不依赖后端服务：

- `react-native-view-shot` 生成图片
- `expo-sharing` 调起系统分享
- `expo-media-library` 可用于保存图片

微信 / QQ 未接入原生 SDK 时，分享按钮应回退到系统分享。

## 安全说明

纯客户端模式适合个人使用和轻量分发。由于移动端 App 需要直接请求第三方 API，用户填写的 API Key 会保存在本机。不要把开发者自己的 API Key 写死在源码或打进 APK。如果要做商业化产品，建议重新引入后端代理服务。

纯客户端模式下，用户自己的 API Key 会存储在本机。此架构适合个人使用或轻量分发。如果要做商业化产品，建议恢复后端代理或用户账号体系，以便更好地保护密钥和控制成本。

## 项目结构

```txt
app/                         Expo Router 页面
src/components/              通用 UI 和分享组件
src/data/                    本地运势和 fallback 数据
src/services/                AI、黄历、分享、缓存、历史记录等客户端服务
src/store/                   Zustand 本地状态
src/types/                   TypeScript 类型
src/utils/                   通用错误和请求工具
server/                      legacy / optional proxy，不是 APK 必需
```

## 关键实现

- AI 设置保存在 `daily_fortune_ai_settings`
- AI 请求由 `src/services/aiService.ts` 和 `src/services/deepseekClient.ts` 在客户端直连第三方 API
- 黄历请求由 `src/services/almanacService.ts` 在客户端请求自定义 endpoint
- 请求超时由 `src/utils/fetchWithTimeout.ts` 统一处理
- 用户可在设置页测试 AI 和黄历 API 连接
