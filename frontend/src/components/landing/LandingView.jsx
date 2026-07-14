import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  GraduationCap,
  Moon,
  Sun,
  ArrowRight,
  Cpu,
  Sparkles,
  TrendingUp,
  Code2,
  BookOpen,
  Video,
  Info,
  Lock,
  FileCode,
  HelpCircle,
  FileText,
  Map,
  Terminal,
  MessageSquare,
  FolderGit2
} from 'lucide-react';
import MiniSandboxPlayground from './MiniSandboxPlayground';
import RadarCustomizer from './RadarCustomizer';

import { useAppContext } from '../../context/AppContext';

gsap.registerPlugin(ScrollTrigger);

const LandingView = () => {
  const {
    isLoggedIn,
    setCurrentView,
    setAuthMode,
    theme,
    setTheme,
    regCognitiveStyle,
    setRegCognitiveStyle
  } = useAppContext();

  const [demoStyle, setDemoStyle] = useState('practical'); // 'practical' | 'theoretical' | 'visual'
  const [demoProfile, setDemoProfile] = useState({
    knowledge_base: 30,
    learning_pace: 45,
    engagement: 85,
    reasoning: 60,
    debugging: 90,
    practical: 95
  });

  const [simActiveAgent, setSimActiveAgent] = useState('executive');
  const [simScenario, setSimScenario] = useState('');
  const [simLogs, setSimLogs] = useState([]);
  const [simConsensus, setSimConsensus] = useState(0);
  const [simIsRunning, setSimIsRunning] = useState(false);

  const demoProfileAnimRef = useRef({
    knowledge_base: 30,
    learning_pace: 45,
    engagement: 85,
    reasoning: 60,
    debugging: 90,
    practical: 95
  });

  // Handle demo profile morph animations
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
      gsap.fromTo(".demo-path-node",
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.06, ease: "power1.out" }
      );
    });
    return () => ctx.revert();
  }, [demoStyle]);

  // GSAP scroll trigger animations for landing sections
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Cross-fade academic background overlay 1 and 2 on scroll
      gsap.to(".academic-bg-overlay-1", {
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: true
        },
        opacity: 0,
        ease: "none"
      });

      gsap.to(".academic-bg-overlay-2", {
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: true
        },
        opacity: theme === 'light' ? 0.12 : 0.05,
        ease: "none"
      });

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

      gsap.to(".timeline-line-progress", {
        scaleY: 1,
        scrollTrigger: {
          trigger: ".timeline-container",
          start: "top 70%",
          end: "bottom 80%",
          scrub: true
        }
      });

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
  }, []);

  const goPortalHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const runTopologySimulation = (scenarioKey) => {
    if (simIsRunning) return;
    setSimIsRunning(true);
    setSimScenario(scenarioKey);
    setSimLogs([]);
    setSimConsensus(0);

    const steps = {
      diagnose: [
        { agent: 'executive', log: '[主管智能体]: 捕获学生在前测输入中提供的兴趣与学术基础。启动画像推演...', consensus: 20 },
        { agent: 'profile', log: '[画像智能体]: 基于输入提取关键词 "机器学习", "分类边界"，更新雷达：[理论分析] -> 85%。判定为“硬核理论”风格。', consensus: 50 },
        { agent: 'path', log: '[路径智能体]: 检索知识拓扑图。重构路径：Stage 1 变更为 "梯度下降数学偏导证明"，生成对应课件。', consensus: 80 },
        { agent: 'security', log: '[安全校验智能体]: 校验推送的线性公式及学术数据，防幻觉事实检查：PASS。学术安全共识达成！', consensus: 100 }
      ],
      sandbox_success: [
        { agent: 'executive', log: '[主管智能体]: 捕获到用户在 AI 编程沙盒成功通过 PyTest 全量用例。启动学时统计。', consensus: 30 },
        { agent: 'profile', log: '[画像智能体]: 雷达更新：[实操应用] +12%，学习时长 +10 分钟。诊断出学生对 Python list 切片熟练度极高。', consensus: 60 },
        { agent: 'path', log: '[路径智能体]: 推进主线关卡。解锁 Stage 2 "面向对象封装 CLI 计算器" 及 "代码重构最佳实践"。', consensus: 85 },
        { agent: 'security', log: '[安全校验智能体]: 扫描解锁命令以及写入日志参数安全性。校验共识：SUCCESS。', consensus: 100 }
      ],
      remedy: [
        { agent: 'executive', log: '[主管智能体]: 捕获到用户在单元测试中产生 IndexOutOfBoundsError。紧急触发纠偏。', consensus: 25 },
        { agent: 'profile', log: '[画像智能体]: 画像微调：[易错倾向-越界率] 增加。标记知识漏洞 "数组边界"，写入错题 ledger。', consensus: 55 },
        { agent: 'path', log: '[路径智能体]: 中止主线推进。动态回溯，逆向从错题库调度同类考点 MCQ 测试，开启靶向纠偏。', consensus: 80 },
        { agent: 'security', log: '[安全校验智能体]: 检索错题模板，过滤可能产生的歧义代码，安全审核：PASS。靶向训练包分发！', consensus: 100 }
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
        {hexagons.map((points, idx) => (
          <polygon
            key={idx}
            points={points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="rgba(15, 118, 110, 0.12)"
            strokeWidth="1.5"
          />
        ))}
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
              stroke="url(#gradient-accent-landing)"
              strokeWidth="2.5"
            />
          </>
        )}
        {valueCoords.map((c, idx) => (
          <circle key={idx} cx={c.x} cy={c.y} r="4" fill="var(--accent)" />
        ))}
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
          <linearGradient id="gradient-accent-landing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary-neon)" />
            <stop offset="100%" stopColor="var(--secondary)" />
          </linearGradient>
        </defs>
      </svg>
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

  return (
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      
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
          <a onClick={goPortalHome} className="landing-nav-link">门户首页</a>
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
              当您在系统中前行，主管智能体、画像智能体与路径智能休会根据您的实时状态，全生命周期动态调配如下学习环节。
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

          <div
            className="tilt-card"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            style={{ marginBottom: '40px' }}
          >
            <div className="card-shine-overlay" />
            <MiniSandboxPlayground />
          </div>

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

      {/* Architecture Flow Section */}
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
  );
};

export default LandingView;
