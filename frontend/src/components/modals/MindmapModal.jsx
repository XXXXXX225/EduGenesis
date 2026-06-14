import React, { useState, useEffect, useRef } from 'react';
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

// Helper to parse Mermaid graph TD syntax
const parseMermaidToGraph = (mermaidText) => {
  if (!mermaidText) return { nodes: [], links: [] };

  const lines = mermaidText.split('\n');
  const nodeMap = {};
  const links = [];

  // Pass 1: Extract all node label definitions of the form: id["label"] or id[label]
  lines.forEach(line => {
    const trimmed = line.trim();
    const labelMatches = trimmed.matchAll(/([a-zA-Z0-9_-]+)\["([^"]+)"\]/g);
    for (const match of labelMatches) {
      const id = match[1];
      const label = match[2];
      nodeMap[id] = { id, label };
    }
    const labelMatchesSquare = trimmed.matchAll(/([a-zA-Z0-9_-]+)\[([^\]"]+)\]/g);
    for (const match of labelMatchesSquare) {
      const matchedId = match[1];
      const matchedLabel = match[2];
      if (!nodeMap[matchedId]) {
        nodeMap[matchedId] = { id: matchedId, label: matchedLabel };
      }
    }
  });

  // Pass 2: Extract all connections of the form: id1 --> id2
  lines.forEach(line => {
    let cleanLine = line.trim();
    if (!cleanLine || cleanLine.startsWith('graph')) return;

    cleanLine = cleanLine.replace(/([a-zA-Z0-9_-]+)\["([^"]+)"\]/g, '$1');
    cleanLine = cleanLine.replace(/([a-zA-Z0-9_-]+)\[([^\]"]+)\]/g, '$1');

    const linkMatch = cleanLine.match(/([a-zA-Z0-9_-]+)\s*-->\s*([a-zA-Z0-9_-]+)/);
    if (linkMatch) {
      const sourceId = linkMatch[1];
      const targetId = linkMatch[2];
      links.push({ source: sourceId, target: targetId });

      if (!nodeMap[sourceId]) nodeMap[sourceId] = { id: sourceId, label: sourceId };
      if (!nodeMap[targetId]) nodeMap[targetId] = { id: targetId, label: targetId };
    }
  });

  const nodes = Object.values(nodeMap);
  return { nodes, links };
};

// Helper to compute node layout radially
const layoutGraph = (nodes, links) => {
  const width = 540;
  const height = 380;
  const cx = width / 2;
  const cy = height / 2;

  if (nodes.length === 0) return [];

  const adj = {};
  const incoming = {};
  nodes.forEach(n => {
    adj[n.id] = [];
    incoming[n.id] = 0;
  });

  links.forEach(l => {
    if (adj[l.source]) {
      adj[l.source].push(l.target);
    }
    incoming[l.target] = (incoming[l.target] || 0) + 1;
  });

  let rootId = nodes[0].id;
  let minIncoming = Infinity;
  nodes.forEach(n => {
    if ((incoming[n.id] || 0) < minIncoming) {
      minIncoming = incoming[n.id] || 0;
      rootId = n.id;
    }
  });

  const positionedNodes = {};
  const colors = ['var(--secondary)', 'var(--warning)', 'var(--accent)', 'var(--success)', 'var(--accent-cyan)'];
  const visited = new Set([rootId]);

  positionedNodes[rootId] = {
    id: rootId,
    label: nodes.find(n => n.id === rootId)?.label || rootId,
    x: cx,
    y: cy,
    r: 40,
    color: 'var(--primary-neon)'
  };

  const depthRadius = [0, 85, 150, 205];
  const level1 = adj[rootId] || [];
  const level1Count = level1.length;

  level1.forEach((childId, idx) => {
    const angle = (idx * 2 * Math.PI) / level1Count - Math.PI / 2;
    const r1 = depthRadius[1];
    const x = cx + r1 * Math.cos(angle);
    const y = cy + r1 * Math.sin(angle);
    positionedNodes[childId] = {
      id: childId,
      label: nodes.find(n => n.id === childId)?.label || childId,
      x,
      y,
      r: 32,
      color: colors[idx % colors.length]
    };
    visited.add(childId);

    const level2 = adj[childId] || [];
    const level2Count = level2.length;
    level2.forEach((grandChildId, gIdx) => {
      const parentAngle = angle;
      const arcSpan = Math.PI * 0.5;
      let gAngle = parentAngle;
      if (level2Count > 1) {
        const startAngle = parentAngle - arcSpan / 2;
        const step = arcSpan / (level2Count - 1);
        gAngle = startAngle + gIdx * step;
      }
      const r2 = 65;
      const gx = x + r2 * Math.cos(gAngle);
      const gy = y + r2 * Math.sin(gAngle);

      positionedNodes[grandChildId] = {
        id: grandChildId,
        label: nodes.find(n => n.id === grandChildId)?.label || grandChildId,
        x: gx,
        y: gy,
        r: 26,
        color: colors[(idx + gIdx + 1) % colors.length]
      };
      visited.add(grandChildId);

      const level3 = adj[grandChildId] || [];
      const level3Count = level3.length;
      level3.forEach((greatGrandChildId, ggIdx) => {
        const ggParentAngle = gAngle;
        const ggArcSpan = Math.PI * 0.4;
        let ggAngle = ggParentAngle;
        if (level3Count > 1) {
          const startAngle = ggParentAngle - ggArcSpan / 2;
          const step = ggArcSpan / (level3Count - 1);
          ggAngle = startAngle + ggIdx * step;
        }
        const r3 = 55;
        const ggx = gx + r3 * Math.cos(ggAngle);
        const ggy = gy + r3 * Math.sin(ggAngle);

        positionedNodes[greatGrandChildId] = {
          id: greatGrandChildId,
          label: nodes.find(n => n.id === greatGrandChildId)?.label || greatGrandChildId,
          x: ggx,
          y: ggy,
          r: 22,
          color: colors[(idx + gIdx + ggIdx + 2) % colors.length]
        };
        visited.add(greatGrandChildId);
      });
    });
  });

  nodes.forEach(n => {
    if (!positionedNodes[n.id]) {
      positionedNodes[n.id] = {
        id: n.id,
        label: n.label,
        x: cx + (Math.random() - 0.5) * 120,
        y: cy + (Math.random() - 0.5) * 120,
        r: 25,
        color: 'var(--text-muted)'
      };
    }
  });

  return Object.values(positionedNodes);
};

export default function MindmapModal({ isOpen, onClose, mindmapContent, nodeTitle }) {
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const dragStartRef = useRef({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // Wheel listener with passive: false to allow e.preventDefault()
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl || !isOpen) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = 0.08;
      const direction = e.deltaY < 0 ? 1 : -1;
      setScale(prev => {
        const newScale = prev + direction * zoomFactor;
        return Math.max(0.4, Math.min(3.0, newScale));
      });
    };

    svgEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      svgEl.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen]);

  // Reset zoom & pan when modal opens or content changes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPanX(0);
      setPanY(0);
      setIsDragging(false);
    }
  }, [isOpen, mindmapContent]);

  const handleMouseDown = (e) => {
    // Only drag on left click and avoid clicking nodes directly
    if (e.button !== 0) return;
    if (e.target.tagName === 'circle' || e.target.tagName === 'text') return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panX, y: e.clientY - panY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStartRef.current.x);
    setPanY(e.clientY - dragStartRef.current.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const drawMindmapSVG = () => {
    const { nodes, links } = parseMermaidToGraph(mindmapContent);
    const positionedNodes = layoutGraph(nodes, links);

    return (
      <svg
        ref={svgRef}
        width="540"
        height="380"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          background: '#0e1726',
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
      >
        <g
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
            transformOrigin: '270px 190px',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
        >
          {links.map((link, idx) => {
            const sourceNode = positionedNodes.find(n => n.id === link.source);
            const targetNode = positionedNodes.find(n => n.id === link.target);
            if (!sourceNode || !targetNode) return null;
            return (
              <line
                key={idx}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="2.5"
                strokeDasharray="4,4"
              />
            );
          })}
          {positionedNodes.map(node => (
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
              >
                <title>{node.label}</title>
              </circle>
              <text
                x={node.x}
                y={node.y + 4}
                fill="#ffffff"
                fontSize={node.r > 30 ? "11.5px" : "10px"}
                fontWeight="800"
                textAnchor="middle"
                className={`mindmap-text-${node.id}`}
                style={{ pointerEvents: 'none' }}
              >
                <title>{node.label}</title>
                {node.label.length > 8 ? node.label.substring(0, 7) + '..' : node.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    );
  };

  if (!isOpen || !mindmapContent) return null;

  const controlButtonStyle = {
    width: '28px',
    height: '28px',
    background: 'rgba(30, 41, 59, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    transition: 'all 0.2s',
  };

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

        <div
          style={{
            margin: '16px 0',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            width: '540px',
            height: '380px'
          }}
        >
          {drawMindmapSVG()}
          
          {/* Zoom & Reset Floating Overlay */}
          <div style={{ position: 'absolute', bottom: '12px', right: '12px', display: 'flex', gap: '6px', zIndex: 10 }}>
            <button
              onClick={() => setScale(prev => Math.min(3.0, prev + 0.15))}
              style={controlButtonStyle}
              title="放大"
            >
              +
            </button>
            <button
              onClick={() => setScale(prev => Math.max(0.4, prev - 0.15))}
              style={controlButtonStyle}
              title="缩小"
            >
              -
            </button>
            <button
              onClick={() => { setScale(1); setPanX(0); setPanY(0); }}
              style={{ ...controlButtonStyle, fontSize: '10px' }}
              title="重置"
            >
              1:1
            </button>
          </div>

          {/* Zoom Percent indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.45)',
              fontFamily: 'monospace',
              zIndex: 10,
              background: 'rgba(0,0,0,0.4)',
              padding: '2px 6px',
              borderRadius: '4px',
              backdropFilter: 'blur(2px)'
            }}
          >
            Zoom: {Math.round(scale * 100)}%
          </div>
        </div>

        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '460px', lineHeight: '1.5' }}>
          💡 智能提示：您可以<b>按住背景拖动</b>以平移脑图，或<b>使用鼠标滚轮</b>进行缩放。点击节点气泡仍可触发微互动。
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
