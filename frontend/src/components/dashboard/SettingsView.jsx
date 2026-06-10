import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Trash2, Edit, ChevronDown, ChevronUp, Check, 
  RefreshCw, Key, Database, Cpu, Settings, Sliders, Globe
} from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '../../utils/api';

export default function SettingsView() {
  const [activeSubTab, setActiveSubTab] = useState('providers'); // 'providers' | 'routing'
  const [providers, setProviders] = useState([]);
  const [routing, setRouting] = useState({
    chat_provider_id: 'xunfei',
    chat_model: 'generalv3.5',
    planner_provider_id: 'xunfei',
    planner_model: 'generalv3.5',
    diagnostics_provider_id: 'xunfei',
    diagnostics_model: 'generalv3.5',
    resources_provider_id: 'xunfei',
    resources_model: 'generalv3.5'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProviders, setExpandedProviders] = useState({ xunfei: true });
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [testResult, setTestResult] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  // Form states for adding/editing provider
  const [editingProvider, setEditingProvider] = useState(null);
  const [formData, setFormData] = useState({
    provider_id: '',
    provider_name: '',
    api_base: '',
    api_key: '',
    is_enabled: true,
    models_raw: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const provs = await apiGet('/settings/providers');
      setProviders(provs);
      const rout = await apiGet('/settings/routing');
      setRouting(rout);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setErrorMessage('加载配置信息失败，请稍后重试。');
    }
  };

  const toggleProviderEnabled = async (providerId, currentStatus) => {
    try {
      const provider = providers.find(p => p.provider_id === providerId);
      if (!provider) return;

      const updated = {
        ...provider,
        is_enabled: !currentStatus
      };

      await apiPost('/settings/providers', updated);
      fetchSettings();
    } catch (err) {
      alert('更改启用状态失败: ' + err.message);
    }
  };

  const handleToggleModel = async (providerId, modelName) => {
    try {
      const provider = providers.find(p => p.provider_id === providerId);
      if (!provider) return;

      const updatedModels = provider.models.map(m => {
        if (m.name === modelName) {
          return { ...m, enabled: !m.enabled };
        }
        return m;
      });

      const updated = {
        ...provider,
        models: updatedModels
      };

      await apiPost('/settings/providers', updated);
      fetchSettings();
    } catch (err) {
      alert('更新模型状态失败: ' + err.message);
    }
  };

  const handleTestProvider = async (providerId) => {
    setTestingId(providerId);
    setTestResult(prev => ({ ...prev, [providerId]: null }));
    try {
      const res = await apiPost(`/settings/providers/${providerId}/test`);
      setTestResult(prev => ({ 
        ...prev, 
        [providerId]: { success: res.success, message: res.message } 
      }));
    } catch (err) {
      setTestResult(prev => ({ 
        ...prev, 
        [providerId]: { success: false, message: err.message } 
      }));
    } finally {
      setTestingId(null);
    }
  };

  const handleDeleteProvider = async (providerId) => {
    if (providerId === 'xunfei') {
      alert('无法删除内置讯飞星火服务商。');
      return;
    }
    if (!window.confirm('您确定要删除此模型服务商吗？所有绑定的路由将重置为讯飞星火。')) return;
    
    try {
      await apiDelete(`/settings/providers/${providerId}`);
      fetchSettings();
    } catch (err) {
      alert('删除服务商失败: ' + err.message);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProvider(null);
    setFormData({
      provider_id: '',
      provider_name: '',
      api_base: '',
      api_key: '',
      is_enabled: true,
      models_raw: 'gpt-3.5-turbo, gpt-4o'
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (provider) => {
    setEditingProvider(provider.provider_id);
    setFormData({
      provider_id: provider.provider_id,
      provider_name: provider.provider_name,
      api_base: provider.api_base,
      api_key: provider.api_key, // Will be "••••••••"
      is_enabled: provider.is_enabled,
      models_raw: provider.models.map(m => m.name).join(', ')
    });
    setShowAddModal(true);
  };

  const handleSaveProvider = async (e) => {
    e.preventDefault();
    try {
      const modelsList = formData.models_raw.split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0)
        .map(name => {
          // If we are editing, try to preserve the existing model tags and status
          let existingModel = null;
          if (editingProvider) {
            const old = providers.find(p => p.provider_id === editingProvider);
            if (old) {
              existingModel = old.models.find(m => m.name === name);
            }
          }
          
          return {
            name,
            enabled: existingModel ? existingModel.enabled : true,
            tags: existingModel ? existingModel.tags : (name.includes('4') || name.includes('pro') ? ['推理', '上下文 128K'] : ['快显', '上下文 8K'])
          };
        });

      const payload = {
        provider_id: formData.provider_id,
        provider_name: formData.provider_name,
        api_base: formData.api_base,
        api_key: formData.api_key,
        is_enabled: formData.is_enabled,
        models: modelsList
      };

      await apiPost('/settings/providers', payload);
      setShowAddModal(false);
      fetchSettings();
    } catch (err) {
      alert('保存供应商配置失败: ' + err.message);
    }
  };

  const handleSaveRouting = async (field, value) => {
    // Value represents e.g. "provider_id|model_name"
    const [pId, modelName] = value.split('|');
    const newRouting = {
      ...routing,
      [`${field}_provider_id`]: pId,
      [`${field}_model`]: modelName
    };
    setRouting(newRouting);
    try {
      await apiPost('/settings/routing', newRouting);
    } catch (err) {
      alert('保存路由绑定失败: ' + err.message);
    }
  };

  // Compile a list of all enabled models for select dropdowns
  const getEnabledModelsList = () => {
    const list = [];
    providers.forEach(p => {
      if (p.is_enabled) {
        p.models.forEach(m => {
          if (m.enabled) {
            list.push({
              provider_id: p.provider_id,
              provider_name: p.provider_name,
              model_name: m.name
            });
          }
        });
      }
    });
    return list;
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%', color: 'var(--text-main)' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }} className="neon-text-gradient">
            <Settings size={22} style={{ color: 'var(--primary-neon)' }} /> 系统设置
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            在此配置多供应商大模型 API 凭证，分配不同智能体角色的模型路由。
          </p>
        </div>
      </div>

      {errorMessage && (
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '12px 20px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px' }}>
          {errorMessage}
        </div>
      )}

      {/* Main Dual-pane Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '32px', minHeight: '600px' }}>
        {/* Left Sub-sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderRight: '1px solid var(--border-neon)', paddingRight: '20px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 12px' }}>模型与工具</span>
          
          <button
            onClick={() => setActiveSubTab('providers')}
            className={`cyber-nav-tab ${activeSubTab === 'providers' ? 'active' : ''}`}
            style={{ width: '100%', textAlign: 'left', background: activeSubTab === 'providers' ? 'var(--bg-card-active)' : 'transparent', cursor: 'pointer', outline: 'none' }}
          >
            <Database size={16} />
            <span style={{ fontSize: '13px' }}>模型供应商</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('routing')}
            className={`cyber-nav-tab ${activeSubTab === 'routing' ? 'active' : ''}`}
            style={{ width: '100%', textAlign: 'left', background: activeSubTab === 'routing' ? 'var(--bg-card-active)' : 'transparent', cursor: 'pointer', outline: 'none' }}
          >
            <Cpu size={16} />
            <span style={{ fontSize: '13px' }}>默认模型绑定</span>
          </button>
          
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '16px 12px 6px' }}>系统功能(开发中)</span>
          <div className="cyber-nav-tab" style={{ opacity: 0.45, cursor: 'not-allowed' }}>
            <Globe size={16} />
            <span style={{ fontSize: '13px' }}>联网搜索</span>
          </div>
          <div className="cyber-nav-tab" style={{ opacity: 0.45, cursor: 'not-allowed' }}>
            <Sliders size={16} />
            <span style={{ fontSize: '13px' }}>提示词模板</span>
          </div>
        </div>

        {/* Right Content Pane */}
        <div>
          {/* TAB 1: PROVIDERS */}
          {activeSubTab === 'providers' && (
            <div>
              {/* Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ position: 'relative', width: '320px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-dim)' }} />
                  <input
                    type="text"
                    placeholder="搜索模型名称..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="cyber-input"
                    style={{ paddingLeft: '36px', height: '34px', fontSize: '12px', borderRadius: '10px' }}
                  />
                </div>
                
                <button onClick={handleOpenAddModal} className="cyber-btn" style={{ padding: '8px 16px', fontSize: '12px' }}>
                  <Plus size={14} style={{ marginRight: '6px' }} /> 添加模型服务
                </button>
              </div>

              {/* Provider List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {providers.map(p => {
                  const isExpanded = !!expandedProviders[p.provider_id];
                  const filteredModels = p.models.filter(m => 
                    m.name.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  return (
                    <div 
                      key={p.provider_id} 
                      className="cyber-card" 
                      style={{ 
                        background: 'var(--bg-card-glass)', 
                        borderColor: p.is_enabled ? 'var(--border-neon)' : 'rgba(255,255,255,0.03)',
                        opacity: p.is_enabled ? 1 : 0.7,
                        transition: 'opacity 0.3s'
                      }}
                    >
                      {/* Card Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: isExpanded ? '1px solid rgba(15, 118, 110, 0.08)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {p.provider_name}
                            {p.provider_id === 'xunfei' && (
                              <span className="neon-badge neon-badge-primary" style={{ fontSize: '9px', padding: '1px 5px' }}>系统内置</span>
                            )}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>{p.api_base}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* Enable Toggle Switch */}
                          <label className="switch-container" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={p.is_enabled}
                              onChange={() => toggleProviderEnabled(p.provider_id, p.is_enabled)}
                              style={{ display: 'none' }}
                            />
                            <div className={`switch-slider ${p.is_enabled ? 'active' : ''}`} style={{
                              width: '38px',
                              height: '20px',
                              borderRadius: '10px',
                              background: p.is_enabled ? 'var(--primary-neon)' : 'rgba(255,255,255,0.08)',
                              position: 'relative',
                              transition: 'background 0.3s'
                            }}>
                              <div style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                background: '#fff',
                                position: 'absolute',
                                top: '3px',
                                left: p.is_enabled ? '21px' : '3px',
                                transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                              }} />
                            </div>
                          </label>

                          <button 
                            onClick={() => handleTestProvider(p.provider_id)}
                            disabled={testingId === p.provider_id}
                            className="cyber-btn" 
                            style={{ padding: '6px 10px', fontSize: '10px', minHeight: '26px', background: 'rgba(15, 118, 110, 0.04)', borderColor: 'rgba(15, 118, 110, 0.12)' }}
                          >
                            {testingId === p.provider_id ? <RefreshCw size={10} className="spin-anim" /> : '测试连接'}
                          </button>

                          <button 
                            onClick={() => handleOpenEditModal(p)}
                            className="cyber-btn"
                            style={{ padding: '6px 8px', minHeight: '26px', background: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.05)' }}
                            title="修改供应商配置"
                          >
                            <Edit size={12} />
                          </button>

                          {p.provider_id !== 'xunfei' && (
                            <button 
                              onClick={() => handleDeleteProvider(p.provider_id)}
                              className="cyber-btn"
                              style={{ padding: '6px 8px', minHeight: '26px', background: 'rgba(190, 18, 60, 0.05)', borderColor: 'rgba(190, 18, 60, 0.1)' }}
                              title="删除供应商"
                            >
                              <Trash2 size={12} style={{ color: 'var(--danger)' }} />
                            </button>
                          )}

                          <button
                            onClick={() => setExpandedProviders(prev => ({ ...prev, [p.provider_id]: !prev[p.provider_id] }))}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Card Content (Models list) */}
                      {isExpanded && (
                        <div style={{ padding: '20px' }}>
                          {testResult[p.provider_id] && (
                            <div style={{
                              background: testResult[p.provider_id].success ? 'rgba(21, 128, 61, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                              border: testResult[p.provider_id].success ? '1px solid rgba(21, 128, 61, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                              color: testResult[p.provider_id].success ? 'var(--success)' : 'var(--danger)',
                              padding: '10px 16px',
                              borderRadius: '10px',
                              fontSize: '12px',
                              marginBottom: '16px'
                            }}>
                              {testResult[p.provider_id].message}
                            </div>
                          )}

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {filteredModels.length === 0 ? (
                              <p style={{ color: 'var(--text-dim)', fontSize: '12px', padding: '10px 0' }}>未找到匹配的模型名称。</p>
                            ) : (
                              filteredModels.map(m => (
                                <div 
                                  key={m.name} 
                                  style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between', 
                                    padding: '10px 16px', 
                                    background: 'var(--bg-card-active)', 
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.02)'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '600', fontFamily: 'monospace' }}>{m.name}</span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      {m.tags && m.tags.map((tag, tIdx) => (
                                        <span key={tIdx} className="neon-badge neon-badge-primary" style={{ fontSize: '9px', padding: '0px 5px', opacity: m.enabled ? 0.75 : 0.35 }}>
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Toggle Switch */}
                                  <label className="switch-container" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                      type="checkbox"
                                      checked={m.enabled}
                                      onChange={() => handleToggleModel(p.provider_id, m.name)}
                                      style={{ display: 'none' }}
                                    />
                                    <div className={`switch-slider ${m.enabled ? 'active' : ''}`} style={{
                                      width: '32px',
                                      height: '16px',
                                      borderRadius: '8px',
                                      background: m.enabled ? 'var(--primary-neon)' : 'rgba(255,255,255,0.06)',
                                      position: 'relative',
                                      transition: 'background 0.3s'
                                    }}>
                                      <div style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        background: '#fff',
                                        position: 'absolute',
                                        top: '3px',
                                        left: m.enabled ? '19px' : '3px',
                                        transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                                      }} />
                                    </div>
                                  </label>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ROUTING */}
          {activeSubTab === 'routing' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px' }}>智能体模型路由绑定</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  您可以将各个特定教育环节的 AI 角色指定路由到任意已启用的模型服务上。
                </p>
              </div>

              {/* Routing Matrix Card */}
              <div className="cyber-card" style={{ background: 'var(--bg-card-glass)', padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {[
                    {
                      label: '💬 AI 助教聊天 (Tutor Chat)',
                      desc: '负责学生学习过程中的日常问答、答疑解析及情境画像修正。',
                      field: 'chat',
                      activeVal: `${routing.chat_provider_id}|${routing.chat_model}`
                    },
                    {
                      label: '🗺️ 路径大纲规划 (Path Planner)',
                      desc: '负责将学生的学习目标转化为 8 级自适应关卡，定制个性化大纲。',
                      field: 'planner',
                      activeVal: `${routing.planner_provider_id}|${routing.planner_model}`
                    },
                    {
                      label: '💡 错题诊断归档 (Diagnostics)',
                      desc: '负责代码沙盒异常的编译报告提取以及错题强化测验题的逆向生成。',
                      field: 'diagnostics',
                      activeVal: `${routing.diagnostics_provider_id}|${routing.diagnostics_model}`
                    },
                    {
                      label: '📂 学术资源生成 (Resource Generator)',
                      desc: '负责生成 PDF 课件讲义、PPT 展示卡片及 Mermaid 结构脑图。',
                      field: 'resources',
                      activeVal: `${routing.resources_provider_id}|${routing.resources_model}`
                    }
                  ].map(item => {
                    const enabledModels = getEnabledModelsList();
                    
                    return (
                      <div key={item.field} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        paddingBottom: '20px', 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        gap: '20px'
                      }}>
                        <div style={{ maxWidth: '560px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{item.label}</h4>
                          <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>{item.desc}</p>
                        </div>

                        <div>
                          <select
                            value={item.activeVal}
                            onChange={(e) => handleSaveRouting(item.field, e.target.value)}
                            className="cyber-input"
                            style={{ width: '260px', height: '36px', fontSize: '12px', borderRadius: '10px', cursor: 'pointer', background: 'var(--bg-card-solid)', border: '1px solid var(--border-neon)', color: 'var(--text-main)' }}
                          >
                            {enabledModels.map((m, mIdx) => (
                              <option key={mIdx} value={`${m.provider_id}|${m.model_name}`}>
                                {m.provider_name} — {m.model_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Provider Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999
        }}>
          <div className="cyber-card" style={{
            width: '520px',
            background: 'var(--bg-card-solid)',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '18px' }}>
              {editingProvider ? '编辑模型服务' : '添加大模型服务'}
            </h3>

            <form onSubmit={handleSaveProvider} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>供应商 ID (唯一标识符)</label>
                <input
                  type="text"
                  placeholder="如: deepseek, openrouter, local_ollama"
                  required
                  disabled={!!editingProvider}
                  value={formData.provider_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider_id: e.target.value }))}
                  className="cyber-input"
                  style={{ height: '38px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>名称</label>
                <input
                  type="text"
                  placeholder="如: DeepSeek 官方服务"
                  required
                  value={formData.provider_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider_name: e.target.value }))}
                  className="cyber-input"
                  style={{ height: '38px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>API 地址 (Base URL)</label>
                <input
                  type="text"
                  placeholder="如: https://api.deepseek.com/v1"
                  required
                  value={formData.api_base}
                  onChange={(e) => setFormData(prev => ({ ...prev, api_base: e.target.value }))}
                  className="cyber-input"
                  style={{ height: '38px', fontSize: '13px', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>API 密钥 (API Key)</label>
                <input
                  type="password"
                  placeholder="输入 API Key 密钥"
                  required
                  value={formData.api_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                  className="cyber-input"
                  style={{ height: '38px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>可用模型名称 (英文逗号分隔)</label>
                <input
                  type="text"
                  placeholder="如: gpt-3.5-turbo, gpt-4o, gpt-4-turbo"
                  required
                  value={formData.models_raw}
                  onChange={(e) => setFormData(prev => ({ ...prev, models_raw: e.target.value }))}
                  className="cyber-input"
                  style={{ height: '38px', fontSize: '13px', fontFamily: 'monospace' }}
                />
                <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                  填写该服务商下支持的模型名称，保存后可单独开关启用状态。
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="cyber-btn"
                  style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="cyber-btn"
                  style={{ padding: '8px 20px' }}
                >
                  保存配置
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
