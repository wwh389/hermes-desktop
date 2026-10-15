import { useState } from "react";
import "./voice.css";

type Voice = { name: string; gender: string; lang: string; tags: string[] };
type VoiceDB = Record<string, Voice[]>;

// TTS 供应商预设
const TTS_PROVIDERS = [
  { id: "edge", name: "Edge TTS", desc: "免费 · 本地", logo: "E", logoCls: "pl-edge", connected: false, note: "Edge TTS 需安装 edge-tts 依赖包，完全免费本地运行。若不可用请切换其他引擎。", fields: [{ key: "pythonPath", label: "Python 路径", placeholder: "默认自动检测" }, { key: "edgeTtsPath", label: "edge-tts 路径", placeholder: "默认自动检测" }] },
  { id: "doubao", name: "豆包 TTS", desc: "火山引擎 · 按量计费", logo: "豆", logoCls: "pl-doubao", connected: true, note: "豆包 TTS 由火山引擎提供，按量计费。", fields: [{ key: "apiKey", label: "API Key", placeholder: "填入豆包/火山引擎 API Key" }, { key: "endpoint", label: "Endpoint", placeholder: "https://openspeech.bytedance.com" }] },
  { id: "aliyun", name: "阿里通义", desc: "阿里云 · 免费额度", logo: "阿", logoCls: "pl-aliyun", connected: false, note: "阿里通义智能语音，需 AccessKey ID / Secret。", fields: [{ key: "accessKeyId", label: "AccessKey ID", placeholder: "" }, { key: "accessKeySecret", label: "AccessKey Secret", placeholder: "" }] },
  { id: "xunfei", name: "讯飞 TTS", desc: "科大讯飞 · 企业级", logo: "讯", logoCls: "pl-xunfei", connected: false, note: "讯飞在线语音合成，需 APPID 与 APIKey。", fields: [{ key: "appId", label: "APPID", placeholder: "" }, { key: "apiKey", label: "APIKey", placeholder: "" }] },
  { id: "volc", name: "火山引擎", desc: "字节跳动 · 丰富角色", logo: "火", logoCls: "pl-volc", connected: false, note: "火山引擎语音技术，与豆包共享账号体系。", fields: [{ key: "appId", label: "App ID", placeholder: "" }, { key: "accessToken", label: "Access Token", placeholder: "" }] },
  { id: "elevenlabs", name: "ElevenLabs", desc: "海外 · 高质量", logo: "E", logoCls: "pl-elevenlabs", connected: false, note: "ElevenLabs 支持多语言、声音克隆。需 API Key，有免费额度。云端处理，注意隐私。", fields: [{ key: "apiKey", label: "API Key", placeholder: "" }, { key: "baseUrl", label: "Base URL", placeholder: "https://api.elevenlabs.io" }] },
  { id: "system", name: "系统原生", desc: "离线 · 零配置", logo: "系", logoCls: "pl-system", connected: true, note: "使用操作系统内置语音合成引擎，完全离线，无需配置。", fields: [] },
];

// STT 引擎预设
const STT_PROVIDERS = [
  { id: "local", name: "本地 faster-whisper", desc: "免费 · 离线", logo: "本", logoCls: "pl-local", connected: true, note: "基于 faster-whisper 的本地语音识别，完全离线，无需 API Key。首次使用需安装依赖：pip install faster-whisper", fields: [{ key: "model", label: "模型大小", placeholder: "base（tiny/base/small/medium/large-v3）" }] },
  { id: "groq", name: "Groq Whisper", desc: "免费额度 · 云端", logo: "G", logoCls: "pl-groq", connected: false, note: "Groq 提供的免费 Whisper API，速度快，有免费额度。需设置 GROQ_API_KEY。", fields: [{ key: "apiKey", label: "GROQ_API_KEY", placeholder: "" }] },
  { id: "openai-stt", name: "OpenAI Whisper", desc: "付费 · 高精度", logo: "O", logoCls: "pl-openai", connected: false, note: "OpenAI 官方 Whisper API，精度最高，按量计费。需设置 VOICE_TOOLS_OPENAI_KEY。", fields: [{ key: "apiKey", label: "VOICE_TOOLS_OPENAI_KEY", placeholder: "" }] },
  { id: "mistral-stt", name: "Mistral Voxtral", desc: "付费 · 多语言", logo: "M", logoCls: "pl-mistral", connected: false, note: "Mistral 的 Voxtral 语音识别模型，支持多语言。需设置 MISTRAL_API_KEY。", fields: [{ key: "apiKey", label: "MISTRAL_API_KEY", placeholder: "" }] },
];

