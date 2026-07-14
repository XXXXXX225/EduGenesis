import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Cpu, User, Send, Sparkles, Video, FileText, HelpCircle, FileCode, Map, Play, Pause, Volume2, Home } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { apiGet } from '../../utils/api';

import QuizCard from '../chat/QuizCard';
import VideoRecommendCard from '../chat/VideoRecommendCard';
import CodeSandboxCard from '../chat/CodeSandboxCard';
import SlidesCarouselCard from '../chat/SlidesCarouselCard';
import PDFDownloadCard from '../chat/PDFDownloadCard';

const LatexRenderer = ({ text }) => {
  if (!text) return null;

  // Regex to match block math $$...$$ and inline math $...$ or \(...\) or \[...\]
  const mathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\\\$[^\s$][^$\n]*?[^\s$]\$|\$[^\s$]\$|\$[^\s$][^$\n]*?[^\s$]\$)/g;
  const parts = text.split(mathRegex);

  const formatMath = (mathStr) => {
    let clean = mathStr;
    let isBlock = false;
    if (clean.startsWith('$$') && clean.endsWith('$$')) {
      clean = clean.slice(2, -2);
      isBlock = true;
    } else if (clean.startsWith('$') && clean.endsWith('$')) {
      clean = clean.slice(1, -1);
    } else if (clean.startsWith('\\[') && clean.endsWith('\\]')) {
      clean = clean.slice(2, -2);
      isBlock = true;
    } else if (clean.startsWith('\\(') && clean.endsWith('\\)')) {
      clean = clean.slice(2, -2);
    }

    clean = clean.trim();

    // Map common LaTeX math symbols
    const symbols = {
      '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ',
      '\\epsilon': 'ε', '\\zeta': 'ζ', '\\eta': 'η', '\\theta': 'θ',
      '\\iota': 'ι', '\\kappa': 'κ', '\\lambda': 'λ', '\\mu': 'μ',
      '\\nu': 'ν', '\\xi': 'ξ', '\\pi': 'π', '\\rho': 'ρ',
      '\\sigma': 'σ', '\\tau': 'τ', '\\upsilon': 'υ', '\\phi': 'φ',
      '\\chi': 'χ', '\\psi': 'ψ', '\\omega': 'ω',
      '\\Delta': 'Δ', '\\Gamma': 'Γ', '\\Theta': 'Θ', '\\Lambda': 'Λ',
      '\\Xi': 'Ξ', '\\Pi': 'Π', '\\Sigma': 'Σ', '\\Phi': 'Φ',
      '\\Psi': 'Ψ', '\\Omega': 'Ω',
      '\\infty': '∞', '\\le': '≤', '\\ge': '≥', '\\neq': '≠',
      '\\approx': '≈', '\\times': '×', '\\div': '÷', '\\pm': '±',
      '\\cdot': '·', '\\in': '∈', '\\notin': '∉', '\\subset': '⊂',
      '\\supset': '⊃', '\\subseteq': '⊆', '\\supseteq': '⊇',
      '\\forall': '∀', '\\exists': '∃', '\\nabla': '∇',
      '\\partial': '∂', '\\sum': '∑', '\\prod': '∏', '\\int': '∫',
      '\\log': 'log', '\\ln': 'ln', '\\sin': 'sin', '\\cos': 'cos',
      '\\tan': 'tan', '\\exp': 'exp', '\\lim': 'lim', '\\to': '→',
      '\\rightarrow': '→', '\\leftarrow': '←', '\\implies': '⇒',
      '\\iff': '⇔', '\\backslash': '\\'
    };

    let html = clean;

    // Apply symbol translations
    Object.entries(symbols).forEach(([key, val]) => {
      const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      html = html.replace(new RegExp(escapedKey, 'g'), val);
    });

    // Handle fractions: \frac{a}{b} -> vertical fraction using flexbox
    html = html.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '<span style="display: inline-flex; flex-direction: column; vertical-align: middle; text-align: center; font-size: 0.85em; line-height: 1;"><sup style="border-bottom: 1px solid; padding: 0 2px; bottom: 0;">$1</sup><sub style="top: 0; padding: 0 2px;">$2</sub></span>');

    // Handle font styling: \mathbf{x}, \mathrm{x}, \text{x}
    html = html.replace(/\\mathbf\{([^{}]+)\}/g, '<strong style="font-style: normal;">$1</strong>');
    html = html.replace(/\\mathrm\{([^{}]+)\}/g, '<span style="font-style: normal;">$1</span>');
    html = html.replace(/\\text\{([^{}]+)\}/g, '<span style="font-style: normal;">$1</span>');

    // Handle superscripts: x^{abc} or x^2
    html = html.replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>');
    html = html.replace(/\^([a-zA-Z0-9])/g, '<sup>$1</sup>');

    // Handle subscripts: x_{abc} or x_i
    html = html.replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>');
    html = html.replace(/_([a-zA-Z0-9])/g, '<sub>$1</sub>');

    // Strip remaining backslashes for formatting commands
    html = html.replace(/\\/g, '');

    return (
      <span
        className={isBlock ? "math-block" : "math-inline"}
        style={{
          fontFamily: 'Cambria Math, Georgia, serif',
          fontStyle: 'italic',
          display: isBlock ? 'block' : 'inline-block',
          textAlign: isBlock ? 'center' : 'left',
          margin: isBlock ? '12px 0' : '0 2px',
          padding: isBlock ? '8px' : '0 2px',
          background: isBlock ? 'rgba(255,255,255,0.02)' : 'transparent',
          borderRadius: isBlock ? '8px' : '0',
          border: isBlock ? '1px solid rgba(255,255,255,0.04)' : 'none'
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;
        const isMath = (part.startsWith('$$') && part.endsWith('$$')) ||
                       (part.startsWith('$') && part.endsWith('$')) ||
                       (part.startsWith('\\[') && part.endsWith('\\]')) ||
                       (part.startsWith('\\(') && part.endsWith('\\)'));
        if (isMath) {
          return <React.Fragment key={index}>{formatMath(part)}</React.Fragment>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

const TutorAvatar = () => {
  const { chat, agentLogs } = useAppContext();
  const isStreaming = chat?.isStreaming;

  const getAvatarStatus = () => {
    if (!agentLogs || agentLogs.length === 0) return 'normal';
    
    // Check recent logs (last 5) for danger or warning
    const hasDanger = agentLogs.slice(-5).some(l => 
      (l.log_type === 'danger') || 
      (l.log || '').includes('拦截') || 
      (l.log || '').includes('异常') || 
      (l.log || '').includes('超时') || 
      (l.log || '').includes('强行终止')
    );
    
    if (hasDanger) return 'danger';
    
    const hasWarning = agentLogs.slice(-5).some(l => 
      (l.log_type === 'warning') || 
      (l.log || '').includes('警告') || 
      (l.log || '').includes('偏离') || 
      (l.log || '').includes('未通过')
    );
    
    if (hasWarning) return 'warning';

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
      
    if (isConsensus) return 'consensus';
    if (isStreaming) return 'typing';
    
    return 'normal';
  };

  const status = getAvatarStatus();

  // Color config based on status
  let coreGradStops = { stop0: '#2dd4bf', stop70: '#0d9488', stop100: '#0f766e' };
  let orbitColor = '#0ea5e9';
  let innerOrbitColor = '#f59e0b';
  let orbitDuration = '10s';
  let innerOrbitDuration = '8s';
  let onlineDotColor = '#10b981';
  let borderNeon = 'rgba(13, 148, 136, 0.25)';
  let glowColor = 'rgba(13, 148, 136, 0.18)';
  let extraStyle = {};

  if (status === 'danger') {
    coreGradStops = { stop0: '#f87171', stop70: '#dc2626', stop100: '#7f1d1d' };
    orbitColor = '#ef4444';
    innerOrbitColor = '#991b1b';
    orbitDuration = '15s';
    innerOrbitDuration = '12s';
    onlineDotColor = '#ef4444';
    borderNeon = 'rgba(239, 68, 68, 0.5)';
    glowColor = 'rgba(239, 68, 68, 0.3)';
    extraStyle = { animation: 'tutorJitter 0.5s infinite' };
  } else if (status === 'warning') {
    coreGradStops = { stop0: '#fbbf24', stop70: '#d97706', stop100: '#78350f' };
    orbitColor = '#fbbf24';
    innerOrbitColor = '#b45309';
    orbitDuration = '12s';
    innerOrbitDuration = '10s';
    onlineDotColor = '#f59e0b';
    borderNeon = 'rgba(245, 158, 11, 0.4)';
    glowColor = 'rgba(245, 158, 11, 0.2)';
  } else if (status === 'consensus') {
    coreGradStops = { stop0: '#34d399', stop70: '#059669', stop100: '#064e3b' };
    orbitColor = '#34d399';
    innerOrbitColor = '#065f46';
    orbitDuration = '6s';
    innerOrbitDuration = '5s';
    onlineDotColor = '#10b981';
    borderNeon = 'rgba(16, 185, 129, 0.35)';
    glowColor = 'rgba(16, 185, 129, 0.2)';
  } else if (status === 'typing') {
    coreGradStops = { stop0: '#38bdf8', stop70: '#0284c7', stop100: '#1e3a8a' };
    orbitColor = '#38bdf8';
    innerOrbitColor = '#0ea5e9';
    orbitDuration = '2s';
    innerOrbitDuration = '1.5s';
    onlineDotColor = '#38bdf8';
    borderNeon = 'rgba(14, 165, 233, 0.4)';
    glowColor = 'rgba(14, 165, 233, 0.35)';
  }

  return (
    <div style={{ 
      width: '42px', 
      height: '42px', 
      borderRadius: '14px', 
      background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.16) 0%, rgba(15, 118, 110, 0.05) 50%, rgba(2, 132, 199, 0.02) 100%)', 
      border: `1.5px solid ${borderNeon}`, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      boxShadow: `0 4px 14px ${glowColor}, inset 0 1px 2px rgba(255, 255, 255, 0.2)`,
      position: 'relative',
      flexShrink: 0,
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      ...extraStyle
    }}
    className="hover-scale-up-avatar"
    >
      <style>{`
        @keyframes tutorRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes tutorRotateRev {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes tutorPulse {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes onlinePulse {
          0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 6px var(--online-color, rgba(16, 185, 129, 0.8)); }
          50% { transform: scale(1.2); opacity: 0.8; box-shadow: 0 0 10px var(--online-color, rgba(16, 185, 129, 1)); }
        }
        @keyframes tutorJitter {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-1.5px, -0.5px); }
          20%, 40%, 60%, 80% { transform: translate(1.5px, 0.5px); }
        }
        .hover-scale-up-avatar:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 18px rgba(13, 148, 136, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3) !important;
        }
        .hover-scale-up-avatar:hover .tutor-orbit-fast {
          animation-duration: 2s !important;
        }
        .hover-scale-up-avatar:hover .tutor-orbit-rev-fast {
          animation-duration: 1.5s !important;
        }
      `}</style>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="tutor-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <radialGradient id="tutor-core-grad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
            <stop offset="0%" stopColor={coreGradStops.stop0} />
            <stop offset="70%" stopColor={coreGradStops.stop70} />
            <stop offset="100%" stopColor={coreGradStops.stop100} />
          </radialGradient>
          
          <linearGradient id="tutor-orbit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={orbitColor} />
            <stop offset="100%" stopColor={coreGradStops.stop70} />
          </linearGradient>
        </defs>

        {/* Axis line grid */}
        <path d="M12 3V21M3 12H21" stroke={orbitColor} strokeWidth="0.8" opacity="0.15" strokeDasharray="2 2" />

        {/* Outer Orbit Ring */}
        <g className="tutor-orbit-fast" style={{ transformOrigin: '12px 12px', animation: `tutorRotate ${orbitDuration} linear infinite` }}>
          <circle cx="12" cy="12" r="10" stroke="url(#tutor-orbit-grad)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          <circle cx="12" cy="2" r="2" fill={orbitColor} filter="url(#tutor-neon-glow)" />
        </g>
        
        {/* Inner Orbit Ring */}
        <g className="tutor-orbit-rev-fast" style={{ transformOrigin: '12px 12px', animation: `tutorRotateRev ${innerOrbitDuration} linear infinite` }}>
          <circle cx="12" cy="12" r="7.5" stroke={innerOrbitColor} strokeWidth="0.8" strokeDasharray="2 1" opacity="0.4" />
          <circle cx="19.5" cy="12" r="1.5" fill={innerOrbitColor} />
        </g>

        {/* Geometrics */}
        <path d="M12 5L19 12L12 19L5 12Z" stroke={orbitColor} strokeWidth="1.2" opacity="0.6" strokeLinejoin="round" />

        {/* Pulsing Core */}
        <circle className="tutor-core" cx="12" cy="12" r="3.5" fill="url(#tutor-core-grad)" filter="url(#tutor-neon-glow)" style={{ transformOrigin: '12px 12px', animation: 'tutorPulse 2s ease-in-out infinite' }} />
      </svg>
      <span style={{ 
        position: 'absolute', 
        bottom: '-1px', 
        right: '-1px', 
        width: '9px', 
        height: '9px', 
        borderRadius: '50%', 
        background: onlineDotColor, 
        border: '2px solid var(--bg-space)',
        animation: 'onlinePulse 2s infinite ease-in-out',
        '--online-color': onlineDotColor
      }} />
    </div>
  );
};

const StudentAvatar = () => {
  const { profile } = useAppContext();
  const cognitiveStyle = profile?.cognitive_style || 'Practical Coding';
  const kb = profile?.knowledge_base || 50;

  // 1. Dynamic themes based on cognitive style
  let baseGrad = 'linear-gradient(135deg, rgba(59, 130, 246, 0.14) 0%, rgba(29, 78, 216, 0.05) 50%, rgba(217, 119, 6, 0.02) 100%)';
  let borderStyle = '1.5px solid rgba(59, 130, 246, 0.25)';
  let glowStyle = 'rgba(29, 78, 216, 0.12)';
  let bookGradStart = '#3b82f6', bookGradEnd = '#1d4ed8';
  let dotColor = '#3b82f6';
  
  if (cognitiveStyle === 'Theoretical/Self-Paced') {
    baseGrad = 'linear-gradient(135deg, rgba(139, 92, 246, 0.14) 0%, rgba(109, 40, 217, 0.05) 50%, rgba(99, 102, 241, 0.02) 100%)';
    borderStyle = '1.5px solid rgba(139, 92, 246, 0.25)';
    glowStyle = 'rgba(109, 40, 217, 0.12)';
    bookGradStart = '#8b5cf6';
    bookGradEnd = '#4f46e5';
    dotColor = '#8b5cf6';
  } else if (cognitiveStyle === 'Visual/Guided') {
    baseGrad = 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(217, 119, 6, 0.05) 50%, rgba(251, 191, 36, 0.02) 100%)';
    borderStyle = '1.5px solid rgba(245, 158, 11, 0.25)';
    glowStyle = 'rgba(217, 119, 6, 0.12)';
    bookGradStart = '#f59e0b';
    bookGradEnd = '#d97706';
    dotColor = '#f59e0b';
  }

  // 2. Dynamic growth parameters
  const starScale = 0.85 + (kb / 100) * 0.35; // scales from 0.85 to 1.2
  const glowDeviation = 1.0 + (kb / 100) * 1.5; // scales from 1.0 to 2.5

  return (
    <div style={{ 
      width: '42px', 
      height: '42px', 
      borderRadius: '14px', 
      background: baseGrad, 
      border: borderStyle, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      boxShadow: `0 4px 14px ${glowStyle}, inset 0 1px 2px rgba(255, 255, 255, 0.2)`,
      position: 'relative',
      flexShrink: 0,
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    className="hover-scale-up-avatar-student"
    >
      <style>{`
        @keyframes studentFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes studentSpark {
          0%, 100% { opacity: 0.5; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes studentPulse {
          0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 6px var(--student-dot-color, rgba(59, 130, 246, 0.8)); }
          50% { transform: scale(1.2); opacity: 0.8; box-shadow: 0 0 10px var(--student-dot-color, rgba(59, 130, 246, 1)); }
        }
        .hover-scale-up-avatar-student:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 18px rgba(59, 130, 246, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.3) !important;
        }
      `}</style>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'studentFloat 3s ease-in-out infinite' }}>
        <defs>
          <filter id="student-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={glowDeviation} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <linearGradient id="student-book-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={bookGradStart} />
            <stop offset="100%" stopColor={bookGradEnd} />
          </linearGradient>
          
          <linearGradient id="student-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Winged open book pages */}
        <path d="M12 17.5C10.2 16.2 6.5 16.2 4 17.5V7C6.5 5.8 10.2 5.8 12 7.5V17.5Z" fill="rgba(59, 130, 246, 0.05)" stroke="url(#student-book-grad)" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 17.5C13.8 16.2 17.5 16.2 20 17.5V7C17.5 5.8 13.8 5.8 12 7.5V17.5Z" fill="rgba(59, 130, 246, 0.05)" stroke="url(#student-book-grad)" strokeWidth="1.5" strokeLinejoin="round" />
        
        {/* Spine */}
        <path d="M12 7.5V17.5" stroke={bookGradEnd} strokeWidth="1.5" strokeLinecap="round" />

        {/* Gold Diamond Growth Star with dynamic scale */}
        <g style={{ transformOrigin: '12px 7px', transform: `scale(${starScale})` }}>
          <path d="M12 2.5L14 5.5L17.5 7L14 8.5L12 11.5L10 8.5L6.5 7L10 5.5Z" fill="url(#student-gold-grad)" filter="url(#student-glow)" />
        </g>

        {/* Small ideas/sparkles */}
        <circle cx="5" cy="4" r="0.8" fill="#fbbf24" style={{ animation: 'studentSpark 2s infinite ease-in-out' }} />
        <circle cx="19" cy="4" r="0.8" fill="#fbbf24" style={{ animation: 'studentSpark 2s infinite ease-in-out', animationDelay: '0.7s' }} />
      </svg>
      <span style={{ 
        position: 'absolute', 
        bottom: '-1px', 
        right: '-1px', 
        width: '9px', 
        height: '9px', 
        borderRadius: '50%', 
        background: dotColor, 
        border: '2px solid var(--bg-space)',
        animation: 'studentPulse 2s infinite ease-in-out',
        '--student-dot-color': dotColor
      }} />
    </div>
  );
};

const parseIncompleteTags = (text) => {
  if (!text) return { cleanText: '', pendingTag: null };
  const tagKeywords = ['QUIZ', 'MINDMAP', 'CODE', 'SLIDES', 'PDF', 'VIDEO_RECOMMEND', 'VIDEO', 'DIAGRAM'];
  for (const kw of tagKeywords) {
    const pattern = `[${kw}:`;
    const idx = text.lastIndexOf(pattern);
    if (idx !== -1) {
      const cleanText = text.substring(0, idx);
      const rawTag = text.substring(idx);
      
      let label = "智能体分析中...";
      if (kw === 'QUIZ') label = "正在为您设计自适应测验...";
      if (kw === 'MINDMAP') label = "正在为您绘制自适应概念脉络树...";
      if (kw === 'CODE') label = "正在为您组装实操源码用例...";
      if (kw === 'SLIDES') label = "正在为您制作音画对齐幻灯片...";
      if (kw === 'PDF') label = "正在为您编写讲义课本章节...";
      if (kw === 'VIDEO_RECOMMEND') label = "正在为您匹配检索精选视频...";
      
      return {
        cleanText,
        pendingTag: {
          type: kw,
          label: label,
          raw: rawTag
        }
      };
    }
  }
  return { cleanText: text, pendingTag: null };
};
function splitContentTags(content) {
  if (!content) return [];
  const parts = [];
  let currentIndex = 0;
  const len = content.length;

  const tagPrefixes = [
    '[QUIZ:',
    '[VIDEO_RECOMMEND:',
    '[MINDMAP:',
    '[CODE:',
    '[SLIDES:',
    '[PDF:',
    '[DIAGRAM:',
    '[VIDEO:'
  ];

  while (currentIndex < len) {
    let nextTagIdx = -1;
    let matchedPrefix = '';
    
    for (const prefix of tagPrefixes) {
      const idx = content.indexOf(prefix, currentIndex);
      if (idx !== -1 && (nextTagIdx === -1 || idx < nextTagIdx)) {
        nextTagIdx = idx;
        matchedPrefix = prefix;
      }
    }

    if (nextTagIdx === -1) {
      parts.push(content.substring(currentIndex));
      break;
    }

    parts.push(content.substring(currentIndex, nextTagIdx));

    let depth = 1;
    let scanIdx = nextTagIdx + matchedPrefix.length;
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inTripleSingleQuote = false;
    let inTripleDoubleQuote = false;
    let inComment = false;

    while (scanIdx < len && depth > 0) {
      const char = content[scanIdx];
      const nextChar = content[scanIdx + 1];
      const prevChar = content[scanIdx - 1];

      if (char === '"' && nextChar === '"' && content[scanIdx + 2] === '"') {
        if (inTripleDoubleQuote) {
          inTripleDoubleQuote = false;
        } else if (!inSingleQuote && !inDoubleQuote && !inTripleSingleQuote && !inComment) {
          inTripleDoubleQuote = true;
        }
        scanIdx += 3;
        continue;
      }

      if (char === "'" && nextChar === "'" && content[scanIdx + 2] === "'") {
        if (inTripleSingleQuote) {
          inTripleSingleQuote = false;
        } else if (!inSingleQuote && !inDoubleQuote && !inTripleDoubleQuote && !inComment) {
          inTripleSingleQuote = true;
        }
        scanIdx += 3;
        continue;
      }

      if (inComment) {
        if (char === '\n') {
          inComment = false;
        }
        scanIdx++;
        continue;
      }

      if (!inSingleQuote && !inDoubleQuote && !inTripleSingleQuote && !inTripleDoubleQuote) {
        if (char === '#') {
          inComment = true;
          scanIdx++;
          continue;
        }
      }

      if (char === '"' && prevChar !== '\\') {
        if (inDoubleQuote) {
          inDoubleQuote = false;
        } else if (!inSingleQuote && !inTripleSingleQuote && !inTripleDoubleQuote) {
          inDoubleQuote = true;
        }
      } else if (char === "'" && prevChar !== '\\') {
        if (inSingleQuote) {
          inSingleQuote = false;
        } else if (!inDoubleQuote && !inTripleSingleQuote && !inTripleDoubleQuote) {
          inSingleQuote = true;
        }
      }

      const inString = inSingleQuote || inDoubleQuote || inTripleSingleQuote || inTripleDoubleQuote;
      if (!inString && !inComment) {
        if (char === '[') {
          depth++;
        } else if (char === ']') {
          depth--;
        }
      }

      scanIdx++;
    }

    parts.push(content.substring(nextTagIdx, scanIdx));
    currentIndex = scanIdx;
  }

  return parts;
}

const InteractiveChatBubble = ({ msg, isStreaming }) => {
  const { speech: { handleSlideSpeech, stopSlideSpeech } } = useAppContext();
  const [selectedStep, setSelectedStep] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  React.useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const content = msg.content;
  if (!content || !content.trim()) {
    if (isStreaming) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '20px' }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--primary-neon)',
                boxShadow: '0 0 6px var(--primary-neon)',
                display: 'inline-block',
                animation: 'bounceDot 1.4s infinite ease-in-out both',
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
          <style>{`
            @keyframes bounceDot {
              0%, 80%, 100% { transform: scale(0.3); opacity: 0.3; }
              40% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      );
    }
    return null;
  }

  const parts = splitContentTags(content);

  // Find the index of the last text part that is actually rendered (not an incomplete tag, and not a parsed tag card)
  let lastVisibleTextIndex = -1;
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (!part) continue;
    const isTag = part.startsWith('[') && part.endsWith(']');
    const isIncompleteTag = part.startsWith('[') && !part.endsWith(']');
    if (!isTag && !isIncompleteTag) {
      lastVisibleTextIndex = i;
      break;
    }
  }
  const hasVisibleText = lastVisibleTextIndex !== -1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Check for completed tags
        if (part.startsWith('[QUIZ:') && part.endsWith(']')) {
          try {
            const jsonStr = part.substring(6, part.length - 1).trim();
            const quizData = JSON.parse(jsonStr);
            return <QuizCard key={index} quizData={quizData} />;
          } catch (e) {
            return null; // Ignore invalid / parsing JSON during stream
          }
        }

        if (part.startsWith('[VIDEO_RECOMMEND:') && part.endsWith(']')) {
          try {
            const jsonStr = part.substring(17, part.length - 1).trim();
            const videoData = JSON.parse(jsonStr);
            return <VideoRecommendCard key={index} videoData={videoData} />;
          } catch (e) {
            return null;
          }
        }

        if (part.startsWith('[MINDMAP:') && part.endsWith(']')) {
          // Chat mindmap feature disabled per user request
          return null;
        }

        if (part.startsWith('[CODE:') && part.endsWith(']')) {
          const inner = part.substring(6, part.length - 1).trim();
          const pipeIdx = inner.indexOf('|');
          if (pipeIdx !== -1) {
            const lang = inner.substring(0, pipeIdx).trim();
            const codeContent = inner.substring(pipeIdx + 1).trim();
            return <CodeSandboxCard key={index} code={codeContent} lang={lang} />;
          }
        }

        if (part.startsWith('[SLIDES:') && part.endsWith(']')) {
          const inner = part.substring(8, part.length - 1).trim();
          const slideItems = inner.split('---').map(slideStr => {
            const parts = slideStr.split('|');
            return {
              title: parts[0]?.trim() || '演示幻灯片',
              content: parts[1]?.trim() || ''
            };
          });
          return <SlidesCarouselCard key={index} slides={slideItems} />;
        }

        if (part.startsWith('[PDF:') && part.endsWith(']')) {
          const inner = part.substring(5, part.length - 1).trim();
          const pipeIdx = inner.indexOf('|');
          const title = pipeIdx !== -1 ? inner.substring(0, pipeIdx).trim() : '自适应讲义课本';
          const md = pipeIdx !== -1 ? inner.substring(pipeIdx + 1).trim() : inner;
          return <PDFDownloadCard key={index} title={title} markdown={md} />;
        }

        // Legacy diagrams and audio card matches
        if (part.startsWith('[DIAGRAM:') && part.endsWith(']')) {
          const diagramRegex = /\[DIAGRAM:\s*([^\]|]+)\s*\|\s*([^\]]+)\]/;
          const match = part.match(diagramRegex);
          if (match) {
            const steps = match[1].split('->').map(s => s.trim());
            const detailsStr = match[2].trim();
            const detailsMap = {};
            steps.forEach(step => {
              const escapeStep = step.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
              const regex = new RegExp(`${escapeStep}\\s*:\\s*([^\\n.]+)(?:\\.|\\n|$)`, 'i');
              const detailMatch = detailsStr.match(regex);
              detailsMap[step] = detailMatch ? detailMatch[1].trim() : "点击查看此步骤的学术详情。";
            });
            return (
              <div key={index} style={{ marginTop: '8px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1.5px solid var(--border-neon)', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-neon)', paddingBottom: '10px' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>画像智能体学术概念脉络图</strong>
                </div>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px' }}>
                  {steps.map((step, idx) => (
                    <button key={idx} type="button" onClick={() => setSelectedStep(idx)} style={{ padding: '6px 14px', borderRadius: '20px', background: selectedStep === idx ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'rgba(0,0,0,0.03)', border: selectedStep === idx ? '1px solid var(--primary-neon)' : '1px solid var(--border-neon)', color: selectedStep === idx ? '#fff' : 'var(--text-muted)', fontSize: '11px', cursor: 'pointer' }}>
                      {step}
                    </button>
                  ))}
                </div>
                <div style={{ background: 'rgba(0, 0, 0, 0.05)', borderRadius: '12px', padding: '14px 18px', borderLeft: '3px solid var(--secondary)' }}>
                  <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-main)' }}>{detailsMap[steps[selectedStep]] || detailsMap[steps[0]]}</p>
                </div>
              </div>
            );
          }
        }

        if (part.startsWith('[VIDEO:') && part.endsWith(']')) {
          const videoRegex = /\[VIDEO:\s*([^\]|]+)\s*\|\s*([^\]]+)\]/;
          const match = part.match(videoRegex);
          if (match) {
            const speakText = match[1].trim();
            const subTitle = match[2].trim();
            const toggleVideoPlay = () => {
              if (isVideoPlaying) {
                if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
                stopSlideSpeech();
                setIsVideoPlaying(false);
              } else {
                setIsVideoPlaying(true);
                setVideoProgress(0);
                handleSlideSpeech(speakText);
                const duration = 7500;
                const intervalTime = 100;
                const totalSteps = duration / intervalTime;
                let curStep = 0;
                progressIntervalRef.current = setInterval(() => {
                  curStep++;
                  const percentage = Math.min(100, (curStep / totalSteps) * 100);
                  setVideoProgress(percentage);
                  if (percentage >= 100) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; setIsVideoPlaying(false); }
                }, intervalTime);
              }
            };
            return (
              <div key={index} style={{ marginTop: '8px', background: '#0a0a0c', borderRadius: '16px', border: '1.5px solid var(--border-neon)', overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(45deg, #111, #1e1e24)' }}>
                  <button type="button" onClick={toggleVideoPlay} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', border: '1px solid var(--primary-neon)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isVideoPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
                  </button>
                  <div style={{ position: 'absolute', bottom: '8px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Volume2 size={12} className={isVideoPlaying ? "animate-pulse" : ""} />
                    <span>{isVideoPlaying ? `播音中...` : `播放微课: ${subTitle}`}</span>
                  </div>
                </div>
                <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flexGrow: 1, height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${videoProgress}%`, height: '100%', background: 'var(--primary-neon)' }} />
                  </div>
                </div>
              </div>
            );
          }
        }

        // If the text slice contains an incomplete tag, display it as plain text
        if (part.startsWith('[') && !part.endsWith(']')) {
          return null; // Skip rendering partial tag code while streaming
        }

        // Parse and hide incomplete tags while streaming
        const { cleanText, pendingTag } = parseIncompleteTags(part);

        // Otherwise render as regular text chunk
        const showCursorHere = isStreaming && index === lastVisibleTextIndex;
        return (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cleanText && (
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                <LatexRenderer text={cleanText} />
                {showCursorHere && !pendingTag && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '16px',
                      background: 'var(--primary-neon)',
                      marginLeft: '2px',
                      verticalAlign: 'text-bottom',
                      animation: 'blinkCursor 0.8s step-end infinite',
                      borderRadius: '1px',
                      boxShadow: '0 0 6px var(--primary-neon)',
                    }}
                  >
                    &nbsp;
                  </span>
                )}
              </div>
            )}
            
            {pendingTag && (
              <div 
                className="pulse-glow" 
                style={{ 
                  marginTop: '6px', 
                  padding: '10px 14px', 
                  background: 'rgba(15, 118, 110, 0.05)', 
                  border: '1.5px dashed var(--primary-neon)', 
                  borderRadius: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  fontSize: '12px',
                  color: 'var(--primary-neon)',
                  animation: 'fadeIn 0.25s ease-out'
                }}
              >
                <div 
                  className="spinner-academic" 
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderWidth: '2px', 
                    marginBottom: 0,
                    flexShrink: 0
                  }}
                ></div>
                <strong style={{ fontWeight: '600' }}>{pendingTag.label}</strong>
              </div>
            )}
          </div>
        );
      })}

      {isStreaming && !hasVisibleText && (
        <span
          style={{
            display: 'inline-block',
            width: '8px',
            height: '16px',
            background: 'var(--primary-neon)',
            marginLeft: '2px',
            verticalAlign: 'text-bottom',
            animation: 'blinkCursor 0.8s step-end infinite',
            borderRadius: '1px',
            boxShadow: '0 0 6px var(--primary-neon)',
          }}
        >
          &nbsp;
        </span>
      )}
    </div>
  );
};

