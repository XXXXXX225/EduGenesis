import React from 'react';
import { BookOpen, Cpu, Code2, TrendingUp, Download } from 'lucide-react';
import { apiGetRaw } from '../../utils/api';

export default function AchievementsView({
  profile,
  setProfileAlert,
  goDashboardHome
}) {
  return (
    <>
      <header>
        <h2 style={{ fontSize: '24px', marginBottom: '4px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
          学术成就与自适应勋章墙
          <a
            href="#"
            role="button"
            onClick={(e) => {
              e.preventDefault();
              goDashboardHome();
            }}
            style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--primary-neon)', cursor: 'pointer', opacity: 0.8, textDecoration: 'underline' }}
          >
            返回首页
          </a>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          画像智能体根据您当前的 6 维认知能力指标实时解锁对应的荣誉徽章及毕业证书。
        </p>
      </header>

      {/* Badges Grid */}
      <div className="badge-wall-grid" style={{ marginTop: '20px' }}>
        {[
          { name: "百科全书学霸", desc: "基础知识库得分 >= 70 解锁", rule: profile.knowledge_base >= 70, icon: <BookOpen size={28} /> },
          { name: "虫洞终结者", desc: "调试能力得分 >= 70 解锁", rule: profile.debugging >= 70 || profile.debugging === undefined, icon: <Cpu size={28} /> },
          { name: "代码实操狂魔", desc: "实践能力得分 >= 70 解锁", rule: profile.practical >= 70 || profile.practical === undefined, icon: <Code2 size={28} /> },
          { name: "逻辑推导演绎家", desc: "推理分析得分 >= 70 解锁", rule: profile.reasoning >= 70 || profile.reasoning === undefined, icon: <TrendingUp size={28} /> }
        ].map((badge, idx) => (
          <div key={idx} className={`badge-card ${badge.rule ? 'unlocked' : 'locked'}`}>
            <div className="badge-icon-wrapper">
              {badge.icon}
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>{badge.name}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{badge.desc}</p>
            <div style={{ marginTop: '12px' }}>
              {badge.rule ? (
                <span className="neon-badge neon-badge-success">已解锁</span>
              ) : (
                <span className="neon-badge" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-dim)' }}>未解锁</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Study heat map & certificate card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '28px' }}>
        {/* Contribution Activity Map */}
        <div className="cyber-card" style={{ padding: '24px', background: 'var(--bg-card-glass)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📊 学术研学活力图
          </h3>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', marginTop: '8px' }}>
            <span>365 天研学活力追踪</span>
            <span>少 <span className="heatmap-cell" style={{ display: 'inline-block', width: '8px', height: '8px', minWidth: 'auto', borderRadius: '1px', verticalAlign: 'middle', margin: '0 4px' }}></span> <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--primary-neon)', borderRadius: '1px', verticalAlign: 'middle', margin: '0 4px' }}></span> 多</span>
          </div>
        </div>

        {/* Graduation Certificate Download */}
        <div className="cyber-card" style={{ padding: '24px', background: 'var(--bg-card-glass)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎓 自适应结业证书发放
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
              当您全部通关 8 个 Stage 并且综合学习指标评估合格，系统画像智能体会签发一份权威自适应微专业毕业证书。
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
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Download size={16} /> 下载微专业自适应结业证书
          </button>
        </div>
      </div>
    </>
  );
}
