import React from 'react';

export default function highlightPythonCode(codeText) {
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
    return <div key={idx} style={{ display: 'flex', fontSize: '12px', fontFamily: 'monospace', lineHeight: '1.6' }}>
      <span style={{ width: '28px', color: 'rgba(255,255,255,0.25)', userSelect: 'none', marginRight: '12px' }}>{idx + 1}</span>
      <span>{elements}</span>
    </div>;
  });
}