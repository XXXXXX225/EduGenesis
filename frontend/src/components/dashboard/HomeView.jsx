import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, CheckCircle2, Sparkles, ChevronRight, BookOpen, Cpu, Code2 } from 'lucide-react';
import { gsap } from 'gsap';
import { useAppContext } from '../../context/AppContext';

const RadarCustomizer = ({ profile }) => {
  const [coding, setCoding] = useState(40);
  const [concept, setConcept] = useState(50);
  const [security, setSecurity] = useState(30);

  const v_syntax = coding * 0.9 + 5;
  const v_edge = security * 0.95 + 5;
  const v_algo = concept * 0.9 + 5;
  const v_safety = security * 0.85 + coding * 0.1 + 5;
  const v_readability = coding * 0.8 + concept * 0.15 + 5;
  const v_debug = (coding + concept) / 2;

  const values = [v_syntax, v_edge, v_algo, v_safety, v_readability, v_debug];
  const labels = ["语法规则", "边界处理", "算法复杂度", "沙盒安全", "代码读写", "逆向调试"];

  const center = 150;
  const maxVal = 100;
  const radarPoints = values.map((val, idx) => {
    const angle = (idx * 60 * Math.PI) / 180;
    const r = Math.max(15, Math.min(maxVal, val)) * 1.0;
    const x = center + r * Math.sin(angle);
    const y = center - r * Math.cos(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  let recommendTitle = "";
  let recommendDesc = "";
  let recommendType = "info";

  if (coding < 35) {
    recommendType = "warning";
    recommendTitle = "⚠️ 诊断结果：编程动手基底薄弱";
    recommendDesc = "画像智能体检测到您在语法结构与代码改错上存在明显盲区。路径智能体自动拦截前沿理论模块，已在您 timeline 的 Stage 3 沙盒层强制挂载 3 张概念 MCQ 选择题微课。";
  } else if (security < 35) {
    recommendType = "danger";
    recommendTitle = "🚫 诊断结果：代码安全与边界意识欠缺";
    recommendDesc = "由于算法边界及内存过滤机制评分较低，系统判定您在生产端编写代码时易发生溢出和不洁注入。推荐：锁定前驱任务，强制激活隔离沙盒的“全面监视模式”。";
  } else if (coding >= 70 && concept >= 70 && security >= 60) {
    recommendType = "success";
    recommendTitle = "🏆 诊断结果：自适应学习画像评级为 - 卓越";
    recommendDesc = "您的各项认知能力已全面收敛，画像智能体联合路径、沙盒主管会签成功。自动授予《大模型自适应微专业毕业证书》，结业 PDF 证书已开放下载！";
  } else {
    recommendType = "info";
    recommendTitle = "🚀 诊断结果：学习画像均衡稳健发展中";
    recommendDesc = "当前认知脉络合理收敛。画像智能体实时生成 4 道靶向巩固测验题。保持探索，建议在沙盒中增加代码行数以进一步提高调试分数。";
  }

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
          <h4 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}>{recommendTitle}</h4>
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

export default function HomeView() {
  const { profile, pathNodes, setSelectedNode, setActiveTab, fetchNodeResources } = useAppContext();
  const [deltas, setDeltas] = useState({ study_time: 0, quiz_accuracy: 0, mastered_nodes: 0 });

  useEffect(() => {
    if (profile && profile.learning_stats) {
      const stats = profile.learning_stats;
      const key = `edugenesis_prev_stats_${profile.username || 'default'}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const prev = JSON.parse(saved);
          const dTime = (stats.study_time || 0) - (prev.study_time || 0);
          const dAcc = (stats.quiz_accuracy || 0) - (prev.quiz_accuracy || 0);
          const dNodes = (stats.mastered_nodes || 0) - (prev.mastered_nodes || 0);
          
          if (dTime !== 0 || dAcc !== 0 || dNodes !== 0) {
            setDeltas({ study_time: dTime, quiz_accuracy: dAcc, mastered_nodes: dNodes });
          }
        } catch (e) {
          console.error(e);
        }
      }
      localStorage.setItem(key, JSON.stringify(stats));
    }
  }, [profile]);

  return (
    <>
      <style>{`
        .pulse-glow-green {
          box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
          animation: greenGlow 1.5s infinite alternate;
        }
        @keyframes greenGlow {
          0% { opacity: 0.8; }
          100% { opacity: 1; box-shadow: 0 0 10px rgba(16, 185, 129, 0.6); }
        }
      `}</style>
      {/* Landing Banner */}
      <header className="cyber-card" style={{ padding: '40px', background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.06) 0%, rgba(29, 78, 216, 0.03) 100%)', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '32px' }}>
          <div>
            <div className="neon-badge neon-badge-primary" style={{ marginBottom: '14px', display: 'inline-block' }}>个性化自主学习空间</div>
            <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '12px', lineHeight: '1.2' }} className="neon-text-gradient">
              基于大模型的个性化资源生成与学习多智能体系统
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '680px', lineHeight: '1.7' }}>
              本系统依托通用大模型及多模态前沿技术，由**主管智能体、画像智能体、路径智能体**等协同工作。支持对话式构建6维动态画像并动态推送符合当前进度的PDF文档、思维导图、测验及前端渲染的动画音频课件。
            </p>
          </div>
          <div style={{ padding: '24px', borderRadius: '24px', background: 'rgba(15, 118, 110, 0.04)', border: '1px solid rgba(15, 118, 110, 0.12)', display: 'flex' }} className="pulse-glow">
            <Sparkles size={52} style={{ color: 'var(--secondary)' }} />
          </div>
        </div>
      </header>

      {/* Stats, Streak and Recommendation Section */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', margin: '24px 0' }}>

        {/* Left Column: Stats & Streak */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Stats Overview */}
          <div className="cyber-card" style={{ padding: '24px', background: 'var(--bg-card-glass)', backdropFilter: 'blur(10px)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} style={{ color: 'var(--primary)' }} /> 学习统计看板
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
              <div style={{ padding: '12px 8px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary-neon)', display: 'block' }}>
                    {profile.learning_stats?.study_time || 0}
                  </span>
                  {deltas.study_time > 0 && (
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '1px 4px', borderRadius: '4px' }} className="pulse-glow-green">
                      +{deltas.study_time}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>累计时长 (分)</span>
              </div>
              <div style={{ padding: '12px 8px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--secondary)', display: 'block' }}>
                    {profile.learning_stats?.quiz_accuracy || 0}%
                  </span>
                  {deltas.quiz_accuracy !== 0 && (
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: deltas.quiz_accuracy > 0 ? '#10b981' : '#ef4444', background: deltas.quiz_accuracy > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '1px 4px', borderRadius: '4px' }}>
                      {deltas.quiz_accuracy > 0 ? `+${deltas.quiz_accuracy}` : `${deltas.quiz_accuracy}`}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>习题正确率</span>
              </div>
              <div style={{ padding: '12px 8px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--accent)', display: 'block' }}>
                    {profile.learning_stats?.mastered_nodes || 0} / 8
                  </span>
                  {deltas.mastered_nodes > 0 && (
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '1px 4px', borderRadius: '4px' }} className="pulse-glow-green">
                      +{deltas.mastered_nodes}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>已掌握知识点</span>
              </div>
            </div>
          </div>

          {/* Streak Tracker */}
          <div className="cyber-card" style={{ padding: '24px', background: 'var(--bg-card-glass)', backdropFilter: 'blur(10px)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> 学习打卡连续周报
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, idx) => {
                const active = profile.learning_stats?.streak?.[idx] || false;
                return (
                  <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{day}</span>
                    <div
                      className={active ? 'pulse-glow' : ''}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: active ? 'linear-gradient(135deg, var(--primary-neon) 0%, var(--secondary) 100%)' : 'rgba(0, 0, 0, 0.05)',
                        border: active ? 'none' : '1px dashed rgba(0,0,0,0.15)',
                        boxShadow: active ? '0 0 10px rgba(15, 118, 110, 0.4)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {active && <CheckCircle2 size={14} style={{ color: '#ffffff' }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Smart Recommendation */}
        <div className="cyber-card" style={{ padding: '24px', background: 'var(--bg-card-glass)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: 'var(--accent)' }} /> 智能体今日推荐
              </h3>
              <span className="neon-badge neon-badge-warning" style={{ fontSize: '9px' }}>画像匹配率 98%</span>
            </div>

            <div style={{ padding: '16px', background: 'rgba(180, 83, 9, 0.02)', borderLeft: '3px solid var(--accent)', borderRadius: '0 8px 8px 0', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
                {profile.cognitive_style?.includes("Practical")
                  ? "💻 动手实践：控制流逻辑 pytest 断言用例"
                  : profile.cognitive_style?.includes("Visual")
                    ? "🎨 视觉讲解：变量引用与内存分配动态脑图"
                    : "📚 深度理论：Python 底层对象与内存指针对齐论文精读"}
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.6' }}>
                系统分析您的 6 维学习画像，针对您较薄弱的知识点进行防御性加强，并推荐了当前匹配您<b>{profile.cognitive_style}</b>风格的自适应学习包。
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              const activeNodeObj = pathNodes.find(n => n.status === 'active') || pathNodes[0];
              setSelectedNode(activeNodeObj);
              setActiveTab('path');
              await fetchNodeResources(activeNodeObj.id);
            }}
            className="cyber-btn"
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
          >
            进入当前关卡学习 <ChevronRight size={16} />
          </button>
        </div>

      </section>

      {/* Core Feature Grid */}
      <section className="grid-cols-3">
        <div className="cyber-card" style={{ padding: '28px' }}>
          <div style={{ display: 'inline-flex', padding: '10px', background: 'rgba(15, 118, 110, 0.06)', borderRadius: '12px', border: '1px solid rgba(15, 118, 110, 0.15)', marginBottom: '20px' }}>
            <BookOpen size={24} style={{ color: 'var(--primary-neon)' }} />
          </div>
          <h3 style={{ fontSize: '18px', marginBottom: '10px', fontWeight: '700' }}>1. 智能画像导师</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
            摒弃表单，通过自然语言对话抽取您的专业特征，维护左侧6个维度的雷达画像，并支持“随学随新”的实时更新。
          </p>
        </div>

        <div className="cyber-card" style={{ padding: '28px' }}>
          <div style={{ display: 'inline-flex', padding: '10px', background: 'rgba(29, 78, 216, 0.06)', borderRadius: '12px', border: '1px solid rgba(29, 78, 216, 0.15)', marginBottom: '20px' }}>
            <Cpu size={24} style={{ color: 'var(--secondary)' }} />
          </div>
          <h3 style={{ fontSize: '18px', marginBottom: '10px', fontWeight: '700' }}>2. 路径规划与推送</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
            智能体综合评估您的知识掌握情况，为您规划动态演进的路径图。每完成一步，系统精准推送针对性材料。
          </p>
        </div>

        <div className="cyber-card" style={{ padding: '28px' }}>
          <div style={{ display: 'inline-flex', padding: '10px', background: 'rgba(180, 83, 9, 0.06)', borderRadius: '12px', border: '1px solid rgba(180, 83, 9, 0.15)', marginBottom: '20px' }}>
            <Code2 size={24} style={{ color: 'var(--accent)' }} />
          </div>
          <h3 style={{ fontSize: '18px', marginBottom: '10px', fontWeight: '700' }}>3. 多模态资源生成</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
            自动生成思维导图、测验及代码类实操。前端利用 GSAP 时间轴引擎配合 TTS 播放，实现快速动画讲解。
          </p>
        </div>
      </section>

      {/* Developer Sandbox Guide */}
      <div className="cyber-card" style={{ padding: '24px', borderLeft: '4px solid var(--accent)', background: 'rgba(180, 83, 9, 0.03)' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ padding: '10px', background: 'rgba(180, 83, 9, 0.06)', borderRadius: '12px', display: 'flex' }}>
            <Sparkles size={24} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h4 style={{ fontWeight: '700', marginBottom: '6px', fontSize: '15px' }} className="cyan-gradient"> 学习快速适应指南</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
              在左侧菜单切换到 <b>“智能画像导师”</b> 并发送消息（例如输入：<i>“我想学机器学习”</i>）。系统将调用多智能体协同机制，动态调转左侧画像雷达指针，并为您重新编排下方的 <b>“定制路径规划”</b>！
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '28px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>
          🔍 画像认知模拟调试台 (Radar Sandbox)
        </h3>
        <RadarCustomizer profile={profile} />
      </div>
    </>
  );
}
