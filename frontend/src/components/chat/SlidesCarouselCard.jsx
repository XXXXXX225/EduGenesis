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
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
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
