import React from 'react';
import { Lock, CheckCircle2, PlayCircle, ChevronRight, ArrowRight, Sparkles, Video, FileText, HelpCircle, FileCode, Map, MapPin, Star } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const getResourceIcon = (type) => {
  switch (type) {
    case 'slide': return <Video size={16} style={{ color: 'var(--secondary)' }} />;
    case 'pdf': return <FileText size={16} style={{ color: 'var(--accent-cyan)' }} />;
    case 'quiz': return <HelpCircle size={16} style={{ color: 'var(--success)' }} />;
    case 'code': return <FileCode size={16} style={{ color: 'var(--accent)' }} />;
    case 'mindmap': return <Map size={16} style={{ color: 'var(--warning)' }} />;
    case 'video': return <PlayCircle size={16} style={{ color: '#fb7299' }} />;
    default: return <FileText size={16} />;
  }
};

// Winding constellation coordinates in a 320x250 coordinate plane
const coords = [
  { x: 50, y: 45 },    // Stage 1
  { x: 135, y: 55 },   // Stage 2
  { x: 215, y: 35 },   // Stage 3
  { x: 265, y: 95 },   // Stage 4
  { x: 195, y: 120 },  // Stage 5
  { x: 110, y: 135 },  // Stage 6
  { x: 60, y: 195 },   // Stage 7
  { x: 155, y: 215 }   // Stage 8
];

// Static starfield background
const stars = [
  { x: 25, y: 35, r: 1, op: 0.6 },
  { x: 90, y: 15, r: 1.5, op: 0.8 },
  { x: 115, y: 80, r: 0.8, op: 0.4 },
  { x: 170, y: 25, r: 1.2, op: 0.7 },
  { x: 210, y: 75, r: 1, op: 0.5 },
  { x: 250, y: 20, r: 1.5, op: 0.9 },
  { x: 290, y: 65, r: 0.8, op: 0.4 },
  { x: 35, y: 105, r: 1.2, op: 0.6 },
  { x: 120, y: 150, r: 1, op: 0.5 },
  { x: 180, y: 160, r: 1.5, op: 0.8 },
  { x: 235, y: 140, r: 0.8, op: 0.4 },
  { x: 285, y: 175, r: 1.2, op: 0.7 },
  { x: 30, y: 190, r: 1, op: 0.5 },
  { x: 115, y: 210, r: 1.5, op: 0.9 },
  { x: 215, y: 205, r: 0.8, op: 0.4 },
  { x: 300, y: 210, r: 1.2, op: 0.6 }
];

// Utility to generate points for a beautiful SVG star shape
const calculateStarPoints = (cx, cy, spikes, outerRadius, innerRadius) => {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  let step = Math.PI / spikes;
  let points = [];

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    rot += step;
  }
  return points.join(' ');
};

