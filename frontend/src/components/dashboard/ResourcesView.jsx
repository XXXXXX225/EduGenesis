import React from 'react';
import { ArrowRight, Download, FileText, Video, Map, HelpCircle, Code2 } from 'lucide-react';

const getResourceIcon = (type) => {
  switch (type) {
    case 'slide': return <Video size={24} style={{ color: 'var(--secondary)' }} />;
    case 'pdf': return <FileText size={24} style={{ color: 'var(--accent-cyan)' }} />;
    case 'quiz': return <HelpCircle size={24} style={{ color: 'var(--success)' }} />;
    case 'code': return <Code2 size={24} style={{ color: 'var(--accent)' }} />;
    case 'mindmap': return <Map size={24} style={{ color: 'var(--warning)' }} />;
    default: return <FileText size={24} />;
  }
};

export default function ResourcesView({
  profile,
  selectedNodeResources,
  setActiveModal,
  setCurrentSlideIdx,
  setIsPlayingSlide,
  setQuizStep,
  goDashboardHome
}) {
  return (
    <>
      <header>
        <h2 style={{ fontSize: '24px', marginBottom: '4px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
          多智能体资源生成库
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
          由不同角色智能体根据您左侧画像生成的五类多模态教学资源包。
        </p>
      </header>

      {!selectedNodeResources ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg-card-glass)', borderRadius: '16px', border: '1px dashed var(--border-neon)', marginTop: '20px' }}>
          <div className="spinner-academic" style={{ margin: '0 auto 20px' }}></div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>智能资源包拼装中...</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>正在为您唤醒主管智能体，并根据画像组装课本、思维树、测验与源码用例。</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '24px', marginTop: '20px' }}>

          {/* Card 1: PDF */}
          {selectedNodeResources.pdf && (
            <article
              className="cyber-card hover-neon-border"
              style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', cursor: 'pointer', background: 'var(--bg-card-glass)' }}
              onClick={() => setActiveModal('pdf')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ padding: '10px', background: 'rgba(2, 132, 199, 0.06)', borderRadius: '12px', border: '1px solid rgba(2, 132, 199, 0.15)', display: 'flex' }}>
                  <FileText size={24} style={{ color: 'var(--accent-cyan)' }} />
                </div>
                <span className="neon-badge neon-badge-success">PDF 生成完毕</span>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>《专业内容讲解课本.pdf》</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                  针对您的认知风格<b>“{profile.cognitive_style}”</b>定制的讲解教材。内含学术引用校验，实现大模型防幻觉过滤。
                </p>
              </div>
              <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Download size={14} /> 1.2 MB</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>阅读全文 <ArrowRight size={14} /></span>
              </div>
            </article>
          )}

          {/* Card 2: Sound slide */}
          {selectedNodeResources.slide && (
            <article
              className="cyber-card hover-neon-border"
              style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', cursor: 'pointer', background: 'var(--bg-card-glass)' }}
              onClick={() => {
                setActiveModal('slide');
                setCurrentSlideIdx(0);
                setIsPlayingSlide(false);
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ padding: '10px', background: 'rgba(29, 78, 216, 0.06)', borderRadius: '12px', border: '1px solid rgba(29, 78, 216, 0.15)', display: 'flex' }}>
                  <Video size={24} style={{ color: 'var(--secondary)' }} />
                </div>
                <span className="neon-badge neon-badge-warning">音画对齐完毕</span>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>《音画同步动画讲解》</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                  大模型生成的课件内容，结合讯飞 TTS 语音。前端利用 GSAP 时间轴引擎实现音画同步动画，极速渲染。
                </p>
              </div>
              <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>时长: 03:15 分钟</span>
                <span style={{ color: 'var(--secondary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>开启播放 <ArrowRight size={14} /></span>
              </div>
            </article>
          )}

          {/* Card 3: Mindmap */}
          {selectedNodeResources.mindmap && (
            <article
              className="cyber-card hover-neon-border"
              style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', cursor: 'pointer', background: 'var(--bg-card-glass)' }}
              onClick={() => setActiveModal('mindmap')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ padding: '10px', background: 'rgba(180, 83, 9, 0.06)', borderRadius: '12px', border: '1px solid rgba(180, 83, 9, 0.15)', display: 'flex' }}>
                  <Map size={24} style={{ color: 'var(--warning)' }} />
                </div>
                <span className="neon-badge neon-badge-success">思维导图就绪</span>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>《知识点思维脑图.svg》</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                  通过大模型生成 Mermaid 配置，并在前端渲染出动态可收缩的思维节点图，快速辅助学生理清概念脉络。
                </p>
              </div>
              <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>大小: 45 KB</span>
                <span style={{ color: 'var(--warning)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>查看思维树 <ArrowRight size={14} /></span>
              </div>
            </article>
          )}

          {/* Card 4: Quiz */}
          {selectedNodeResources.quiz && (
            <article
              className="cyber-card hover-neon-border"
              style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', cursor: 'pointer', background: 'var(--bg-card-glass)' }}
              onClick={() => {
                setActiveModal('quiz');
                setQuizStep('intro');
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ padding: '10px', background: 'rgba(21, 128, 61, 0.06)', borderRadius: '12px', border: '1px solid rgba(21, 128, 61, 0.15)', display: 'flex' }}>
                  <HelpCircle size={24} style={{ color: 'var(--success)' }} />
                </div>
                <span className="neon-badge neon-badge-success">测试生成就绪</span>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>《自适应画像评估测验》</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                  针对您的易错范畴<b>“{profile.error_patterns?.join('/') || ''}”</b>出具的自适应测评题。答题结果会回传用以微调画像指标。
                </p>
              </div>
              <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>题量: {selectedNodeResources.quiz.length} 道诊断题</span>
                <span style={{ color: 'var(--success)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>开始测评 <ArrowRight size={14} /></span>
              </div>
            </article>
          )}

          {/* Card 5: Code Case */}
          {selectedNodeResources.code && (
            <article
              className="cyber-card hover-neon-border"
              style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', cursor: 'pointer', background: 'var(--bg-card-glass)' }}
              onClick={() => setActiveModal('code')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ padding: '10px', background: 'rgba(15, 118, 110, 0.06)', borderRadius: '12px', border: '1px solid rgba(15, 118, 110, 0.15)', display: 'flex' }}>
                  <Code2 size={24} style={{ color: 'var(--accent)' }} />
                </div>
                <span className="neon-badge neon-badge-success">代码用例生成</span>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>《实操代码与断言测验.py》</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                  大模型自动补齐的带有完整断言测试（PyTest）的代码案例。学生可复制后在本地 IDE 进行代码补齐实践。
                </p>
              </div>
              <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>大小: 12 KB</span>
                <span style={{ color: 'var(--accent)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>查看源码 <ArrowRight size={14} /></span>
              </div>
            </article>
          )}

        </div>
      )}
    </>
  );
}