// 音色库
const VOICE_DB: VoiceDB = {
  edge: [
    { name: "晓晓", gender: "female", lang: "中文", tags: ["女声", "自然"] },
    { name: "晓伊", gender: "female", lang: "中文", tags: ["女声", "温柔"] },
    { name: "云扬", gender: "male", lang: "中文", tags: ["男声", "磁性"] },
    { name: "HiuMaan", gender: "female", lang: "粤语", tags: ["女声"] },
    { name: "Tingting", gender: "female", lang: "英文", tags: ["女声"] },
    { name: "Yunxi", gender: "male", lang: "英文", tags: ["男声"] },
  ],
  doubao: [
    { name: "豆包·晓晓", gender: "female", lang: "中文", tags: ["女声", "甜美"] },
    { name: "豆包·云泽", gender: "male", lang: "中文", tags: ["男声", "磁性"] },
    { name: "豆包·星辰", gender: "female", lang: "中文", tags: ["女声", "知性"] },
    { name: "豆包·团团", gender: "child", lang: "中文", tags: ["童声", "可爱"] },
  ],
  system: [
    { name: "Microsoft Huihui", gender: "female", lang: "中文", tags: ["系统默认"] },
    { name: "Microsoft Kangkang", gender: "male", lang: "中文", tags: [] },
    { name: "Samantha", gender: "female", lang: "English", tags: ["macOS"] },
    { name: "Alex", gender: "male", lang: "English", tags: ["macOS"] },
  ],
};

