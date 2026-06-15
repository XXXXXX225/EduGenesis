import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BookOpen,
  MessageSquare,
  TrendingUp,
  FolderGit2,
  Cpu,
  User,
  HelpCircle,
  Sparkles,
  Code2,
  LogOut,
  GraduationCap,
  Sun,
  Moon,
  Settings,
  PanelLeftOpen,
  PanelLeftClose,
  Plus,
  Trash2,
  FolderDown,
  FolderUp,
  ChevronDown,
  Settings2
} from 'lucide-react';
import { clearSession } from './utils/session';
import MobileTabBar from './components/shared/MobileTabBar';
import { ContentSkeleton } from './components/shared/Skeleton';
import LandingView from './components/landing/LandingView';
import AuthView from './components/auth/AuthView';

gsap.registerPlugin(ScrollTrigger);

import HomeView from './components/dashboard/HomeView';
import ChatView from './components/dashboard/ChatView';
import PathView from './components/dashboard/PathView';
import ResourcesView from './components/dashboard/ResourcesView';
import SandboxView from './components/dashboard/SandboxView';
import ErrorsView from './components/dashboard/ErrorsView';
import ConsoleView from './components/dashboard/ConsoleView';
import AchievementsView from './components/dashboard/AchievementsView';
import SettingsView from './components/dashboard/SettingsView';

import PDFModal from './components/modals/PDFModal';
import SlideModal from './components/modals/SlideModal';
import QuizModal from './components/modals/QuizModal';
import MindmapModal from './components/modals/MindmapModal';
import CodeModal from './components/modals/CodeModal';
import VideoModal from './components/modals/VideoModal';
import SettingsModal from './components/modals/SettingsModal';

import { AppProvider, useAppContext } from './context/AppContext';

