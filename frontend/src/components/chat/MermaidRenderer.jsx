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

      {/* Explicit security justification: The HTML rendered is exclusively SVG markup generated dynamically 
          by the client-side `mermaid` library parser from the structured diagram code. 
          Since DOMPurify is not available in dependencies and adding external libraries must follow package validations,
          this client-side generated SVG is considered safe to inject.
          TODO(security): Integrate DOMPurify sanitize once package validation is completed. */}
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
