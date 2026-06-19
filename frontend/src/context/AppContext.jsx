import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { apiGet, apiPost, apiDelete, apiPut } from '../utils/api';
import { clearSession, getStoredUsername, isAuthenticated } from '../utils/session';
import { useRouteSync } from '../utils/routing';
import { useChat } from '../hooks/useChat';
import { useSpeech } from '../hooks/useSpeech';
import { useQuiz } from '../hooks/useQuiz';
import { useSandbox } from '../hooks/useSandbox';

const AppContext = createContext();

export function AppProvider({ children }) {
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

  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('isLeftSidebarOpen');
    return saved !== 'false'; // default true
  });
  const [tutorPersonality, setTutorPersonality] = useState(() => {
    return localStorage.getItem('tutorPersonality') || 'academic';
  });

  const [customDialog, setCustomDialog] = useState(null);

  const showCustomAlert = (message, title = '提示') => {
    return new Promise((resolve) => {
      setCustomDialog({
        type: 'alert',
        title,
        message,
        resolve
      });
    });
  };

  const showCustomConfirm = (message, title = '确认') => {
    return new Promise((resolve) => {
      setCustomDialog({
        type: 'confirm',
        title,
        message,
        resolve
      });
    });
  };

  const showCustomPrompt = (message, defaultValue = '', title = '输入') => {
    return new Promise((resolve) => {
      setCustomDialog({
        type: 'prompt',
        title,
        message,
        defaultValue,
        resolve
      });
    });
  };

  useEffect(() => {
    localStorage.setItem('isLeftSidebarOpen', isLeftSidebarOpen);
  }, [isLeftSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('tutorPersonality', tutorPersonality);
  }, [tutorPersonality]);

  const [currentView, setCurrentView] = useState(() => {
    const loggedIn = isAuthenticated();
    const pathname = window.location.pathname;
    if (pathname === '/signup' || pathname === '/login') return 'auth';
    if (pathname === '/' || !loggedIn) return 'landing';
    return 'dashboard';
  });
  const [authMode, setAuthMode] = useState(() => {
    return window.location.pathname === '/signup' ? 'signup' : 'login';
  });

  // Registration inputs (shared with cockpit and loading overlay)
  const [regUsername, setRegUsername] = useState(() => getStoredUsername());
  const [regPassword, setRegPassword] = useState('');
  const [regCognitiveStyle, setRegCognitiveStyle] = useState('Practical Coding');
  const [regLearningGoal, setRegLearningGoal] = useState('Python Basics');

  // Loading orchestration states
  const [isLoadingOrchestration, setIsLoadingOrchestration] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [orchestrationStep, setOrchestrationStep] = useState(0);

  const [activeTab, setActiveTab] = useState(() => {
    const pathname = window.location.pathname;
    if (pathname === '/chat') return 'chat';
    if (pathname === '/path') return 'path';
    if (pathname === '/resources') return 'resources';
    if (pathname === '/sandbox') return 'sandbox';
    if (pathname === '/errors') return 'errors';
    if (pathname === '/console') return 'agent-console';
    if (pathname === '/achievements') return 'achievements';
    if (pathname === '/settings') return 'settings';
    return 'home';
  });
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

  // State to hold animated numerical profile values (for smooth SVG morphing)
  const [displayProfile, setDisplayProfile] = useState({ ...profile });
  const profileAnimRef = useRef({
    knowledge_base: 40,
    learning_pace: 50,
    engagement: 80
  });

  const [pathNodes, setPathNodes] = useState([
    { id: "node1", title: "Python 环境部署", status: "completed", description: "安装 Python 与 VS Code 软件配置", resources: ["pdf", "mindmap", "code"] },
    { id: "node2", title: "变量与基础数据类型", status: "active", description: "探索整型、浮点型、字符串及变量绑定", resources: ["slide", "pdf", "mindmap", "quiz"] },
    { id: "node3", title: "控制流与条件判断", status: "locked", description: "If 条件分支、逻辑运算与流程控制", resources: ["slide", "mindmap", "quiz", "code"] },
    { id: "node4", title: "循环结构与迭代", status: "locked", description: "While 与 For 循环及 Break/Continue 控制", resources: ["slide", "mindmap", "quiz"] },
    { id: "node5", title: "数据结构进阶", status: "locked", description: "列表、元组、字典与集合的增删改查", resources: ["slide", "pdf", "mindmap", "quiz", "code"] },
    { id: "node6", title: "函数与模块化编程", status: "locked", description: "定义可重用函数、形参实参与作用域", resources: ["slide", "pdf", "mindmap", "code"] },
    { id: "node7", title: "异常处理与文件操作", status: "locked", description: "Try-Except 错误捕获与本地文本文件读写", resources: ["mindmap", "code", "quiz"] },
    { id: "node8", title: "综合项目：自适应计算器", status: "locked", description: "结合函数与异常处理实现计算器实践", resources: ["mindmap", "code", "quiz"] }
  ]);

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
  const [slideTypingText, setSlideTypingText] = useState('');
  const [copyCodeText, setCopyCodeText] = useState('复制源码');

  // Integrated hooks for modularized state and handlers
  const chatHook = useChat({
    profile,
    setProfile,
    setProfileAlert,
    setPathNodes,
    setDiagnosticLogs,
    currentSessionId,
    tutorPersonality,
    chatSessions,
    setChatSessions
  });
  const speechHook = useSpeech();
  const quizHook = useQuiz({
    profile,
    setProfile,
    selectedNode,
    setSelectedNode,
    setPathNodes,
    setProfileAlert,
    setDiagnosticLogs
  });
  const sandboxHook = useSandbox({
    setProfile,
    setPathNodes,
    setSelectedNode,
    setProfileAlert,
    setDiagnosticLogs
  });

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
  const [activeConsoleAgent, setActiveConsoleAgent] = useState('executive');

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
      await fetchNodeResources(activeNode.id, activeNode);
    }
  };

  const loadChatSessions = async () => {
    try {
      const data = await apiGet('/chat/sessions');
      setChatSessions(data);
      if (data.length > 0 && !currentSessionId) {
        const latestSessionId = data[0].session_id;
        setCurrentSessionId(latestSessionId);
        await loadSessionMessages(latestSessionId);
      } else if (data.length === 0) {
        await startNewChat();
      }
    } catch (err) {
      console.warn("Failed to load chat sessions from server:", err);
    }
  };

  const loadSessionMessages = async (sessionId) => {
    try {
      const data = await apiGet(`/chat/sessions/${sessionId}/messages`);
      if (data.length > 0) {
        chatHook.setChatHistory(data.map(m => ({
          role: m.role,
          content: m.content
        })));
      } else {
        chatHook.setChatHistory([
          { role: 'assistant', content: '您好！我是您的个性化学习助教。我会根据我们的对话动态构建您的学习画像，并定制专属的学习路径。你可以告诉我你的编程水平，或者发送“我想学机器学习”来调整内容。' }
        ]);
      }
    } catch (err) {
      console.warn(`Failed to fetch messages for session ${sessionId}:`, err);
    }
  };

  const startNewChat = async () => {
    const newSessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    try {
      const newSess = await apiPost('/chat/sessions', {
        session_id: newSessionId,
        title: '新对话'
      });
      setChatSessions(prev => [newSess, ...prev]);
      setCurrentSessionId(newSessionId);
      chatHook.setChatHistory([
        { role: 'assistant', content: '您好！我是您的个性化学习助教。我会根据我们的对话动态构建您的学习画像，并定制专属的学习路径。你可以告诉我你的编程水平，或者发送“我想学机器学习”来调整内容。' }
      ]);
    } catch (err) {
      console.error("Failed to create new session:", err);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await apiDelete(`/chat/sessions/${sessionId}`);
      const updated = chatSessions.filter(s => s.session_id !== sessionId);
      setChatSessions(updated);

      if (currentSessionId === sessionId) {
        if (updated.length > 0) {
          const nextSess = updated[0].session_id;
          setCurrentSessionId(nextSess);
          loadSessionMessages(nextSess);
        } else {
          await startNewChat();
        }
      }
    } catch (err) {
      console.error(`Failed to delete session ${sessionId}:`, err);
    }
  };

  const renameSession = async (sessionId, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      await apiPut(`/chat/sessions/${sessionId}`, { title: newTitle });
      setChatSessions(prev => prev.map(s => {
        if (s.session_id === sessionId) {
          return { ...s, title: newTitle };
        }
        return s;
      }));
    } catch (err) {
      console.error(`Failed to rename session ${sessionId}:`, err);
    }
  };

  const clearAllSessions = async () => {
    try {
      await apiDelete('/chat/sessions');
      setChatSessions([]);
      setCurrentSessionId(null);
      startNewChat();
    } catch (err) {
      console.error("Failed to clear sessions:", err);
    }
  };

  // Load dashboard data on mount when already authenticated (page refresh)
  useEffect(() => {
    if (isLoggedIn) {
      setIsLoadingDashboard(true);
      Promise.all([
        loadDashboardState(),
        loadChatSessions()
      ]).finally(() => setIsLoadingDashboard(false));
    }
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

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
  };

  const fetchNodeResources = async (nodeId, nodeObj = null) => {
    setSelectedNodeResources(null);
    const targetNode = nodeObj || selectedNode;
    try {
      const data = await apiGet('/resources', { node_id: nodeId });
      if (Object.keys(data).length === 0) {
        setSelectedNodeResources({
          pdf: `# ${targetNode?.title || "自适应课本"}讲解\n\n本章节知识点由自适应多智能体网络根据您的画像诊断定制编排。\n\n## 1. 核心定义与概念\n在自适应学习中，理解底层机制是掌握本章节的关键。建议通过旁边的“知识脑图”直观理清概念拓扑关系。\n\n## 2. 防御性安全编码规约\n请注意，在设计复杂的网络架构或算法单元时，务必保障类型一致性，防范空指针或解构异常。`,
          slide: [
            { title: `第1页: 欢迎学习 ${targetNode?.title || "自适应模块"}`, content: "我们将通过结合多模态语音播放与动画特效，带您深入浅出地掌握本章核心逻辑。" },
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
          ],
          video: [
            {
              bvid: "BV1rpWjevEip",
              title: `B站最火的 Python 零基础精讲课程: ${targetNode?.title || "自适应模块"}`,
              pic: "https://i2.hdslb.com/bfs/archive/a979056b1a32012cdd00d48fbc3732d253e30620.jpg",
              author: "Python官方课程",
              play: "1671.8万",
              duration: "39:58:14",
              recommend_reason: `该视频是 B站 播放量最高的经典教程。结合您的【${profile.cognitive_style}】风格，视频大纲清晰，可以作为本章《${targetNode?.title || "自适应模块"}》的全面配套参考视频。`
            },
            {
              bvid: "BV14HEE61EVP",
              title: `Python 从入门到精通项目实战精讲: ${targetNode?.title || "自适应模块"}`,
              pic: "https://i1.hdslb.com/bfs/archive/3b7c7906b6316dd7652599f27db999a6b0570492.jpg",
              author: "Python学习中心",
              play: "85.2万",
              duration: "12:30:15",
              recommend_reason: `该教程以项目驱动方式讲解，非常契合您的实操偏好。您可以通过动手编写其中的代码段来巩固所学概念。`
            }
          ]
        });
      } else {
        setSelectedNodeResources(data);
      }
    } catch (err) {
      console.error("Error fetching resources:", err);
      setSelectedNodeResources({
        pdf: `# ${targetNode?.title || "自适应课本"}讲解\n\n本章节知识点由自适应多智能体网络根据您的画像诊断定制编排。\n\n## 1. 核心定义与概念\n在自适应学习中，理解底层机制是掌握本章节的关键。建议通过旁边的“知识脑图”直观理清概念拓扑关系。\n\n## 2. 防御性安全编码规约\n请注意，在设计复杂的网络架构或算法单元时，务必保障类型一致性，防范空指针或解构异常。`,
        slide: [
          { title: `第1页: 欢迎学习 ${targetNode?.title || "自适应模块"}`, content: "我们将通过结合多模态语音播放与动画特效，带您深入浅出地掌握本章核心逻辑。" },
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
        ],
        video: [
          {
            bvid: "BV1rpWjevEip",
            title: `B站最火的 Python 零基础精讲课程: ${targetNode?.title || "自适应模块"}`,
            pic: "https://i2.hdslb.com/bfs/archive/a979056b1a32012cdd00d48fbc3732d253e30620.jpg",
            author: "Python官方课程",
            play: "1671.8万",
            duration: "39:58:14",
            recommend_reason: `该视频是 B站 播放量最高的经典教程。结合您的【${profile.cognitive_style}】风格，视频大纲清晰，可以作为本章《${targetNode?.title || "自适应模块"}》的全面配套参考视频。`
          },
          {
            bvid: "BV14HEE61EVP",
            title: `Python 从入门到精通项目实战精讲: ${targetNode?.title || "自适应模块"}`,
            pic: "https://i1.hdslb.com/bfs/archive/3b7c7906b6316dd7652599f27db999a6b0570492.jpg",
            author: "Python学习中心",
            play: "85.2万",
            duration: "12:30:15",
            recommend_reason: `该教程以项目驱动方式讲解，非常契合您的实操偏好。您可以通过动手编写其中的代码段来巩固所学概念。`
            }
          ]
        });
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
      sandboxHook.fetchSandboxChallenge(targetNodeId);
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
      quizHook.setQuizAnswers({});
      quizHook.setQuizSubmitted(false);
      quizHook.setQuizStep('intro');
      quizHook.setQuizQuestionIdx(0);
      quizHook.setQuizCorrectCount(0);
      quizHook.setQuizFeedback('');

      setTimeout(() => {
        setProfileAlert('');
        setActiveModal('quiz');
      }, 800);
    } catch (err) {
      setProfileAlert(`❌ 异常：${err.message}`);
      setTimeout(() => setProfileAlert(''), 2000);
    }
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

  return (
    <AppContext.Provider
      value={{
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
        setIsLoadingDashboard,
        orchestrationStep,
        setOrchestrationStep,
        activeTab,
        setActiveTab,
        profile,
        setProfile,
        displayProfile,
        setDisplayProfile,
        pathNodes,
        setPathNodes,
        selectedNode,
        setSelectedNode,
        diagnosticLogs,
        setDiagnosticLogs,
        profileAlert,
        setProfileAlert,
        isRegeneratingPath,
        setIsRegeneratingPath,
        selectedNodeResources,
        setSelectedNodeResources,
        activeModal,
        setActiveModal,
        currentSlideIdx,
        setCurrentSlideIdx,
        slideTypingText,
        setSlideTypingText,
        copyCodeText,
        setCopyCodeText,
        errorQuestions,
        setErrorQuestions,
        selectedErrorExp,
        setSelectedErrorExp,
        agentLogs,
        setAgentLogs,
        activeConsoleAgent,
        setActiveConsoleAgent,
        loadDashboardState,
        goPortalHome,
        goDashboardHome,
        fetchNodeResources,
        fetchErrors,
        fetchConsoleLogs,
        handleDiagnoseError,
        handleRemedyPractice,
        handleRegeneratePath,
        chatSessions,
        setChatSessions,
        currentSessionId,
        setCurrentSessionId,
        isLeftSidebarOpen,
        setIsLeftSidebarOpen,
        tutorPersonality,
        setTutorPersonality,
        loadChatSessions,
        loadSessionMessages,
        startNewChat,
        deleteSession,
        renameSession,
        clearAllSessions,
        customDialog,
        setCustomDialog,
        showCustomAlert,
        showCustomConfirm,
        showCustomPrompt,
        // Hooks values
        chat: chatHook,
        speech: speechHook,
        quiz: quizHook,
        sandbox: sandboxHook
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
