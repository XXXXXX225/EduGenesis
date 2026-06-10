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
  Terminal,
  Settings
} from 'lucide-react';
import InteractiveChatBubble from './components/shared/InteractiveChatBubble';
import { apiGet, apiPost, apiSSEStream, API_BASE } from './utils/api';
import { clearSession, getStoredUsername, isAuthenticated, saveSession } from './utils/session';
import { useRouteSync } from './utils/routing';
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

// MiniSandboxPlayground and RadarCustomizer have been moved to components/landing/

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated());
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'auth' | 'dashboard'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

  // Registration inputs (shared with cockpit and loading overlay)
  const [regUsername, setRegUsername] = useState(() => getStoredUsername());
  const [regPassword, setRegPassword] = useState('');
  const [regCognitiveStyle, setRegCognitiveStyle] = useState('Practical Coding');
  const [regLearningGoal, setRegLearningGoal] = useState('Python Basics');

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

  useRouteSync({
    currentView,
    authMode,
    activeTab,
    isLoggedIn,
    setCurrentView,
    setAuthMode,
    setActiveTab,
    setIsLoggedIn,
  });

  // Auth and landing functions have been moved to components/landing/ and components/auth/

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

  const loadDashboardState = async () => {
    const [profileData, pathData] = await Promise.all([
      apiGet('/profile'),
      apiGet('/path'),
    ]);

    setProfile(profileData);
    setPathNodes(pathData.nodes);

    const activeNode = pathData.nodes.find((node) => node.status === 'active') || pathData.nodes[0];
    if (activeNode) {
      setSelectedNode(activeNode);
      await fetchNodeResources(activeNode.id);
    }
  };


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
    if (!isLoggedIn) return;
    loadDashboardState().catch(err => console.warn("Backend not running yet, using local mock state.", err));
  }, [isLoggedIn]);

  const fetchNodeResources = async (nodeId) => {
    // Show spinner if we fetch again
    setSelectedNodeResources(null);
    try {
      const data = await apiGet('/resources', { node_id: nodeId });
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
      const data = await apiGet('/sandbox/challenge', nodeId ? { node_id: nodeId } : {});
      setSandboxChallenge(data);
      setSandboxCode(data.initial_code);
    } catch (err) {
      console.warn("Failed to fetch sandbox challenge:", err);
    }
  };

  const fetchErrors = async () => {
    try {
      const data = await apiGet('/errors');
      setErrorQuestions(data);
    } catch (err) {
      console.warn("Failed to fetch error notebook questions:", err);
    }
  };

  const fetchConsoleLogs = async () => {
    try {
      const data = await apiGet('/console/logs');
      setAgentLogs(data);
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
      const result = await apiPost('/errors/diagnose', { error_id: eq.id });
      setSelectedErrorExp({
        ...eq,
        ai_explanation: result.explanation
      });
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
      const quizData = await apiPost('/errors/generate-remedy', { error_id: eq.id });
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
      await apiSSEStream('/chat', {
        messages: [...chatHistory, userMessage],
        current_profile: profile
      }, (data) => {
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
      });
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
      const data = await apiPost('/path/regenerate');
      setPathNodes(data.nodes);

      setDiagnosticLogs(prev => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          log: "路径智能体已重新编排并下发您的定制学习节点。"
        }
      ]);
      setProfileAlert("学习路径重构成功！");
      setTimeout(() => setProfileAlert(''), 3000);
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
    const audioUrl = `${API_BASE}/tts?text=${encodeURIComponent(text)}`;
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
      const newData = await apiPost('/profile', updatedProfile);
      setProfile(newData);

      if (passed && selectedNode) {
        const pathData = await apiPost('/path/complete-node', {
          node_id: selectedNode.id
        });
        setPathNodes(pathData.nodes);

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

          {currentView === 'landing' ? (
            <LandingView
              isLoggedIn={isLoggedIn}
              setCurrentView={setCurrentView}
              setAuthMode={setAuthMode}
              theme={theme}
              setTheme={setTheme}
              regCognitiveStyle={regCognitiveStyle}
              setRegCognitiveStyle={setRegCognitiveStyle}
            />
          ) : (
            <AuthView
              setCurrentView={setCurrentView}
              authMode={authMode}
              setAuthMode={setAuthMode}
              regUsername={regUsername}
              setRegUsername={setRegUsername}
              regPassword={regPassword}
              setRegPassword={setRegPassword}
              regCognitiveStyle={regCognitiveStyle}
              setRegCognitiveStyle={setRegCognitiveStyle}
              regLearningGoal={regLearningGoal}
              setRegLearningGoal={setRegLearningGoal}
              setIsLoggedIn={setIsLoggedIn}
              setIsLoadingOrchestration={setIsLoadingOrchestration}
              setOrchestrationStep={setOrchestrationStep}
              loadDashboardState={loadDashboardState}
              setActiveTab={setActiveTab}
            />
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
            <div
              className={`cyber-nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} />
              <span>多模型服务配置</span>
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
                clearSession();
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
            <HomeView
              profile={profile}
              pathNodes={pathNodes}
              setSelectedNode={setSelectedNode}
              setActiveTab={setActiveTab}
              fetchNodeResources={fetchNodeResources}
            />
          )}

          {/* 💬 CHAT TAB */}
          {activeTab === 'chat' && (
            <ChatView
              profile={profile}
              profileAlert={profileAlert}
              goDashboardHome={goDashboardHome}
              chatHistory={chatHistory}
              handleSlideSpeech={handleSlideSpeech}
              stopSlideSpeech={stopSlideSpeech}
              tutorStatus={tutorStatus}
              chatEndRef={chatEndRef}
              isStreaming={isStreaming}
              submitChatMessage={submitChatMessage}
              handleSendMessage={handleSendMessage}
              chatInput={chatInput}
              setChatInput={setChatInput}
              diagnosticLogs={diagnosticLogs}
            />
          )}

          {/* 🗺️ PATH PLANNER TAB */}
          {activeTab === 'path' && (
            <PathView
              pathNodes={pathNodes}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              goDashboardHome={goDashboardHome}
              handleRegeneratePath={handleRegeneratePath}
              isRegeneratingPath={isRegeneratingPath}
              fetchNodeResources={fetchNodeResources}
              setActiveTab={setActiveTab}
            />
          )}

          {/* 📂 RESOURCE GENERATOR TAB */}
          {activeTab === 'resources' && (
            <ResourcesView
              profile={profile}
              selectedNodeResources={selectedNodeResources}
              setActiveModal={setActiveModal}
              setCurrentSlideIdx={setCurrentSlideIdx}
              setIsPlayingSlide={setIsPlayingSlide}
              setQuizStep={setQuizStep}
              goDashboardHome={goDashboardHome}
            />
          )}

          {/* 💻 AI PROGRAMMING SANDBOX TAB */}
          {activeTab === 'sandbox' && (
            <SandboxView
              sandboxChallenge={sandboxChallenge}
              sandboxAIAdvice={sandboxAIAdvice}
              setSandboxAIAdvice={setSandboxAIAdvice}
              sandboxCode={sandboxCode}
              setSandboxCode={setSandboxCode}
              isSandboxRunning={isSandboxRunning}
              setIsSandboxRunning={setIsSandboxRunning}
              sandboxTerminal={sandboxTerminal}
              setSandboxTerminal={setSandboxTerminal}
              setProfile={setProfile}
              goDashboardHome={goDashboardHome}
            />
          )}

          {/* 📔 SMART ERROR NOTEBOOK TAB */}
          {activeTab === 'errors' && (
            <ErrorsView
              errorQuestions={errorQuestions}
              handleDiagnoseError={handleDiagnoseError}
              handleRemedyPractice={handleRemedyPractice}
              selectedErrorExp={selectedErrorExp}
              setSelectedErrorExp={setSelectedErrorExp}
              goDashboardHome={goDashboardHome}
            />
          )}

          {/* 🤖 MULTI-AGENT COMMAND CONSOLE TAB */}
          {activeTab === 'agent-console' && (
            <ConsoleView
              activeConsoleAgent={activeConsoleAgent}
              setActiveConsoleAgent={setActiveConsoleAgent}
              agentLogs={agentLogs}
              goDashboardHome={goDashboardHome}
            />
          )}

          {/* 🏆 ACADEMIC ACHIEVEMENTS TAB */}
          {activeTab === 'achievements' && (
            <AchievementsView
              profile={profile}
              setProfileAlert={setProfileAlert}
              goDashboardHome={goDashboardHome}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

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
        onCompleteQuiz={handleCompleteQuiz}
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
    </>
  );
}
