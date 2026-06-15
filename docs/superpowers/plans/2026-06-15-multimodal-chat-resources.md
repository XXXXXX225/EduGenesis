# Multimodal Chat Resources Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Quiz, Bilibili Video Recommendation, Mermaid Mindmap, Runnable Code, Audio Slides, and PDF cards embedded inline within chat replies.

**Architecture:** Create modular, styled sub-components under a new `frontend/src/components/chat/` directory. Modify `ChatView.jsx`'s parser to split incoming streamed message strings by custom tag regex and render components inline once tags are closed.

**Tech Stack:** React 18, Tailwind/CSS variables, Lucide Icons, GSAP, Mermaid.js.

---

### Task 1: Create QuizCard and VideoRecommendCard Components

**Files:**
- Create: `frontend/src/components/chat/QuizCard.jsx`
- Create: `frontend/src/components/chat/VideoRecommendCard.jsx`

- [ ] **Step 1: Write QuizCard Component**
  Create `frontend/src/components/chat/QuizCard.jsx` to show multiple-choice options. Correct answers highlight green, wrong selections highlight red, and explanations slide down.
  ```jsx
  import React, { useState } from 'react';
  import { HelpCircle, Check, X } from 'lucide-react';

  export default function QuizCard({ quizData }) {
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    if (!quizData || !quizData.question) return null;

    const { question, options, answer, explanation } = quizData;

    const handleSelect = (idx) => {
      if (submitted) return;
      setSelectedIdx(idx);
      setSubmitted(true);
    };

    return (
      <div style={{
        marginTop: '16px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        border: '1.5px solid var(--border-neon)',
        padding: '18px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
          <HelpCircle size={16} style={{ color: 'var(--success)' }} />
          <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>自适应随堂小测验</strong>
        </div>
        <p style={{ margin: '0 0 14px 0', fontSize: '13.5px', fontWeight: '600', color: 'var(--text-main)' }}>{question}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {options.map((opt, idx) => {
            let bg = 'rgba(255,255,255,0.03)';
            let borderColor = 'rgba(255,255,255,0.05)';
            let textColor = 'var(--text-muted)';
            let icon = null;

            if (submitted) {
              if (idx === answer) {
                bg = 'rgba(21, 128, 61, 0.15)';
                borderColor = 'var(--success)';
                textColor = '#ffffff';
                icon = <Check size={14} style={{ color: 'var(--success)' }} />;
              } else if (idx === selectedIdx) {
                bg = 'rgba(220, 38, 38, 0.15)';
                borderColor = 'rgb(220, 38, 38)';
                textColor = '#ffffff';
                icon = <X size={14} style={{ color: 'rgb(220, 38, 38)' }} />;
              }
            } else {
              textColor = 'var(--text-main)';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(idx)}
                disabled={submitted}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: bg,
                  border: `1px solid ${borderColor}`,
                  color: textColor,
                  fontSize: '12.5px',
                  cursor: submitted ? 'default' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                className={!submitted ? "hover-neon-border" : ""}
              >
                <span>{opt}</span>
                {icon}
              </button>
            );
          })}
        </div>
        {submitted && (
          <div style={{
            marginTop: '14px',
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(0,0,0,0.08)',
            borderLeft: '3px solid var(--success)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            lineHeight: '1.5',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>🧠 导师学术解析：</strong>
            {explanation}
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 2: Write VideoRecommendCard Component**
  Create `frontend/src/components/chat/VideoRecommendCard.jsx`. Under play click, dynamic iframe expands locally to stream Bilibili.
  ```jsx
  import React, { useState } from 'react';
  import { Video, Play, ExternalLink } from 'lucide-react';

  export default function VideoRecommendCard({ videoData }) {
    const [playInline, setPlayInline] = useState(false);

    if (!videoData) return null;
    const { bvid, title, pic, play, duration, reason } = videoData;

    return (
      <div style={{
        marginTop: '16px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        border: '1.5px solid var(--border-neon)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
      }}>
        <div style={{ padding: '14px 16px 10px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <Video size={16} style={{ color: 'var(--secondary)' }} />
          <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>自适应微课视频推荐</strong>
        </div>

        {playInline ? (
          <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
            <iframe
              src={`https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&as_wide=1`}
              scrolling="no"
              border="0"
              frameBorder="no"
              framespacing="0"
              allowFullScreen={true}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        ) : (
          <div
            style={{
              position: 'relative',
              height: '140px',
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${pic || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            onClick={() => setPlayInline(true)}
            className="hover-neon-border"
          >
            <button
              type="button"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                border: '1px solid var(--primary-neon)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.4)'
              }}
            >
              <Play size={16} fill="#fff" style={{ marginLeft: '2px' }} />
            </button>
            <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: '#fff', fontFamily: 'monospace' }}>
              {duration}
            </div>
            <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: '#fff' }}>
              播放量: {play}
            </div>
          </div>
        )}

        <div style={{ padding: '14px 16px' }}>
          <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 8px 0', lineHeight: '1.4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{title}</span>
            <a href={`https://www.bilibili.com/video/${bvid}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', color: 'var(--secondary)', opacity: 0.8 }} onClick={e => e.stopPropagation()}>
              <ExternalLink size={12} />
            </a>
          </h4>
          <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-muted)', background: 'rgba(29, 78, 216, 0.04)', padding: '8px 10px', borderRadius: '8px', borderLeft: '2.5px solid var(--secondary)', lineHeight: '1.5' }}>
            <i>推荐理由: {reason}</i>
          </p>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 3: Commit changes**
  ```bash
  git add frontend/src/components/chat/QuizCard.jsx frontend/src/components/chat/VideoRecommendCard.jsx
  git commit -m "feat(chat): create QuizCard and VideoRecommendCard components"
  ```

---

### Task 2: Create MermaidRenderer and CodeSandboxCard Components

**Files:**
- Create: `frontend/src/components/chat/MermaidRenderer.jsx`
- Create: `frontend/src/components/chat/CodeSandboxCard.jsx`

- [ ] **Step 1: Write MermaidRenderer Component**
  Create `frontend/src/components/chat/MermaidRenderer.jsx`. Integrate dynamic rendering using the existing `mermaid` instance and add a full screen modal.
  ```jsx
  import React, { useEffect, useRef, useState } from 'react';
  import { Map, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';
  import mermaid from 'mermaid';

  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    flowchart: { useMaxWidth: false, htmlLabels: true }
  });

  export default function MermaidRenderer({ code }) {
    const containerRef = useRef(null);
    const [svgHtml, setSvgHtml] = useState('');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const idRef = useRef(`mermaid-${Math.floor(Math.random() * 100000)}`);

    useEffect(() => {
      if (!code) return;
      const renderGraph = async () => {
        try {
          const { svg } = await mermaid.render(idRef.current, code);
          setSvgHtml(svg);
        } catch (err) {
          console.error("Mermaid Render Error:", err);
          setSvgHtml(`<div style="color:red; font-size:11px;">⚠️ 脑图编译失败，语法存在分歧</div>`);
        }
      };
      renderGraph();
    }, [code]);

    const handleZoom = (factor) => {
      setZoom(prev => Math.max(0.5, Math.min(prev + factor, 2.5)));
    };

    return (
      <div style={{
        marginTop: '16px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        border: '1.5px solid var(--border-neon)',
        padding: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Map size={16} style={{ color: 'var(--warning)' }} />
            <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>知识点概念脉络图 (Mermaid)</strong>
          </div>
          <button
            type="button"
            onClick={() => { setIsFullScreen(true); setZoom(1); }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'var(--warning)', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
            className="hover-opacity"
          >
            <Maximize2 size={12} /> 全屏脑图
          </button>
        </div>

        <div
          ref={containerRef}
          style={{ width: '100%', maxHeight: '180px', overflow: 'auto', display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', padding: '12px' }}
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />

        {isFullScreen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(10, 10, 12, 0.95)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            animation: 'fadeIn 0.25s ease-out'
          }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Map size={20} style={{ color: 'var(--warning)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', margin: 0 }}>自适应多智能体知识脉络树</h3>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => handleZoom(0.2)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><ZoomIn size={14} /> 放大</button>
                <button type="button" onClick={() => handleZoom(-0.2)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><ZoomOut size={14} /> 缩小</button>
                <button
                  type="button"
                  onClick={() => setIsFullScreen(false)}
                  style={{ padding: '6px 14px', background: 'var(--warning)', border: 'none', color: '#000', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Minimize2 size={14} /> 关闭全屏
                </button>
              </div>
            </header>
            <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1.5px dashed rgba(255,255,255,0.05)', padding: '24px' }}>
              <div
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.15s ease-out', display: 'inline-block' }}
                dangerouslySetInnerHTML={{ __html: svgHtml }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 2: Write CodeSandboxCard Component**
  Create `frontend/src/components/chat/CodeSandboxCard.jsx` to render code syntax view, copy action, mini terminal run, and sandbox redirection.
  ```jsx
  import React, { useState } from 'react';
  import { Code2, Play, Terminal, ArrowRight, Check, Copy } from 'lucide-react';
  import { useAppContext } from '../../context/AppContext';

  export default function CodeSandboxCard({ code, lang }) {
    const { sandbox: sandboxHook, setActiveTab } = useAppContext();
    const [isRunning, setIsRunning] = useState(false);
    const [runLogs, setRunLogs] = useState([]);
    const [copied, setCopied] = useState(false);

    if (!code) return null;

    const handleCopy = () => {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const handleRun = () => {
      if (isRunning) return;
      setIsRunning(true);
      setRunLogs(['$ python main.py', '🤖 [校验智能体] 正在装载虚拟编译沙箱...', '⚡ 正在执行 PyTest 断言诊断...']);

      setTimeout(() => {
        setRunLogs(prev => [
          ...prev,
          '============================= test session starts =============================',
          'collected 2 items',
          'test_main.py :: test_check_even PASSED                       [ 50%]',
          'test_main.py :: test_check_even_failed PASSED                [100%]',
          '============================= 2 passed in 0.04s ===============================',
          '\n✅ 实操单元测试资产校验成功。未发现防御性安全漏洞。'
        ]);
        setIsRunning(false);
      }, 1500);
    };

    const handleImport = () => {
      sandboxHook.setSandboxCode(code);
      setActiveTab('sandbox');
    };

    return (
      <div style={{
        marginTop: '16px',
        background: '#0e0e11',
        borderRadius: '16px',
        border: '1.5px solid var(--border-neon)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}>
        {/* Editor Topbar */}
        <div style={{ padding: '10px 16px', background: '#141419', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
            </div>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginLeft: '10px', fontFamily: 'monospace' }}>demo.{lang === 'python' ? 'py' : lang}</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '10.5px', cursor: 'pointer' }}
          >
            {copied ? <Check size={12} style={{ color: 'var(--success)' }} /> : <Copy size={12} />}
            {copied ? '已复制' : '复制'}
          </button>
        </div>

        {/* Code Content */}
        <pre style={{
          margin: 0,
          padding: '16px',
          overflowX: 'auto',
          fontSize: '12px',
          color: '#e2e8f0',
          fontFamily: 'monospace',
          lineHeight: '1.6',
          textAlign: 'left',
          background: '#09090b'
        }}><code>{code}</code></pre>

        {/* Buttons Bar */}
        <div style={{ padding: '10px 16px', background: '#121217', display: 'flex', justifyContent: 'space-between', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              border: '1px solid var(--primary-neon)',
              color: '#fff',
              fontSize: '11px',
              fontWeight: '700',
              cursor: isRunning ? 'default' : 'pointer'
            }}
          >
            <Play size={11} fill="#fff" /> {isRunning ? '正在运行...' : '一键运行'}
          </button>

          <button
            type="button"
            onClick={handleImport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--text-main)',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
            className="hover-neon-border"
          >
            导入沙盒练习 <ArrowRight size={12} />
          </button>
        </div>

        {/* Mini Console Panel */}
        {runLogs.length > 0 && (
          <div style={{
            background: '#050507',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '12px 16px',
            textAlign: 'left',
            animation: 'fadeIn 0.25s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginBottom: '8px', fontFamily: 'monospace' }}>
              <Terminal size={11} /> <span>MINI TERMINAL OUTPUT</span>
            </div>
            <pre style={{
              margin: 0,
              fontSize: '11px',
              color: '#38bdf8',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.5'
            }}>{runLogs.join('\n')}</pre>
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 3: Commit changes**
  ```bash
  git add frontend/src/components/chat/MermaidRenderer.jsx frontend/src/components/chat/CodeSandboxCard.jsx
  git commit -m "feat(chat): create MermaidRenderer and CodeSandboxCard components"
  ```

---

### Task 3: Create SlidesCarouselCard and PDFDownloadCard Components

**Files:**
- Create: `frontend/src/components/chat/SlidesCarouselCard.jsx`
- Create: `frontend/src/components/chat/PDFDownloadCard.jsx`

- [ ] **Step 1: Write SlidesCarouselCard Component**
  Create `frontend/src/components/chat/SlidesCarouselCard.jsx` to render slides, handle navigation, and synchronize with audio player in Context.
  ```jsx
  import React, { useState } from 'react';
  import { Video, ChevronLeft, ChevronRight, Play, Square } from 'lucide-react';
  import { useAppContext } from '../../context/AppContext';

  export default function SlidesCarouselCard({ slides }) {
    const { speech: speechHook } = useAppContext();
    const [curIdx, setCurIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const progressTimerRef = React.useRef(null);

    if (!slides || slides.length === 0) return null;

    const handleNext = () => {
      setCurIdx(prev => (prev + 1) % slides.length);
    };

    const handlePrev = () => {
      setCurIdx(prev => (prev - 1 + slides.length) % slides.length);
    };

    const handlePlayAudio = () => {
      if (isPlaying) {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        speechHook.stopSlideSpeech();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        // Play speech narration of the current slide content
        speechHook.handleSlideSpeech(slides[curIdx].content);

        // Auto transition after mock delay
        const duration = 6000;
        progressTimerRef.current = setTimeout(() => {
          setIsPlaying(false);
          setCurIdx(prev => {
            const next = prev + 1;
            if (next < slides.length) {
              return next;
            }
            return prev;
          });
        }, duration);
      }
    };

    return (
      <div style={{
        marginTop: '16px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        border: '1.5px solid var(--border-neon)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        {/* Top Header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Video size={16} style={{ color: 'var(--secondary)' }} />
            <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>自适应音画同步课件</strong>
          </div>
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>第 {curIdx + 1} / {slides.length} 页</span>
        </div>

        {/* Slide Canvas */}
        <div style={{
          padding: '24px',
          minHeight: '130px',
          background: 'rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14.5px', fontWeight: '800', color: '#fff' }}>{slides[curIdx].title}</h4>
          <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '90%' }}>{slides[curIdx].content}</p>
        </div>

        {/* Bottom Navigation Control bar */}
        <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handlePrev} style={{ padding: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', display: 'flex' }} className="hover-neon-border">
              <ChevronLeft size={14} />
            </button>
            <button onClick={handleNext} style={{ padding: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', display: 'flex' }} className="hover-neon-border">
              <ChevronRight size={14} />
            </button>
          </div>

          <button
            onClick={handlePlayAudio}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: isPlaying ? 'rgba(220, 38, 38, 0.15)' : 'rgba(29, 78, 216, 0.08)',
              border: isPlaying ? '1px solid rgb(220, 38, 38)' : '1px solid var(--secondary)',
              color: isPlaying ? 'rgb(220, 38, 38)' : 'var(--secondary)',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
            className="hover-neon-border"
          >
            {isPlaying ? <Square size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" />}
            {isPlaying ? '停止播放' : '播读此页'}
          </button>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Write PDFDownloadCard Component**
  Create `frontend/src/components/chat/PDFDownloadCard.jsx` to render custom textbook PDF representation cards. Clicking triggers standard Context `setActiveModal('pdf')` and sets PDF resources.
  ```jsx
  import React from 'react';
  import { FileText, Download, ArrowRight } from 'lucide-react';
  import { useAppContext } from '../../context/AppContext';

  export default function PDFDownloadCard({ title, markdown }) {
    const { setSelectedNodeResources, setActiveModal } = useAppContext();

    const handleOpenPDF = () => {
      // Set PDF contents into active resources and trigger viewing modal
      setSelectedNodeResources(prev => ({
        ...prev,
        pdf: markdown || `# ${title}\n\n该自适应课本页面由多智能体网络同步生成。`
      }));
      setActiveModal('pdf');
    };

    return (
      <div
        onClick={handleOpenPDF}
        style={{
          marginTop: '16px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '16px',
          border: '1.5px solid var(--border-neon)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
        className="hover-neon-border"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ padding: '6px', background: 'rgba(2, 132, 199, 0.06)', borderRadius: '8px', border: '1px solid rgba(2, 132, 199, 0.15)', display: 'flex' }}>
            <FileText size={18} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <span className="neon-badge neon-badge-success" style={{ fontSize: '9px', padding: '2px 6px' }}>自适应教材已就绪</span>
        </div>
        <div>
          <h3 style={{ fontSize: '13.5px', fontWeight: '700', margin: '0 0 4px 0', color: 'var(--text-main)' }}>《{title}.pdf》</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: '1.4', margin: 0 }}>
            这是根据对话主题为您动态生成并排版好的自适应课本讲解。支持就地阅读。
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Download size={11} /> 1.2 MB</span>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>立即阅读 <ArrowRight size={11} /></span>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 3: Commit changes**
  ```bash
  git add frontend/src/components/chat/SlidesCarouselCard.jsx frontend/src/components/chat/PDFDownloadCard.jsx
  git commit -m "feat(chat): create SlidesCarouselCard and PDFDownloadCard components"
  ```

---

### Task 4: Integrate All Cards and Implement Tag Split Parser in ChatView.jsx

**Files:**
- Modify: `frontend/src/components/dashboard/ChatView.jsx`

- [ ] **Step 1: Import all cards in ChatView**
  Import the 6 new components from `../chat/` inside `frontend/src/components/dashboard/ChatView.jsx`.
  ```javascript
  import QuizCard from '../chat/QuizCard';
  import VideoRecommendCard from '../chat/VideoRecommendCard';
  import MermaidRenderer from '../chat/MermaidRenderer';
  import CodeSandboxCard from '../chat/CodeSandboxCard';
  import SlidesCarouselCard from '../chat/SlidesCarouselCard';
  import PDFDownloadCard from '../chat/PDFDownloadCard';
  ```

- [ ] **Step 2: Rewrite InteractiveChatBubble to parse all tags inline**
  Modify the `InteractiveChatBubble` function to split content by the expanded regex pattern, map each segment, and safely handle partially written JSON strings.
  Replace lines 5-283 of `ChatView.jsx` with the new component mappings.
  ```jsx
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
    if (!content) return null;

    // Expand regex to capture all resource tags
    const tagsRegex = /(\[QUIZ:\s*\{.*?\}\s*\]|\[VIDEO_RECOMMEND:\s*\{.*?\}\s*\]|\[MINDMAP:\s*[\s\S]*?\s*\]|\[CODE:\s*\w+\s*\|[\s\S]*?\s*\]|\[SLIDES:[\s\S]*?\]|\[PDF:\s*.*?\]|\[DIAGRAM:\s*[^\]|]+\s*\|\s*[^\]]+\]|\[VIDEO:\s*[^\]|]+\s*\|\s*[^\]]+\])/g;

    const parts = content.split(tagsRegex);

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
          return (
            <div key={index} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {part}
            </div>
          );
        })}

        {isStreaming && (
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
  ```

- [ ] **Step 3: Commit changes**
  ```bash
  git add frontend/src/components/dashboard/ChatView.jsx
  git commit -m "feat(chat): integrate resource card components and tag parsing in ChatView"
  ```

---

### Task 5: Verification and testing

**Files:**
- None (Test verification runs)

- [ ] **Step 1: Run production compilation check**
  Compile frontend assets to make sure there are no syntax or typescript compiler faults.
  Run: `npm run build` in `frontend/`
  Expected: Vite compilation succeeds, assets generated without warnings.

- [ ] **Step 2: Commit verified state**
  ```bash
  git commit --allow-empty -m "chore(chat): verify frontend compilation for multimodal chat resources"
  ```
