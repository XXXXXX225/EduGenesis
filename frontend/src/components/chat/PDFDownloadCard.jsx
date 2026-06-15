import React from 'react';
import { FileText, Download, ArrowRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function PDFDownloadCard({ title, markdown }) {
  const { setSelectedNodeResources, setActiveModal } = useAppContext();

  const handleOpenPDF = () => {
    // Set PDF contents into active resources and trigger viewing modal
    setSelectedNodeResources(prev => ({
      ...prev,
      pdf: markdown || `# ${title}\n\n该自适应课本页面由多智能体网络同步生成。`
    }));
    setActiveModal('pdf');
  };

  return (
    <div
      onClick={handleOpenPDF}
      style={{
        marginTop: '16px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        border: '1.5px solid var(--border-neon)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}
      className="hover-neon-border"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ padding: '6px', background: 'rgba(2, 132, 199, 0.06)', borderRadius: '8px', border: '1px solid rgba(2, 132, 199, 0.15)', display: 'flex' }}>
          <FileText size={18} style={{ color: 'var(--accent-cyan)' }} />
        </div>
        <span className="neon-badge neon-badge-success" style={{ fontSize: '9px', padding: '2px 6px' }}>自适应教材已就绪</span>
      </div>
      <div>
        <h3 style={{ fontSize: '13.5px', fontWeight: '700', margin: '0 0 4px 0', color: 'var(--text-main)' }}>《{title}.pdf》</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: '1.4', margin: 0 }}>
          这是根据对话主题为您动态生成并排版好的自适应课本讲解。支持就地阅读。
        </p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px' }}>
        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Download size={11} /> 1.2 MB</span>
        <span style={{ color: 'var(--accent-cyan)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>立即阅读 <ArrowRight size={11} /></span>
      </div>
    </div>
  );
}
