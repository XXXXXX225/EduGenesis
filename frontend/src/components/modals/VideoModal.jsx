import React, { useState } from 'react';
import { X, Play, Eye, Clock, User, ExternalLink, Sparkles } from 'lucide-react';

export default function VideoModal({ isOpen, onClose, videos, nodeTitle }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!isOpen || !videos || videos.length === 0) return null;

  const currentVideo = videos[activeIdx];

  // 构建 B站 Iframe 播放地址 (B站官方嵌入式播放器)
  // as_wide=1 宽屏，high_quality=1 高清，autoplay=0 不自动播放
  const embedUrl = `https://player.bilibili.com/player.html?bvid=${currentVideo.bvid}&page=1&high_quality=1&as_wide=1&autoplay=0`;

  return (
    <div className="modal-backdrop" style={{ display: 'flex', zIndex: 1100 }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '1000px', 
          width: '95%',
          borderRadius: '16px', 
          padding: '24px',
          background: 'rgba(11, 17, 32, 0.95)',
          border: '1px solid rgba(251, 114, 153, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 0 15px rgba(251, 114, 153, 0.1)',
          color: '#ffffff'
        }}
      >
        {/* Header */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingBottom: '16px', 
          borderBottom: '1px solid rgba(251, 114, 153, 0.2)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              padding: '6px', 
              background: 'rgba(251, 114, 153, 0.15)', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center' 
            }}>
              <Play size={18} style={{ color: '#fb7299' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
              《{nodeTitle || "课程章节"}》精品视频学习中心
            </h3>
          </div>
          <button 
            onClick={() => {
              onClose();
              setActiveIdx(0);
            }} 
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '10px', 
              padding: '6px 14px', 
              color: 'rgba(255,255,255,0.6)', 
              cursor: 'pointer', 
              fontSize: '12px', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(251, 114, 153, 0.2)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
            }}
          >
            <X size={14} /> 关闭
          </button>
        </header>

        {/* Main Body */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.3fr 0.7fr', 
          gap: '24px', 
          minHeight: '400px'
        }}>
          {/* Left Column: Player & Video Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Player Container */}
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              paddingTop: '56.25%', /* 16:9 Aspect Ratio */
              background: '#000000', 
              borderRadius: '12px', 
              overflow: 'hidden',
              border: '1px solid rgba(251, 114, 153, 0.25)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
            }}>
              <iframe
                src={embedUrl}
                scrolling="no"
                border="0"
                frameBorder="no"
                framespacing="0"
                allowFullScreen={true}
                sandbox="allow-top-navigation allow-same-origin allow-scripts allow-forms"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            </div>

            {/* Video Details */}
            <div style={{ padding: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '800', lineHeight: '1.4', color: '#ffffff' }}>
                  {currentVideo.title}
                </h4>
                <a 
                  href={`https://www.bilibili.com/video/${currentVideo.bvid}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: '#fb7299',
                    fontWeight: '700',
                    textDecoration: 'none',
                    padding: '8px 12px',
                    background: 'rgba(251, 114, 153, 0.1)',
                    border: '1px solid rgba(251, 114, 153, 0.2)',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fb7299';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(251, 114, 153, 0.1)';
                    e.currentTarget.style.color = '#fb7299';
                  }}
                >
                  B站观看 <ExternalLink size={12} />
                </a>
              </div>

              {/* Stats Metadata */}
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '16px', 
                marginTop: '10px', 
                fontSize: '13px', 
                color: 'rgba(255,255,255,0.5)' 
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={14} style={{ color: '#fb7299' }} /> {currentVideo.author}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Eye size={14} /> 播放：{currentVideo.play}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> 时长：{currentVideo.duration}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: AI Reason & Alternative Videos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* AI Recommendation Box */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.2) 0%, rgba(251, 114, 153, 0.1) 100%)',
              border: '1px solid rgba(15, 118, 110, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '-10px', 
                right: '-10px', 
                width: '60px', 
                height: '60px', 
                background: 'radial-gradient(circle, rgba(251, 114, 153, 0.1) 0%, transparent 70%)',
                pointerEvents: 'none' 
              }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  color: 'var(--primary-neon)', 
                  fontSize: '12px', 
                  fontWeight: '800', 
                  letterSpacing: '0.05em' 
                }}>
                  <Sparkles size={14} /> 画像智能体推荐
                </span>
                <span style={{ 
                  fontSize: '11px', 
                  background: 'rgba(15, 118, 110, 0.2)', 
                  border: '1px solid rgba(15, 118, 110, 0.4)', 
                  color: 'var(--primary-neon)', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  fontWeight: '700'
                }}>
                  匹配度 98%
                </span>
              </div>
              <p style={{ 
                fontSize: '13px', 
                lineHeight: '1.6', 
                color: 'rgba(255,255,255,0.85)', 
                margin: 0 
              }}>
                {currentVideo.recommend_reason}
              </p>
            </div>

            {/* Video Playlist Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h4 style={{ 
                fontSize: '12px', 
                textTransform: 'uppercase', 
                color: 'rgba(255,255,255,0.4)', 
                letterSpacing: '0.05em',
                marginBottom: '10px',
                fontWeight: '700'
              }}>
                关联学习视频 ({videos.length})
              </h4>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '10px',
                maxHeight: '260px',
                overflowY: 'auto',
                paddingRight: '4px'
              }} className="scrollbar-cyber">
                {videos.map((v, index) => {
                  const isActive = index === activeIdx;
                  return (
                    <div
                      key={v.bvid || index}
                      onClick={() => setActiveIdx(index)}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '10px',
                        background: isActive ? 'rgba(251, 114, 153, 0.12)' : 'rgba(255,255,255,0.02)',
                        border: isActive ? '1px solid #fb7299' : '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      }}
                    >
                      {/* Image Thumbnail Mock */}
                      <div style={{ 
                        width: '90px', 
                        height: '56px', 
                        background: '#1a1f2c',
                        borderRadius: '6px',
                        backgroundImage: `url(${v.pic})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        flexShrink: 0,
                        border: '1px solid rgba(255,255,255,0.1)',
                        position: 'relative'
                      }}>
                        <span style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '4px',
                          background: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          fontSize: '9px',
                          padding: '1px 3px',
                          borderRadius: '2px',
                          fontFamily: 'monospace'
                        }}>
                          {v.duration}
                        </span>
                      </div>

                      {/* Text details */}
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between',
                        overflow: 'hidden'
                      }}>
                        <h5 style={{ 
                          fontSize: '12.5px', 
                          fontWeight: '700', 
                          margin: 0,
                          color: isActive ? '#fb7299' : '#ffffff',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.3'
                        }}>
                          {v.title}
                        </h5>
                        <div style={{ 
                          fontSize: '11px', 
                          color: 'rgba(255,255,255,0.4)', 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          gap: '6px'
                        }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            UP: {v.author}
                          </span>
                          <span style={{ flexShrink: 0 }}>
                            播放: {v.play}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
