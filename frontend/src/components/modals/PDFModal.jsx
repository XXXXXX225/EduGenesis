import React from 'react';
import { X, FileText } from 'lucide-react';

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

const parseMarkdownToReact = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (line.startsWith('# ')) {
      return <h1 key={idx} style={{ fontSize: '22px', fontWeight: '900', margin: '20px 0 10px', color: 'var(--text-main)' }}>{line.slice(2)}</h1>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={idx} style={{ fontSize: '18px', fontWeight: '800', margin: '16px 0 8px', color: 'var(--text-main)', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '4px' }}>{line.slice(3)}</h2>;
    }
    if (line.startsWith('### ')) {
      return <h3 key={idx} style={{ fontSize: '15px', fontWeight: '700', margin: '12px 0 6px', color: 'var(--text-main)' }}>{line.slice(4)}</h3>;
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return <li key={idx} style={{ marginLeft: '20px', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{line.slice(2)}</li>;
    }
    if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
      return <li key={idx} style={{ marginLeft: '20px', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)', listStyleType: 'decimal', lineHeight: '1.6' }}>{line.slice(3)}</li>;
    }
    if (line.startsWith('```')) {
      return null;
    }
    if (line.trim() === '') return <div key={idx} style={{ height: '8px' }} />;
    return <p key={idx} style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '10px' }}>{line}</p>;
  });
};

export default function PDFModal({ isOpen, onClose, pdfContent, nodeTitle }) {
  if (!isOpen || !pdfContent) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '800px', height: '80vh', borderRadius: '16px' }}>
        <div style={modalHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
              《{nodeTitle || "Python Basics"}》讲解课本
            </h3>
          </div>
          <button onClick={onClose} style={modalCloseButtonStyle}>
            <X size={16} />
          </button>
        </div>
        <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '8px', lineHeight: '1.7', fontSize: '14.5px', background: 'var(--bg-pdf-reader)', borderRadius: '12px', border: '1px solid var(--border-neon)', padding: '24px', color: 'var(--text-main)' }}>
          {parseMarkdownToReact(pdfContent)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-neon)' }}>
          <button className="cyber-btn" onClick={onClose} style={{ padding: '8px 20px', fontSize: '12px' }}>
            完成阅读
          </button>
        </div>
      </div>
    </div>
  );
}
