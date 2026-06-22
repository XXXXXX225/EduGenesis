import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, CheckCircle2, Sparkles, ChevronRight, BookOpen, Cpu, Code2, Save, AlertTriangle, Ban, Trophy, Rocket, Palette, Search } from 'lucide-react';
import { gsap } from 'gsap';
import { useAppContext } from '../../context/AppContext';
import { apiPost } from '../../utils/api';

const RadarCustomizer = ({ profile }) => {
  const { setProfile, setProfileAlert } = useAppContext();
  const [coding, setCoding] = useState(profile.practical !== undefined ? profile.practical : 50);
  const [concept, setConcept] = useState(profile.reasoning !== undefined ? profile.reasoning : 40);
  const [security, setSecurity] = useState(profile.debugging !== undefined ? profile.debugging : 45);
  const [saving, setSaving] = useState(false);
  const [draggingAxis, setDraggingAxis] = useState(null);

  const svgRef = useRef(null);

  useEffect(() => {
    if (profile.practical !== undefined) setCoding(profile.practical);
    if (profile.reasoning !== undefined) setConcept(profile.reasoning);
    if (profile.debugging !== undefined) setSecurity(profile.debugging);
  }, [profile]);

  const v_syntax = coding * 0.9 + 5;
  const v_edge = security * 0.95 + 5;
  const v_algo = concept * 0.9 + 5;
  const v_safety = security * 0.85 + coding * 0.1 + 5;
  const v_readability = coding * 0.8 + concept * 0.15 + 5;
  const v_debug = (coding + concept) / 2;

  const values = [v_syntax, v_edge, v_algo, v_safety, v_readability, v_debug];
  const labels = ["语法规则", "边界处理", "算法复杂度", "沙盒安全", "代码读写", "逆向调试"];

  const center = 150;
  const maxVal = 100;

  const updateFromAxis = (idx, newR) => {
    let val = Math.max(10, Math.min(100, Math.round(newR)));
    if (idx === 0) {
      const newCoding = Math.max(10, Math.min(100, Math.round((val - 5) / 0.9)));
      setCoding(newCoding);
    } else if (idx === 1) {
      const newSecurity = Math.max(10, Math.min(100, Math.round((val - 5) / 0.95)));
      setSecurity(newSecurity);
    } else if (idx === 2) {
      const newConcept = Math.max(10, Math.min(100, Math.round((val - 5) / 0.9)));
      setConcept(newConcept);
    } else if (idx === 3) {
      const newSecurity = Math.max(10, Math.min(100, Math.round((val - 5 - coding * 0.1) / 0.85)));
      setSecurity(newSecurity);
    } else if (idx === 4) {
      const newCoding = Math.max(10, Math.min(100, Math.round((val - 5 - concept * 0.15) / 0.8)));
      setCoding(newCoding);
    } else if (idx === 5) {
      const currentAvg = (coding + concept) / 2;
      const delta = val - currentAvg;
      const newCoding = Math.max(10, Math.min(100, Math.round(coding + delta)));
      const newConcept = Math.max(10, Math.min(100, Math.round(concept + delta)));
      setCoding(newCoding);
      setConcept(newConcept);
    }
  };

  useEffect(() => {
    if (draggingAxis === null) return;

    const handleMouseMove = (e) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      // Support both mouse and touch events
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      const dx = mouseX - center;
      const dy = center - mouseY;

      const angle = (draggingAxis * 60 * Math.PI) / 180;
      const ux = Math.sin(angle);
      const uy = Math.cos(angle);

      const r = dx * ux + dy * uy;
      const constrainedR = Math.max(15, Math.min(100, r));
      updateFromAxis(draggingAxis, constrainedR);

      // Prevent scrolling on touch devices during dragging
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const handleMouseUp = () => {
      setDraggingAxis(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [draggingAxis, coding, concept, security]);

  const radarPoints = values.map((val, idx) => {
    const angle = (idx * 60 * Math.PI) / 180;
    const r = Math.max(15, Math.min(maxVal, val)) * 1.0;
    const x = center + r * Math.sin(angle);
    const y = center - r * Math.cos(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  let recommendTitle = "";
  let recommendDesc = "";
  let recommendType = "info";

  if (coding < 35) {
    recommendType = "warning";
    recommendTitle = "诊断结果：编程动手基底薄弱";
    recommendDesc = "画像智能体检测到您在语法结构与代码改错上存在明显盲区。路径智能体自动拦截前沿理论模块，已在您 timeline 的 Stage 3 沙盒层强制挂载 3 张概念 MCQ 选择题微课。";
  } else if (security < 35) {
    recommendType = "danger";
    recommendTitle = "诊断结果：代码安全与边界意识欠缺";
    recommendDesc = "由于算法边界及内存过滤机制评分较低，系统判定您在生产端编写代码时易发生溢出与不洁注入。推荐：锁定前驱任务，强制激活隔离沙盒的“全面监视模式”。";
  } else if (coding >= 70 && concept >= 70 && security >= 60) {
    recommendType = "success";
    recommendTitle = "诊断结果：自适应学习画像评级为 - 卓越";
    recommendDesc = "您的各项认知能力已全面收敛，画像智能体联合路径、沙盒主管会签成功。自动授予《大模型自适应微专业毕业证书》，结业 PDF 证书已开放下载！";
  } else {
    recommendType = "info";
    recommendTitle = "诊断结果：学习画像均衡稳健发展中";
    recommendDesc = "当前认知脉络合理收敛。画像智能体实时生成 4 道靶向巩固测验题。保持探索，建议在沙盒中增加代码行数以进一步提高调试分数。";
  }

  const getRecommendIcon = () => {
    switch (recommendType) {
      case 'warning':
        return <AlertTriangle size={14} style={{ color: '#f59e0b', marginRight: '6px' }} />;
      case 'danger':
        return <Ban size={14} style={{ color: '#ef4444', marginRight: '6px' }} />;
      case 'success':
        return <Trophy size={14} style={{ color: '#10b981', marginRight: '6px' }} />;
      default:
        return <Rocket size={14} style={{ color: 'var(--primary-neon)', marginRight: '6px' }} />;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const updatedProfile = {
      ...profile,
      practical: coding,
      reasoning: concept,
      debugging: security
    };
    try {
      const data = await apiPost('/profile', updatedProfile);
      setProfile(data);
      setProfileAlert("成功！画像指标已更新并持久化到数据库中。");
    } catch (err) {
      console.error("Failed to save profile:", err);
      setProfileAlert(`保存失败: ${err.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setProfileAlert(''), 3000);
    }
  };

  const ringRadii = [20, 40, 60, 80, 100];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '20px', alignItems: 'stretch' }}>

      {/* Column 1: Sliders */}
      <div className="cyber-card" style={{ padding: '16px', background: 'var(--bg-card-glass)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Palette size={14} style={{ color: 'var(--primary)' }} /> 认知基准调节阀
        </h4>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px', color: 'var(--text-main)' }}>
            <span>编程实践深度 (Coding)</span>
            <span style={{ color: 'var(--primary-neon)', fontWeight: 'bold' }}>{coding}</span>
          </div>
          <input
            type="range"
            min="10" max="100"
            value={coding}
            onChange={(e) => setCoding(Number(e.target.value))}
            className="range-slider-neon"
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px', color: 'var(--text-main)' }}>
            <span>概念理解跨度 (Concept)</span>
            <span style={{ color: 'var(--primary-neon)', fontWeight: 'bold' }}>{concept}</span>
          </div>
          <input
            type="range"
            min="10" max="100"
            value={concept}
            onChange={(e) => setConcept(Number(e.target.value))}
            className="range-slider-neon"
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px', color: 'var(--text-main)' }}>
            <span>安全边界意识 (Security)</span>
            <span style={{ color: 'var(--primary-neon)', fontWeight: 'bold' }}>{security}</span>
          </div>
          <input
            type="range"
            min="10" max="100"
            value={security}
            onChange={(e) => setSecurity(Number(e.target.value))}
            className="range-slider-neon"
          />
        </div>

        {/* Path Recommendation Card */}
        <div style={{
          background: 'rgba(0,0,0,0.15)',
          border: `1px solid ${recommendType === 'warning' ? '#f59e0b' : recommendType === 'danger' ? '#ef4444' : recommendType === 'success' ? '#10b981' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: '10px',
          padding: '12px',
          transition: 'all 0.3s ease'
        }}>
          <h4 style={{ margin: '0 0 6px', fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>
            {getRecommendIcon()}
            {recommendTitle}
          </h4>
          <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{recommendDesc}</p>
        </div>

        {/* Save to Profile Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="cyber-btn"
          style={{
            marginTop: 'auto',
            width: '100%',
            justifyContent: 'center',
            padding: '8px',
            fontSize: '11px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            color: '#fff',
            opacity: saving ? 0.7 : 1,
            cursor: saving ? 'not-allowed' : 1,
            fontWeight: '800'
          }}
        >
          <Save size={12} />
          {saving ? "正在保存..." : "保存修改到真实画像"}
        </button>
      </div>

      {/* Column 2: 6D Detailed Metrics & Profiler Console */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* 6D Progress Bars */}
        <div className="cyber-card" style={{ padding: '16px', background: 'var(--bg-card-glass)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Palette size={14} style={{ color: 'var(--primary)' }} /> 细分认知维度度量
          </h4>
          <div style={{ display: 'grid', gridTemplateRows: 'repeat(6, 1fr)', gap: '9px' }}>
            {[
              { label: "语法规则", val: Math.round(v_syntax), color: "linear-gradient(90deg, #0d9488 0%, #14b8a6 100%)" },
              { label: "边界处理", val: Math.round(v_edge), color: "linear-gradient(90deg, #eab308 0%, #facc15 100%)" },
              { label: "算法复杂度", val: Math.round(v_algo), color: "linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)" },
              { label: "沙盒安全", val: Math.round(v_safety), color: "linear-gradient(90deg, #ef4444 0%, #f87171 100%)" },
              { label: "代码读写", val: Math.round(v_readability), color: "linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)" },
              { label: "逆向调试", val: Math.round(v_debug), color: "linear-gradient(90deg, #ec4899 0%, #f472b6 100%)" }
            ].map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  <span>{item.label}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{item.val}%</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.val}%`, height: '100%', background: item.color, borderRadius: '2px', transition: 'width 0.3s ease-out' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profiler Agent Diagnostic Console */}
        <div style={{
          background: 'rgba(5, 10, 20, 0.6)',
          border: '1px solid rgba(13, 148, 136, 0.25)',
          borderRadius: '12px',
          padding: '12px 14px',
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#34d399',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(13, 148, 136, 0.15)', paddingBottom: '6px', marginBottom: '8px', color: 'rgba(13, 148, 136, 0.7)' }}>
            <span>PROFILER_AGENT_DIAGNOSTICS_v1.0.3</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'blink 1.2s infinite' }}></span>
              ONLINE
            </span>
          </div>

          <div style={{ lineHeight: '1.5' }}>
            <span style={{ color: '#eab308' }}>[画像智能体]</span>: 正在监听认知微调... <br />
            <span style={{ color: 'var(--text-muted)' }}>&gt;</span> 实践分: {coding} | 概念分: {concept} | 安全分: {security} <br />
            <span style={{ color: '#60a5fa' }}>&gt; 判定:</span> {recommendTitle} <br />
            <span style={{ color: 'var(--text-main)' }}>&gt; 策略路由:</span> {recommendDesc.slice(0, 75)}...
            <span style={{ animation: 'blink 0.8s infinite', fontWeight: 'bold' }}>|</span>
          </div>
        </div>
      </div>

      {/* Column 3: Draggable SVG Radar Chart */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <style>{`
          @keyframes spin-clockwise {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes spin-counterclockwise {
            from { transform: rotate(0deg); }
            to { transform: rotate(-360deg); }
          }
          @keyframes blink {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
        `}</style>

        <svg ref={svgRef} width="300" height="300" style={{ overflow: 'visible', userSelect: 'none' }}>
          <defs>
            <radialGradient id="radar-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--primary-neon)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--primary-neon)" stopOpacity="0.55" />
            </radialGradient>
            <filter id="neon-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* HUD Compass outer rings */}
          <circle cx={center} cy={center} r={120} fill="none" stroke="rgba(13, 148, 136, 0.1)" strokeWidth="1" />
          <circle cx={center} cy={center} r={125} fill="none" stroke="rgba(13, 148, 136, 0.2)" strokeWidth="1" strokeDasharray="3 7" style={{ animation: 'spin-clockwise 30s linear infinite', transformOrigin: 'center' }} />
          <circle cx={center} cy={center} r={115} fill="none" stroke="rgba(234, 179, 8, 0.15)" strokeWidth="1" strokeDasharray="25 15" style={{ animation: 'spin-counterclockwise 40s linear infinite', transformOrigin: 'center' }} />

          {/* Concentric rings */}
          {ringRadii.map((r, idx) => {
            const ringPoints = Array.from({ length: 6 }).map((_, i) => {
              const angle = (i * 60 * Math.PI) / 180;
              const x = center + r * Math.sin(angle);
              const y = center - r * Math.cos(angle);
              return `${x},${y}`;
            }).join(' ');
            return (
              <polygon
                key={idx}
                points={ringPoints}
                fill="none"
                stroke="rgba(13, 148, 136, 0.15)"
                strokeWidth="1"
              />
            );
          })}

          {/* 6 axes */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * 60 * Math.PI) / 180;
            const x = center + maxVal * Math.sin(angle);
            const y = center - maxVal * Math.cos(angle);
            return (
              <line
                key={i}
                x1={center} y1={center}
                x2={x} y2={y}
                stroke="rgba(13, 148, 136, 0.25)"
                strokeWidth="1"
              />
            );
          })}

          {/* Value polygon */}
          <polygon
            points={radarPoints}
            fill="url(#radar-gradient)"
            stroke="var(--primary-neon)"
            strokeWidth="2"
            filter="url(#neon-glow-filter)"
            style={{ transition: draggingAxis === null ? 'points 0.3s ease-out' : 'none' }}
          />

          {/* Labels */}
          {labels.map((lbl, idx) => {
            const angle = (idx * 60 * Math.PI) / 180;
            const offset = 138;
            const x = center + offset * Math.sin(angle);
            const y = center - offset * Math.cos(angle);
            return (
              <text
                key={idx}
                x={x} y={y + 4}
                fill="var(--text-muted)"
                fontSize="9px"
                textAnchor="middle"
                fontWeight="bold"
              >
                {lbl}
              </text>
            );
          })}

          {/* Draggable vertices */}
          {values.map((val, idx) => {
            const angle = (idx * 60 * Math.PI) / 180;
            const r = Math.max(15, Math.min(maxVal, val)) * 1.0;
            const x = center + r * Math.sin(angle);
            const y = center - r * Math.cos(angle);
            const isDragging = draggingAxis === idx;

            return (
              <g key={idx} style={{ cursor: 'pointer' }}>
                <circle
                  cx={x} cy={y}
                  r={isDragging ? 7 : 4.5}
                  fill={isDragging ? "var(--primary-neon)" : "#eab308"}
                  stroke="#fff"
                  strokeWidth={isDragging ? 2 : 1}
                  style={{
                    transition: isDragging ? 'none' : 'r 0.15s ease, fill 0.15s ease',
                    filter: 'drop-shadow(0 0 5px rgba(234, 179, 8, 0.6))'
                  }}
                  onMouseDown={() => setDraggingAxis(idx)}
                  onTouchStart={() => setDraggingAxis(idx)}
                />
                {/* Large touch/hover zone */}
                <circle
                  cx={x} cy={y}
                  r={16}
                  fill="transparent"
                  onMouseDown={() => setDraggingAxis(idx)}
                  onTouchStart={() => setDraggingAxis(idx)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default function HomeView() {
  const { profile, pathNodes, setSelectedNode, setActiveTab, fetchNodeResources } = useAppContext();
  const [deltas, setDeltas] = useState({ study_time: 0, quiz_accuracy: 0, mastered_nodes: 0 });

  useEffect(() => {
    if (profile && profile.learning_stats) {
      const stats = profile.learning_stats;
      const key = `edugenesis_prev_stats_${profile.username || 'default'}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const prev = JSON.parse(saved);
          const dTime = (stats.study_time || 0) - (prev.study_time || 0);
          const dAcc = (stats.quiz_accuracy || 0) - (prev.quiz_accuracy || 0);
          const dNodes = (stats.mastered_nodes || 0) - (prev.mastered_nodes || 0);

          if (dTime !== 0 || dAcc !== 0 || dNodes !== 0) {
            setDeltas({ study_time: dTime, quiz_accuracy: dAcc, mastered_nodes: dNodes });
          }
        } catch (e) {
          console.error(e);
        }
      }
      localStorage.setItem(key, JSON.stringify(stats));
    }
  }, [profile]);

  return (
    <>
      <style>{`
        .pulse-glow-green {
          box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
          animation: greenGlow 1.5s infinite alternate;
        }
        @keyframes greenGlow {
          0% { opacity: 0.8; }
          100% { opacity: 1; box-shadow: 0 0 10px rgba(16, 185, 129, 0.6); }
        }
      `}</style>
      {/* Dynamic Welcome Banner */}
      <header className="cyber-card" style={{ padding: '24px 20px', background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.08) 0%, rgba(29, 78, 216, 0.04) 100%)', borderLeft: '4px solid var(--primary-neon)' }}>
        <div className="home-banner-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '0' }}>
            <div className="neon-badge neon-badge-primary" style={{ marginBottom: '14px', display: 'inline-block', maxWidth: '100%', wordBreak: 'break-word' }}>🎓 学术研学中心 (Academic Dashboard)</div>
            <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '10px', lineHeight: '1.3' }} className="neon-text-gradient">
              欢迎回来，{profile.username || '学力体验官'} 👋
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '680px', lineHeight: '1.6', margin: '0 0 16px 0' }}>
              自适应认知画像导师已装载完毕。当前您的最佳首选学习风格为【{profile.cognitive_style}】。系统已根据您在 [{profile.learning_goals.join(', ')}] 的学习反馈进行了 {profile.learning_stats?.mastered_nodes || 0} 个关卡的剪枝与难度对齐。主管智能体与画像分析官实时在线，守护您的极客研学之旅。
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span className="neon-badge neon-badge-warning" style={{ fontSize: '10px', padding: '4px 10px' }}>
                首选风格: {profile.cognitive_style}
              </span>
              <span className="neon-badge neon-badge-primary" style={{ fontSize: '10px', padding: '4px 10px' }}>
                当前目标: {profile.learning_goals[0] || 'Python 基础'}
              </span>
              <span className="neon-badge neon-badge-success" style={{ fontSize: '10px', padding: '4px 10px' }}>
                画像星等: Lv.{Math.floor((profile.knowledge_base || 40) / 20) + 1}
              </span>
            </div>
          </div>

          {/* Radial Progress Chart */}
          {(() => {
            const mastered = profile.learning_stats?.mastered_nodes || 0;
            const progressPct = Math.round((mastered / 8) * 100);
            const radius = 36;
            const circ = 2 * Math.PI * radius;
            const strokeOffset = circ - (progressPct / 100) * circ;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <div style={{ position: 'relative', width: '96px', height: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Rotating outer compass ring */}
                  <svg width="96" height="96" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
                    <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(13, 148, 136, 0.15)" strokeWidth="1" strokeDasharray="3 5" style={{ animation: 'spin-clockwise 15s linear infinite', transformOrigin: 'center' }} />
                  </svg>

                  {/* Progress gauge SVG */}
                  <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--primary-neon)" />
                        <stop offset="100%" stopColor="var(--secondary)" />
                      </linearGradient>
                    </defs>
                    <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                    <circle
                      cx="40" cy="40"
                      r={radius}
                      fill="none"
                      stroke="url(#gauge-gradient)"
                      strokeWidth="6"
                      strokeDasharray={circ}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
                    />
                  </svg>

                  {/* Center percentage text */}
                  <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)', lineHeight: 1 }}>{mastered}/8</span>
                    <span style={{ fontSize: '8px', color: 'var(--text-muted)', marginTop: '2px' }}>通关率</span>
                  </div>
                </div>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 'bold' }}>自适应轨迹掌握度</span>
              </div>
            );
          })()}
        </div>
      </header>

      {/* Stats, Streak and Recommendation Section */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '24px', margin: '24px 0' }}>

        {/* Left Column: Stats & Streak */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Stats Overview */}
          <div className="cyber-card" style={{ padding: '24px', background: 'var(--bg-card-glass)', backdropFilter: 'blur(10px)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} style={{ color: 'var(--primary)' }} /> 学习统计看板
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
              <div style={{ padding: '12px 8px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary-neon)', display: 'block' }}>
                    {profile.learning_stats?.study_time || 0}
                  </span>
                  {deltas.study_time > 0 && (
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '1px 4px', borderRadius: '4px' }} className="pulse-glow-green">
                      +{deltas.study_time}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>累计时长 (分)</span>
              </div>
              <div style={{ padding: '12px 8px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--secondary)', display: 'block' }}>
                    {profile.learning_stats?.quiz_accuracy || 0}%
                  </span>
                  {deltas.quiz_accuracy !== 0 && (
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: deltas.quiz_accuracy > 0 ? '#10b981' : '#ef4444', background: deltas.quiz_accuracy > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '1px 4px', borderRadius: '4px' }}>
                      {deltas.quiz_accuracy > 0 ? `+${deltas.quiz_accuracy}` : `${deltas.quiz_accuracy}`}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>习题正确率</span>
              </div>
              <div style={{ padding: '12px 8px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--accent)', display: 'block' }}>
                    {profile.learning_stats?.mastered_nodes || 0} / 8
                  </span>
                  {deltas.mastered_nodes > 0 && (
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '1px 4px', borderRadius: '4px' }} className="pulse-glow-green">
                      +{deltas.mastered_nodes}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>已掌握知识点</span>
              </div>
            </div>
          </div>

          {/* Streak Tracker */}
          <div className="cyber-card" style={{ padding: '24px', background: 'var(--bg-card-glass)', backdropFilter: 'blur(10px)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> 学习打卡连续周报
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, idx) => {
                const active = profile.learning_stats?.streak?.[idx] || false;
                return (
                  <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{day}</span>
                    <div
                      className={active ? 'pulse-glow' : ''}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: active ? 'linear-gradient(135deg, var(--primary-neon) 0%, var(--secondary) 100%)' : 'rgba(0, 0, 0, 0.05)',
                        border: active ? 'none' : '1px dashed rgba(0,0,0,0.15)',
                        boxShadow: active ? '0 0 10px rgba(15, 118, 110, 0.4)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {active && <CheckCircle2 size={14} style={{ color: '#ffffff' }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Smart Recommendation */}
        <div className="cyber-card" style={{ padding: '24px', background: 'var(--bg-card-glass)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: 'var(--accent)' }} /> 智能体今日推荐
              </h3>
              <span className="neon-badge neon-badge-warning" style={{ fontSize: '9px' }}>画像匹配率 98%</span>
            </div>

            <div style={{ padding: '16px', background: 'rgba(180, 83, 9, 0.02)', borderLeft: '3px solid var(--accent)', borderRadius: '0 8px 8px 0', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {profile.cognitive_style?.includes("Practical") ? (
                  <>
                    <Code2 size={15} style={{ color: 'var(--primary-neon)' }} />
                    <span>动手实践：控制流逻辑 pytest 断言用例</span>
                  </>
                ) : profile.cognitive_style?.includes("Visual") ? (
                  <>
                    <Palette size={15} style={{ color: 'var(--secondary)' }} />
                    <span>视觉讲解：变量引用与内存分配动态脑图</span>
                  </>
                ) : (
                  <>
                    <BookOpen size={15} style={{ color: 'var(--accent)' }} />
                    <span>深度理论：Python 底层对象与内存指针对齐论文精读</span>
                  </>
                )}
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.6' }}>
                系统分析您的 6 维学习画像，针对您较薄弱的知识点进行防御性加强，并推荐了当前匹配您<b>{profile.cognitive_style}</b>风格的自适应学习包。
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              const activeNodeObj = pathNodes.find(n => n.status === 'active') || pathNodes[0];
              setSelectedNode(activeNodeObj);
              setActiveTab('path');
              await fetchNodeResources(activeNodeObj.id);
            }}
            className="cyber-btn"
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
          >
            进入当前关卡学习 <ChevronRight size={16} />
          </button>
        </div>

      </section>

      {/* Core Feature Grid */}


      {/* Developer Sandbox Guide */}
      <div className="cyber-card" style={{ padding: '24px', borderLeft: '4px solid var(--accent)', background: 'rgba(180, 83, 9, 0.03)' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ padding: '10px', background: 'rgba(180, 83, 9, 0.06)', borderRadius: '12px', display: 'flex' }}>
            <Sparkles size={24} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h4 style={{ fontWeight: '700', marginBottom: '6px', fontSize: '15px' }} className="cyan-gradient"> 学习快速适应指南</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
              在左侧菜单切换到 <b>“智能画像导师”</b> 并发送消息（例如输入：<i>“我想学机器学习”</i>）。系统将调用多智能体协同机制，动态调转左侧画像雷达指针，并为您重新编排下方的 <b>“定制路径规划”</b>！
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '28px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Search size={18} style={{ color: 'var(--primary)' }} /> 画像认知模拟调试台 (Radar Sandbox)
        </h3>
        <RadarCustomizer profile={profile} />
      </div>
    </>
  );
}
