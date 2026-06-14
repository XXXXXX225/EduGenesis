import React, { useState, useEffect, useRef } from 'react';
import { X, HelpCircle, CheckCircle2, ArrowRight, Info, Sparkles, PartyPopper } from 'lucide-react';
import { gsap } from 'gsap';

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

// Small particle burst helper - spawns colored dots that fade out
function spawnParticles(parentEl, color, count = 8) {
  if (!parentEl) return;
  const rect = parentEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.6;
    const distance = 30 + Math.random() * 40;
    const size = 4 + Math.random() * 6;

    Object.assign(particle.style, {
      position: 'fixed',
      left: `${cx}px`,
      top: `${cy}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: color,
      pointerEvents: 'none',
      zIndex: 9999,
      boxShadow: `0 0 ${size * 2}px ${color}`,
    });

    document.body.appendChild(particle);

    gsap.to(particle, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      opacity: 0,
      scale: 0,
      duration: 0.7 + Math.random() * 0.4,
      ease: 'power2.out',
      onComplete: () => particle.remove(),
    });
  }
}

export default function QuizModal({ isOpen, onClose, quizList, nodeTitle, onCompleteQuiz }) {
  const [quizStep, setQuizStep] = useState('intro');
  const [quizQuestionIdx, setQuizQuestionIdx] = useState(0);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [animatingOptionIdx, setAnimatingOptionIdx] = useState(null);

  const optionRefs = useRef([]);
  const questionCardRef = useRef(null);

  // Animate question card entrance
  useEffect(() => {
    if (quizStep === 'question' && questionCardRef.current) {
      gsap.fromTo(questionCardRef.current,
        { opacity: 0, y: 16, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [quizStep, quizQuestionIdx]);

  // Trigger GSAP animations on submit
  useEffect(() => {
    if (!quizSubmitted || quizList.length === 0) return;

    const currentQ = quizList[quizQuestionIdx];
    const selectedIdx = quizAnswers[quizQuestionIdx];
    const isCorrect = selectedIdx === currentQ.answer;

    // Animate the selected option
    const selectedEl = optionRefs.current[selectedIdx];
    if (selectedEl) {
      if (isCorrect) {
        // Green pulse + glow burst
        gsap.fromTo(selectedEl,
          { scale: 1, boxShadow: '0 0 0px rgba(22, 163, 74, 0)' },
          {
            scale: 1.04,
            boxShadow: '0 0 20px rgba(22, 163, 74, 0.5)',
            duration: 0.3,
            ease: 'back.out(2)',
            onComplete: () => {
              gsap.to(selectedEl, {
                scale: 1,
                boxShadow: '0 0 0px rgba(22, 163, 74, 0)',
                duration: 0.3,
                ease: 'power2.out'
              });
            }
          }
        );
        // Spawn green particles
        setTimeout(() => spawnParticles(selectedEl, '#22c55e', 10), 100);
      } else {
        // Red shake with physics-style easing
        const shakeTimeline = gsap.timeline();
        shakeTimeline.to(selectedEl, { x: -10, duration: 0.06, ease: 'power2.inOut' })
          .to(selectedEl, { x: 9, duration: 0.07, ease: 'power2.inOut' })
          .to(selectedEl, { x: -7, duration: 0.06, ease: 'power2.inOut' })
          .to(selectedEl, { x: 5, duration: 0.06, ease: 'power2.inOut' })
          .to(selectedEl, { x: -3, duration: 0.05, ease: 'power2.inOut' })
          .to(selectedEl, { x: 0, duration: 0.04, ease: 'power2.out' });

        // Flash red border
        gsap.fromTo(selectedEl,
          { borderColor: 'rgba(220, 38, 38, 0.9)', boxShadow: '0 0 18px rgba(220, 38, 38, 0.6)' },
          { borderColor: 'rgba(220, 38, 38, 0.3)', boxShadow: '0 0 0px rgba(220, 38, 38, 0)', duration: 0.5, ease: 'power2.out' }
        );

        // Spawn red particles
        setTimeout(() => spawnParticles(selectedEl, '#ef4444', 6), 80);

        // Also animate the correct answer with a subtle green highlight
        const correctEl = optionRefs.current[currentQ.answer];
        if (correctEl && correctEl !== selectedEl) {
          gsap.fromTo(correctEl,
            { borderColor: 'rgba(22, 163, 74, 0)', boxShadow: '0 0 0px rgba(22, 163, 74, 0)' },
            {
              borderColor: 'rgba(22, 163, 74, 0.5)',
              boxShadow: '0 0 12px rgba(22, 163, 74, 0.25)',
              delay: 0.4,
              duration: 0.35,
              ease: 'power2.out'
            }
          );
        }
      }
    }
  }, [quizSubmitted, quizQuestionIdx]);

  if (!isOpen || !quizList) return null;
  const currentQ = quizList[quizQuestionIdx];

  const handleFinishQuiz = () => {
    onCompleteQuiz(quizCorrectCount, quizList.length);
    setQuizStep('completed');
  };

  const startQuiz = () => {
    setQuizStep('question');
    setQuizQuestionIdx(0);
    setQuizCorrectCount(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
    optionRefs.current = [];
  };

  const goNextQuestion = () => {
    setQuizQuestionIdx(prev => prev + 1);
    setQuizSubmitted(false);
  };

  const submitAnswer = () => {
    setQuizSubmitted(true);
    const isCorrect = quizAnswers[quizQuestionIdx] === currentQ.answer;
    if (isCorrect) {
      setQuizCorrectCount(prev => prev + 1);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '720px', borderRadius: '16px', maxHeight: '95vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={modalHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HelpCircle size={20} style={{ color: 'var(--success)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
              《{nodeTitle || "知识测验"}》自适应画像能力评估
            </h3>
          </div>
          <button onClick={onClose} style={modalCloseButtonStyle}>
            <X size={16} />
          </button>
        </div>

        {/* Intro Screen */}
        {quizStep === 'intro' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px 8px', textAlign: 'center', alignItems: 'center' }}>
            <div style={{ padding: '16px', borderRadius: '50%', background: 'rgba(21, 128, 61, 0.05)', border: '1px solid rgba(21, 128, 61, 0.15)', display: 'inline-flex' }}>
              <HelpCircle size={44} style={{ color: 'var(--success)' }} />
            </div>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>自适应能力评估说明</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.6', maxWidth: '480px' }}>
                本测验由<b>画像智能体</b>根据您当前的 6 维认知数据精心抽取，包含 {quizList.length} 道诊断题。
                答题结果将直接回传，对您的雷达图进行精细微调。做错题会导致画像「知识库」与「活跃度」指标下调并自动优化后续路径推荐。
              </p>
            </div>
            <button
              className="cyber-btn"
              style={{ padding: '12px 36px', background: 'var(--success)', color: '#ffffff', border: 'none', boxShadow: '0 4px 14px rgba(21, 128, 61, 0.3)' }}
              onClick={startQuiz}
            >
              开启自适应评测
            </button>
          </div>
        )}

        {/* Question Screen */}
        {quizStep === 'question' && (
          <div ref={questionCardRef} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '8px 0' }}>
            {/* Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>评测进度: {quizQuestionIdx + 1} / {quizList.length}</span>
              <span>当前正确数: {quizCorrectCount}</span>
            </div>

            {/* Question Text */}
            <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', borderLeft: '4px solid var(--success)' }}>
              <p style={{ fontSize: '14.5px', fontWeight: '800', lineHeight: '1.6', color: 'var(--text-main)' }}>
                {currentQ?.question}
              </p>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentQ?.options.map((option, idx) => {
                const isSelected = quizAnswers[quizQuestionIdx] === idx;
                const isCorrect = idx === currentQ.answer;

                let optionBg = 'rgba(0,0,0,0.02)';
                let optionBorder = '1px solid rgba(0,0,0,0.05)';

                if (quizSubmitted) {
                  if (isCorrect) {
                    optionBg = 'rgba(22, 163, 74, 0.08)';
                    optionBorder = '1px solid rgba(22, 163, 74, 0.3)';
                  } else if (isSelected) {
                    optionBg = 'rgba(220, 38, 38, 0.08)';
                    optionBorder = '1px solid rgba(220, 38, 38, 0.3)';
                  }
                } else if (isSelected) {
                  optionBg = 'rgba(15, 118, 110, 0.05)';
                  optionBorder = '1px solid var(--primary)';
                }

                return (
                  <div
                    key={idx}
                    ref={el => optionRefs.current[idx] = el}
                    onClick={() => {
                      if (!quizSubmitted) {
                        setQuizAnswers(prev => ({ ...prev, [quizQuestionIdx]: idx }));
                      }
                    }}
                    style={{
                      padding: '14px 20px',
                      borderRadius: '12px',
                      background: optionBg,
                      border: optionBorder,
                      cursor: quizSubmitted ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background 0.2s, border-color 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '13.5px', color: 'var(--text-main)' }}>{option}</span>
                    {quizSubmitted && isCorrect && <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />}
                    {quizSubmitted && isSelected && !isCorrect && <X size={16} style={{ color: '#ef4444' }} />}
                  </div>
                );
              })}
            </div>

            {/* Feedback Explanation */}
            {quizSubmitted && (
              <div style={{ padding: '16px 20px', background: 'rgba(30, 41, 59, 0.03)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Info size={14} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)' }}>智能导师错误分析诊断：</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {currentQ?.explanation}
                </p>
              </div>
            )}

            {/* Quiz Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              {!quizSubmitted ? (
                <button
                  className="cyber-btn"
                  disabled={quizAnswers[quizQuestionIdx] === undefined}
                  onClick={submitAnswer}
                  style={{ padding: '10px 24px', opacity: quizAnswers[quizQuestionIdx] === undefined ? 0.5 : 1 }}
                >
                  提交答案
                </button>
              ) : (
                quizQuestionIdx < quizList.length - 1 ? (
                  <button
                    className="cyber-btn"
                    onClick={goNextQuestion}
                    style={{ padding: '10px 24px' }}
                  >
                    下一题 <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                  </button>
                ) : (
                  <button
                    className="cyber-btn"
                    onClick={handleFinishQuiz}
                    style={{ padding: '10px 24px', background: 'var(--success)', borderColor: 'var(--success)', color: '#ffffff' }}
                  >
                    完成诊断并同步画像 <Sparkles size={16} style={{ marginLeft: '6px' }} />
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Completed Screen */}
        {quizStep === 'completed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px 8px', textAlign: 'center', alignItems: 'center' }}>
            <div style={{ padding: '20px', borderRadius: '50%', background: 'rgba(21, 128, 61, 0.08)', display: 'inline-flex' }}>
              <PartyPopper size={54} style={{ color: 'var(--success)' }} />
            </div>
            <div>
              <h4 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '8px' }}>画像评估同步成功</h4>
              <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--success)', margin: '14px 0' }}>
                正确率 {Math.round((quizCorrectCount / quizList.length) * 100)}%
                <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: '500', marginLeft: '8px' }}>
                  ({quizCorrectCount} / {quizList.length} 正确)
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.6', maxWidth: '440px' }}>
                {quizCorrectCount === quizList.length
                  ? "优秀！您已完全通过本关评测。画像指标的「知识库」得到了大幅提升！"
                  : "评测完成。画像智能体已根据您的易错倾向对认知模型参数进行了微调，建议查收新生成的个性化推荐进行针对性突破。"}
              </p>
            </div>
            <button
              className="cyber-btn"
              style={{ padding: '10px 32px' }}
              onClick={onClose}
            >
              返回学术工作台
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
