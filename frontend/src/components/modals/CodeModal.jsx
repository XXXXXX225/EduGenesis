import React, { useState } from 'react';
import { X, FileCode, Copy, Check } from 'lucide-react';

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

export default function CodeModal({ isOpen, onClose, codeContent, nodeTitle }) {
  const [copyCodeText, setCopyCodeText] = useState('复制源码');

  const highlightPythonCode = (codeText) => {
    if (!codeText) return null;
    const keywords = ['def', 'import', 'assert', 'if', 'print', 'return', 'class', 'from', 'in'];
    const lines = codeText.split('\n');
    return lines.map((line, idx) => {
      let elements = [];
      const parts = line.split(/(\s+)/);
      parts.forEach((part, pidx) => {
        if (keywords.includes(part.trim())) {
          elements.push(<span key={pidx} style={{ color: '#c084fc', fontWeight: 'bold' }}>{part}</span>);
        } else if (part.startsWith('#')) {
          elements.push(<span key={pidx} style={{ color: '#9ca3af', fontStyle: 'italic' }}>{part}</span>);
        } else if (part.includes('"') || part.includes("'")) {
          elements.push(<span key={pidx} style={{ color: '#34d399' }}>{part}</span>);
        } else {
          elements.push(part);
        }
      });
      return (
        <div key={idx} style={{ display: 'flex', fontSize: '12px', fontFamily: 'monospace', lineHeight: '1.6' }}>
          <span style={{ width: '28px', color: 'rgba(255,255,255,0.25)', userSelect: 'none', marginRight: '12px' }}>{idx + 1}</span>
          <span>{elements}</span>
        </div>
      );
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeContent);
    setCopyCodeText('已复制！');
    setTimeout(() => setCopyCodeText('复制源码'), 2000);
  };

  if (!isOpen || !codeContent) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '850px', borderRadius: '16px' }}>
        <div style={modalHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCode size={20} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
              《{nodeTitle || "Python Basics"}》实操测试代码用例 (.py)
            </h3>
          </div>
          <button onClick={onClose} style={modalCloseButtonStyle}>
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>
          💡 智能提示：智能体已为您自动补充带有完整断言测试 (PyTest) 的代码。可直接复制并在本地 IDE 运行以验证程序一致性。
        </p>

        <div
          style={{
            flexGrow: 1,
            overflow: 'auto',
            background: '#090d16',
            border: '1px solid rgba(15, 118, 110, 0.25)',
            borderRadius: '12px',
            padding: '20px',
            fontFamily: 'monospace',
            maxHeight: '52vh'
          }}
        >
          {highlightPythonCode(codeContent)}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <button
            className="cyber-btn"
            onClick={handleCopyCode}
            style={{
              padding: '8px 18px',
              fontSize: '11px',
              fontWeight: '700',
              background: copyCodeText === '已复制！' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.04)',
              borderColor: copyCodeText === '已复制！' ? 'var(--success)' : 'rgba(255,255,255,0.1)'
            }}
          >
            {copyCodeText === '已复制！' ? <Check size={12} style={{ color: 'var(--success)' }} /> : <Copy size={12} />}
            {copyCodeText}
          </button>

          <button className="cyber-btn" onClick={onClose} style={{ padding: '8px 20px', fontSize: '12px' }}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
