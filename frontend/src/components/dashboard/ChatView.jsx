import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Cpu, User, Send, Sparkles, Video, FileText, HelpCircle, FileCode, Map } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const InteractiveChatBubble = ({ msg, isStreaming }) => {
  const { speech: { handleSlideSpeech, stopSlideSpeech } } = useAppContext();
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

  // Streaming cursor blink effect
  const streamingCursor = isStreaming ? (
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
  ) : null;

  const textElement = cleanText ? (
    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
      {cleanText}
      {streamingCursor}
    </div>
  ) : (
    streamingCursor ? (
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
        {streamingCursor}
      </div>
    ) : null
  );

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

    diagramCard = (
      <div style={{
        marginTop: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '16px',
        border: '1.5px solid var(--border-neon)',
        padding: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-neon)', paddingBottom: '10px' }}>
          <Sparkles size={16} style={{ color: 'var(--primary-neon)' }} />
          <strong style={{ fontSize: '13.5px', color: 'var(--text-main)' }}>画像智能体学术概念脉络图</strong>
        </div>

        {/* Timeline Path steps */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '14px' }}>
          {steps.map((step, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedStep(idx)}
              style={{
                flexShrink: 0,
                padding: '6px 14px',
                borderRadius: '20px',
                background: selectedStep === idx ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'rgba(0,0,0,0.03)',
                border: selectedStep === idx ? '1px solid var(--primary-neon)' : '1px solid var(--border-neon)',
                color: selectedStep === idx ? '#ffffff' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              className="hover-neon-border"
            >
              {step}
            </button>
          ))}
        </div>

        {/* Selected step details content */}
        <div style={{ background: 'rgba(0, 0, 0, 0.05)', borderRadius: '12px', padding: '14px 18px', borderLeft: '3px solid var(--secondary)', minHeight: '60px' }}>
          <div style={{ fontSize: '10px', color: 'var(--secondary)', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase' }}>
            步骤详情 ({steps[selectedStep]})
          </div>
          <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-main)', lineHeight: '1.6' }}>
            {detailsMap[steps[selectedStep]]}
          </p>
        </div>
      </div>
    );
  }

  // 2. Render Video/Voice Synthesizer Card if matched
  let videoCard = null;
  if (videoMatch) {
    const speakText = videoMatch[1].trim();
    const subTitle = videoMatch[2].trim();

    const toggleVideoPlay = () => {
      if (isVideoPlaying) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
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
          if (percentage >= 100) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
            setIsVideoPlaying(false);
          }
        }, intervalTime);
      }
    };

    videoCard = (
      <div style={{
        marginTop: '16px',
        background: '#0a0a0c',
        borderRadius: '16px',
        border: '1.5px solid var(--border-neon)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}>
        <div style={{ position: 'relative', height: '140px', background: 'linear-gradient(45deg, #111 0%, #1e1e24 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {isVideoPlaying && (
            <div style={{ position: 'absolute', display: 'flex', gap: '4px', bottom: '16px', left: '16px' }}>
              {[0.4, 0.8, 0.5, 0.9, 0.3, 0.7].map((height, i) => (
                <div
                  key={i}
                  style={{
                    width: '3px',
                    height: '24px',
                    background: 'var(--primary-neon)',
                    borderRadius: '3px',
                    transform: `scaleY(${height})`,
                    transformOrigin: 'bottom',
                    animation: `pulseWave ${0.6 + i * 0.15}s ease-in-out infinite alternate`
                  }}
                />
              ))}
            </div>
          )}

          <div style={{
            position: 'absolute',
            bottom: '12px',
            width: '80%',
            textAlign: 'center',
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '11px',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            {isVideoPlaying ? `🔊 ${speakText.substring(0, 36)}...` : `🔊 点击播放微课：${subTitle}`}
          </div>

          <button
            type="button"
            onClick={toggleVideoPlay}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              border: '1.5px solid var(--primary-neon)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              zIndex: 2,
              boxShadow: '0 4px 15px rgba(15, 118, 110, 0.4)'
            }}
            className="hover-neon-border"
          >
            {isVideoPlaying ? (
              <div style={{ display: 'flex', gap: '3px' }}>
                <div style={{ width: '3px', height: '12px', background: '#fff' }}></div>
                <div style={{ width: '3px', height: '12px', background: '#fff' }}></div>
              </div>
            ) : (
              <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid #fff', marginLeft: '3px' }}></div>
            )}
          </button>
        </div>

        <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.02)' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>00:0{isVideoPlaying ? '1' : '0'} / 00:07</span>
          <div style={{ flexGrow: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${videoProgress}%`, height: '100%', background: 'var(--primary-neon)', transition: 'width 0.1s linear' }} />
          </div>
        </div>

        <style>{`
          @keyframes pulseWave {
            0% { transform: scaleY(0.3); }
            100% { transform: scaleY(1.1); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {textElement}
      {diagramCard}
      {videoCard}
    </>
  );
};

export default function ChatView({ chatEndRef }) {
  const {
    profile,
    profileAlert,
    goDashboardHome,
    diagnosticLogs,
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

  const lastAssistantIdx = (() => {
    for (let i = chatHistory.length - 1; i >= 0; i--) {
      if (chatHistory[i].role !== 'user') return i;
    }
    return -1;
  })();

  return (
    <div style={{ display: 'flex', height: '100%', position: 'relative', width: '100%' }}>
      {/* Left section: Chat area */}
      <section className="cyber-card" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, border: 'none', height: '100%', position: 'relative', background: 'transparent' }}>

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
        <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
              <MessageSquare size={18} style={{ color: 'var(--primary-neon)' }} /> 智能画像导师
              <a
                href="#"
                role="button"
                onClick={(e) => {
                  e.preventDefault();
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
          {chatHistory.map((msg, index) => {
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
                      isStreaming={isStreaming && isLastAssistant}
                    />
                  )}
                </div>
                {msg.role === 'user' && (
                  <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.03)', border: '1px solid rgba(0, 0, 0, 0.06)', flexShrink: 0 }}>
                    <User size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
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
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '10px 24px', background: 'rgba(0,0,0,0.01)', borderTop: '1px solid var(--border-neon)' }}>
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
        <form onSubmit={handleSendMessage} style={{ padding: '20px 28px', borderTop: '1px solid var(--border-neon)', background: 'var(--bg-chat-form)' }}>
          <div style={{ display: 'flex', gap: '14px' }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={isStreaming ? "导师正在调用多智能体协同优化画像..." : "输入「我想学机器学习」或说明你的基础，定制画像与路径..."}
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
    </div>
  );
}
