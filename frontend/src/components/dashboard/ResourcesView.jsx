import React from 'react';
import { ArrowRight, Download, FileText, Video, Map, HelpCircle, Code2, BookOpen, MessageSquare } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

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

export default function ResourcesView() {
  const {
    profile,
    selectedNodeResources,
    setActiveModal,
    setCurrentSlideIdx,
    speech,
    quiz,
    goDashboardHome,
    chat,
    pathNodes,
    selectedNode,
    setActiveTab,
    completeResource
  } = useAppContext();

  const setIsPlayingSlide = speech.setIsPlayingSlide;
  const setQuizStep = quiz.setQuizStep;
  return (
    <>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={16} style={{ color: 'var(--primary)' }} /> 关卡智能资源包
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0, lineHeight: '1.4' }}>
            多智能体已根据您的特征，为您配齐以下自适应学习资源：
          </p>
        </div>
        {selectedNode && (
          <button
            onClick={async () => {
              chat.submitChatMessage(`我想和您讨论本关卡「${selectedNode.title}」的学习内容，您能为我做个简要介绍并指导一下吗？`);
              setActiveTab('chat');
            }}
            style={{
              background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--primary-neon) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 212, 191, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <MessageSquare size={12} /> 讨论此关卡
          </button>
        )}
      </div>


      {/* 📊 Node Progress Indicator */}
      {selectedNode && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-muted)' }}>当前关卡任务进度</span>
            <span style={{ color: 'var(--primary-neon)', fontWeight: '700' }}>
              {selectedNode.completed_resources?.length || 0} / {selectedNode.resources?.length || 0} 项完成
            </span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${((selectedNode.completed_resources?.length || 0) / (selectedNode.resources?.length || 1)) * 100}%`,
              background: 'linear-gradient(90deg, var(--accent-cyan) 0%, var(--primary-neon) 100%)',
              transition: 'width 0.4s ease-out'
            }} />
          </div>
        </div>
      )}

      {!selectedNodeResources ? (
        <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-card-glass)', borderRadius: '12px', border: '1px dashed var(--border-neon)', marginTop: '16px' }}>
          <div className="spinner-academic" style={{ margin: '0 auto 12px', width: '24px', height: '24px' }}></div>
          <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '4px' }}>智能资源包拼装中...</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0, lineHeight: '1.4' }}>正在为您唤醒主管智能体，并根据画像组装课本、思维树、测验与源码用例。</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>

          {/* Card 1: PDF */}
          {selectedNodeResources.pdf && (() => {
            const isDone = selectedNode?.completed_resources?.includes('pdf');
            return (
              <article
                className="cyber-card hover-neon-border"
                style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer', background: 'var(--bg-card-glass)' }}
                onClick={() => {
                  setActiveModal('pdf');
                  completeResource(selectedNode.id, 'pdf');
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ padding: '6px', background: 'rgba(2, 132, 199, 0.06)', borderRadius: '8px', border: '1px solid rgba(2, 132, 199, 0.15)', display: 'flex' }}>
                    <FileText size={18} style={{ color: 'var(--accent-cyan)' }} />
                  </div>
                  <span className={`neon-badge neon-badge-${isDone ? 'success' : 'primary'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                    {isDone ? '已完成' : '待学习'}
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px', color: 'var(--text-main)' }}>《专业内容讲解课本.pdf》</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11.5px', lineHeight: '1.4', margin: 0 }}>
                    针对您的认知风格<b>“{profile.cognitive_style}”</b>定制的讲解教材。内含学术引用校验。
                  </p>
                </div>
                <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Download size={12} /> 1.2 MB</span>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>阅读全文 <ArrowRight size={12} /></span>
                </div>
              </article>
            );
          })()}

          {/* Card 2: Sound slide */}
          {selectedNodeResources.slide && (() => {
            const isDone = selectedNode?.completed_resources?.includes('slide');
            return (
              <article
                className="cyber-card hover-neon-border"
                style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer', background: 'var(--bg-card-glass)' }}
                onClick={() => {
                  setActiveModal('slide');
                  setCurrentSlideIdx(0);
                  setIsPlayingSlide(false);
                  completeResource(selectedNode.id, 'slide');
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ padding: '6px', background: 'rgba(29, 78, 216, 0.06)', borderRadius: '8px', border: '1px solid rgba(29, 78, 216, 0.15)', display: 'flex' }}>
                    <Video size={18} style={{ color: 'var(--secondary)' }} />
                  </div>
                  <span className={`neon-badge neon-badge-${isDone ? 'success' : 'primary'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                    {isDone ? '已完成' : '待学习'}
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px', color: 'var(--text-main)' }}>《音画同步动画讲解》</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11.5px', lineHeight: '1.4', margin: 0 }}>
                    大模型生成的课件内容，结合语音。GSAP 时间轴引擎实现音画同步动画。
                  </p>
                </div>
                <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>时长: 03:15 分钟</span>
                  <span style={{ color: 'var(--secondary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>开启播放 <ArrowRight size={12} /></span>
                </div>
              </article>
            );
          })()}

          {/* Card 3: Mindmap */}
          {selectedNodeResources.mindmap && (() => {
            const isDone = selectedNode?.completed_resources?.includes('mindmap');
            return (
              <article
                className="cyber-card hover-neon-border"
                style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer', background: 'var(--bg-card-glass)' }}
                onClick={() => {
                  setActiveModal('mindmap');
                  completeResource(selectedNode.id, 'mindmap');
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ padding: '6px', background: 'rgba(180, 83, 9, 0.06)', borderRadius: '8px', border: '1px solid rgba(180, 83, 9, 0.15)', display: 'flex' }}>
                    <Map size={18} style={{ color: 'var(--warning)' }} />
                  </div>
                  <span className={`neon-badge neon-badge-${isDone ? 'success' : 'primary'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                    {isDone ? '已完成' : '待学习'}
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px', color: 'var(--text-main)' }}>《知识点思维脑图.svg》</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11.5px', lineHeight: '1.4', margin: 0 }}>
                    通过大模型生成 Mermaid 配置，并在前端渲染出动态可收缩的思维节点图。
                  </p>
                </div>
                <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>大小: 45 KB</span>
                  <span style={{ color: 'var(--warning)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>查看思维树 <ArrowRight size={12} /></span>
                </div>
              </article>
            );
          })()}

          {/* Card 4: Quiz */}
          {selectedNodeResources.quiz && (() => {
            const isDone = selectedNode?.completed_resources?.includes('quiz');
            return (
              <article
                className="cyber-card hover-neon-border"
                style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer', background: 'var(--bg-card-glass)' }}
                onClick={() => {
                  setActiveModal('quiz');
                  setQuizStep('intro');
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ padding: '6px', background: 'rgba(21, 128, 61, 0.06)', borderRadius: '8px', border: '1px solid rgba(21, 128, 61, 0.15)', display: 'flex' }}>
                    <HelpCircle size={18} style={{ color: 'var(--success)' }} />
                  </div>
                  <span className={`neon-badge neon-badge-${isDone ? 'success' : 'primary'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                    {isDone ? '已完成' : '待测评'}
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px', color: 'var(--text-main)' }}>《自适应画像评估测验》</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11.5px', lineHeight: '1.4', margin: 0 }}>
                    针对您的易错范畴<b>“{profile.error_patterns?.join('/') || ''}”</b>出具的测评题。
                  </p>
                </div>
                <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>题量: {selectedNodeResources.quiz.length} 道诊断题</span>
                  <span style={{ color: 'var(--success)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>开始测评 <ArrowRight size={12} /></span>
                </div>
              </article>
            );
          })()}

          {/* Card 5: Code Case */}
          {selectedNodeResources.code && (() => {
            const isDone = selectedNode?.completed_resources?.includes('code');
            return (
              <article
                className="cyber-card hover-neon-border"
                style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer', background: 'var(--bg-card-glass)' }}
                onClick={() => {
                  setActiveModal('code');
                  completeResource(selectedNode.id, 'code');
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ padding: '6px', background: 'rgba(15, 118, 110, 0.06)', borderRadius: '8px', border: '1px solid rgba(15, 118, 110, 0.15)', display: 'flex' }}>
                    <Code2 size={18} style={{ color: 'var(--accent)' }} />
                  </div>
                  <span className={`neon-badge neon-badge-${isDone ? 'success' : 'primary'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                    {isDone ? '已完成' : '待学习'}
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px', color: 'var(--text-main)' }}>《实操代码与断言测验.py》</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11.5px', lineHeight: '1.4', margin: 0 }}>
                    带有完整断言测试（PyTest）的代码案例。支持在编程沙盒内进行代码实践。
                  </p>
                </div>
                <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>大小: 12 KB</span>
                  <span style={{ color: 'var(--accent)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>查看源码 <ArrowRight size={12} /></span>
                </div>
              </article>
            );
          })()}

          {/* Card 6: Bilibili Video */}
          {selectedNodeResources.video && (() => {
            const isDone = selectedNode?.completed_resources?.includes('video');
            return (
              <article
                className="cyber-card hover-neon-border"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  cursor: 'pointer',
                  background: 'var(--bg-card-glass)',
                  border: '1px solid rgba(251, 114, 153, 0.15)'
                }}
                onClick={() => {
                  setActiveModal('video');
                  completeResource(selectedNode.id, 'video');
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ padding: '6px', background: 'rgba(251, 114, 153, 0.06)', borderRadius: '8px', border: '1px solid rgba(251, 114, 153, 0.15)', display: 'flex' }}>
                    <Video size={18} style={{ color: '#fb7299' }} />
                  </div>
                  <span className={`neon-badge neon-badge-${isDone ? 'success' : 'primary'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                    {isDone ? '已完成' : '待学习'}
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px', color: 'var(--text-main)' }}>《精品学习视频》</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11.5px', lineHeight: '1.4', margin: 0 }}>
                    视频推荐智能体检索 Bilibili 精选相关教学，并结合画像个性化评估推荐理由。支持内嵌免跳出播放。
                  </p>
                </div>
                <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>视频数量: {selectedNodeResources.video.length} 个推荐名课</span>
                  <span style={{ color: '#fb7299', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>开启播放 <ArrowRight size={12} /></span>
                </div>
              </article>
            );
          })()}

        </div>
      )}
    </>
  );
}
