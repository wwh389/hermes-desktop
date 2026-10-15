import { useState, useEffect } from "react";

type Provider = {
  id: string;
  name: string;
  logo: string;
  category: "domestic" | "international" | "custom";
  starred: boolean;
  badge?: string;
};

type ModelConfig = {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  models: string[];
};

export default function ModelSettings() {
  const [modelSubTab, setModelSubTab] = useState<"main" | "aux" | "moa">("main");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [mainModelConfig, setMainModelConfig] = useState<ModelConfig>({
    provider: "",
    apiKey: "",
    baseUrl: "",
    model: "",
    models: []
  });
  const [auxModelConfig, setAuxModelConfig] = useState<ModelConfig>({
    provider: "",
    apiKey: "",
    baseUrl: "",
    model: "",
    models: []
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadProviders() {
      try {
        setLoading(true);
        const response = await fetch('/api/providers');
        if (response.ok) {
          const data = await response.json();
          setProviders(data);
        } else {
          console.error('Failed to load providers');
        }
      } catch (error) {
        console.error('Error loading providers:', error);
      } finally {
        setLoading(false);
      }
    }

    async function loadModelConfigs() {
      try {
        const [mainResponse, auxResponse] = await Promise.all([
          fetch('/api/model-config/main'),
          fetch('/api/model-config/aux')
        ]);

        if (mainResponse.ok) {
          const data = await mainResponse.json();
          setMainModelConfig(data);
        }

        if (auxResponse.ok) {
          const data = await auxResponse.json();
          setAuxModelConfig(data);
        }
      } catch (error) {
        console.error('Error loading model configs:', error);
      }
    }

    loadProviders();
    loadModelConfigs();
  }, []);

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const domesticProviders = filteredProviders.filter(p => p.category === "domestic");
  const customProviders = filteredProviders.filter(p => p.category === "custom");
  const internationalProviders = filteredProviders.filter(p => p.category === "international");

  return (
    <div className="settings-panel model-panel">
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
        <>
          <div className="provider-banner">
            <div className="provider-info">
              <span className="provider-name">{mainModelConfig.provider || '未配置'}</span>
              <span className="provider-sub">
                {mainModelConfig.model || '未选择模型'} · {mainModelConfig.baseUrl || '未配置 Base URL'}
              </span>
            </div>
            <div className="provider-actions">
              <span className="badge-saved">{mainModelConfig.apiKey ? '已保存密钥' : '未配置'}</span>
              <button className="btn-goto">前往官网</button>
            </div>
          </div>

          <div className="panel-section">
            <div className="section-title">API Key</div>
            <input
              className="form-input full"
              type="password"
              placeholder="输入 API Key..."
              value={mainModelConfig.apiKey}
              onChange={(e) => setMainModelConfig(prev => ({ ...prev, apiKey: e.target.value }))}
            />
          </div>

          <div className="panel-section">
            <div className="section-title">Base URL</div>
            <input
              className="form-input full"
              placeholder="https://api.example.com"
              value={mainModelConfig.baseUrl}
              onChange={(e) => setMainModelConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
            />
            <div className="form-hint">
              请求将发送到 {mainModelConfig.baseUrl || '[未配置]'} /chat/completions
            </div>
          </div>

          <div className="panel-section">
            <div className="section-title">模型</div>
            <div className="model-row">
              <select
                className="form-select flex1"
                value={mainModelConfig.model}
                onChange={(e) => setMainModelConfig(prev => ({ ...prev, model: e.target.value }))}
              >
                <option value="">选择模型...</option>
                {mainModelConfig.models.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
              <button className="btn-refresh">刷新模型列表</button>
            </div>
          </div>

          <div className="model-actions">
            <button className="btn-save">保存配置</button>
            <button className="btn-primary">设为当前模型</button>
            <button className="btn-test">测试连接</button>
          </div>
        </>
      )}

      {modelSubTab === "aux" && (
        <>
          <div className="provider-banner">
            <div className="provider-info">
              <span className="provider-name">{auxModelConfig.provider || '未配置'}</span>
              <span className="provider-sub">
                {auxModelConfig.model || '未选择模型'} · 视觉辅助模型
              </span>
            </div>
            <div className="provider-actions">
              <span className="badge-saved">{auxModelConfig.apiKey ? '已保存密钥' : '未配置'}</span>
              <button className="btn-goto">前往官网</button>
            </div>
          </div>

          <div className="panel-section">
            <div className="section-title">API Key</div>
            <input
              className="form-input full"
              type="password"
              placeholder="输入辅助模型 API Key..."
              value={auxModelConfig.apiKey}
              onChange={(e) => setAuxModelConfig(prev => ({ ...prev, apiKey: e.target.value }))}
            />
            <div className="form-hint">用于视觉、压缩、会话搜索等辅助任务</div>
          </div>

          <div className="panel-section">
            <div className="section-title">Base URL</div>
            <input
              className="form-input full"
              placeholder="https://api.example.com"
              value={auxModelConfig.baseUrl}
              onChange={(e) => setAuxModelConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
            />
          </div>

          <div className="panel-section">
            <div className="section-title">模型</div>
            <div className="model-row">
              <select
                className="form-select flex1"
                value={auxModelConfig.model}
                onChange={(e) => setAuxModelConfig(prev => ({ ...prev, model: e.target.value }))}
              >
                <option value="">选择模型...</option>
                {auxModelConfig.models.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
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

      {modelSubTab === "moa" && (
        <>
          <div className="provider-banner">
            <div className="provider-info">
              <span className="provider-name">MoA 混合代理</span>
              <span className="provider-sub">多个模型协同 · 需要配置多个供应商</span>
            </div>
            <div className="provider-actions">
              <span className="badge-saved">未启用</span>
            </div>
          </div>

          <div className="panel-section">
            <div className="section-title">启用 MoA</div>
            <div className="form-row">
              <label>多模型协同</label>
              <div className="form-switch"><span className="switch-dot"></span></div>
            </div>
            <div className="form-hint">
              MoA（Mixture-of-Agents）让多个模型各自思考再综合答案，通常能提升质量但更耗 token。
            </div>
          </div>

          <div className="panel-section">
            <div className="section-title">参与模型</div>
            <div className="form-row">
              <label className="checkbox-row">
                <input type="checkbox" defaultChecked /> {mainModelConfig.provider || '主模型'}
              </label>
            </div>
            <div className="form-row">
              <label className="checkbox-row">
                <input type="checkbox" /> {auxModelConfig.provider || '辅助模型'}
              </label>
            </div>
            <div className="form-row">
              <label className="checkbox-row">
                <input type="checkbox" /> 待添加其他供应商
              </label>
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
              管理国内模型服务商预设和 API Key。
              当前模型：{mainModelConfig.model || '未配置'} ({mainModelConfig.provider || '未配置'})
              · 已配置 {domesticProviders.length + internationalProviders.length} 个，自定义 {customProviders.length} 个
            </div>
          </div>
          <div className="providers-header-right">
            <input
              className="form-input search-input"
              placeholder="搜索模型平台..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn-refresh">刷新预设</button>
          </div>
        </div>

        {loading ? (
          <div className="form-hint" style={{ padding: '40px 0', textAlign: 'center' }}>
            正在加载供应商列表...
          </div>
        ) : (
          <div className="provider-grid">
            {domesticProviders.map((provider) => (
              <div key={provider.id} className={`provider-card ${provider.starred ? 'starred' : ''}`} data-provider={provider.id}>
                <span className={`card-logo logo-${provider.id}`}>{provider.logo}</span>
                <span className="card-name">{provider.name}</span>
                {provider.badge && <span className={`card-badge ${provider.badge.toLowerCase()}`}>{provider.badge}</span>}
                {provider.starred && <span className="card-star">★</span>}
              </div>
            ))}

            {customProviders.map((provider) => (
              <div key={provider.id} className={`provider-card starred ${provider.starred ? 'starred' : ''}`} data-provider={provider.id}>
                <span className={`card-logo logo-${provider.id}`}>{provider.logo}</span>
                <span className="card-name">{provider.name}</span>
                {provider.badge && <span className={`card-badge ${provider.badge.toLowerCase()}`}>{provider.badge}</span>}
                {provider.starred && <span className="card-star">★</span>}
              </div>
            ))}

            {internationalProviders.map((provider) => (
              <div key={provider.id} className={`provider-card ${provider.starred ? 'starred' : ''}`} data-provider={provider.id}>
                <span className={`card-logo logo-${provider.id}`}>{provider.logo}</span>
                <span className="card-name">{provider.name}</span>
                {provider.badge && <span className={`card-badge ${provider.badge.toLowerCase()}`}>{provider.badge}</span>}
                {provider.starred && <span className="card-star">★</span>}
              </div>
            ))}
          </div>
        )}

        <div className="form-hint providers-footer">
          拖拽卡片可调整常用服务商顺序，排序保存到当前 Profile。
        </div>
      </div>
    </div>
  );
}