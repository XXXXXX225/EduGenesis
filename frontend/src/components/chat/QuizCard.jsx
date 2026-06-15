import React, { useState } from 'react';
import { HelpCircle, Check, X } from 'lucide-react';

export default function QuizCard({ quizData }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (!quizData || !quizData.question) return null;

  const { question, options, answer, explanation } = quizData;

  const handleSelect = (idx) => {
    if (submitted) return;
    setSelectedIdx(idx);
    setSubmitted(true);
  };

  return (
    <div style={{
      marginTop: '16px',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '16px',
      border: '1.5px solid var(--border-neon)',
      padding: '18px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
        <HelpCircle size={16} style={{ color: 'var(--success)' }} />
        <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>自适应随堂小测验</strong>
      </div>
      <p style={{ margin: '0 0 14px 0', fontSize: '13.5px', fontWeight: '600', color: 'var(--text-main)' }}>{question}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {options.map((opt, idx) => {
          let bg = 'rgba(255,255,255,0.03)';
          let borderColor = 'rgba(255,255,255,0.05)';
          let textColor = 'var(--text-muted)';
          let icon = null;

          if (submitted) {
            if (idx === answer) {
              bg = 'rgba(21, 128, 61, 0.15)';
              borderColor = 'var(--success)';
              textColor = '#ffffff';
              icon = <Check size={14} style={{ color: 'var(--success)' }} />;
            } else if (idx === selectedIdx) {
              bg = 'rgba(220, 38, 38, 0.15)';
              borderColor = 'rgb(220, 38, 38)';
              textColor = '#ffffff';
              icon = <X size={14} style={{ color: 'rgb(220, 38, 38)' }} />;
            }
          } else {
            textColor = 'var(--text-main)';
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(idx)}
              disabled={submitted}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: bg,
                border: `1px solid ${borderColor}`,
                color: textColor,
                fontSize: '12.5px',
                cursor: submitted ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
              className={!submitted ? "hover-neon-border" : ""}
            >
              <span>{opt}</span>
              {icon}
            </button>
          );
        })}
      </div>
      {submitted && (
        <div style={{
          marginTop: '14px',
          padding: '12px 14px',
          borderRadius: '10px',
          background: 'rgba(0,0,0,0.08)',
          borderLeft: '3px solid var(--success)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          lineHeight: '1.5',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>🧠 导师学术解析：</strong>
          {explanation}
        </div>
      )}
    </div>
  );
}
