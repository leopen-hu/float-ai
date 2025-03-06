# Float AI Chrome Extension

一个基于 Chrome 浏览器的 AI 助手扩展程序，使用 DeepSeek API 提供智能对话服务。

## 功能特点

- 集成 DeepSeek API 进行智能对话
- 支持流式响应，实时显示 AI 回复
- 简洁的侧边栏界面
- 可配置 API 密钥和模型选择

## 技术栈

- React 19
- TypeScript
- Vite
- Chrome Extension API
- OpenAI SDK

## 开发环境要求

- Node.js
- pnpm 包管理器
- Chrome 浏览器 (版本 >= 80)

## 安装步骤

1. 克隆项目并安装依赖：

```bash
pnpm install
```

2. 开发模式运行：

```bash
pnpm dev
```

3. 构建扩展：

```bash
pnpm build
```

## 在 Chrome 中使用

1. 打开 Chrome 浏览器，进入扩展程序管理页面 (chrome://extensions/)
2. 开启「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择项目的 dist 目录

## 配置说明

1. 安装扩展后，点击扩展图标
2. 在设置中配置 DeepSeek API 密钥
3. 可选择使用的模型（默认为 deepseek-chat）

## 使用方法

1. 点击浏览器工具栏中的扩展图标打开侧边栏
2. 在对话框中输入问题
3. AI 助手将实时流式返回回答

## 开发指南

- `src/background.ts`: 扩展的后台脚本，处理与 DeepSeek API 的通信
- `src/components/`: 包含所有 React 组件
- `public/manifest.json`: Chrome 扩展的配置文件

## 许可证

MIT License
