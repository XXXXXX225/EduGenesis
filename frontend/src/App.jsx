import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BookOpen,
  MessageSquare,
  TrendingUp,
  FolderGit2,
  Send,
  Cpu,
  User,
  CheckCircle2,
  PlayCircle,
  Lock,
  ArrowRight,
  FileText,
  HelpCircle,
  Video,
  FileCode,
  Map,
  Sparkles,
  Info,
  ChevronRight,
  Download,
  Code2,
  LogOut,
  GraduationCap,
  X,
  Play,
  Pause,
  Copy,
  Check,
  Sun,
  Moon,
  Terminal
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Route/URL helper functions
const parseStateFromURL = () => {
  const path = window.location.pathname;
  const loggedIn = localStorage.getItem('isLoggedIn') === 'true';

  let view = 'landing';
  let mode = 'login';
  let tab = 'home';

  if (path === '/signup') {
    view = 'auth';
    mode = 'signup';
  } else if (path === '/login') {
    view = 'auth';
    mode = 'login';
  } else if (path === '/') {
    view = 'landing';
  } else {
    // If not logged in, any dashboard path (/home, /chat, etc.) fallback to landing page
    if (!loggedIn) {
      view = 'landing';
    } else {
      view = 'dashboard';
      if (path === '/chat') tab = 'chat';
      else if (path === '/path') tab = 'path';
      else if (path === '/resources') tab = 'resources';
      else if (path === '/sandbox') tab = 'sandbox';
      else if (path === '/errors') tab = 'errors';
      else if (path === '/console') tab = 'agent-console';
      else if (path === '/achievements') tab = 'achievements';
      else tab = 'home';
    }
  }

  return { view, mode, tab, loggedIn };
};

const updateURLFromState = (view, mode, tab, loggedIn) => {
  let targetPath = '/';

  if (view === 'landing') {
    targetPath = '/';
  } else if (view === 'auth') {
    targetPath = mode === 'signup' ? '/signup' : '/login';
  } else if (view === 'dashboard') {
    if (tab === 'home') targetPath = '/home';
    else if (tab === 'chat') targetPath = '/chat';
    else if (tab === 'path') targetPath = '/path';
    else if (tab === 'resources') targetPath = '/resources';
    else if (tab === 'sandbox') targetPath = '/sandbox';
    else if (tab === 'errors') targetPath = '/errors';
    else if (tab === 'agent-console') targetPath = '/console';
    else if (tab === 'achievements') targetPath = '/achievements';
    else targetPath = '/home';
  }

  if (window.location.pathname !== targetPath) {
    window.history.pushState(null, '', targetPath);
  }
};

