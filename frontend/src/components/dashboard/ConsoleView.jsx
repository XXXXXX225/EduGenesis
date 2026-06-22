import React from 'react';
import { Sliders, Network, Crown, User, MapPin, Shield, Terminal, MessageSquare, Activity, Cpu, Radio, Sparkles } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function ConsoleView() {
  const {
    activeConsoleAgent,
    setActiveConsoleAgent,
    agentLogs,
    goDashboardHome
  } = useAppContext();

  // 1. Calculate consensus metrics dynamically based on logs
  const getConsensusMetrics = () => {
    if (!agentLogs || agentLogs.length === 0) {
      return { score: 85, status: '协同就绪', color: '#06b6d4', type: 'info', desc: '智能体网络已建立，正在进行常态化特征审计。' };
    }
    
    // Scan recent logs
    const hasDanger = agentLogs.slice(-6).some(l => 
      (l.log_type === 'danger') || 
      (l.log || '').includes('拦截') || 
      (l.log || '').includes('异常') || 
      (l.log || '').includes('超时') || 
      (l.log || '').includes('强行终止')
    );
    
    const hasWarning = agentLogs.slice(-6).some(l => 
      (l.log_type === 'warning') || 
      (l.log || '').includes('警告') || 
      (l.log || '').includes('偏离') || 
      (l.log || '').includes('未通过')
    );

    if (hasDanger) {
      return {
        score: 20,
        status: '阻断审计 - 运行挂起',
        color: '#ef4444', // Danger Red
        type: 'danger',
        desc: '安全智能体拦截到高危代码或超时运行，系统已挂起沙盒并执行强行终止。'
      };
    }
    
    if (hasWarning) {
      return {
        score: 55,
        status: '决策分歧 - 动态重路由',
        color: '#f59e0b', // Warning Amber
        type: 'warning',
        desc: '学情指标检测到偏离或加固触发，路径智能体正在动态微调后续资源包。'
      };
    }

    const latestLog = agentLogs[agentLogs.length - 1];
    const logContent = (latestLog.log || '').toLowerCase();
    const logType = (latestLog.log_type || '').toLowerCase();
    
    const isConsensus = logType === 'consensus' || 
      logContent.includes('达成共识') || 
      logContent.includes('对齐') || 
      logContent.includes('通过') || 
      logContent.includes('成功') || 
      logContent.includes('完成') || 
      logContent.includes('签发');
      
    if (isConsensus) {
      return {
        score: 100,
        status: '共识达成 - 学术闭环',
        color: '#10b981', // Success Green
        type: 'success',
        desc: '多智能体网络对学情变动与学术资源分配达成 100% 共识，参数已同步。'
      };
    }

    return {
      score: 85,
      status: '协同就绪 - 稳定协商',
      color: '#06b6d4', // Info Cyan
      type: 'info',
      desc: '主管、画像、路径与安全智能体运行正常，处于双向握手协商状态。'
    };
  };

  const consensus = getConsensusMetrics();

  // Helper to format log level badges
  const getLogBadge = (log) => {
    const type = log.log_type || '';
    if (type === 'danger' || log.log.includes('拦截') || log.log.includes('异常')) {
      return { text: 'CRIT', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
    }
    if (type === 'warning' || log.log.includes('警告') || log.log.includes('偏离')) {
      return { text: 'WARN', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    }
    if (type === 'consensus' || log.log.includes('共识') || log.log.includes('通过')) {
      return { text: 'AGRE', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    }
    return { text: 'INFO', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' };
  };

  // Agent Metadata Grid Config
  const agentMeta = {
    executive: {
      name: '主管智能体 (Executive Agent)',
      icon: Crown,
      color: 'var(--secondary)',
      status: '在线 (STANDBY)',
      port: 'PORT 8080',
      weight: '9.8 (High)',
      directives: 24,
      desc: '核心控制代理枢纽，负责调度协调用户意图，指令路径规划和评估画像，是多智能体网络的指挥中枢。'
    },
    profile: {
      name: '画像智能体 (Profile Agent)',
      icon: User,
      color: 'var(--primary-neon)',
      status: '监控中 (ACTIVE)',
      port: 'PORT 8082',
      weight: '8.5 (Medium)',
      directives: 18,
      desc: '维护用户的 6 维认知物理画像，根据对话语义、错题与做题数据，微调并持久化用户的认知指标。'
    },
    path: {
      name: '路径智能体 (Path Agent)',
      icon: MapPin,
      color: '#f59e0b',
      status: '监听中 (IDLE)',
      port: 'PORT 8084',
      weight: '8.2 (Medium)',
      directives: 12,
      desc: '定制路径生成器。负责对大纲进行自适应动态编排，修剪基础概念关卡，并指令资源生成模块运作。'
    },
    security: {
      name: '安全校验智能体 (Security Agent)',
      icon: Shield,
      color: '#ef4444',
      status: '防御中 (ACTIVE)',
      port: 'PORT 8086',
      weight: '9.5 (High)',
      directives: 32,
      desc: '防御智能安全护栏。负责实时审计沙盒防护和敏感输入防御层，合规审计防止大模型越狱注入。'
    }
  };

  const selectedAgent = agentMeta[activeConsoleAgent] || agentMeta.executive;
  const SelectedIcon = selectedAgent.icon;

  // Find latest log sender for burst particles
  const latestLogItem = agentLogs[agentLogs.length - 1];
  const latestSender = latestLogItem ? latestLogItem.sender : '';
  let activeSenderKey = 'executive';
  if (latestSender === '画像智能体') activeSenderKey = 'profile';
  if (latestSender === '路径智能体') activeSenderKey = 'path';
  if (latestSender === '安全校验智能体') activeSenderKey = 'security';

  // SVG dimensions: viewBox="0 0 400 320"
  // Node coordinate positions
  const cxExec = 200, cyExec = 55;
  const cxProfile = 80, cyProfile = 160;
  const cxPath = 320, cyPath = 160;
  const cxSecurity = 200, cySecurity = 265;

  return (
    <>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sliders size={16} style={{ color: 'var(--primary)' }} /> 智能体协同控制台
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0, lineHeight: '1.4' }}>
          多智能体协同网络运作后台。监控决策流向与实时共识数据报文。
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '16px', marginTop: '16px' }}>
        
        {/* Left Side: Topology & Workbench */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Visual Agent Topology Map */}
          <div className="cyber-card" style={{ padding: '12px 14px', background: 'var(--bg-card-glass)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '12.5px', fontWeight: '800', borderBottom: '1px solid var(--border-neon)', paddingBottom: '6px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Network size={14} style={{ color: 'var(--primary)' }} /> 智能体协同拓扑沙盘
            </h4>

            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', padding: '5px 0' }}>
              <svg width="100%" height="240" viewBox="0 0 400 320" style={{ maxWidth: '340px', background: 'rgba(5, 5, 8, 0.4)', borderRadius: '12px', border: '1.5px solid rgba(255, 255, 255, 0.05)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)' }}>
                {/* Sci-Fi Grid Canvas */}
                <defs>
                  <pattern id="workbench-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
                  </pattern>
                  <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  
                  {/* Directed Communication Channels */}
                  <path id="exec-profile" d="M 200,55 Q 125,95 80,160" />
                  <path id="profile-exec" d="M 80,160 Q 125,95 200,55" />
                  <path id="exec-path" d="M 200,55 Q 275,95 320,160" />
                  <path id="path-exec" d="M 320,160 Q 275,95 200,55" />
                  <path id="exec-security" d="M 200,55 Q 185,160 200,265" />
                  <path id="security-exec" d="M 200,265 Q 185,160 200,55" />
                  
                  <path id="profile-security" d="M 80,160 Q 130,225 200,265" />
                  <path id="security-profile" d="M 200,265 Q 130,225 80,160" />
                  <path id="path-security" d="M 320,160 Q 270,225 200,265" />
                  <path id="security-path" d="M 200,265 Q 270,225 320,160" />
                  
                  <path id="profile-path" d="M 80,160 Q 200,180 320,160" />
                  <path id="path-profile" d="M 320,160 Q 200,180 80,160" />
                </defs>
                
                {/* Background Grid */}
                <rect width="100%" height="100%" fill="url(#workbench-grid)" />
                
                {/* Radar target rings */}
                <circle cx="200" cy="160" r="110" fill="none" stroke="rgba(255, 255, 255, 0.01)" strokeWidth="1" />
                <circle cx="200" cy="160" r="75" fill="none" stroke="rgba(255, 255, 255, 0.015)" strokeWidth="1" strokeDasharray="3 5" />
                <circle cx="200" cy="160" r="40" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />

                {/* Background Connection Channels (Faint dotted) */}
                <use href="#exec-profile" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" strokeDasharray="2 3" />
                <use href="#exec-path" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" strokeDasharray="2 3" />
                <use href="#exec-security" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" strokeDasharray="2 3" />
                <use href="#profile-security" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" strokeDasharray="2 3" />
                <use href="#path-security" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" strokeDasharray="2 3" />
                <use href="#profile-path" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" strokeDasharray="2 3" />

                {/* Selected Agent Connection Highlights */}
                {activeConsoleAgent === 'executive' && (
                  <>
                    <use href="#exec-profile" fill="none" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" />
                    <use href="#exec-path" fill="none" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" />
                    <use href="#exec-security" fill="none" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" />
                  </>
                )}
                {activeConsoleAgent === 'profile' && (
                  <>
                    <use href="#exec-profile" fill="none" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="2" />
                    <use href="#profile-path" fill="none" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="2" />
                    <use href="#profile-security" fill="none" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="2" />
                  </>
                )}
                {activeConsoleAgent === 'path' && (
                  <>
                    <use href="#exec-path" fill="none" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="2" />
                    <use href="#profile-path" fill="none" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="2" />
                    <use href="#path-security" fill="none" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="2" />
                  </>
                )}
                {activeConsoleAgent === 'security' && (
                  <>
                    <use href="#exec-security" fill="none" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="2" />
                    <use href="#profile-security" fill="none" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="2" />
                    <use href="#path-security" fill="none" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="2" />
                  </>
                )}

                {/* Continuous Heartbeat Ping Particles */}
                <circle r="2" fill="rgba(6, 182, 212, 0.3)">
                  <animateMotion dur="4s" repeatCount="indefinite"><mpath href="#exec-profile" /></animateMotion>
                </circle>
                <circle r="2" fill="rgba(245, 158, 11, 0.3)">
                  <animateMotion dur="3.5s" repeatCount="indefinite"><mpath href="#exec-path" /></animateMotion>
                </circle>
                <circle r="2" fill="rgba(16, 185, 129, 0.3)">
                  <animateMotion dur="5s" repeatCount="indefinite"><mpath href="#profile-security" /></animateMotion>
                </circle>
                <circle r="2" fill="rgba(139, 92, 246, 0.3)">
                  <animateMotion dur="4.2s" repeatCount="indefinite"><mpath href="#path-security" /></animateMotion>
                </circle>

                {/* Dynamic Log-Triggered Burst Particles */}
                {activeSenderKey === 'executive' && (
                  <g key={`burst-exec-${agentLogs.length}`}>
                    <circle r="3.5" fill="var(--secondary)" filter="url(#neon-glow)">
                      <animateMotion dur="0.8s" repeatCount="1" fill="freeze"><mpath href="#exec-profile" /></animateMotion>
                    </circle>
                    <circle r="3.5" fill="var(--secondary)" filter="url(#neon-glow)">
                      <animateMotion dur="0.8s" repeatCount="1" fill="freeze"><mpath href="#exec-path" /></animateMotion>
                    </circle>
                    <circle r="3.5" fill="var(--secondary)" filter="url(#neon-glow)">
                      <animateMotion dur="0.8s" repeatCount="1" fill="freeze"><mpath href="#exec-security" /></animateMotion>
                    </circle>
                  </g>
                )}
                {activeSenderKey === 'profile' && (
                  <g key={`burst-profile-${agentLogs.length}`}>
                    <circle r="3.5" fill="var(--primary-neon)" filter="url(#neon-glow)">
                      <animateMotion dur="0.8s" repeatCount="1" fill="freeze"><mpath href="#profile-exec" /></animateMotion>
                    </circle>
                    <circle r="3.5" fill="var(--primary-neon)" filter="url(#neon-glow)">
                      <animateMotion dur="0.8s" repeatCount="1" fill="freeze"><mpath href="#profile-path" /></animateMotion>
                    </circle>
                    <circle r="3.5" fill="var(--primary-neon)" filter="url(#neon-glow)">
                      <animateMotion dur="0.8s" repeatCount="1" fill="freeze"><mpath href="#profile-security" /></animateMotion>
                    </circle>
                  </g>
                )}
                {activeSenderKey === 'path' && (
                  <g key={`burst-path-${agentLogs.length}`}>
                    <circle r="3.5" fill="#f59e0b" filter="url(#neon-glow)">
                      <animateMotion dur="0.8s" repeatCount="1" fill="freeze"><mpath href="#path-exec" /></animateMotion>
                    </circle>
                    <circle r="3.5" fill="#f59e0b" filter="url(#neon-glow)">
                      <animateMotion dur="0.8s" repeatCount="1" fill="freeze"><mpath href="#path-profile" /></animateMotion>
                    </circle>
                    <circle r="3.5" fill="#f59e0b" filter="url(#neon-glow)">
                      <animateMotion dur="0.8s" repeatCount="1" fill="freeze"><mpath href="#path-security" /></animateMotion>
                    </circle>
                  </g>
                )}
                {activeSenderKey === 'security' && (
                  <g key={`burst-sec-${agentLogs.length}`}>
                    <circle r="3.5" fill="#ef4444" filter="url(#neon-glow)">
                      <animateMotion dur="0.8s" repeatCount="1" fill="freeze"><mpath href="#security-exec" /></animateMotion>
                    </circle>
                    <circle r="3.5" fill="#ef4444" filter="url(#neon-glow)">
                      <animateMotion dur="0.8s" repeatCount="1" fill="freeze"><mpath href="#security-profile" /></animateMotion>
                    </circle>
                    <circle r="3.5" fill="#ef4444" filter="url(#neon-glow)">
                      <animateMotion dur="0.8s" repeatCount="1" fill="freeze"><mpath href="#security-path" /></animateMotion>
                    </circle>
                  </g>
                )}

                {/* Node: Executive (Crown) */}
                <g onClick={() => setActiveConsoleAgent('executive')} style={{ cursor: 'pointer' }}>
                  <circle cx={cxExec} cy={cyExec} r="25" fill="#0b0f19" stroke={activeConsoleAgent === 'executive' ? 'var(--secondary)' : 'rgba(139, 92, 246, 0.4)'} strokeWidth="2.5" />
                  <circle cx={cxExec} cy={cyExec} r="20" fill="#131a2e" />
                  {activeConsoleAgent === 'executive' && (
                    <circle cx={cxExec} cy={cyExec} r="29" fill="none" stroke="var(--secondary)" strokeWidth="1" strokeDasharray="3 3" style={{ transformOrigin: `${cxExec}px ${cyExec}px`, animation: 'spin-clockwise 10s linear infinite' }} />
                  )}
                  <foreignObject x={cxExec - 9} y={cyExec - 19} width="18" height="18" style={{ pointerEvents: 'none' }}>
                    <div style={{ color: 'var(--secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                      <Crown size={14} />
                    </div>
                  </foreignObject>
                  <text x={cxExec} y={cyExec + 2} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800" fontFamily="sans-serif" style={{ pointerEvents: 'none' }}>主管</text>
                </g>

                {/* Node: Profile (User) */}
                <g onClick={() => setActiveConsoleAgent('profile')} style={{ cursor: 'pointer' }}>
                  <circle cx={cxProfile} cy={cyProfile} r="25" fill="#0b0f19" stroke={activeConsoleAgent === 'profile' ? 'var(--primary-neon)' : 'rgba(6, 182, 212, 0.3)'} strokeWidth="2.5" />
                  <circle cx={cxProfile} cy={cyProfile} r="20" fill="#131a2e" />
                  {activeConsoleAgent === 'profile' && (
                    <circle cx={cxProfile} cy={cyProfile} r="29" fill="none" stroke="var(--primary-neon)" strokeWidth="1" strokeDasharray="3 3" style={{ transformOrigin: `${cxProfile}px ${cyProfile}px`, animation: 'spin-clockwise 10s linear infinite' }} />
                  )}
                  <foreignObject x={cxProfile - 9} y={cyProfile - 19} width="18" height="18" style={{ pointerEvents: 'none' }}>
                    <div style={{ color: 'var(--primary-neon)', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                      <User size={13} />
                    </div>
                  </foreignObject>
                  <text x={cxProfile} y={cyProfile + 2} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800" fontFamily="sans-serif" style={{ pointerEvents: 'none' }}>画像</text>
                </g>

                {/* Node: Path (MapPin) */}
                <g onClick={() => setActiveConsoleAgent('path')} style={{ cursor: 'pointer' }}>
                  <circle cx={cxPath} cy={cyPath} r="25" fill="#0b0f19" stroke={activeConsoleAgent === 'path' ? '#f59e0b' : 'rgba(245, 158, 11, 0.3)'} strokeWidth="2.5" />
                  <circle cx={cxPath} cy={cyPath} r="20" fill="#131a2e" />
                  {activeConsoleAgent === 'path' && (
                    <circle cx={cxPath} cy={cyPath} r="29" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" style={{ transformOrigin: `${cxPath}px ${cyPath}px`, animation: 'spin-clockwise 10s linear infinite' }} />
                  )}
                  <foreignObject x={cxPath - 9} y={cyPath - 19} width="18" height="18" style={{ pointerEvents: 'none' }}>
                    <div style={{ color: '#f59e0b', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                      <MapPin size={13} />
                    </div>
                  </foreignObject>
                  <text x={cxPath} y={cyPath + 2} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800" fontFamily="sans-serif" style={{ pointerEvents: 'none' }}>路径</text>
                </g>

                {/* Node: Security (Shield) */}
                <g onClick={() => setActiveConsoleAgent('security')} style={{ cursor: 'pointer' }}>
                  <circle cx={cxSecurity} cy={cySecurity} r="25" fill="#0b0f19" stroke={activeConsoleAgent === 'security' ? '#ef4444' : 'rgba(239, 68, 68, 0.3)'} strokeWidth="2.5" />
                  <circle cx={cxSecurity} cy={cySecurity} r="20" fill="#131a2e" />
                  {activeConsoleAgent === 'security' && (
                    <circle cx={cxSecurity} cy={cySecurity} r="29" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" style={{ transformOrigin: `${cxSecurity}px ${cySecurity}px`, animation: 'spin-clockwise 10s linear infinite' }} />
                  )}
                  <foreignObject x={cxSecurity - 9} y={cySecurity - 19} width="18" height="18" style={{ pointerEvents: 'none' }}>
                    <div style={{ color: '#ef4444', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                      <Shield size={13} />
                    </div>
                  </foreignObject>
                  <text x={cxSecurity} y={cySecurity + 2} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800" fontFamily="sans-serif" style={{ pointerEvents: 'none' }}>安全</text>
                </g>
              </svg>
            </div>

            {/* Selected Agent Advanced Parameters */}
            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-neon)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '6px', marginBottom: '8px' }}>
                <h5 style={{ fontSize: '12.5px', fontWeight: '800', color: selectedAgent.color, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <SelectedIcon size={14} style={{ color: selectedAgent.color }} />
                  <span>{selectedAgent.name}</span>
                </h5>
                <span style={{ fontSize: '9px', fontWeight: '800', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', padding: '2px 6px', borderRadius: '4px' }}>
                  {selectedAgent.status}
                </span>
              </div>
              
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.45', margin: '0 0 10px 0' }}>
                {selectedAgent.desc}
              </p>
              
              {/* Sci-Fi Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '9.5px', fontFamily: 'monospace', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.04)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '6px', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
                  <span>网关端口:</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{selectedAgent.port}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '6px' }}>
                  <span>协同指令:</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{selectedAgent.directives} RQ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '6px', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
                  <span>核心权重:</span>
                  <span style={{ color: selectedAgent.color, fontWeight: '700' }}>{selectedAgent.weight}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '6px' }}>
                  <span>状态轮询:</span>
                  <span style={{ color: '#10b981', fontWeight: '700' }}>ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Consensus Blackboard & Messages Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Consensus Blackboard Card */}
          <div className="cyber-card" style={{ padding: '12px 14px', background: 'var(--bg-card-glass)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '12.5px', fontWeight: '800', borderBottom: '1px solid var(--border-neon)', paddingBottom: '6px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} style={{ color: 'var(--secondary)' }} /> 智能体共识决策黑板
            </h4>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '6px 0' }}>
              {/* Radial Progress Ring SVG */}
              <div style={{ width: '80px', height: '80px', flexShrink: 0, position: 'relative' }}>
                <svg width="80" height="80" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Decorative rotating background circles */}
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="4 8" style={{ transformOrigin: '60px 60px', animation: 'spin-clockwise 20s linear infinite' }} />
                  <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="1" strokeDasharray="8 4" style={{ transformOrigin: '60px 60px', animation: 'spin-counter 25s linear infinite' }} />
                  
                  {/* Base Track */}
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="6" />
                  {/* Progress Indicator */}
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="50" 
                    fill="none" 
                    stroke={consensus.color} 
                    strokeWidth="6" 
                    strokeDasharray={2 * Math.PI * 50} 
                    strokeDashoffset={2 * Math.PI * 50 * (1 - consensus.score / 100)} 
                    strokeLinecap="round" 
                    filter="url(#neon-glow)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.8s ease' }} 
                  />
                </svg>
                {/* Center text */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', fontFamily: 'monospace', lineHeight: '1' }}>
                    {consensus.score}%
                  </span>
                  <span style={{ fontSize: '7.5px', fontWeight: '800', color: consensus.color, letterSpacing: '0.05em', marginTop: '2px' }}>
                    {consensus.type === 'success' ? 'AGREE' : consensus.type === 'danger' ? 'HALT' : consensus.type === 'warning' ? 'WARN' : 'STABLE'}
                  </span>
                </div>
              </div>

              {/* Status details */}
              <div style={{ flexGrow: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: consensus.color, animation: 'ringPulse 1.5s infinite' }}></span>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff' }}>{consensus.status}</span>
                </div>
                <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
                  {consensus.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Live Logs Console */}
          <div className="cyber-card" style={{ padding: '12px 14px', background: 'var(--bg-card-glass)', display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: '260px' }}>
            <h4 style={{ fontSize: '12.5px', fontWeight: '800', borderBottom: '1px solid var(--border-neon)', paddingBottom: '6px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={14} style={{ color: 'var(--secondary)' }} /> 全局消息报文流
              </span>
              <span className="pulsing-dot" style={{ display: 'inline-block' }}></span>
            </h4>

            <div className="console-logs-box" style={{ flexGrow: 1, maxHeight: '250px', overflowY: 'auto', fontSize: '10.5px', fontFamily: 'monospace' }}>
              {agentLogs.map((log, idx) => {
                const badge = getLogBadge(log);
                return (
                  <div key={idx} style={{ 
                    marginBottom: '8px', 
                    borderBottom: '1px dashed rgba(255,255,255,0.03)', 
                    paddingBottom: '6px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '4px'
                  }}>
                    <span style={{ color: '#5c6370', whiteSpace: 'nowrap' }}>[{log.time}]</span>
                    <span style={{
                      display: 'inline-block',
                      padding: '1px 4px',
                      borderRadius: '3px',
                      fontSize: '8px',
                      fontWeight: '800',
                      color: badge.color,
                      background: badge.bg,
                      border: `1px solid ${badge.color}33`,
                      minWidth: '38px',
                      textAlign: 'center',
                      lineHeight: '1',
                      marginTop: '1px'
                    }}>
                      {badge.text}
                    </span>
                    <div style={{ flex: 1, wordBreak: 'break-all' }}>
                      <span style={{
                        color: log.sender === '主管智能体' ? 'var(--secondary)' :
                          log.sender === '画像智能体' ? 'var(--primary-neon)' :
                            log.sender === '安全校验智能体' ? '#ef4444' : '#f59e0b',
                        fontWeight: '700',
                        marginRight: '6px'
                      }}>
                        {log.sender}:
                      </span>
                      <span style={{ color: '#e2e8f0' }}>{log.log}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Global CSS for Workbench Animations */}
      <style>{`
        @keyframes spin-clockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-counter {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes ringPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </>
  );
}

