import React, { useState } from 'react';
import { X, HelpCircle, CheckCircle2, ArrowRight, Info, Sparkles } from 'lucide-react';

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

export default function QuizModal({ isOpen, onClose, quizList, nodeTitle, onCompleteQuiz }) {
  const [quizStep, setQuizStep] = useState('intro'); // 'intro' | 'question' | 'completed'
  const [quizQuestionIdx, setQuizQuestionIdx] = useState(0);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  if (!isOpen || !quizList) return null;
  const currentQ = quizList[quizQuestionIdx];

  const handleFinishQuiz = () => {
    onCompleteQuiz(quizCorrectCount, quizList.length);
    setQuizStep('completed');
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '720px', borderRadius: '16px', maxHeight: '95vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={modalHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HelpCircle size={20} style={{ color: 'var(--success)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
              《{nodeTitle || "Python Basics"}》自适应画像能力评测
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
              <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>自适应能力评测说明</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.6', maxWidth: '480px' }}>
                本测验由**画像智能体**根据您当前的 6 维认知数据精心抽取，包含 {quizList.length} 道诊断题。
                答题结果将直接回传，对您的雷达图进行精细微调。做错题会导致画像‘知识库’与‘活跃度’指标下调并自动优化后继路径推荐！
              </p>
            </div>
            <button
              className="cyber-btn"
              style={{ padding: '12px 36px', background: 'var(--success)', color: '#ffffff', border: 'none', boxShadow: '0 4px 14px rgba(21, 128, 61, 0.3)' }}
              onClick={() => {
                setQuizStep('question');
                setQuizQuestionIdx(0);
                setQuizCorrectCount(0);
                setQuizAnswers({});
                setQuizSubmitted(false);
              }}
            >
              开启自适应评测
            </button>
          </div>
        )}

        {/* Question Screen */}
        {quizStep === 'question' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '8px 0' }}>
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
                let optionAnimation = 'none';

                if (quizSubmitted) {
                  if (isCorrect) {
                    optionBg = 'rgba(22, 163, 74, 0.08)';
                    optionBorder = '1px solid rgba(22, 163, 74, 0.3)';
                    if (isSelected) {
                      optionAnimation = 'successPulse 0.45s ease-in-out';
                    }
                  } else if (isSelected) {
                    optionBg = 'rgba(220, 38, 38, 0.08)';
                    optionBorder = '1px solid rgba(220, 38, 38, 0.3)';
                    optionAnimation = 'errorShake 0.45s ease-in-out';
                  }
                } else if (isSelected) {
                  optionBg = 'rgba(15, 118, 110, 0.05)';
                  optionBorder = '1px solid var(--primary)';
                }

                return (
                  <div
                    key={idx}
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
                      transition: 'all 0.2s',
                      animation: optionAnimation
                    }}
                  >
                    <span style={{ fontSize: '13.5px', color: 'var(--text-main)' }}>{option}</span>
                    {quizSubmitted && isCorrect && <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />}
                    {quizSubmitted && isSelected && !isCorrect && <X size={16} style={{ color: '#ef4444' }} />}
                  </div>
                );
              })}
            </div>

            {/* Custom Animation Keyframes Injection */}
            <style>{`
              @keyframes errorShake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-6px); }
                40%, 80% { transform: translateX(6px); }
              }
              @keyframes successPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.03); box-shadow: 0 0 12px rgba(22, 163, 74, 0.4); }
                100% { transform: scale(1); }
              }
            `}</style>

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
                  onClick={() => {
                    setQuizSubmitted(true);
                    const isCorrect = quizAnswers[quizQuestionIdx] === currentQ.answer;
                    if (isCorrect) {
                      setQuizCorrectCount(prev => prev + 1);
                    }
                  }}
                  style={{ padding: '10px 24px', opacity: quizAnswers[quizQuestionIdx] === undefined ? 0.5 : 1 }}
                >
                  提交答案
                </button>
              ) : (
                quizQuestionIdx < quizList.length - 1 ? (
                  <button
                    className="cyber-btn"
                    onClick={() => {
                      setQuizQuestionIdx(prev => prev + 1);
                      setQuizSubmitted(false);
                    }}
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
              <CheckCircle2 size={54} style={{ color: 'var(--success)' }} />
            </div>
            <div>
              <h4 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '8px' }}>画像评估同步成功</h4>
              <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--success)', margin: '14px 0' }}>
                正确率: {Math.round((quizCorrectCount / quizList.length) * 100)}%
                <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: '500', marginLeft: '8px' }}>
                  ({quizCorrectCount} / {quizList.length} 正确)
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.6', maxWidth: '440px' }}>
                {quizCorrectCount === quizList.length
                  ? "优秀！您已完全通过本关评测。画像指标的‘知识库’得到了大幅提升！"
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
