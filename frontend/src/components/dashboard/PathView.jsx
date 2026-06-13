import React from 'react';
import { Lock, CheckCircle2, PlayCircle, ChevronRight, ArrowRight, Sparkles, Video, FileText, HelpCircle, FileCode, Map } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const getResourceIcon = (type) => {
  switch (type) {
    case 'slide': return <Video size={12} style={{ color: 'var(--secondary)' }} />;
    case 'pdf': return <FileText size={12} style={{ color: 'var(--accent-cyan)' }} />;
    case 'quiz': return <HelpCircle size={12} style={{ color: 'var(--success)' }} />;
    case 'code': return <FileCode size={12} style={{ color: 'var(--accent)' }} />;
    case 'mindmap': return <Map size={12} style={{ color: 'var(--warning)' }} />;
    default: return <FileText size={12} />;
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', padding: '10px 0' }}>

        {/* Connecting line */}
        <div className="flowchart-line" style={{ left: '16px' }} />

        {pathNodes.map((node, index) => {
          let badge = <span className="neon-badge neon-badge-primary">未解锁</span>;
          let cardBorder = 'rgba(255, 255, 255, 0.04)';
          let bulletBorder = 'rgba(255, 255, 255, 0.06)';
          let icon = <Lock size={12} style={{ color: 'var(--text-dim)' }} />;

          if (node.status === 'completed') {
            badge = <span className="neon-badge neon-badge-success">已完成</span>;
            cardBorder = 'rgba(16, 185, 129, 0.15)';
            bulletBorder = 'var(--success)';
            icon = <CheckCircle2 size={12} style={{ color: 'var(--success)' }} />;
          } else if (node.status === 'active') {
            badge = <span className="neon-badge neon-badge-warning">激活学习中</span>;
            cardBorder = 'rgba(99, 102, 241, 0.3)';
            bulletBorder = 'var(--primary-neon)';
            icon = <PlayCircle size={12} style={{ color: 'var(--primary-neon)' }} className="pulse-glow" />;
          }

          return (
            <div key={node.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 1 }}>
              <div
                style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}
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
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--bg-space)',
                  border: `2px solid ${bulletBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: node.status === 'active' ? '0 0 15px rgba(15, 118, 110, 0.25)' : 'none'
                }}>
                  {icon}
                </div>

                {/* Path Card */}
                <div
                  className="cyber-card"
                  style={{
                    flexGrow: 1,
                    padding: '12px 14px',
                    borderColor: cardBorder,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: node.status === 'active' ? 'var(--bg-card-active)' : 'var(--bg-card)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: '700' }}>STAGE 0{index + 1}</span>
                      <h3 style={{ fontSize: '13.5px', fontWeight: '700' }}>{node.title}</h3>
                      {badge}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>{node.description}</p>
                  </div>

                  {/* Right icons preview */}
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {node.resources.map(res => (
                      <div
                        key={res}
                        style={{
                          padding: '4px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title={res.toUpperCase()}
                      >
                        {getResourceIcon(res)}
                      </div>
                    ))}
                    <ChevronRight size={12} style={{ color: 'var(--text-muted)', marginLeft: '4px', transform: selectedNode?.id === node.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                </div>
              </div>

              {/* Expanded Selected Node Panel directly under the stage row */}
              {selectedNode?.id === node.id && (
                <div
                  className="cyber-card"
                  style={{
                    marginLeft: '12px', // Align with the stage card
                    padding: '16px 20px',
                    borderTop: 'none',
                    borderLeft: '4px solid var(--secondary)',
                    background: 'linear-gradient(135deg, var(--bg-card-active) 0%, var(--bg-card) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    marginTop: '-8px' // Connecting visual spacing
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '9px', color: 'var(--secondary)', fontWeight: '700', letterSpacing: '0.08em' }}>STAGE PARAMETERS</span>
                      <h3 style={{ fontSize: '14px', fontWeight: '800', marginTop: '4px' }}>{selectedNode.title} 核心资源包</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '11.5px', marginTop: '4px' }}>{selectedNode.description}</p>

                      {/* Node statistics / Meta parameters */}
                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <div>预计时长: <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{selectedNode.id === 'node8' ? '120分钟' : '45分钟'}</span></div>
                        <div>难度: <span style={{ color: 'var(--secondary)', fontWeight: '700' }}>{selectedNode.id === 'node1' ? '⭐️' : selectedNode.id === 'node8' ? '⭐️⭐️⭐️' : '⭐️⭐️'}</span></div>
                        <div>状态: <span style={{ color: selectedNode.status === 'completed' ? 'var(--success)' : 'var(--primary)', fontWeight: '700' }}>
                          {selectedNode.status === 'completed' ? '已通关' : selectedNode.status === 'active' ? '正在探索' : '未解锁'}
                        </span></div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      {/* Enter Learning Button */}
                      <button
                        onClick={async () => {
                          await fetchNodeResources(selectedNode.id);
                          setActiveTab('resources');
                        }}
                        className="cyber-btn"
                        style={{
                          padding: '6px 12px',
                          fontSize: '10.5px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        进入当前关卡学习 <ArrowRight size={10} />
                      </button>

                      <button
                        onClick={() => setSelectedNode(null)}
                        style={{
                          background: 'rgba(0,0,0,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: '10.5px',
                          fontWeight: '700'
                        }}
                      >
                        关闭
                      </button>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '11px', color: 'var(--text-main)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>智能体生成产物 (共 {selectedNode.resources.length} 项)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                    {selectedNode.resources.map(res => (
                      <div
                        key={res}
                        className="cyber-card"
                        style={{
                          padding: '8px 12px',
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
                        <div style={{ padding: '6px', background: 'rgba(0, 0, 0, 0.02)', borderRadius: '8px', display: 'flex' }}>
                          {getResourceIcon(res)}
                        </div>
                        <div>
                          <h5 style={{ fontSize: '12px', fontWeight: '700', margin: 0 }}>
                            {res === 'slide' ? '音画幻灯片' : res === 'quiz' ? '自适应测验' : res === 'code' ? '实操源码' : res === 'pdf' ? '讲解课本' : '思维脑图'}
                          </h5>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>点击获取并前往生成库</span>
                        </div>
                      </div>
                    ))}
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
