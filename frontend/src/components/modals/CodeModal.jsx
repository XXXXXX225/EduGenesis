import React, { useEffect } from 'react';
import { X, FileCode, BookOpen, Sparkles, Play, Cpu, Terminal } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

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

export default function CodeModal({ isOpen, onClose }) {
  const {
    selectedNode,
    setProfile,
    sandbox
  } = useAppContext();

  const {
    sandboxChallenge,
    sandboxAIAdvice,
    sandboxCode,
    setSandboxCode,
    isSandboxRunning,
    sandboxTerminal,
    runSandboxTest,
    diagnoseSandboxCode,
    fetchSandboxChallenge
  } = sandbox;

  const [consoleTab, setConsoleTab] = React.useState('terminal');

  useEffect(() => {
    if (isOpen && selectedNode) {
      fetchSandboxChallenge(selectedNode.id);
    }
  }, [isOpen, selectedNode]);

  if (!isOpen) return null;

  // Parser for [EXPLANATION] and [CODE] format
  const parseAIAdvice = (adviceText) => {
    if (!adviceText) return null;
    
    if (adviceText.includes('正在扫描代码特征中...')) {
      return { loading: true };
    }

    if (!adviceText.includes('[EXPLANATION]')) {
      const codeBlockRegex = /```python([\s\S]*?)```/;
      const match = adviceText.match(codeBlockRegex);
      const code = match ? match[1].trim() : '';
      const explanation = adviceText.replace(codeBlockRegex, '').trim();
      return { explanation, code };
    }
    
    const parts = adviceText.split('[CODE]');
    const explanationPart = parts[0].replace('[EXPLANATION]', '').trim();
    const codePart = parts[1] || '';
    
    const codeBlockRegex = /```python([\s\S]*?)```/;
    const match = codePart.match(codeBlockRegex);
    const code = match ? match[1].trim() : codePart.trim();
    
    return {
      explanation: explanationPart,
      code: code
    };
  };

  // Lookahead line-by-line diff generator
  const getDiffLines = (oldStr, newStr) => {
    const oldLines = (oldStr || '').split('\n');
    const newLines = (newStr || '').split('\n');
    const diff = [];
    
    let i = 0, j = 0;
    while (i < oldLines.length || j < newLines.length) {
      if (i < oldLines.length && j < newLines.length) {
        if (oldLines[i] === newLines[j]) {
          diff.push({ type: 'normal', oldLine: oldLines[i], newLine: newLines[j] });
          i++;
          j++;
        } else {
          let foundMatch = false;
          for (let look = 1; look <= 5; look++) {
            if (i + look < oldLines.length && oldLines[i + look] === newLines[j]) {
              for (let k = 0; k < look; k++) {
                diff.push({ type: 'delete', oldLine: oldLines[i + k], newLine: '' });
              }
              i += look;
              foundMatch = true;
              break;
            }
            if (j + look < newLines.length && oldLines[i] === newLines[j + look]) {
              for (let k = 0; k < look; k++) {
                diff.push({ type: 'add', oldLine: '', newLine: newLines[j + k] });
              }
              j += look;
              foundMatch = true;
              break;
            }
          }
          if (!foundMatch) {
            diff.push({ type: 'replace', oldLine: oldLines[i], newLine: newLines[j] });
            i++;
            j++;
          }
        }
      } else if (i < oldLines.length) {
        diff.push({ type: 'delete', oldLine: oldLines[i], newLine: '' });
        i++;
      } else if (j < newLines.length) {
        diff.push({ type: 'add', oldLine: '', newLine: newLines[j] });
        j++;
      }
    }
    return diff;
  };

  // Parser for timeline steps
  const parseSteps = (explanationText) => {
    if (!explanationText) return [];
    const lines = explanationText.split('\n');
    const steps = [];
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.match(/^\d+\.\s+/)) {
        steps.push(trimmed.replace(/^\d+\.\s+/, ''));
      } else if (trimmed) {
        if (steps.length > 0) {
          steps[steps.length - 1] += '\n' + trimmed;
        } else {
          steps.push(trimmed);
        }
      }
    });
    return steps;
  };

  return (
    <div className="modal-backdrop">
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '1000px', 
          width: '90%', 
          height: '85vh', 
          maxHeight: '85vh', 
          borderRadius: '16px', 
          display: 'flex', 
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div style={modalHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCode size={20} style={{ color: 'var(--accent)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
              《{selectedNode?.title || "Python Basics"}》 AI 编程沙盒
            </h3>
          </div>
          <button onClick={onClose} style={modalCloseButtonStyle}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body: Two-column grid */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '320px 1fr', 
            gap: '20px', 
            height: 'calc(100% - 110px)',
            overflow: 'hidden',
            marginTop: '16px'
          }}
        >
          {/* Left Column: Challenge Description */}
          <div 
            className="cyber-card" 
            style={{ 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px', 
              background: 'var(--bg-card-glass)', 
              overflowY: 'auto',
              border: '1px solid var(--border-neon)',
              borderRadius: '12px'
            }}
          >
            <h4 style={{ fontSize: '15px', fontWeight: '800', borderBottom: '1px solid var(--border-neon)', paddingBottom: '8px', color: 'var(--primary-neon)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} /> 任务详情与要求
            </h4>
            <div style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6', flexGrow: 1 }}>
              {sandboxChallenge ? (
                <>
                  <p style={{ marginBottom: '12px', fontWeight: '700' }}>题目：{sandboxChallenge.title}</p>
                  <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                    {sandboxChallenge.description}
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>正在为您的当前关卡装载学术编程挑战...</p>
              )}
            </div>
          </div>

          {/* Right Column: Editor & Terminal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflow: 'hidden', minHeight: 0 }}>
            {/* Editor Container */}
            <div className="code-editor-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div className="code-editor-header">
                <span style={{ fontSize: '12px', color: '#8e8e9f', fontFamily: 'monospace', fontWeight: '700' }}>main.py (Python 3.10)</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={async () => {
                      setConsoleTab('ai-diff');
                      await diagnoseSandboxCode();
                    }}
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#ffffff', padding: '6px 12px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Sparkles size={12} /> AI 智能诊断
                  </button>
                  <button
                    type="button"
                    disabled={isSandboxRunning}
                    onClick={() => runSandboxTest(setProfile)}
                    className="cyber-btn"
                    style={{ padding: '6px 16px', fontSize: '11px', textTransform: 'none', background: 'linear-gradient(135deg, var(--primary-neon) 0%, var(--success) 100%)', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {isSandboxRunning ? "测试中..." : <><Play size={11} fill="currentColor" /> 运行测试</>}
                  </button>
                </div>
              </div>

              <div className="code-editor-body" style={{ flexGrow: 1, display: 'flex', minHeight: 0 }}>
                <div className="code-editor-gutter">
                  {Array.from({ length: Math.max((sandboxCode || '').split('\n').length, 12) }, (_, i) => (
                    <span key={i + 1}>{i + 1}</span>
                  ))}
                </div>
                <textarea
                  value={sandboxCode || ''}
                  onChange={(e) => setSandboxCode(e.target.value)}
                  className="code-editor-textarea"
                  spellCheck="false"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>

            {/* Tabbed Console Area */}
            <div className="terminal-window" style={{ height: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {/* Tab Headers */}
              <div style={{ display: 'flex', background: '#0a0a0c', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 8px', height: '36px', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setConsoleTab('terminal')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: consoleTab === 'terminal' ? 'var(--text-main)' : 'var(--text-muted)',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    borderBottom: consoleTab === 'terminal' ? '2px solid var(--accent-cyan)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    outline: 'none'
                  }}
                >
                  <Terminal size={12} /> 终端输出
                </button>
                <button
                  onClick={() => setConsoleTab('ai-diff')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: consoleTab === 'ai-diff' ? 'var(--text-main)' : 'var(--text-muted)',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    borderBottom: consoleTab === 'ai-diff' ? '2px solid var(--primary-neon)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    position: 'relative',
                    outline: 'none'
                  }}
                >
                  <Sparkles size={12} style={{ color: sandboxAIAdvice ? 'var(--primary-neon)' : 'inherit' }} />
                  <span>AI 深度反思比对</span>
                  {sandboxAIAdvice && !sandboxAIAdvice.includes('正在扫描') && (
                    <span style={{ position: 'absolute', top: '4px', right: '2px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary-neon)', boxShadow: '0 0 6px var(--primary-neon)', animation: 'ringPulse 1.5s infinite' }}></span>
                  )}
                </button>
              </div>

              {/* Tab Body */}
              <div style={{ flexGrow: 1, overflowY: 'auto', padding: '12px', boxSizing: 'border-box', minHeight: 0 }}>
                {consoleTab === 'terminal' ? (
                  /* Terminal Console Output */
                  <div style={{ fontFamily: 'monospace', fontSize: '10.5px' }}>
                    {(sandboxTerminal || []).map((line, idx) => {
                      let className = "terminal-line";
                      if (line.includes("PASSED") || line.includes("通过")) className += " terminal-success";
                      else if (line.includes("FAILED") || line.includes("❌") || line.includes("[错误]") || line.includes("AssertionError")) className += " terminal-error";
                      else if (line.startsWith(">>>")) className += " terminal-cyan";
                      return (
                        <div key={idx} className={className}>
                          {line}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* AI CoT & Code Diff Panel */
                  <div style={{ height: '100%' }}>
                    {!sandboxAIAdvice ? (
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '11px', gap: '8px' }}>
                        <Sparkles size={18} style={{ opacity: 0.5 }} />
                        <span>尚未生成 AI 诊断，请在右上方点击“AI 智能诊断”获取。</span>
                      </div>
                    ) : parseAIAdvice(sandboxAIAdvice)?.loading ? (
                      /* Loading display */
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '10px' }}>
                        <div className="spinner-academic" style={{ width: '20px', height: '20px' }}></div>
                        <span style={{ fontSize: '11px', color: 'var(--primary-neon)', fontFamily: 'monospace' }}>
                          [画像分析智能体] 正在进行全维度学术反思与诊断...
                        </span>
                      </div>
                    ) : (
                      /* Dynamic Diff Panel */
                      (() => {
                        const parsed = parseAIAdvice(sandboxAIAdvice);
                        const steps = parseSteps(parsed?.explanation);
                        const diffLines = getDiffLines(sandboxCode || '', parsed?.code || '');
                        
                        return (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '16px', height: '100%', minHeight: 0, boxSizing: 'border-box' }}>
                            {/* Timeline steps */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', paddingRight: '4px', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
                              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary-neon)', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Cpu size={12} /> AI 推导与反思步骤
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                                {steps.map((step, idx) => (
                                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                    <span style={{ 
                                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', 
                                      color: '#ffffff', 
                                      fontSize: '8px', 
                                      fontWeight: '800', 
                                      padding: '1px 4px', 
                                      borderRadius: '3px',
                                      marginTop: '2px',
                                      fontFamily: 'monospace',
                                      boxShadow: '0 0 6px rgba(139,92,246,0.3)',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      STEP {String(idx + 1).padStart(2, '0')}
                                    </span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-main)', lineHeight: '1.45', whiteSpace: 'pre-line' }}>
                                      {step}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Side-by-side Diff code box */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0, height: '100%' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px' }}>
                                <span style={{ fontWeight: '800', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Sparkles size={12} /> 代码对比智能 Diff
                                </span>
                                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>左栏：您的代码 | 右栏：推荐修复</span>
                              </div>
                              
                              {/* Lines render container */}
                              <div style={{ 
                                flexGrow: 1,
                                display: 'flex', 
                                flexDirection: 'column', 
                                overflowY: 'auto', 
                                background: '#070709', 
                                border: '1.5px solid rgba(255,255,255,0.06)', 
                                borderRadius: '6px', 
                                fontFamily: 'monospace', 
                                fontSize: '10px',
                                lineHeight: '1.4',
                                minHeight: '110px'
                              }}>
                                {diffLines.map((line, idx) => {
                                  let leftBg = 'transparent';
                                  let rightBg = 'transparent';
                                  let leftColor = 'var(--text-muted)';
                                  let rightColor = 'var(--text-muted)';
                                  let leftSign = ' ';
                                  let rightSign = ' ';
                                  
                                  if (line.type === 'delete') {
                                    leftBg = 'rgba(239, 68, 68, 0.16)';
                                    leftColor = '#f87171';
                                    leftSign = '-';
                                    rightBg = 'repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 4px, transparent 4px, transparent 8px)';
                                  } else if (line.type === 'add') {
                                    leftBg = 'repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 4px, transparent 4px, transparent 8px)';
                                    rightBg = 'rgba(16, 185, 129, 0.16)';
                                    rightColor = '#34d399';
                                    rightSign = '+';
                                  } else if (line.type === 'replace') {
                                    leftBg = 'rgba(239, 68, 68, 0.16)';
                                    leftColor = '#f87171';
                                    leftSign = '-';
                                    rightBg = 'rgba(16, 185, 129, 0.16)';
                                    rightColor = '#34d399';
                                    rightSign = '+';
                                  } else {
                                    leftColor = '#e2e8f0';
                                    rightColor = '#e2e8f0';
                                  }
                                  
                                  return (
                                    <div key={idx} style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                      {/* Left (Student Code) */}
                                      <div style={{ flex: 1, display: 'flex', background: leftBg, padding: '2px 4px', borderRight: '1px solid rgba(255,255,255,0.04)', minWidth: 0 }}>
                                        <span style={{ width: '18px', color: 'rgba(255,255,255,0.15)', textAlign: 'right', marginRight: '6px', userSelect: 'none' }}>{line.oldLine ? idx + 1 : ''}</span>
                                        <span style={{ width: '10px', color: leftColor, marginRight: '4px', userSelect: 'none' }}>{leftSign}</span>
                                        <span style={{ color: leftColor, whiteSpace: 'pre', overflowX: 'auto', flexGrow: 1 }}>{line.oldLine}</span>
                                      </div>
                                      {/* Right (Correct Code) */}
                                      <div style={{ flex: 1, display: 'flex', background: rightBg, padding: '2px 4px', minWidth: 0 }}>
                                        <span style={{ width: '18px', color: 'rgba(255,255,255,0.15)', textAlign: 'right', marginRight: '6px', userSelect: 'none' }}>{line.newLine ? idx + 1 : ''}</span>
                                        <span style={{ width: '10px', color: rightColor, marginRight: '4px', userSelect: 'none' }}>{rightSign}</span>
                                        <span style={{ color: rightColor, whiteSpace: 'pre', overflowX: 'auto', flexGrow: 1 }}>{line.newLine}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button className="cyber-btn" onClick={onClose} style={{ padding: '8px 20px', fontSize: '12px' }}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

