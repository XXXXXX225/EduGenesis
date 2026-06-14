import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

export default function InteractiveChatBubble({ msg, handleSlideSpeech, stopSlideSpeech }) {
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

  const diagramRegex = /\[DIAGRAM:\s*([^\]|]+)\s*\|\s*([^\]]+)\]/g;
  const videoRegex = /\[VIDEO:\s*([^\]|]+)\s*\|\s*([^\]]+)\]/g;

  const diagramMatch = [...content.matchAll(diagramRegex)][0];
  const videoMatch = [...content.matchAll(videoRegex)][0];

  const cleanText = content
    .replace(diagramRegex, '')
    .replace(videoRegex, '')
    .trim();

  const textElement = cleanText ? (
    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{cleanText}</div>
  ) : null;

  let diagramCard = null;
  if (diagramMatch) {
    const stepsStr = diagramMatch[1].trim();
    const detailsStr = diagramMatch[2].trim();

    const steps = stepsStr.split('->').map((step) => step.trim());
    const detailsMap = {};

    steps.forEach((step) => {
      const escapeStep = step.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`${escapeStep}\\s*:\\s*([^\\n.]+)(?:\\.|\\n|$)`, 'i');
      const match = detailsStr.match(regex);
      detailsMap[step] = match ? match[1].trim() : '点击查看此步骤的学术详情。';
    });

    const activeStepName = steps[selectedStep] || steps[0];
    const activeStepDetail = detailsMap[activeStepName];

    diagramCard = (
      <div
        className="multimodal-card"
        style={{
          marginTop: '14px',
          background: 'var(--bg-modal-content, rgba(9, 13, 22, 0.7))',
          border: '1px solid var(--border-neon)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-neon)' }} className="pulse-glow" />
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '0.05em' }}>互动拓扑知识链</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          {steps.map((step, idx) => {
            const isActive = idx === selectedStep;
            return (
              <React.Fragment key={idx}>
                <button
                  onClick={() => setSelectedStep(idx)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                    background: isActive ? 'var(--primary-neon)' : 'rgba(255,255,255,0.04)',
                    color: isActive ? '#000000' : 'var(--text-muted)',
                    border: isActive ? '1px solid var(--primary-neon)' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isActive ? '0 0 12px rgba(15, 118, 110, 0.4)' : 'none'
                  }}
                >
                  {step}
                </button>
                {idx < steps.length - 1 && (
                  <span style={{ color: 'var(--text-muted)', opacity: 0.3, fontSize: '12px', fontWeight: '800' }}>→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '12.5px',
            color: 'var(--text-muted)',
            lineHeight: '1.6',
            minHeight: '44px',
            transition: 'all 0.2s'
          }}
        >
          <strong style={{ color: 'var(--primary-neon)', display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase' }}>
            {activeStepName} 详情：
          </strong>
          {activeStepDetail}
        </div>
      </div>
    );
  }

  let videoCard = null;
  if (videoMatch) {
    const videoTitle = videoMatch[1].trim();
    const videoDesc = videoMatch[2].trim();

    const togglePlayVideo = () => {
      if (isVideoPlaying) {
        stopSlideSpeech();
        setIsVideoPlaying(false);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        setVideoProgress(0);
      } else {
        handleSlideSpeech(videoDesc);
        setIsVideoPlaying(true);
        setVideoProgress(0);

        const duration = 12000;
        const stepTime = 100;
        let elapsed = 0;

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }

        progressIntervalRef.current = setInterval(() => {
          elapsed += stepTime;
          const ratio = Math.min(100, (elapsed / duration) * 100);
          setVideoProgress(ratio);
          if (ratio >= 100) {
            clearInterval(progressIntervalRef.current);
            setIsVideoPlaying(false);
            setVideoProgress(0);
          }
        }, stepTime);
      }
    };

    videoCard = (
      <div
        className="multimodal-card"
        style={{
          marginTop: '14px',
          background: 'var(--bg-modal-content, rgba(9, 13, 22, 0.7))',
          border: '1px solid var(--border-neon)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} className="pulse-glow" />
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '0.05em' }}>
              多模态微视频课程
            </span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            PCM / MP3 讯飞合成中
          </span>
        </div>

        <div
          style={{
            position: 'relative',
            background: '#04060a',
            height: '140px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
          }}
        >
          {isVideoPlaying ? (
            <div style={{ zIndex: 1, padding: '14px', textAlign: 'center', maxWidth: '85%' }}>
              <p style={{ fontSize: '12px', color: '#ffffff', lineHeight: '1.5', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                {videoDesc.length > 70 ? `${videoDesc.slice(0, 67)}...` : videoDesc}
              </p>
            </div>
          ) : (
            <div style={{ zIndex: 1, textAlign: 'center' }}>
              <h5 style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>{videoTitle}</h5>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>自适应学术讲解微课</p>
            </div>
          )}

          {isVideoPlaying && (
            <div style={{ display: 'flex', gap: '3px', position: 'absolute', bottom: '12px', zIndex: 1 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                <div
                  key={idx}
                  style={{
                    width: '2px',
                    height: '12px',
                    background: 'var(--primary-neon)',
                    borderRadius: '1px',
                    animation: 'bounceWave 0.6s infinite alternate ease-in-out',
                    animationDelay: `${idx * 0.08}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
          <button
            onClick={togglePlayVideo}
            style={{
              background: isVideoPlaying ? 'rgba(239, 68, 68, 0.12)' : 'rgba(15, 118, 110, 0.12)',
              border: isVideoPlaying ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--primary-neon)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              color: isVideoPlaying ? '#ef4444' : 'var(--primary-neon)',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
          >
            {isVideoPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '2px' }} />}
          </button>

          <div style={{ flexGrow: 1, background: 'rgba(255,255,255,0.06)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${videoProgress}%`,
                background: 'var(--primary-neon)',
                height: '100%',
                transition: 'width 0.1s linear',
                boxShadow: '0 0 8px var(--primary-neon)'
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {textElement}
      {diagramCard}
      {videoCard}
    </div>
  );
}
