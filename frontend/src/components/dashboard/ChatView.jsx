import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Cpu, User, Send, Sparkles, Video, FileText, HelpCircle, FileCode, Map } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

import QuizCard from '../chat/QuizCard';
import VideoRecommendCard from '../chat/VideoRecommendCard';
import MermaidRenderer from '../chat/MermaidRenderer';
import CodeSandboxCard from '../chat/CodeSandboxCard';
import SlidesCarouselCard from '../chat/SlidesCarouselCard';
import PDFDownloadCard from '../chat/PDFDownloadCard';

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

  // Expand regex to capture all resource tags
  const tagsRegex = /(\[QUIZ:\s*\{.*?\}\s*\]|\[VIDEO_RECOMMEND:\s*\{.*?\}\s*\]|\[MINDMAP:\s*[\s\S]*?\s*\]|\[CODE:\s*\w+\s*\|[\s\S]*?\s*\]|\[SLIDES:[\s\S]*?\]|\[PDF:\s*.*?\]|\[DIAGRAM:\s*[^\]|]+\s*\|\s*[^\]]+\]|\[VIDEO:\s*[^\]|]+\s*\|\s*[^\]]+\])/g;

  const parts = content.split(tagsRegex);

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
          const code = part.substring(9, part.length - 1).trim();
          return <MermaidRenderer key={index} code={code} />;
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
                    {isVideoPlaying ? '⏸' : '▶'}
                  </button>
                  <div style={{ position: 'absolute', bottom: '8px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', color: '#fff' }}>
                    {isVideoPlaying ? `🔊 播音中...` : `🔊 播放微课: ${subTitle}`}
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

        // Otherwise render as regular text chunk
        const showCursorHere = isStreaming && index === lastVisibleTextIndex;
        return (
          <div key={index} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {part}
            {showCursorHere && (
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
        </form>
      </section>
    </div>
  );
}
