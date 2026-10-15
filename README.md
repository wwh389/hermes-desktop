# Hermes Desktop

给本地 [Hermes](https://hermes.local) 服务做的桌面前端——把 Agent 的对话、思考、工具调用都摆到桌面上，**让第一次用 Agent 的人也能轻松上手**。

## 它是干什么的

用 Hermes 通常要在终端里敲命令、盯着一堆 JSON 输出，门槛不低。Hermes Desktop 把这一切变成「打开就能聊」：

- **打开即用**：连上本地 Hermes 服务，直接开始对话
- **看得懂的界面**：消息、思考过程、工具调用都在同一个窗口里，不会吓到新手
- **丝滑的体验**：流式输出、操作确认、命令补全，用起来跟聊天软件一样顺手

## 特点

- **对话丝滑** — 回复逐字流出，随时可以打断停止
- **思考可见** — 模型在"想什么"也展示给你看（reasoning / thinking）
- **操作安全** — 它要动手做事（调用工具）时先弹确认框，你点「允许」才执行
- **命令菜单** — 输入 `/` 就有命令补全，不用记指令
- **输入历史** — ↑↓ 翻看之前发过的消息
- **设置面板** — 换模型、调语音、管安全权限，全在界面里点点就行

## 技术栈

| 层 | 技术 |
|---|---|
| 桌面壳 | Tauri 2（Rust） |
| 前端 | React 19 · TypeScript · Vite 7 |
| 协议 | WebSocket JSON-RPC（Hermes 网关协议） |
| 渲染 | react-markdown · rehype-highlight · remark-gfm |

## 快速开始

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

## 目录结构

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

## 仓库同步

本仓库在 GitHub 与 Gitee 双端同步：

- GitHub：https://github.com/wwh389/hermes-desktop
- Gitee：https://gitee.com/wwhdegithub/hermes-desktop

## License

[GPL-2.0](LICENSE)
