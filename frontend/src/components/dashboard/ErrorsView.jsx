import React from 'react';
import { X } from 'lucide-react';

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid var(--border-neon)',
  paddingBottom: '14px',
  marginBottom: '20px'
};

const modalCloseButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  padding: '4px'
};

export default function ErrorsView({
  errorQuestions,
  handleDiagnoseError,
  handleRemedyPractice,
  selectedErrorExp,
  setSelectedErrorExp,
  goDashboardHome
}) {
  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', marginBottom: '4px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
            智能错题加固本
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
            画像智能体为您记录的所有自适应测验易错题包。点击题目卡片，获取主管智能体和画像智能体的诊断解析。
          </p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '20px' }}>
        {errorQuestions.map((eq) => (
          <article
            key={eq.id}
            className="cyber-card hover-neon-border"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              background: 'var(--bg-card-glass)',
              borderColor: 'rgba(239, 68, 68, 0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="neon-badge neon-badge-warning" style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.18)' }}>
                语法错误
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {eq.id.toUpperCase()}</span>
            </div>

            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>{eq.title}</h3>

              {/* Error code box */}
              <div style={{ background: '#1e1e24', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', color: '#f8f8f2', margin: '8px 0', border: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'pre' }}>
                {eq.code}
              </div>

              {/* System Error trace */}
              <div style={{ background: 'rgba(239, 68, 68, 0.04)', borderLeft: '3px solid #ef4444', padding: '8px 12px', borderRadius: '0 6px 6px 0', fontSize: '11.5px', fontFamily: 'monospace', color: '#f87171', marginTop: '8px' }}>
                {eq.error_msg}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <button
                type="button"
                onClick={() => handleDiagnoseError(eq)}
                className="cyber-btn"
                style={{ padding: '6px 14px', fontSize: '11px', flexGrow: 1, justifyContent: 'center' }}
              >
                💡 智能体解析
              </button>
              <button
                type="button"
                onClick={() => handleRemedyPractice(eq)}
                style={{
                  background: 'rgba(21, 128, 61, 0.08)',
                  border: '1px solid rgba(21, 128, 61, 0.2)',
                  borderRadius: '8px',
                  color: 'var(--success)',
                  cursor: 'pointer',
                  padding: '6px 14px',
                  fontSize: '11px',
                  fontWeight: '700'
                }}
                className="hover-neon-border"
              >
                加练同类题
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Error explanation details modal */}
      {selectedErrorExp && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '600px', borderRadius: '16px' }}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>智能体错题诊断报告</h3>
              <button type="button" onClick={() => setSelectedErrorExp(null)} style={modalCloseButtonStyle}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.6' }}>
              <h4 style={{ fontWeight: '800', color: 'var(--danger)' }}>错误类型：{selectedErrorExp.title}</h4>
              <p style={{ background: 'rgba(15, 118, 110, 0.04)', padding: '14px', borderRadius: '12px', borderLeft: '4px solid var(--primary-neon)', fontSize: '13px' }}>
                {selectedErrorExp.ai_explanation}
              </p>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>推荐修复后的标准源码：</span>
                <div style={{ background: '#1e1e24', padding: '14px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', color: '#f8f8f2', border: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'pre' }}>
                  {selectedErrorExp.solution}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-neon)', paddingTop: '12px' }}>
              <button type="button" className="cyber-btn" onClick={() => setSelectedErrorExp(null)}>
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