const InteractiveChatBubble = ({ msg, handleSlideSpeech, stopSlideSpeech }) => {
  const [selectedStep, setSelectedStep] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const content = msg.content;
  if (!content) return null;

  // Regexes
  const diagramRegex = /\[DIAGRAM:\s*([^\]|]+)\s*\|\s*([^\]]+)\]/g;
  const videoRegex = /\[VIDEO:\s*([^\]|]+)\s*\|\s*([^\]]+)\]/g;

  const diagramMatch = [...content.matchAll(diagramRegex)][0];
  const videoMatch = [...content.matchAll(videoRegex)][0];

  let cleanText = content
    .replace(diagramRegex, "")
    .replace(videoRegex, "")
    .trim();

  const textElement = cleanText ? (
    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{cleanText}</div>
  ) : null;

  // 1. Render Diagram Card if matched
  let diagramCard = null;
  if (diagramMatch) {
    const stepsStr = diagramMatch[1].trim();
    const detailsStr = diagramMatch[2].trim();

    const steps = stepsStr.split("->").map(s => s.trim());
    const detailsMap = {};

    steps.forEach(step => {
      const escapeStep = step.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`${escapeStep}\\s*:\\s*([^\\n.]+)(?:\\.|\\n|$)`, 'i');
      const match = detailsStr.match(regex);
      if (match) {
        detailsMap[step] = match[1].trim();
      } else {
        detailsMap[step] = "点击查看此步骤的学术详情。";
      }
    });

    const activeStepName = steps[selectedStep] || steps[0];
    const activeStepDetail = detailsMap[activeStepName];

    diagramCard = (
      <div
        className="multimodal-card"
        style={{
          marginTop: '14px',
          background: 'var(--bg-modal-content, rgba(9, 13, 22, 0.7))',
          border: '1px solid var(--border-neon)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-neon)' }} className="pulse-glow" />
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '0.05em' }}>互动拓扑知识链</span>
        </div>

        {/* Steps Flow */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          {steps.map((step, idx) => {
            const isActive = idx === selectedStep;
            return (
              <React.Fragment key={idx}>
                <button
                  onClick={() => setSelectedStep(idx)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                    background: isActive ? 'var(--primary-neon)' : 'rgba(255,255,255,0.04)',
                    color: isActive ? '#000000' : 'var(--text-muted)',
                    border: isActive ? '1px solid var(--primary-neon)' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isActive ? '0 0 12px rgba(15, 118, 110, 0.4)' : 'none'
                  }}
                >
                  {step}
                </button>
                {idx < steps.length - 1 && (
                  <span style={{ color: 'var(--text-muted)', opacity: 0.3, fontSize: '12px', fontWeight: '800' }}>→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Detailed Explanation Panel */}
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '12.5px',
            color: 'var(--text-muted)',
            lineHeight: '1.6',
            minHeight: '44px',
            transition: 'all 0.2s'
          }}
        >
          <strong style={{ color: 'var(--primary-neon)', display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase' }}>
            {activeStepName} 详情：
          </strong>
          {activeStepDetail}
        </div>
      </div>
    );
  }

  // 2. Render Video Card if matched
  let videoCard = null;
  if (videoMatch) {
    const videoTitle = videoMatch[1].trim();
    const videoDesc = videoMatch[2].trim();

    const togglePlayVideo = () => {
      if (isVideoPlaying) {
        stopSlideSpeech();
        setIsVideoPlaying(false);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        setVideoProgress(0);
      } else {
        handleSlideSpeech(videoDesc);
        setIsVideoPlaying(true);
        setVideoProgress(0);

        const duration = 12000;
        const stepTime = 100;
        let elapsed = 0;

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }

        progressIntervalRef.current = setInterval(() => {
          elapsed += stepTime;
          const ratio = Math.min(100, (elapsed / duration) * 100);
          setVideoProgress(ratio);
          if (ratio >= 100) {
            clearInterval(progressIntervalRef.current);
            setIsVideoPlaying(false);
            setVideoProgress(0);
          }
        }, stepTime);
      }
    };

    videoCard = (
      <div
        className="multimodal-card"
        style={{
          marginTop: '14px',
          background: 'var(--bg-modal-content, rgba(9, 13, 22, 0.7))',
          border: '1px solid var(--border-neon)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} className="pulse-glow" />
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '0.05em' }}>
              多模态微视频课程
            </span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            PCM / MP3 讯飞合成中
          </span>
        </div>

        {/* Video Visual Body */}
        <div
          style={{
            position: 'relative',
            background: '#04060a',
            height: '140px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
          }}
        >
          {isVideoPlaying ? (
            <div style={{ zIndex: 1, padding: '14px', textAlign: 'center', maxWidth: '85%' }}>
              <p style={{ fontSize: '12px', color: '#ffffff', lineHeight: '1.5', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                {videoDesc.length > 70 ? videoDesc.slice(0, 67) + "..." : videoDesc}
              </p>
            </div>
          ) : (
            <div style={{ zIndex: 1, textAlign: 'center' }}>
              <h5 style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>{videoTitle}</h5>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>自适应学术讲解微课</p>
            </div>
          )}

          {isVideoPlaying && (
            <div style={{ display: 'flex', gap: '3px', position: 'absolute', bottom: '12px', zIndex: 1 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
                <div
                  key={idx}
                  style={{
                    width: '2px',
                    height: '12px',
                    background: 'var(--primary-neon)',
                    borderRadius: '1px',
                    animation: `bounceWave 0.6s infinite alternate ease-in-out`,
                    animationDelay: `${idx * 0.08}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Video Controls bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
          <button
            onClick={togglePlayVideo}
            style={{
              background: isVideoPlaying ? 'rgba(239, 68, 68, 0.12)' : 'rgba(15, 118, 110, 0.12)',
              border: isVideoPlaying ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--primary-neon)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              color: isVideoPlaying ? '#ef4444' : 'var(--primary-neon)',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
          >
            {isVideoPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '2px' }} />}
          </button>

          <div style={{ flexGrow: 1, background: 'rgba(255,255,255,0.06)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${videoProgress}%`,
                background: 'var(--primary-neon)',
                height: '100%',
                transition: 'width 0.1s linear',
                boxShadow: '0 0 8px var(--primary-neon)'
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {textElement}
      {diagramCard}
      {videoCard}
    </div>
  );
};

const handleCardMouseMove = (e) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const xc = rect.width / 2;
  const yc = rect.height / 2;
  const rotX = -((y - yc) / (rect.height / 2)) * 8;
  const rotY = ((x - xc) / (rect.width / 2)) * 8;

  card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
  const shine = card.querySelector('.card-shine-overlay');
  if (shine) {
    shine.style.opacity = '0.12';
    shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.45) 0%, transparent 60%)`;
  }
};

const handleCardMouseLeave = (e) => {
  const card = e.currentTarget;
  card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  const shine = card.querySelector('.card-shine-overlay');
  if (shine) {
    shine.style.opacity = '0';
  }
};

const MiniSandboxPlayground = () => {
  const initialCode = `def calculate_average(scores):
    # ⚠️ 隐患：如果 scores 传入空列表会因零除崩溃
    return sum(scores) / len(scores)`;

  const fixedCode = `def calculate_average(scores):
    if not scores:
        return 0.0
    return sum(scores) / len(scores)`;

  const [code, setCode] = useState(initialCode);
  const [logs, setLogs] = useState([
    ">>> 系统就绪，等待点击 [启动协同诊断与执行]...",
    "当前内存镜像：隔离沙盒安全级别 - HIGH"
  ]);
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const runDiagnostics = () => {
    if (isRunning) return;
    setIsRunning(true);
    setShowConfetti(false);
    setProgress(5);
    setCode(initialCode);
    setLogs(["[0.0s] 🛡️ [安全卫士智能体]：启动指令流安全过滤..."]);

    // Sequence of simulated agent consensus steps
    setTimeout(() => {
      setLogs(prev => [...prev, "[0.6s] 🛡️ [安全卫士]：安全过滤通过，代码未发现越权或危险库。"]);
      setProgress(25);
    }, 600);

    setTimeout(() => {
      setLogs(prev => [...prev, "[1.2s] 👤 [画像分析智能体]：评估语义网络... 捕获崩溃断点：第 3 行 len(scores) 未作空防范。"]);
      setProgress(50);
    }, 1200);

    setTimeout(() => {
      setLogs(prev => [...prev, "[1.8s] 🗺️ [路径规划智能体]：评估并规划实时修复补丁，自动重构语义决策树..."]);
      setProgress(75);
    }, 1800);

    setTimeout(() => {
      setLogs(prev => [...prev, "[2.4s] ⚙️ [代码沙盒]：热装载测试容器，开始执行测试套件..."]);
      setProgress(90);
      setCode(fixedCode);
    }, 2400);

    setTimeout(() => {
      setLogs(prev => [
        ...prev,
        "[3.2s] ✅ [代码沙盒]：测试用例全部通过！输入 [90, 80] 输出 85.0; 输入 [] 输出 0.0。",
        "[3.5s] 💡 [系统共识]：知识画像已同步更新，错误本 ledger 记录已归档。"
      ]);
      setProgress(100);
      setIsRunning(false);
      setShowConfetti(true);
    }, 3200);
  };

  return (
    <div className="mini-sandbox-container" style={{ position: 'relative' }}>
      {showConfetti && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)',
          animation: 'pulse-ring 1.5s ease-out infinite',
          zIndex: 1
        }} />
      )}

      <div className="editor-header">
        <div className="dot-wrapper">
          <div className="win-dot" style={{ background: '#ef4444' }} />
          <div className="win-dot" style={{ background: '#f59e0b' }} />
          <div className="win-dot" style={{ background: '#10b981' }} />
        </div>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>edugenesis_playground.py</span>
        <div style={{ width: '40px' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Left: VS Code styled editor */}
        <div style={{ background: '#04060b', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
          <pre style={{ margin: 0, fontSize: '12.5px', color: '#10b981', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            <code>{code}</code>
          </pre>
        </div>

        {/* Right: Agent Consensus Console */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isRunning ? '#f59e0b' : '#10b981', display: 'inline-block' }} />
                多智能体共识进度 ({progress}%)
              </span>
              <button
                onClick={runDiagnostics}
                disabled={isRunning}
                className="interactive-btn"
                style={{
                  padding: '6px 14px',
                  fontSize: '11px',
                  borderRadius: '8px',
                  background: isRunning ? 'rgba(255,255,255,0.05)' : 'var(--primary-gradient)',
                  border: 'none',
                  color: '#fff',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  boxShadow: isRunning ? 'none' : '0 0 10px rgba(13,148,136,0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                {isRunning ? '协同诊断中...' : '⚡ 启动协同诊断与执行'}
              </button>
            </div>
            <div className="comm-progress-bar" style={{ marginBottom: '12px' }}>
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="console-log-box">
            {logs.map((item, idx) => (
              <div key={idx} style={{
                marginBottom: '6px',
                color: item.startsWith('>>>') ? '#e2e8f0' : item.includes('✅') ? '#10b981' : item.includes('🛡️') ? '#a855f7' : item.includes('👤') ? '#3b82f6' : '#38bdf8'
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RadarCustomizer = () => {
  // 3 user knobs (10 - 100)
  const [coding, setCoding] = useState(40);
  const [concept, setConcept] = useState(50);
  const [security, setSecurity] = useState(30);

  // Map the 3 inputs to 6 radar coordinates
  const v_syntax = coding * 0.9 + 5;
  const v_edge = security * 0.95 + 5;
  const v_algo = concept * 0.9 + 5;
  const v_safety = security * 0.85 + coding * 0.1 + 5;
  const v_readability = coding * 0.8 + concept * 0.15 + 5;
  const v_debug = (coding + concept) / 2;

  const values = [v_syntax, v_edge, v_algo, v_safety, v_readability, v_debug];
  const labels = ["语法规则", "边界处理", "算法复杂度", "沙盒安全", "代码读写", "逆向调试"];

  // Calculate points coordinates in 300x300 canvas
  const center = 150;
  const maxVal = 100;
  const radarPoints = values.map((val, idx) => {
    // 6 vertices at 60 degree intervals
    const angle = (idx * 60 * Math.PI) / 180;
    const r = Math.max(15, Math.min(maxVal, val)) * 1.0;
    const x = center + r * Math.sin(angle);
    const y = center - r * Math.cos(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  // Get recommendations from path planner dynamically
  let recommendTitle = "";
  let recommendDesc = "";
  let recommendType = "info";

  if (coding < 35) {
    recommendType = "warning";
    recommendTitle = "⚠️ 诊断结果：编程动手基底薄弱";
    recommendDesc = "画像智能体检测到您在语法结构 and 代码改错上存在明显盲区。路径智能体自动拦截前沿理论模块，已在您 timeline 的 Stage 3 沙盒层强制挂载 3 张概念 MCQ 选择题微课。";
  } else if (security < 35) {
    recommendType = "danger";
    recommendTitle = "🚫 诊断结果：代码安全与边界意识欠缺";
    recommendDesc = "由于算法边界及内存过滤机制评分较低，系统判定您在生产端编写代码时易发生溢出和不洁注入。推荐：锁定前驱任务，强制激活隔离沙盒的“全面监视模式”。";
  } else if (coding >= 70 && concept >= 70 && security >= 60) {
    recommendType = "success";
    recommendTitle = "🏆 诊断结果：自适应学习画像评级为 - 卓越";
    recommendDesc = "您的各项认知能力已全面收敛，画像智能体联合路径、沙盒主管会签成功。自动授予《大模型自适应微专业毕业证书》，结业 PDF 证书已开放下载！";
  } else {
    recommendType = "info";
    recommendTitle = "🚀 诊断结果：学习画像均衡稳健发展中";
    recommendDesc = "当前认知脉络合理收敛。画像智能体实时生成 4 道靶向巩固测验题。保持探索，建议在沙盒中增加代码行数以进一步提高调试分数。";
  }

  // Ring radii helper
  const ringRadii = [20, 40, 60, 80, 100];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', alignItems: 'center' }}>
      {/* Left Column: Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', color: 'var(--text-main)' }}>
            <span>编程实践深度 (Coding Practice)</span>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', color: 'var(--text-main)' }}>
            <span>概念理解跨度 (Conceptual Span)</span>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', color: 'var(--text-main)' }}>
            <span>安全与边界意识 (Security Awareness)</span>
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
          background: 'var(--bg-card)',
          border: `1px solid ${recommendType === 'warning' ? '#f59e0b' : recommendType === 'danger' ? '#ef4444' : recommendType === 'success' ? '#10b981' : 'var(--border-neon)'}`,
          borderRadius: '16px',
          padding: '16px',
          marginTop: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          transition: 'all 0.3s ease'
        }}>
          <h4 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}>{recommendTitle}</h4>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{recommendDesc}</p>
        </div>
      </div>

      {/* Right Column: Dynamic SVG Radar Chart */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width="300" height="300" style={{ overflow: 'visible' }}>
          <defs>
            <radialGradient id="radar-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--primary-neon)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="var(--primary-neon)" stopOpacity="0.45" />
            </radialGradient>
          </defs>

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
                stroke="var(--border-neon)"
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
                stroke="var(--border-neon)"
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
            style={{ transition: 'points 0.3s ease-out' }}
          />

          {/* Labels */}
          {labels.map((lbl, idx) => {
            const angle = (idx * 60 * Math.PI) / 180;
            const offset = 120;
            const x = center + offset * Math.sin(angle);
            const y = center - offset * Math.cos(angle);
            return (
              <text
                key={idx}
                x={x} y={y + 4}
                fill="var(--text-muted)"
                fontSize="10px"
                textAnchor="middle"
                fontWeight="bold"
              >
                {lbl}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default function App() {
  const initialRoute = parseStateFromURL();
  const [isLoggedIn, setIsLoggedIn] = useState(initialRoute.loggedIn);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [currentView, setCurrentView] = useState(initialRoute.view); // 'landing' | 'auth' | 'dashboard'
  const [authMode, setAuthMode] = useState(initialRoute.mode); // 'login' | 'signup'

  // Interactive Landing Demo states
  const [demoStyle, setDemoStyle] = useState('practical'); // 'practical' | 'theoretical' | 'visual'
  const [demoProfile, setDemoProfile] = useState({
    knowledge_base: 30,
    learning_pace: 45,
    engagement: 85,
    reasoning: 60,
    debugging: 90,
    practical: 95
  });
  const [stats, setStats] = useState({ activeUsers: 0, efficiency: 0, accuracy: 0 });
  const [activeDemoAgent, setActiveDemoAgent] = useState('executive'); // 'executive' | 'profile' | 'path'
  const [simActiveAgent, setSimActiveAgent] = useState('executive');
  const [simScenario, setSimScenario] = useState('');
  const [simLogs, setSimLogs] = useState([]);
  const [simConsensus, setSimConsensus] = useState(0);
  const [simIsRunning, setSimIsRunning] = useState(false);

  // Registration inputs
  const [regUsername, setRegUsername] = useState(() => localStorage.getItem('regUsername') || '');
  const [regPassword, setRegPassword] = useState('');
  const [regCognitiveStyle, setRegCognitiveStyle] = useState('Practical Coding');
  const [regLearningGoal, setRegLearningGoal] = useState('Python Basics');

  // Login inputs
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Authentication error state
  const [authError, setAuthError] = useState('');

  // Loading orchestration states
  const [isLoadingOrchestration, setIsLoadingOrchestration] = useState(false);
  const [orchestrationStep, setOrchestrationStep] = useState(0);

  const [activeTab, setActiveTab] = useState(initialRoute.tab);
  const [profile, setProfile] = useState({
    knowledge_base: 40,
    learning_pace: 50,
    cognitive_style: "Practical Coding",
    error_patterns: ["Syntax Errors", "Indentation Issues"],
    learning_goals: ["Python Basics"],
    engagement: 80
  });

  // 1a. Listen to URL path changes (e.g. browser back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const state = parseStateFromURL();
      setIsLoggedIn(state.loggedIn);
      setCurrentView(state.view);
      setAuthMode(state.mode);
      setActiveTab(state.tab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 1b. Update URL path when internal navigation states change
  useEffect(() => {
    updateURLFromState(currentView, authMode, activeTab, isLoggedIn);
  }, [currentView, authMode, activeTab, isLoggedIn]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!regUsername.trim() || !regPassword.trim()) return;
    setAuthError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername,
          password: regPassword,
          cognitive_style: regCognitiveStyle,
          learning_goals: [regLearningGoal]
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || '注册失败，请检查学术网络或更换昵称。');
      }

      // If successful, trigger loading orchestration animation
      setIsLoadingOrchestration(true);
      setOrchestrationStep(0);

      setTimeout(() => {
        setOrchestrationStep(1);
      }, 1200);

      setTimeout(() => {
        setOrchestrationStep(2);
      }, 2400);

      setTimeout(() => {
        setOrchestrationStep(3);
      }, 3600);

      setTimeout(async () => {
        try {
          // Fetch updated profile
          const profileRes = await fetch(`http://127.0.0.1:8000/api/profile?username=${regUsername}`);
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setProfile(profileData);
          }

          // Fetch updated path
          const pathRes = await fetch(`http://127.0.0.1:8000/api/path?username=${regUsername}`);
          if (pathRes.ok) {
            const pathData = await pathRes.json();
            setPathNodes(pathData.nodes);
          }
        } catch (err) {
          console.warn("Error fetching initial states on registration complete:", err);
        } finally {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('regUsername', regUsername);
          setIsLoadingOrchestration(false);
          setIsLoggedIn(true);
          setCurrentView('dashboard');
          setActiveTab('home');
        }
      }, 4800);

    } catch (err) {
      setAuthError(err.message);
    }
  };

  const runTopologySimulation = (scenarioKey) => {
    if (simIsRunning) return;
    setSimIsRunning(true);
    setSimScenario(scenarioKey);
    setSimLogs([]);
    setSimConsensus(0);

    const steps = {
      diagnose: [
        { agent: 'executive', log: '💡 [主管智能体]: 捕获学生在前测输入中提供的兴趣与学术基础。启动画像推演...', consensus: 20 },
        { agent: 'profile', log: '🧠 [画像智能体]: 基于输入提取关键词 "机器学习", "分类边界"，更新雷达：[理论分析] -> 85%。判定为“硬核理论”风格。', consensus: 50 },
        { agent: 'path', log: '🗺️ [路径智能体]: 检索知识拓扑图。重构路径：Stage 1 变更为 "梯度下降数学偏导证明"，生成对应课件。', consensus: 80 },
        { agent: 'security', log: '🔒 [安全校验智能体]: 校验推送的线性公式及学术数据，防幻觉事实检查：PASS。学术安全共识达成！', consensus: 100 }
      ],
      sandbox_success: [
        { agent: 'executive', log: '💡 [主管智能体]: 捕获到用户在 AI 编程沙盒成功通过 PyTest 全量用例。启动学时统计。', consensus: 30 },
        { agent: 'profile', log: '🧠 [画像智能体]: 雷达更新：[实操应用] +12%，学习时长 +10 分钟。诊断出学生对 Python list 切片熟练度极高。', consensus: 60 },
        { agent: 'path', log: '🗺️ [路径智能体]: 推进主线关卡。解锁 Stage 2 "面向对象封装 CLI 计算器" 及 "代码重构最佳实践"。', consensus: 85 },
        { agent: 'security', log: '🔒 [安全校验智能体]: 扫描解锁命令以及写入日志参数安全性。校验共识：SUCCESS。', consensus: 100 }
      ],
      remedy: [
        { agent: 'executive', log: '💡 [主管智能体]: 捕获到用户在单元测试中产生 IndexOutOfBoundsError。紧急触发纠偏。', consensus: 25 },
        { agent: 'profile', log: '🧠 [画像智能体]: 画像微调：[易错倾向-越界率] 增加。标记知识漏洞 "数组边界"，写入错题 ledger。', consensus: 55 },
        { agent: 'path', log: '🗺️ [路径智能体]: 中止主线推进。动态回溯，逆向从错题库调度同类考点 MCQ 测试，开启靶向纠偏。', consensus: 80 },
        { agent: 'security', log: '🔒 [安全校验智能体]: 检索错题模板，过滤可能产生的歧义代码，安全审核：PASS。靶向训练包分发！', consensus: 100 }
      ]
    };

    const scenarioSteps = steps[scenarioKey];
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < scenarioSteps.length) {
        const stepData = scenarioSteps[currentStep];
        setSimActiveAgent(stepData.agent);
        setSimLogs(prev => [...prev, stepData.log]);
        setSimConsensus(stepData.consensus);
        currentStep++;
      } else {
        clearInterval(interval);
        setSimIsRunning(false);
      }
    }, 1500);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) return;
    setAuthError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || '登录失败，请核对您的账户凭证。');
      }

      const resData = await response.json();

      // If login successful, show short loading orchestration
      setIsLoadingOrchestration(true);
      setOrchestrationStep(0);

      setTimeout(() => {
        setOrchestrationStep(1);
      }, 800);

      setTimeout(() => {
        setOrchestrationStep(3);
      }, 1600);

      setTimeout(async () => {
        try {
          // Sync frontend local profile
          const profileRes = await fetch(`http://127.0.0.1:8000/api/profile?username=${resData.username}`);
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setProfile(profileData);
          }

          // Sync frontend local path
          const pathRes = await fetch(`http://127.0.0.1:8000/api/path?username=${resData.username}`);
          if (pathRes.ok) {
            const pathData = await pathRes.json();
            setPathNodes(pathData.nodes);
          }
        } catch (err) {
          console.warn("Error fetching states on login complete:", err);
        } finally {
          // Set registration username to correct value for Sidebar display
          setRegUsername(resData.username);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('regUsername', resData.username);
          setIsLoadingOrchestration(false);
          setIsLoggedIn(true);
          setCurrentView('dashboard');
          setActiveTab('home');
        }
      }, 2400);

    } catch (err) {
      setAuthError(err.message);
    }
  };

  // 5. Landing / Auth Entry Animation using GSAP
  useEffect(() => {
    setAuthError('');
    if (!isLoggedIn) {
      const ctx = gsap.context(() => {
        if (currentView === 'landing') {
          gsap.fromTo(".anim-fade-in",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
          );
        }
        if (currentView === 'auth') {
          gsap.fromTo(".anim-scale-up",
            { opacity: 0, scale: 0.94 },
            { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.15)" }
          );
        }
      });
      return () => ctx.revert();
    }
  }, [currentView, authMode, isLoggedIn]);

  const demoProfileAnimRef = useRef({
    knowledge_base: 30,
    learning_pace: 45,
    engagement: 85,
    reasoning: 60,
    debugging: 90,
    practical: 95
  });

  useEffect(() => {
    let targets = {};
    if (demoStyle === 'practical') {
      targets = { knowledge_base: 30, learning_pace: 45, engagement: 85, reasoning: 60, debugging: 90, practical: 95 };
    } else if (demoStyle === 'theoretical') {
      targets = { knowledge_base: 80, learning_pace: 75, engagement: 70, reasoning: 95, debugging: 65, practical: 50 };
    } else {
      targets = { knowledge_base: 45, learning_pace: 60, engagement: 90, reasoning: 75, debugging: 75, practical: 70 };
    }

    const ctx = gsap.context(() => {
      gsap.to(demoProfileAnimRef.current, {
        ...targets,
        duration: 0.8,
        ease: "power2.out",
        onUpdate: () => {
          setDemoProfile({
            knowledge_base: Math.round(demoProfileAnimRef.current.knowledge_base),
            learning_pace: Math.round(demoProfileAnimRef.current.learning_pace),
            engagement: Math.round(demoProfileAnimRef.current.engagement),
            reasoning: Math.round(demoProfileAnimRef.current.reasoning),
            debugging: Math.round(demoProfileAnimRef.current.debugging),
            practical: Math.round(demoProfileAnimRef.current.practical)
          });
        }
      });
      // also animate the demo node changes (only if landing page is active)
      if (currentView === 'landing' && !isLoggedIn) {
        gsap.fromTo(".demo-path-node",
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, duration: 0.3, stagger: 0.06, ease: "power1.out" }
        );
      }
    });
    return () => ctx.revert();
  }, [demoStyle]);

  useEffect(() => {
    if (currentView === 'landing') {
      const ctx = gsap.context(() => {
        // Direct DOM selection for stats numbers to avoid React state re-renders
        const elUsers = document.querySelector('.stat-num-users');
        const elEff = document.querySelector('.stat-num-efficiency');
        const elAcc = document.querySelector('.stat-num-accuracy');

        if (elUsers && elEff && elAcc) {
          const statsVal = { users: 0, eff: 0, acc: 0 };
          gsap.to(statsVal, {
            users: 142850,
            eff: 42.8,
            acc: 99.2,
            scrollTrigger: {
              trigger: ".stats-row",
              start: "top 90%",
              toggleActions: "play none none none"
            },
            duration: 1.8,
            ease: "power3.out",
            onUpdate: () => {
              elUsers.innerText = Math.round(statsVal.users).toLocaleString();
              elEff.innerText = statsVal.eff.toFixed(1);
              elAcc.innerText = statsVal.acc.toFixed(1);
            }
          });
        }

        // Stagger fade-in for feature cards (using fromTo to prevent React double-render stickiness)
        gsap.fromTo(".grid-cols-3 .cyber-card",
          { opacity: 0, y: 35 },
          {
            scrollTrigger: {
              trigger: ".grid-cols-3",
              start: "top 85%",
              toggleActions: "play none none none"
            },
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: "power2.out"
          }
        );

        // Smooth fade-in for sandbox
        gsap.fromTo("#sandbox .sandbox-grid",
          { opacity: 0, y: 40 },
          {
            scrollTrigger: {
              trigger: "#sandbox",
              start: "top 85%",
              toggleActions: "play none none none"
            },
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out"
          }
        );

        // Smooth fade-in for architecture
        gsap.fromTo("#architecture .cyber-card",
          { opacity: 0, y: 40 },
          {
            scrollTrigger: {
              trigger: "#architecture",
              start: "top 85%",
              toggleActions: "play none none none"
            },
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out"
          }
        );

        // Timeline scroll progress animation (optimized using transform: scaleY)
        gsap.to(".timeline-line-progress", {
          scaleY: 1,
          scrollTrigger: {
            trigger: ".timeline-container",
            start: "top 70%",
            end: "bottom 80%",
            scrub: true
          }
        });

        // Timeline item scroll triggers with fade-in and stagger
        gsap.utils.toArray(".timeline-item").forEach((item, idx) => {
          gsap.fromTo(item.querySelector(".timeline-card"),
            { opacity: 0, x: idx % 2 === 0 ? 50 : -50, scale: 0.95 },
            {
              scrollTrigger: {
                trigger: item,
                start: "top 80%",
                toggleActions: "play none none reverse"
              },
              opacity: 1,
              x: 0,
              scale: 1,
              duration: 0.6,
              ease: "power2.out",
              onStart: () => item.classList.add("active"),
              onReverseComplete: () => item.classList.remove("active")
            }
          );
        });
      });
      return () => ctx.revert();
    }
  }, [currentView]);

  // State to hold animated numerical profile values (for smooth SVG morphing)
  const [displayProfile, setDisplayProfile] = useState({ ...profile });
  const profileAnimRef = useRef({
    knowledge_base: 40,
    learning_pace: 50,
    engagement: 80
  });

  const [pathNodes, setPathNodes] = useState([
    { id: "node1", title: "Python 环境部署", status: "completed", description: "安装 Python 与 VS Code 软件配置", resources: ["pdf", "code"] },
    { id: "node2", title: "变量与基础数据类型", status: "active", description: "探索整型、浮点型、字符串及变量绑定", resources: ["slide", "pdf", "quiz"] },
    { id: "node3", title: "控制流与条件判断", status: "locked", description: "If 条件分支、逻辑运算与流程控制", resources: ["slide", "quiz", "code"] },
    { id: "node4", title: "循环结构与迭代", status: "locked", description: "While 与 For 循环及 Break/Continue 控制", resources: ["slide", "quiz"] },
    { id: "node5", title: "数据结构进阶", status: "locked", description: "列表、元组、字典与集合的增删改查", resources: ["slide", "pdf", "quiz", "code"] },
    { id: "node6", title: "函数与模块化编程", status: "locked", description: "定义可重用函数、形参实参与作用域", resources: ["slide", "pdf", "mindmap", "code"] },
    { id: "node7", title: "异常处理与文件操作", status: "locked", description: "Try-Except 错误捕获与本地文本文件读写", resources: ["code", "quiz"] },
    { id: "node8", title: "综合项目：自适应计算器", status: "locked", description: "结合函数与异常处理实现计算器实践", resources: ["code", "quiz"] }
  ]);

  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: '您好！我是您的个性化学习助教。我会根据我们的对话动态构建您的学习画像，并定制专属的学习路径。你可以告诉我你的编程水平，或者发送“我想学机器学习”来调整内容。' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [tutorStatus, setTutorStatus] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  // Member B & C Interactive states
  const [diagnosticLogs, setDiagnosticLogs] = useState([
    { time: new Date().toLocaleTimeString(), log: "多智能体协同网络部署完成，开始监听特征变动。" }
  ]);
  const [profileAlert, setProfileAlert] = useState('');
  const [isRegeneratingPath, setIsRegeneratingPath] = useState(false);
  const [selectedNodeResources, setSelectedNodeResources] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  // Slides Player states
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isPlayingSlide, setIsPlayingSlide] = useState(false);
  const [slideTypingText, setSlideTypingText] = useState('');

  // Interactive Quiz states
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizStep, setQuizStep] = useState('intro'); // 'intro' | 'question' | 'completed'
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [quizQuestionIdx, setQuizQuestionIdx] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState('');
  const [copyCodeText, setCopyCodeText] = useState('复制源码');

  // 💻 AI Sandbox states
  const [sandboxChallenge, setSandboxChallenge] = useState(null);
  const [sandboxCode, setSandboxCode] = useState(
    "# 任务：编写一个函数 check_even(num)，判断一个数字是否是偶数，返回 True 或 False\n" +
    "def check_even(num):\n" +
    "    # 在下方编写你的代码逻辑\n" +
    "    if num % 2 == 0:\n" +
    "        return True\n" +
    "    else:\n" +
    "        return False\n"
  );
  const [sandboxTerminal, setSandboxTerminal] = useState([
    "=== EduGenesis AI Sandbox Terminal v1.0.0 ===",
    "系统就绪。编写代码并点击“运行测试”按钮以执行 PyTest 单元测试。"
  ]);
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);
  const [sandboxAIAdvice, setSandboxAIAdvice] = useState('');

  // 📔 Smart Error Notebook states
  const [errorQuestions, setErrorQuestions] = useState([
    {
      id: "err1",
      title: "局部变量先引用后赋值错误 (UnboundLocalError)",
      code: "def process_data(x):\n    print(y)  # 错误：在赋值前引用\n    y = x + 10\n    return y\n\nprocess_data(5)",
      error_msg: "UnboundLocalError: local variable 'y' referenced before assignment",
      ai_explanation: "在 Python 中，如果函数体内对变量有赋值操作（如 y = x + 10），Python 编译器会默认将该变量视为局部变量。但是在第 2 行执行 print(y) 时，局部变量 y 尚未被赋值，因此抛出 UnboundLocalError。修复方案：将 print(y) 移到 y = x + 10 赋值语句之后，或者在引用前确保变量已被声明。",
      solution: "def process_data(x):\n    y = x + 10\n    print(y)\n    return y"
    },
    {
      id: "err2",
      title: "代码块缩进对齐不一致错误 (IndentationError)",
      code: "def check_score(score):\n    if score >= 60:\n        print('及格')\n      return True  # 错误：缩进不一致\n    return False",
      error_msg: "IndentationError: unindent does not match any outer indentation level",
      ai_explanation: "第 4 行 return True 前面只有 6 个空格缩进，既没有和 if 块（4个空格）对齐，也没有和 if 内部的 print（8个空格）对齐。这破坏了 Python 强制缩进块的语法规则，导致解释器编译失败。修复方案：将第 4 行缩进修改为 8 个空格，使其完全归入 if 流程块中。",
      solution: "def check_score(score):\n    if score >= 60:\n        print('及格')\n        return True\n    return False"
    }
  ]);
  const [selectedErrorExp, setSelectedErrorExp] = useState(null);

  // 🤖 Multi-Agent Console states
  const [agentLogs, setAgentLogs] = useState([
    { time: new Date().toLocaleTimeString(), sender: "主管智能体", log: "多智能体系统协同网初始化成功，正在监听画像及路由特征。" },
    { time: new Date().toLocaleTimeString(), sender: "画像智能体", log: "画像智能代理网络连接正常。已载入当前用户的大一体验官基准画像指标。" },
    { time: new Date().toLocaleTimeString(), sender: "路径智能体", log: "定制路径规划协同代理已装载，当前轨迹节点数量：8。" },
    { time: new Date().toLocaleTimeString(), sender: "安全校验智能体", log: "密匙校验通道握手完成。已开启大模型防幻觉与输入合规过滤检测。" }
  ]);
  const [activeConsoleAgent, setActiveConsoleAgent] = useState('executive'); // 'executive' | 'profile' | 'path' | 'security'

  // Periodically fetch live multi-agent command console logs from backend when tab is active
  useEffect(() => {
    if (activeTab !== 'agent-console') return;

    // Initial fetch
    fetchConsoleLogs();

    // Poll every 3 seconds
    const interval = setInterval(() => {
      fetchConsoleLogs();
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Refs for GSAP scoping & animation
  const mainContentRef = useRef(null);
  const chatEndRef = useRef(null);
  const slideAudioRef = useRef(null);


  const goPortalHome = () => {
    if (currentView === 'landing') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('landing');
    }
  };

  const goDashboardHome = () => {
    setCurrentView('dashboard');
    setActiveTab('home');
    mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Initial Page Load Animation (Stagger Reveal with React 18 StrictMode Safety)
  useEffect(() => {
    // Creating GSAP context ensures cleanup on double-mounting
    const ctx = gsap.context(() => {
      // Ambient floating glowing orbs
      gsap.to(".glow-orb-1", {
        x: "random(-60, 60)",
        y: "random(-60, 60)",
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(".glow-orb-2", {
        x: "random(-60, 60)",
        y: "random(-60, 60)",
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    });

    return () => ctx.revert(); // Cleans up and prevents opacity getting stuck at 0
  }, []);

  // 1b. Sidebar Entrance Animation on Login (using fromTo to prevent double-mount render stickiness)
  useEffect(() => {
    if (isLoggedIn) {
      const ctx = gsap.context(() => {
        gsap.fromTo(".sidebar-anim-item",
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            stagger: 0.08,
            duration: 0.8,
            ease: "power3.out"
          }
        );
      });
      return () => ctx.revert();
    }
  }, [isLoggedIn]);

  // 2. Tab Change Fade-in Animation
  useEffect(() => {
    if (isLoggedIn && mainContentRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(mainContentRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
      }, mainContentRef);

      return () => ctx.revert();
    }
  }, [activeTab, isLoggedIn]);

  // 3. Dynamic Radar Chart Polygon Morph Animation using GSAP
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(profileAnimRef.current, {
        knowledge_base: profile.knowledge_base,
        learning_pace: profile.learning_pace,
        engagement: profile.engagement,
        duration: 1.2,
        ease: "elastic.out(1, 0.6)",
        onUpdate: () => {
          setDisplayProfile(prev => ({
            ...prev,
            knowledge_base: Math.round(profileAnimRef.current.knowledge_base),
            learning_pace: Math.round(profileAnimRef.current.learning_pace),
            engagement: Math.round(profileAnimRef.current.engagement)
          }));
        }
      });
    });

    return () => ctx.revert();
  }, [profile]);

  // 4. Chat Bubble Entrance Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const bubbles = document.querySelectorAll('.chat-bubble-anim');
      if (bubbles.length > 0) {
        const lastBubble = bubbles[bubbles.length - 1];
        gsap.fromTo(lastBubble,
          { opacity: 0, y: 15, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.2)" }
        );
      }
    });
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    return () => ctx.revert();
  }, [chatHistory, tutorStatus]);

  // Fetch initial profile and path from backend on mount
  useEffect(() => {
    const username = localStorage.getItem('regUsername') || 'default_user';
    const profileUrl = `http://127.0.0.1:8000/api/profile?username=${username}`;
    const pathUrl = `http://127.0.0.1:8000/api/path?username=${username}`;

    fetch(profileUrl)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
      })
      .catch(err => console.warn("Backend not running yet, using local mock state.", err));

    fetch(pathUrl)
      .then(res => res.json())
      .then(data => {
        setPathNodes(data.nodes);
        // Find active node and fetch its resources
        const activeNode = data.nodes.find(n => n.status === 'active') || data.nodes[0];
        if (activeNode) {
          fetchNodeResources(activeNode.id);
        }
      })
      .catch(err => console.warn("Backend not running yet, using local mock state.", err));
  }, []);

  const fetchNodeResources = async (nodeId) => {
    // Show spinner if we fetch again
    setSelectedNodeResources(null);
    try {
      const username = localStorage.getItem('regUsername') || 'default_user';
      const res = await fetch(`http://127.0.0.1:8000/api/resources?node_id=${nodeId}&username=${username}`);
      if (res.ok) {
        const data = await res.json();
        // Fallback to mock data if backend has no resources generated yet to avoid blank page
        if (Object.keys(data).length === 0) {
          setSelectedNodeResources({
            pdf: `# ${selectedNode?.title || "自适应课本"}讲解\n\n本章节知识点由自适应多智能体网络根据您的画像诊断定制编排。\n\n## 1. 核心定义与概念\n在自适应学习中，理解底层机制是掌握本章节的关键。建议通过旁边的“知识脑图”直观理清概念拓扑关系。\n\n## 2. 防御性安全编码规约\n请注意，在设计复杂的网络架构或算法单元时，务必保障类型一致性，防范空指针或解构异常。`,
            slide: [
              { title: `第1页: 欢迎学习 ${selectedNode?.title || "自适应模块"}`, content: "我们将通过结合多模态语音播放与动画特效，带您深入浅出地掌握本章核心逻辑。" },
              { title: "第2页: 核心避坑指南与错误模式", content: "根据系统对您常见错误的画像诊断，本章节已强化防幻觉和防御性断言测试校验。" }
            ],
            mindmap: "graph TD\nA[核心概念] --> B[基础应用]\nA --> C[安全规范]",
            code: "# -*- coding: utf-8 -*-\n# EduGenesis 默认实操校验脚本\n\ndef check_even(num):\n    # 验证是否为偶数\n    return num % 2 == 0\n\ndef test_check_even():\n    assert check_even(2) is True\n    assert check_even(3) is False\n",
            quiz: [
              {
                question: "根据系统的认知风格适配，下列哪种学习方式能提供最高的吸收效率？",
                options: ["阅读无图解的长篇学术论文", "结合图解说明、音画对齐课件与手写代码实践", "死记硬背语法规则", "完全依赖大模型而不加校验"],
                answer: 1,
                explanation: "结合图解、语音播报和代码实践符合自适应画像的多模态认知偏好，也是本系统的核心设计宗旨。"
              }
            ]
          });
        } else {
          setSelectedNodeResources(data);
        }
      }
    } catch (err) {
      console.error("Error fetching resources:", err);
      // If backend is not available, show mock resources
      setSelectedNodeResources({
        pdf: `# ${selectedNode?.title || "自适应课本"}讲解\n\n本章节知识点由自适应多智能体网络根据您的画像诊断定制编排。\n\n## 1. 核心定义与概念\n在自适应学习中，理解底层机制是掌握本章节的关键。建议通过旁边的“知识脑图”直观理清概念拓扑关系。\n\n## 2. 防御性安全编码规约\n请注意，在设计复杂的网络架构或算法单元时，务必保障类型一致性，防范空指针或解构异常。`,
        slide: [
          { title: `第1页: 欢迎学习 ${selectedNode?.title || "自适应模块"}`, content: "我们将通过结合多模态语音播放与动画特效，带您深入浅出地掌握本章核心逻辑。" },
          { title: "第2页: 核心避坑指南与错误模式", content: "根据系统对您常见错误的画像诊断，本章节已强化防幻觉和防御性断言测试校验。" }
        ],
        mindmap: "graph TD\nA[核心概念] --> B[基础应用]\nA --> C[安全规范]",
        code: "# -*- coding: utf-8 -*-\n# EduGenesis 默认实操校验脚本\n\ndef check_even(num):\n    # 验证是否为偶数\n    return num % 2 == 0\n\ndef test_check_even():\n    assert check_even(2) is True\n    assert check_even(3) is False\n",
        quiz: [
          {
            question: "根据系统的认知风格适配，下列哪种学习方式能提供最高的吸收效率？",
            options: ["阅读无图解的长篇学术论文", "结合图解说明、音画对齐课件与手写代码实践", "死记硬背语法规则", "完全依赖大模型而不加校验"],
            answer: 1,
            explanation: "结合图解、语音播报和代码实践符合自适应画像的多模态认知偏好，也是本系统的核心设计宗旨。"
          }
        ]
      });
    }
  };

  const fetchSandboxChallenge = async (nodeId = null) => {
    try {
      const username = localStorage.getItem('regUsername') || 'default_user';
      const nodeParam = nodeId ? `&node_id=${nodeId}` : '';
      const res = await fetch(`http://127.0.0.1:8000/api/sandbox/challenge?username=${username}${nodeParam}`);
      if (res.ok) {
        const data = await res.json();
        setSandboxChallenge(data);
        setSandboxCode(data.initial_code);
      }
    } catch (err) {
      console.warn("Failed to fetch sandbox challenge:", err);
    }
  };

  const fetchErrors = async () => {
    try {
      const username = localStorage.getItem('regUsername') || 'default_user';
      const res = await fetch(`http://127.0.0.1:8000/api/errors?username=${username}`);
      if (res.ok) {
        const data = await res.json();
        setErrorQuestions(data);
      }
    } catch (err) {
      console.warn("Failed to fetch error notebook questions:", err);
    }
  };

  const fetchConsoleLogs = async () => {
    try {
      const username = localStorage.getItem('regUsername') || 'default_user';
      const res = await fetch(`http://127.0.0.1:8000/api/console/logs?username=${username}`);
      if (res.ok) {
        const data = await res.json();
        setAgentLogs(data);
      }
    } catch (err) {
      console.warn("Failed to fetch console logs:", err);
    }
  };

  // Fetch tab-specific data from backend
  useEffect(() => {
    if (activeTab === 'sandbox') {
      const targetNodeId = selectedNode?.id || null;
      fetchSandboxChallenge(targetNodeId);
    } else if (activeTab === 'errors') {
      fetchErrors();
    } else if (activeTab === 'agent-console') {
      fetchConsoleLogs();
    }
  }, [activeTab, selectedNode]);

  const handleDiagnoseError = async (eq) => {
    setSelectedErrorExp({
      ...eq,
      ai_explanation: "🧠 [画像与导师智能体] 正在进行深度多维学术特征提取与诊断中，请稍候..."
    });
    try {
      const username = localStorage.getItem('regUsername') || 'default_user';
      const response = await fetch('http://127.0.0.1:8000/api/errors/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error_id: eq.id,
          username: username
        })
      });
      if (response.ok) {
        const result = await response.json();
        setSelectedErrorExp({
          ...eq,
          ai_explanation: result.explanation
        });
      } else {
        setSelectedErrorExp({
          ...eq,
          ai_explanation: "❌ 诊断获取失败，请稍后重试。"
        });
      }
    } catch (err) {
      setSelectedErrorExp({
        ...eq,
        ai_explanation: `❌ 诊断异常：${err.message}`
      });
    }
  };

  const handleRemedyPractice = async (eq) => {
    setProfileAlert("🧠 [画像智能体] 正在为您生成自适应同类强化测试题...");
    try {
      const username = localStorage.getItem('regUsername') || 'default_user';
      const response = await fetch('http://127.0.0.1:8000/api/errors/generate-remedy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error_id: eq.id,
          username: username
        })
      });
      if (response.ok) {
        const quizData = await response.json();
        // Temporary mock/override node resources with this quiz
        setSelectedNodeResources({
          quiz: [quizData]
        });
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizStep('intro');
        setQuizQuestionIdx(0);
        setQuizCorrectCount(0);
        setQuizFeedback('');

        setTimeout(() => {
          setProfileAlert('');
          setActiveModal('quiz');
        }, 800);
      } else {
        setProfileAlert("❌ 同类题生成失败。");
        setTimeout(() => setProfileAlert(''), 2000);
      }
    } catch (err) {
      setProfileAlert(`❌ 异常：${err.message}`);
      setTimeout(() => setProfileAlert(''), 2000);
    }
  };

  const submitChatMessage = async (messageText) => {
    if (isStreaming || !messageText.trim()) return;

    const userMessage = { role: 'user', content: messageText };
    setChatHistory(prev => [...prev, userMessage]);
    setIsStreaming(true);
    setTutorStatus('🧠 [主管智能体] 正在唤醒协同网络...');

    let assistantMessageText = '';
    setChatHistory(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const username = localStorage.getItem('regUsername') || 'default_user';
      const response = await fetch(`http://127.0.0.1:8000/api/chat?username=${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatHistory, userMessage],
          current_profile: profile
        })
      });

      if (!response.ok) throw new Error("API Connection failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));

              if (data.type === 'status') {
                setTutorStatus(data.status);
              } else if (data.type === 'content') {
                setTutorStatus('');
                assistantMessageText += data.content;
                setChatHistory(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1].content = assistantMessageText;
                  return updated;
                });
              } else if (data.type === 'profile_update') {
                setProfile(data.profile);
                setProfileAlert('主管智能体已为您同步更新 6 维学习画像！');
                setTimeout(() => setProfileAlert(''), 4000);
                setDiagnosticLogs(prev => [
                  ...prev,
                  {
                    time: new Date().toLocaleTimeString(),
                    log: `画像指标变动: 知识库=${data.profile.knowledge_base}%, 节奏=${data.profile.learning_pace}%, 风格=${data.profile.cognitive_style}`
                  }
                ]);
              } else if (data.type === 'path_update') {
                setPathNodes(data.nodes);
              } else if (data.type === 'done') {
                setIsStreaming(false);
                setTutorStatus('');
              }
            } catch (err) {
              console.error("SSE Parse Error:", trimmed);
            }
          }
        }
      }
    } catch (error) {
      console.error("Connection error:", error);
      setChatHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1].content = '⚠️ 本地后端服务未运行。请打开终端进入 backend/ 目录并运行 `python main.py`，再试一次。';
        return updated;
      });
    } finally {
      setIsStreaming(false);
      setTutorStatus('');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isStreaming) return;
    submitChatMessage(chatInput);
    setChatInput('');
  };

  const handleRegeneratePath = async () => {
    setIsRegeneratingPath(true);
    try {
      const username = localStorage.getItem('regUsername') || 'default_user';
      const res = await fetch(`http://127.0.0.1:8000/api/path/regenerate?username=${username}`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setPathNodes(data.nodes);

        // Add a diagnostic log
        setDiagnosticLogs(prev => [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            log: "路径智能体已重新编排并下发您的定制学习节点。"
          }
        ]);
        setProfileAlert("学习路径重构成功！");
        setTimeout(() => setProfileAlert(''), 3000);
      }
    } catch (err) {
      console.error("Path regeneration failed:", err);
    } finally {
      setIsRegeneratingPath(false);
    }
  };


  const stopSlideSpeech = () => {
    if (slideAudioRef.current) {
      try {
        slideAudioRef.current.pause();
        slideAudioRef.current.src = "";
      } catch (err) {
        console.error("Failed to stop slide audio:", err);
      }
      slideAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // --- TTS voice synthesis player helper ---
  const handleSlideSpeech = (text) => {
    stopSlideSpeech();

    // Attempt to use Xunfei TTS from backend
    const audioUrl = `http://127.0.0.1:8000/api/tts?text=${encodeURIComponent(text)}`;
    const audio = new Audio(audioUrl);
    slideAudioRef.current = audio;

    audio.onended = () => {
      setIsPlayingSlide(false);
      slideAudioRef.current = null;
    };

    audio.onerror = (e) => {
      console.warn("Xunfei TTS backend failed, falling back to browser speechSynthesis:", e);
      fallbackSpeechSynthesis(text);
    };

    audio.play().catch(err => {
      console.warn("Xunfei TTS playback failed, falling back to browser speechSynthesis:", err);
      fallbackSpeechSynthesis(text);
    });
  };

  const fallbackSpeechSynthesis = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.0;
      utterance.onend = () => {
        setIsPlayingSlide(false);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingSlide(false);
    }
  };


  // --- Quiz completing effect ---
  const handleCompleteQuiz = async (score, total) => {
    const wrongCount = total - score;
    const username = localStorage.getItem('regUsername') || 'default_user';
    const accuracy = Math.round((score / total) * 100);
    const passed = accuracy >= 60;

    const updatedStats = {
      ...profile.learning_stats,
      study_time: (profile.learning_stats?.study_time || 45) + 10,
      quiz_accuracy: Math.round(((profile.learning_stats?.quiz_accuracy || 80) + accuracy) / 2)
    };

    // Decrement parameters if wrong answers exist
    const updatedProfile = {
      ...profile,
      knowledge_base: Math.max(10, profile.knowledge_base - (wrongCount > 0 ? wrongCount * 4 : -5)),
      engagement: Math.min(100, profile.engagement + 5),
      learning_stats: updatedStats
    };

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/profile?username=${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
      if (res.ok) {
        const newData = await res.json();
        setProfile(newData);

        if (passed && selectedNode) {
          // Send request to complete the node and unlock the next one
          const pathRes = await fetch(`http://127.0.0.1:8000/api/path/complete-node`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              node_id: selectedNode.id,
              username: username
            })
          });
          if (pathRes.ok) {
            const pathData = await pathRes.json();
            setPathNodes(pathData.nodes);

            // Find the updated node object to reflect status change in current selection
            const currentUpdatedNode = pathData.nodes.find(n => n.id === selectedNode.id);
            if (currentUpdatedNode) {
              setSelectedNode(currentUpdatedNode);
            }

            setProfileAlert("恭喜通关！自适应答题合格，下一阶段关卡及资源已成功解锁。");
            setDiagnosticLogs(prev => [
              ...prev,
              {
                time: new Date().toLocaleTimeString(),
                log: `关卡解锁: 节点 [${selectedNode.title}] 已通关！下一节点已开启。`
              }
            ]);
          }
        } else {
          setProfileAlert("自适应测验已完成！答题指标已同步更新到您的画像。但由于正确率未达标（要求 60%），关卡未能晋级，建议重新阅读课本后重试。");
        }

        setTimeout(() => setProfileAlert(''), 5000);
        setDiagnosticLogs(prev => [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            log: `测验分析: 答对=${score}/${total}, 正确率=${accuracy}%, 自适应反馈分析计算完成。`
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to update profile and path after quiz:", err);
    }
    setQuizStep('completed');
  };

  // Slide content typing text effect
  useEffect(() => {
    if (activeModal === 'slide' && selectedNodeResources?.slide) {
      const currentText = selectedNodeResources.slide[currentSlideIdx]?.content || '';
      setSlideTypingText('');

      let i = 0;
      const interval = setInterval(() => {
        setSlideTypingText(prev => prev + currentText.charAt(i));
        i++;
        if (i >= currentText.length) {
          clearInterval(interval);
        }
      }, 35);

      if (isPlayingSlide) {
        handleSlideSpeech(selectedNodeResources.slide[currentSlideIdx]?.title + ". " + currentText);
      }

      gsap.fromTo(".slide-content-card",
        { opacity: 0, scale: 0.96, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );

      return () => {
        clearInterval(interval);
        stopSlideSpeech();
      };
    }
  }, [currentSlideIdx, isPlayingSlide, activeModal, selectedNodeResources]);

  // Modal styling definitions (delegated to index.css)
  const modalBackdropStyle = {};
  const modalContentStyle = {};

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

  const drawMindmapSVG = (mindmapText) => {
    const nodes = [
      { id: 'root', label: selectedNode?.title || "Python Basics", x: 250, y: 180, r: 45, color: 'var(--primary-neon)' },
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

  const highlightPythonCode = (codeText) => {
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
  };


  // SVG Radar coordinates generator
  const renderRadarChart = (profileData) => {
    const width = 220;
    const height = 200;
    const cx = width / 2;
    const cy = height / 2;
    const r = 58;
    const sides = 6;
    const angles = Array.from({ length: sides }, (_, i) => (i * 2 * Math.PI) / sides - Math.PI / 2);

    const dimensions = [
      { name: "知识库", key: "knowledge_base" },
      { name: "学习节奏", key: "learning_pace" },
      { name: "活跃度", key: "engagement" },
      { name: "逻辑推理", val: 70 },
      { name: "查错纠偏", val: 80 },
      { name: "代码实操", val: 65 }
    ];

    const getCoord = (angle, radiusRatio) => {
      const x = cx + r * radiusRatio * Math.cos(angle);
      const y = cy + r * radiusRatio * Math.sin(angle);
      return { x, y };
    };

    // concentric hexagon grid lines
    const baseLevels = [0.25, 0.5, 0.75, 1.0];
    const hexagons = baseLevels.map(level => angles.map(angle => getCoord(angle, level)));

    // user value coordinates (dynamically animated profileData)
    const valueCoords = angles.map((angle, index) => {
      const dim = dimensions[index];
      const val = dim.key ? profileData[dim.key] : dim.val;
      const ratio = val / 100;
      return getCoord(angle, ratio);
    });

    const valPath = valueCoords.map(c => `${c.x},${c.y}`).join(' ');

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="radar-svg"
        style={{ flexShrink: 0, display: 'block', margin: '0 auto' }}
      >
        {/* Background grids */}
        {hexagons.map((points, idx) => (
          <polygon
            key={idx}
            points={points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="rgba(15, 118, 110, 0.12)"
            strokeWidth="1.5"
          />
        ))}
        {/* Dimension axes */}
        {angles.map((angle, idx) => {
          const outerPoint = getCoord(angle, 1.0);
          return (
            <line
              key={idx}
              x1={cx}
              y1={cy}
              x2={outerPoint.x}
              y2={outerPoint.y}
              stroke="rgba(15, 118, 110, 0.12)"
              strokeWidth="1.5"
            />
          );
        })}
        {/* Glowing dynamic value polygon */}
        {valPath && (
          <>
            {/* outer neon stroke glow */}
            <polygon
              points={valPath}
              fill="none"
              stroke="rgba(29, 78, 216, 0.25)"
              strokeWidth="6"
              filter="blur(4px)"
            />
            <polygon
              points={valPath}
              fill="rgba(15, 118, 110, 0.15)"
              stroke="url(#gradient-accent)"
              strokeWidth="2.5"
            />
          </>
        )}
        {/* Dots on corners */}
        {valueCoords.map((c, idx) => (
          <circle key={idx} cx={c.x} cy={c.y} r="4" fill="var(--accent)" />
        ))}
        {/* Dimension labels */}
        {angles.map((angle, idx) => {
          const labelOffset = 1.28;
          const coord = getCoord(angle, labelOffset);
          const name = dimensions[idx].name;
          let textAnchor = "middle";
          if (Math.cos(angle) > 0.1) textAnchor = "start";
          else if (Math.cos(angle) < -0.1) textAnchor = "end";

          return (
            <text
              key={idx}
              x={coord.x}
              y={coord.y + 4}
              fill="var(--text-muted)"
              fontSize="11"
              fontWeight="600"
              textAnchor={textAnchor}
            >
              {name}
            </text>
          );
        })}
        {/* Linear Gradient definitions for SVG */}
        <defs>
          <linearGradient id="gradient-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary-neon)" />
            <stop offset="100%" stopColor="var(--secondary)" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'slide': return <Video size={16} style={{ color: 'var(--secondary)' }} />;
      case 'pdf': return <FileText size={16} style={{ color: 'var(--accent-cyan)' }} />;
      case 'quiz': return <HelpCircle size={16} style={{ color: 'var(--success)' }} />;
      case 'code': return <FileCode size={16} style={{ color: 'var(--accent)' }} />;
      case 'mindmap': return <Map size={16} style={{ color: 'var(--warning)' }} />;
      default: return <FileText size={16} />;
    }
  };

  // --- 🎬 Interactive Modal Render Functions ---

  // 1. PDF Textbook E-Reader Modal
  const renderPdfModal = () => {
    if (!selectedNodeResources || !selectedNodeResources.pdf) return null;
    return (
      <div className="modal-backdrop">
        <div className="modal-content" style={{ maxWidth: '800px', height: '80vh', borderRadius: '16px' }}>
          <div style={modalHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={20} style={{ color: 'var(--accent-cyan)' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
                《{selectedNode?.title || "Python Basics"}》讲解课本
              </h3>
            </div>
            <button onClick={() => setActiveModal(null)} style={modalCloseButtonStyle}>
              <X size={16} />
            </button>
          </div>
          <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '8px', lineHeight: '1.7', fontSize: '14.5px', background: 'var(--bg-pdf-reader)', borderRadius: '12px', border: '1px solid var(--border-neon)', padding: '24px', color: 'var(--text-main)' }}>
            {parseMarkdownToReact(selectedNodeResources.pdf)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-neon)' }}>
            <button className="cyber-btn" onClick={() => setActiveModal(null)} style={{ padding: '8px 20px', fontSize: '12px' }}>
              完成阅读
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 2. Audio-Visual Slide Player Modal
  const renderSlideModal = () => {
    if (!selectedNodeResources || !selectedNodeResources.slide) return null;
    const slides = selectedNodeResources.slide;
    const currentSlide = slides[currentSlideIdx];

    return (
      <div className="modal-backdrop">
        <div className="modal-content" style={{ maxWidth: '900px', borderRadius: '16px' }}>
          <div style={modalHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Video size={20} style={{ color: 'var(--secondary)' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
                《{selectedNode?.title || "Python Basics"}》音画同步动画讲解
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                {currentSlideIdx + 1} / {slides.length} 页
              </span>
              <button onClick={() => {
                setActiveModal(null);
                stopSlideSpeech();
                setIsPlayingSlide(false);
              }} style={modalCloseButtonStyle}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Slide Screen */}
          <div
            className="slide-content-card"
            style={{
              background: '#090d16',
              borderRadius: '14px',
              border: '1px solid rgba(15, 118, 110, 0.25)',
              padding: '40px',
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)'
            }}
          >
            {/* Ambient moving glow inside slide */}
            <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(15, 118, 110, 0.08) 0%, transparent 70%)', top: '10%', right: '10%', pointerEvents: 'none' }} />

            {/* Title */}
            <h4 style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', marginBottom: '24px', textAlign: 'center', letterSpacing: '-0.02em', zIndex: 1 }}>
              {currentSlide?.title}
            </h4>

            {/* Subtitles Typing Text */}
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', maxWidth: '640px', textAlign: 'center', minHeight: '80px', zIndex: 1 }}>
              {slideTypingText}
            </p>

            {/* Audio Wave Visualizer */}
            {isPlayingSlide && (
              <div style={{ display: 'flex', gap: '4px', position: 'absolute', bottom: '24px', zIndex: 1 }}>
                {[1, 2, 3, 4, 5, 6, 7].map(idx => (
                  <div
                    key={idx}
                    className="wave-bar"
                    style={{
                      width: '3px',
                      height: '16px',
                      background: 'var(--secondary)',
                      borderRadius: '2px',
                      animation: `bounceWave 0.6s infinite alternate ease-in-out`,
                      animationDelay: `${idx * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Style definition for wave bouncing */}
          <style>{`
            @keyframes bounceWave {
              0% { transform: scaleY(0.4); }
              100% { transform: scaleY(2.2); }
            }
          `}</style>

          {/* Control Panel */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <button
              className="cyber-btn"
              disabled={currentSlideIdx === 0}
              onClick={() => {
                setCurrentSlideIdx(prev => prev - 1);
              }}
              style={{ padding: '8px 16px', fontSize: '12px', opacity: currentSlideIdx === 0 ? 0.4 : 1 }}
            >
              <ChevronRight size={16} style={{ transform: 'rotate(180deg)', marginRight: '6px' }} /> 上一页
            </button>

            <button
              className="cyber-btn"
              style={{
                padding: '10px 24px',
                fontSize: '13px',
                fontWeight: '800',
                background: isPlayingSlide ? 'rgba(239, 68, 68, 0.1)' : 'rgba(15, 118, 110, 0.1)',
                borderColor: isPlayingSlide ? 'rgba(239, 68, 68, 0.3)' : 'var(--primary-neon)'
              }}
              onClick={() => {
                if (isPlayingSlide) {
                  setIsPlayingSlide(false);
                  stopSlideSpeech();
                } else {
                  setIsPlayingSlide(true);
                }
              }}
            >
              {isPlayingSlide ? (
                <>
                  <Pause size={16} style={{ marginRight: '6px', color: '#ef4444' }} /> 暂停讲解
                </>
              ) : (
                <>
                  <Play size={16} style={{ marginRight: '6px', color: 'var(--primary-neon)' }} /> 开启语音讲解
                </>
              )}
            </button>

            <button
              className="cyber-btn"
              disabled={currentSlideIdx === slides.length - 1}
              onClick={() => {
                setCurrentSlideIdx(prev => prev + 1);
              }}
              style={{ padding: '8px 16px', fontSize: '12px', opacity: currentSlideIdx === slides.length - 1 ? 0.4 : 1 }}
            >
              下一页 <ChevronRight size={16} style={{ marginLeft: '6px' }} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 3. Adaptive Quiz Assessment Modal
  const renderQuizModal = () => {
    if (!selectedNodeResources || !selectedNodeResources.quiz) return null;
    const quizList = selectedNodeResources.quiz;
    const currentQ = quizList[quizQuestionIdx];

    return (
      <div className="modal-backdrop">
        <div className="modal-content" style={{ maxWidth: '720px', borderRadius: '16px', maxHeight: '95vh', overflowY: 'auto' }}>

          {/* Header */}
          <div style={modalHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HelpCircle size={20} style={{ color: 'var(--success)' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
                《{selectedNode?.title || "Python Basics"}》自适应画像能力评测
              </h3>
            </div>
            <button onClick={() => setActiveModal(null)} style={modalCloseButtonStyle}>
              <X size={16} />
            </button>
          </div>

          {/* Intro Screen */}
          {quizStep === 'intro' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px 8px', textAlign: 'center', alignItems: 'center' }}>
              <div style={{ padding: '16px', borderRadius: '50%', background: 'rgba(21, 128, 61, 0.05)', border: '1px solid rgba(21, 128, 61, 0.15)', display: 'inline-flex' }}>
                <HelpCircle size={44} style={{ color: 'var(--success)' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>自适应能力评测说明</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.6', maxWidth: '480px' }}>
                  本测验由**画像智能体**根据您当前的 6 维认知数据精心抽取，包含 {quizList.length} 道诊断题。
                  答题结果将直接回传，对您的雷达图进行精细微调。做错题会导致画像‘知识库’与‘活跃度’指标下调并自动优化后继路径推荐！
                </p>
              </div>
              <button
                className="cyber-btn"
                style={{ padding: '12px 36px', background: 'var(--success)', color: '#ffffff', border: 'none', boxShadow: '0 4px 14px rgba(21, 128, 61, 0.3)' }}
                onClick={() => {
                  setQuizStep('question');
                  setQuizQuestionIdx(0);
                  setQuizCorrectCount(0);
                  setQuizAnswers({});
                  setQuizSubmitted(false);
                  setQuizFeedback('');
                }}
              >
                开启自适应评测
              </button>
            </div>
          )}

          {/* Question Screen */}
          {quizStep === 'question' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '8px 0' }}>
              {/* Progress */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>评测进度: {quizQuestionIdx + 1} / {quizList.length}</span>
                <span>当前正确数: {quizCorrectCount}</span>
              </div>

              {/* Question Text */}
              <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', borderLeft: '4px solid var(--success)' }}>
                <p style={{ fontSize: '14.5px', fontWeight: '800', lineHeight: '1.6', color: 'var(--text-main)' }}>
                  {currentQ?.question}
                </p>
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentQ?.options.map((option, idx) => {
                  const isSelected = quizAnswers[quizQuestionIdx] === idx;
                  const isCorrect = idx === currentQ.answer;

                  let optionBg = 'rgba(0,0,0,0.02)';
                  let optionBorder = '1px solid rgba(0,0,0,0.05)';

                  if (quizSubmitted) {
                    if (isCorrect) {
                      optionBg = 'rgba(22, 163, 74, 0.08)';
                      optionBorder = '1px solid rgba(22, 163, 74, 0.3)';
                    } else if (isSelected) {
                      optionBg = 'rgba(220, 38, 38, 0.08)';
                      optionBorder = '1px solid rgba(220, 38, 38, 0.3)';
                    }
                  } else if (isSelected) {
                    optionBg = 'rgba(15, 118, 110, 0.05)';
                    optionBorder = '1px solid var(--primary)';
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (!quizSubmitted) {
                          setQuizAnswers(prev => ({ ...prev, [quizQuestionIdx]: idx }));
                        }
                      }}
                      style={{
                        padding: '14px 20px',
                        borderRadius: '12px',
                        background: optionBg,
                        border: optionBorder,
                        cursor: quizSubmitted ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: '13.5px', color: 'var(--text-main)' }}>{option}</span>
                      {quizSubmitted && isCorrect && <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />}
                      {quizSubmitted && isSelected && !isCorrect && <X size={16} style={{ color: '#ef4444' }} />}
                    </div>
                  );
                })}
              </div>

              {/* Feedback Explanation */}
              {quizSubmitted && (
                <div style={{ padding: '16px 20px', background: 'rgba(30, 41, 59, 0.03)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Info size={14} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)' }}>智能导师错误分析诊断：</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    {currentQ?.explanation}
                  </p>
                </div>
              )}

              {/* Quiz Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                {!quizSubmitted ? (
                  <button
                    className="cyber-btn"
                    disabled={quizAnswers[quizQuestionIdx] === undefined}
                    onClick={() => {
                      setQuizSubmitted(true);
                      const isCorrect = quizAnswers[quizQuestionIdx] === currentQ.answer;
                      if (isCorrect) {
                        setQuizCorrectCount(prev => prev + 1);
                      }
                    }}
                    style={{ padding: '10px 24px', opacity: quizAnswers[quizQuestionIdx] === undefined ? 0.5 : 1 }}
                  >
                    提交答案
                  </button>
                ) : (
                  quizQuestionIdx < quizList.length - 1 ? (
                    <button
                      className="cyber-btn"
                      onClick={() => {
                        setQuizQuestionIdx(prev => prev + 1);
                        setQuizSubmitted(false);
                      }}
                      style={{ padding: '10px 24px' }}
                    >
                      下一题 <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                    </button>
                  ) : (
                    <button
                      className="cyber-btn"
                      onClick={() => {
                        handleCompleteQuiz(quizCorrectCount, quizList.length);
                      }}
                      style={{ padding: '10px 24px', background: 'var(--success)', borderColor: 'var(--success)', color: '#ffffff' }}
                    >
                      完成诊断并同步画像 <Sparkles size={16} style={{ marginLeft: '6px' }} />
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Completed Screen */}
          {quizStep === 'completed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px 8px', textAlign: 'center', alignItems: 'center' }}>
              <div style={{ padding: '20px', borderRadius: '50%', background: 'rgba(21, 128, 61, 0.08)', display: 'inline-flex' }}>
                <CheckCircle2 size={54} style={{ color: 'var(--success)' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '8px' }}>画像评估同步成功</h4>
                <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--success)', margin: '14px 0' }}>
                  正确率: {Math.round((quizCorrectCount / quizList.length) * 100)}%
                  <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: '500', marginLeft: '8px' }}>
                    ({quizCorrectCount} / {quizList.length} 正确)
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.6', maxWidth: '440px' }}>
                  {quizCorrectCount === quizList.length
                    ? "优秀！您已完全通过本关评测。画像指标的‘知识库’得到了大幅提升！"
                    : "评测完成。画像智能体已根据您的易错倾向对认知模型参数进行了微调，建议查收新生成的个性化推荐进行针对性突破。"}
                </p>
              </div>
              <button
                className="cyber-btn"
                style={{ padding: '10px 32px' }}
                onClick={() => {
                  setActiveModal(null);
                }}
              >
                返回学术工作台
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 4. Mindmap Visualizer Modal
  const renderMindmapModal = () => {
    if (!selectedNodeResources || !selectedNodeResources.mindmap) return null;
    return (
      <div className="modal-backdrop">
        <div className="modal-content" style={{ maxWidth: '600px', borderRadius: '16px', alignItems: 'center' }}>
          <div style={{ ...modalHeaderStyle, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Map size={20} style={{ color: 'var(--warning)' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
                《{selectedNode?.title || "Python Basics"}》知识脑图拓扑
              </h3>
            </div>
            <button onClick={() => setActiveModal(null)} style={modalCloseButtonStyle}>
              <X size={16} />
            </button>
          </div>

          <div style={{ margin: '16px 0', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            {drawMindmapSVG(selectedNodeResources.mindmap)}
          </div>

          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '460px', lineHeight: '1.5' }}>
            💡 智能提示：您可以点击思维节点气泡触发微小的弹性位移动画。大模型协同网络已根据您的学习历史规划此拓扑。
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', paddingTop: '12px', borderTop: '1px solid var(--border-neon)' }}>
            <button className="cyber-btn" onClick={() => setActiveModal(null)} style={{ padding: '8px 20px', fontSize: '12px' }}>
              关闭脑图
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 5. Code & Assertions Viewer Modal
  const renderCodeModal = () => {
    if (!selectedNodeResources || !selectedNodeResources.code) return null;
    return (
      <div className="modal-backdrop">
        <div className="modal-content" style={{ maxWidth: '850px', borderRadius: '16px' }}>
          <div style={modalHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileCode size={20} style={{ color: 'var(--accent)' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
                《{selectedNode?.title || "Python Basics"}》实操测试代码用例 (.py)
              </h3>
            </div>
            <button onClick={() => setActiveModal(null)} style={modalCloseButtonStyle}>
              <X size={16} />
            </button>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>
            💡 智能体已为您自动补充带有完整断言测试 (PyTest) 的代码。可直接复制并在本地 IDE 运行以验证程序一致性。
          </p>

          <div
            style={{
              flexGrow: 1,
              overflow: 'auto',
              background: '#090d16',
              border: '1px solid rgba(15, 118, 110, 0.25)',
              borderRadius: '12px',
              padding: '20px',
              fontFamily: 'monospace',
              maxHeight: '52vh'
            }}
          >
            {highlightPythonCode(selectedNodeResources.code)}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <button
              className="cyber-btn"
              onClick={() => {
                navigator.clipboard.writeText(selectedNodeResources.code);
                setCopyCodeText('已复制代码到剪贴板！');
                setTimeout(() => setCopyCodeText('复制源码'), 2000);
              }}
              style={{ padding: '8px 18px', fontSize: '12px', background: 'rgba(15, 118, 110, 0.08)', borderColor: 'var(--primary-neon)' }}
            >
              {copyCodeText === '复制源码' ? (
                <>
                  <Copy size={14} style={{ marginRight: '6px' }} /> {copyCodeText}
                </>
              ) : (
                <>
                  <Check size={14} style={{ marginRight: '6px', color: 'var(--success)' }} /> {copyCodeText}
                </>
              )}
            </button>
            <button className="cyber-btn" onClick={() => setActiveModal(null)} style={{ padding: '8px 20px', fontSize: '12px' }}>
              退出查看
            </button>
          </div>
        </div>
      </div>
    );
  };
  if (currentView === 'landing' || currentView === 'auth' || !isLoggedIn) {
    return (
      <>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>

          {/* Ambient background orbs */}
          <div className="glow-orb-1" style={{ position: 'absolute', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(15, 118, 110, 0.05) 0%, transparent 70%)', top: '15%', right: '10%', pointerEvents: 'none', zIndex: 0 }}></div>
          <div className="glow-orb-2" style={{ position: 'absolute', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(29, 78, 216, 0.04) 0%, transparent 70%)', bottom: '10%', left: '5%', pointerEvents: 'none', zIndex: 0 }}></div>

          {/* Loading Overlay */}
          {isLoadingOrchestration && (
            <div className="loading-overlay">
              <div className="spinner-academic"></div>
              <div style={{ textAlign: 'center', maxWidth: '460px', padding: '0 24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '14px', letterSpacing: '-0.02em' }} className="neon-text-gradient">
                  智能多维空间部署中
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'monospace', lineHeight: '1.7', background: 'var(--bg-card-glass)', padding: '14px 20px', borderRadius: '12px', border: '1px solid var(--border-neon)' }}>
                  {orchestrationStep === 0 && "🔑 [主管智能体] 正在校对您的学术安全凭证并部署密匙通道..."}
                  {orchestrationStep === 1 && `📊 [画像智能体] 正在构建您的独立认知特征库：“${regCognitiveStyle}”...`}
                  {orchestrationStep === 2 && `📍 [路径智能体] 正在基于目标【${regLearningGoal === 'Python Basics' ? 'Python编程基础' : '机器学习与深度学习'}】生成初始学术路径...`}
                  {orchestrationStep === 3 && "✨ 协同网络就绪！正在加载动态画像主板与学术资源库..."}
                </p>
              </div>
            </div>
          )}

          {/* 1. Header Navigation Bar */}
          <header className="landing-nav">
            <div
              role="button"
              tabIndex={0}
              onClick={goPortalHome}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goPortalHome();
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            >
              <div style={{ padding: '8px', background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.12) 0%, rgba(29, 78, 216, 0.08) 100%)', borderRadius: '10px', border: '1px solid rgba(15, 118, 110, 0.2)', display: 'flex' }}>
                <GraduationCap size={20} style={{ color: 'var(--primary-neon)' }} />
              </div>
              <div>
                <span style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '-0.03em', fontFamily: 'var(--font-headings)' }}>
                  Edu<span style={{ color: 'var(--secondary)' }}>Genesis</span>
                </span>
                <span style={{ display: 'block', fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '700', marginTop: '-2px' }}>多智能体协同系统</span>
              </div>
            </div>

            <nav className="landing-nav-links">
              <a onClick={() => {
                if (currentView === 'landing') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setCurrentView('landing');
                }
              }} className="landing-nav-link">门户首页</a>
              <a href="#features" className="landing-nav-link">系统特色</a>
              <a href="#architecture" className="landing-nav-link">智能体架构</a>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'var(--bg-card-active)',
                  border: '1px solid var(--border-neon)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s'
                }}
                title="切换夜间模式"
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>

              <button
                onClick={() => {
                  if (isLoggedIn) {
                    setCurrentView('dashboard');
                  } else {
                    setAuthMode('login');
                    setCurrentView('auth');
                  }
                }}
                className="cyber-btn"
                style={{ padding: '10px 20px', fontSize: '12px' }}
              >
                {isLoggedIn ? '进入工作台' : '登录系统'}
              </button>
            </div>
          </header>

          {/* 2. Main Portal Homepage View */}
          {currentView === 'landing' && (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Hero Section */}
              <section style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px', alignItems: 'center', zIndex: 1 }}>
                <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <span className="neon-badge neon-badge-primary" style={{ alignSelf: 'flex-start' }}>大模型多智能体教育系统</span>
                  <h1 style={{ fontSize: '48px', fontWeight: '900', lineHeight: '1.15', letterSpacing: '-0.03em' }} className="neon-text-gradient">
                    开启大模型驱动的<br />个性化学习协同新纪元
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.8' }}>
                    EduGenesis 是一套学术级别的多智能体自适应学习系统。由<b>主管智能体</b>、<b>画像智能体</b>与<b>路径智能体</b>组成强大的协同网络，通过自然语言对话实时推演您的6维认知雷达，动态编排生成专属于您的多模态学习链路。
                  </p>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                    <button
                      onClick={() => {
                        if (isLoggedIn) {
                          setCurrentView('dashboard');
                        } else {
                          setAuthMode('signup');
                          setCurrentView('auth');
                        }
                      }}
                      className="cyber-btn"
                      style={{ padding: '14px 28px', fontSize: '14px' }}
                    >
                      {isLoggedIn ? '进入我的工作台' : '创建您的学术账户'} <ArrowRight size={16} />
                    </button>
                    <a
                      href="#sandbox"
                      className="cyber-btn"
                      style={{
                        padding: '14px 28px',
                        fontSize: '14px',
                        background: 'var(--bg-card-glass)',
                        border: '1px solid var(--border-neon)',
                        color: 'var(--text-main)',
                        boxShadow: 'none'
                      }}
                    >
                      体验决策沙盒
                    </a>
                  </div>
                </div>

                {/* High-Fidelity Floating Agent Cards */}
                <div className="anim-scale-up" style={{ position: 'relative', height: '360px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {/* Visual Connector Lines with Flow Effect */}
                  <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
                    <line x1="50%" y1="20%" x2="20%" y2="70%" stroke="var(--primary-neon)" strokeWidth="1.5" className="pulse-glow-path" style={{ opacity: 0.65 }} />
                    <line x1="50%" y1="20%" x2="80%" y2="70%" stroke="var(--primary-neon)" strokeWidth="1.5" className="pulse-glow-path" style={{ opacity: 0.65 }} />
                    <line x1="20%" y1="70%" x2="80%" y2="70%" stroke="var(--primary-neon)" strokeWidth="1.5" className="pulse-glow-path" style={{ opacity: 0.65 }} />
                  </svg>

                  {/* 1. Executive Agent Card */}
                  <div
                    className="cyber-card float-item tilt-card"
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    style={{ position: 'absolute', top: '10px', width: '180px', padding: '16px', background: 'var(--bg-card)', borderTop: '3px solid var(--secondary)', boxShadow: '0 10px 25px rgba(29, 78, 216, 0.08)' }}
                  >
                    <div className="card-shine-overlay" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Cpu size={16} style={{ color: 'var(--secondary)' }} />
                      <h4 style={{ fontSize: '13px', fontWeight: '800' }}>主管智能体</h4>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>负责统筹指令流转，调度底层算力与子智能体 network 协同。</p>
                    <span className="neon-badge neon-badge-primary" style={{ padding: '1px 5px', fontSize: '8px', marginTop: '8px', display: 'inline-block' }}>主控核心</span>
                  </div>

                  {/* 2. Profile Agent Card */}
                  <div
                    className="cyber-card float-item-delayed tilt-card"
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    style={{ position: 'absolute', bottom: '20px', left: '10px', width: '170px', padding: '16px', background: 'var(--bg-card)', borderTop: '3px solid var(--primary-neon)', boxShadow: '0 10px 25px rgba(15, 118, 110, 0.08)' }}
                  >
                    <div className="card-shine-overlay" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Sparkles size={16} style={{ color: 'var(--primary-neon)' }} />
                      <h4 style={{ fontSize: '13px', fontWeight: '800' }}>画像智能体</h4>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>提取对话特征，动态维护更新包含知识/节奏的6维雷达画像。</p>
                    <span className="neon-badge neon-badge-success" style={{ padding: '1px 5px', fontSize: '8px', marginTop: '8px', display: 'inline-block' }}>画像演进</span>
                  </div>

                  {/* 3. Path Planner Agent Card */}
                  <div
                    className="cyber-card float-item tilt-card"
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    style={{ position: 'absolute', bottom: '20px', right: '10px', width: '170px', padding: '16px', background: 'var(--bg-card)', borderTop: '3px solid var(--accent)', boxShadow: '0 10px 25px rgba(180, 83, 9, 0.08)' }}
                  >
                    <div className="card-shine-overlay" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
                      <h4 style={{ fontSize: '13px', fontWeight: '800' }}>路径智能体</h4>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>基于多维画像指标，个性化编排和重构最佳学习轨迹。</p>
                    <span className="neon-badge neon-badge-warning" style={{ padding: '1px 5px', fontSize: '8px', marginTop: '8px', display: 'inline-block' }}>路径编排</span>
                  </div>
                </div>
              </section>

              {/* Enriched Section 1: Interactive Sandbox Playground */}
              <section id="sandbox" style={{ padding: '80px 40px', background: 'rgba(15, 118, 110, 0.02)', borderTop: '1px solid rgba(15, 118, 110, 0.05)', borderBottom: '1px solid rgba(15, 118, 110, 0.05)', zIndex: 1 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                  <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <span className="neon-badge neon-badge-primary" style={{ marginBottom: '10px', display: 'inline-block' }}>Interactive Playground</span>
                    <h2 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.02em' }} className="neon-text-gradient">
                      智能自适应决策沙盒
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '640px', margin: '8px auto 0' }}>
                      在下方选择不同的学习性格，观察多智能体系统如何在后台秒级调整认知雷达，并为您动态重组完全不同的学科学习路径。
                    </p>
                  </div>

                  <div className="sandbox-grid">
                    {/* Left Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>选择您的模拟学术特征：</h3>

                      <button
                        onClick={() => setDemoStyle('practical')}
                        className={`demo-style-btn ${demoStyle === 'practical' ? 'selected' : ''}`}
                      >
                        <span className="demo-style-btn-title">
                          <Code2 size={18} style={{ color: 'var(--primary-neon)' }} />
                          实操探索型 (Practical Explorer)
                        </span>
                        <span className="demo-style-btn-desc">
                          基础薄弱，偏好写代码、跑测试，查错纠偏能力较强，希望遇到问题立即有代码实践和诊断问答。
                        </span>
                      </button>

                      <button
                        onClick={() => setDemoStyle('theoretical')}
                        className={`demo-style-btn ${demoStyle === 'theoretical' ? 'selected' : ''}`}
                      >
                        <span className="demo-style-btn-title">
                          <BookOpen size={18} style={{ color: 'var(--secondary)' }} />
                          硬核理论型 (Theoretical Scholar)
                        </span>
                        <span className="demo-style-btn-desc">
                          理论功底深厚，追求公式推导和底层逻辑体系，希望有丰富的 PDF 教材阅读、思维脑图展示和证明题。
                        </span>
                      </button>

                      <button
                        onClick={() => setDemoStyle('visual')}
                        className={`demo-style-btn ${demoStyle === 'visual' ? 'selected' : ''}`}
                      >
                        <span className="demo-style-btn-title">
                          <Video size={18} style={{ color: 'var(--accent)' }} />
                          直观视觉型 (Visual Learner)
                        </span>
                        <span className="demo-style-btn-desc">
                          对抽象概念理解慢，偏好通过流畅动画、PPT图解和音画同步讲解建立直观感性认识。
                        </span>
                      </button>

                      <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-card-glass)', border: '1px dashed var(--border-neon)', borderRadius: '12px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Info size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span>沙盒数据正在使用 GSAP 弹性缓动曲线进行流畅的 SVG 矢量变形渲染。</span>
                      </div>
                    </div>

                    {/* Right Output Panels */}
                    <div className="cyber-card" style={{ padding: '24px', background: 'var(--bg-card-solid)', border: '1px solid var(--border-neon-hover)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                      {/* Morphing Radar */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>实时自适应认知雷达</span>
                        {renderRadarChart(demoProfile)}
                        <div style={{ width: '100%', marginTop: '16px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span>实操能力:</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--primary-neon)' }}>{demoProfile.practical}%</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>逻辑推理:</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>{demoProfile.reasoning}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Simulated Path adaptivity */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.05em' }}>生成的个性化路径关卡</span>

                        {demoStyle === 'practical' && (
                          <>
                            <div className="demo-path-node">
                              <HelpCircle size={16} style={{ color: 'var(--success)' }} />
                              <div>
                                <h4 style={{ fontSize: '12px', fontWeight: '800' }}>Stage 1: PyTest 诊断前测</h4>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>测试驱动自动查找语法漏洞</span>
                              </div>
                            </div>
                            <div className="demo-path-node" style={{ borderColor: 'var(--primary-neon)' }}>
                              <FileCode size={16} style={{ color: 'var(--primary-neon)' }} className="pulse-glow" />
                              <div>
                                <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary-neon)' }}>Stage 2: 命令行工具实战</h4>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>动手编写 CLI 交互小计算器</span>
                              </div>
                            </div>
                            <div className="demo-path-node" style={{ opacity: 0.6 }}>
                              <Lock size={16} style={{ color: 'var(--text-dim)' }} />
                              <div>
                                <h4 style={{ fontSize: '12px', fontWeight: '800' }}>Stage 3: 自动化用例重构</h4>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>生成标准边界测试逻辑</span>
                              </div>
                            </div>
                          </>
                        )}

                        {demoStyle === 'theoretical' && (
                          <>
                            <div className="demo-path-node">
                              <FileText size={16} style={{ color: 'var(--success)' }} />
                              <div>
                                <h4 style={{ fontSize: '12px', fontWeight: '800' }}>Stage 1: 线性代数算力证明</h4>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>矩阵乘积与特征值理论阐释</span>
                              </div>
                            </div>
                            <div className="demo-path-node" style={{ borderColor: 'var(--secondary)' }}>
                              <Map size={16} style={{ color: 'var(--secondary)' }} className="pulse-glow" />
                              <div>
                                <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--secondary)' }}>Stage 2: 梯度反向传播证明</h4>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>反向推算偏导与链式求导法则</span>
                              </div>
                            </div>
                            <div className="demo-path-node" style={{ opacity: 0.6 }}>
                              <Lock size={16} style={{ color: 'var(--text-dim)' }} />
                              <div>
                                <h4 style={{ fontSize: '12px', fontWeight: '800' }}>Stage 3: 房价回归论文复现</h4>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>复现 L1/L2 正则化数学底座</span>
                              </div>
                            </div>
                          </>
                        )}

                        {demoStyle === 'visual' && (
                          <>
                            <div className="demo-path-node">
                              <Video size={16} style={{ color: 'var(--success)' }} />
                              <div>
                                <h4 style={{ fontSize: '12px', fontWeight: '800' }}>Stage 1: 内存变量动画解剖</h4>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>利用 GSAP 动画解析变量引用</span>
                              </div>
                            </div>
                            <div className="demo-path-node" style={{ borderColor: 'var(--accent)' }}>
                              <Video size={16} style={{ color: 'var(--accent)' }} className="pulse-glow" />
                              <div>
                                <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent)' }}>Stage 2: 分支控制流音画精讲</h4>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>音画对齐的 3D 数据流微课</span>
                              </div>
                            </div>
                            <div className="demo-path-node" style={{ opacity: 0.6 }}>
                              <Lock size={16} style={{ color: 'var(--text-dim)' }} />
                              <div>
                                <h4 style={{ fontSize: '12px', fontWeight: '800' }}>Stage 3: 智能协同拓扑架构</h4>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>图形决策决策网动画演示</span>
                              </div>
                            </div>
                          </>
                        )}

                        <button
                          onClick={() => {
                            setRegCognitiveStyle(
                              demoStyle === 'practical' ? 'Practical Coding' :
                                demoStyle === 'theoretical' ? 'Theoretical/Self-Paced' : 'Visual/Guided'
                            );
                            setAuthMode('signup');
                            setCurrentView('auth');
                          }}
                          className="cyber-btn"
                          style={{ marginTop: 'auto', padding: '10px', fontSize: '11px', textTransform: 'none', justifyContent: 'center' }}
                        >
                          使用此风格注册并开启系统 <ArrowRight size={12} />
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              </section>

              {/* Enriched Section: Adaptive Growth Journey Timeline */}
              <section id="journey" className="journey-section" style={{ padding: '80px 40px', borderTop: '1px solid rgba(15, 118, 110, 0.05)', zIndex: 1 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                  <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <span className="neon-badge neon-badge-primary" style={{ marginBottom: '10px', display: 'inline-block' }}>Adaptive Roadmap</span>
                    <h2 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.02em' }} className="neon-text-gradient">
                      自适应研学成长地图
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '640px', margin: '8px auto 0' }}>
                      当您在系统中前行，主管智能体、画像智能体与路径智能体会根据您的实时状态，全生命周期动态调配如下学习环节。
                    </p>
                  </div>

                  <div className="timeline-container">
                    <div className="timeline-line">
                      <div className="timeline-line-progress"></div>
                    </div>

                    {[
                      {
                        stage: "Stage 1",
                        title: "自然语言无感画像构建",
                        desc: "无需繁重问卷测验。在日常对话式学习和答疑交互中，画像智能体提取语义关键词，自动推演 6 维认知结构，做到随学随新。",
                        icon: <MessageSquare size={18} style={{ color: 'var(--primary-neon)' }} />
                      },
                      {
                        stage: "Stage 2",
                        title: "自适应学习路径重编排",
                        desc: "在面临测验失误或表达难点时，路径智能体实时计算依赖网，分钟级插入引导性概念微课、Mermaid 知识脑图等中继卡片。",
                        icon: <TrendingUp size={18} style={{ color: 'var(--secondary)' }} />
                      },
                      {
                        stage: "Stage 3",
                        title: "安全隔离代码沙盒实操",
                        desc: "进入定制的 Python 代码演练场。后台自动隔离扫描危险指令，极速运行测试用例，将正误特征反馈给错题 ledger 本与画像端。",
                        icon: <Terminal size={18} style={{ color: 'var(--accent)' }} />
                      },
                      {
                        stage: "Stage 4",
                        title: "智能错题 Ledger 加固强化",
                        desc: "提取代码运行或测验中的遗留错题，自动触发大模型逆向生成具有完全相同考点的 MCQ 选择题，以靶向实操实现真正的知识闭环。",
                        icon: <BookOpen size={18} style={{ color: 'var(--primary-neon)' }} />
                      },
                      {
                        stage: "Stage 5",
                        title: "自适应微专业毕业证书发放",
                        desc: "通过 8 级关卡后，画像智能体联合 4 大系统角色会签，签发包含实时学习时长、正确率等真实数据的 PDF 结业证书，支持一键下载。",
                        icon: <GraduationCap size={18} style={{ color: 'var(--secondary)' }} />
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-badge-wrapper">
                          {item.icon}
                        </div>
                        <div className="timeline-card-wrapper">
                          <div className="timeline-card">
                            <span className="neon-badge neon-badge-primary" style={{ fontSize: '9px', padding: '1px 5px', marginBottom: '8px', display: 'inline-block' }}>{item.stage}</span>
                            <h3 className="timeline-card-title">{item.title}</h3>
                            <p className="timeline-card-desc">{item.desc}</p>
                          </div>
                        </div>
                        <div style={{ width: '42%' }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Enriched Section: Sci-Fi Interactive Playground & Radar */}
              <section id="interactive-demo" style={{ padding: '80px 40px', borderTop: '1px solid rgba(13, 148, 136, 0.05)', zIndex: 1, position: 'relative' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

                  <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <span className="neon-badge neon-badge-primary" style={{ marginBottom: '10px', display: 'inline-block' }}>Interactive Playground</span>
                    <h2 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.02em' }} className="neon-text-gradient">
                      智能协同与能力画像感知
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '640px', margin: '8px auto 0' }}>
                      在首页即可直接模拟安全沙箱内的代码测试，实时调节能力维度，观察多智能体根据状态给出的自适应重构路径结论。
                    </p>
                  </div>

                  {/* 3D Tilt Card container wrapping the Playground */}
                  <div
                    className="tilt-card"
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    style={{ marginBottom: '40px' }}
                  >
                    <div className="card-shine-overlay" />
                    <MiniSandboxPlayground />
                  </div>

                  {/* 3D Tilt Card container wrapping the Radar Customizer */}
                  <div
                    className="tilt-card"
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-neon)',
                      borderRadius: '20px',
                      padding: '24px',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div className="card-shine-overlay" />
                    <RadarCustomizer />
                  </div>

                </div>
              </section>

              {/* Core Features Grid */}
              <section id="features" style={{ padding: '80px 40px', background: 'var(--bg-features-section)', borderBottom: '1px solid rgba(15, 118, 110, 0.05)', zIndex: 1 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                  <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <span className="neon-badge neon-badge-primary" style={{ marginBottom: '10px', display: 'inline-block' }}>系统核心能力</span>
                    <h2 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.02em' }} className="neon-text-gradient">
                      突破传统的智能自适应设计
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>我们专注于通过自研智能体提升学术和工程的交付质量</p>
                  </div>

                  <div className="grid-cols-3">
                    <div className="cyber-card" style={{ padding: '28px', background: 'var(--bg-card-solid)' }}>
                      <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(15, 118, 110, 0.05)', borderRadius: '14px', marginBottom: '20px', border: '1px solid rgba(15, 118, 110, 0.1)' }}>
                        <MessageSquare size={22} style={{ color: 'var(--primary)' }} />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>自然语言无感画像</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.7' }}>
                        无需通过海量题库进行枯燥的前测。只需在日常学习对话中与 AI 助教聊天，画像智能体即可无感推演出 6 维认知画像，并实时调整参数。
                      </p>
                    </div>
                    <div className="cyber-card" style={{ padding: '28px', background: 'var(--bg-card-solid)' }}>
                      <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(29, 78, 216, 0.05)', borderRadius: '14px', marginBottom: '20px', border: '1px solid rgba(29, 78, 216, 0.1)' }}>
                        <TrendingUp size={22} style={{ color: 'var(--secondary)' }} />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>实时路径重编排</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.7' }}>
                        当您回答完测验或者反馈某段代码看不懂时，路径规划智能体会瞬间触发局部重排，自动解锁分支辅助卡片或插入专项过渡关卡，保证因材施教。
                      </p>
                    </div>
                    <div className="cyber-card" style={{ padding: '28px', background: 'var(--bg-card-solid)' }}>
                      <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(180, 83, 9, 0.05)', borderRadius: '14px', marginBottom: '20px', border: '1px solid rgba(180, 83, 9, 0.1)' }}>
                        <FolderGit2 size={22} style={{ color: 'var(--accent)' }} />
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>音画同步课件渲染</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.7' }}>
                        首创音画同步机制。将大模型自动合成的书本章节 and 语音TTS，在前端交由 GSAP 时间轴引擎极速生成有声幻灯片动画，告别单调的文字阅读。
                      </p>
                    </div>
                  </div>

                  {/* Enriched Section 2: Animated Stats counters */}
                  <div className="stats-row">
                    <div className="stat-card">
                      <div className="stat-value neon-text-gradient"><span className="stat-num-users">0</span>+</div>
                      <div className="stat-label">累计部署学术空间</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value neon-text-gradient">+<span className="stat-num-efficiency">0</span>%</div>
                      <div className="stat-label">知识收敛平均提速</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value neon-text-gradient"><span className="stat-num-accuracy">0</span>%</div>
                      <div className="stat-label">大模型防幻觉校验率</div>
                    </div>
                  </div>

                </div>
              </section>

              {/* Architecture Flow Section & Enriched Section 3: Interactive Topology Decision Map */}
              <section id="architecture" style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                  <span className="neon-badge neon-badge-warning" style={{ marginBottom: '10px', display: 'inline-block' }}>协同架构流程</span>
                  <h2 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.02em' }} className="neon-text-gradient">
                    多智能体三级闭环演进链路
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
                    从信息捕获到状态推演，再到自适应生成的全周期网络拓扑
                  </p>
                </div>

                <div
                  className="cyber-card tilt-card"
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                  style={{ padding: '40px', background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-active) 100%)', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '40px', alignItems: 'center' }}
                >
                  <div className="card-shine-overlay" />

                  {/* Left Interactive SVG Topology Map */}
                  <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      选择场景触发多智能体共识决策仿真
                    </span>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', width: '100%', justifyContent: 'center' }}>
                      <button
                        onClick={() => runTopologySimulation('diagnose')}
                        className="cyber-btn"
                        disabled={simIsRunning}
                        style={{ padding: '6px 12px', fontSize: '10.5px', background: simScenario === 'diagnose' ? 'var(--primary)' : 'var(--bg-card-glass)', color: 'var(--text-main)', border: '1px solid var(--border-neon)', boxShadow: 'none' }}
                      >
                        1. 用户对话建档
                      </button>
                      <button
                        onClick={() => runTopologySimulation('sandbox_success')}
                        className="cyber-btn"
                        disabled={simIsRunning}
                        style={{ padding: '6px 12px', fontSize: '10.5px', background: simScenario === 'sandbox_success' ? 'var(--primary)' : 'var(--bg-card-glass)', color: 'var(--text-main)', border: '1px solid var(--border-neon)', boxShadow: 'none' }}
                      >
                        2. 沙盒编译成功
                      </button>
                      <button
                        onClick={() => runTopologySimulation('remedy')}
                        className="cyber-btn"
                        disabled={simIsRunning}
                        style={{ padding: '6px 12px', fontSize: '10.5px', background: simScenario === 'remedy' ? 'var(--primary)' : 'var(--bg-card-glass)', color: 'var(--text-main)', border: '1px solid var(--border-neon)', boxShadow: 'none' }}
                      >
                        3. 代码报错靶向加练
                      </button>
                    </div>

                    <svg width="340" height="260" viewBox="0 0 340 260" style={{ zIndex: 1 }}>
                      <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(15, 118, 110, 0.4)" />
                        </marker>
                        <marker id="arrow-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary-neon)" />
                        </marker>
                      </defs>

                      {/* Links */}
                      <line x1="170" y1="50" x2="70" y2="150" stroke={simActiveAgent === 'profile' ? 'var(--primary-neon)' : 'rgba(15, 118, 110, 0.12)'} strokeWidth={simActiveAgent === 'profile' ? '2.5' : '1.5'} strokeDasharray={simActiveAgent === 'profile' ? 'none' : '4 4'} markerEnd={simActiveAgent === 'profile' ? 'url(#arrow-active)' : 'url(#arrow)'} />
                      <line x1="70" y1="150" x2="270" y2="150" stroke={simActiveAgent === 'path' ? 'var(--primary-neon)' : 'rgba(15, 118, 110, 0.12)'} strokeWidth={simActiveAgent === 'path' ? '2.5' : '1.5'} strokeDasharray={simActiveAgent === 'path' ? 'none' : '4 4'} markerEnd={simActiveAgent === 'path' ? 'url(#arrow-active)' : 'url(#arrow)'} />
                      <line x1="270" y1="150" x2="170" y2="50" stroke={simActiveAgent === 'executive' ? 'var(--primary-neon)' : 'rgba(15, 118, 110, 0.12)'} strokeWidth={simActiveAgent === 'executive' ? '2.5' : '1.5'} strokeDasharray={simActiveAgent === 'executive' ? 'none' : '4 4'} markerEnd={simActiveAgent === 'executive' ? 'url(#arrow-active)' : 'url(#arrow)'} />

                      {/* 1. Executive Agent Node */}
                      <g className="agent-node" style={{ cursor: 'pointer' }} onClick={() => setSimActiveAgent('executive')}>
                        <circle cx="170" cy="50" r="28" fill="var(--bg-space)" stroke={simActiveAgent === 'executive' ? 'var(--secondary)' : 'var(--border-neon)'} strokeWidth="3" className={simActiveAgent === 'executive' ? 'simulation-node-pulse' : ''} />
                        <Cpu x="159" y="39" size={22} style={{ color: simActiveAgent === 'executive' ? 'var(--secondary)' : 'var(--text-dim)' }} />
                        <text x="170" y="94" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--text-main)">主管智能体</text>
                      </g>

                      {/* 2. Profile Agent Node */}
                      <g className="agent-node" style={{ cursor: 'pointer' }} onClick={() => setSimActiveAgent('profile')}>
                        <circle cx="70" cy="150" r="28" fill="var(--bg-space)" stroke={simActiveAgent === 'profile' ? 'var(--primary-neon)' : 'var(--border-neon)'} strokeWidth="3" className={simActiveAgent === 'profile' ? 'simulation-node-pulse' : ''} />
                        <Sparkles x="59" y="139" size={22} style={{ color: simActiveAgent === 'profile' ? 'var(--primary-neon)' : 'var(--text-dim)' }} />
                        <text x="70" y="194" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--text-main)">画像智能体</text>
                      </g>

                      {/* 3. Path Agent Node */}
                      <g className="agent-node" style={{ cursor: 'pointer' }} onClick={() => setSimActiveAgent('path')}>
                        <circle cx="270" cy="150" r="28" fill="var(--bg-space)" stroke={simActiveAgent === 'path' ? 'var(--accent)' : 'var(--border-neon)'} strokeWidth="3" className={simActiveAgent === 'path' ? 'simulation-node-pulse' : ''} />
                        <TrendingUp x="259" y="139" size={22} style={{ color: simActiveAgent === 'path' ? 'var(--accent)' : 'var(--text-dim)' }} />
                        <text x="270" y="194" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--text-main)">路径智能体</text>
                      </g>
                    </svg>

                    {/* Terminal Log Console */}
                    <div style={{ width: '100%', marginTop: '16px', background: '#080c15', borderRadius: '12px', padding: '12px 18px', fontFamily: 'monospace', color: '#38bdf8', fontSize: '11px', border: '1px solid var(--border-neon)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span>
                          <span style={{ width: '8px', height: '8px', background: '#eab308', borderRadius: '50%' }}></span>
                          <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></span>
                        </div>
                        <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>共识达成率: {simConsensus}%</span>
                      </div>
                      <div style={{ minHeight: '80px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {simLogs.length === 0 ? (
                          <p style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>&gt; 等待点击上方按钮启动协同仿真监测...</p>
                        ) : (
                          simLogs.map((log, idx) => (
                            <p key={idx} style={{ color: idx === simLogs.length - 1 ? '#e2e8f0' : '#64748b', transition: 'all 0.3s ease' }}>{log}</p>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Description list */}
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '14px', fontFamily: 'var(--font-headings)' }}>三级闭环决策说明</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', gap: '14px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(29, 78, 216, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'var(--secondary)', flexShrink: 0 }}>1</div>
                        <div>
                          <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>意图解析与任务分发 (主管智能体)</h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.5' }}>主管核心负责实时捕获学生的文本或答题动态，将特征解析并下发任务，确保子节点协同工作。</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '14px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(15, 118, 110, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'var(--primary)', flexShrink: 0 }}>2</div>
                        <div>
                          <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>动态雷达更新与建模 (画像智能体)</h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.5' }}>在分析意图和答题正误后，画像智能体计算出知识掌握、推理能力等维度数值，重构雷达多维矩阵。</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '14px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(180, 83, 9, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'var(--accent)', flexShrink: 0 }}>3</div>
                        <div>
                          <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>路径调配与资源生成 (路径智能体)</h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.5' }}>最优课程路线随之调整，智能体调用资源合成接口，秒级提供定制的音画课件、PyTest代码或Mermaid导图。</p>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '28px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '20px' }}>
                      <button
                        onClick={() => {
                          setAuthMode('signup');
                          setCurrentView('auth');
                        }}
                        className="cyber-btn"
                      >
                        立即开启我的自适应空间 <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              </section>

              {/* Footer */}
              <footer style={{ marginTop: 'auto', padding: '30px 40px', background: 'rgba(245, 243, 237, 0.8)', borderTop: '1px solid rgba(15, 118, 110, 0.08)', textAlign: 'center', fontSize: '12px', color: 'var(--text-dim)' }}>
                <p>© 2026 EduGenesis Personalized Agent Lab. 基于大模型的个性化多智能体自适应学习系统</p>
                <p style={{ marginTop: '4px', fontSize: '10px' }}>Powered by React 18, FastAPI, GSAP Timeline & Advanced LLM Orchestrator</p>
              </footer>
            </div>
          )}

          {/* 3. Auth Page (Login / Signup Cards) */}
          {currentView === 'auth' && (
            <div className="auth-wrapper">
              <div className="cyber-card auth-card anim-scale-up">
                {/* Back to Home Link */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                  <span onClick={() => setCurrentView('landing')} style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ← 返回系统门户
                  </span>
                  <span className="neon-badge neon-badge-primary">学术验证通道</span>
                </div>

                {/* Logo representation in card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                  <div style={{ padding: '6px', background: 'rgba(15, 118, 110, 0.08)', borderRadius: '8px', display: 'flex' }}>
                    <GraduationCap size={18} style={{ color: 'var(--primary-neon)' }} />
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.03em' }}>
                    学术登入 Edu<span style={{ color: 'var(--secondary)' }}>Genesis</span>
                  </h2>
                </div>

                {/* Mode Selector Tabs */}
                <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-chat-form)', padding: '4px', borderRadius: '10px', marginBottom: '28px' }}>
                  <button
                    onClick={() => setAuthMode('login')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: authMode === 'login' ? 'var(--bg-card-solid)' : 'transparent',
                      color: authMode === 'login' ? 'var(--primary)' : 'var(--text-muted)',
                      boxShadow: authMode === 'login' ? '0 2px 6px rgba(0,0,0,0.03)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    验证登录
                  </button>
                  <button
                    onClick={() => setAuthMode('signup')}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: authMode === 'signup' ? 'var(--bg-card-solid)' : 'transparent',
                      color: authMode === 'signup' ? 'var(--primary)' : 'var(--text-muted)',
                      boxShadow: authMode === 'signup' ? '0 2px 6px rgba(0,0,0,0.03)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    初始化账户
                  </button>
                </div>

                {authError && (
                  <div
                    className="cyber-card"
                    style={{
                      padding: '12px 16px',
                      background: 'rgba(190, 18, 60, 0.05)',
                      borderColor: 'var(--danger)',
                      color: 'var(--danger)',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '20px',
                      borderRadius: '10px'
                    }}
                  >
                    ⚠️ {authError}
                  </div>
                )}

                {authMode === 'login' ? (
                  <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="form-group">
                      <label className="form-label">学术通行证 (用户名/邮箱)</label>
                      <input
                        type="text"
                        required
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="输入您的账号..."
                        className="cyber-input"
                        style={{ padding: '12px 18px' }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                      <label className="form-label">通行密码</label>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="输入账户密码..."
                        className="cyber-input"
                        style={{ padding: '12px 18px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', fontSize: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ accentColor: 'var(--primary)' }} /> 记住本设备凭证
                      </label>
                      <span style={{ color: 'var(--secondary)', cursor: 'pointer', fontWeight: '600' }}>忘记密钥?</span>
                    </div>
                    <button type="submit" className="cyber-btn" style={{ justifyContent: 'center', padding: '14px', textTransform: 'none', letterSpacing: '0.05em' }}>
                      验证凭证进入空间 <ArrowRight size={16} />
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>
                      还没有学术账户? <span onClick={() => setAuthMode('signup')} style={{ color: 'var(--secondary)', cursor: 'pointer', fontWeight: '700' }}>立即创建</span>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="form-group">
                      <label className="form-label">注册用户名</label>
                      <input
                        type="text"
                        required
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="设置您的学术昵称..."
                        className="cyber-input"
                        style={{ padding: '12px 18px' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">账户密码</label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="设置您的安全密码..."
                        className="cyber-input"
                        style={{ padding: '12px 18px' }}
                      />
                    </div>

                    {/* Cognitive Style Option Radio Cards */}
                    <div className="form-group">
                      <label className="form-label">首选认知风格评估</label>
                      <div className="radio-card-grid">
                        <div
                          className={`radio-card ${regCognitiveStyle === 'Practical Coding' ? 'selected' : ''}`}
                          onClick={() => setRegCognitiveStyle('Practical Coding')}
                        >
                          <span className="radio-card-title">实操编码型 (Practical Coding)</span>
                          <span className="radio-card-desc">偏好代码实战与测试驱动，以源码阅读和诊断测试为主。</span>
                        </div>
                        <div
                          className={`radio-card ${regCognitiveStyle === 'Theoretical/Self-Paced' ? 'selected' : ''}`}
                          onClick={() => setRegCognitiveStyle('Theoretical/Self-Paced')}
                        >
                          <span className="radio-card-title">理论自导型 (Theoretical/Self-Paced)</span>
                          <span className="radio-card-desc">侧重于深层的理论基础、公式讲解，提供更详尽的思维图。</span>
                        </div>
                        <div
                          className={`radio-card ${regCognitiveStyle === 'Visual/Guided' ? 'selected' : ''}`}
                          onClick={() => setRegCognitiveStyle('Visual/Guided')}
                        >
                          <span className="radio-card-title">视觉引导型 (Visual/Guided)</span>
                          <span className="radio-card-desc">侧重于直观动画图解，需要更丰富的音画同步视频讲解。</span>
                        </div>
                      </div>
                    </div>

                    {/* Learning Goal Selector */}
                    <div className="form-group" style={{ marginBottom: '28px' }}>
                      <label className="form-label">学习目标主题</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div
                          className={`cyber-card`}
                          style={{
                            flex: 1,
                            padding: '12px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: regLearningGoal === 'Python Basics' ? 'rgba(15, 118, 110, 0.05)' : 'var(--bg-card-solid)',
                            borderColor: regLearningGoal === 'Python Basics' ? 'var(--primary-neon)' : 'var(--border-neon)',
                            fontSize: '13px',
                            fontWeight: '700'
                          }}
                          onClick={() => setRegLearningGoal('Python Basics')}
                        >
                          Python 编程基础
                        </div>
                        <div
                          className={`cyber-card`}
                          style={{
                            flex: 1,
                            padding: '12px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: regLearningGoal === 'Machine Learning' ? 'rgba(15, 118, 110, 0.05)' : 'var(--bg-card-solid)',
                            borderColor: regLearningGoal === 'Machine Learning' ? 'var(--primary-neon)' : 'var(--border-neon)',
                            fontSize: '13px',
                            fontWeight: '700'
                          }}
                          onClick={() => setRegLearningGoal('Machine Learning')}
                        >
                          机器学习与深度学习
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="cyber-btn" style={{ justifyContent: 'center', padding: '14px', textTransform: 'none', letterSpacing: '0.05em' }}>
                      初始化学术环境并登录 <ArrowRight size={16} />
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>
                      已有学术账户? <span onClick={() => setAuthMode('login')} style={{ color: 'var(--secondary)', cursor: 'pointer', fontWeight: '700' }}>立即登录</span>
                    </p>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="app-container">

        {/* Background Decorative Ambient Orbs */}
        <div className="glow-orb-1" style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(15, 118, 110, 0.06) 0%, transparent 70%)', top: '10%', right: '15%', pointerEvents: 'none', zIndex: 0 }}></div>
        <div className="glow-orb-2" style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(29, 78, 216, 0.04) 0%, transparent 70%)', bottom: '15%', left: '40%', pointerEvents: 'none', zIndex: 0 }}></div>

        {/* 🚀 LEFT SIDEBAR */}
        <aside className="sidebar">
          {/* Logo & Theme Switcher Section */}
          <div className="sidebar-anim-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexShrink: 0 }}>
            <a
              href="#"
              style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', pointerEvents: 'auto', textDecoration: 'none', color: 'inherit' }}
              onClick={(e) => {
                e.preventDefault();
                console.log("Logo title clicked, navigating to portal home");
                goPortalHome();
              }}
            >
              <div style={{ padding: '10px', background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.15) 0%, rgba(29, 78, 216, 0.1) 100%)', borderRadius: '14px', border: '1px solid rgba(15, 118, 110, 0.25)', display: 'flex' }}>
                <GraduationCap size={24} style={{ color: 'var(--primary-neon)' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.04em' }}>
                  Edu<span style={{ color: 'var(--secondary)' }}>Genesis</span>
                </h1>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginTop: '-2px' }}>多智能体协同系统</span>
              </div>
            </a>

            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              style={{
                padding: '10px',
                borderRadius: '12px',
                background: 'var(--bg-card-active)',
                border: '1px solid var(--border-neon)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s'
              }}
              title="切换夜间模式"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>        {/* Dynamic Profile Panel */}
          <div className="cyber-card sidebar-anim-item" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-card-glass)', borderColor: 'rgba(15, 118, 110, 0.12)', flexShrink: 0 }}>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} /> 智能多维画像
              </h3>
              <span className="neon-badge neon-badge-primary" style={{ padding: '2px 6px', fontSize: '9px' }}>实时更新</span>
            </div>
            {renderRadarChart(displayProfile)}
            <div style={{ width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.05)', marginTop: '8px', paddingTop: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>首选风格:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{profile.cognitive_style}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>学习目标:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{profile.learning_goals.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="sidebar-anim-item" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: '1', flexShrink: 0 }}>
            <div
              className={`cyber-nav-tab ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <BookOpen size={18} />
              <span>仪表盘首页</span>
            </div>
            <div
              className={`cyber-nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare size={18} />
              <span>智能画像导师</span>
            </div>
            <div
              className={`cyber-nav-tab ${activeTab === 'path' ? 'active' : ''}`}
              onClick={() => setActiveTab('path')}
            >
              <TrendingUp size={18} />
              <span>定制路径规划</span>
            </div>
            <div
              className={`cyber-nav-tab ${activeTab === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveTab('resources')}
            >
              <FolderGit2 size={18} />
              <span>生成资源库</span>
            </div>
            <div
              className={`cyber-nav-tab ${activeTab === 'sandbox' ? 'active' : ''}`}
              onClick={() => setActiveTab('sandbox')}
            >
              <Code2 size={18} />
              <span>AI 编程沙盒</span>
            </div>
            <div
              className={`cyber-nav-tab ${activeTab === 'errors' ? 'active' : ''}`}
              onClick={() => setActiveTab('errors')}
            >
              <HelpCircle size={18} />
              <span>智能错题加固</span>
            </div>
            <div
              className={`cyber-nav-tab ${activeTab === 'agent-console' ? 'active' : ''}`}
              onClick={() => setActiveTab('agent-console')}
            >
              <Cpu size={18} />
              <span>智能体控制台</span>
            </div>
            <div
              className={`cyber-nav-tab ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              <GraduationCap size={18} />
              <span>学术成就勋章</span>
            </div>
          </nav>

          {/* User Cockpit Footer */}
          <div className="sidebar-anim-item" style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(0, 0, 0, 0.06)', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(15, 118, 110, 0.06)', border: '1px solid rgba(15, 118, 110, 0.12)', display: 'flex' }}>
                <User size={18} style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700' }}>{regUsername || '大一体验官'}</h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>已认证学术空间</span>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('regUsername');
                setIsLoggedIn(false);
                setCurrentView('landing');
                setRegUsername('');
                setRegPassword('');
              }}
              className="cyber-btn"
              style={{
                width: '100%',
                background: 'rgba(190, 18, 60, 0.04)',
                borderColor: 'rgba(190, 18, 60, 0.12)',
                color: 'var(--danger)',
                boxShadow: 'none',
                padding: '8px 16px',
                fontSize: '11px',
                justifyContent: 'center',
                textTransform: 'none',
                letterSpacing: 'normal'
              }}
            >
              <LogOut size={12} /> 退出学术空间
            </button>
          </div>
        </aside>

        {/* 🖥️ MAIN PANELS */}
        <main className="main-content" ref={mainContentRef}>

          {/* 🏠 HOME TAB */}
          {activeTab === 'home' && (
            <>
              {/* Landing Banner */}
              <header className="cyber-card" style={{ padding: '40px', background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.06) 0%, rgba(29, 78, 216, 0.03) 100%)', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '32px' }}>
                  <div>
                    <div className="neon-badge neon-badge-primary" style={{ marginBottom: '14px', display: 'inline-block' }}>个性化自主学习空间</div>
                    <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '12px', lineHeight: '1.2' }} className="neon-text-gradient">
                      基于大模型的个性化资源生成与学习多智能体系统
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '680px', lineHeight: '1.7' }}>
                      本系统依托通用大模型及多模态前沿技术，由**主管智能体、画像智能体、路径智能体**等协同工作。支持对话式构建6维动态画像并动态推送符合当前进度的PDF文档、思维导图、测验及前端渲染的动画音频课件。
                    </p>
                  </div>
                  <div style={{ padding: '24px', borderRadius: '24px', background: 'rgba(15, 118, 110, 0.04)', border: '1px solid rgba(15, 118, 110, 0.12)', display: 'flex' }} className="pulse-glow">
                    <Sparkles size={52} style={{ color: 'var(--secondary)' }} />
                  </div>
                </div>
              </header>

              {/* Stats, Streak and Recommendation Section */}
              <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', margin: '24px 0' }}>

                {/* Left Column: Stats & Streak */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Stats Overview */}
                  <div className="cyber-card" style={{ padding: '24px', background: 'var(--bg-card-glass)', backdropFilter: 'blur(10px)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={16} style={{ color: 'var(--primary)' }} /> 学习统计看板
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
                      <div style={{ padding: '12px 8px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                        <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary-neon)', display: 'block' }}>
                          {profile.learning_stats?.study_time || 0}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>累计时长 (分)</span>
                      </div>
                      <div style={{ padding: '12px 8px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                        <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--secondary)', display: 'block' }}>
                          {profile.learning_stats?.quiz_accuracy || 0}%
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>习题正确率</span>
                      </div>
                      <div style={{ padding: '12px 8px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                        <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--accent)', display: 'block' }}>
                          {profile.learning_stats?.mastered_nodes || 0} / 8
                        </span>
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
                      <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
                        {profile.cognitive_style.includes("Practical")
                          ? "💻 动手实践：控制流逻辑 pytest 断言用例"
                          : profile.cognitive_style.includes("Visual")
                            ? "🎨 视觉讲解：变量引用与内存分配动态脑图"
                            : "📚 深度理论：Python 底层对象与内存指针对齐论文精读"}
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
              <section className="grid-cols-3">
                <div className="cyber-card" style={{ padding: '28px' }}>
                  <div style={{ display: 'inline-flex', padding: '10px', background: 'rgba(15, 118, 110, 0.06)', borderRadius: '12px', border: '1px solid rgba(15, 118, 110, 0.15)', marginBottom: '20px' }}>
                    <MessageSquare size={24} style={{ color: 'var(--primary-neon)' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', marginBottom: '10px', fontWeight: '700' }}>1. 智能画像导师</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                    摒弃表单，通过自然语言对话抽取您的专业特征，维护左侧6个维度的雷达画像，并支持“随学随新”的实时更新。
                  </p>
                </div>

                <div className="cyber-card" style={{ padding: '28px' }}>
                  <div style={{ display: 'inline-flex', padding: '10px', background: 'rgba(29, 78, 216, 0.06)', borderRadius: '12px', border: '1px solid rgba(29, 78, 216, 0.15)', marginBottom: '20px' }}>
                    <TrendingUp size={24} style={{ color: 'var(--secondary)' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', marginBottom: '10px', fontWeight: '700' }}>2. 路径规划与推送</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                    智能体综合评估您的知识掌握情况，为您规划动态演进的路径图。每完成一步，系统精准推送针对性材料。
                  </p>
                </div>

                <div className="cyber-card" style={{ padding: '28px' }}>
                  <div style={{ display: 'inline-flex', padding: '10px', background: 'rgba(180, 83, 9, 0.06)', borderRadius: '12px', border: '1px solid rgba(180, 83, 9, 0.15)', marginBottom: '20px' }}>
                    <FolderGit2 size={24} style={{ color: 'var(--accent)' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', marginBottom: '10px', fontWeight: '700' }}>3. 多模态资源生成</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                    自动生成思维导图、测验及代码类实操。前端动效系统音画同步课件课表，实现快速动画讲解。
                  </p>
                </div>
              </section>

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
            </>
          )}

          {/* 💬 CHAT TAB */}
          {activeTab === 'chat' && (
            <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 120px)', position: 'relative', width: '100%' }}>
              {/* Left section: Chat area */}
              <section className="cyber-card" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, border: '1px solid var(--border-neon)', height: '100%', position: 'relative' }}>

                {/* Profile Alert Alert Bubble */}
                {profileAlert && (
                  <div className="pulse-glow" style={{
                    position: 'absolute',
                    top: '80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                    padding: '10px 22px',
                    borderRadius: '24px',
                    border: '1.5px solid var(--primary-neon)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '800',
                    zIndex: 100,
                    boxShadow: '0 4px 20px rgba(15, 118, 110, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Sparkles size={14} style={{ animation: 'spin 1.5s linear infinite' }} />
                    {profileAlert}
                  </div>
                )}

                {/* Header */}
                <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                      <MessageSquare size={18} style={{ color: 'var(--primary-neon)' }} /> 智能画像导师
                      <a
                        href="#"
                        role="button"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log("Header link clicked, navigating to home tab");
                          goDashboardHome();
                        }}
                        style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--primary-neon)', cursor: 'pointer', marginLeft: '12px', opacity: 0.8, textDecoration: 'underline' }}
                      >
                        返回首页
                      </a>
                    </h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>与您的专属助教对话，动态更新左侧画像雷达数据</span>
                  </div>
                  <span className="neon-badge neon-badge-success">多智能体在线</span>
                </div>

                {/* Dialog Area */}
                <div style={{ flexGrow: '1', padding: '28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        alignItems: 'flex-start',
                        gap: '14px'
                      }}
                    >
                      {msg.role !== 'user' && (
                        <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(15, 118, 110, 0.06)', border: '1px solid rgba(15, 118, 110, 0.2)', flexShrink: 0 }}>
                          <Cpu size={16} style={{ color: 'var(--primary-neon)' }} />
                        </div>
                      )}
                      <div
                        className="cyber-card chat-bubble-anim"
                        style={{
                          padding: '14px 20px',
                          maxWidth: '75%',
                          borderRadius: msg.role === 'user' ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
                          background: msg.role === 'user' ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'var(--bg-card)',
                          borderColor: msg.role === 'user' ? 'var(--primary-neon)' : 'var(--border-neon)',
                          color: msg.role === 'user' ? '#ffffff' : 'var(--text-main)',
                          fontSize: '14px',
                          whiteSpace: 'pre-wrap',
                          lineHeight: '1.6'
                        }}
                      >
                        {msg.role === 'user' ? (
                          msg.content
                        ) : (
                          <InteractiveChatBubble
                            msg={msg}
                            handleSlideSpeech={handleSlideSpeech}
                            stopSlideSpeech={stopSlideSpeech}
                          />
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.03)', border: '1px solid rgba(0, 0, 0, 0.06)', flexShrink: 0 }}>
                          <User size={16} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Agent Orchestration thinking status */}
                  {tutorStatus && (
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', paddingLeft: '14px' }}>
                      <div className="pulse-glow" style={{ width: '8px', height: '8px', background: 'var(--accent-cyan)', borderRadius: '50%' }}></div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{tutorStatus}</span>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Suggestion Chips */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '10px 24px', background: 'rgba(0,0,0,0.01)', borderTop: '1px solid var(--border-neon)' }}>
                  {['我想学 Python 基础', '测试我的机器学习基础', '根据我的画像调整路线', '我觉得当前的学习节奏太快了'].map(chip => (
                    <button
                      key={chip}
                      disabled={isStreaming}
                      onClick={() => {
                        submitChatMessage(chip);
                      }}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '20px',
                        background: 'var(--bg-card-solid)',
                        border: '1px solid var(--border-neon)',
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                      }}
                      className="hover-neon-border"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} style={{ padding: '20px 28px', borderTop: '1px solid var(--border-neon)', background: 'var(--bg-chat-form)' }}>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={isStreaming ? "导师正在调用多智能体协同优化画像..." : "输入“我想学机器学习”或说明你的基础，定制画像和路径..."}
                      disabled={isStreaming}
                      className="cyber-input"
                    />
                    <button
                      type="submit"
                      disabled={isStreaming || !chatInput.trim()}
                      className="cyber-btn"
                      style={{
                        padding: '16px 20px',
                        borderRadius: '14px',
                        flexShrink: 0,
                        opacity: (isStreaming || !chatInput.trim()) ? 0.4 : 1,
                      }}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </section>

              {/* Right Panel: Diagnostic logs */}
              <aside className="cyber-card" style={{ width: '270px', flexShrink: 0, padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-card-glass)', backdropFilter: 'blur(10px)', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                  <Cpu size={15} style={{ color: 'var(--primary)' }} /> 画像评估诊断日志
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1, overflowY: 'auto' }}>
                  {diagnosticLogs.map((log, idx) => (
                    <div key={idx} style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.02)', borderLeft: '3px solid var(--secondary)', borderRadius: '0 8px 8px 0', fontSize: '11px', fontFamily: 'monospace' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '9px', marginBottom: '4px' }}>[{log.time}]</div>
                      <div style={{ color: 'var(--text-main)', lineHeight: '1.4' }}>{log.log}</div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          )}

          {/* 🗺️ PATH PLANNER TAB */}
          {activeTab === 'path' && (
            <>
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', marginBottom: '4px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    定制路径规划与推送系统
                    <a
                      href="#"
                      role="button"
                      onClick={(e) => {
                        e.preventDefault();
                        goDashboardHome();
                      }}
                      style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--primary-neon)', cursor: 'pointer', opacity: 0.8, textDecoration: 'underline' }}
                    >
                      返回首页
                    </a>
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    多智能体协同路径算法为您生成的专业轨迹。点击右侧的卡片查看智能体为您生成的多模态资源包。
                  </p>
                </div>

                <button
                  onClick={handleRegeneratePath}
                  disabled={isRegeneratingPath}
                  className="cyber-btn"
                  style={{
                    padding: '10px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: isRegeneratingPath ? 0.7 : 1
                  }}
                >
                  <Sparkles
                    size={16}
                    style={{
                      animation: isRegeneratingPath ? 'spin 1.5s linear infinite' : 'none'
                    }}
                  />
                  {isRegeneratingPath ? "路径重构中..." : "让路径智能体重新规划"}
                </button>
              </header>

              {/* Flowchart Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative', padding: '10px 0' }}>

                {/* Connecting line */}
                <div className="flowchart-line" />

                {pathNodes.map((node, index) => {
                  let badge = <span className="neon-badge neon-badge-primary">未解锁</span>;
                  let cardBorder = 'rgba(255, 255, 255, 0.04)';
                  let bulletBorder = 'rgba(255, 255, 255, 0.06)';
                  let icon = <Lock size={16} style={{ color: 'var(--text-dim)' }} />;

                  if (node.status === 'completed') {
                    badge = <span className="neon-badge neon-badge-success">已完成</span>;
                    cardBorder = 'rgba(16, 185, 129, 0.15)';
                    bulletBorder = 'var(--success)';
                    icon = <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />;
                  } else if (node.status === 'active') {
                    badge = <span className="neon-badge neon-badge-warning">激活学习中</span>;
                    cardBorder = 'rgba(99, 102, 241, 0.3)';
                    bulletBorder = 'var(--primary-neon)';
                    icon = <PlayCircle size={16} style={{ color: 'var(--primary-neon)' }} className="pulse-glow" />;
                  }

                  return (
                    <div key={node.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 1 }}>
                      <div
                        style={{ display: 'flex', gap: '28px', cursor: 'pointer' }}
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
                          width: '48px',
                          height: '48px',
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
                            padding: '20px 24px',
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
                              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{node.title}</h3>
                              {badge}
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{node.description}</p>
                          </div>

                          {/* Right icons preview */}
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {node.resources.map(res => (
                              <div
                                key={res}
                                style={{
                                  padding: '6px',
                                  borderRadius: '8px',
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
                            <ChevronRight size={16} style={{ color: 'var(--text-muted)', marginLeft: '12px', transform: selectedNode?.id === node.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                          </div>
                        </div>
                      </div>

                      {/* Expanded Selected Node Panel directly under the stage row */}
                      {selectedNode?.id === node.id && (
                        <div
                          className="cyber-card"
                          style={{
                            marginLeft: '76px', // Align with the stage card
                            padding: '24px 32px',
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
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                              <span style={{ fontSize: '10px', color: 'var(--secondary)', fontWeight: '700', letterSpacing: '0.08em' }}>STAGE PARAMETERS</span>
                              <h3 style={{ fontSize: '20px', fontWeight: '800', marginTop: '4px' }}>{selectedNode.title} 核心资源包</h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{selectedNode.description}</p>

                              {/* Node statistics / Meta parameters */}
                              <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                <div>预计时长: <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{selectedNode.id === 'node8' ? '120分钟' : '45分钟'}</span></div>
                                <div>难度系数: <span style={{ color: 'var(--secondary)', fontWeight: '700' }}>{selectedNode.id === 'node1' ? '⭐️' : selectedNode.id === 'node8' ? '⭐️⭐️⭐️' : '⭐️⭐️'}</span></div>
                                <div>状态: <span style={{ color: selectedNode.status === 'completed' ? 'var(--success)' : 'var(--primary)', fontWeight: '700' }}>
                                  {selectedNode.status === 'completed' ? '已通关' : selectedNode.status === 'active' ? '正在探索' : '未解锁'}
                                </span></div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                              {/* Enter Learning Button */}
                              <button
                                onClick={async () => {
                                  await fetchNodeResources(selectedNode.id);
                                  setActiveTab('resources');
                                }}
                                className="cyber-btn"
                                style={{
                                  padding: '8px 16px',
                                  fontSize: '11px',
                                  fontWeight: '700'
                                }}
                              >
                                进入当前关卡学习 <ArrowRight size={12} />
                              </button>

                              <button
                                onClick={() => setSelectedNode(null)}
                                style={{
                                  background: 'rgba(0,0,0,0.04)',
                                  border: '1px solid rgba(0,0,0,0.08)',
                                  borderRadius: '8px',
                                  padding: '8px 14px',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontWeight: '700'
                                }}
                              >
                                关闭
                              </button>
                            </div>
                          </div>

                          <h4 style={{ fontSize: '12px', color: 'var(--text-main)', marginBottom: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>智能体生成产物 (共 {selectedNode.resources.length} 项)</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                            {selectedNode.resources.map(res => (
                              <div
                                key={res}
                                className="cyber-card"
                                style={{
                                  padding: '16px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '14px',
                                  background: 'var(--bg-card-glass)',
                                  cursor: 'pointer'
                                }}
                                onClick={async () => {
                                  await fetchNodeResources(selectedNode.id);
                                  setActiveTab('resources');
                                }}
                              >
                                <div style={{ padding: '8px', background: 'rgba(0, 0, 0, 0.02)', borderRadius: '10px', display: 'flex' }}>
                                  {getResourceIcon(res)}
                                </div>
                                <div>
                                  <h5 style={{ fontSize: '13px', fontWeight: '700' }}>
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
          )}

          {/* 📂 RESOURCE GENERATOR TAB */}
          {activeTab === 'resources' && (
            <>
              <header>
                <h2 style={{ fontSize: '24px', marginBottom: '4px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  多智能体资源生成库
                  <a
                    href="#"
                    role="button"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("Header link clicked, navigating to home tab");
                      goDashboardHome();
                    }}
                    style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--primary-neon)', cursor: 'pointer', opacity: 0.8, textDecoration: 'underline' }}
                  >
                    返回首页
                  </a>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  由不同角色智能体根据您左侧画像生成的五类多模态教学资源包。
                </p>
              </header>

              {!selectedNodeResources ? (
                <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg-card-glass)', borderRadius: '16px', border: '1px dashed var(--border-neon)', marginTop: '20px' }}>
                  <div className="spinner-academic" style={{ margin: '0 auto 20px' }}></div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>智能资源包拼装中...</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>正在为您唤醒主管智能体，并根据画像组装课本、思维树、测验与源码用例。</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '24px', marginTop: '20px' }}>

                  {/* Card 1: PDF */}
                  {selectedNodeResources.pdf && (
                    <article
                      className="cyber-card hover-neon-border"
                      style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', cursor: 'pointer', background: 'var(--bg-card-glass)' }}
                      onClick={() => setActiveModal('pdf')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ padding: '10px', background: 'rgba(2, 132, 199, 0.06)', borderRadius: '12px', border: '1px solid rgba(2, 132, 199, 0.15)', display: 'flex' }}>
                          <FileText className="text-blue-400" size={24} style={{ color: 'var(--accent-cyan)' }} />
                        </div>
                        <span className="neon-badge neon-badge-success">PDF 生成完毕</span>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>《专业内容讲解课本.pdf》</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                          针对您的认知风格<b>“{profile.cognitive_style}”</b>定制的讲解教材。内含学术引用校验，实现大模型防幻觉过滤。
                        </p>
                      </div>
                      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Download size={14} /> 1.2 MB</span>
                        <span style={{ color: 'var(--accent-cyan)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>阅读全文 <ArrowRight size={14} /></span>
                      </div>
                    </article>
                  )}

                  {/* Card 2: Sound slide */}
                  {selectedNodeResources.slide && (
                    <article
                      className="cyber-card hover-neon-border"
                      style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', cursor: 'pointer', background: 'var(--bg-card-glass)' }}
                      onClick={() => {
                        setActiveModal('slide');
                        setCurrentSlideIdx(0);
                        setIsPlayingSlide(false);
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ padding: '10px', background: 'rgba(29, 78, 216, 0.06)', borderRadius: '12px', border: '1px solid rgba(29, 78, 216, 0.15)', display: 'flex' }}>
                          <Video className="text-purple-400" size={24} style={{ color: 'var(--secondary)' }} />
                        </div>
                        <span className="neon-badge neon-badge-warning">音画对齐完毕</span>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>《音画同步动画讲解》</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                          大模型生成的课件内容，结合讯飞 TTS 语音。前端利用 GSAP 时间轴引擎实现音画同步动画，极速渲染。
                        </p>
                      </div>
                      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>时长: 03:15 分钟</span>
                        <span style={{ color: 'var(--secondary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>开启播放 <ArrowRight size={14} /></span>
                      </div>
                    </article>
                  )}

                  {/* Card 3: Mindmap */}
                  {selectedNodeResources.mindmap && (
                    <article
                      className="cyber-card hover-neon-border"
                      style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', cursor: 'pointer', background: 'var(--bg-card-glass)' }}
                      onClick={() => setActiveModal('mindmap')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ padding: '10px', background: 'rgba(180, 83, 9, 0.06)', borderRadius: '12px', border: '1px solid rgba(180, 83, 9, 0.15)', display: 'flex' }}>
                          <Map className="text-yellow-400" size={24} style={{ color: 'var(--warning)' }} />
                        </div>
                        <span className="neon-badge neon-badge-success">思维导图就绪</span>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>《知识点思维脑图.svg》</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                          通过大模型生成 Mermaid 配置，并在前端渲染出动态可收缩的思维节点图，快速辅助学生理清概念脉络。
                        </p>
                      </div>
                      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>大小: 45 KB</span>
                        <span style={{ color: 'var(--warning)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>查看思维树 <ArrowRight size={14} /></span>
                      </div>
                    </article>
                  )}

                  {/* Card 4: Quiz */}
                  {selectedNodeResources.quiz && (
                    <article
                      className="cyber-card hover-neon-border"
                      style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', cursor: 'pointer', background: 'var(--bg-card-glass)' }}
                      onClick={() => {
                        setActiveModal('quiz');
                        setQuizStep('intro');
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ padding: '10px', background: 'rgba(21, 128, 61, 0.06)', borderRadius: '12px', border: '1px solid rgba(21, 128, 61, 0.15)', display: 'flex' }}>
                          <HelpCircle className="text-green-400" size={24} style={{ color: 'var(--success)' }} />
                        </div>
                        <span className="neon-badge neon-badge-success">测试生成就绪</span>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>《自适应画像评估测验》</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                          针对您的易错范畴<b>“{profile.error_patterns.join('/')}”</b>出具的自适应测评题。答题结果会回传用以微调画像指标。
                        </p>
                      </div>
                      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>题量: {selectedNodeResources.quiz.length} 道诊断题</span>
                        <span style={{ color: 'var(--success)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>开始测评 <ArrowRight size={14} /></span>
                      </div>
                    </article>
                  )}

                  {/* Card 5: Code Case */}
                  {selectedNodeResources.code && (
                    <article
                      className="cyber-card hover-neon-border"
                      style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', cursor: 'pointer', background: 'var(--bg-card-glass)' }}
                      onClick={() => setActiveModal('code')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ padding: '10px', background: 'rgba(15, 118, 110, 0.06)', borderRadius: '12px', border: '1px solid rgba(15, 118, 110, 0.15)', display: 'flex' }}>
                          <Code2 className="text-cyan-400" size={24} style={{ color: 'var(--accent)' }} />
                        </div>
                        <span className="neon-badge neon-badge-success">代码用例生成</span>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>《实操代码与断言测验.py》</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                          大模型自动补齐的带有完整断言测试（PyTest）的代码案例。学生可复制后在本地 IDE 进行代码补齐实践。
                        </p>
                      </div>
                      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>大小: 12 KB</span>
                        <span style={{ color: 'var(--accent)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>查看源码 <ArrowRight size={14} /></span>
                      </div>
                    </article>
                  )}

                </div>
              )}
            </>
          )}

          {/* 💻 AI PROGRAMMING SANDBOX TAB */}
          {activeTab === 'sandbox' && (
            <>
              <header>
                <h2 style={{ fontSize: '24px', marginBottom: '4px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  自适应 AI 编程沙盒
                  <a
                    href="#"
                    role="button"
                    onClick={(e) => {
                      e.preventDefault();
                      goDashboardHome();
                    }}
                    style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--primary-neon)', cursor: 'pointer', opacity: 0.8, textDecoration: 'underline' }}
                  >
                    返回首页
                  </a>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  免本地环境，即时运行并验证学术用例。系统将根据您的当前关卡提供对应的编码挑战。
                </p>
              </header>

              <div className="sandbox-layout" style={{ marginTop: '20px' }}>
                {/* Left Panel: Instructions */}
                <div className="cyber-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card-glass)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '1px solid var(--border-neon)', paddingBottom: '8px', color: 'var(--primary-neon)' }}>
                    📖 任务详情与要求
                  </h3>
                  <div style={{ fontSize: '13.5px', color: 'var(--text-main)', lineHeight: '1.6', flexGrow: 1, overflowY: 'auto' }}>
                    {sandboxChallenge ? (
                      <>
                        <p style={{ marginBottom: '12px', fontWeight: '700' }}>题目：{sandboxChallenge.title}</p>
                        <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)', fontSize: '13px' }}>
                          {sandboxChallenge.description}
                        </div>
                      </>
                    ) : (
                      <p style={{ color: 'var(--text-muted)' }}>正在为您的当前关卡装载学术编程挑战...</p>
                    )}
                  </div>

                  {/* AI Advice Display */}
                  {sandboxAIAdvice && (
                    <div style={{ padding: '12px', background: 'rgba(15, 118, 110, 0.05)', borderLeft: '3px solid var(--primary-neon)', borderRadius: '0 8px 8px 0', fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.5' }}>
                      <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--primary-neon)' }}>💡 AI 诊断建议：</strong>
                      {sandboxAIAdvice}
                    </div>
                  )}
                </div>

                {/* Right Panel: Editor + Terminal */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Editor Container */}
                  <div className="code-editor-wrapper" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="code-editor-header">
                      <span style={{ fontSize: '12px', color: '#8e8e9f', fontFamily: 'monospace', fontWeight: '700' }}>main.py (Python 3.10)</span>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={async () => {
                            setSandboxAIAdvice('🧠 [主管智能体] 正在扫描代码特征中...');
                            try {
                              const username = localStorage.getItem('regUsername') || 'default_user';
                              const response = await fetch('http://127.0.0.1:8000/api/sandbox/diagnose', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  code: sandboxCode,
                                  node_id: sandboxChallenge?.node_id || 'node3',
                                  username: username
                                })
                              });
                              if (response.ok) {
                                const result = await response.json();
                                setSandboxAIAdvice(result.advice);
                              } else {
                                setSandboxAIAdvice('❌ 诊断失败：无法连接导师智能体。');
                              }
                            } catch (err) {
                              setSandboxAIAdvice(`❌ 诊断异常：${err.message}`);
                            }
                          }}
                          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#ffffff', padding: '6px 12px', cursor: 'pointer', fontSize: '11px' }}
                        >
                          🤖 AI 智能诊断
                        </button>
                        <button
                          disabled={isSandboxRunning}
                          onClick={async () => {
                            setIsSandboxRunning(true);
                            setSandboxTerminal(prev => [...prev, ">>> PyTest test_main.py -v", "运行中..."]);
                            try {
                              const username = localStorage.getItem('regUsername') || 'default_user';
                              const response = await fetch('http://127.0.0.1:8000/api/sandbox/run', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  code: sandboxCode,
                                  node_id: sandboxChallenge?.node_id || 'node3',
                                  username: username
                                })
                              });
                              if (response.ok) {
                                const result = await response.json();
                                setSandboxTerminal(prev => [
                                  ...prev,
                                  ...result.output.split('\n')
                                ]);
                                if (result.passed) {
                                  // Refresh user profile to reflect the updated stats
                                  const profileRes = await fetch(`http://127.0.0.1:8000/api/profile?username=${username}`);
                                  if (profileRes.ok) {
                                    const updatedProfile = await profileRes.json();
                                    setProfile(updatedProfile);
                                  }
                                }
                              } else {
                                setSandboxTerminal(prev => [...prev, "❌ 运行失败：无法连接沙箱服务器。"]);
                              }
                            } catch (err) {
                              setSandboxTerminal(prev => [...prev, `❌ 运行失败：${err.message}`]);
                            } finally {
                              setIsSandboxRunning(false);
                            }
                          }}
                          className="cyber-btn"
                          style={{ padding: '6px 16px', fontSize: '11px', textTransform: 'none', background: 'linear-gradient(135deg, var(--primary-neon) 0%, var(--success) 100%)', boxShadow: 'none' }}
                        >
                          {isSandboxRunning ? "测试中..." : "▶ 运行测试"}
                        </button>
                      </div>
                    </div>

                    <div className="code-editor-body">
                      <div className="code-editor-gutter">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <span key={n}>{n}</span>)}
                      </div>
                      <textarea
                        value={sandboxCode}
                        onChange={(e) => setSandboxCode(e.target.value)}
                        className="code-editor-textarea"
                        spellCheck="false"
                      />
                    </div>
                  </div>

                  {/* PyTest Terminal */}
                  <div className="terminal-window">
                    <div className="terminal-header">EduGenesis Sandbox Output Console</div>
                    {sandboxTerminal.map((line, idx) => {
                      let className = "terminal-line";
                      if (line.includes("PASSED") || line.includes("通过")) className += " terminal-success";
                      else if (line.includes("FAILED") || line.includes("❌") || line.includes("AssertionError")) className += " terminal-error";
                      else if (line.startsWith(">>>")) className += " terminal-cyan";
                      return (
                        <div key={idx} className={className}>
                          {line}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 📔 SMART ERROR NOTEBOOK TAB */}
          {activeTab === 'errors' && (
            <>
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', marginBottom: '4px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    智能错题加固本
                    <a
                      href="#"
                      role="button"
                      onClick={(e) => {
                        e.preventDefault();
                        goDashboardHome();
                      }}
                      style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--primary-neon)', cursor: 'pointer', opacity: 0.8, textDecoration: 'underline' }}
                    >
                      返回首页
                    </a>
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    画像智能体为您记录的所有自适应测验易错题包。点击题目卡片，获取主管智能体和画像智能体的诊断解析。
                  </p>
                </div>
              </header>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '20px' }}>
                {errorQuestions.map((eq) => (
                  <article
                    key={eq.id}
                    className="cyber-card hover-neon-border"
                    style={{
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      background: 'var(--bg-card-glass)',
                      borderColor: 'rgba(239, 68, 68, 0.15)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="neon-badge neon-badge-warning" style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.18)' }}>
                        语法错误
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {eq.id.toUpperCase()}</span>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>{eq.title}</h3>

                      {/* Error code box */}
                      <div style={{ background: '#1e1e24', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', color: '#f8f8f2', margin: '8px 0', border: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'pre' }}>
                        {eq.code}
                      </div>

                      {/* System Error trace */}
                      <div style={{ background: 'rgba(239, 68, 68, 0.04)', borderLeft: '3px solid #ef4444', padding: '8px 12px', borderRadius: '0 6px 6px 0', fontSize: '11.5px', fontFamily: 'monospace', color: '#f87171', marginTop: '8px' }}>
                        {eq.error_msg}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                      <button
                        onClick={() => handleDiagnoseError(eq)}
                        className="cyber-btn"
                        style={{ padding: '6px 14px', fontSize: '11px', flexGrow: 1, justifyContent: 'center' }}
                      >
                        💡 智能体解析
                      </button>
                      <button
                        onClick={() => handleRemedyPractice(eq)}
                        style={{
                          background: 'rgba(21, 128, 61, 0.08)',
                          border: '1px solid rgba(21, 128, 61, 0.2)',
                          borderRadius: '8px',
                          color: 'var(--success)',
                          cursor: 'pointer',
                          padding: '6px 14px',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}
                        className="hover-neon-border"
                      >
                        加练同类题
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Error explanation details modal */}
              {selectedErrorExp && (
                <div className="modal-backdrop">
                  <div className="modal-content" style={{ maxWidth: '600px', borderRadius: '16px' }}>
                    <div style={modalHeaderStyle}>
                      <h3 style={{ fontSize: '18px', fontWeight: '800' }}>智能体错题诊断报告</h3>
                      <button onClick={() => setSelectedErrorExp(null)} style={modalCloseButtonStyle}>
                        <X size={16} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.6' }}>
                      <h4 style={{ fontWeight: '800', color: 'var(--danger)' }}>错误类型：{selectedErrorExp.title}</h4>
                      <p style={{ background: 'rgba(15, 118, 110, 0.04)', padding: '14px', borderRadius: '12px', borderLeft: '4px solid var(--primary-neon)', fontSize: '13px' }}>
                        {selectedErrorExp.ai_explanation}
                      </p>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>推荐修复后的标准源码：</span>
                        <div style={{ background: '#1e1e24', padding: '14px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', color: '#f8f8f2', border: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'pre' }}>
                          {selectedErrorExp.solution}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-neon)', paddingTop: '12px' }}>
                      <button className="cyber-btn" onClick={() => setSelectedErrorExp(null)}>
                        我知道了
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 🤖 MULTI-AGENT COMMAND CONSOLE TAB */}
          {activeTab === 'agent-console' && (
            <>
              <header>
                <h2 style={{ fontSize: '24px', marginBottom: '4px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  智能体协同控制台
                  <a
                    href="#"
                    role="button"
                    onClick={(e) => {
                      e.preventDefault();
                      goDashboardHome();
                    }}
                    style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--primary-neon)', cursor: 'pointer', opacity: 0.8, textDecoration: 'underline' }}
                  >
                    返回首页
                  </a>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  多智能体协同网络运作后台。监控主管智能体、画像智能体、路径智能体与安全校验智能体的协作流向。
                </p>
              </header>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginTop: '20px' }}>
                {/* Left Column: Visual Agent Topology Map */}
                <div className="cyber-card" style={{ padding: '28px', background: 'var(--bg-card-glass)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '1px solid var(--border-neon)', paddingBottom: '8px' }}>
                    🕸️ 多智能体协同拓扑图
                  </h3>

                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                    <svg width="400" height="300" viewBox="0 0 400 300">
                      <line x1="200" y1="50" x2="100" y2="150" stroke="var(--primary-neon)" strokeWidth="2" strokeDasharray="5 5" style={{ strokeDashoffset: '10', animation: 'dash 10s linear infinite' }} />
                      <line x1="200" y1="50" x2="300" y2="150" stroke="var(--primary-neon)" strokeWidth="2" strokeDasharray="5 5" style={{ strokeDashoffset: '10', animation: 'dash 10s linear infinite' }} />
                      <line x1="100" y1="150" x2="200" y2="250" stroke="var(--primary-neon)" strokeWidth="2" strokeDasharray="5 5" style={{ strokeDashoffset: '10', animation: 'dash 10s linear infinite' }} />
                      <line x1="300" y1="150" x2="200" y2="250" stroke="var(--primary-neon)" strokeWidth="2" strokeDasharray="5 5" style={{ strokeDashoffset: '10', animation: 'dash 10s linear infinite' }} />
                      <line x1="200" y1="50" x2="200" y2="250" stroke="rgba(29, 78, 216, 0.3)" strokeWidth="1.5" strokeDasharray="3 3" />

                      <g onClick={() => setActiveConsoleAgent('executive')} style={{ cursor: 'pointer' }}>
                        <circle cx="200" cy="50" r="28" fill="#1e293b" stroke="var(--secondary)" strokeWidth="3" className="pulse-glow" />
                        <text x="200" y="54" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800" fontFamily="sans-serif">主管</text>
                      </g>

                      <g onClick={() => setActiveConsoleAgent('profile')} style={{ cursor: 'pointer' }}>
                        <circle cx="100" cy="150" r="28" fill="#1e293b" stroke={activeConsoleAgent === 'profile' ? 'var(--primary-neon)' : 'rgba(15, 118, 110, 0.4)'} strokeWidth="3" />
                        <text x="100" y="154" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800" fontFamily="sans-serif">画像</text>
                      </g>

                      <g onClick={() => setActiveConsoleAgent('path')} style={{ cursor: 'pointer' }}>
                        <circle cx="300" cy="150" r="28" fill="#1e293b" stroke={activeConsoleAgent === 'path' ? 'var(--primary-neon)' : 'rgba(15, 118, 110, 0.4)'} strokeWidth="3" />
                        <text x="300" y="154" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800" fontFamily="sans-serif">路径</text>
                      </g>

                      <g onClick={() => setActiveConsoleAgent('security')} style={{ cursor: 'pointer' }}>
                        <circle cx="200" cy="250" r="28" fill="#1e293b" stroke={activeConsoleAgent === 'security' ? 'var(--danger)' : 'rgba(190, 18, 60, 0.4)'} strokeWidth="3" />
                        <text x="200" y="254" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800" fontFamily="sans-serif">安全</text>
                      </g>
                    </svg>
                    <style>{`
                    @keyframes dash {
                      to {
                        stroke-dashoffset: -100;
                      }
                    }
                  `}</style>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-neon)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary-neon)', marginBottom: '6px' }}>
                      {activeConsoleAgent === 'executive' && "👑 主管智能体 (Executive Agent)"}
                      {activeConsoleAgent === 'profile' && "📊 画像智能体 (Profile Agent)"}
                      {activeConsoleAgent === 'path' && "📍 路径智能体 (Path Agent)"}
                      {activeConsoleAgent === 'security' && "🛡️ 安全校验智能体 (Security Audit Agent)"}
                    </h4>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                      {activeConsoleAgent === 'executive' && "核心控制代理枢纽，负责调度协调用户意图。接收用户的对话命令并决定是否分发给画像智能体评估，或者指令路径智能体重新生成关卡。"}
                      {activeConsoleAgent === 'profile' && "维护用户的6维动态画像，根据对话记录提取语义标签，并根据错题及测验提交数据，利用平滑差值函数调整认知指标，直接反馈给路径规划端。"}
                      {activeConsoleAgent === 'path' && "自适应路径生成器。负责对用户的学习大纲进行动态编排，并在后台触发 `/resources` 生成机制，生成音画课件、测验习题与代码用例。"}
                      {activeConsoleAgent === 'security' && "学术安全与幻觉防御智能屏障。采用专有对齐护栏，在资源生成与对话中防止幻觉和敏感词入侵，同时为用户提供单元测试用例的代码断言保护。"}
                    </p>
                  </div>
                </div>

                {/* Right Column: Live Logs Console */}
                <div className="cyber-card" style={{ padding: '28px', background: 'var(--bg-card-glass)', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '1px solid var(--border-neon)', paddingBottom: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    💬 协同消息报文流
                    <span className="pulsing-dot" style={{ display: 'inline-block' }}></span>
                  </h3>

                  <div className="console-logs-box" style={{ flexGrow: 1 }}>
                    {agentLogs.map((log, idx) => (
                      <div key={idx} style={{ marginBottom: '10px', borderBottom: '1px dashed rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                        <span style={{ color: '#5c6370', marginRight: '6px' }}>[{log.time}]</span>
                        <span style={{
                          color: log.sender === '主管智能体' ? 'var(--secondary)' :
                            log.sender === '画像智能体' ? 'var(--primary-neon)' :
                              log.sender === '安全校验智能体' ? 'var(--danger)' : 'var(--warning)',
                          fontWeight: '700',
                          marginRight: '6px'
                        }}>
                          {log.sender}:
                        </span>
                        <span style={{ color: '#e2e8f0' }}>{log.log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 🏆 ACADEMIC ACHIEVEMENTS TAB */}
          {activeTab === 'achievements' && (
            <>
              <header>
                <h2 style={{ fontSize: '24px', marginBottom: '4px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  学术成就与自适应勋章墙
                  <a
                    href="#"
                    role="button"
                    onClick={(e) => {
                      e.preventDefault();
                      goDashboardHome();
                    }}
                    style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--primary-neon)', cursor: 'pointer', opacity: 0.8, textDecoration: 'underline' }}
                  >
                    返回首页
                  </a>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  画像智能体根据您当前的 6 维认知能力指标实时解锁对应的荣誉徽章及毕业证书。
                </p>
              </header>

              {/* Badges Grid */}
              <div className="badge-wall-grid" style={{ marginTop: '20px' }}>
                {[
                  { name: "百科全书学霸", desc: "基础知识库得分 >= 70 解锁", rule: profile.knowledge_base >= 70, icon: <BookOpen size={28} /> },
                  { name: "虫洞终结者", desc: "调试能力得分 >= 70 解锁", rule: profile.debugging >= 70 || profile.debugging === undefined, icon: <Cpu size={28} /> },
                  { name: "代码实操狂魔", desc: "实践能力得分 >= 70 解锁", rule: profile.practical >= 70 || profile.practical === undefined, icon: <Code2 size={28} /> },
                  { name: "逻辑推导演绎家", desc: "推理分析得分 >= 70 解锁", rule: profile.reasoning >= 70 || profile.reasoning === undefined, icon: <TrendingUp size={28} /> }
                ].map((badge, idx) => (
                  <div key={idx} className={`badge-card ${badge.rule ? 'unlocked' : 'locked'}`}>
                    <div className="badge-icon-wrapper">
                      {badge.icon}
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>{badge.name}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{badge.desc}</p>
                    <div style={{ marginTop: '12px' }}>
                      {badge.rule ? (
                        <span className="neon-badge neon-badge-success">已解锁</span>
                      ) : (
                        <span className="neon-badge" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-dim)' }}>未解锁</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Study heat map & certificate card */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '28px' }}>
                {/* Contribution Activity Map */}
                <div className="cyber-card" style={{ padding: '24px', background: 'var(--bg-card-glass)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📊 学术研学活力图
                  </h3>
                  <div className="heatmap-grid">
                    {Array.from({ length: 371 }).map((_, idx) => {
                      let levelClass = "";
                      const rand = Math.sin(idx) * 10;
                      if (rand > 7) levelClass = "level-4";
                      else if (rand > 4) levelClass = "level-3";
                      else if (rand > 1) levelClass = "level-2";
                      else if (rand > -2) levelClass = "level-1";
                      return <div key={idx} className={`heatmap-cell ${levelClass}`}></div>;
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', marginTop: '8px' }}>
                    <span>365 天研学活力追踪</span>
                    <span>少 <span className="heatmap-cell" style={{ display: 'inline-block', width: '8px', height: '8px', minWidth: 'auto', borderRadius: '1px', verticalAlign: 'middle', margin: '0 4px' }}></span> <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--primary-neon)', borderRadius: '1px', verticalAlign: 'middle', margin: '0 4px' }}></span> 多</span>
                  </div>
                </div>

                {/* Graduation Certificate Download */}
                <div className="cyber-card" style={{ padding: '24px', background: 'var(--bg-card-glass)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🎓 自适应结业证书发放
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
                      当您全部通关 8 个 Stage 并且综合学习指标评估合格，系统画像智能体会签发一份权威自适应微专业毕业证书。
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const username = localStorage.getItem('regUsername') || 'default_user';
                      setProfileAlert("🎓 正在为您签发PDF结业证书，请稍候...");
                      setTimeout(() => setProfileAlert(''), 3000);
                      window.open(`http://127.0.0.1:8000/api/achievements/certificate?username=${username}`, '_blank');
                    }}
                    className="cyber-btn"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Download size={16} /> 下载微专业自适应结业证书
                  </button>
                </div>
              </div>
            </>
          )}

        </main>
      </div>

      {/* 🎬 Interactive Modals */}
      {activeModal === 'pdf' && renderPdfModal()}
      {activeModal === 'slide' && renderSlideModal()}
      {activeModal === 'quiz' && renderQuizModal()}
      {activeModal === 'mindmap' && renderMindmapModal()}
      {activeModal === 'code' && renderCodeModal()}
    </>
  );
}
