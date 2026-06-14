import React, { useState, useEffect, useRef } from 'react';
import { X, Video, Play, Pause, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';
import { API_BASE } from '../../utils/api';

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

export default function SlideModal({ isOpen, onClose, slides, nodeTitle }) {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isPlayingSlide, setIsPlayingSlide] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  const slideAudioRef = useRef(null);
  const simIntervalRef = useRef(null);

  const stopSlideSpeech = () => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
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
    setAudioCurrentTime(0);
    setAudioDuration(0);
  };

  const startFallbackProgressSimulation = (text) => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
    }
    const estimatedDuration = Math.max(3, text.length * 0.22);
    setAudioDuration(estimatedDuration);
    setAudioCurrentTime(0);
    
    const startTime = Date.now();
    simIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= estimatedDuration) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
        setAudioCurrentTime(estimatedDuration);
        setIsPlayingSlide(false);
      } else {
        setAudioCurrentTime(elapsed);
      }
    }, 100);
  };

  const fallbackSpeechSynthesis = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.0;
      utterance.onend = () => {
        setIsPlayingSlide(false);
        if (simIntervalRef.current) {
          clearInterval(simIntervalRef.current);
          simIntervalRef.current = null;
        }
        setAudioCurrentTime(audioDuration);
      };
      window.speechSynthesis.speak(utterance);
      startFallbackProgressSimulation(text);
    } else {
      setIsPlayingSlide(false);
    }
  };

  const handleSlideSpeech = (text) => {
    stopSlideSpeech();
    const audioUrl = `${API_BASE}/tts?text=${encodeURIComponent(text)}`;
    const audio = new Audio(audioUrl);
    slideAudioRef.current = audio;

    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration);
    };

    audio.ontimeupdate = () => {
      setAudioCurrentTime(audio.currentTime);
    };

    audio.onended = () => {
      setIsPlayingSlide(false);
      slideAudioRef.current = null;
      setAudioCurrentTime(0);
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

  useEffect(() => {
    if (isOpen && slides) {
      const currentText = slides[currentSlideIdx]?.content || '';
      
      if (isPlayingSlide) {
        handleSlideSpeech(slides[currentSlideIdx]?.title + ". " + currentText);
      } else {
        stopSlideSpeech();
      }

      gsap.fromTo(".slide-content-card",
        { opacity: 0, scale: 0.96, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );

      return () => {
        stopSlideSpeech();
      };
    }
  }, [currentSlideIdx, isPlayingSlide, isOpen, slides]);

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity || seconds === null) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderHighlightedText = (text) => {
    if (!isPlayingSlide || audioDuration === 0) {
      return <span style={{ color: 'rgba(255,255,255,0.75)' }}>{text}</span>;
    }
    const pct = Math.min(1.0, audioCurrentTime / audioDuration);
    const activeLength = Math.floor(pct * text.length);
    const readText = text.substring(0, activeLength);
    const unreadText = text.substring(activeLength);
    return (
      <>
        <span style={{ color: 'var(--primary-neon)', textShadow: '0 0 10px rgba(15, 118, 110, 0.6)', fontWeight: '800' }}>
          {readText}
        </span>
        <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
          {unreadText}
        </span>
      </>
    );
  };

  const handleTimelineClick = (e) => {
    if (audioDuration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercent = clickX / width;
    const newTime = clickPercent * audioDuration;

    if (slideAudioRef.current) {
      slideAudioRef.current.currentTime = newTime;
    }
    setAudioCurrentTime(newTime);
  };

  if (!isOpen || !slides) return null;
  const currentSlide = slides[currentSlideIdx];

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '900px', borderRadius: '16px' }}>
        <div style={modalHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Video size={20} style={{ color: 'var(--secondary)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
              《{nodeTitle || "Python Basics"}》音画同步动画讲解
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {currentSlideIdx + 1} / {slides.length} 页
            </span>
            <button onClick={() => {
              onClose();
              stopSlideSpeech();
              setIsPlayingSlide(false);
            }} style={modalCloseButtonStyle}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Slide Screen */}
        <div
          className="slide-content-card"
          style={{
            background: '#090d16',
            borderRadius: '14px',
            border: '1px solid rgba(15, 118, 110, 0.25)',
            padding: '40px',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)'
          }}
        >
          {/* Ambient moving glow inside slide */}
          <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(15, 118, 110, 0.08) 0%, transparent 70%)', top: '10%', right: '10%', pointerEvents: 'none' }} />

          {/* Title */}
          <h4 style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', marginBottom: '24px', textAlign: 'center', letterSpacing: '-0.02em', zIndex: 1 }}>
            {currentSlide?.title}
          </h4>

          {/* Subtitles & Dynamic Karaoke Highlights */}
          <p style={{ fontSize: '16.5px', lineHeight: '1.8', maxWidth: '640px', textAlign: 'center', minHeight: '80px', zIndex: 1 }}>
            {renderHighlightedText(currentSlide?.content || '')}
          </p>

          {/* Real-time Audio Playback Progress Bar */}
          <div style={{ width: '100%', maxWidth: '640px', marginTop: '24px', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontFamily: 'monospace' }}>
              <span>{formatTime(audioCurrentTime)}</span>
              <span>{formatTime(audioDuration)}</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '4px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '2px',
                cursor: audioDuration > 0 ? 'pointer' : 'default',
                position: 'relative'
              }}
              onClick={handleTimelineClick}
            >
              <div
                style={{
                  width: `${audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--primary-neon) 0%, var(--secondary) 100%)',
                  boxShadow: '0 0 8px var(--primary-neon)',
                  borderRadius: '2px',
                  transition: isPlayingSlide && !simIntervalRef.current ? 'width 0.25s linear' : 'none'
                }}
              />
            </div>
          </div>

          {/* Audio Wave Visualizer */}
          {isPlayingSlide && (
            <div style={{ display: 'flex', gap: '4px', position: 'absolute', bottom: '16px', right: '24px', zIndex: 1 }}>
              {[1, 2, 3, 4, 5].map(idx => (
                <div
                  key={idx}
                  className="wave-bar"
                  style={{
                    width: '2.5px',
                    height: '12px',
                    background: 'var(--secondary)',
                    borderRadius: '1px',
                    animation: `bounceWave 0.6s infinite alternate ease-in-out`,
                    animationDelay: `${idx * 0.1}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Style definition for wave bouncing */}
        <style>{`
          @keyframes bounceWave {
            0% { transform: scaleY(0.4); }
            100% { transform: scaleY(2.2); }
          }
        `}</style>

        {/* Control Panel */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <button
            className="cyber-btn"
            disabled={currentSlideIdx === 0}
            onClick={() => {
              setCurrentSlideIdx(prev => prev - 1);
            }}
            style={{ padding: '8px 16px', fontSize: '12px', opacity: currentSlideIdx === 0 ? 0.4 : 1 }}
          >
            <ChevronRight size={16} style={{ transform: 'rotate(180deg)', marginRight: '6px' }} /> 上一页
          </button>

          <button
            className="cyber-btn"
            style={{
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: '800',
              background: isPlayingSlide ? 'rgba(239, 68, 68, 0.1)' : 'rgba(15, 118, 110, 0.1)',
              borderColor: isPlayingSlide ? 'rgba(239, 68, 68, 0.3)' : 'var(--primary-neon)'
            }}
            onClick={() => {
              if (isPlayingSlide) {
                setIsPlayingSlide(false);
                stopSlideSpeech();
              } else {
                setIsPlayingSlide(true);
              }
            }}
          >
            {isPlayingSlide ? (
              <>
                <Pause size={16} style={{ marginRight: '6px', color: '#ef4444' }} /> 暂停讲解
              </>
            ) : (
              <>
                <Play size={16} style={{ marginRight: '6px', color: 'var(--primary-neon)' }} /> 开启语音讲解
              </>
            )}
          </button>

          <button
            className="cyber-btn"
            disabled={currentSlideIdx === slides.length - 1}
            onClick={() => {
              setCurrentSlideIdx(prev => prev + 1);
            }}
            style={{ padding: '8px 16px', fontSize: '12px', opacity: currentSlideIdx === slides.length - 1 ? 0.4 : 1 }}
          >
            下一页 <ChevronRight size={16} style={{ marginLeft: '6px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
