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
  GraduationCap
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'auth'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  
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
  
  // Registration inputs
  const [regUsername, setRegUsername] = useState('');
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

  const [activeTab, setActiveTab] = useState('home');
  const [profile, setProfile] = useState({
    knowledge_base: 40,
    learning_pace: 50,
    cognitive_style: "Practical Coding",
    error_patterns: ["Syntax Errors", "Indentation Issues"],
    learning_goals: ["Python Basics"],
    engagement: 80
  });

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
          const profileRes = await fetch('http://127.0.0.1:8000/api/profile');
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setProfile(profileData);
          }
          
          // Fetch updated path
          const pathRes = await fetch('http://127.0.0.1:8000/api/path');
          if (pathRes.ok) {
            const pathData = await pathRes.json();
            setPathNodes(pathData.nodes);
          }
        } catch (err) {
          console.warn("Error fetching initial states on registration complete:", err);
        } finally {
          setIsLoadingOrchestration(false);
          setIsLoggedIn(true);
          setActiveTab('home');
        }
      }, 4800);

    } catch (err) {
      setAuthError(err.message);
    }
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
          const profileRes = await fetch('http://127.0.0.1:8000/api/profile');
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setProfile(profileData);
          }
          
          // Sync frontend local path
          const pathRes = await fetch('http://127.0.0.1:8000/api/path');
          if (pathRes.ok) {
            const pathData = await pathRes.json();
            setPathNodes(pathData.nodes);
          }
        } catch (err) {
          console.warn("Error fetching states on login complete:", err);
        } finally {
          // Set registration username to correct value for Sidebar display
          setRegUsername(resData.username);
          setIsLoadingOrchestration(false);
          setIsLoggedIn(true);
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
    { id: "node1", title: "Python Environment", status: "completed", description: "Install Python & setup VS Code", resources: ["pdf", "code"] },
    { id: "node2", title: "Variables & Data Types", status: "active", description: "Learn integers, floats, strings and variables", resources: ["slide", "pdf", "quiz"] },
    { id: "node3", title: "Control Flow", status: "locked", description: "If-statements, loops and logical operations", resources: ["slide", "quiz", "code"] },
    { id: "node4", title: "Functions & Modules", status: "locked", description: "Defining reusable code and importing libraries", resources: ["slide", "pdf", "mindmap", "code"] },
    { id: "node5", title: "Final Project", status: "locked", description: "Build a CLI Calculator using functions", resources: ["code", "quiz"] }
  ]);

  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: '您好！我是您的个性化学习助教。我会根据我们的对话动态构建您的学习画像，并定制专属的学习路径。你可以告诉我你的编程水平，或者发送“我想学机器学习”来调整内容。' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [tutorStatus, setTutorStatus] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Refs for GSAP scoping & animation
  const mainContentRef = useRef(null);
  const chatEndRef = useRef(null);

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
    fetch('http://127.0.0.1:8000/api/profile')
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.warn("Backend not running yet, using local mock state.", err));

    fetch('http://127.0.0.1:8000/api/path')
      .then(res => res.json())
      .then(data => setPathNodes(data.nodes))
      .catch(err => console.warn("Backend not running yet, using local mock state.", err));
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isStreaming) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput('');
    setIsStreaming(true);
    setTutorStatus('🧠 [主管智能体] 正在唤醒协同网络...');

    let assistantMessageText = '';
    setChatHistory(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
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
  if (!isLoggedIn) {
    return (
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
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'monospace', lineHeight: '1.7', background: 'rgba(255,255,255,0.5)', padding: '14px 20px', borderRadius: '12px', border: '1px solid var(--border-neon)' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <a onClick={() => setCurrentView('landing')} className="landing-nav-link">门户首页</a>
            <a href="#features" className="landing-nav-link">系统特色</a>
            <a href="#architecture" className="landing-nav-link">智能体架构</a>
          </nav>

          <div>
            <button 
              onClick={() => {
                setAuthMode('login');
                setCurrentView('auth');
              }}
              className="cyber-btn"
              style={{ padding: '10px 20px', fontSize: '12px' }}
            >
              登录系统
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
                      setAuthMode('signup');
                      setCurrentView('auth');
                    }}
                    className="cyber-btn"
                    style={{ padding: '14px 28px', fontSize: '14px' }}
                  >
                    创建您的学术账户 <ArrowRight size={16} />
                  </button>
                  <a 
                    href="#sandbox" 
                    className="cyber-btn"
                    style={{ 
                      padding: '14px 28px', 
                      fontSize: '14px', 
                      background: 'rgba(255,255,255,0.7)', 
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
                {/* Visual Connector Lines */}
                <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
                  <line x1="50%" y1="20%" x2="20%" y2="70%" stroke="var(--border-neon-hover)" strokeWidth="1.5" strokeDasharray="4 4" />
                  <line x1="50%" y1="20%" x2="80%" y2="70%" stroke="var(--border-neon-hover)" strokeWidth="1.5" strokeDasharray="4 4" />
                  <line x1="20%" y1="70%" x2="80%" y2="70%" stroke="var(--border-neon-hover)" strokeWidth="1.5" strokeDasharray="4 4" />
                </svg>

                {/* 1. Executive Agent Card */}
                <div className="cyber-card float-item" style={{ position: 'absolute', top: '10px', width: '180px', padding: '16px', background: 'var(--bg-card)', borderTop: '3px solid var(--secondary)', boxShadow: '0 10px 25px rgba(29, 78, 216, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Cpu size={16} style={{ color: 'var(--secondary)' }} />
                    <h4 style={{ fontSize: '13px', fontWeight: '800' }}>主管智能体</h4>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>负责统筹指令流转，调度底层算力与子智能体 network 协同。</p>
                  <span className="neon-badge neon-badge-primary" style={{ padding: '1px 5px', fontSize: '8px', marginTop: '8px', display: 'inline-block' }}>主控核心</span>
                </div>

                {/* 2. Profile Agent Card */}
                <div className="cyber-card float-item-delayed" style={{ position: 'absolute', bottom: '20px', left: '10px', width: '170px', padding: '16px', background: 'var(--bg-card)', borderTop: '3px solid var(--primary-neon)', boxShadow: '0 10px 25px rgba(15, 118, 110, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Sparkles size={16} style={{ color: 'var(--primary-neon)' }} />
                    <h4 style={{ fontSize: '13px', fontWeight: '800' }}>画像智能体</h4>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>提取对话特征，动态维护更新包含知识/节奏的6维雷达画像。</p>
                  <span className="neon-badge neon-badge-success" style={{ padding: '1px 5px', fontSize: '8px', marginTop: '8px', display: 'inline-block' }}>画像演进</span>
                </div>

                {/* 3. Path Planner Agent Card */}
                <div className="cyber-card float-item" style={{ position: 'absolute', bottom: '20px', right: '10px', width: '170px', padding: '16px', background: 'var(--bg-card)', borderTop: '3px solid var(--accent)', boxShadow: '0 10px 25px rgba(180, 83, 9, 0.08)' }}>
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

                    <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255,255,255,0.6)', border: '1px dashed var(--border-neon)', borderRadius: '12px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <Info size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span>沙盒数据正在使用 GSAP 弹性缓动曲线进行流畅的 SVG 矢量变形渲染。</span>
                    </div>
                  </div>

                  {/* Right Output Panels */}
                  <div className="cyber-card" style={{ padding: '24px', background: '#ffffff', border: '1px solid var(--border-neon-hover)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    
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

            {/* Core Features Grid */}
            <section id="features" style={{ padding: '80px 40px', background: 'rgba(245, 243, 237, 0.4)', borderBottom: '1px solid rgba(15, 118, 110, 0.05)', zIndex: 1 }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                  <span className="neon-badge neon-badge-primary" style={{ marginBottom: '10px', display: 'inline-block' }}>系统核心能力</span>
                  <h2 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.02em' }} className="neon-text-gradient">
                    突破传统的智能自适应设计
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>我们专注于通过自研智能体提升学术和工程的交付质量</p>
                </div>
                
                <div className="grid-cols-3">
                  <div className="cyber-card" style={{ padding: '28px', background: '#ffffff' }}>
                    <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(15, 118, 110, 0.05)', borderRadius: '14px', marginBottom: '20px', border: '1px solid rgba(15, 118, 110, 0.1)' }}>
                      <MessageSquare size={22} style={{ color: 'var(--primary)' }} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>自然语言无感画像</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.7' }}>
                      无需通过海量题库进行枯燥的前测。只需在日常学习对话中与 AI 助教聊天，画像智能体即可无感推演出 6 维认知画像，并实时调整参数。
                    </p>
                  </div>
                  <div className="cyber-card" style={{ padding: '28px', background: '#ffffff' }}>
                    <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(29, 78, 216, 0.05)', borderRadius: '14px', marginBottom: '20px', border: '1px solid rgba(29, 78, 216, 0.1)' }}>
                      <TrendingUp size={22} style={{ color: 'var(--secondary)' }} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>实时路径重编排</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.7' }}>
                      当您回答完测验或者反馈某段代码看不懂时，路径规划智能体会瞬间触发局部重排，自动解锁分支辅助卡片或插入专项过渡关卡，保证因材施教。
                    </p>
                  </div>
                  <div className="cyber-card" style={{ padding: '28px', background: '#ffffff' }}>
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

              <div className="cyber-card" style={{ padding: '40px', background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, var(--bg-card-active) 100%)', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '40px', alignItems: 'center' }}>
                
                {/* Left Interactive SVG Topology Map */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    点击节点模拟数据流向 (Data-flow Topology)
                  </span>

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
                    <line x1="170" y1="50" x2="70" y2="150" stroke={activeDemoAgent === 'profile' ? 'var(--primary-neon)' : 'rgba(0,0,0,0.1)'} strokeWidth={activeDemoAgent === 'profile' ? '2.5' : '1.5'} strokeDasharray={activeDemoAgent === 'profile' ? 'none' : '4 4'} markerEnd={activeDemoAgent === 'profile' ? 'url(#arrow-active)' : 'url(#arrow)'} />
                    <line x1="70" y1="150" x2="270" y2="150" stroke={activeDemoAgent === 'path' ? 'var(--primary-neon)' : 'rgba(0,0,0,0.1)'} strokeWidth={activeDemoAgent === 'path' ? '2.5' : '1.5'} strokeDasharray={activeDemoAgent === 'path' ? 'none' : '4 4'} markerEnd={activeDemoAgent === 'path' ? 'url(#arrow-active)' : 'url(#arrow)'} />
                    <line x1="270" y1="150" x2="170" y2="50" stroke={activeDemoAgent === 'executive' ? 'var(--primary-neon)' : 'rgba(0,0,0,0.1)'} strokeWidth={activeDemoAgent === 'executive' ? '2.5' : '1.5'} strokeDasharray={activeDemoAgent === 'executive' ? 'none' : '4 4'} markerEnd={activeDemoAgent === 'executive' ? 'url(#arrow-active)' : 'url(#arrow)'} />

                    {/* 1. Executive Agent Node */}
                    <g className={`agent-node ${activeDemoAgent === 'executive' ? 'agent-node-active' : ''}`} onClick={() => setActiveDemoAgent('executive')}>
                      <circle cx="170" cy="50" r="28" fill="var(--bg-space)" stroke={activeDemoAgent === 'executive' ? 'var(--secondary)' : 'var(--border-neon)'} strokeWidth="3" />
                      <Cpu x="159" y="39" size={22} style={{ color: activeDemoAgent === 'executive' ? 'var(--secondary)' : 'var(--text-dim)' }} />
                      <text x="170" y="94" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--text-main)">主管智能体</text>
                    </g>

                    {/* 2. Profile Agent Node */}
                    <g className={`agent-node ${activeDemoAgent === 'profile' ? 'agent-node-active' : ''}`} onClick={() => setActiveDemoAgent('profile')}>
                      <circle cx="70" cy="150" r="28" fill="var(--bg-space)" stroke={activeDemoAgent === 'profile' ? 'var(--primary-neon)' : 'var(--border-neon)'} strokeWidth="3" />
                      <Sparkles x="59" y="139" size={22} style={{ color: activeDemoAgent === 'profile' ? 'var(--primary-neon)' : 'var(--text-dim)' }} />
                      <text x="70" y="194" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--text-main)">画像智能体</text>
                    </g>

                    {/* 3. Path Agent Node */}
                    <g className={`agent-node ${activeDemoAgent === 'path' ? 'agent-node-active' : ''}`} onClick={() => setActiveDemoAgent('path')}>
                      <circle cx="270" cy="150" r="28" fill="var(--bg-space)" stroke={activeDemoAgent === 'path' ? 'var(--accent)' : 'var(--border-neon)'} strokeWidth="3" />
                      <TrendingUp x="259" y="139" size={22} style={{ color: activeDemoAgent === 'path' ? 'var(--accent)' : 'var(--text-dim)' }} />
                      <text x="270" y="194" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--text-main)">路径智能体</text>
                    </g>
                  </svg>

                  {/* Terminal Log Console */}
                  <div style={{ width: '100%', marginTop: '16px', background: '#1e293b', borderRadius: '12px', padding: '12px 18px', fontFamily: 'monospace', color: '#38bdf8', fontSize: '11px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span>
                      <span style={{ width: '8px', height: '8px', background: '#eab308', borderRadius: '50%' }}></span>
                      <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></span>
                    </div>
                    {activeDemoAgent === 'executive' && (
                      <div>
                        <span style={{ color: '#a7f3d0' }}>[Orchestrator Logs]:</span>
                        <p style={{ color: '#e2e8f0', marginTop: '4px' }}>&gt; 拦截到用户输入 "梯度下降怎么算..."</p>
                        <p style={{ color: '#94a3b8' }}>&gt; 启动路由策略。将自然语言特征提取工作分配至画像 Agent...</p>
                      </div>
                    )}
                    {activeDemoAgent === 'profile' && (
                      <div>
                        <span style={{ color: '#a7f3d0' }}>[Profile Analyst Logs]:</span>
                        <p style={{ color: '#e2e8f0', marginTop: '4px' }}>&gt; 提取关键词 "梯度下降", "链式偏导", "证明"</p>
                        <p style={{ color: '#94a3b8' }}>&gt; 修正认知模型。将 [逻辑推理] 由 70 调整为 88，判定为硬核理论风格。</p>
                      </div>
                    )}
                    {activeDemoAgent === 'path' && (
                      <div>
                        <span style={{ color: '#a7f3d0' }}>[Curriculum Planner Logs]:</span>
                        <p style={{ color: '#e2e8f0', marginTop: '4px' }}>&gt; 接收到画像微调指令。重算知识图网络...</p>
                        <p style={{ color: '#94a3b8' }}>&gt; 重排课程节点：Stage 2 变变更为 "反向传播偏导推演"，推送 PDF 与导图资源。</p>
                      </div>
                    )}
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
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(245, 243, 237, 0.9)', padding: '4px', borderRadius: '10px', marginBottom: '28px' }}>
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
                    background: authMode === 'login' ? '#ffffff' : 'transparent',
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
                    background: authMode === 'signup' ? '#ffffff' : 'transparent',
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
                          background: regLearningGoal === 'Python Basics' ? 'rgba(15, 118, 110, 0.05)' : '#ffffff',
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
                          background: regLearningGoal === 'Machine Learning' ? 'rgba(15, 118, 110, 0.05)' : '#ffffff',
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
    );
  }

  return (
    <div className="app-container">
      {/* Background Decorative Ambient Orbs */}
      <div className="glow-orb-1" style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(15, 118, 110, 0.06) 0%, transparent 70%)', top: '10%', right: '15%', pointerEvents: 'none', zIndex: 0 }}></div>
      <div className="glow-orb-2" style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(29, 78, 216, 0.04) 0%, transparent 70%)', bottom: '15%', left: '40%', pointerEvents: 'none', zIndex: 0 }}></div>

      {/* 🚀 LEFT SIDEBAR */}
      <aside className="sidebar">
        {/* Logo Section */}
        <div className="sidebar-anim-item" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px', flexShrink: 0 }}>
          <div style={{ padding: '10px', background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.15) 0%, rgba(29, 78, 216, 0.1) 100%)', borderRadius: '14px', border: '1px solid rgba(15, 118, 110, 0.25)', display: 'flex' }}>
            <GraduationCap size={24} style={{ color: 'var(--primary-neon)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.04em' }}>
              Edu<span style={{ color: 'var(--secondary)' }}>Genesis</span>
            </h1>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: '700' }}>多智能体协同系统</span>
          </div>
        </div>

        {/* Dynamic Profile Panel */}
        <div className="cyber-card sidebar-anim-item" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255, 255, 255, 0.65)', borderColor: 'rgba(15, 118, 110, 0.12)', flexShrink: 0 }}>
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
                  <h4 style={{ fontWeight: '700', marginBottom: '6px', fontSize: '15px' }} className="cyan-gradient">Vibe Coding 快速调试指南</h4>
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
          <section className="cyber-card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', border: '1px solid var(--border-neon)' }}>
            {/* Header */}
            <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                  <MessageSquare size={18} style={{ color: 'var(--primary-neon)' }} /> 智能画像导师
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
                      maxWidth: '70%', 
                      borderRadius: msg.role === 'user' ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
                      background: msg.role === 'user' ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'var(--bg-card)',
                      borderColor: msg.role === 'user' ? 'var(--primary-neon)' : 'var(--border-neon)',
                      color: msg.role === 'user' ? '#ffffff' : 'var(--text-main)',
                      fontSize: '14px',
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.6'
                    }}
                  >
                    {msg.content}
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

            {/* Input form */}
            <form onSubmit={handleSendMessage} style={{ padding: '20px 28px', borderTop: '1px solid rgba(0, 0, 0, 0.06)', background: 'rgba(245, 243, 237, 0.7)' }}>
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
        )}

        {/* 🗺️ PATH PLANNER TAB */}
        {activeTab === 'path' && (
          <>
            <header>
              <h2 style={{ fontSize: '24px', marginBottom: '4px', fontWeight: '800' }}>定制路径规划与推送系统</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                多智能体协同路径算法为您生成的专业轨迹。点击右侧的卡片查看智能体为您生成的多模态资源包。
              </p>
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
                  <div 
                    key={node.id} 
                    style={{ display: 'flex', gap: '28px', zIndex: 1, cursor: 'pointer' }}
                    onClick={() => setSelectedNode(node)}
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
                        <ChevronRight size={16} style={{ color: 'var(--text-muted)', marginLeft: '12px' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Node Panel */}
            {selectedNode && (
              <div 
                className="cyber-card" 
                style={{ 
                  padding: '24px 32px', 
                  borderTop: '4px solid var(--secondary)', 
                  marginTop: '12px',
                  background: 'linear-gradient(135deg, var(--bg-card-active) 0%, rgba(255,255,255,0.95) 100%)'
                }}
              >
                <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--secondary)', fontWeight: '700', letterSpacing: '0.08em' }}>RESOURCE PACKAGE</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', marginTop: '4px' }}>{selectedNode.title} 核心资源包</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{selectedNode.description}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedNode(null)}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}
                  >
                    关闭面板
                  </button>
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
                        background: 'rgba(255, 255, 255, 0.65)',
                        cursor: 'pointer'
                      }}
                      onClick={() => setActiveTab('resources')}
                    >
                      <div style={{ padding: '8px', background: 'rgba(0, 0, 0, 0.02)', borderRadius: '10px', display: 'flex' }}>
                        {getResourceIcon(res)}
                      </div>
                      <div>
                        <h5 style={{ fontSize: '13px', fontWeight: '700' }}>
                          {res === 'slide' ? '音画幻灯片' : res === 'quiz' ? '测验题库' : res === 'code' ? '实操源码' : res === 'pdf' ? '讲解课本' : '思维脑图'}
                        </h5>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>点击前往资源生成库</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* 📂 RESOURCE GENERATOR TAB */}
        {activeTab === 'resources' && (
          <>
            <header>
              <h2 style={{ fontSize: '24px', marginBottom: '4px', fontWeight: '800' }}>多智能体资源生成库</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                由不同角色智能体根据您左侧画像生成的五类多模态教学资源包。
              </p>
            </header>

            {/* Cyber resource grid layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '24px' }}>
              
              {/* Card 1: PDF */}
              <article className="cyber-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
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
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>阅读全文 <ArrowRight size={14} /></span>
                </div>
              </article>

              {/* Card 2: Sound slide (T2V simulation) */}
              <article className="cyber-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
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
                  <span style={{ color: 'var(--secondary)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>开启播放 <ArrowRight size={14} /></span>
                </div>
              </article>

              {/* Card 3: Mindmap */}
              <article className="cyber-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
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
                  <span style={{ color: 'var(--warning)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>查看思维树 <ArrowRight size={14} /></span>
                </div>
              </article>

              {/* Card 4: Quiz */}
              <article className="cyber-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
                  <div style={{ padding: '10px', background: 'rgba(21, 128, 61, 0.06)', borderRadius: '12px', border: '1px solid rgba(21, 128, 61, 0.15)', display: 'flex' }}>
                    <HelpCircle className="text-green-400" size={24} style={{ color: 'var(--success)' }} />
                  </div>
                  <span className="neon-badge neon-badge-success">测试生成就绪</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>《自适应画像评估测验》</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                    针对您的易错范畴<b>“{profile.error_patterns.join('/')}”</b>出具 of 10 道单选题。答题结果会回传用以微调画像指标。
                  </p>
                </div>
                <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>题量: 10 道诊断题</span>
                  <span style={{ color: 'var(--success)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>开始测评 <ArrowRight size={14} /></span>
                </div>
              </article>

              {/* Card 5: Code Case */}
              <article className="cyber-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
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
                <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '16px', display: 'flex', justifycontent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>案例数: 3 个实操项目</span>
                  <span style={{ color: 'var(--accent)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>复制代码 <ArrowRight size={14} /></span>
                </div>
              </article>

            </div>
          </>
        )}

      </main>
    </div>
  );
}