const PromptInput = ({ defaultValue, onSubmit, onCancel }) => {
  const [value, setValue] = React.useState(defaultValue || '');
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSubmit(value);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', marginTop: '10px' }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: '10px',
          background: 'var(--bg-card-active)',
          border: '1px solid var(--border-neon)',
          color: 'var(--text-main)',
          fontSize: '14px',
          outline: 'none',
          boxSizing: 'border-box'
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          onClick={onCancel}
          className="cyber-btn"
          style={{ padding: '8px 16px', fontSize: '13px', background: 'rgba(0,0,0,0.02)', borderColor: 'rgba(0,0,0,0.1)' }}
        >
          取消
        </button>
        <button
          onClick={() => onSubmit(value)}
          className="cyber-btn"
          style={{ padding: '8px 20px', fontSize: '13px' }}
        >
          确定
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

function AppContent() {
  const {
    isLoggedIn,
    setIsLoggedIn,
    theme,
    setTheme,
    currentView,
    setCurrentView,
    authMode,
    setAuthMode,
    regUsername,
    setRegUsername,
    regPassword,
    setRegPassword,
    regCognitiveStyle,
    setRegCognitiveStyle,
    regLearningGoal,
    setRegLearningGoal,
    isLoadingOrchestration,
    setIsLoadingOrchestration,
    isLoadingDashboard,
    orchestrationStep,
    setOrchestrationStep,
    activeTab,
    setActiveTab,
    profile,
    displayProfile,
    selectedNode,
    diagnosticLogs,
    profileAlert,
    selectedNodeResources,
    activeModal,
    setActiveModal,
    currentSlideIdx,
    setCurrentSlideIdx,
    slideTypingText,
    setSlideTypingText,
    loadDashboardState,
    goPortalHome,
    goDashboardHome,
    chat,
    speech,
    quiz,
    chatSessions,
    currentSessionId,
    setCurrentSessionId,
    isLeftSidebarOpen,
    setIsLeftSidebarOpen,
    tutorPersonality,
    setTutorPersonality,
    loadSessionMessages,
    startNewChat,
    deleteSession,
    renameSession,
    clearAllSessions,
    customDialog,
    setCustomDialog,
    showCustomAlert,
    showCustomConfirm,
    showCustomPrompt
  } = useAppContext();

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [deltas, setDeltas] = useState({ study_time: 0, quiz_accuracy: 0, mastered_nodes: 0 });

  useEffect(() => {
    if (!customDialog) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (customDialog.type === 'confirm') {
          customDialog.resolve(false);
        } else {
          customDialog.resolve(null);
        }
        setCustomDialog(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [customDialog, setCustomDialog]);

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

  // Resizable sidebar states & event handlers
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('edugenesis_sidebar_width');
    return saved ? parseInt(saved, 10) : 340;
  });
  const [isResizing, setIsResizing] = useState(false);

  const startResize = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      let newWidth = window.innerWidth - e.clientX;
      if (newWidth < 280) newWidth = 280;
      if (newWidth > 600) newWidth = 600;
      setSidebarWidth(newWidth);
      localStorage.setItem('edugenesis_sidebar_width', newWidth.toString());
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Refs for GSAP scoping & animation
  const mainContentRef = useRef(null);
  const chatEndRef = useRef(null);
  const sidebarViewportRef = useRef(null);

  // 1. Initial Page Load Animation (Stagger Reveal with React 18 StrictMode Safety)
  useEffect(() => {
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

    return () => ctx.revert();
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

  // 2. Tab Change Fade-in Animation (animates the right sidebar viewport instead of the permanent left chat column)
  useEffect(() => {
    if (isLoggedIn && sidebarViewportRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(sidebarViewportRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
        );
      }, sidebarViewportRef);

      return () => ctx.revert();
    }
  }, [activeTab, isLoggedIn]);

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
  }, [chat.chatHistory, chat.tutorStatus]);

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

      if (speech.isPlayingSlide) {
        speech.handleSlideSpeech(selectedNodeResources.slide[currentSlideIdx]?.title + ". " + currentText);
      }

      gsap.fromTo(".slide-content-card",
        { opacity: 0, scale: 0.96, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );

      return () => {
        clearInterval(interval);
        speech.stopSlideSpeech();
      };
    }
  }, [currentSlideIdx, speech.isPlayingSlide, activeModal, selectedNodeResources]);

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

    const baseLevels = [0.25, 0.5, 0.75, 1.0];
    const hexagons = baseLevels.map(level => angles.map(angle => getCoord(angle, level)));

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
        <defs>
          <linearGradient id="gradient-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary-neon)" />
            <stop offset="100%" stopColor="var(--secondary)" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  if (currentView === 'landing' || currentView === 'auth' || !isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
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

        {currentView === 'landing' ? (
          <LandingView />
        ) : (
          <AuthView />
        )}
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
        <div className="glow-orb-1" style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(15, 118, 110, 0.06) 0%, transparent 70%)', top: '10%', right: '15%', pointerEvents: 'none', zIndex: 0 }}></div>
        <div className="glow-orb-2" style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(29, 78, 216, 0.04) 0%, transparent 70%)', bottom: '15%', left: '40%', pointerEvents: 'none', zIndex: 0 }}></div>

        {/* 🚀 TOP HEADER */}
        <header className="agent-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setIsLeftSidebarOpen(prev => !prev)}
              style={{
                padding: '8px',
                borderRadius: '10px',
                background: 'var(--bg-card-active)',
                border: '1px solid var(--border-neon)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s'
              }}
              title={isLeftSidebarOpen ? "收起侧栏" : "展开侧栏"}
            >
              {isLeftSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
            <div style={{ padding: '10px', background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.15) 0%, rgba(29, 78, 216, 0.1) 100%)', borderRadius: '14px', border: '1px solid rgba(15, 118, 110, 0.25)', display: 'flex' }}>
              <GraduationCap size={24} style={{ color: 'var(--primary-neon)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.04em', margin: 0 }}>
                Edu<span style={{ color: 'var(--secondary)' }}>Genesis</span>
              </h1>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginTop: '-2px' }}>多智能体自适应学习空间</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Active Model Indicator */}
            <span className="neon-badge neon-badge-primary" style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={12} /> {profile.cognitive_style || '自适应学习模式'}
            </span>

            {/* Night mode toggle */}
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              style={{
                padding: '8px',
                borderRadius: '10px',
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
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>

            {/* Settings cog */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              style={{
                padding: '8px',
                borderRadius: '10px',
                background: 'var(--bg-card-active)',
                border: '1px solid var(--border-neon)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s'
              }}
              title="模型服务配置"
            >
              <Settings size={14} />
            </button>

            {/* User Avatar Cockpit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '12px', borderLeft: '1px solid rgba(0,0,0,0.08)' }}>
              <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(15, 118, 110, 0.06)', border: '1px solid rgba(15, 118, 110, 0.12)', display: 'flex' }}>
                <User size={14} style={{ color: 'var(--primary)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-main)' }}>{regUsername || '体验官'}</span>
                <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '-1px' }}>已认证学术空间</span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={() => {
                clearSession();
                setIsLoggedIn(false);
                setCurrentView('landing');
                setRegUsername('');
                setRegPassword('');
              }}
              className="cyber-btn"
              style={{
                background: 'rgba(190, 18, 60, 0.04)',
                borderColor: 'rgba(190, 18, 60, 0.12)',
                color: 'var(--danger)',
                boxShadow: 'none',
                padding: '6px 12px',
                fontSize: '11px',
                textTransform: 'none',
                letterSpacing: 'normal'
              }}
            >
              退出
            </button>
          </div>
        </header>

        {/* 📱 2-COLUMN BODY */}
        <div 
          className="agent-body" 
          style={{ 
            '--sidebar-width': `${sidebarWidth}px`,
            '--left-sidebar-width': isLeftSidebarOpen ? '260px' : '0px'
          }}
        >
          {/* Collapsible Left Sidebar */}
          <aside 
            className="agent-panel-left-collapsible"
            style={{
              borderRight: isLeftSidebarOpen ? undefined : 'none',
              padding: isLeftSidebarOpen ? '20px 14px' : '0px'
            }}
          >
            {isLeftSidebarOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                {/* Top: New Chat button */}
                <div>
                  <button
                    onClick={startNewChat}
                    className="cyber-btn"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      marginBottom: '20px'
                    }}
                  >
                    <Plus size={16} /> 开启新对话
                  </button>
                  
                  {/* Middle: Sessions scroll list */}
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px', paddingLeft: '4px' }}>
                    会话历史
                  </div>
                  
                  <div style={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 430px)', paddingRight: '2px' }}>
                    {chatSessions && chatSessions.map((sess) => (
                      <div
                        key={sess.session_id}
                        className={`history-session-item ${currentSessionId === sess.session_id ? 'active' : ''}`}
                        onClick={() => {
                          setCurrentSessionId(sess.session_id);
                          loadSessionMessages(sess.session_id);
                        }}
                      >
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                          💬 {sess.title}
                        </span>
                        <div className="history-item-actions">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const newTitle = await showCustomPrompt("输入新标题:", sess.title);
                              if (newTitle) renameSession(sess.session_id, newTitle);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '10px' }}
                            title="重命名"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const confirmed = await showCustomConfirm("确定要删除此对话吗？");
                              if (confirmed) deleteSession(sess.session_id);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '10px' }}
                            title="删除"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Bottom: Quick Console panel */}
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '15px' }}>
                  {/* Character personality select */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '6px' }}>导师性格设定</div>
                    <select
                      value={tutorPersonality}
                      onChange={(e) => setTutorPersonality(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '8px',
                        background: 'var(--bg-card-active)',
                        border: '1px solid var(--border-neon)',
                        color: 'var(--text-main)',
                        fontSize: '12px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="academic">🎓 严肃学术风</option>
                      <option value="encouraging">🌟 温暖鼓励风</option>
                      <option value="coder">🤖 极客代码风</option>
                    </select>
                  </div>

                  {/* Shortcut triggers */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
                    <button
                      onClick={() => {
                        chat.setChatInput("我想学 Python 基础");
                        setTimeout(() => {
                          // Programmatically dispatch submit event to trigger send message
                          const formEl = document.querySelector("form");
                          if (formEl) {
                            const submitEvent = new Event("submit", { cancelable: true, bubbles: true });
                            formEl.dispatchEvent(submitEvent);
                          }
                        }, 150);
                      }}
                      style={{ padding: '6px', fontSize: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-neon)', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      🐍 Python基础
                    </button>
                    <button
                      onClick={() => {
                        chat.setChatInput("我想学习机器学习");
                        setTimeout(() => {
                          const formEl = document.querySelector("form");
                          if (formEl) {
                            const submitEvent = new Event("submit", { cancelable: true, bubbles: true });
                            formEl.dispatchEvent(submitEvent);
                          }
                        }, 150);
                      }}
                      style={{ padding: '6px', fontSize: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-neon)', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      📈 机器学习
                    </button>
                  </div>
                  
                  {/* Clear all and export buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        const historyText = chat.chatHistory.map(m => `**${m.role === 'user' ? '学生' : '智能导师'}**: ${m.content}\n`).join('\n');
                        const blob = new Blob([historyText], { type: 'text/markdown;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `edugenesis-chat-${currentSessionId}.md`;
                        a.click();
                      }}
                      className="cyber-btn"
                      style={{ flex: 1, padding: '6px', fontSize: '11px', textTransform: 'none' }}
                    >
                      📤 导出
                    </button>
                    <button
                      onClick={async () => {
                        const confirmed = await showCustomConfirm("确定要清空全部会话历史吗？");
                        if (confirmed) clearAllSessions();
                      }}
                      className="cyber-btn"
                      style={{ flex: 1, padding: '6px', fontSize: '11px', textTransform: 'none', background: 'rgba(190, 18, 60, 0.04)', borderColor: 'rgba(190, 18, 60, 0.12)', color: 'var(--danger)' }}
                    >
                      🗑️ 清空
                    </button>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Left Column: Core chat (occupies 1fr) */}
          <main className="agent-panel-middle" ref={mainContentRef}>
            <ChatView chatEndRef={chatEndRef} />
          </main>

          {/* Drag Resizer Divider */}
          <div
            className={`resize-handle ${isResizing ? 'active' : ''}`}
            onMouseDown={startResize}
          />

          {/* Right Column: Sidebar */}
          <aside className="agent-panel-right">
            {/* 1. Tab strip (right edge, 50px wide) */}
            {(() => {
              const rightTabList = ['home', 'path', 'resources', 'errors', 'agent-console', 'achievements'];
              const sidebarTab = rightTabList.includes(activeTab) ? activeTab : 'resources';

              return (
                <div className="right-sidebar-tab-strip">
                  <div
                    className={`right-sidebar-tab-icon ${sidebarTab === 'home' ? 'active' : ''}`}
                    onClick={() => setActiveTab('home')}
                    title="认知画像与统计"
                  >
                    <User size={20} />
                  </div>
                  <div
                    className={`right-sidebar-tab-icon ${sidebarTab === 'path' ? 'active' : ''}`}
                    onClick={() => setActiveTab('path')}
                    title="自适应路线规划"
                  >
                    <TrendingUp size={20} />
                  </div>
                  <div
                    className={`right-sidebar-tab-icon ${sidebarTab === 'resources' ? 'active' : ''}`}
                    onClick={() => setActiveTab('resources')}
                    title="多模态学习资源"
                  >
                    <FolderGit2 size={20} />
                  </div>
                  <div
                    className={`right-sidebar-tab-icon ${sidebarTab === 'errors' ? 'active' : ''}`}
                    onClick={() => setActiveTab('errors')}
                    title="智能错题加固"
                  >
                    <HelpCircle size={20} />
                  </div>
                  <div
                    className={`right-sidebar-tab-icon ${sidebarTab === 'agent-console' ? 'active' : ''}`}
                    onClick={() => setActiveTab('agent-console')}
                    title="智能体控制台"
                  >
                    <Cpu size={20} />
                  </div>
                  <div
                    className={`right-sidebar-tab-icon ${sidebarTab === 'achievements' ? 'active' : ''}`}
                    onClick={() => setActiveTab('achievements')}
                    title="学术勋章与成就"
                  >
                    <GraduationCap size={20} />
                  </div>
                </div>
              );
            })()}

            {/* 2. Content viewport (left edge, 290px wide) */}
            <div className="right-sidebar-content-viewport" ref={sidebarViewportRef}>
              {isLoadingDashboard ? (
                <ContentSkeleton lines={4} />
              ) : (() => {
                const rightTabList = ['home', 'path', 'resources', 'errors', 'agent-console', 'achievements'];
                const sidebarTab = rightTabList.includes(activeTab) ? activeTab : 'resources';

                return (
                  <div key={sidebarTab} className="tab-fade-in">
                    {sidebarTab === 'home' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Cognitive Radar Chart Card */}
                        <div className="cyber-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-card-glass)', flexShrink: 0 }}>
                          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '12.5px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                              <Sparkles size={13} style={{ color: 'var(--accent-cyan)' }} /> 认知雷达画像
                            </h3>
                            <span className="neon-badge neon-badge-primary" style={{ padding: '2px 6px', fontSize: '9px' }}>实时更新</span>
                          </div>
                          {renderRadarChart(displayProfile)}
                          <div style={{ width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.05)', marginTop: '8px', paddingTop: '10px', fontSize: '11.5px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ color: 'var(--text-muted)' }}>知识掌握度:</span>
                              <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>
                                {profile.knowledge_base}%
                                {profile.learning_stats?.knowledge_base_delta > 0 && (
                                  <span style={{ color: '#10b981', marginLeft: '4px', fontWeight: 'bold' }} className="pulse-glow-green">
                                    (↑ {profile.learning_stats.knowledge_base_delta}%)
                                  </span>
                                )}
                                {profile.learning_stats?.knowledge_base_delta < 0 && (
                                  <span style={{ color: '#ef4444', marginLeft: '4px', fontWeight: 'bold' }}>
                                    (↓ {Math.abs(profile.learning_stats.knowledge_base_delta)}%)
                                  </span>
                                )}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ color: 'var(--text-muted)' }}>自适应节奏:</span>
                              <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>
                                {profile.learning_pace}%
                                {profile.learning_stats?.learning_pace_delta > 0 && (
                                  <span style={{ color: '#10b981', marginLeft: '4px', fontWeight: 'bold' }} className="pulse-glow-green">
                                    (↑ {profile.learning_stats.learning_pace_delta}%)
                                  </span>
                                )}
                                {profile.learning_stats?.learning_pace_delta < 0 && (
                                  <span style={{ color: '#ef4444', marginLeft: '4px', fontWeight: 'bold' }}>
                                    (↓ {Math.abs(profile.learning_stats.learning_pace_delta)}%)
                                  </span>
                                )}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ color: 'var(--text-muted)' }}>自适应活跃度:</span>
                              <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>
                                {profile.engagement}%
                                {profile.learning_stats?.engagement_delta > 0 && (
                                  <span style={{ color: '#10b981', marginLeft: '4px', fontWeight: 'bold' }} className="pulse-glow-green">
                                    (↑ {profile.learning_stats.engagement_delta}%)
                                  </span>
                                )}
                                {profile.learning_stats?.engagement_delta < 0 && (
                                  <span style={{ color: '#ef4444', marginLeft: '4px', fontWeight: 'bold' }}>
                                    (↓ {Math.abs(profile.learning_stats.engagement_delta)}%)
                                  </span>
                                )}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ color: 'var(--text-muted)' }}>首选风格:</span>
                              <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{profile.cognitive_style}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-muted)' }}>学习目标:</span>
                              <span style={{ color: 'var(--text-main)', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px' }} title={profile.learning_goals.join(', ')}>{profile.learning_goals.join(', ')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick stats board */}
                        <div className="cyber-card" style={{ padding: '16px', background: 'var(--bg-card-glass)', flexShrink: 0 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                            <div style={{ padding: '8px 4px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.04)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                                <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--primary-neon)' }}>
                                  {profile.learning_stats?.study_time || 0}
                                </span>
                                {deltas.study_time > 0 && (
                                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#10b981' }}>+{deltas.study_time}</span>
                                )}
                              </div>
                              <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>累计时长</span>
                            </div>
                            <div style={{ padding: '8px 4px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.04)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                                <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--secondary)' }}>
                                  {profile.learning_stats?.quiz_accuracy || 0}%
                                </span>
                                {deltas.quiz_accuracy !== 0 && (
                                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: deltas.quiz_accuracy > 0 ? '#10b981' : '#ef4444' }}>
                                    {deltas.quiz_accuracy > 0 ? `+${deltas.quiz_accuracy}` : `${deltas.quiz_accuracy}`}
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>做题正确率</span>
                            </div>
                            <div style={{ padding: '8px 4px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.04)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                                <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent)' }}>
                                  {profile.learning_stats?.mastered_nodes || 0}/8
                                </span>
                                {deltas.mastered_nodes > 0 && (
                                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#10b981' }}>+{deltas.mastered_nodes}</span>
                                )}
                              </div>
                              <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block' }}>掌握关卡</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {sidebarTab === 'path' && <PathView />}
                    {sidebarTab === 'resources' && <ResourcesView />}
                    {sidebarTab === 'errors' && <ErrorsView />}
                    {sidebarTab === 'agent-console' && <ConsoleView />}
                    {sidebarTab === 'achievements' && <AchievementsView />}
                  </div>
                );
              })()}
            </div>
          </aside>
        </div>
      </div>

      <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} onSettingsOpen={() => setIsSettingsOpen(true)} />
      {/* 🎬 Interactive Modals */}
      <PDFModal
        isOpen={activeModal === 'pdf'}
        onClose={() => setActiveModal(null)}
        pdfContent={selectedNodeResources?.pdf}
        nodeTitle={selectedNode?.title}
      />
      <SlideModal
        isOpen={activeModal === 'slide'}
        onClose={() => setActiveModal(null)}
        slides={selectedNodeResources?.slide}
        nodeTitle={selectedNode?.title}
      />
      <QuizModal
        isOpen={activeModal === 'quiz'}
        onClose={() => setActiveModal(null)}
        quizList={selectedNodeResources?.quiz}
        nodeTitle={selectedNode?.title}
        onCompleteQuiz={quiz.handleCompleteQuiz}
      />
      <MindmapModal
        isOpen={activeModal === 'mindmap'}
        onClose={() => setActiveModal(null)}
        mindmapContent={selectedNodeResources?.mindmap}
        nodeTitle={selectedNode?.title}
      />
      <CodeModal
        isOpen={activeModal === 'code'}
        onClose={() => setActiveModal(null)}
        codeContent={selectedNodeResources?.code}
        nodeTitle={selectedNode?.title}
      />
      <VideoModal
        isOpen={activeModal === 'video'}
        onClose={() => setActiveModal(null)}
        videos={selectedNodeResources?.video}
        nodeTitle={selectedNode?.title}
      />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* 🎨 Custom Glassmorphic Dialog Overlay */}
      {customDialog && (
        <div className="modal-backdrop" style={{ zIndex: 1500 }}>
          <div className="cyber-card modal-content" style={{ maxWidth: '400px', width: '90%', padding: '24px', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-neon)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>
                {customDialog.type === 'alert' && '⚠️ ' + (customDialog.title || '提示')}
                {customDialog.type === 'confirm' && '❓ ' + (customDialog.title || '确认')}
                {customDialog.type === 'prompt' && '✏️ ' + (customDialog.title || '输入')}
              </h3>
            </div>
            
            <div style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
              {customDialog.message}
            </div>

            {customDialog.type === 'prompt' && (
              <PromptInput 
                defaultValue={customDialog.defaultValue} 
                onSubmit={(val) => {
                  customDialog.resolve(val);
                  setCustomDialog(null);
                }}
                onCancel={() => {
                  customDialog.resolve(null);
                  setCustomDialog(null);
                }}
              />
            )}

            {customDialog.type !== 'prompt' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                {customDialog.type === 'confirm' && (
                  <button
                    onClick={() => {
                      customDialog.resolve(false);
                      setCustomDialog(null);
                    }}
                    className="cyber-btn"
                    style={{ padding: '8px 16px', fontSize: '12px', background: 'rgba(0,0,0,0.02)', borderColor: 'rgba(0,0,0,0.1)' }}
                  >
                    取消
                  </button>
                )}
                <button
                  onClick={() => {
                    customDialog.resolve(true);
                    setCustomDialog(null);
                  }}
                  className="cyber-btn"
                  style={{ padding: '8px 20px', fontSize: '12px' }}
                  ref={(btn) => btn && btn.focus()}
                >
                  确定
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
