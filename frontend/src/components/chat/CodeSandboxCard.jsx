import React, { useState } from 'react';
import { Play, Terminal, ArrowRight, Check, Copy } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { apiPost } from '../../utils/api';

export default function CodeSandboxCard({ code, lang }) {
  const { sandbox: sandboxHook, setActiveTab } = useAppContext();
  const [editableCode, setEditableCode] = useState(code);
  const [isRunning, setIsRunning] = useState(false);
  const [runLogs, setRunLogs] = useState([]);
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(editableCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setRunLogs(['$ python demo.py', '🤖 [安全校验智能体] 正在扫描代码特征与安全检测...', '⚡ 正在装载虚拟沙箱运行代码...']);

    try {
      const response = await apiPost('/sandbox/run_raw', { code: editableCode });
      if (response.status === 'success') {
        const consoleLines = (response.console_output || '').split('\n');
        setRunLogs(prev => [
          ...prev,
          ...consoleLines,
          '\n✅ 运行完毕。'
        ]);
      } else {
        const consoleLines = (response.console_output || '').split('\n').filter(Boolean);
        const errorLines = (response.error || '').split('\n').filter(Boolean);
        setRunLogs(prev => [
          ...prev,
          ...consoleLines,
          ...errorLines.map(line => `❌ ${line}`),
          '\n❌ 运行失败。'
        ]);
      }
    } catch (err) {
      setRunLogs(prev => [
        ...prev,
        `❌ 网络异常或接口错误：${err.message}`
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleImport = () => {
    sandboxHook.setSandboxCode(editableCode);
    setActiveTab('sandbox');
  };

  const lineCount = editableCode.split('\n').length;

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
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginLeft: '10px', fontFamily: 'monospace' }}>demo.{lang === 'python' ? 'py' : lang} (可编辑)</span>
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

      {/* Code Content - Editable Textarea */}
      <textarea
        value={editableCode}
        onChange={(e) => setEditableCode(e.target.value)}
        rows={Math.max(5, Math.min(20, lineCount))}
        spellCheck="false"
        style={{
          width: '100%',
          display: 'block',
          boxSizing: 'border-box',
          margin: 0,
          padding: '16px',
          fontSize: '12px',
          color: '#e2e8f0',
          fontFamily: 'monospace',
          lineHeight: '1.6',
          textAlign: 'left',
          background: '#09090b',
          border: 'none',
          resize: 'vertical',
          outline: 'none'
        }}
      />

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
