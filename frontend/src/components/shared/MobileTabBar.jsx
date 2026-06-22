import React from 'react';
import {
  User, TrendingUp, MessageSquare, Code2,
  HelpCircle, Cpu, GraduationCap, Settings, Shield
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

// 移动端底部导航栏 — 仅在窄屏显示
const baseTabs = [
  { id: 'home', icon: User, label: '首页' },
  { id: 'path', icon: TrendingUp, label: '路径' },
  { id: 'chat', icon: MessageSquare, label: '对话' },
  { id: 'sandbox', icon: Code2, label: '沙盒' },
  { id: 'errors', icon: HelpCircle, label: '错题' },
  { id: 'agent-console', icon: Cpu, label: '控制台' },
  { id: 'achievements', icon: GraduationCap, label: '成就' },
];

function MobileTabBar({ activeTab, onTabChange, onSettingsOpen }) {
  const { userRole } = useAppContext();

  const visibleTabs = [...baseTabs];
  if (userRole === 'admin') {
    visibleTabs.push({ id: 'admin', icon: Shield, label: '管理' });
  }

  return (
    <nav className="mobile-tab-bar">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`mobile-tab-item${isActive ? ' active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            aria-label={tab.label}
          >
            <Icon size={20} />
            <span className="mobile-tab-label">{tab.label}</span>
          </button>
        );
      })}
      <button
        className="mobile-tab-item"
        onClick={onSettingsOpen}
        aria-label="设置"
      >
        <Settings size={20} />
        <span className="mobile-tab-label">设置</span>
      </button>
    </nav>
  );
}

export default MobileTabBar;
