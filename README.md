# Hermes Desktop（银锁）

> Hermes 本地模型的桌面客户端 · 通用 AI Agent 桌面端前端

基于 **Tauri 2 + React 19 + TypeScript** 的桌面聊天应用，通过 WebSocket 直连本地 [Hermes](https://hermes.local) 服务（`ws://127.0.0.1:9119`），提供完整的 Agent 交互体验：流式对话、思考过程、工具调用、操作审批与澄清问答。

## ✨ 功能特性

- **流式对话** — 逐字输出模型回复，实时显示连接与发送状态
- **思考过程展示** — 展示模型 reasoning / thinking 过程
- **工具调用卡片** — 工具执行中、进度、完成/报错一目了然
- **审批与澄清** — 危险操作弹窗确认（允许/拒绝），歧义提问即时作答
- **斜杠命令** — 命令补全菜单，快速执行 `/` 指令
- **输入历史** — ↑↓ 翻看之前发过的消息
- **内置设置面板** — 模型（DeepSeek 主模型 / 豆包辅助 / MoA 多模型协同）、TTS 语音、外观、安全、Agent 行为、MCP 服务器等
- **无边框透明窗口** — 原生质感桌面体验，自绘标题栏

## 🛠 技术栈

| 层 | 技术 |
|---|---|
| 桌面壳 | Tauri 2（Rust） |
| 前端 | React 19 · TypeScript · Vite 7 |
| 协议 | WebSocket JSON-RPC（Hermes 网关协议） |
| 渲染 | react-markdown · rehype-highlight · remark-gfm |

## 🚀 快速开始

**环境要求**：Node.js 20+ · Rust（stable）· 本地已启动 Hermes 服务（监听 `127.0.0.1:9119`）

```bash
# 1. 安装依赖
npm install

# 2a. 桌面应用（开发模式）
npm run tauri dev

# 2b. 或纯网页预览（无需 Rust）
npm run dev
# 浏览器打开 http://localhost:1420
```

**打包桌面应用**：双击根目录 `编译到桌面.bat`，或执行：

```bash
npm run tauri build
```

## 📁 目录结构

```
hermes-desktop/
├─ src/                  # 前端界面（React + TS）
│  ├─ App.tsx            # 主界面：标题栏 / 启动页 / 设置面板
│  ├─ components/Chat/   # 聊天窗口（流式消息、工具卡片、审批/澄清弹窗）
│  ├─ hermes/            # Hermes 网关客户端（WebSocket JSON-RPC、心跳、重连）
│  └─ settings/          # 设置页组件（模型 / 语音 / 外观 / 安全 / Agent / 高级）
├─ src-tauri/            # 桌面壳（Rust）
│  ├─ src/               # Rust 程序入口
│  ├─ tauri.conf.json    # 应用配置（窗口、图标、标识）
│  └─ icons/             # 应用图标
├─ package.json          # 项目清单与命令
├─ vite.config.ts        # 开发服务器配置
└─ 编译到桌面.bat         # 一键打包脚本
```

## 📦 仓库同步

本仓库在 GitHub 与 Gitee 双端同步：

- GitHub：https://github.com/wwh389/hermes-desktop
- Gitee：https://gitee.com/wwhdegithub/hermes-desktop

## 📄 License

[GPL-2.0](LICENSE)
