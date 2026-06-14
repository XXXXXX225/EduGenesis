import React from 'react';

export default function parseMarkdownToReact(text) {
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
}