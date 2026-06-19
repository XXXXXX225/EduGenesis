import React from 'react';
import { Lock, CheckCircle2, PlayCircle, ChevronRight, ArrowRight, Sparkles, Video, FileText, HelpCircle, FileCode, Map } from 'lucide-react';
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
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          📍 定制课程路线
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

      {/* Flowchart Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', padding: '10px 0' }}>

        {/* Connecting line */}
        <div className="flowchart-line" style={{ left: '14px', top: '20px', bottom: '20px' }} />

        {pathNodes.map((node, index) => {
          let badge = <span className="neon-badge neon-badge-primary" style={{ fontSize: '8px', padding: '1px 4px' }}>未解锁</span>;
          let cardBorder = 'rgba(255, 255, 255, 0.04)';
          let bulletBorder = 'rgba(255, 255, 255, 0.06)';
          let icon = <Lock size={10} style={{ color: 'var(--text-dim)' }} />;

          if (node.status === 'completed') {
            badge = <span className="neon-badge neon-badge-success" style={{ fontSize: '8px', padding: '1px 4px' }}>已完成</span>;
            cardBorder = 'rgba(16, 185, 129, 0.15)';
            bulletBorder = 'var(--success)';
            icon = <CheckCircle2 size={10} style={{ color: 'var(--success)' }} />;
          } else if (node.status === 'active') {
            badge = <span className="neon-badge neon-badge-warning" style={{ fontSize: '8px', padding: '1px 4px' }}>进行中</span>;
            cardBorder = 'rgba(99, 102, 241, 0.3)';
            bulletBorder = 'var(--primary-neon)';
            icon = <PlayCircle size={10} style={{ color: 'var(--primary-neon)' }} className="pulse-glow" />;
          }

          return (
            <div key={node.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 1 }}>
              <div
                style={{ display: 'flex', gap: '10px', cursor: 'pointer', alignItems: 'center' }}
                onClick={() => {
                  if (selectedNode?.id === node.id) {
                    setSelectedNode(null);
                  } else {
                    setSelectedNode(node);
                  }
                }}
              >
                {/* Circle Bullet */}
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--bg-space)',
                  border: `1.5px solid ${bulletBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: node.status === 'active' ? '0 0 8px rgba(15, 118, 110, 0.2)' : 'none'
                }}>
                  {icon}
                </div>

                {/* Path Card */}
                <div
                  className="cyber-card"
                  style={{
                    flexGrow: 1,
                    padding: '10px 12px',
                    borderColor: cardBorder,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: node.status === 'active' ? 'var(--bg-card-active)' : 'var(--bg-card)',
                    minWidth: 0
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: '700' }}>STAGE 0{index + 1}</span>
                      {badge}
                    </div>
                    <h3 style={{ fontSize: '13px', fontWeight: '800', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>{node.title}</h3>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)', marginLeft: '6px', transform: selectedNode?.id === node.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                </div>
              </div>

              {/* Expanded Selected Node Panel directly under the stage row */}
              {selectedNode?.id === node.id && (
                <div
                  className="cyber-card"
                  style={{
                    marginLeft: '38px', // Align with the stage card: 28px circle + 10px gap
                    padding: '12px 14px',
                    borderTop: 'none',
                    borderLeft: '3px solid var(--secondary)',
                    background: 'linear-gradient(135deg, var(--bg-card-active) 0%, var(--bg-card) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    marginTop: '-8px' // Connecting visual spacing
                  }}
                >
                  <div>
                    <span style={{ fontSize: '9px', color: 'var(--secondary)', fontWeight: '700', letterSpacing: '0.08em' }}>STAGE PARAMETERS</span>
                    <h4 style={{ fontSize: '13.5px', fontWeight: '800', marginTop: '2px', marginBottom: '4px', color: 'var(--text-main)' }}>{selectedNode.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: '0 0 8px 0', lineHeight: '1.4' }}>{selectedNode.description}</p>

                    {/* Node statistics / Meta parameters */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10.5px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.02)', padding: '6px 8px', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>预计时长:</span>
                        <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{selectedNode.id === 'node8' ? '120分钟' : '45分钟'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>难度系数:</span>
                        <span style={{ color: 'var(--secondary)', fontWeight: '700' }}>{selectedNode.id === 'node1' ? '⭐️' : selectedNode.id === 'node8' ? '⭐️⭐️⭐️' : '⭐️⭐️'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>状态:</span>
                        <span style={{ color: selectedNode.status === 'completed' ? 'var(--success)' : 'var(--primary)', fontWeight: '700' }}>
                          {selectedNode.status === 'completed' ? '已通关' : selectedNode.status === 'active' ? '正在探索' : '未解锁'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {/* Enter Learning Button */}
                    <button
                      onClick={async () => {
                        await fetchNodeResources(selectedNode.id);
                        setActiveTab('resources');
                      }}
                      className="cyber-btn"
                      style={{
                        padding: '6px 10px',
                        fontSize: '10px',
                        fontWeight: '700',
                        flexGrow: 1,
                        justifyContent: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      进入关卡学习 <ArrowRight size={10} />
                    </button>

                    <button
                      onClick={() => setSelectedNode(null)}
                      style={{
                        background: 'rgba(0,0,0,0.04)',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '10px',
                        fontWeight: '700'
                      }}
                    >
                      关闭
                    </button>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
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
                            cursor: 'pointer'
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
            </div>
          );
        })}
      </div>
    </>
  );
}
