import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, MessageSquare, Send, Sparkles, BookOpen, Zap, AlertTriangle } from 'lucide-react';
import { apiSSEStream } from '../../utils/api';
import { useAppContext } from '../../context/AppContext';
import QuizCard from '../chat/QuizCard';
import MermaidRenderer from '../chat/MermaidRenderer';
import CodeSandboxCard from '../chat/CodeSandboxCard';

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

const tagsRegex = /(\[QUIZ:\s*\{[\s\S]*?\}\s*\]|\[MINDMAP:\s*(?:[\s\S]*?\n\s*\]|[^\]]*?\])|\[CODE:\s*\w+\s*\|(?:[\s\S]*?\n\s*\]|[^\]]*?\]))/g;

function TutorChatMessage({ content, isStreaming }) {
  if (!content) return null;
  const parts = content.split(tagsRegex);
  
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <style>{`
        @keyframes blinkCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('[QUIZ:') && part.endsWith(']')) {
          try {
            const jsonStr = part.substring(6, part.length - 1).trim();
            const quizData = JSON.parse(jsonStr);
            return <QuizCard key={index} quizData={quizData} />;
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

        if (part.startsWith('[') && !part.endsWith(']')) {
          return null; // Skip rendering partial tag code while streaming
        }

        const { cleanText, pendingTag } = parseIncompleteTags(part);
        const showCursorHere = isStreaming && index === lastVisibleTextIndex;

        return (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cleanText && (
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', wordBreak: 'break-word' }}>
                {cleanText}
                {showCursorHere && !pendingTag && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '12px',
                      background: '#2dd4bf',
                      marginLeft: '2px',
                      verticalAlign: 'text-bottom',
                      animation: 'blinkCursor 0.8s step-end infinite',
                      borderRadius: '1px',
                      boxShadow: '0 0 6px #2dd4bf',
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
                  padding: '8px 12px', 
                  background: 'rgba(45, 212, 191, 0.05)', 
                  border: '1px dashed #2dd4bf', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  fontSize: '11px',
                  color: '#2dd4bf',
                  animation: 'fadeIn 0.25s ease-out'
                }}
              >
                <div 
                  className="spinner-academic" 
                  style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderWidth: '1.5px', 
                    borderColor: '#2dd4bf transparent #2dd4bf transparent',
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
    </div>
  );
}

export default function PDFModal({ isOpen, onClose, pdfContent, nodeTitle }) {
  const { showCustomAlert } = useAppContext();
  const [showTutor, setShowTutor] = useState(false);
  const [tutorMessages, setTutorMessages] = useState([]);
  const [tutorInput, setTutorInput] = useState('');
  const [isTutorStreaming, setIsTutorStreaming] = useState(false);
  const [tutorStatus, setTutorStatus] = useState('');

  const chatEndRef = useRef(null);

  // Initialize tutor chat welcome message when modal opens
  useEffect(() => {
    if (isOpen) {
      setTutorMessages([
        {
          role: 'assistant',
          content: `您好！我是您的自适应学术导师。正在陪同您学习《${nodeTitle || '当前章节'}讲解课本》。\n\n如果在阅读过程中有任何学术盲点或疑问，欢迎直接向我提问，也可以**在左侧选中相应文字**并点击『导入选中文本』进行定向释疑！`
        }
      ]);
      setTutorInput('');
      setIsTutorStreaming(false);
      setTutorStatus('');
    }
  }, [isOpen, nodeTitle]);

  // Smooth scroll chat list to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tutorMessages]);

  if (!isOpen || !pdfContent) return null;

  const handleSendQuestion = async (textToSend) => {
    const promptText = textToSend || tutorInput;
    if (!promptText.trim() || isTutorStreaming) return;

    if (!textToSend) setTutorInput('');

    const userMsg = { role: 'user', content: promptText };
    const nextMessages = [...tutorMessages, userMsg];
    setTutorMessages(nextMessages);
    setIsTutorStreaming(true);
    setTutorStatus('[主管智能体] 正在分派问答任务...');

    // Placeholder for assistant stream content
    const assistantPlaceholder = { role: 'assistant', content: '' };
    setTutorMessages(prev => [...prev, assistantPlaceholder]);

    let activeContent = '';

    try {
      // Assemble instructions with the textbook context to prevent AI hallucinations
      const systemMsg = {
        role: 'system',
        content: `You are the Personal Tutor Agent in an adaptive tutoring network. The student is currently reading a PDF textbook titled "${nodeTitle}". The textbook text is:
---
${pdfContent}
---
Provide a friendly, encouraging, and academically accurate explanation to the student's question. Format math formulas and codes clearly. Keep the response concise and write in Chinese.`
      };

      await apiSSEStream('/chat', {
        messages: [systemMsg, ...nextMessages]
      }, (chunk) => {
        if (chunk.type === 'status') {
          setTutorStatus(chunk.status);
        } else if (chunk.type === 'content') {
          if (chunk.content !== null && chunk.content !== undefined) {
            activeContent += chunk.content;
            setTutorMessages(prev => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: 'assistant', content: activeContent };
              return copy;
            });
          }
        } else if (chunk.type === 'done') {
          setIsTutorStreaming(false);
          setTutorStatus('');
        }
      });
    } catch (err) {
      console.error('Tutor chat failed:', err);
      setTutorStatus(`[接口异常]: ${err.message}`);
      setIsTutorStreaming(false);
    }
  };

  const handleImportSelection = async () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      setTutorInput(prev => prev + (prev ? '\n' : '') + `关于这段课本文字：\n"${selectedText}"\n我想请问：`);
    } else {
      await showCustomAlert('智能提示：请先用鼠标在左侧课本中框选需要提问的段落文字，然后再点击本按钮导入！');
    }
  };

  const lastAssistantIdx = (() => {
    for (let i = tutorMessages.length - 1; i >= 0; i--) {
      if (tutorMessages[i].role !== 'user') return i;
    }
    return -1;
  })();

  return (
    <div className="modal-backdrop">
      <div
        className="modal-content"
        style={{
          maxWidth: showTutor ? '1120px' : '800px',
          height: '85vh',
          borderRadius: '16px',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={modalHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
              《{nodeTitle || "Python Basics"}》讲解课本
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Tutor Toggle Button */}
            <button
              onClick={() => setShowTutor(!showTutor)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '10px',
                background: showTutor ? 'rgba(15, 118, 110, 0.12)' : 'rgba(0,0,0,0.03)',
                border: showTutor ? '1px solid var(--primary-neon)' : '1px solid rgba(0,0,0,0.08)',
                color: showTutor ? 'var(--primary-neon)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <MessageSquare size={14} />
              {showTutor ? '关闭智能辅导' : '唤醒 AI 导师即时答疑'}
            </button>

            <button onClick={onClose} style={modalCloseButtonStyle}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Workspace */}
        <div className="pdf-modal-workspace" style={{ display: 'flex', gap: '20px', flexGrow: 1, overflow: 'hidden', padding: '16px 0' }}>
          
          {/* Left Column: PDF Text Reader */}
          <div
            className={`pdf-modal-reader ${showTutor ? 'with-tutor' : ''}`}
            style={{
              flex: showTutor ? '0 0 calc(58% - 10px)' : '1 1 100%',
              overflowY: 'auto',
              paddingRight: '12px',
              background: 'var(--bg-pdf-reader)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.04)',
              padding: '24px',
              color: 'var(--text-main)',
              transition: 'flex 0.3s ease-in-out'
            }}
          >
            {parseMarkdownToReact(pdfContent)}
          </div>

          {/* Right Column: AI Tutor Chat Panel */}
          {showTutor && (
            <div
              className="pdf-modal-tutor"
              style={{
                flex: '0 0 calc(42% - 10px)',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(15, 118, 110, 0.2)',
                borderRadius: '12px',
                background: '#090d16',
                padding: '16px',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)',
                animation: 'fadeIn 0.25s ease-out'
              }}
            >
               {/* Panel Header */}
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginBottom: '12px' }}>
                 <span style={{ fontSize: '12.5px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-neon)' }}>
                   <Sparkles size={14} /> 智能答疑空间 (Instant Tutor)
                 </span>
                 <button
                   onClick={handleImportSelection}
                   style={{
                     fontSize: '10px',
                     fontWeight: '700',
                     color: '#38bdf8',
                     background: 'rgba(56, 189, 248, 0.08)',
                     border: '1px dashed rgba(56, 189, 248, 0.3)',
                     borderRadius: '6px',
                     padding: '4px 8px',
                     cursor: 'pointer'
                   }}
                   title="选中左侧课本中的段落后点击导入"
                 >
                   导入选中文本
                 </button>
               </div>
 
               {/* Chat Message Scroll List */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flexGrow: 1, paddingRight: '4px', marginBottom: '12px' }}>
                 {tutorMessages.map((msg, index) => {
                   const isUser = msg.role === 'user';
                   return (
                     <div
                       key={index}
                       style={{
                         padding: '10px 14px',
                         borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                         background: isUser ? 'rgba(15, 118, 110, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                         border: isUser ? '1px solid rgba(15, 118, 110, 0.25)' : '1px solid rgba(255,255,255,0.05)',
                         alignSelf: isUser ? 'flex-end' : 'flex-start',
                         maxWidth: '90%',
                         fontSize: '12.5px',
                         lineHeight: '1.6',
                         color: isUser ? '#ffffff' : 'rgba(255,255,255,0.95)',
                         whiteSpace: 'pre-wrap',
                         wordBreak: 'break-word'
                       }}
                     >
                       {isUser ? (
                         msg.content
                       ) : (
                         <TutorChatMessage 
                           content={msg.content} 
                           isStreaming={index === lastAssistantIdx && isTutorStreaming} 
                         />
                       )}
                     </div>
                   );
                 })}
                 <div ref={chatEndRef} />
               </div>
 
               {/* Streaming Status Cues */}
               {tutorStatus && (
                 <div style={{ fontSize: '11px', color: '#2dd4bf', textAlign: 'center', marginBottom: '8px', opacity: 1, fontFamily: 'monospace' }}>
                   {tutorStatus}
                 </div>
               )}
 
               {/* Quick Prompt Shortcuts */}
               <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleSendQuestion(`请帮我用一句话概括这节课本《${nodeTitle}》的核心骨架与学习难点。`)}
                    disabled={isTutorStreaming}
                    className="tutor-shortcut-btn"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Zap size={12} className="text-secondary-neon" /> 核心梗概
                  </button>
                  <button
                    onClick={() => handleSendQuestion("在这章内容中，最容易让初学者踩坑或报错的编码模式是哪些？")}
                    disabled={isTutorStreaming}
                    className="tutor-shortcut-btn"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <AlertTriangle size={12} className="text-amber-500" /> 常见避坑点
                  </button>
               </div>
 
               {/* Chat Send Input Box */}
               <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                 <textarea
                   value={tutorInput}
                   onChange={(e) => setTutorInput(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       handleSendQuestion();
                     }
                   }}
                   placeholder="输入您对于本章节的问题 (回车发送)..."
                   disabled={isTutorStreaming}
                   className="tutor-textarea"
                   style={{
                     flexGrow: 1,
                     height: '42px',
                     background: 'rgba(0,0,0,0.25)',
                     border: '1px solid rgba(255,255,255,0.08)',
                     borderRadius: '8px',
                     padding: '10px 12px',
                     color: '#ffffff',
                     fontSize: '12.5px',
                     resize: 'none',
                     outline: 'none',
                     fontFamily: 'inherit'
                   }}
                 />
                 <button
                   onClick={() => handleSendQuestion()}
                   disabled={isTutorStreaming || !tutorInput.trim()}
                   className="tutor-send-btn"
                   style={{
                     padding: '10px',
                     background: 'var(--primary)',
                     border: 'none',
                     borderRadius: '8px',
                     color: '#ffffff',
                     cursor: 'pointer',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     opacity: isTutorStreaming || !tutorInput.trim() ? 0.4 : 1,
                     transition: 'all 0.2s'
                   }}
                 >
                   <Send size={15} style={{ stroke: '#ffffff', color: '#ffffff' }} />
                 </button>
               </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-neon)' }}>
          <button className="cyber-btn" onClick={onClose} style={{ padding: '8px 20px', fontSize: '12px' }}>
            完成阅读
          </button>
        </div>
      </div>
    </div>
  );
}
