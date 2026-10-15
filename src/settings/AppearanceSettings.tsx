// 外观设置
export default function AppearanceSettings() {
  return (
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
  );
}
