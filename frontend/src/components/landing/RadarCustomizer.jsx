import React, { useState } from 'react';
import { AlertTriangle, AlertOctagon, Trophy, TrendingUp } from 'lucide-react';

const RadarCustomizer = () => {
  // 3 user knobs (10 - 100)
  const [coding, setCoding] = useState(40);
  const [concept, setConcept] = useState(50);
  const [security, setSecurity] = useState(30);

  // Map the 3 inputs to 6 radar coordinates
  const v_syntax = coding * 0.9 + 5;
  const v_edge = security * 0.95 + 5;
  const v_algo = concept * 0.9 + 5;
  const v_safety = security * 0.85 + coding * 0.1 + 5;
  const v_readability = coding * 0.8 + concept * 0.15 + 5;
  const v_debug = (coding + concept) / 2;

  const values = [v_syntax, v_edge, v_algo, v_safety, v_readability, v_debug];
  const labels = ["语法规则", "边界处理", "算法复杂度", "沙盒安全", "代码读写", "逆向调试"];

  // Calculate points coordinates in 300x300 canvas
  const center = 150;
  const maxVal = 100;
  const radarPoints = values.map((val, idx) => {
    // 6 vertices at 60 degree intervals
    const angle = (idx * 60 * Math.PI) / 180;
    const r = Math.max(15, Math.min(maxVal, val)) * 1.0;
    const x = center + r * Math.sin(angle);
    const y = center - r * Math.cos(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  // Get recommendations from path planner dynamically
  let recommendTitle = "";
  let recommendDesc = "";
  let recommendType = "info";

  let recommendIcon = null;
  if (coding < 35) {
    recommendType = "warning";
    recommendIcon = <AlertTriangle size={14} style={{ color: '#f59e0b' }} />;
    recommendTitle = "诊断结果：编程动手基底薄弱";
    recommendDesc = "画像智能体检测到您在语法结构 and 代码改错上存在明显盲区。路径智能体自动拦截前沿理论模块，已在您 timeline 的 Stage 3 沙盒层强制挂载 3 张概念 MCQ 选择题微课。";
  } else if (security < 35) {
    recommendType = "danger";
    recommendIcon = <AlertOctagon size={14} style={{ color: '#ef4444' }} />;
    recommendTitle = "诊断结果：代码安全与边界意识欠缺";
    recommendDesc = "由于算法边界及内存过滤机制评分较低，系统判定您在生产端编写代码时易发生溢出和不洁注入。推荐：锁定前驱任务，强制激活隔离沙盒的“全面监视模式”。";
  } else if (coding >= 70 && concept >= 70 && security >= 60) {
    recommendType = "success";
    recommendIcon = <Trophy size={14} style={{ color: '#10b981' }} />;
    recommendTitle = "诊断结果：自适应学习画像评级为 - 卓越";
    recommendDesc = "您的各项认知能力已全面收敛，画像智能体联合路径、沙盒主管会签成功。自动授予《大模型自适应微专业毕业证书》，结业 PDF 证书已开放下载！";
  } else {
    recommendType = "info";
    recommendIcon = <TrendingUp size={14} style={{ color: '#3b82f6' }} />;
    recommendTitle = "诊断结果：学习画像均衡稳健发展中";
    recommendDesc = "当前认知脉络合理收敛。画像智能体实时生成 4 道靶向巩固测验题。保持探索，建议在沙盒中增加代码行数以进一步提高调试分数。";
  }

  // Ring radii helper
  const ringRadii = [20, 40, 60, 80, 100];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', alignItems: 'center' }}>
      {/* Left Column: Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', color: 'var(--text-main)' }}>
            <span>编程实践深度 (Coding Practice)</span>
            <span style={{ color: 'var(--primary-neon)', fontWeight: 'bold' }}>{coding}</span>
          </div>
          <input
            type="range"
            min="10" max="100"
            value={coding}
            onChange={(e) => setCoding(Number(e.target.value))}
            className="range-slider-neon"
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', color: 'var(--text-main)' }}>
            <span>概念理解跨度 (Conceptual Span)</span>
            <span style={{ color: 'var(--primary-neon)', fontWeight: 'bold' }}>{concept}</span>
          </div>
          <input
            type="range"
            min="10" max="100"
            value={concept}
            onChange={(e) => setConcept(Number(e.target.value))}
            className="range-slider-neon"
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', color: 'var(--text-main)' }}>
            <span>安全与边界意识 (Security Awareness)</span>
            <span style={{ color: 'var(--primary-neon)', fontWeight: 'bold' }}>{security}</span>
          </div>
          <input
            type="range"
            min="10" max="100"
            value={security}
            onChange={(e) => setSecurity(Number(e.target.value))}
            className="range-slider-neon"
          />
        </div>

        {/* Path Recommendation Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: `1px solid ${recommendType === 'warning' ? '#f59e0b' : recommendType === 'danger' ? '#ef4444' : recommendType === 'success' ? '#10b981' : 'var(--border-neon)'}`,
          borderRadius: '16px',
          padding: '16px',
          marginTop: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          transition: 'all 0.3s ease'
        }}>
          <h4 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {recommendIcon}
            <span>{recommendTitle}</span>
          </h4>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{recommendDesc}</p>
        </div>
      </div>

      {/* Right Column: Dynamic SVG Radar Chart */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width="300" height="300" style={{ overflow: 'visible' }}>
          <defs>
            <radialGradient id="radar-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--primary-neon)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="var(--primary-neon)" stopOpacity="0.45" />
            </radialGradient>
          </defs>

          {/* Concentric rings */}
          {ringRadii.map((r, idx) => {
            const ringPoints = Array.from({ length: 6 }).map((_, i) => {
              const angle = (i * 60 * Math.PI) / 180;
              const x = center + r * Math.sin(angle);
              const y = center - r * Math.cos(angle);
              return `${x},${y}`;
            }).join(' ');
            return (
              <polygon
                key={idx}
                points={ringPoints}
                fill="none"
                stroke="var(--border-neon)"
                strokeWidth="1"
              />
            );
          })}

          {/* 6 axes */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * 60 * Math.PI) / 180;
            const x = center + maxVal * Math.sin(angle);
            const y = center - maxVal * Math.cos(angle);
            return (
              <line
                key={i}
                x1={center} y1={center}
                x2={x} y2={y}
                stroke="var(--border-neon)"
                strokeWidth="1"
              />
            );
          })}

          {/* Value polygon */}
          <polygon
            points={radarPoints}
            fill="url(#radar-gradient)"
            stroke="var(--primary-neon)"
            strokeWidth="2"
            style={{ transition: 'points 0.3s ease-out' }}
          />

          {/* Labels */}
          {labels.map((lbl, idx) => {
            const angle = (idx * 60 * Math.PI) / 180;
            const offset = 120;
            const x = center + offset * Math.sin(angle);
            const y = center - offset * Math.cos(angle);
            return (
              <text
                key={idx}
                x={x} y={y + 4}
                fill="var(--text-muted)"
                fontSize="10px"
                textAnchor="middle"
                fontWeight="bold"
              >
                {lbl}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default RadarCustomizer;
