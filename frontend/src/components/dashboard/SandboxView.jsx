import React from 'react';
import { useAppContext } from '../../context/AppContext';

export default function SandboxView() {
  const {
    setProfile,
    goDashboardHome,
    sandbox: {
      sandboxChallenge,
      sandboxAIAdvice,
      sandboxCode,
      setSandboxCode,
      isSandboxRunning,
      sandboxTerminal,
      runSandboxTest,
      diagnoseSandboxCode
    }
  } = useAppContext();
  return (
    <>
      <header>
        <h2 style={{ fontSize: '24px', marginBottom: '4px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
          自适应 AI 编程沙盒
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
          免本地环境，即时运行并验证学术用例。系统将根据您的当前关卡提供对应的编码挑战。
        </p>
      </header>

      <div className="sandbox-layout" style={{ marginTop: '20px' }}>
        {/* Left Panel: Instructions */}
        <div className="cyber-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card-glass)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '1px solid var(--border-neon)', paddingBottom: '8px', color: 'var(--primary-neon)' }}>
            📖 任务详情与要求
          </h3>
          <div style={{ fontSize: '13.5px', color: 'var(--text-main)', lineHeight: '1.6', flexGrow: 1, overflowY: 'auto' }}>
            {sandboxChallenge ? (
              <>
                <p style={{ marginBottom: '12px', fontWeight: '700' }}>题目：{sandboxChallenge.title}</p>
                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)', fontSize: '13px' }}>
                  {sandboxChallenge.description}
                </div>
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>正在为您的当前关卡装载学术编程挑战...</p>
            )}
          </div>

          {/* AI Advice Display */}
          {sandboxAIAdvice && (
            <div style={{ padding: '12px', background: 'rgba(15, 118, 110, 0.05)', borderLeft: '3px solid var(--primary-neon)', borderRadius: '0 8px 8px 0', fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.5' }}>
              <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--primary-neon)' }}>💡 AI 诊断建议：</strong>
              {sandboxAIAdvice}
            </div>
          )}
        </div>

        {/* Right Panel: Editor + Terminal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Editor Container */}
          <div className="code-editor-wrapper" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="code-editor-header">
              <span style={{ fontSize: '12px', color: '#8e8e9f', fontFamily: 'monospace', fontWeight: '700' }}>main.py (Python 3.10)</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={diagnoseSandboxCode}
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#ffffff', padding: '6px 12px', cursor: 'pointer', fontSize: '11px' }}
                >
                  🤖 AI 智能诊断
                </button>
                <button
                  type="button"
                  disabled={isSandboxRunning}
                  onClick={() => runSandboxTest(setProfile)}
                  className="cyber-btn"
                  style={{ padding: '6px 16px', fontSize: '11px', textTransform: 'none', background: 'linear-gradient(135deg, var(--primary-neon) 0%, var(--success) 100%)', boxShadow: 'none' }}
                >
                  {isSandboxRunning ? "测试中..." : "▶ 运行测试"}
                </button>
              </div>
            </div>

            <div className="code-editor-body">
              <div className="code-editor-gutter">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <span key={n}>{n}</span>)}
              </div>
              <textarea
                value={sandboxCode}
                onChange={(e) => setSandboxCode(e.target.value)}
                className="code-editor-textarea"
                spellCheck="false"
              />
            </div>
          </div>

          {/* PyTest Terminal */}
          <div className="terminal-window">
            <div className="terminal-header">EduGenesis Sandbox Output Console</div>
            {sandboxTerminal.map((line, idx) => {
              let className = "terminal-line";
              if (line.includes("PASSED") || line.includes("通过")) className += " terminal-success";
              else if (line.includes("FAILED") || line.includes("❌") || line.includes("AssertionError")) className += " terminal-error";
              else if (line.startsWith(">>>")) className += " terminal-cyan";
              return (
                <div key={idx} className={className}>
                  {line}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
