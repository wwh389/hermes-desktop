import { useState, useEffect } from "react";

// ===== 类型定义 =====
type McpServer = { name: string; enabled: boolean; desc: string; tools: string[] };
type SkillItem = { name: string; version: string; desc: string; enabled: boolean; source: "hermes" | "installed" | "marketplace"; category?: string; categoryEn?: string; skillId: string; fullDesc?: string; markdown?: string };
type MarketSite = { name: string; domain: string; desc: string; detail: string; url: string };
type MemoryEntry = { key: string; value: string };
type CronJob = { id: string; name: string; cron: string; running: boolean };

export default function AdvancedSettings() {
  // ===== 子标签切换 =====
  const [subTab, setSubTab] = useState<"mcp" | "memory" | "skills" | "terminal" | "cron" | "about">("mcp");

  // ===== MCP 服务器状态 =====
  const [mcpServers, setMcpServers] = useState<McpServer[]>([]);
  const [新名称, set新名称] = useState("");
  const [新命令, set新命令] = useState("");
  const [mcpLoading, setMcpLoading] = useState(true);

  // ===== 记忆状态 =====
  const [跨会话记忆, set跨会话记忆] = useState(true);
  const [用户画像, set用户画像] = useState(true);
  const [记忆提供者, set记忆提供者] = useState("内置");
  const [记忆列表, set记忆列表] = useState<MemoryEntry[]>([]);
  const [新记忆Key, set新记忆Key] = useState("");
  const [新记忆Value, set新记忆Value] = useState("");
  const [memoryLoading, setMemoryLoading] = useState(true);

  // ===== 技能状态 =====
  const [skillSubTab, setSkillSubTab] = useState<"builtin" | "installed" | "market">("builtin");
  const [技能搜索, set技能搜索] = useState("");
  const [选中技能, set选中技能] = useState<SkillItem | null>(null);
  const [技能列表, set技能列表] = useState<SkillItem[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [自动归档, set自动归档] = useState(false);
  const [归档周期, set归档周期] = useState(30);
  const [市场网站列表, set市场网站列表] = useState<MarketSite[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);

  // ===== 终端状态 =====
  const [后端类型, set后端类型] = useState("本地");
  const [命令超时, set命令超时] = useState(180);
  const [工作目录, set工作目录] = useState("");
  const [PTY模式, setPTY模式] = useState(true);
  const [terminalLoading, setTerminalLoading] = useState(true);

  // ===== 定时任务状态 =====
  const [调度器运行, set调度器运行] = useState(true);
  const [任务列表, set任务列表] = useState<CronJob[]>([]);
  const [cronLoading, setCronLoading] = useState(true);

  // ===== 关于页面状态 =====
  const [应用版本, set应用版本] = useState("");
  const [内核版本, set内核版本] = useState("");
  const [配置路径, set配置路径] = useState("");
  const [日志路径, set日志路径] = useState("");
  const [aboutLoading, setAboutLoading] = useState(true);

  // ===== 动态数据加载 =====
  useEffect(() => {
    async function loadMcpServers() {
      try {
        setMcpLoading(true);
        const response = await fetch('/api/mcp-servers');
        if (response.ok) {
          const data = await response.json();
          setMcpServers(data);
        } else {
          console.error('Failed to load MCP servers');
        }
      } catch (error) {
        console.error('Error loading MCP servers:', error);
      } finally {
        setMcpLoading(false);
      }
    }

    async function loadMemory() {
      try {
        setMemoryLoading(true);
        const response = await fetch('/api/memory');
        if (response.ok) {
          const data = await response.json();
          set记忆列表(data);
        } else {
          console.error('Failed to load memory');
        }
      } catch (error) {
        console.error('Error loading memory:', error);
      } finally {
        setMemoryLoading(false);
      }
    }

    async function loadSkills() {
      try {
        setSkillsLoading(true);
        const response = await fetch('/api/skills');
        if (response.ok) {
          const data = await response.json();
          set技能列表(data);
        } else {
          console.error('Failed to load skills');
        }
      } catch (error) {
        console.error('Error loading skills:', error);
      } finally {
        setSkillsLoading(false);
      }
    }

    async function loadMarketSites() {
      try {
        setMarketLoading(true);
        const response = await fetch('/api/market-sites');
        if (response.ok) {
          const data = await response.json();
          set市场网站列表(data);
        } else {
          console.error('Failed to load market sites');
        }
      } catch (error) {
        console.error('Error loading market sites:', error);
      } finally {
        setMarketLoading(false);
      }
    }

    async function loadTerminalConfig() {
      try {
        setTerminalLoading(true);
        const response = await fetch('/api/terminal-config');
        if (response.ok) {
          const data = await response.json();
          if (data.workDir) set工作目录(data.workDir);
          if (data.backendType) set后端类型(data.backendType);
          if (data.timeout) set命令超时(data.timeout);
          if (data.ptyMode !== undefined) setPTY模式(data.ptyMode);
        } else {
          console.error('Failed to load terminal config');
        }
      } catch (error) {
        console.error('Error loading terminal config:', error);
      } finally {
        setTerminalLoading(false);
      }
    }

    async function loadCronJobs() {
      try {
        setCronLoading(true);
        const response = await fetch('/api/cron-jobs');
        if (response.ok) {
          const data = await response.json();
          set任务列表(data.jobs || []);
          if (data.schedulerRunning !== undefined) set调度器运行(data.schedulerRunning);
        } else {
          console.error('Failed to load cron jobs');
        }
      } catch (error) {
        console.error('Error loading cron jobs:', error);
      } finally {
        setCronLoading(false);
      }
    }

    async function loadAboutInfo() {
      try {
        setAboutLoading(true);
        const response = await fetch('/api/about');
        if (response.ok) {
          const data = await response.json();
          if (data.version) set应用版本(data.version);
          if (data.kernelVersion) set内核版本(data.kernelVersion);
          if (data.configPath) set配置路径(data.configPath);
          if (data.logPath) set日志路径(data.logPath);
        } else {
          console.error('Failed to load about info');
        }
      } catch (error) {
        console.error('Error loading about info:', error);
      } finally {
        setAboutLoading(false);
      }
    }

    loadMcpServers();
    loadMemory();
    loadSkills();
    loadMarketSites();
    loadTerminalConfig();
    loadCronJobs();
    loadAboutInfo();
  }, []);

  // ===== 计算属性 =====
  const 内置统计 = 技能列表.filter(s => s.source === "hermes").length;
  const 已安装统计 = 技能列表.filter(s => s.source === "installed").length;

  // ===== MCP 操作 =====
  const 切换MCP启用 = (idx: number) => {
    setMcpServers(prev => prev.map((s, i) => i === idx ? { ...s, enabled: !s.enabled } : s));
  };

  const 添加MCP = () => {
    if (!新名称.trim() || !新命令.trim()) return;
    setMcpServers(prev => [...prev, { name: 新名称.trim(), enabled: true, desc: "手动添加", tools: [] }]);
    set新名称("");
    set新命令("");
  };

  const 删除MCP = (idx: number) => {
    setMcpServers(prev => prev.filter((_, i) => i !== idx));
  };

  // ===== 记忆操作 =====
  const 添加记忆 = () => {
    if (!新记忆Key.trim() || !新记忆Value.trim()) return;
    set记忆列表(prev => [...prev, { key: 新记忆Key.trim(), value: 新记忆Value.trim() }]);
    set新记忆Key("");
    set新记忆Value("");
  };

  const 删除记忆 = (idx: number) => {
    set记忆列表(prev => prev.filter((_, i) => i !== idx));
  };

  // ===== 技能操作 =====
  const 切换技能启用 = (skillId: string) => {
    set技能列表(prev => prev.map(s => s.skillId === skillId ? { ...s, enabled: !s.enabled } : s));
    if (选中技能?.skillId === skillId) {
      set选中技能(prev => prev ? { ...prev, enabled: !prev.enabled } : null);
    }
  };

  const 当前列表 = 技能列表.filter(s =>
    (skillSubTab === "builtin" && s.source === "hermes") ||
    (skillSubTab === "installed" && s.source === "installed")
  ).filter(s => {
    if (!技能搜索) return true;
    return s.name.includes(技能搜索) || s.desc.includes(技能搜索);
  });

  // ===== 定时任务操作 =====
  const 切换任务状态 = (idx: number) => {
    set任务列表(prev => prev.map((t, i) => i === idx ? { ...t, running: !t.running } : t));
  };

  const 删除任务 = (idx: number) => {
    set任务列表(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="settings-panel advanced-panel">
      {/* ===== 子标签切换 ===== */}
      <div className="model-subtabs">
        <button className={"subtab" + (subTab === "mcp" ? " active" : "")} onClick={() => setSubTab("mcp")}>MCP 服务器</button>
        <button className={"subtab" + (subTab === "memory" ? " active" : "")} onClick={() => setSubTab("memory")}>记忆</button>
        <button className={"subtab" + (subTab === "skills" ? " active" : "")} onClick={() => setSubTab("skills")}>技能</button>
        <button className={"subtab" + (subTab === "terminal" ? " active" : "")} onClick={() => setSubTab("terminal")}>终端</button>
        <button className={"subtab" + (subTab === "cron" ? " active" : "")} onClick={() => setSubTab("cron")}>定时任务</button>
        <button className={"subtab" + (subTab === "about" ? " active" : "")} onClick={() => setSubTab("about")}>关于</button>
      </div>

      {/* ===== 子标签 1：MCP 服务器 ===== */}
      {subTab === "mcp" && (
        <>
          <div className="panel-section">
            <div className="section-title">已配置服务器</div>
            {mcpLoading ? (
              <div className="form-hint">正在加载 MCP 服务器...</div>
            ) : mcpServers.length === 0 ? (
              <div className="form-hint">暂无已配置的 MCP 服务器</div>
            ) : (
              mcpServers.map((server, idx) => (
              <div key={server.name} style={{ marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="form-row">
                  <label style={{ fontWeight: 500 }}>{server.name}</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 12, padding: "2px 8px" }}
                      onClick={() => 删除MCP(idx)}>删除</button>
                    <div className={"form-switch" + (server.enabled ? " on" : "")}
                      onClick={() => 切换MCP启用(idx)}>
                      <span className="switch-dot"></span>
                    </div>
                  </div>
                </div>
                <div className="form-hint" style={{ marginTop: 2 }}>{server.desc}</div>
                {server.tools.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
                    暴露工具：{server.tools.map(t => <code key={t} style={{ marginRight: 6, background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 3 }}>{t}</code>)}
                  </div>
                )}
              </div>
            )))}
          </div>

          <div className="panel-section">
            <div className="section-title">添加 MCP 服务器</div>
            <div className="form-row">
              <label>名称</label>
              <input className="form-input" placeholder="如 my-server" value={新名称}
                onChange={e => set新名称(e.target.value)} />
            </div>
            <div className="form-row">
              <label>启动命令</label>
              <input className="form-input" placeholder="如 npx -y @example/mcp-server" value={新命令}
                onChange={e => set新命令(e.target.value)} />
            </div>
            <div className="form-row">
              <label></label>
              <button className="btn btn-primary btn-sm" onClick={添加MCP}>+ 添加</button>
            </div>
          </div>
        </>
      )}

      {/* ===== 子标签 2：记忆 ===== */}
      {subTab === "memory" && (
        <>
          <div className="panel-section">
            <div className="section-title">记忆设置</div>
            <div className="form-row">
              <label>跨会话记忆</label>
              <div className={"form-switch" + (跨会话记忆 ? " on" : "")}
                onClick={() => set跨会话记忆(!跨会话记忆)}>
                <span className="switch-dot"></span>
              </div>
            </div>
            <div className="form-hint">允许 Agent 在新会话中使用之前积累的记忆</div>

            <div className="form-row">
              <label>用户画像</label>
              <div className={"form-switch" + (用户画像 ? " on" : "")}
                onClick={() => set用户画像(!用户画像)}>
                <span className="switch-dot"></span>
              </div>
            </div>
            <div className="form-hint">自动学习用户偏好、习惯、环境信息</div>

            <div className="form-row">
              <label>记忆提供者</label>
              <select className="form-select" value={记忆提供者}
                onChange={e => set记忆提供者(e.target.value)}>
                <option value="内置">内置 — 本地文件存储</option>
                <option value="Honcho">Honcho — 云端记忆服务</option>
                <option value="Mem0">Mem0 — 向量记忆引擎</option>
              </select>
            </div>
            <div className="form-hint">当前提供者：{记忆提供者}</div>
          </div>

          <div className="panel-section">
            <div className="section-title">查看 / 编辑记忆</div>
            {memoryLoading ? (
              <div className="form-hint">正在加载记忆数据...</div>
            ) : 记忆列表.length === 0 ? (
              <div className="form-hint">暂无记忆条目</div>
            ) : (
              记忆列表.map((entry, idx) => (
              <div key={idx} className="form-row" style={{ alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 500, fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{entry.key}</span>
                  <span style={{ margin: "0 8px", color: "rgba(255,255,255,0.3)" }}>→</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{entry.value}</span>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ fontSize: 12, padding: "2px 8px", flexShrink: 0 }}
                  onClick={() => 删除记忆(idx)}>删除</button>
              </div>
            )))}

            <div style={{ marginTop: 12 }}>
              <div className="form-row">
                <label>Key</label>
                <input className="form-input" placeholder="记忆键" value={新记忆Key}
                  onChange={e => set新记忆Key(e.target.value)} />
              </div>
              <div className="form-row">
                <label>Value</label>
                <input className="form-input" placeholder="记忆值" value={新记忆Value}
                  onChange={e => set新记忆Value(e.target.value)} />
              </div>
              <div className="form-row">
                <label></label>
                <button className="btn btn-primary btn-sm" onClick={添加记忆}>添加记忆</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===== 子标签 3：技能 ===== */}
      {subTab === "skills" && (
        <>
          {/* 技能三标签 */}
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 16 }}>
            <button onClick={() => { setSkillSubTab("builtin"); set选中技能(null); }}
              style={{ padding: "8px 16px", fontSize: 13, color: skillSubTab === "builtin" ? "#fff" : "rgba(255,255,255,0.5)",
                background: "none", border: "none", borderBottom: skillSubTab === "builtin" ? "2px solid #fff" : "2px solid transparent",
                cursor: "pointer", transition: "all 0.2s" }}>
              <span style={{ marginRight: 6 }}>⚙</span> 内置 Skills
              <span style={{ marginLeft: 6, fontSize: 11, background: "rgba(255,255,255,0.08)", padding: "1px 6px", borderRadius: 4 }}>{内置统计}</span>
            </button>
            <button onClick={() => { setSkillSubTab("installed"); set选中技能(null); }}
              style={{ padding: "8px 16px", fontSize: 13, color: skillSubTab === "installed" ? "#fff" : "rgba(255,255,255,0.5)",
                background: "none", border: "none", borderBottom: skillSubTab === "installed" ? "2px solid #fff" : "2px solid transparent",
                cursor: "pointer", transition: "all 0.2s" }}>
              <span style={{ marginRight: 6 }}>👤</span> 我的 Skills
              <span style={{ marginLeft: 6, fontSize: 11, background: "rgba(255,255,255,0.08)", padding: "1px 6px", borderRadius: 4 }}>{已安装统计}</span>
            </button>
            <button onClick={() => { setSkillSubTab("market"); set选中技能(null); }}
              style={{ padding: "8px 16px", fontSize: 13, color: skillSubTab === "market" ? "#fff" : "rgba(255,255,255,0.5)",
                background: "none", border: "none", borderBottom: skillSubTab === "market" ? "2px solid #fff" : "2px solid transparent",
                cursor: "pointer", transition: "all 0.2s" }}>
              <span style={{ marginRight: 6 }}>🛒</span> Skill 市场
            </button>
            <div style={{ flex: 1 }}></div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "10px 12px" }}>
              {skillSubTab !== "market" ? `内置 Skill 由 Hermes 团队维护，仅可启用 / 禁用` : "精选 Skill 市场与目录，点击卡片会在外部浏览器打开"}
            </div>
          </div>

          {/* ===== 内置 / 我的 Skills：左右分栏 ===== */}
          {(skillSubTab === "builtin" || skillSubTab === "installed") && (
            <div style={{ display: "flex", gap: 20, minHeight: 400 }}>
              {/* 左侧列表 */}
              <div style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", gap: 0 }}>
                <input className="form-input" placeholder="搜索 Skill 名 / 描述..."
                  value={技能搜索}
                  onChange={e => set技能搜索(e.target.value)}
                  style={{ marginBottom: 8 }} />
                <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4,
                    background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>
                    全部 {当前列表.length}
                  </span>
                  <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4,
                    background: "rgba(74,222,128,0.1)", color: "#4ade80" }}>
                    已启用 {当前列表.filter(s => s.enabled).length}
                  </span>
                  <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4,
                    background: "rgba(248,113,113,0.1)", color: "#f87171" }}>
                    已禁用 {当前列表.filter(s => !s.enabled).length}
                  </span>
                </div>
                <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
                  {/* 按分类分组显示 */}
                  {[...new Set(当前列表.map(s => s.category))].map(cat => {
                    const catSkills = 当前列表.filter(s => s.category === cat);
                    if (catSkills.length === 0) return null;
                    return (
                      <div key={cat} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1,
                          marginBottom: 6, paddingBottom: 4, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          {cat} {catSkills[0].categoryEn?.toUpperCase()}
                          <span style={{ marginLeft: 6, fontWeight: 400 }}>{catSkills.length}</span>
                        </div>
                        {catSkills.map(skill => (
                          <div key={skill.skillId}
                            onClick={() => set选中技能(skill)}
                            style={{
                              display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 2,
                              borderRadius: 6, cursor: "pointer", transition: "all 0.15s",
                              background: 选中技能?.skillId === skill.skillId ? "rgba(255,255,255,0.08)" : "transparent",
                              border: 选中技能?.skillId === skill.skillId ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent"
                            }}>
                            <span style={{
                              width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                              background: skill.enabled ? "#4ade80" : "rgba(255,255,255,0.15)"
                            }}></span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {skill.name}
                                {skill.source === "hermes" && (
                                  <span style={{ marginLeft: 6, fontSize: 10, color: "rgba(167,139,250,0.7)" }}>内置</span>
                                )}
                              </div>
                              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {skill.skillId}
                              </div>
                            </div>
                            <div className={"form-switch" + (skill.enabled ? " on" : "")}
                              onClick={(e) => { e.stopPropagation(); 切换技能启用(skill.skillId); }}
                              style={{ transform: "scale(0.75)", flexShrink: 0 }}>
                              <span className="switch-dot"></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                  {skillsLoading ? (
                    <div className="form-hint" style={{ textAlign: "center", paddingTop: 40 }}>
                      正在加载技能列表...
                    </div>
                  ) : 当前列表.length === 0 && (
                    <div className="form-hint" style={{ textAlign: "center", paddingTop: 40 }}>
                      {技能搜索 ? "没有匹配的 Skill" : "暂无 Skill"}
                    </div>
                  )}
                </div>
              </div>

              {/* 右侧详情面板 */}
              <div style={{ flex: 1, minWidth: 0, background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)", padding: 20 }}>
                {!选中技能 ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 300, color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
                    ← 选择一个 Skill 查看详情
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>{选中技能.name}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                          <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4,
                            background: 选中技能.source === "hermes" ? "rgba(167,139,250,0.15)" : "rgba(74,222,128,0.15)",
                            color: 选中技能.source === "hermes" ? "#a78bfa" : "#4ade80" }}>
                            {选中技能.source === "hermes" ? "内置" : "已安装"}
                          </span>
                          <span style={{ fontSize: 12, color: 选中技能.enabled ? "#4ade80" : "rgba(255,255,255,0.35)" }}>
                            ● {选中技能.enabled ? "已启用" : "已禁用"}
                          </span>
                          {选中技能.categoryEn && (
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                              类目 · {选中技能.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(选中技能.skillId)}>
                          📋 复制 ID
                        </button>
                        {选中技能.enabled ? (
                          <button className="btn btn-sm" style={{ fontSize: 12, color: "#f87171", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}
                            onClick={() => 切换技能启用(选中技能.skillId)}>禁用</button>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => 切换技能启用(选中技能.skillId)}>启用</button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "10px 14px",
                      background: "rgba(255,255,255,0.03)", borderRadius: 6, borderLeft: "3px solid rgba(167,139,250,0.5)" }}>
                      <span style={{ fontSize: 18 }}>🔒</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                        {选中技能.fullDesc || `这是 ${选中技能.source === "hermes" ? "Hermes 内置" : "用户安装"} Skill。${选中技能.source === "hermes" ? "只能启用 / 禁用，不能修改。" : "可以自定义配置。"}`}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 16px", fontSize: 12, marginBottom: 20 }}>
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>原文 ID</span>
                      <span><code style={{ color: "rgba(255,255,255,0.65)" }}>{选中技能.skillId}</code></span>
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>类目</span>
                      <span>{选中技能.categoryEn || "-"} <span style={{ color: "rgba(255,255,255,0.3)" }}>{选中技能.category}</span></span>
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>来源</span>
                      <span>{选中技能.source === "hermes" ? "Hermes" : "用户"} · {选中技能.source === "hermes" ? "内置" : "本地"}</span>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>说明</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>由 Hermes 中文社区维护翻译</span>
                      </div>
                      <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 8, fontSize: 13,
                        lineHeight: 1.8, color: "rgba(220,230,245,0.85)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        {选中技能.desc}
                      </div>
                      {选中技能.markdown && (
                        <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
                          ✎ 中文版基于 SKILL.md description 字段翻译。完整 SKILL.md 内容请到来源目录查看。
                        </div>
                      )}
                    </div>

                    {选中技能.markdown && (
                      <div style={{ marginTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>SKILL.MD</span>
                          <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(选中技能.markdown!)}>
                            📋 复制 Markdown
                          </button>
                        </div>
                        <pre style={{ padding: "14px 16px", background: "rgba(0,0,0,0.25)", borderRadius: 8, fontSize: 12,
                          lineHeight: 1.7, color: "rgba(200,215,240,0.75)", overflowX: "auto", maxHeight: 200, overflowY: "auto",
                          border: "1px solid rgba(255,255,255,0.04)" }}>
                          {选中技能.markdown}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ===== Skill 市场：网站推荐卡片 ===== */}
          {skillSubTab === "market" && (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#60a5fa", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                  Skill Market
                </div>
                <h3 style={{ margin: 0, fontSize: 26, fontWeight: 700, marginBottom: 10 }}>好用的 Skill 去哪找？</h3>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
                  下面几个网站适合用来找 Skill：有的像精选书单，帮你先筛一遍；有的像搜索引擎，适合按场景慢慢淘。
                  找到合适的 Skill 后，可以按对方页面说明安装到当前 Hermes 环境。
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {marketLoading ? (
                  <div className="form-hint" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 0" }}>
                    正在加载市场网站...
                  </div>
                ) : (
                  市场网站列表.map(site => (
                  <div key={site.name} style={{
                    padding: "20px 24px", background: "rgba(255,255,255,0.03)", borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.07)", transition: "border-color 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                      <h4 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{site.name}</h4>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{site.domain}</span>
                    </div>
                    <p style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 500, color: "rgba(220,230,245,0.9)" }}>
                      {site.desc}
                    </p>
                    <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
                      {site.detail}
                    </p>
                    <a href={site.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "#60a5fa", textDecoration: "none", fontWeight: 500 }}>
                      去{site.name}{site.name === "虾评" ? "逛逛" : site.name === "SkillHub" ? "看精选" : site.name === "Skills.sh" ? "" : ""} ↗
                    </a>
                  </div>
                )))}
              </div>
            </>
          )}

          {/* 自动归档（仅在 builtin/installed 显示） */}
          {(skillSubTab === "builtin" || skillSubTab === "installed") && (
            <div className="panel-section" style={{ marginTop: 16 }}>
              <div className="section-title">自动归档</div>
              <div className="form-row">
                <label>自动归档</label>
                <div className={"form-switch" + (自动归档 ? " on" : "")}
                  onClick={() => set自动归档(!自动归档)}>
                  <span className="switch-dot"></span>
                </div>
              </div>
              <div className="form-hint">标记长时间未使用的技能为过期</div>
              {自动归档 && (
                <div className="form-row">
                  <label>归档周期（天）</label>
                  <input className="form-input" type="number" min={1} max={365}
                    value={归档周期}
                    onChange={e => set归档周期(parseInt(e.target.value) || 1)} />
                </div>
              )}
            </div>
          )}

          <div className="panel-section">
            <button className="btn btn-ghost" onClick={() => {}}>刷新技能列表</button>
          </div>
        </>
      )}

      {/* ===== 子标签 4：终端 ===== */}
      {subTab === "terminal" && (
        <div className="panel-section">
          <div className="section-title">终端配置</div>
          <div className="form-row">
            <label>后端类型</label>
            <select className="form-select" value={后端类型}
              onChange={e => set后端类型(e.target.value)}>
              <option value="本地">本地 — 直接在本机执行</option>
              <option value="Docker">Docker — 隔离容器执行</option>
              <option value="SSH">SSH — 远程服务器执行</option>
            </select>
          </div>
          <div className="form-hint">命令执行环境，Docker/SSH 适合危险操作隔离</div>

          <div className="form-row">
            <label>命令超时（秒）</label>
            <input className="form-input" type="number" min={10} max={3600}
              value={命令超时}
              onChange={e => set命令超时(parseInt(e.target.value) || 10)} />
          </div>
          <div className="form-hint">单条命令最长执行时间，超时自动终止</div>

          <div className="form-row">
            <label>工作目录</label>
            <input className="form-input" placeholder={terminalLoading ? "正在加载..." : "默认工作目录"} value={工作目录}
              onChange={e => set工作目录(e.target.value)} disabled={terminalLoading} />
          </div>

          <div className="form-row">
            <label>PTY 模式</label>
            <div className={"form-switch" + (PTY模式 ? " on" : "")}
              onClick={() => setPTY模式(!PTY模式)}>
              <span className="switch-dot"></span>
            </div>
          </div>
          <div className="form-hint">为交互式 CLI 工具启用伪终端</div>
        </div>
      )}

      {/* ===== 子标签 5：定时任务 ===== */}
      {subTab === "cron" && (
        <>
          <div className="panel-section">
            <div className="section-title">
              调度器状态
              <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 400,
                color: 调度器运行 ? "#4ade80" : "rgba(255,255,255,0.4)" }}>
                ● {调度器运行 ? "运行中" : "已停止"}
              </span>
            </div>
            <div className="form-row">
              <label>调度器</label>
              <div className={"form-switch" + (调度器运行 ? " on" : "")}
                onClick={() => set调度器运行(!调度器运行)}>
                <span className="switch-dot"></span>
              </div>
            </div>
          </div>

          <div className="panel-section">
            <div className="section-title">任务列表</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}>
                  <th style={{ textAlign: "left", padding: "6px 0", fontWeight: 500 }}>名称</th>
                  <th style={{ textAlign: "left", padding: "6px 12px", fontWeight: 500 }}>调度表达式</th>
                  <th style={{ textAlign: "left", padding: "6px 12px", fontWeight: 500 }}>状态</th>
                  <th style={{ textAlign: "right", padding: "6px 0", fontWeight: 500 }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {cronLoading ? (
                  <tr><td colSpan={4} style={{ padding: "12px 0", color: "rgba(255,255,255,0.35)", textAlign: "center" }}>正在加载定时任务...</td></tr>
                ) : 任务列表.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: "12px 0", color: "rgba(255,255,255,0.35)" }}>暂无定时任务</td></tr>
                )}
                {任务列表.map((job, idx) => (
                  <tr key={job.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "8px 0" }}>{job.name}</td>
                    <td style={{ padding: "8px 12px" }}><code style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{job.cron}</code></td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ fontSize: 12, color: job.running ? "#4ade80" : "rgba(255,255,255,0.35)" }}>
                        {job.running ? "运行中" : "已暂停"}
                      </span>
                    </td>
                    <td style={{ padding: "8px 0", textAlign: "right" }}>
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 12, marginRight: 6 }}
                        onClick={() => 切换任务状态(idx)}>
                        {job.running ? "暂停" : "启用"}
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 12, color: "#f87171" }}
                        onClick={() => 删除任务(idx)}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-primary btn-sm">创建任务</button>
            </div>
          </div>
        </>
      )}

      {/* ===== 子标签 6：关于 ===== */}
      {subTab === "about" && (
        <>
          <div className="panel-section">
            <div className="section-title">应用信息</div>
            {aboutLoading ? (
              <div style={{ padding: "16px 0", color: "rgba(255,255,255,0.35)" }}>正在加载应用信息...</div>
            ) : (
              <>
                <div style={{ padding: "16px 0" }}>
                  <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>My Chat</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                    {应用版本 || "v0.1.0"}{内核版本 ? ` · Hermes 内核 ${内核版本}` : ""}
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => {}}>检查更新</button>
              </>
            )}
          </div>

          <div className="panel-section">
            <div className="section-title">路径信息</div>
            {aboutLoading ? (
              <div style={{ color: "rgba(255,255,255,0.35)" }}>正在加载路径信息...</div>
            ) : (
              <>
                <div className="form-row">
                  <label>配置路径</label>
                  <input className="form-input" readOnly value={配置路径 || "加载中..."}
                    style={{ color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.04)" }} />
                </div>
                <div className="form-row">
                  <label>日志路径</label>
                  <input className="form-input" readOnly value={日志路径 || "加载中..."}
                    style={{ color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.04)" }} />
                </div>
              </>
            )}
          </div>

          <div className="panel-section">
            <div className="section-title">开源信息</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
              本项目基于 MIT License 开源
            </div>
            <div style={{ marginTop: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => {}}>GitHub ↗</button>
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.8 }}>
              致谢：React · Tauri · Vite · 以及所有开源贡献者
            </div>
          </div>
        </>
      )}
    </div>
  );
}