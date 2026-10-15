import { useState, useRef, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./App.css";

import ChatView from "./components/Chat/ChatView";
import "./components/Chat/chat.css";

function App() {
  const [splashInput, setSplashInput] = useState("");
  const [messages, setMessages] = useState<{ from: "me" | "ai"; text: string; time: string }[]>([]);
  const [chatMode, setChatMode] = useState(false);
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState("model");
  const [modelSubTab, setModelSubTab] = useState("main");
  const msgAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgAreaRef.current) {
      msgAreaRef.current.scrollTop = msgAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showSettings) {
        setShowSettings(false);
      }
    };
    const wheelHandler = (e: WheelEvent) => {
      if (showSettings && e.deltaY < 0) {
        const content = document.querySelector('.settings-content');
        if (content && content.scrollTop <= 0) {
          setShowSettings(false);
        }
      }
    };
    window.addEventListener("keydown", keyHandler);
    window.addEventListener("wheel", wheelHandler);
    return () => {
      window.removeEventListener("keydown", keyHandler);
      window.removeEventListener("wheel", wheelHandler);
    };
  }, [showSettings]);

  async function minimize() {
    const win = getCurrentWindow();
    await win.minimize();
  }

  async function toggleMaximize() {
    const win = getCurrentWindow();
    await win.toggleMaximize();
  }

  async function closeWindow() {
    const win = getCurrentWindow();
    await win.close();
  }

  function startChat(text: string) {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString();
    setMessages([{ from: "me", text, time: now }]);
    setSplashInput("");
    setChatMode(true);
  }

  function send() {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString();
    setMessages((prev) => [...prev, { from: "me", text: input, time: now }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "收到你的消息了，正在思考…", time: new Date().toLocaleTimeString() },
      ]);
    }, 500);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "这是模拟的AI回复，真正的AI内核还没接上。", time: new Date().toLocaleTimeString() },
      ]);
    }, 1800);
  }

  return (
    <>
      <div className={"app-container" + (chatMode ? " chat-active" : "") + (showSettings ? " settings-open" : "")}>
        <div className="titlebar" data-tauri-drag-region>
          <div className="titlebar-controls" data-tauri-drag-region>
            <button className="win-btn minimize" onClick={minimize} data-tauri-drag-region="false" title="最小化">
              <svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="5.5" width="8" height="1" fill="currentColor"/></svg>
            </button>
            <button className="win-btn maximize" onClick={toggleMaximize} data-tauri-drag-region="false" title="最大化">
              <svg width="12" height="12" viewBox="0 0 12 12"><rect x="2.5" y="2.5" width="7" height="7" stroke="currentColor" fill="none" strokeWidth="1.2"/></svg>
            </button>
            <button className="win-btn close" onClick={closeWindow} data-tauri-drag-region="false" title="关闭">
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        <div className="page-stack">
        <div className="page-main">
        <div className="transition-layer">
          {chatMode && <ChatView initialMessage={messages[0]?.text} />}
          <div className={"msg-area-wrap" + (chatMode ? " show" : "") + (chatMode ? " hidden-by-chatview" : "")}>
            <div className="chat-msg-area" ref={msgAreaRef}>
              {messages.map((m, i) => (
                <div key={i} className={"chat-msg-row " + m.from}>
                  <div className="chat-msg-text">{m.text}</div>
                  <div className="chat-msg-time">{m.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={"input-wrap" + (chatMode ? " at-bottom" : " at-center") + (chatMode ? " hidden-by-chatview" : "")}>
            <div className="input-wrap-inner">
              <textarea
                className="main-input"
                value={chatMode ? input : splashInput}
                onChange={(e) => { chatMode ? setInput(e.target.value) : setSplashInput(e.target.value); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (chatMode) send();
                    else startChat(splashInput);
                  }
                }}
                placeholder={chatMode ? "继续对话…" : "输入你的问题，回车开始对话…"}
                rows={1}
              />
              <button
                className="main-send-btn"
                onClick={() => { chatMode ? send() : startChat(splashInput); }}
                disabled={!(chatMode ? input.trim() : splashInput.trim())}
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="splash-bottom-bar">
            <div className="bar-side-group">
              <button className="side-btn btn-file" title="文件">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <polyline points="3,7 3,5 5,3 9,3 11,5 11,7" stroke="currentColor" strokeWidth="1.2" fill="none" stroke-linejoin="miter" stroke-linecap="square"/>
                  <rect x="3" y="7" width="18" height="14" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  <polyline points="3,7 11,7 13,9 21,9" stroke="currentColor" strokeWidth="1.2" fill="none" stroke-linejoin="miter" stroke-linecap="square"/>
                </svg>
              </button>
              <button className="side-btn btn-photo" title="照片">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="14" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="1.2" fill="none" stroke-linejoin="miter" stroke-linecap="square"/>
                </svg>
              </button>
            </div>

            <button className="bottom-bar-item bar-history">
              <span className="bar-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <polyline points="4,8 8,4 14,4 18,8 20,12 20,16 16,20 8,20 4,16 4,12" stroke="currentColor" strokeWidth="1.2" fill="none" stroke-linejoin="miter" stroke-linecap="square"/>
                  <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.2" stroke-linecap="square"/>
                  <line x1="12" y1="12" x2="15" y2="14" stroke="currentColor" strokeWidth="1.2" stroke-linecap="square"/>
                </svg>
              </span>
              <span className="bar-label">历史对话</span>
            </button>
            <button className="bottom-bar-item bar-reason">
              <span className="bar-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <polyline points="12,3 9,3 7,5 5,4 3,6 2,8 4,10 5,12 3,14 2,16 4,18 6,19 8,18 10,20 12,20" stroke="currentColor" strokeWidth="1.2" fill="none" stroke-linejoin="miter" stroke-linecap="square"/>
                  <polyline points="12,3 15,3 17,5 19,4 21,6 22,8 20,10 19,12 21,14 22,16 20,18 18,19 16,18 14,20 12,20" stroke="currentColor" strokeWidth="1.2" fill="none" stroke-linejoin="miter" stroke-linecap="square"/>
                  <line x1="12" y1="3" x2="12" y2="20" stroke="currentColor" strokeWidth="1.2" stroke-linecap="square"/>
                </svg>
              </span>
              <span className="bar-label">推理强度</span>
            </button>
            <button className="bottom-bar-item bar-settings" onClick={() => setShowSettings(true)}>
              <span className="bar-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  <rect x="10.5" y="3" width="3" height="3" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  <rect x="10.5" y="18" width="3" height="3" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  <rect x="3" y="10.5" width="3" height="3" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  <rect x="18" y="10.5" width="3" height="3" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  <rect x="3" y="3" width="3" height="3" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <rect x="18" y="3" width="3" height="3" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <rect x="3" y="18" width="3" height="3" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <rect x="18" y="18" width="3" height="3" stroke="currentColor" strokeWidth="1" fill="none"/>
                </svg>
              </span>
              <span className="bar-label">系统设置</span>
            </button>
            <button className="bottom-bar-item bar-health">
              <span className="bar-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <polyline points="4,16 8,16 11,10 14,16 18,16 20,13 20,9 18,7 15,7 13,9" stroke="currentColor" strokeWidth="1.2" fill="none" stroke-linejoin="miter" stroke-linecap="square"/>
                  <polyline points="10,20 12,22 14,20" stroke="currentColor" strokeWidth="1.2" fill="none" stroke-linejoin="miter"/>
                </svg>
              </span>
              <span className="bar-label">健康检查</span>
            </button>

            <div className="bar-side-group">
              <button className="side-btn btn-voice" title="语音">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="3" width="6" height="11" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  <path d="M5 11C5 13.2 6.8 15 9 15H15C17.2 15 19 13.2 19 11" stroke="currentColor" strokeWidth="1.2" fill="none" stroke-linejoin="miter" stroke-linecap="square"/>
                  <line x1="12" y1="15" x2="12" y2="19" stroke="currentColor" strokeWidth="1.2" stroke-linecap="square"/>
                  <line x1="9" y1="19" x2="15" y2="19" stroke="currentColor" strokeWidth="1.2" stroke-linecap="square"/>
                  <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="1.2" stroke-linecap="square"/>
                </svg>
              </button>
              <button className="side-btn btn-search" title="搜索">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  <line x1="14.5" y1="14.5" x2="21" y2="21" stroke="currentColor" strokeWidth="1.2" stroke-linecap="square"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <button className="rtb-item rtb-model" title="当前模型">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.3" fill="none"/>
              <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1" fill="none"/>
              <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1" fill="none" transform="rotate(60 12 12)"/>
              <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1" fill="none" transform="rotate(120 12 12)"/>
            </svg>
            <span>当前模型</span>
          </button>
          <button className="rtb-item rtb-message" title="消息接入">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 5C4 3.9 4.9 3 6 3H18C19.1 3 20 3.9 20 5V14C20 15.1 19.1 16 18 16H13L9 20V16H6C4.9 16 4 15.1 4 14V5Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            </svg>
            <span>消息接入</span>
          </button>
          <button className="rtb-item rtb-timer" title="定时任务">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <polyline points="12,9 12,13 15,15" stroke="currentColor" strokeWidth="1.2" fill="none" stroke-linecap="square"/>
              <line x1="9" y1="3" x2="9" y2="6" stroke="currentColor" strokeWidth="1.2" stroke-linecap="square"/>
              <line x1="15" y1="3" x2="15" y2="6" stroke="currentColor" strokeWidth="1.2" stroke-linecap="square"/>
            </svg>
            <span>定时任务</span>
          </button>
          <button className="rtb-item rtb-agent" title="查看代理">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <path d="M6 20C6 16.7 8.7 14 12 14C15.3 14 18 16.7 18 20" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            </svg>
            <span>查看代理</span>
          </button>

        <button className="ltb-item ltb-stats" title="Token">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <text x="12" y="15.5" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" font-weight="600">T</text>
            </svg>
            <span>Token</span>
          </button>
          <button className="ltb-item ltb-logs" title="日志">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="3" width="14" height="18" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1" stroke-linecap="square"/>
              <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1" stroke-linecap="square"/>
              <line x1="8" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1" stroke-linecap="square"/>
            </svg>
            <span>日志</span>
          </button>
          <button className="ltb-item ltb-restart" title="重启">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 12A8 8 0 1 1 12 4" stroke="currentColor" strokeWidth="1.2" fill="none" stroke-linecap="square"/>
              <polyline points="12,1 12,5 16,5" stroke="currentColor" strokeWidth="1.2" fill="none" stroke-linecap="square" stroke-linejoin="miter"/>
            </svg>
            <span>重启</span>
          </button>
          <div className="ltb-item ltb-status" title="工作状态">
            <span className="status-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </span>
          </div>
        </div>

        <div className="page-settings">
          <div className="settings-header">
            <span className="settings-title">系统设置</span>
            <div className="settings-header-spacer"></div>
          </div>

          <div className="settings-body">
            <div className="settings-nav">
              <button className={"nav-item" + (settingsTab === "model" ? " active" : "")} onClick={() => setSettingsTab("model")}>
                <span className="nav-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1" fill="none"/>
                    <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1" fill="none" transform="rotate(60 12 12)"/>
                    <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1" fill="none" transform="rotate(120 12 12)"/>
                  </svg>
                </span>
                <span>模型</span>
              </button>
              <button className={"nav-item" + (settingsTab === "voice" ? " active" : "")} onClick={() => setSettingsTab("voice")}>
                <span className="nav-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="9" y="3" width="6" height="11" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <path d="M5 11C5 13.2 6.8 15 9 15H15C17.2 15 19 13.2 19 11" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <line x1="12" y1="15" x2="12" y2="19" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                </span>
                <span>语音</span>
              </button>
              <button className={"nav-item" + (settingsTab === "appearance" ? " active" : "")} onClick={() => setSettingsTab("appearance")}>
                <span className="nav-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <path d="M12 3C12 3 8 8 8 12C8 16 12 21 12 21" stroke="currentColor" strokeWidth="1" fill="none"/>
                  </svg>
                </span>
                <span>外观</span>
              </button>
              <button className={"nav-item" + (settingsTab === "security" ? " active" : "")} onClick={() => setSettingsTab("security")}>
                <span className="nav-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3L4 7V12C4 17 7 20 12 21C17 20 20 17 20 12V7L12 3Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  </svg>
                </span>
                <span>安全</span>
              </button>
              <button className={"nav-item" + (settingsTab === "agent" ? " active" : "")} onClick={() => setSettingsTab("agent")}>
                <span className="nav-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <path d="M6 20C6 16.7 8.7 14 12 14C15.3 14 18 16.7 18 20" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  </svg>
                </span>
                <span>Agent</span>
              </button>
              <button className={"nav-item" + (settingsTab === "advanced" ? " active" : "")} onClick={() => setSettingsTab("advanced")}>
                <span className="nav-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="1.2"/>
                    <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="1.2"/>
                    <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="1.2"/>
                    <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.2"/>
                    <line x1="4.5" y1="4.5" x2="6.5" y2="6.5" stroke="currentColor" strokeWidth="1.2"/>
                    <line x1="17.5" y1="17.5" x2="19.5" y2="19.5" stroke="currentColor" strokeWidth="1.2"/>
                    <line x1="4.5" y1="19.5" x2="6.5" y2="17.5" stroke="currentColor" strokeWidth="1.2"/>
                    <line x1="17.5" y1="6.5" x2="19.5" y2="4.5" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                </span>
                <span>高级</span>
              </button>
            </div>

            <div className="settings-content">
              {settingsTab === "model" && (
                <div className="settings-panel model-panel">
                  {/* 模型子标签: 主模型 / 辅助模型 / MoA */}
                  <div className="model-subtabs">
                    <button
                      className={"subtab" + (modelSubTab === "main" ? " active" : "")}
                      onClick={() => setModelSubTab("main")}
                    >
                      主模型
                    </button>
                    <button
                      className={"subtab" + (modelSubTab === "aux" ? " active" : "")}
                      onClick={() => setModelSubTab("aux")}
                    >
                      辅助模型
                    </button>
                    <button
                      className={"subtab" + (modelSubTab === "moa" ? " active" : "")}
                      onClick={() => setModelSubTab("moa")}
                    >
                      MoA
                    </button>
                  </div>

                  {modelSubTab === "main" && (
                  <div className="provider-banner">
                    <div className="provider-info">
                      <span className="provider-name">DeepSeek</span>
                      <span className="provider-sub">deepseek · DeepSeek · OpenAI 兼容格式</span>
                    </div>
                    <div className="provider-actions">
                      <span className="badge-saved">已保存密钥</span>
                      <button className="btn-goto">前往官网</button>
                    </div>
                  </div>
                  )}

                  {modelSubTab === "aux" && (
                  <div className="provider-banner">
                    <div className="provider-info">
                      <span className="provider-name">豆包 Doubao</span>
                      <span className="provider-sub">vision · 视觉辅助模型 · 火山方舟</span>
                    </div>
                    <div className="provider-actions">
                      <span className="badge-saved">已保存密钥</span>
                      <button className="btn-goto">前往官网</button>
                    </div>
                  </div>
                  )}

                  {modelSubTab === "moa" && (
                  <div className="provider-banner">
                    <div className="provider-info">
                      <span className="provider-name">MoA 混合代理</span>
                      <span className="provider-sub">多个模型协同 · 需要配置多个供应商</span>
                    </div>
                    <div className="provider-actions">
                      <span className="badge-saved">未启用</span>
                    </div>
                  </div>
                  )}

                  {/* ===== 主模型 配置区 ===== */}
                  {modelSubTab === "main" && (
                  <>
                  <div className="panel-section">
                    <div className="section-title">DEEPSEEK_API_KEY</div>
                    <input className="form-input full" type="password" defaultValue="sk-c ... 4aa6" />
                  </div>

                  <div className="panel-section">
                    <div className="section-title">Base URL</div>
                    <input className="form-input full" defaultValue="https://api.deepseek.com" />
                    <div className="form-hint">请求将发送到 https://api.deepseek.com/chat/completions</div>
                  </div>

                  <div className="panel-section">
                    <div className="section-title">模型</div>
                    <div className="model-row">
                      <select className="form-select flex1">
                        <option>deepseek-v4-pro</option>
                        <option>deepseek-v4-flash</option>
                        <option>deepseek-v3</option>
                      </select>
                      <button className="btn-refresh">刷新模型列表</button>
                    </div>
                  </div>

                  <div className="panel-section">
                    <div className="section-title">上下文窗口</div>
                    <input className="form-input full" defaultValue="自动" />
                    <div className="form-hint">
                      留空或填 0 使用该模型自动探测到的上下文窗口；本地/自建模型探测不准时可手动指定（单位 token）。该值会在「设为当前模型」时生效。
                    </div>
                    <div className="model-tags">
                      <span className="model-tag">deepseek-v4-flash</span>
                      <span className="model-tag">deepseek-v4-pro</span>
                    </div>
                  </div>

                  <div className="model-actions">
                    <button className="btn-save">保存配置</button>
                    <button className="btn-primary">设为当前模型</button>
                    <button className="btn-test">测试连接</button>
                  </div>
                  </>
                  )}

                  {/* ===== 辅助模型 配置区 ===== */}
                  {modelSubTab === "aux" && (
                  <>
                  <div className="panel-section">
                    <div className="section-title">豆包 API_KEY</div>
                    <input className="form-input full" type="password" defaultValue="ark-...c696-b0b3e" />
                    <div className="form-hint">用于视觉、压缩、会话搜索等辅助任务</div>
                  </div>

                  <div className="panel-section">
                    <div className="section-title">Base URL</div>
                    <input className="form-input full" defaultValue="https://ark.cn-beijing.volces.com/api/v3" />
                  </div>

                  <div className="panel-section">
                    <div className="section-title">模型</div>
                    <div className="model-row">
                      <select className="form-select flex1">
                        <option>ep-20260803161051-bqc5t (seed-2.0 mini)</option>
                        <option>ep-20260803151821-vgpm4</option>
                      </select>
                      <button className="btn-refresh">刷新模型列表</button>
                    </div>
                  </div>

                  <div className="model-actions">
                    <button className="btn-save">保存配置</button>
                    <button className="btn-test">测试连接</button>
                  </div>
                  </>
                  )}

                  {/* ===== MoA 混合代理 配置区 ===== */}
                  {modelSubTab === "moa" && (
                  <>
                  <div className="panel-section">
                    <div className="section-title">启用 MoA</div>
                    <div className="form-row">
                      <label>多模型协同</label>
                      <div className="form-switch"><span className="switch-dot"></span></div>
                    </div>
                    <div className="form-hint">MoA（Mixture-of-Agents）让多个模型各自思考再综合答案，通常能提升质量但更耗 token。</div>
                  </div>

                  <div className="panel-section">
                    <div className="section-title">参与模型</div>
                    <div className="form-row">
                      <label className="checkbox-row"><input type="checkbox" defaultChecked /> DeepSeek (主)</label>
                    </div>
                    <div className="form-row">
                      <label className="checkbox-row"><input type="checkbox" /> 豆包 Doubao</label>
                    </div>
                    <div className="form-row">
                      <label className="checkbox-row"><input type="checkbox" /> 待添加其他供应商</label>
                    </div>
                  </div>

                  <div className="model-actions">
                    <button className="btn-save">保存配置</button>
                  </div>
                  </>
                  )}


                  <div className="providers-section">
                    <div className="providers-header">
                      <div className="providers-title">
                        <div className="providers-main-title">预设供应商</div>
                        <div className="providers-sub">
                          管理国内模型服务商预设和 API Key。当前模型：deepseek-v4-flash (deepseek) · 已配置 1 个，自定义 0 个
                        </div>
                      </div>
                      <div className="providers-header-right">
                        <span className="providers-meta">提供商目录 2025.07.26.1</span>
                        <span className="providers-meta">已刷新预设 2025.07.26.1</span>
                        <input className="form-input search-input" placeholder="搜索模型平台…" />
                        <button className="btn-refresh">刷新预设</button>
                      </div>
                    </div>

                    <div className="provider-grid">
                      <div className="provider-card" data-provider="aliyun-bailian"><span className="card-logo logo-aliyun">云</span><span className="card-name">阿里云百炼 · API 按量付费</span></div>
                      <div className="provider-card" data-provider="aliyun-coding"><span className="card-logo logo-aliyun">云</span><span className="card-name">阿里云百炼 · Coding Plan</span></div>
                      <div className="provider-card" data-provider="baidu"><span className="card-logo logo-baidu">百</span><span className="card-name">百度智能云千帆</span></div>
                      <div className="provider-card" data-provider="siliconflow"><span className="card-logo logo-siliconflow">硅</span><span className="card-name">硅基流动 SiliconFlow</span></div>
                      <div className="provider-card" data-provider="volcengine-token"><span className="card-logo logo-volc">火</span><span className="card-name">火山方舟 · API 按量付费</span></div>
                      <div className="provider-card" data-provider="volcengine-coding"><span className="card-logo logo-volc">火</span><span className="card-name">火山方舟 · Coding Plan</span></div>
                      <div className="provider-card" data-provider="jieyue-token"><span className="card-logo logo-jieyue">阶</span><span className="card-name">阶跃星辰 · API 按量付费</span></div>
                      <div className="provider-card" data-provider="jieyue-step"><span className="card-logo logo-jieyue">阶</span><span className="card-name">阶跃星辰 · Step Plan</span></div>
                      <div className="provider-card" data-provider="modelscope"><span className="card-logo logo-modelscope">魔</span><span className="card-name">魔搭 ModelScope</span></div>
                      <div className="provider-card" data-provider="sensenova"><span className="card-logo logo-sensetime">商</span><span className="card-name">商汤日新 SenseNova</span></div>
                      <div className="provider-card" data-provider="hunyuan"><span className="card-logo logo-tencent">混</span><span className="card-name">腾讯混元</span></div>
                      <div className="provider-card" data-provider="mimo-token"><span className="card-logo logo-mimo">米</span><span className="card-name">小米 MiMo · API 按量付费</span></div>
                      <div className="provider-card" data-provider="mimo-plan"><span className="card-logo logo-mimo">米</span><span className="card-name">小米 MiMo · Token Plan</span></div>
                      <div className="provider-card" data-provider="yunwen-agent"><span className="card-logo logo-yunwen">云</span><span className="card-name">优云智算 · Agent Plan</span></div>
                      <div className="provider-card" data-provider="yunwen-token"><span className="card-logo logo-yunwen">云</span><span className="card-name">优云智算 · API 按量付费</span></div>
                      <div className="provider-card" data-provider="zhipu-token"><span className="card-logo logo-zhipu">智</span><span className="card-name">智谱 GLM · API 按量付费</span></div>
                      <div className="provider-card" data-provider="zhipu-coding"><span className="card-logo logo-zhipu">智</span><span className="card-name">智谱 GLM · Coding Plan</span></div>
                      <div className="provider-card starred" data-provider="aicode"><span className="card-logo logo-aicode">AI</span><span className="card-name">AICodeMirror</span><span className="card-badge claude">Claude</span><span className="card-star">★</span></div>
                      <div className="provider-card starred" data-provider="algocode"><span className="card-logo logo-algocode">Al</span><span className="card-name">AlGoCode</span><span className="card-badge claude">Claude</span><span className="card-star">★</span></div>
                      <div className="provider-card starred" data-provider="apikey"><span className="card-logo logo-apikey">AK</span><span className="card-name">APIKEY.FUN</span><span className="card-badge claude">Claude</span><span className="card-star">★</span></div>
                      <div className="provider-card starred" data-provider="ccsub"><span className="card-logo logo-ccsub">CC</span><span className="card-name">CCSub</span><span className="card-star">★</span></div>
                      <div className="provider-card starred" data-provider="cubence"><span className="card-logo logo-cubence">Cu</span><span className="card-name">Cubence</span><span className="card-badge claude">Claude</span><span className="card-star">★</span></div>
                      <div className="provider-card starred" data-provider="longcat"><span className="card-logo logo-longcat">Lo</span><span className="card-name">Longcat</span><span className="card-star">★</span></div>
                      <div className="provider-card starred" data-provider="micu"><span className="card-logo logo-micu">Mi</span><span className="card-name">Micu</span><span className="card-badge claude">Claude</span><span className="card-star">★</span></div>
                      <div className="provider-card starred" data-provider="nekocode"><span className="card-logo logo-nekocode">Ne</span><span className="card-name">NekoCode</span><span className="card-star">★</span></div>
                      <div className="provider-card starred" data-provider="packycode"><span className="card-logo logo-packy">Pk</span><span className="card-name">PackyCode</span><span className="card-badge claude">Claude</span><span className="card-star">★</span></div>
                      <div className="provider-card starred" data-provider="rightcode"><span className="card-logo logo-right">Rt</span><span className="card-name">RightCode</span><span className="card-star">★</span></div>
                      <div className="provider-card starred" data-provider="sssaicode"><span className="card-logo logo-sss">SS</span><span className="card-name">SSSAiCode</span><span className="card-badge claude">Claude</span><span className="card-star">★</span></div>
                      <div className="provider-card starred" data-provider="agnes"><span className="card-logo logo-agnes">Ag</span><span className="card-name">Agnes AI</span><span className="card-badge claude">Claude</span><span className="card-star">★</span></div>
                      <div className="provider-card starred" data-provider="anthropic"><span className="card-logo logo-anthropic">An</span><span className="card-name">Anthropic Claude</span><span className="card-badge claude">Claude</span><span className="card-star">★</span></div>
                      <div className="provider-card" data-provider="google"><span className="card-logo logo-google">G</span><span className="card-name">Google Gemini</span></div>
                      <div className="provider-card" data-provider="nvidia"><span className="card-logo logo-nvidia">N</span><span className="card-name">NVIDIA NIM</span></div>
                      <div className="provider-card" data-provider="openai"><span className="card-logo logo-openai">O</span><span className="card-name">OpenAI API</span><span className="card-badge codex">Codex</span></div>
                      <div className="provider-card" data-provider="opencode"><span className="card-logo logo-opencode">Go</span><span className="card-name">OpenCode Go</span></div>
                      <div className="provider-card" data-provider="openrouter"><span className="card-logo logo-openrouter">OR</span><span className="card-name">OpenRouter</span></div>
                      <div className="provider-card" data-provider="groq"><span className="card-logo logo-grok">X</span><span className="card-name">xAI Grok</span><span className="card-badge codex">Codex</span></div>
                      <div className="provider-card" data-provider="z-ai"><span className="card-logo logo-zai">Z</span><span className="card-name">Z.AI GLM · 国际版</span></div>
                    </div>

                    <div className="form-hint providers-footer">拖拽卡片可调整常用服务商顺序，排序保存到当前 Profile。</div>
                  </div>
                </div>
              )}

              {settingsTab === "voice" && (
                <div className="settings-panel">
                  <div className="panel-section">
                    <div className="section-title">TTS 语音</div>
                    <div className="form-row">
                      <label>Provider</label>
                      <select className="form-select"><option>edge</option><option>豆包</option></select>
                    </div>
                    <div className="form-row">
                      <label>语音角色</label>
                      <select className="form-select"><option>晓晓</option><option>晓伊</option></select>
                    </div>
                    <div className="form-row">
                      <label>自动朗读</label>
                      <div className="form-switch"><span className="switch-dot"></span></div>
                    </div>
                    <div className="form-row">
                      <label>提示音</label>
                      <div className="form-switch on"><span className="switch-dot"></span></div>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === "appearance" && (
                <div className="settings-panel">
                  <div className="panel-section">
                    <div className="section-title">外观</div>
                    <div className="form-row">
                      <label>皮肤</label>
                      <select className="form-select"><option>默认</option><option>深色</option></select>
                    </div>
                    <div className="form-row">
                      <label>语言</label>
                      <select className="form-select"><option>简体中文</option><option>English</option></select>
                    </div>
                    <div className="form-row">
                      <label>宠物</label>
                      <div className="form-switch"><span className="switch-dot"></span></div>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === "security" && (
                <div className="settings-panel">
                  <div className="panel-section">
                    <div className="section-title">安全</div>
                    <div className="form-row">
                      <label>密钥隐藏</label>
                      <div className="form-switch on"><span className="switch-dot"></span></div>
                    </div>
                    <div className="form-row">
                      <label>命令扫描 (Tirith)</label>
                      <div className="form-switch on"><span className="switch-dot"></span></div>
                    </div>
                    <div className="form-row">
                      <label>命令审批</label>
                      <select className="form-select"><option>智能</option><option>手动</option><option>关闭</option></select>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === "agent" && (
                <div className="settings-panel">
                  <div className="panel-section">
                    <div className="section-title">Agent 行为</div>
                    <div className="form-row">
                      <label>环境探测</label>
                      <div className="form-switch on"><span className="switch-dot"></span></div>
                    </div>
                    <div className="form-row">
                      <label>最大轮数</label>
                      <input className="form-input" type="number" defaultValue="50" />
                    </div>
                    <div className="form-row">
                      <label>工具/技能</label>
                      <select className="form-select"><option>全部启用</option><option>自定义</option></select>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === "advanced" && (
                <div className="settings-panel">
                  <div className="panel-section">
                    <div className="section-title">MCP 服务器</div>
                    <div className="form-row">
                      <label>cua-driver</label>
                      <div className="form-switch on"><span className="switch-dot"></span></div>
                    </div>
                    <div className="form-row">
                      <label>time</label>
                      <div className="form-switch on"><span className="switch-dot"></span></div>
                    </div>
                    <div className="form-row">
                      <label>blender</label>
                      <div className="form-switch"><span className="switch-dot"></span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

export default App;