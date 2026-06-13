import React from 'react';
import { useAppContext } from '../../context/AppContext';

export default function ConsoleView() {
  const {
    activeConsoleAgent,
    setActiveConsoleAgent,
    agentLogs,
    goDashboardHome
  } = useAppContext();
  return (
    <>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px', color: 'var(--text-main)' }}>
          ⚙️ 智能体协同控制台
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0, lineHeight: '1.4' }}>
          多智能体协同网络运作后台。监控协作流向。
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        {/* Visual Agent Topology Map */}
        <div className="cyber-card" style={{ padding: '12px 14px', background: 'var(--bg-card-glass)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '12.5px', fontWeight: '800', borderBottom: '1px solid var(--border-neon)', paddingBottom: '6px', margin: 0 }}>
            🕸️ 智能体协同拓扑图
          </h4>

          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
            <svg width="100%" height="200" viewBox="0 0 400 300" style={{ maxWidth: '260px' }}>
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

          <div style={{ background: 'rgba(0,0,0,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-neon)' }}>
            <h5 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary-neon)', margin: '0 0 4px 0' }}>
              {activeConsoleAgent === 'executive' && "👑 主管智能体 (Executive Agent)"}
              {activeConsoleAgent === 'profile' && "📊 画像智能体 (Profile Agent)"}
              {activeConsoleAgent === 'path' && "📍 路径智能体 (Path Agent)"}
              {activeConsoleAgent === 'security' && "🛡️ 安全校验智能体 (Security Audit Agent)"}
            </h5>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
              {activeConsoleAgent === 'executive' && "核心控制代理枢纽，负责调度协调用户意图。指令路径和评估画像。"}
              {activeConsoleAgent === 'profile' && "维护用户的6维画像，根据对话语义和做题数据，微调认知指标。"}
              {activeConsoleAgent === 'path' && "路径生成器。负责对大纲进行动态编排，并指令资源生成模块运作。"}
              {activeConsoleAgent === 'security' && "防御智能护栏。防止幻觉和敏感词，同时提供代码断言保护。"}
            </p>
          </div>
        </div>

        {/* Live Logs Console */}
        <div className="cyber-card" style={{ padding: '12px 14px', background: 'var(--bg-card-glass)', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontSize: '12.5px', fontWeight: '800', borderBottom: '1px solid var(--border-neon)', paddingBottom: '6px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0 }}>
            💬 消息报文流
            <span className="pulsing-dot" style={{ display: 'inline-block' }}></span>
          </h4>

          <div className="console-logs-box" style={{ flexGrow: 1, maxHeight: '220px', overflowY: 'auto', fontSize: '10.5px', fontFamily: 'monospace' }}>
            {agentLogs.map((log, idx) => (
              <div key={idx} style={{ marginBottom: '8px', borderBottom: '1px dashed rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                <span style={{ color: '#5c6370', marginRight: '4px' }}>[{log.time}]</span>
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
