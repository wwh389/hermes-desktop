import { useState } from "react";

type BlockedSite = { id: string; domain: string; reason: string };
type DangerousCmd = { id: string; pattern: string; risk: "high" | "medium" | "low" };

export default function SecuritySettings() {
  const [redactSecrets, setRedactSecrets] = useState(true);
  const [redactPII, setRedactPII] = useState(true);

  const [approvalMode, setApprovalMode] = useState("smart");
  const [dangerousCommands, setDangerousCommands] = useState<DangerousCmd[]>([
    { id: "c1", pattern: "rm -rf /", risk: "high" },
    { id: "c2", pattern: "format C:", risk: "high" },
    { id: "c3", pattern: "chmod 777 /etc", risk: "medium" },
    { id: "c4", pattern: "sudo shutdown", risk: "medium" },
    { id: "c5", pattern: "del /s /q", risk: "medium" },
  ]);

  const [tirithEnabled, setTirithEnabled] = useState(true);
  const [tirithTimeout, setTirithTimeout] = useState(5);
  const [tirithFailOpen, setTirithFailOpen] = useState(false);

  const [blocklist, setBlocklist] = useState<BlockedSite[]>([
    { id: "b1", domain: "facebook.com", reason: "社交媒体" },
    { id: "b2", domain: "twitter.com", reason: "社交媒体" },
    { id: "b3", domain: "gambling.com", reason: "赌博" },
  ]);

  const [writeSnapshots, setWriteSnapshots] = useState(true);
  const [memoryEnabled, setMemoryEnabled] = useState(true);

  const [newDomain, setNewDomain] = useState("");

  const removeBlocked = (id: string) =>
    setBlocklist(prev => prev.filter(b => b.id !== id));

  const addBlocked = () => {
    if (!newDomain.trim()) return;
    setBlocklist(prev => [...prev, {
      id: "b" + Date.now(),
      domain: newDomain.trim(),
      reason: "手动添加"
    }]);
    setNewDomain("");
  };

  const removeDangerCmd = (id: string) =>
    setDangerousCommands(prev => prev.filter(c => c.id !== id));

  return (
    <div className="settings-panel security-panel">

      <div className="panel-section">
        <div className="section-title">密钥保护</div>
        <div className="form-row">
          <label>密钥脱敏</label>
          <div className={"form-switch" + (redactSecrets ? " on" : "")} onClick={() => setRedactSecrets(!redactSecrets)}>
            <span className="switch-dot"></span>
          </div>
        </div>
        <div className="form-hint">在日志和会话历史中自动遮蔽 API Key、密码等敏感信息</div>
        <div className="form-row">
          <label>PII 脱敏</label>
          <div className={"form-switch" + (redactPII ? " on" : "")} onClick={() => setRedactPII(!redactPII)}>
            <span className="switch-dot"></span>
          </div>
        </div>
        <div className="form-hint">自动识别并打码身份证号、手机号、邮箱等隐私信息</div>
      </div>

      <div className="panel-section">
        <div className="section-title">命令审批</div>
        <div className="form-row">
          <label>审批模式</label>
          <select className="form-select" value={approvalMode} onChange={e => setApprovalMode(e.target.value)}>
            <option value="manual">手动 — 每条命令都需人工确认</option>
            <option value="smart">智能 — 低风险自动放行，高风险拦截</option>
            <option value="off">关闭 — 所有命令直接执行（不推荐）</option>
          </select>
        </div>
        <div className="form-hint">当前模式：{approvalMode === "manual" ? "手动" : approvalMode === "smart" ? "智能" : "关闭"}</div>

        <div className="danger-cmd-list">
          <div className="sub-label">高危命令拦截列表</div>
          {dangerousCommands.length === 0 && <div className="form-hint">暂无高危命令规则</div>}
          {dangerousCommands.map(c => (
            <div key={c.id} className="danger-cmd-item">
              <span className="cmd-pattern">{c.pattern}</span>
              <span className={"cmd-risk risk-" + c.risk}>{c.risk === "high" ? "高危" : c.risk === "medium" ? "中危" : "低危"}</span>
              <button className="btn-remove" onClick={() => removeDangerCmd(c.id)}>移除</button>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <div className="section-title">Tirith 扫描</div>
        <div className="form-row">
          <label>命令预扫描</label>
          <div className={"form-switch" + (tirithEnabled ? " on" : "")} onClick={() => setTirithEnabled(!tirithEnabled)}>
            <span className="switch-dot"></span>
          </div>
        </div>
        <div className="form-row">
          <label>扫描超时（秒）</label>
          <input className="form-input" type="number" min={1} max={60} value={tirithTimeout}
            onChange={e => setTirithTimeout(parseInt(e.target.value) || 1)} />
        </div>
        <div className="form-row">
          <label>扫描失败策略</label>
          <select className="form-select" value={tirithFailOpen ? "fail_open" : "fail_closed"}
            onChange={e => setTirithFailOpen(e.target.value === "fail_open")}>
            <option value="fail_closed">拦截 — 扫描失败时不放行</option>
            <option value="fail_open">放行 — 扫描失败时仍允许执行</option>
          </select>
        </div>
      </div>

      <div className="panel-section">
        <div className="section-title">网站黑名单</div>
        <div className="form-hint">阻止 Agent 访问以下网站</div>
        <div className="blocklist-add">
          <input className="form-input" placeholder="输入域名，如 example.com" value={newDomain}
            onChange={e => setNewDomain(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addBlocked(); }} />
          <button className="btn-refresh" onClick={addBlocked}>添加</button>
        </div>
        <div className="blocklist">
          {blocklist.length === 0 && <div className="form-hint">黑名单为空</div>}
          {blocklist.map(b => (
            <div key={b.id} className="blocklist-item">
              <span className="blocklist-domain">{b.domain}</span>
              <span className="blocklist-reason">{b.reason}</span>
              <button className="btn-remove" onClick={() => removeBlocked(b.id)}>移除</button>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <div className="section-title">会话安全</div>
        <div className="form-row">
          <label>会话写入 JSON 快照</label>
          <div className={"form-switch" + (writeSnapshots ? " on" : "")} onClick={() => setWriteSnapshots(!writeSnapshots)}>
            <span className="switch-dot"></span>
          </div>
        </div>
        <div className="form-hint">每次会话结束时自动保存一份 JSON 快照，用于审计和回放</div>
        <div className="form-row">
          <label>跨会话记忆</label>
          <div className={"form-switch" + (memoryEnabled ? " on" : "")} onClick={() => setMemoryEnabled(!memoryEnabled)}>
            <span className="switch-dot"></span>
          </div>
        </div>
        <div className="form-hint">允许 Agent 在新会话中使用之前积累的记忆</div>
      </div>
    </div>
  );
}