export default function VoiceSettings() {
  // 子标签: tts / stt
  const [subTab, setSubTab] = useState<"tts" | "stt">("tts");

  // ===== TTS 相关 =====
  const [ttsProvider, setTtsProvider] = useState("doubao");
  const [activeVoice, setActiveVoice] = useState<Voice | null>(VOICE_DB.doubao[0]);
  const [qtText, setQtText] = useState("你好，这是一段语音测试文本，当前语速适中，音调正常。");
  const [qtRate, setQtRate] = useState(1);
  const [modalTarget, setModalTarget] = useState<string | null>(null);
  const [qtStatus, setQtStatus] = useState("就绪");
  const [autoTts, setAutoTts] = useState(true);
  const [beepEnabled, setBeepEnabled] = useState(true);

  const ttsP = TTS_PROVIDERS.find((p) => p.id === ttsProvider) || TTS_PROVIDERS[0];

  function selectTtsProvider(id: string) {
    setTtsProvider(id);
    const p = TTS_PROVIDERS.find((x) => x.id === id);
    if (p && p.connected) {
      const voices = VOICE_DB[id] || [];
      setActiveVoice(voices[0] || null);
      setQtStatus(voices.length ? "就绪 · " + (voices[0]?.name || "") : "该供应商暂无可用音色");
    } else {
      setActiveVoice(null);
      setQtStatus("等待接入");
    }
  }

  // ===== STT 相关 =====
  const [sttEnabled, setSttEnabled] = useState(true);
  const [sttProvider, setSttProvider] = useState("local");
  const [sttModal, setSttModal] = useState<string | null>(null);

  const sttP = STT_PROVIDERS.find((p) => p.id === sttProvider) || STT_PROVIDERS[0];

  return (
    <div className="settings-panel voice-section">
      {/* 子标签切换 */}
      <div className="model-subtabs">
        <button className={"subtab" + (subTab === "tts" ? " active" : "")}
          onClick={() => setSubTab("tts")}>
          语音合成 (TTS)
        </button>
        <button className={"subtab" + (subTab === "stt" ? " active" : "")}
          onClick={() => setSubTab("stt")}>
          语音识别 (STT)
        </button>
      </div>

      {/* ===== TTS 页面 ===== */}
      {subTab === "tts" && (
        <>
          {/* 头部: 引擎状态 */}
          <div className="providers-header">
            <div className="providers-title">
              <div className="providers-main-title">语音合成引擎</div>
              <div className="providers-sub">选择 TTS 引擎并管理接入密钥</div>
            </div>
            <span className={"badge " + (ttsP.connected ? "ok" : "warn")}>
              {ttsP.connected ? "当前：" + ttsP.name + " · 已连接" : ttsP.name + " · 等待接入"}
            </span>
          </div>

          {/* 快捷开关 */}
          <div className="form-row" style={{ padding: "8px 0" }}>
            <label>自动朗读</label>
            <div className={"form-switch" + (autoTts ? " on" : "")}
              onClick={() => setAutoTts(!autoTts)}>
              <span className="switch-dot"></span>
            </div>
          </div>
          <div className="form-hint">AI 回复后自动播放语音</div>
          <div className="form-row" style={{ padding: "8px 0" }}>
            <label>提示音</label>
            <div className={"form-switch" + (beepEnabled ? " on" : "")}
              onClick={() => setBeepEnabled(!beepEnabled)}>
              <span className="switch-dot"></span>
            </div>
          </div>
          <div className="form-hint">收到消息时播放提示音</div>

          {/* Provider 卡片墙 */}
          <div className="providers" style={{ marginTop: 12 }}>
            {TTS_PROVIDERS.map((p) => (
              <div
                key={p.id}
                className={"provider-card" + (ttsProvider === p.id ? " selected" : "") + (p.connected ? " connected-card" : "")}
                onClick={() => selectTtsProvider(p.id)}
              >
                <span className={"status-dot " + (p.connected ? "connected" : "pending")}></span>
                <span className={"provider-logo " + p.logoCls}>{p.logo}</span>
                <div className="provider-info">
                  <div className="provider-name">{p.name}</div>
                  <div className="provider-desc">{p.desc}</div>
                </div>
                {!p.connected && (
                  <button className="connect-btn" onClick={(e) => { e.stopPropagation(); setModalTarget(p.id); }}>接入</button>
                )}
              </div>
            ))}
          </div>

          {/* 选中 provider 的说明 */}
          <div className={"provider-note show"}>
            <strong>{ttsP.name}</strong> · {ttsP.note}
          </div>

          {/* 音色网格 */}
          {(VOICE_DB[ttsProvider] || []).length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div className="providers-title">
                <div className="providers-main-title">音色</div>
                <div className="providers-sub">{ttsProvider} · {(VOICE_DB[ttsProvider] || []).length} 个音色</div>
              </div>
              <div className="voice-grid" style={{ marginTop: 8 }}>
                {(VOICE_DB[ttsProvider] || []).map((v) => (
                  <div
                    key={v.name}
                    className={"voice-card" + (activeVoice?.name === v.name ? " selected" : "")}
                    onClick={() => { setActiveVoice(v); setQtStatus("就绪 · " + v.name); }}
                  >
                    <div className="voice-top">
                      <div className={"voice-avatar " + v.gender}>{v.gender === "female" ? "♀" : v.gender === "male" ? "♂" : "♪"}</div>
                      <div>
                        <div className="voice-name">{v.name}</div>
                        <div className="voice-tags">
                          <span className="voice-tag lang">{v.lang}</span>
                          {v.tags.map((t) => <span key={t} className="voice-tag">{t}</span>)}
                        </div>
                      </div>
                    </div>
                    <div className="voice-play" title={"试听 " + v.name} onClick={(e) => { e.stopPropagation(); setQtText(v.name + "，这是一个试听示例。"); }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 快速试听条 */}
          <div style={{ marginTop: 20 }} className="quick-test">
            <span className="qt-label">QUICK TEST</span>
            <input className="form-input qt-input" value={qtText}
              onChange={e => setQtText(e.target.value)}
              placeholder="输入任意文字即时试听…" />
            <div className="slider-row">
              <label>语速</label>
              <input type="range" min="0.5" max="2" step="0.1" value={qtRate}
                onChange={e => setQtRate(parseFloat(e.target.value))} />
              <span className="value">{qtRate.toFixed(1)}</span>
            </div>
            <span className="qt-status-text">{qtStatus}</span>
            <button className="btn btn-primary btn-sm" onClick={() => setQtStatus("试听中… (演示)")}>播放</button>
          </div>

          {/* TTS 连接模态框 */}
          {modalTarget && (
            <div className="connect-modal-overlay show" onClick={() => setModalTarget(null)}>
              <div className="connect-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <div className={"modal-logo " + (TTS_PROVIDERS.find(p => p.id === modalTarget)?.logoCls || "")}>
                    {TTS_PROVIDERS.find(p => p.id === modalTarget)?.logo}
                  </div>
                  <div className="info">
                    <div className="name">{TTS_PROVIDERS.find(p => p.id === modalTarget)?.name}</div>
                    <div className="desc">接入配置</div>
                  </div>
                </div>
                <div className="modal-body">
                  {(() => {
                    const mp = TTS_PROVIDERS.find(p => p.id === modalTarget);
                    if (mp && mp.fields.length) {
                      return mp.fields.map(f => (
                        <div key={f.key} className="form-row">
                          <label>{f.label}</label>
                          <input className="form-input" placeholder={f.placeholder} />
                        </div>
                      ));
                    }
                    return <div className="form-hint">该引擎无需额外配置，点击连接即可使用。</div>;
                  })()}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-ghost" onClick={() => setModalTarget(null)}>取消</button>
                  <button className="btn btn-primary" onClick={() => setModalTarget(null)}>连接</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== STT 页面 ===== */}
      {subTab === "stt" && (
        <>
          <div className="providers-header">
            <div className="providers-title">
              <div className="providers-main-title">语音识别引擎</div>
              <div className="providers-sub">语音消息自动转文字，支持实时转写</div>
            </div>
            <span className={"badge " + (sttEnabled ? "ok" : "warn")}>
              {sttEnabled ? "已启用 · " + sttP.name : "已禁用"}
            </span>
          </div>

          <div className="form-row" style={{ padding: "8px 0" }}>
            <label>启用语音识别</label>
            <div className={"form-switch" + (sttEnabled ? " on" : "")}
              onClick={() => setSttEnabled(!sttEnabled)}>
              <span className="switch-dot"></span>
            </div>
          </div>
          <div className="form-hint">开启后，语音消息会自动转为文字再发送给 Agent</div>

          {sttEnabled && (
            <>
              {/* STT 引擎选择 */}
              <div style={{ marginTop: 16 }}>
                <div className="providers-title">
                  <div className="providers-main-title">识别引擎</div>
                </div>
                <div className="providers" style={{ marginTop: 8 }}>
                  {STT_PROVIDERS.map((p) => (
                    <div
                      key={p.id}
                      className={"provider-card" + (sttProvider === p.id ? " selected" : "") + (p.connected ? " connected-card" : "")}
                      onClick={() => setSttProvider(p.id)}
                    >
                      <span className={"status-dot " + (p.connected ? "connected" : "pending")}></span>
                      <span className={"provider-logo " + p.logoCls}>{p.logo}</span>
                      <div className="provider-info">
                        <div className="provider-name">{p.name}</div>
                        <div className="provider-desc">{p.desc}</div>
                      </div>
                      {!p.connected && (
                        <button className="connect-btn" onClick={(e) => { e.stopPropagation(); setSttModal(p.id); }}>接入</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 选中引擎说明 */}
              <div className={"provider-note show"} style={{ marginTop: 12 }}>
                <strong>{sttP.name}</strong> · {sttP.note}
              </div>

              {/* 引擎参数 */}
              {sttP.fields.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div className="panel-section">
                    <div className="section-title">引擎参数</div>
                    {sttP.fields.map(f => (
                      <div key={f.key} className="form-row">
                        <label>{f.label}</label>
                        <input className="form-input" placeholder={f.placeholder} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* STT 连接模态框 */}
          {sttModal && (
            <div className="connect-modal-overlay show" onClick={() => setSttModal(null)}>
              <div className="connect-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <div className={"modal-logo " + (STT_PROVIDERS.find(p => p.id === sttModal)?.logoCls || "")}>
                    {STT_PROVIDERS.find(p => p.id === sttModal)?.logo}
                  </div>
                  <div className="info">
                    <div className="name">{STT_PROVIDERS.find(p => p.id === sttModal)?.name}</div>
                    <div className="desc">接入配置</div>
                  </div>
                </div>
                <div className="modal-body">
                  {(() => {
                    const mp = STT_PROVIDERS.find(p => p.id === sttModal);
                    if (mp && mp.fields.length) {
                      return mp.fields.map(f => (
                        <div key={f.key} className="form-row">
                          <label>{f.label}</label>
                          <input className="form-input" type="password" placeholder={f.placeholder} />
                        </div>
                      ));
                    }
                    return <div className="form-hint">该引擎无需额外配置，点击连接即可使用。</div>;
                  })()}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-ghost" onClick={() => setSttModal(null)}>取消</button>
                  <button className="btn btn-primary" onClick={() => setSttModal(null)}>连接</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
