import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Map, Loader2 } from 'lucide-react';
import mermaid from 'mermaid';

// Initialize mermaid once
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  themeVariables: {
    primaryColor: '#0f766e',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#0f766e',
    lineColor: 'rgba(255,255,255,0.2)',
    secondaryColor: '#7c3aed',
    tertiaryColor: '#f59e0b',
  },
});

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

// Pre-process mermaid text to ensure compatibility
function preprocessMermaidText(text) {
  if (!text) return '';
  let processed = text.trim();

  // Strip markdown fences
  const fenceMatch = processed.match(/```(?:mermaid)?[\s\n]*([\s\S]*?)```/);
  if (fenceMatch) {
    processed = fenceMatch[1].trim();
  }

  // Convert deprecated 'graph TD/LR/etc' to 'flowchart TD/LR/etc' for mermaid v11+
  processed = processed.replace(/^\s*graph\s+(TD|LR|RL|BT|TB)\b/m, 'flowchart $1');

  // Wrap unquoted node labels containing special characters in double quotes
  processed = processed.replace(
    /([\p{L}\p{N}_][\p{L}\p{N}_\.-]*)\s*(\[\(|\[\[|\(\(|\{\{|\[\/|\[\\|\)\)|\[|\(|\{|>)\s*([^\r\n]*?)\s*(\)\]|\]\]|\)\)|\}\}|\/\]|\\\]|\\\/\]|\\_\]|\]|\)|\})/gu,
    (match, id, openBrackets, label, closeBrackets) => {
      const reserved = ['flowchart', 'graph', 'subgraph', 'end', 'direction', 'click', 'style', 'classDef', 'class', 'linkStyle', 'mindmap'];
      if (reserved.includes(id.toLowerCase())) {
        return match;
      }

      let trimmed = label.trim();
      if (!trimmed) {
        return match;
      }

      // If already quoted, return as is
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return match;
      }

      // Escape double quotes inside the label
      const escaped = trimmed.replace(/"/g, '\\"');
      return `${id}${openBrackets}"${escaped}"${closeBrackets}`;
    }
  );

  // If the text does not contain 'flowchart' or 'graph' or 'mindmap', it's invalid
  if (!processed.includes('flowchart') && !processed.includes('graph') && !processed.includes('mindmap')) {
    processed = `flowchart TD\n    A["概念脑图生成中..."]`;
  }

  return processed;
}

export default function MindmapModal({ isOpen, onClose, mindmapContent, nodeTitle }) {
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [svgHtml, setSvgHtml] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState(null);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const mermaidRef = useRef(null);
  const renderIdRef = useRef(0);

  useEffect(() => {
    if (!isOpen || !mindmapContent || !mermaidRef.current) return;

    const doRender = async () => {
      setIsRendering(true);
      setRenderError(null);
      const currentId = ++renderIdRef.current;
      const id = `mindmap-svg-${currentId}`;

      try {
        const mermaidText = preprocessMermaidText(mindmapContent);

        // Clear previous content
        mermaidRef.current.innerHTML = '';

        const { svg } = await mermaid.render(id, mermaidText);
        if (currentId === renderIdRef.current) {
          mermaidRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.warn('Mermaid render failed:', err);
        if (currentId === renderIdRef.current) {
          setRenderError('Mermaid render error: ' + (err.message || 'unknown'));
        }
      } finally {
        if (currentId === renderIdRef.current) {
          setIsRendering(false);
        }
      }
    };

    doRender();
  }, [isOpen, mindmapContent]);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPanX(0);
      setPanY(0);
      setIsDragging(false);
      setSvgHtml('');
      setRenderError(null);
    }
  }, [isOpen, mindmapContent]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isOpen) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = 0.08;
      const direction = e.deltaY < 0 ? 1 : -1;
      setScale(prev => {
        const newScale = prev + direction * zoomFactor;
        return Math.max(0.4, Math.min(3.0, newScale));
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [isOpen]);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panX, y: e.clientY - panY };
  }, [panX, panY]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStartRef.current.x);
    setPanY(e.clientY - dragStartRef.current.y);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX - panX, y: touch.clientY - panY };
  }, [panX, panY]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPanX(touch.clientX - dragStartRef.current.x);
    setPanY(touch.clientY - dragStartRef.current.y);
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!isOpen || !mindmapContent) return null;

  const controlButtonStyle = {
    width: '28px',
    height: '28px',
    background: 'rgba(30, 41, 59, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    transition: 'all 0.2s',
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '640px', borderRadius: '16px', alignItems: 'center' }}>
        <div style={{ ...modalHeaderStyle, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Map size={20} style={{ color: 'var(--warning)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
              {nodeTitle || 'Knowledge Graph'} Mindmap
            </h3>
          </div>
          <button onClick={onClose} style={modalCloseButtonStyle}>
            <X size={16} />
          </button>
        </div>

        {/* Mermaid SVG Canvas */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            margin: '16px 0',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            width: '100%',
            height: '420px',
            background: '#0e1726',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              ref={mermaidRef}
              style={{ display: 'inline-block' }}
            >
              <div style={{ padding: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center' }}>
                Rendering mindmap...
              </div>
            </div>
          </div>

          {isRendering && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(14, 23, 38, 0.7)',
              backdropFilter: 'blur(2px)',
              zIndex: 5,
            }}>
              <Loader2 size={28} style={{ color: 'var(--primary-neon)', animation: 'spin 1s linear infinite' }} />
            </div>
          )}

          {renderError && !isRendering && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(14, 23, 38, 0.85)',
              zIndex: 5,
            }}>
              <p style={{ color: '#ef4444', fontSize: '14px', fontWeight: '600' }}>{renderError}</p>
            </div>
          )}

          <div style={{ position: 'absolute', bottom: '12px', right: '12px', display: 'flex', gap: '6px', zIndex: 10 }}>
            <button
              onClick={() => setScale(prev => Math.min(3.0, prev + 0.15))}
              style={controlButtonStyle}
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => setScale(prev => Math.max(0.4, prev - 0.15))}
              style={controlButtonStyle}
              title="Zoom Out"
            >
              -
            </button>
            <button
              onClick={() => { setScale(1); setPanX(0); setPanY(0); }}
              style={{ ...controlButtonStyle, fontSize: '10px' }}
              title="Reset"
            >
              1:1
            </button>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.45)',
              fontFamily: 'monospace',
              zIndex: 10,
              background: 'rgba(0,0,0,0.4)',
              padding: '2px 6px',
              borderRadius: '4px',
              backdropFilter: 'blur(2px)'
            }}
          >
            Zoom: {Math.round(scale * 100)}%
          </div>
        </div>

        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '460px', lineHeight: '1.5' }}>
          Tip: <b>Drag</b> to pan, <b>Scroll</b> to zoom.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', paddingTop: '12px', borderTop: '1px solid var(--border-neon)' }}>
          <button className="cyber-btn" onClick={onClose} style={{ padding: '8px 20px', fontSize: '12px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
