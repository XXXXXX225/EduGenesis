import React from 'react';
import {
  Home, BookOpen, MessageSquare, FolderGit2,
  AlertTriangle, Monitor, Trophy, Settings
} from 'lucide-react';

// 移动端底部导航栏 — 仅在窄屏显示
const tabs = [
  { id: 'home', icon: Home, label: '首页' },
  { id: 'path', icon: BookOpen, label: '路径' },
  { id: 'chat', icon: MessageSquare, label: '对话' },
  { id: 'sandbox', icon: FolderGit2, label: '沙盒' },
  { id: 'errors', icon: AlertTriangle, label: '错题' },
  { id: 'agent-console', icon: Monitor, label: '控制台' },
  { id: 'achievements', icon: Trophy, label: '成就' },
];

function MobileTabBar({ activeTab, onTabChange, onSettingsOpen }) {
  return (
    <nav className="mobile-tab-bar">
      {tabs.map((tab) => {
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
