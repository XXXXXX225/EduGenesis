import React, { useState } from 'react';

const MiniSandboxPlayground = () => {
  const initialCode = `def calculate_average(scores):
    # ⚠️ 隐患：如果 scores 传入空列表会因零除崩溃
    return sum(scores) / len(scores)`;

  const fixedCode = `def calculate_average(scores):
    if not scores:
        return 0.0
    return sum(scores) / len(scores)`;

  const [code, setCode] = useState(initialCode);
  const [logs, setLogs] = useState([
    ">>> 系统就绪，等待点击 [启动协同诊断与执行]...",
    "当前内存镜像：隔离沙盒安全级别 - HIGH"
  ]);
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const runDiagnostics = () => {
    if (isRunning) return;
    setIsRunning(true);
    setShowConfetti(false);
    setProgress(5);
    setCode(initialCode);
    setLogs(["[0.0s] 🛡️ [安全卫士智能体]：启动指令流安全过滤..."]);

    // Sequence of simulated agent consensus steps
    setTimeout(() => {
      setLogs(prev => [...prev, "[0.6s] 🛡️ [安全卫士]：安全过滤通过，代码未发现越权或危险库。"]);
      setProgress(25);
    }, 600);

    setTimeout(() => {
      setLogs(prev => [...prev, "[1.2s] 👤 [画像分析智能体]：评估语义网络... 捕获崩溃断点：第 3 行 len(scores) 未作空防范。"]);
      setProgress(50);
    }, 1200);

    setTimeout(() => {
      setLogs(prev => [...prev, "[1.8s] 🗺️ [路径规划智能体]：评估并规划实时修复补丁，自动重构语义决策树..."]);
      setProgress(75);
    }, 1800);

    setTimeout(() => {
      setLogs(prev => [...prev, "[2.4s] ⚙️ [代码沙盒]：热装载测试容器，开始执行测试套件..."]);
      setProgress(90);
      setCode(fixedCode);
    }, 2400);

    setTimeout(() => {
      setLogs(prev => [
        ...prev,
        "[3.2s] ✅ [代码沙盒]：测试用例全部通过！输入 [90, 80] 输出 85.0; 输入 [] 输出 0.0。",
        "[3.5s] 💡 [系统共识]：知识画像已同步更新，错误本 ledger 记录已归档。"
      ]);
      setProgress(100);
      setIsRunning(false);
      setShowConfetti(true);
    }, 3200);
  };

  return (
    <div className="mini-sandbox-container" style={{ position: 'relative' }}>
      {showConfetti && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)',
          animation: 'pulse-ring 1.5s ease-out infinite',
          zIndex: 1
        }} />
      )}

      <div className="editor-header">
        <div className="dot-wrapper">
          <div className="win-dot" style={{ background: '#ef4444' }} />
          <div className="win-dot" style={{ background: '#f59e0b' }} />
          <div className="win-dot" style={{ background: '#10b981' }} />
        </div>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>edugenesis_playground.py</span>
        <div style={{ width: '40px' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Left: VS Code styled editor */}
        <div style={{ background: '#04060b', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
          <pre style={{ margin: 0, fontSize: '12.5px', color: '#10b981', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            <code>{code}</code>
          </pre>
        </div>

        {/* Right: Agent Consensus Console */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isRunning ? '#f59e0b' : '#10b981', display: 'inline-block' }} />
                多智能体共识进度 ({progress}%)
              </span>
              <button
                onClick={runDiagnostics}
                disabled={isRunning}
                className="interactive-btn"
                style={{
                  padding: '6px 14px',
                  fontSize: '11px',
                  borderRadius: '8px',
                  background: isRunning ? 'rgba(255,255,255,0.05)' : 'var(--primary-gradient)',
                  border: 'none',
                  color: '#fff',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  boxShadow: isRunning ? 'none' : '0 0 10px rgba(13,148,136,0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                {isRunning ? '协同诊断中...' : '⚡ 启动协同诊断与执行'}
              </button>
            </div>
            <div className="comm-progress-bar" style={{ marginBottom: '12px' }}>
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="console-log-box">
            {logs.map((item, idx) => (
              <div key={idx} style={{
                marginBottom: '6px',
                color: item.startsWith('>>>') ? '#e2e8f0' : item.includes('✅') ? '#10b981' : item.includes('🛡️') ? '#a855f7' : item.includes('👤') ? '#3b82f6' : '#38bdf8'
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniSandboxPlayground;
