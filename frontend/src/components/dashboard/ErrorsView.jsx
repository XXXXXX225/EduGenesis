import React from 'react';
import { X, AlertTriangle, Sparkles } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

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

export default function ErrorsView() {
  const {
    errorQuestions,
    handleDiagnoseError,
    handleRemedyPractice,
    selectedErrorExp,
    setSelectedErrorExp,
    goDashboardHome
  } = useAppContext();
  return (
    <>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={16} style={{ color: 'var(--warning)' }} /> 智能错题加固本
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0, lineHeight: '1.4' }}>
          画像智能体为您记录的所有自适应测验易错题包。
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        {errorQuestions.map((eq) => (
          <article
            key={eq.id}
            className="cyber-card hover-neon-border"
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'var(--bg-card-glass)',
              borderColor: 'rgba(239, 68, 68, 0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="neon-badge neon-badge-warning" style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.18)', fontSize: '9px', padding: '2px 6px' }}>
                语法错误
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {eq.id.toUpperCase()}</span>
            </div>

            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-main)' }}>{eq.title}</h3>

              {/* Error code box */}
              <div style={{ background: '#1e1e24', padding: '8px 10px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '11px', color: '#f8f8f2', margin: '6px 0', border: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'pre', overflowX: 'auto' }}>
                {eq.code}
              </div>

              {/* System Error trace */}
              <div style={{ background: 'rgba(239, 68, 68, 0.04)', borderLeft: '3px solid #ef4444', padding: '6px 10px', borderRadius: '0 6px 6px 0', fontSize: '11px', fontFamily: 'monospace', color: '#f87171', marginTop: '6px' }}>
                {eq.error_msg}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <button
                type="button"
                onClick={() => handleDiagnoseError(eq)}
                className="cyber-btn"
                style={{ padding: '6px 10px', fontSize: '10.5px', flexGrow: 1, justifyContent: 'center' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Sparkles size={12} /> 智能体解析</span>
              </button>
              <button
                type="button"
                onClick={() => handleRemedyPractice(eq)}
                style={{
                  background: 'rgba(21, 128, 61, 0.08)',
                  border: '1px solid rgba(21, 128, 61, 0.2)',
                  borderRadius: '6px',
                  color: 'var(--success)',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  fontSize: '10.5px',
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


    </>
  );
}