export default function ChatView({ chatEndRef }) {
  const {
    profile,
    profileAlert,
    goPortalHome,
    diagnosticLogs,
    currentSessionId,
    chat: {
      chatHistory,
      chatInput,
      setChatInput,
      tutorStatus,
      isStreaming,
      submitChatMessage,
      handleSendMessage
    }
  } = useAppContext();

  const [engineStatus, setEngineStatus] = useState({
    model_name: '星火大模型 V3.0 Lite (自适应版)',
    tokens_used: 0,
    tokens_limit: 8192,
    percentage: 0.0
  });

  const fetchEngineStatus = async () => {
    if (!currentSessionId) return;
    try {
      const data = await apiGet(`/chat/sessions/${currentSessionId}/status`);
      setEngineStatus(data);
    } catch (err) {
      console.warn("Failed to fetch engine status:", err);
    }
  };

  useEffect(() => {
    fetchEngineStatus();
  }, [currentSessionId]);

  useEffect(() => {
    if (!isStreaming && chatHistory.length > 1) {
      fetchEngineStatus();
    }
  }, [isStreaming, chatHistory.length]);

  const lastAssistantIdx = (() => {
    for (let i = chatHistory.length - 1; i >= 0; i--) {
      if (chatHistory[i].role !== 'user') return i;
    }
    return -1;
  })();

  return (
    <div className="chat-view-container" style={{ display: 'flex', height: '100%', position: 'relative', width: '100%' }}>
      {/* Left section: Chat area */}
      <section className="cyber-card chat-view-section" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, border: 'none', height: '100%', position: 'relative', background: 'transparent' }}>

        {/* Blink cursor keyframes */}
        <style>{`
          @keyframes blinkCursor {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>

        {/* Profile Alert Bubble */}
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
        <div className="chat-view-header" style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
              <MessageSquare size={18} style={{ color: 'var(--primary-neon)' }} /> 智能画像导师
              <button
                className="btn-home-pill"
                onClick={() => goPortalHome()}
              >
                <Home size={11} />
                返回首页
              </button>
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>与您的专属助教对话，动态更新左侧画像雷达数据</span>
          </div>
          <span className="neon-badge neon-badge-success">多智能体在线</span>
        </div>

        {/* Dialog Area */}
        <div className="chat-view-dialog" style={{ flexGrow: '1', padding: '28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {chatHistory.map((msg, index) => {
            if (msg.role === 'system') {
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '8px 0',
                    width: '100%'
                  }}
                >
                  <div style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.08) 0%, rgba(2, 132, 199, 0.04) 100%)',
                    border: '1px solid rgba(13, 148, 136, 0.2)',
                    borderRadius: '12px',
                    color: 'var(--primary-neon)',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    backdropFilter: 'blur(4px)'
                  }}>
                    <Cpu size={12} className="animate-pulse" style={{ color: 'var(--secondary)' }} />
                    <span>{msg.content}</span>
                  </div>
                </div>
              );
            }
            const isLastAssistant = index === lastAssistantIdx && msg.role !== 'user';
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: '14px'
                }}
              >
                {msg.role !== 'user' && <TutorAvatar />}
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
                      isStreaming={isStreaming && isLastAssistant}
                    />
                  )}
                </div>
                {msg.role === 'user' && <StudentAvatar />}
              </div>
            );
          })}

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
        <div className="chat-view-chips" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '10px 24px', background: 'rgba(0,0,0,0.01)', borderTop: '1px solid var(--border-neon)' }}>
          {['我想学 Python 基础', '测试我的机器学习基础', '根据我的画像调整路线', '我觉得当前的学习节奏太快了'].map(chip => (
            <button
              key={chip}
              type="button"
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
        <form onSubmit={handleSendMessage} className="chat-view-form" style={{ padding: '20px 28px', borderTop: '1px solid var(--border-neon)', background: 'var(--bg-chat-form)' }}>
          <div style={{ display: 'flex', gap: '14px' }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={isStreaming ? "导师正在调用多智能体协同优化画像..." : "输入“我想学机器学习”或说明你的基础，定制画像 and 路径..."}
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
          
          {/* Cyber engine and context HUD status bar */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '12px', 
            padding: '0 4px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            opacity: 0.95
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={12} style={{ color: 'var(--primary)' }} />
              <span>智能体引擎：<span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{engineStatus.model_name}</span></span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '80px', 
                height: '6px', 
                background: 'rgba(0, 0, 0, 0.05)', 
                border: '1px solid var(--border-neon)',
                borderRadius: '3px', 
                overflow: 'hidden',
                display: 'inline-block',
                position: 'relative'
              }}>
                <div style={{ 
                  width: `${engineStatus.percentage}%`, 
                  height: '100%', 
                  background: engineStatus.percentage > 80 ? '#ef4444' : 'var(--primary)', 
                  borderRadius: '3px',
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
              <span>上下文占用：<span style={{ color: engineStatus.percentage > 80 ? '#ef4444' : 'var(--primary)', fontWeight: '600' }}>{engineStatus.percentage}%</span> ({engineStatus.tokens_used} / {engineStatus.tokens_limit} Token)</span>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
