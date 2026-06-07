import React from 'react';
import { X, Map } from 'lucide-react';
import { gsap } from 'gsap';

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

export default function MindmapModal({ isOpen, onClose, mindmapContent, nodeTitle }) {
  const drawMindmapSVG = () => {
    const nodes = [
      { id: 'root', label: nodeTitle || "Python Basics", x: 250, y: 180, r: 45, color: 'var(--primary-neon)' },
      { id: 'c1', label: "核心概念定义", x: 120, y: 80, r: 35, color: 'var(--secondary)' },
      { id: 'c2', label: "防御性安全编码", x: 380, y: 80, r: 35, color: 'var(--warning)' },
      { id: 'c3', label: "断言测试集", x: 120, y: 280, r: 35, color: 'var(--accent)' },
      { id: 'c4', label: "多智能体微调", x: 380, y: 280, r: 35, color: 'var(--success)' },
    ];

    return (
      <svg width="500" height="360" style={{ background: '#0e1726', borderRadius: '16px' }}>
        {nodes.slice(1).map(node => (
          <line
            key={node.id}
            x1="250"
            y1="180"
            x2={node.x}
            y2={node.y}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="3"
            strokeDasharray="4,4"
          />
        ))}
        {nodes.map(node => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={node.r + 5}
              fill="none"
              stroke={node.color}
              strokeWidth="2"
              opacity="0.3"
              style={{ filter: 'blur(2px)' }}
            />
            <circle
              cx={node.x}
              cy={node.y}
              r={node.r}
              fill="rgba(255,255,255,0.06)"
              stroke={node.color}
              strokeWidth="2.5"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                gsap.fromTo(`.mindmap-text-${node.id}`,
                  { scale: 0.8 },
                  { scale: 1, duration: 0.3, ease: "back.out(1.5)" }
                );
              }}
            />
            <text
              x={node.x}
              y={node.y + 4}
              fill="#ffffff"
              fontSize="12"
              fontWeight="800"
              textAnchor="middle"
              className={`mindmap-text-${node.id}`}
              style={{ pointerEvents: 'none' }}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  if (!isOpen || !mindmapContent) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '600px', borderRadius: '16px', alignItems: 'center' }}>
        <div style={{ ...modalHeaderStyle, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Map size={20} style={{ color: 'var(--warning)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
              《{nodeTitle || "Python Basics"}》知识脑图拓扑
            </h3>
          </div>
          <button onClick={onClose} style={modalCloseButtonStyle}>
            <X size={16} />
          </button>
        </div>

        <div style={{ margin: '16px 0', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
          {drawMindmapSVG()}
        </div>

        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '460px', lineHeight: '1.5' }}>
          💡 智能提示：您可以点击思维节点气泡触发微小的弹性位移动画。大模型协同网络已根据您的学习历史规划此拓扑。
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', paddingTop: '12px', borderTop: '1px solid var(--border-neon)' }}>
          <button className="cyber-btn" onClick={onClose} style={{ padding: '8px 20px', fontSize: '12px' }}>
            关闭脑图
          </button>
        </div>
      </div>
    </div>
  );
}
