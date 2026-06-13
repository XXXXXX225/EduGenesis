import React from 'react';
import { X } from 'lucide-react';
import SettingsView from '../dashboard/SettingsView';

export default function SettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" style={{ zIndex: 1100 }}>
      <div className="cyber-card modal-content" style={{ maxWidth: '900px', width: '90%', maxHeight: '85vh', overflowY: 'auto', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-neon)', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800' }}>⚙️ 模型服务及系统配置</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <SettingsView />
      </div>
    </div>
  );
}
