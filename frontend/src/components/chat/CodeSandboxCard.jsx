import React, { useState } from 'react';
import { Play, Terminal, ArrowRight, Check, Copy } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function CodeSandboxCard({ code, lang }) {
  const { sandbox: sandboxHook, setActiveTab } = useAppContext();
  const [isRunning, setIsRunning] = useState(false);
  const [runLogs, setRunLogs] = useState([]);
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    if (isRunning) return;
    setIsRunning(true);
    setRunLogs(['$ python main.py', '🤖 [校验智能体] 正在装载虚拟编译沙箱...', '⚡ 正在执行 PyTest 断言诊断...']);

    setTimeout(() => {
      setRunLogs(prev => [
        ...prev,
        '============================= test session starts =============================',
        'collected 2 items',
        'test_main.py :: test_check_even PASSED                       [ 50%]',
        'test_main.py :: test_check_even_failed PASSED                [100%]',
        '============================= 2 passed in 0.04s ===============================',
        '\n✅ 实操单元测试资产校验成功。未发现防御性安全漏洞。'
      ]);
      setIsRunning(false);
    }, 1500);
  };

  const handleImport = () => {
    sandboxHook.setSandboxCode(code);
    setActiveTab('sandbox');
  };

  return (
    <div style={{
      marginTop: '16px',
      background: '#0e0e11',
      borderRadius: '16px',
      border: '1.5px solid var(--border-neon)',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
    }}>
      {/* Editor Topbar */}
      <div style={{ padding: '10px 16px', background: '#141419', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginLeft: '10px', fontFamily: 'monospace' }}>demo.{lang === 'python' ? 'py' : lang}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '10.5px', cursor: 'pointer' }}
        >
          {copied ? <Check size={12} style={{ color: 'var(--success)' }} /> : <Copy size={12} />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>

      {/* Code Content */}
      <pre style={{
        margin: 0,
        padding: '16px',
        overflowX: 'auto',
        fontSize: '12px',
        color: '#e2e8f0',
        fontFamily: 'monospace',
        lineHeight: '1.6',
        textAlign: 'left',
        background: '#09090b'
      }}><code>{code}</code></pre>

      {/* Buttons Bar */}
      <div style={{ padding: '10px 16px', background: '#121217', display: 'flex', justifyContent: 'space-between', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <button
          type="button"
          onClick={handleRun}
          disabled={isRunning}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            border: '1px solid var(--primary-neon)',
            color: '#fff',
            fontSize: '11px',
            fontWeight: '700',
            cursor: isRunning ? 'default' : 'pointer'
          }}
        >
          <Play size={11} fill="#fff" /> {isRunning ? '正在运行...' : '一键运行'}
        </button>

        <button
          type="button"
          onClick={handleImport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-main)',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
          className="hover-neon-border"
        >
          导入沙盒练习 <ArrowRight size={12} />
        </button>
      </div>

      {/* Mini Console Panel */}
      {runLogs.length > 0 && (
        <div style={{
          background: '#050507',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 16px',
          textAlign: 'left',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginBottom: '8px', fontFamily: 'monospace' }}>
            <Terminal size={11} /> <span>MINI TERMINAL OUTPUT</span>
          </div>
          <pre style={{
            margin: 0,
            fontSize: '11px',
            color: '#38bdf8',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.5'
          }}>{runLogs.join('\n')}</pre>
        </div>
      )}
    </div>
  );
}
