import React, { useEffect } from 'react';
import { X, FileCode } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '16px',
  borderBottom: '1px solid var(--border-neon)'
};

const modalCloseButtonStyle = {
  background: 'rgba(0,0,0,0.03)',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '10px',
  padding: '6px 14px',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '700'
};

export default function CodeModal({ isOpen, onClose }) {
  const {
    selectedNode,
    setProfile,
    sandbox
  } = useAppContext();

  const {
    sandboxChallenge,
    sandboxAIAdvice,
    sandboxCode,
    setSandboxCode,
    isSandboxRunning,
    sandboxTerminal,
    runSandboxTest,
    diagnoseSandboxCode,
    fetchSandboxChallenge
  } = sandbox;

  useEffect(() => {
    if (isOpen && selectedNode) {
      fetchSandboxChallenge(selectedNode.id);
    }
  }, [isOpen, selectedNode]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '1000px', 
          width: '90%', 
          height: '85vh', 
          maxHeight: '85vh', 
          borderRadius: '16px', 
          display: 'flex', 
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div style={modalHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCode size={20} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
              《{selectedNode?.title || "Python Basics"}》 AI 编程沙盒
            </h3>
          </div>
          <button onClick={onClose} style={modalCloseButtonStyle}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body: Two-column grid */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '350px 1fr', 
            gap: '20px', 
            height: 'calc(100% - 110px)',
            overflow: 'hidden'
          }}
        >
          {/* Left Column: Challenge Description */}
          <div 
            className="cyber-card" 
            style={{ 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px', 
              background: 'var(--bg-card-glass)', 
              overflowY: 'auto',
              border: '1px solid var(--border-neon)',
              borderRadius: '12px'
            }}
          >
            <h4 style={{ fontSize: '15px', fontWeight: '800', borderBottom: '1px solid var(--border-neon)', paddingBottom: '8px', color: 'var(--primary-neon)', margin: 0 }}>
              📖 任务详情与要求
            </h4>
            <div style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6', flexGrow: 1 }}>
              {sandboxChallenge ? (
                <>
                  <p style={{ marginBottom: '12px', fontWeight: '700' }}>题目：{sandboxChallenge.title}</p>
                  <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                    {sandboxChallenge.description}
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>正在为您的当前关卡装载学术编程挑战...</p>
              )}
            </div>

            {/* AI Advice Display */}
            {sandboxAIAdvice && (
              <div 
                style={{ 
                  padding: '12px', 
                  background: 'rgba(15, 118, 110, 0.05)', 
                  borderLeft: '3px solid var(--primary-neon)', 
                  borderRadius: '0 8px 8px 0', 
                  fontSize: '12px', 
                  color: 'var(--text-main)', 
                  lineHeight: '1.5',
                  marginTop: 'auto'
                }}
              >
                <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--primary-neon)' }}>💡 AI 诊断建议：</strong>
                {sandboxAIAdvice}
              </div>
            )}
          </div>

          {/* Right Column: Editor & Terminal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflow: 'hidden' }}>
            {/* Editor Container */}
            <div className="code-editor-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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

              <div className="code-editor-body" style={{ flexGrow: 1, display: 'flex', minHeight: 0 }}>
                <div className="code-editor-gutter">
                  {Array.from({ length: Math.max((sandboxCode || '').split('\n').length, 12) }, (_, i) => (
                    <span key={i + 1}>{i + 1}</span>
                  ))}
                </div>
                <textarea
                  value={sandboxCode || ''}
                  onChange={(e) => setSandboxCode(e.target.value)}
                  className="code-editor-textarea"
                  spellCheck="false"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>

            {/* PyTest Terminal */}
            <div className="terminal-window" style={{ height: '160px', flexShrink: 0 }}>
              <div className="terminal-header">EduGenesis Sandbox Output Console</div>
              {(sandboxTerminal || []).map((line, idx) => {
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

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button className="cyber-btn" onClick={onClose} style={{ padding: '8px 20px', fontSize: '12px' }}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
