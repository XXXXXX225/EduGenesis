import React from 'react';

export default function ConsoleView({
  activeConsoleAgent,
  setActiveConsoleAgent,
  agentLogs,
  goDashboardHome
}) {
  return (
    <>
      <header>
        <h2 style={{ fontSize: '24px', marginBottom: '4px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
          智能体协同控制台
          <a
            href="#"
            role="button"
            onClick={(e) => {
              e.preventDefault();
              goDashboardHome();
            }}
            style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--primary-neon)', cursor: 'pointer', opacity: 0.8, textDecoration: 'underline' }}
          >
            返回首页
          </a>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          多智能体协同网络运作后台。监控主管智能体、画像智能体、路径智能体与安全校验智能体的协作流向。
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginTop: '20px' }}>
        {/* Left Column: Visual Agent Topology Map */}
        <div className="cyber-card" style={{ padding: '28px', background: 'var(--bg-card-glass)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '1px solid var(--border-neon)', paddingBottom: '8px' }}>
            🕸️ 多智能体协同拓扑图
          </h3>

          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
            <svg width="400" height="300" viewBox="0 0 400 300">
              <line x1="200" y1="50" x2="100" y2="150" stroke="var(--primary-neon)" strokeWidth="2" strokeDasharray="5 5" style={{ strokeDashoffset: '10', animation: 'dash 10s linear infinite' }} />
              <line x1="200" y1="50" x2="300" y2="150" stroke="var(--primary-neon)" strokeWidth="2" strokeDasharray="5 5" style={{ strokeDashoffset: '10', animation: 'dash 10s linear infinite' }} />
              <line x1="100" y1="150" x2="200" y2="250" stroke="var(--primary-neon)" strokeWidth="2" strokeDasharray="5 5" style={{ strokeDashoffset: '10', animation: 'dash 10s linear infinite' }} />
              <line x1="300" y1="150" x2="200" y2="250" stroke="var(--primary-neon)" strokeWidth="2" strokeDasharray="5 5" style={{ strokeDashoffset: '10', animation: 'dash 10s linear infinite' }} />
              <line x1="200" y1="50" x2="200" y2="250" stroke="rgba(29, 78, 216, 0.3)" strokeWidth="1.5" strokeDasharray="3 3" />

              <g onClick={() => setActiveConsoleAgent('executive')} style={{ cursor: 'pointer' }}>
                <circle cx="200" cy="50" r="28" fill="#1e293b" stroke="var(--secondary)" strokeWidth="3" className="pulse-glow" />
                <text x="200" y="54" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800" fontFamily="sans-serif">主管</text>
              </g>

              <g onClick={() => setActiveConsoleAgent('profile')} style={{ cursor: 'pointer' }}>
                <circle cx="100" cy="150" r="28" fill="#1e293b" stroke={activeConsoleAgent === 'profile' ? 'var(--primary-neon)' : 'rgba(15, 118, 110, 0.4)'} strokeWidth="3" />
                <text x="100" y="154" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800" fontFamily="sans-serif">画像</text>
              </g>

              <g onClick={() => setActiveConsoleAgent('path')} style={{ cursor: 'pointer' }}>
                <circle cx="300" cy="150" r="28" fill="#1e293b" stroke={activeConsoleAgent === 'path' ? 'var(--primary-neon)' : 'rgba(15, 118, 110, 0.4)'} strokeWidth="3" />
                <text x="300" y="154" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800" fontFamily="sans-serif">路径</text>
              </g>

              <g onClick={() => setActiveConsoleAgent('security')} style={{ cursor: 'pointer' }}>
                <circle cx="200" cy="250" r="28" fill="#1e293b" stroke={activeConsoleAgent === 'security' ? 'var(--danger)' : 'rgba(190, 18, 60, 0.4)'} strokeWidth="3" />
                <text x="200" y="254" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800" fontFamily="sans-serif">安全</text>
              </g>
            </svg>
            <style>{`
              @keyframes dash {
                to {
                  stroke-dashoffset: -100;
                }
              }
            `}</style>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-neon)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary-neon)', marginBottom: '6px' }}>
              {activeConsoleAgent === 'executive' && "👑 主管智能体 (Executive Agent)"}
              {activeConsoleAgent === 'profile' && "📊 画像智能体 (Profile Agent)"}
              {activeConsoleAgent === 'path' && "📍 路径智能体 (Path Agent)"}
              {activeConsoleAgent === 'security' && "🛡️ 安全校验智能体 (Security Audit Agent)"}
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {activeConsoleAgent === 'executive' && "核心控制代理枢纽，负责调度协调用户意图。接收用户的对话命令并决定是否分发给画像智能体评估，或者指令路径智能体重新生成关卡。"}
              {activeConsoleAgent === 'profile' && "维护用户的6维动态画像，根据对话记录提取语义标签，并根据错题及测验提交数据，利用平滑差值函数调整认知指标，直接反馈给路径规划端。"}
              {activeConsoleAgent === 'path' && "自适应路径生成器。负责对用户的学习大纲进行动态编排，并在后台触发 `/resources` 生成机制，生成音画课件、测验习题与代码用例。"}
              {activeConsoleAgent === 'security' && "学术安全与幻觉防御智能屏障。采用专有对齐护栏，在资源生成与对话中防止幻觉和敏感词入侵，同时为用户提供单元测试用例的代码断言保护。"}
            </p>
          </div>
        </div>

        {/* Right Column: Live Logs Console */}
        <div className="cyber-card" style={{ padding: '28px', background: 'var(--bg-card-glass)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '1px solid var(--border-neon)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            💬 协同消息报文流
            <span className="pulsing-dot" style={{ display: 'inline-block' }}></span>
          </h3>

          <div className="console-logs-box" style={{ flexGrow: 1 }}>
            {agentLogs.map((log, idx) => (
              <div key={idx} style={{ marginBottom: '10px', borderBottom: '1px dashed rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                <span style={{ color: '#5c6370', marginRight: '6px' }}>[{log.time}]</span>
                <span style={{
                  color: log.sender === '主管智能体' ? 'var(--secondary)' :
                    log.sender === '画像智能体' ? 'var(--primary-neon)' :
                      log.sender === '安全校验智能体' ? 'var(--danger)' : 'var(--warning)',
                  fontWeight: '700',
                  marginRight: '6px'
                }}>
                  {log.sender}:
                </span>
                <span style={{ color: '#e2e8f0' }}>{log.log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
