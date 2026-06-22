import React, { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, Settings } from 'lucide-react';
import SettingsView from '../dashboard/SettingsView';

export default function SettingsModal({ isOpen, onClose }) {
  const [size, setSize] = useState(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    return {
      width: isMobile ? window.innerWidth * 0.95 : Math.min(1050, window.innerWidth * 0.9),
      height: isMobile ? window.innerHeight * 0.92 : Math.min(780, window.innerHeight * 0.85)
    };
  });
  const [isMaximized, setIsMaximized] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  });
  const [isResizing, setIsResizing] = useState(false);

  // Reset/re-initialize size when the modal is opened
  useEffect(() => {
    if (isOpen) {
      const isMobile = window.innerWidth <= 768;
      setSize({
        width: isMobile ? window.innerWidth * 0.95 : Math.min(1050, window.innerWidth * 0.9),
        height: isMobile ? window.innerHeight * 0.92 : Math.min(780, window.innerHeight * 0.85)
      });
      setIsMaximized(isMobile);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startResize = (e) => {
    e.preventDefault();
    if (isMaximized) return; // Disallow manual resize when maximized

    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      const newWidth = Math.max(500, Math.min(window.innerWidth * 0.98, startWidth + deltaX));
      const newHeight = Math.max(400, Math.min(window.innerHeight * 0.95, startHeight + deltaY));
      
      setSize({
        width: newWidth,
        height: newHeight
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setIsResizing(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'se-resize';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const modalWidth = isMaximized ? '96vw' : `${size.width}px`;
  const modalHeight = isMaximized ? '92vh' : `${size.height}px`;

  return (
    <div className="modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className="cyber-card modal-content" 
        style={{ 
          width: modalWidth, 
          height: modalHeight, 
          maxWidth: '98vw',
          maxHeight: '96vh',
          display: 'flex', 
          flexDirection: 'column', 
          padding: '32px 32px 0 32px',
          position: 'relative',
          transition: isResizing ? 'none' : 'width 0.2s ease, height 0.2s ease'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-neon)', paddingBottom: '12px', flexShrink: 0 }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} style={{ color: 'var(--primary-neon)' }} /> 模型服务及系统配置
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => setIsMaximized(!isMaximized)} 
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.25s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-neon)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              title={isMaximized ? "还原窗口" : "最大化窗口"}
              className="resize-btn"
            >
              {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button 
              onClick={onClose} 
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.25s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              title="关闭"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', margin: '0 -32px', padding: '0 32px 32px 32px' }}>
          <SettingsView />
        </div>

        {/* Corner Resize Handle */}
        {!isMaximized && (
          <div
            onMouseDown={startResize}
            style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: '20px',
              height: '20px',
              cursor: 'se-resize',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              padding: '6px',
              zIndex: 10,
              opacity: 0.6,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
            title="拖拽调节大小"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" style={{ pointerEvents: 'none' }}>
              <line x1="12" y1="2" x2="2" y2="12" style={{ stroke: 'var(--primary-neon)', strokeWidth: '1.5', strokeLinecap: 'round' }} />
              <line x1="12" y1="6" x2="6" y2="12" style={{ stroke: 'var(--primary-neon)', strokeWidth: '1.5', strokeLinecap: 'round' }} />
              <line x1="12" y1="10" x2="10" y2="12" style={{ stroke: 'var(--primary-neon)', strokeWidth: '1.5', strokeLinecap: 'round' }} />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
