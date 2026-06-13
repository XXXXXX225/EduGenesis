import React from 'react';
import { BookOpen, Cpu, Code2, TrendingUp, Download } from 'lucide-react';
import { apiGetRaw } from '../../utils/api';
import { useAppContext } from '../../context/AppContext';

export default function AchievementsView() {
  const {
    profile,
    setProfileAlert,
    goDashboardHome
  } = useAppContext();
  return (
    <>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px', color: 'var(--text-main)' }}>
          🏆 学术成就与勋章墙
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0, lineHeight: '1.4' }}>
          根据您当前的认知指标，画像自动签发勋章与毕业证书。
        </p>
      </div>

      {/* Badges Grid (adapted to a vertical flex list of horizontal items) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
        {[
          { name: "百科全书学霸", desc: "基础知识库得分 >= 70 解锁", rule: profile.knowledge_base >= 70, icon: <BookOpen size={18} /> },
          { name: "虫洞终结者", desc: "调试能力得分 >= 70 解锁", rule: profile.debugging >= 70 || profile.debugging === undefined, icon: <Cpu size={18} /> },
          { name: "代码实操狂魔", desc: "实践能力得分 >= 70 解锁", rule: profile.practical >= 70 || profile.practical === undefined, icon: <Code2 size={18} /> },
          { name: "逻辑推导演绎家", desc: "推理分析得分 >= 70 解锁", rule: profile.reasoning >= 70 || profile.reasoning === undefined, icon: <TrendingUp size={18} /> }
        ].map((badge, idx) => (
          <div key={idx} className={`badge-card ${badge.rule ? 'unlocked' : 'locked'}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', padding: '10px 12px', textAlign: 'left', borderRadius: '12px' }}>
            <div className="badge-icon-wrapper" style={{ margin: 0, padding: '6px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {badge.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ fontSize: '12.5px', fontWeight: '800', margin: '0 0 2px 0', color: 'var(--text-main)' }}>{badge.name}</h4>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>{badge.desc}</p>
            </div>
            <div style={{ flexShrink: 0 }}>
              {badge.rule ? (
                <span className="neon-badge neon-badge-success" style={{ fontSize: '8px', padding: '1px 4px' }}>已解锁</span>
              ) : (
                <span className="neon-badge" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-dim)', fontSize: '8px', padding: '1px 4px' }}>未解锁</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Study heat map & certificate card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
        {/* Contribution Activity Map */}
        <div className="cyber-card" style={{ padding: '12px 14px', background: 'var(--bg-card-glass)' }}>
          <h4 style={{ fontSize: '12.5px', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            📊 学术研学活力图
          </h4>
          <div className="heatmap-grid">
            {Array.from({ length: 371 }).map((_, idx) => {
              let levelClass = "";
              const rand = Math.sin(idx) * 10;
              if (rand > 7) levelClass = "level-4";
              else if (rand > 4) levelClass = "level-3";
              else if (rand > 1) levelClass = "level-2";
              else if (rand > -2) levelClass = "level-1";
              return <div key={idx} className={`heatmap-cell ${levelClass}`}></div>;
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-dim)', marginTop: '6px' }}>
            <span>365天研学活力追踪</span>
            <span>少 <span className="heatmap-cell" style={{ display: 'inline-block', width: '6px', height: '6px', minWidth: 'auto', borderRadius: '1px', verticalAlign: 'middle', margin: '0 2px' }}></span> <span style={{ display: 'inline-block', width: '6px', height: '6px', background: 'var(--primary-neon)', borderRadius: '1px', verticalAlign: 'middle', margin: '0 2px' }}></span> 多</span>
          </div>
        </div>

        {/* Graduation Certificate Download */}
        <div className="cyber-card" style={{ padding: '12px 14px', background: 'var(--bg-card-glass)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <h4 style={{ fontSize: '12.5px', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              🎓 自适应结业证书
            </h4>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
              当您全部通关 8 个 Stage 并且综合学习指标评估合格，主管智能体会发放微专业毕业证书。
            </p>
          </div>

          <button
            type="button"
            onClick={async () => {
              setProfileAlert("🎓 正在为您签发PDF结业证书，请稍候...");
              try {
                const response = await apiGetRaw('/achievements/certificate');
                if (!response.ok) {
                  throw new Error('证书下载失败');
                }
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = 'certificate.pdf';
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(downloadUrl);
              } catch (err) {
                setProfileAlert(`❌ ${err.message}`);
              } finally {
                setTimeout(() => setProfileAlert(''), 3000);
              }
            }}
            className="cyber-btn"
            style={{ width: '100%', justifyContent: 'center', padding: '6px 10px', fontSize: '11px' }}
          >
            <Download size={14} /> 下载自适应结业证书
          </button>
        </div>
      </div>
    </>
  );
}
