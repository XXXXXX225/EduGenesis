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
