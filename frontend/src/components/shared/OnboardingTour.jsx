import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Play,
  Sparkles,
  MessageSquare,
  User,
  TrendingUp,
  BookOpen,
  Code2,
  Cpu,
  GraduationCap,
  Settings
} from 'lucide-react';

export default function OnboardingTour({ isTourActive, setIsTourActive, setActiveTab, username }) {
  const [activeStep, setActiveStep] = useState(0);
  const [spotlight, setSpotlight] = useState({ left: 0, top: 0, width: 0, height: 0, active: false });
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const steps = [
    {
      title: "欢迎来到 EduGenesis 学术研学系统",
      icon: <Sparkles size={16} style={{ color: 'var(--primary-neon)' }} />,
      content: "EduGenesis 融合了「动态认知画像」与「自适应多智能体协同」技术。接下来我们将带您进行快速探索，了解各模块的使用技巧！",
      selector: "center",
      placement: "center"
    },
    {
      title: "智能画像导师",
      icon: <MessageSquare size={16} style={{ color: 'var(--primary-neon)' }} />,
      content: "左侧是您的核心对话区。在这里您可以与画像导师自由讨论学术问题或接受随堂考核，导师的反馈将实时动态修正右侧的数据面板。",
      selector: ".desktop-only-chat",
      placement: "left-panel"
    },
    {
      title: "认知画像与统计",
      icon: <User size={16} style={{ color: 'var(--primary-neon)' }} />,
      content: "在这里您能查看到由 AI 实时建模渲染的个人知识雷达、打卡统计以及通关率。您甚至可以拖动雷达轴线自定义您的「认知基准调节阀」。",
      selector: ".right-sidebar-content-viewport",
      placement: "right-sidebar",
      action: () => setActiveTab('home')
    },
    {
      title: "自适应学习脉络",
      icon: <TrendingUp size={16} style={{ color: 'var(--primary-neon)' }} />,
      content: "这是基于您的认知画像智能规划生成的关卡式课程地图。AI 会对难度进行剪枝与对齐。绿色节点代表您已掌握，橙色进行中，灰色代表待探索。",
      selector: ".right-sidebar-content-viewport",
      placement: "right-sidebar",
      action: () => setActiveTab('path')
    },
    {
      title: "多模态定制资源",
      icon: <BookOpen size={16} style={{ color: 'var(--primary-neon)' }} />,
      content: "想要更系统的阅读？在这里，智能体会为您实时抽取出定制化的概念课本讲解、PPT大纲以及配套 of AI 语音小讲堂，并支持导出学术防伪证书。",
      selector: ".right-sidebar-content-viewport",
      placement: "right-sidebar",
      action: () => setActiveTab('resources')
    },
    {
      title: "自适应编程沙盒",
      icon: <Code2 size={16} style={{ color: 'var(--primary-neon)' }} />,
      content: "极客实践中心。无需在本地搭建任何开发环境，您就可以在这里编写和运行 Python 代码，系统还提供随堂单元测试和智能纠错诊断功能。",
      selector: ".right-sidebar-content-viewport",
      placement: "right-sidebar",
      action: () => setActiveTab('sandbox')
    },
    {
      title: "智能错题加固",
      icon: <HelpCircle size={16} style={{ color: 'var(--primary-neon)' }} />,
      content: "所有考核中答错的问题都会被收录在此。您可以在这里开展复盘练习，查看 AI 给出的多维解题剖析，直到最终熟练掌握并通过补考。",
      selector: ".right-sidebar-content-viewport",
      placement: "right-sidebar",
      action: () => setActiveTab('errors')
    },
    {
      title: "智能体运行日志",
      icon: <Cpu size={16} style={{ color: 'var(--primary-neon)' }} />,
      content: "这是后台智能体协作的心流轨迹展示墙。您能在这里实时监督主管智能体、认知诊断官、大纲编写官在为您计算时的逻辑链路与思考历程。",
      selector: ".right-sidebar-content-viewport",
      placement: "right-sidebar",
      action: () => setActiveTab('agent-console')
    },
    {
      title: "学术勋章与成就",
      icon: <GraduationCap size={16} style={{ color: 'var(--primary-neon)' }} />,
      content: "记录您在 EduGenesis 平台的学术探索轨迹。这里将记录您的连续研学天数、积分累计，以及因为展现特定学习风格而斩获的炫酷勋章。",
      selector: ".right-sidebar-content-viewport",
      placement: "right-sidebar",
      action: () => setActiveTab('achievements')
    },
    {
      title: "账号安全与大模型路由",
      icon: <Settings size={16} style={{ color: 'var(--primary-neon)' }} />,
      content: "点击顶部的设置齿轮，您可以随时切换系统底层的 LLM 引擎路由（支持星火、OpenAI兼容接口等），并配置自定义密保问题及二次验证器（2FA）以增强账户安全性。",
      selector: "button[title='模型服务配置']",
      placement: "settings-cog"
    }
  ];

  // ... (keep the rest unchanged until render block)


  useEffect(() => {
    if (!isTourActive) return;

    const handleUpdate = () => {
      const step = steps[activeStep];
      if (!step || step.selector === 'center') {
        setSpotlight({ left: 0, top: 0, width: 0, height: 0, active: false });
        return;
      }

      if (step.action) {
        step.action();
      }

      // Allow a brief delay for tab mounting / DOM updates before measuring
      setTimeout(() => {
        const el = document.querySelector(step.selector);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Add a tiny padding to the spotlight box
          setSpotlight({
            left: rect.left - 4,
            top: rect.top - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            active: true
          });
        } else {
          setSpotlight({ left: 0, top: 0, width: 0, height: 0, active: false });
        }
      }, 200);
    };

    handleUpdate();
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('resize', handleUpdate);
    };
  }, [activeStep, isTourActive]);

  if (!isTourActive) return null;

  const currentStep = steps[activeStep];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    const key = `edugenesis_onboarding_completed_v2_${username || 'guest'}`;
    if (dontShowAgain) {
      localStorage.setItem(key, 'true');
    } else {
      localStorage.removeItem(key);
    }
    setIsTourActive(false);
    setActiveStep(0);
  };

  // Helper to determine the floating card placement inline styling
  const getCardStyle = () => {
    if (currentStep.placement === 'center') {
      return {
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '420px',
        maxWidth: '90vw',
      };
    }
    if (currentStep.placement === 'left-panel') {
      return {
        position: 'fixed',
        left: 'calc(50vw - 120px)',
        top: '30%',
        width: '350px',
      };
    }
    if (currentStep.placement === 'right-sidebar') {
      return {
        position: 'fixed',
        right: 'calc(var(--sidebar-width, 340px) + 80px)',
        top: '30%',
        width: '350px',
      };
    }
    if (currentStep.placement === 'settings-cog') {
      return {
        position: 'fixed',
        right: '40px',
        top: '80px',
        width: '350px',
      };
    }
    return {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: '350px',
    };
  };

  return (
    <>
      {/* Click Shield (blocks background interactions during tour) */}
      <div 
        className="onboarding-shield"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'transparent',
          pointerEvents: 'auto'
        }}
      />

      {/* Spotlight cutout */}
      {spotlight.active && (
        <div
          className="onboarding-spotlight-box"
          style={{
            position: 'fixed',
            left: `${spotlight.left}px`,
            top: `${spotlight.top}px`,
            width: `${spotlight.width}px`,
            height: `${spotlight.height}px`,
            zIndex: 9999,
            pointerEvents: 'none',
            borderRadius: '12px',
            border: '2px dashed var(--primary-neon)',
            boxShadow: '0 0 0 9999px rgba(8, 12, 21, 0.78), 0 0 20px rgba(13, 148, 136, 0.5)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}
        />
      )}

      {/* Dark Overlay when Spotlight is inactive (e.g. Center steps) */}
      {!spotlight.active && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(8, 12, 21, 0.82)',
            backdropFilter: 'blur(3px)',
            transition: 'all 0.3s'
          }}
        />
      )}

      {/* Floating Tour Card */}
      <div
        className="cyber-card onboarding-card tab-fade-in"
        style={{
          ...getCardStyle(),
          zIndex: 10000,
          padding: '24px',
          background: 'var(--bg-card-glass)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-neon)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 15px rgba(13, 148, 136, 0.15)',
          transition: 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)'
        }}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span 
            className="neon-badge neon-badge-primary"
            style={{ fontSize: '9px', padding: '3px 8px' }}
          >
            新手指南 • {activeStep + 1} / {steps.length}
          </span>
          <button
            onClick={handleComplete}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            title="跳过指引"
          >
            <X size={16} />
          </button>
        </div>

        {/* Card Title */}
        <h3 
          style={{ 
            fontSize: '15px', 
            fontWeight: '800', 
            marginBottom: '10px', 
            color: 'var(--text-main)',
            lineHeight: '1.4',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {currentStep.icon}
          {currentStep.title}
        </h3>

        {/* Card Content */}
        <p
          style={{
            fontSize: '12.5px',
            color: 'var(--text-muted)',
            lineHeight: '1.6',
            marginBottom: '20px',
            minHeight: '60px'
          }}
        >
          {currentStep.content}
        </p>

        {/* Card Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Checkbox "以后不再提示" */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-dim)', cursor: 'pointer', userSelect: 'none' }}>
            <input 
              type="checkbox" 
              checked={dontShowAgain} 
              onChange={(e) => setDontShowAgain(e.target.checked)}
              style={{ accentColor: 'var(--primary-neon)', cursor: 'pointer' }}
            />
            以后不再提示
          </label>

          {/* Nav group */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {activeStep > 0 && (
              <button
                onClick={handlePrev}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '5px 12px',
                  borderRadius: '16px',
                  color: 'var(--text-main)',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                <ChevronLeft size={12} />
                上一步
              </button>
            )}

            <button
              onClick={handleNext}
              className="btn-home-pill"
              style={{
                marginLeft: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '5px 14px'
              }}
            >
              {activeStep === steps.length - 1 ? (
                <>
                  <Play size={10} style={{ fill: 'currentColor' }} />
                  开启探索
                </>
              ) : (
                <>
                  下一步
                  <ChevronRight size={12} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