export default function PathView() {
  const {
    pathNodes,
    selectedNode,
    setSelectedNode,
    goDashboardHome,
    handleRegeneratePath,
    isRegeneratingPath,
    fetchNodeResources,
    setActiveTab
  } = useAppContext();

  // Auto-select the active node (or first node) on load so details card isn't empty
  React.useEffect(() => {
    if (!selectedNode && pathNodes && pathNodes.length > 0) {
      const activeNode = pathNodes.find(n => n.status === 'active') || pathNodes[0];
      setSelectedNode(activeNode);
    }
  }, [pathNodes, selectedNode, setSelectedNode]);

  if (!pathNodes || pathNodes.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-card-glass)', borderRadius: '12px', border: '1px dashed var(--border-neon)' }}>
        <div className="spinner-academic" style={{ margin: '0 auto 12px', width: '24px', height: '24px' }}></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>正在为您生成自适应学术大纲路径...</p>
      </div>
    );
  }

  const renderBeams = () => {
    const beams = [];
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const toNode = pathNodes[i + 1];
      const fromPt = coords[i];
      const toPt = coords[i + 1];

      let strokeColor = 'rgba(255, 255, 255, 0.06)';
      let strokeDash = 'none';
      let strokeWidth = '1.5';
      let filter = 'none';
      let className = '';

      if (toNode.status === 'completed') {
        strokeColor = 'var(--success)';
        strokeWidth = '2';
        filter = 'drop-shadow(0 0 3px var(--success))';
      } else if (toNode.status === 'active') {
        strokeColor = 'var(--primary-neon)';
        strokeDash = '5 5';
        strokeWidth = '2';
        className = 'beam-flow-active';
        filter = 'drop-shadow(0 0 3px var(--primary-neon))';
      } else {
        strokeColor = 'rgba(255, 255, 255, 0.08)';
        strokeDash = '3 3';
      }

      beams.push(
        <line
          key={`beam-${i}`}
          x1={fromPt.x}
          y1={fromPt.y}
          x2={toPt.x}
          y2={toPt.y}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
          filter={filter}
          className={className}
        />
      );
    }
    return beams;
  };

  const renderStars = () => {
    return pathNodes.map((node, index) => {
      const pt = coords[index];
      if (!pt) return null;
      const isSelected = selectedNode?.id === node.id;

      let outerRingColor = 'rgba(255, 255, 255, 0.1)';
      let coreColor = 'var(--text-muted)';
      let ringScaleClass = '';
      let coreGlow = 'none';
      let labelColor = 'var(--text-muted)';
      let isCompleted = node.status === 'completed';
      let isActive = node.status === 'active';

      if (isCompleted) {
        outerRingColor = 'var(--success)';
        coreColor = 'var(--success)';
        coreGlow = 'drop-shadow(0 0 4px var(--success))';
        labelColor = 'var(--text-main)';
      } else if (isActive) {
        outerRingColor = 'var(--primary-neon)';
        coreColor = 'var(--primary-neon)';
        ringScaleClass = 'star-ring-active';
        coreGlow = 'drop-shadow(0 0 6px var(--primary-neon))';
        labelColor = 'var(--primary-neon)';
      }

      if (isSelected) {
        outerRingColor = 'var(--secondary)';
        coreGlow = 'drop-shadow(0 0 8px var(--secondary))';
        labelColor = 'var(--secondary)';
      }

      return (
        <g
          key={node.id}
          onClick={() => setSelectedNode(node)}
          style={{ cursor: 'pointer' }}
        >
          {/* Outer glowing pulsing ring */}
          <circle
            cx={pt.x}
            cy={pt.y}
            r={isSelected ? 16 : 12}
            fill="none"
            stroke={outerRingColor}
            strokeWidth={isSelected ? '2' : '1.5'}
            className={ringScaleClass}
            style={{
              transition: 'all 0.3s ease',
              opacity: isSelected ? 1 : 0.7,
              transformOrigin: `${pt.x}px ${pt.y}px`
            }}
          />

          {/* Dotted helper orbit when selected */}
          {isSelected && (
            <circle
              cx={pt.x}
              cy={pt.y}
              r={20}
              fill="none"
              stroke="var(--secondary)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              style={{
                transformOrigin: `${pt.x}px ${pt.y}px`,
                animation: 'orbit-spin 12s linear infinite'
              }}
            />
          )}

          {/* Core Star Body */}
          {isActive ? (
            <polygon
              points={calculateStarPoints(pt.x, pt.y, 5, 8, 4)}
              fill="var(--primary-neon)"
              filter={coreGlow}
              style={{
                transformOrigin: `${pt.x}px ${pt.y}px`,
                animation: 'orbit-spin 6s linear infinite'
              }}
            />
          ) : isCompleted ? (
            <circle
              cx={pt.x}
              cy={pt.y}
              r="6"
              fill="var(--success)"
              filter={coreGlow}
            />
          ) : (
            <circle
              cx={pt.x}
              cy={pt.y}
              r="5"
              fill="#1e1e24"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
          )}

          {/* Lock Icon Overlay for Locked Nodes */}
          {!isCompleted && !isActive && (
            <path
              d={`M ${pt.x - 2} ${pt.y - 1} L ${pt.x - 2} ${pt.y + 2.5} L ${pt.x + 2} ${pt.y + 2.5} L ${pt.x + 2} ${pt.y - 1} Z M ${pt.x - 1} ${pt.y - 1} A 1 1 0 0 1 ${pt.x + 1} ${pt.y - 1}`}
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="0.8"
            />
          )}

          {/* Core Checkmark Overlay for Completed Nodes */}
          {isCompleted && (
            <path
              d={`M ${pt.x - 2} ${pt.y} L ${pt.x - 0.5} ${pt.y + 1.5} L ${pt.x + 2} ${pt.y - 1}`}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Star label */}
          <text
            x={pt.x}
            y={pt.y > 110 ? pt.y - 16 : pt.y + 20}
            textAnchor="middle"
            fill={labelColor}
            fontSize="8px"
            fontWeight="800"
            fontFamily="monospace"
            style={{
              transition: 'fill 0.3s ease',
              textShadow: isSelected ? '0 0 5px var(--secondary)' : 'none'
            }}
          >
            S0{index + 1}
          </text>
        </g>
      );
    });
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={16} style={{ color: 'var(--secondary)' }} /> 定制课程路线
        </h3>
        <button
          onClick={handleRegeneratePath}
          disabled={isRegeneratingPath}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-neon)',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Sparkles
            size={12}
            style={{
              animation: isRegeneratingPath ? 'spin 1.5s linear infinite' : 'none'
            }}
          />
          {isRegeneratingPath ? "重构中..." : "重新规划"}
        </button>
      </div>

      {/* 🌌 Constellation Galaxy Map Card */}
      <div 
        className="cyber-card" 
        style={{ 
          padding: '16px 12px', 
          background: 'radial-gradient(circle at center, #0b1120 0%, #030712 100%)', 
          border: '1px solid var(--border-neon)', 
          borderRadius: '16px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255,255,255,0.05)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <svg 
          width="100%" 
          height="240" 
          viewBox="0 0 320 250" 
          style={{ overflow: 'visible', zIndex: 2 }}
        >
          {/* Twinkling background stars */}
          {stars.map((star, idx) => (
            <circle
              key={`star-${idx}`}
              cx={star.x}
              cy={star.y}
              r={star.r}
              fill="#ffffff"
              style={{
                opacity: star.op,
                animation: 'twinkle 3s infinite',
                animationDelay: `${idx * 0.25}s`
              }}
            />
          ))}

          {/* Connection Beams */}
          {renderBeams()}

          {/* Interactive Star Nodes */}
          {renderStars()}
        </svg>

        {/* Constellation Glow Grid Overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle, rgba(15, 118, 110, 0.05) 0%, transparent 80%)', pointerEvents: 'none', zIndex: 1 }}></div>
      </div>

      {/* Selected Node Parameter Board (Glassmorphic look) */}
      {selectedNode && (
        <div
          className="cyber-card tab-fade-in"
          style={{
            marginTop: '16px',
            padding: '16px',
            borderLeft: '3px solid var(--secondary)',
            background: 'linear-gradient(135deg, var(--bg-card-active) 0%, var(--bg-card) 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            zIndex: 1
          }}
        >
          {/* Header */}
          <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '9px', color: 'var(--secondary)', fontWeight: '700', letterSpacing: '0.08em' }}>STAGE PARAMETERS</span>
              <span className={`neon-badge neon-badge-${selectedNode.status === 'completed' ? 'success' : selectedNode.status === 'active' ? 'warning' : 'primary'}`} style={{ fontSize: '8px', padding: '1px 5px' }}>
                {selectedNode.status === 'completed' ? '已完成' : selectedNode.status === 'active' ? '进行中' : '未解锁'}
              </span>
            </div>
            <h4 style={{ fontSize: '13.5px', fontWeight: '800', margin: '4px 0 2px 0', color: 'var(--text-main)' }}>{selectedNode.title}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0, lineHeight: '1.4' }}>{selectedNode.description}</p>
          </div>

          {/* Node statistics / Meta parameters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>预计时长:</span>
              <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{selectedNode.id === 'node8' ? '120分钟' : '45分钟'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>难度系数:</span>
              <span style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                {Array.from({ length: selectedNode.id === 'node1' ? 1 : selectedNode.id === 'node8' ? 3 : 2 }).map((_, i) => (
                  <Star key={i} size={11} fill="currentColor" />
                ))}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={async () => {
                await fetchNodeResources(selectedNode.id);
                setActiveTab('resources');
              }}
              className="cyber-btn"
              style={{
                padding: '8px 12px',
                fontSize: '11px',
                fontWeight: '700',
                flexGrow: 1,
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              进入关卡学习 <ArrowRight size={12} />
            </button>
            <button
              onClick={() => setSelectedNode(null)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '8px 14px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '700',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            >
              关闭
            </button>
          </div>

          {/* Resources List */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '10px' }}>
            <h5 style={{ fontSize: '10.5px', color: 'var(--text-main)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>智能体生成资源 (共 {selectedNode.resources.length} 项)</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedNode.resources.map(res => (
                <div
                  key={res}
                  className="cyber-card"
                  style={{
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'var(--bg-card-glass)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={async () => {
                    await fetchNodeResources(selectedNode.id);
                    setActiveTab('resources');
                  }}
                >
                  <div style={{ padding: '4px', background: 'rgba(0, 0, 0, 0.02)', borderRadius: '6px', display: 'flex' }}>
                    {getResourceIcon(res)}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h6 style={{ fontSize: '11.5px', fontWeight: '700', margin: 0, color: 'var(--text-main)' }}>
                      {res === 'slide' ? '音画幻灯片' : res === 'quiz' ? '自适应测验' : res === 'code' ? '实操源码' : res === 'pdf' ? '讲解课本' : res === 'video' ? '精选视频' : '思维脑图'}
                    </h6>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keyframe animations style block */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes beamDash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .beam-flow-active {
          animation: beamDash 1.2s linear infinite;
        }
        @keyframes orbit-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes ringPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }
        .star-ring-active {
          animation: ringPulse 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
