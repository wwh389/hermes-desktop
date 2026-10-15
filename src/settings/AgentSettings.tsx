import { useState } from "react";

export default function AgentSettings() {
  // === 基础行为 ===
  const [envProbe, setEnvProbe] = useState(true);
  const [maxTurns, setMaxTurns] = useState(90);
  const [toolEnforcement, setToolEnforcement] = useState("auto");

  // === 上下文压缩 ===
  const [compressionEnabled, setCompressionEnabled] = useState(true);
  const [compressionThreshold, setCompressionThreshold] = useState(50);
  const [compressionTarget, setCompressionTarget] = useState(20);

  // === 子代理 (Delegation) ===
  const [maxIterations, setMaxIterations] = useState(50);
  const [maxConcurrent, setMaxConcurrent] = useState(3);
  const [reasoningEffort, setReasoningEffort] = useState("medium");
  const [spawnDepth, setSpawnDepth] = useState(1);

  // === 文件快照 (Checkpoints) ===
  const [checkpointsEnabled, setCheckpointsEnabled] = useState(true);
  const [maxSnapshots, setMaxSnapshots] = useState(50);

  // === 终端 ===
  const [termBackend, setTermBackend] = useState("local");
  const [termTimeout, setTermTimeout] = useState(180);

  return (
    <div className="settings-panel agent-panel">

      {/* ===== 基础行为 ===== */}
      <div className="panel-section">
        <div className="section-title">基础行为</div>
        <div className="form-row">
          <label>环境探测</label>
          <div className={"form-switch" + (envProbe ? " on" : "")}
            onClick={() => setEnvProbe(!envProbe)}>
            <span className="switch-dot"></span>
          </div>
        </div>
        <div className="form-hint">自动检测操作系统、Shell、Python 版本等环境信息注入上下文</div>

        <div className="form-row">
          <label>最大轮数</label>
          <input className="form-input" type="number" min={1} max={500}
            value={maxTurns}
            onChange={e => setMaxTurns(parseInt(e.target.value) || 1)} />
        </div>
        <div className="form-hint">单次对话最大工具调用轮次，超过后 Agent 自动停止</div>

        <div className="form-row">
          <label>工具执行策略</label>
          <select className="form-select" value={toolEnforcement}
            onChange={e => setToolEnforcement(e.target.value)}>
            <option value="auto">自动 — Agent 自行决定何时调用工具</option>
            <option value="force">强制 — 必须通过工具完成任务</option>
            <option value="lenient">宽松 — 优先文本回答，工具作为备选</option>
          </select>
        </div>
      </div>

      {/* ===== 上下文压缩 ===== */}
      <div className="panel-section">
        <div className="section-title">上下文压缩</div>
        <div className="form-row">
          <label>启用压缩</label>
          <div className={"form-switch" + (compressionEnabled ? " on" : "")}
            onClick={() => setCompressionEnabled(!compressionEnabled)}>
            <span className="switch-dot"></span>
          </div>
        </div>
        <div className="form-hint">当对话接近上下文窗口上限时，自动压缩历史消息以腾出空间</div>

        {compressionEnabled && (
          <>
            <div className="form-row">
              <label>触发阈值</label>
              <div className="slider-group">
                <input type="range" min={20} max={80} step={5}
                  value={compressionThreshold}
                  onChange={e => setCompressionThreshold(parseInt(e.target.value))} />
                <span className="slider-value">{compressionThreshold}%</span>
              </div>
            </div>
            <div className="form-hint">当已用 token 超过上下文窗口的 {compressionThreshold}% 时触发压缩</div>

            <div className="form-row">
              <label>目标压缩比</label>
              <div className="slider-group">
                <input type="range" min={5} max={50} step={5}
                  value={compressionTarget}
                  onChange={e => setCompressionTarget(parseInt(e.target.value))} />
                <span className="slider-value">{compressionTarget}%</span>
              </div>
            </div>
            <div className="form-hint">压缩后目标保留比例，越低越激进（可能丢失细节）</div>
          </>
        )}
      </div>

      {/* ===== 子代理 (Delegation) ===== */}
      <div className="panel-section">
        <div className="section-title">子代理 (Delegation)</div>
        <div className="form-hint">子代理是 Agent 派生的独立工作进程，用于并行处理子任务</div>

        <div className="form-row">
          <label>最大迭代次数</label>
          <input className="form-input" type="number" min={1} max={200}
            value={maxIterations}
            onChange={e => setMaxIterations(parseInt(e.target.value) || 1)} />
        </div>
        <div className="form-hint">单个子代理的最大工具调用次数（默认 50）</div>

        <div className="form-row">
          <label>最大并发数</label>
          <input className="form-input" type="number" min={1} max={10}
            value={maxConcurrent}
            onChange={e => setMaxConcurrent(parseInt(e.target.value) || 1)} />
        </div>
        <div className="form-hint">同时运行的子代理上限（默认 3）</div>

        <div className="form-row">
          <label>嵌套深度</label>
          <input className="form-input" type="number" min={0} max={5}
            value={spawnDepth}
            onChange={e => setSpawnDepth(parseInt(e.target.value))} />
        </div>
        <div className="form-hint">子代理是否可以再派生子代理（0 = 禁止嵌套）</div>

        <div className="form-row">
          <label>推理强度</label>
          <select className="form-select" value={reasoningEffort}
            onChange={e => setReasoningEffort(e.target.value)}>
            <option value="none">关闭 — 不使用推理</option>
            <option value="minimal">最小 — 快速简单推理</option>
            <option value="low">低</option>
            <option value="medium">中等 — 平衡速度与质量</option>
            <option value="high">高 — 深度推理</option>
            <option value="xhigh">极高 — 最强推理（最慢）</option>
          </select>
        </div>
        <div className="form-hint">子代理的推理投入程度，越高越准但越慢越贵</div>
      </div>

      {/* ===== 文件快照 (Checkpoints) ===== */}
      <div className="panel-section">
        <div className="section-title">文件快照 (Checkpoints)</div>
        <div className="form-row">
          <label>启用快照</label>
          <div className={"form-switch" + (checkpointsEnabled ? " on" : "")}
            onClick={() => setCheckpointsEnabled(!checkpointsEnabled)}>
            <span className="switch-dot"></span>
          </div>
        </div>
        <div className="form-hint">在执行文件修改前自动创建快照，支持 /rollback 回滚</div>

        {checkpointsEnabled && (
          <div className="form-row">
            <label>最大快照数</label>
            <input className="form-input" type="number" min={5} max={200}
              value={maxSnapshots}
              onChange={e => setMaxSnapshots(parseInt(e.target.value) || 5)} />
          </div>
        )}
      </div>

      {/* ===== 终端 ===== */}
      <div className="panel-section">
        <div className="section-title">终端</div>
        <div className="form-row">
          <label>后端类型</label>
          <select className="form-select" value={termBackend}
            onChange={e => setTermBackend(e.target.value)}>
            <option value="local">本地 — 直接在本机执行</option>
            <option value="docker">Docker — 隔离容器执行</option>
            <option value="ssh">SSH — 远程服务器执行</option>
          </select>
        </div>
        <div className="form-hint">命令执行环境，Docker/SSH 适合危险操作隔离</div>

        <div className="form-row">
          <label>命令超时（秒）</label>
          <input className="form-input" type="number" min={10} max={3600}
            value={termTimeout}
            onChange={e => setTermTimeout(parseInt(e.target.value) || 10)} />
        </div>
        <div className="form-hint">单条命令最长执行时间，超时自动终止</div>
      </div>
    </div>
  );
}
