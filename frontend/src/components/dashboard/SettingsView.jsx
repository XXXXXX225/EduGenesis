import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Trash2, Edit, ChevronDown, ChevronUp, Check, 
  RefreshCw, Key, Database, Cpu, Settings, Sliders, Globe, GraduationCap,
  Upload
} from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '../../utils/api';
import { useAppContext } from '../../context/AppContext';

const CustomSelect = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => `${opt.provider_id}|${opt.model_name}` === value);

  return (
    <div style={{ position: 'relative', width: '260px' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          height: '36px',
          padding: '0 16px',
          fontSize: '12px',
          borderRadius: '10px',
          cursor: 'pointer',
          background: 'var(--bg-card-solid)',
          border: '1px solid var(--border-neon)',
          color: 'var(--text-main)',
          fontFamily: 'var(--font-body)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          outline: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          transition: 'all 0.3s ease'
        }}
      >
        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {selectedOption ? `${selectedOption.provider_name} — ${selectedOption.model_name}` : '请选择模型...'}
        </span>
        <ChevronDown size={14} style={{ opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>

      {isOpen && (
        <>
          <div 
            onClick={() => setIsOpen(false)} 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} 
          />
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: 0,
              right: 0,
              background: 'var(--bg-card-solid)',
              border: '1px solid var(--border-neon)',
              borderRadius: '10px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              zIndex: 1000,
              maxHeight: '200px',
              overflowY: 'auto',
              padding: '6px'
            }}
          >
            {options.map((opt, idx) => {
              const optVal = `${opt.provider_id}|${opt.model_name}`;
              const isSelected = optVal === value;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    onChange({ target: { value: optVal } });
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--primary-neon)' : 'transparent',
                    color: isSelected ? '#ffffff' : 'var(--text-main)',
                    fontFamily: 'var(--font-body)',
                    transition: 'all 0.15s ease',
                    fontWeight: isSelected ? '700' : 'normal',
                    marginBottom: '2px',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(15, 118, 110, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {opt.provider_name} — {opt.model_name}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default function SettingsView() {
  const { showCustomAlert, showCustomConfirm } = useAppContext();
  const [activeSubTab, setActiveSubTab] = useState('providers'); // 'providers' | 'routing' | 'courses'
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

  // Dynamic Course Management State
  const [courses, setCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    course_id: '',
    display_name: '',
    keywords: '',
    description: '',
    nodes: Array(8).fill(null).map((_, i) => ({
      title: '',
      description: ''
    }))
  });
  const [uploadStatuses, setUploadStatuses] = useState({});
  const [isGeneratingSyllabus, setIsGeneratingSyllabus] = useState(false);

  const handleFileUpload = async (e, courseId) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      await showCustomAlert('\u6587\u4ef6\u8d85\u8fc7 10MB \u9650\u5236\u3002');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploadStatuses(prev => ({ ...prev, [courseId]: '\u26a1 \u6b63\u5728\u4e0a\u4f20\u4e0e\u89e3\u6790\u8bb2\u4e49...' }));

    try {
      const token = localStorage.getItem('token');
      const baseUrl = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
        ? 'http://127.0.0.1:8000'
        : '';
        
      const response = await fetch(`${baseUrl}/api/kb/courses/${courseId}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const resData = await response.json();
      if (response.ok) {
        setUploadStatuses(prev => ({ 
          ...prev, 
          [courseId]: `\u2728 \u89e3\u6790\u6210\u529f\uff01\u5206\u5207\u4e3a ${resData.chunks_count} \u4e2a\u8bed\u4e49\u5411\u91cf\u5757` 
        }));
      } else {
        setUploadStatuses(prev => ({ 
          ...prev, 
          [courseId]: `\u274c \u5931\u8d25: ${resData.detail || '\u672a\u660e\u89e3\u6790\u9519\u8bef'}` 
        }));
      }
    } catch (err) {
      console.error(err);
      setUploadStatuses(prev => ({ ...prev, [courseId]: '\u274c \u7f51\u7edc\u4e0a\u4f20\u5f02\u5e38' }));
    }
  };

  const handleGenerateAISyllabus = async () => {
    if (!courseFormData.display_name.trim()) {
      await showCustomAlert('\u8bf7\u5148\u586b\u5199\u8bfe\u7a0b\u663e\u793a\u540d\u79f0\uff01');
      return;
    }
    if (!courseFormData.description.trim()) {
      await showCustomAlert('\u8bf7\u5148\u586b\u5199\u8bfe\u7a0b\u7b80\u4ecb\uff0c\u4ee5\u4fbf AI \u89c4\u5212\u6674\u51c6\u7684\u5927\u7eb2\uff01');
      return;
    }

    setIsGeneratingSyllabus(true);
    try {
      const response = await apiPost('/kb/courses/generate_syllabus', {
        course_name: courseFormData.display_name.trim(),
        description: courseFormData.description.trim()
      });
      
      if (response && response.nodes && response.nodes.length === 8) {
        setCourseFormData(prev => ({
          ...prev,
          nodes: response.nodes.map((n, i) => ({
            title: n.title || `\u5173\u5361 ${i + 1}`,
            description: n.description || `\u5173\u5361 ${i + 1} \u77e5\u8bc6\u70b9\u5927\u7eb2`
          }))
        }));
        await showCustomAlert('\u2728 AI \u667a\u80fd\u5927\u7eb2\u89c4\u5212\u5b8c\u6210\uff01\u5df2\u81ea\u52a8\u586b\u5145 8 \u7ea7\u5173\u5361\uff01');
      } else {
        await showCustomAlert('AI \u751f\u6210\u5927\u7eb2\u683c\u5f0f\u4e0d\u6b63\u786e\uff0c\u8bf7\u91cd\u8bd5\u3002');
      }
    } catch (err) {
      console.error(err);
      await showCustomAlert('AI \u5927\u7eb2\u751f\u6210\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u6a21\u578b\u8def\u7531\u914d\u7f6e\u6216\u7f51\u7edc\u3002');
    } finally {
      setIsGeneratingSyllabus(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchCourses();
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

  const fetchCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const data = await apiGet('/kb/courses');
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch registered courses:', err);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!/^[a-zA-Z0-9_]+$/.test(courseFormData.course_id.trim())) {
      await showCustomAlert('课程 ID 只能包含字母、数字和下划线！');
      return;
    }
    
    // Assemble nodes
    const finalNodes = courseFormData.nodes.map((n, i) => {
      const nodeNum = i + 1;
      return {
        id: `node${nodeNum}`,
        title: n.title.trim() || `关卡 ${nodeNum}`,
        status: nodeNum === 1 ? 'completed' : (nodeNum === 2 ? 'active' : 'locked'),
        description: n.description.trim() || `第 ${nodeNum} 阶段自适应学习大纲`,
        resources: ["pdf", "code", "quiz", "video"]
      };
    });

    // Parse keywords
    const kws = courseFormData.keywords.split(/[,，]/)
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const payload = {
      course_id: courseFormData.course_id.trim(),
      display_name: courseFormData.display_name.trim(),
      keywords: kws,
      description: courseFormData.description.trim(),
      nodes: finalNodes
    };

    try {
      await apiPost('/kb/courses', payload);
      setShowAddCourseModal(false);
      await showCustomAlert('新课程注册成功！');
      fetchCourses();
    } catch (err) {
      await showCustomAlert('注册课程失败: ' + err.message);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (courseId === 'python_basics' || courseId === 'machine_learning') {
      await showCustomAlert('无法删除系统默认核心课程！');
      return;
    }
    const confirmed = await showCustomConfirm('您确定要删除这门课程吗？所有对应的课程节点和知识库索引将被清除，且无法恢复！');
    if (!confirmed) return;

    try {
      await apiDelete(`/kb/courses/${courseId}`);
      await showCustomAlert('课程删除成功！');
      fetchCourses();
    } catch (err) {
      await showCustomAlert('删除课程失败: ' + err.message);
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
      await showCustomAlert('更改启用状态失败: ' + err.message);
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
      await showCustomAlert('更新模型状态失败: ' + err.message);
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
      await showCustomAlert('无法删除内置讯飞星火服务商。');
      return;
    }
    const confirmed = await showCustomConfirm('您确定要删除此模型服务商吗？所有绑定的路由将重置为讯飞星火。');
    if (!confirmed) return;
    
    try {
      await apiDelete(`/settings/providers/${providerId}`);
      fetchSettings();
    } catch (err) {
      await showCustomAlert('删除服务商失败: ' + err.message);
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
      await showCustomAlert('保存供应商配置失败: ' + err.message);
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
      await showCustomAlert('保存路由绑定失败: ' + err.message);
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
            style={{ width: '100%', textAlign: 'left', cursor: 'pointer', outline: 'none' }}
          >
            <Database size={16} />
            <span style={{ fontSize: '13px' }}>模型供应商</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('routing')}
            className={`cyber-nav-tab ${activeSubTab === 'routing' ? 'active' : ''}`}
            style={{ width: '100%', textAlign: 'left', cursor: 'pointer', outline: 'none' }}
          >
            <Cpu size={16} />
            <span style={{ fontSize: '13px' }}>默认模型绑定</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('courses')}
            className={`cyber-nav-tab ${activeSubTab === 'courses' ? 'active' : ''}`}
            style={{ width: '100%', textAlign: 'left', cursor: 'pointer', outline: 'none' }}
          >
            <GraduationCap size={16} />
            <span style={{ fontSize: '13px' }}>课程管理</span>
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
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>{p.api_base}</span>
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
                            style={{ padding: '6px 10px', fontSize: '10px', minHeight: '26px', background: 'rgba(15, 118, 110, 0.08)', borderColor: 'rgba(15, 118, 110, 0.25)', color: 'var(--primary)' }}
                          >
                            {testingId === p.provider_id ? <RefreshCw size={10} className="spin-anim" /> : '测试连接'}
                          </button>

                          <button 
                            onClick={() => handleOpenEditModal(p)}
                            className="cyber-btn"
                            style={{ padding: '6px 8px', minHeight: '26px', background: 'rgba(29, 78, 216, 0.08)', borderColor: 'rgba(29, 78, 216, 0.2)', color: 'var(--secondary)' }}
                            title="修改供应商配置"
                          >
                            <Edit size={12} />
                          </button>

                          {p.provider_id !== 'xunfei' && (
                            <button 
                              onClick={() => handleDeleteProvider(p.provider_id)}
                              className="cyber-btn"
                              style={{ padding: '6px 8px', minHeight: '26px', background: 'rgba(190, 18, 60, 0.08)', borderColor: 'rgba(190, 18, 60, 0.2)', color: 'var(--danger)' }}
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
                                    <span style={{ fontSize: '13px', fontWeight: '600', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>{m.name}</span>
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
              <div className="cyber-card" style={{ background: 'var(--bg-card-glass)', padding: '32px 32px 110px 32px', overflow: 'visible' }}>
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
                  ].map((item, idx, arr) => {
                    const enabledModels = getEnabledModelsList();
                    const isLast = idx === arr.length - 1;
                    
                    return (
                      <div key={item.field} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        paddingBottom: '20px', 
                        borderBottom: isLast ? 'none' : '1px solid rgba(255, 255, 255, 0.04)',
                        gap: '20px'
                      }}>
                        <div style={{ maxWidth: '560px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{item.label}</h4>
                          <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.5' }}>{item.desc}</p>
                        </div>

                        <div>
                          <CustomSelect
                            value={item.activeVal}
                            options={enabledModels}
                            onChange={(e) => handleSaveRouting(item.field, e.target.value)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COURSES */}
          {activeSubTab === 'courses' && (
            <div>
              {/* Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>高等教育自适应课程库</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    管理当前注册的自适应教学路线。默认系统核心课程不可删除。
                  </p>
                </div>
                
                <button onClick={() => {
                  setCourseFormData({
                    course_id: '',
                    display_name: '',
                    keywords: '',
                    description: '',
                    nodes: Array(8).fill(null).map((_, i) => ({
                      title: '',
                      description: ''
                    }))
                  });
                  setShowAddCourseModal(true);
                }} className="cyber-btn" style={{ padding: '8px 16px', fontSize: '12px' }}>
                  <Plus size={14} style={{ marginRight: '6px' }} /> 注册新教学路径
                </button>
              </div>

              {/* Course list */}
              {isLoadingCourses ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  <RefreshCw className="spin-anim" size={24} style={{ marginBottom: '8px' }} />
                  <div>正在检索课程目录...</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {courses.map(course => {
                    const isDefault = course.course_id === 'python_basics' || course.course_id === 'machine_learning';
                    const parsedNodes = typeof course.nodes === 'string' ? JSON.parse(course.nodes) : course.nodes;
                    const parsedKeywords = typeof course.keywords === 'string' ? JSON.parse(course.keywords) : course.keywords;
                    
                    return (
                      <div 
                        key={course.course_id} 
                        className="cyber-card" 
                        style={{ 
                          background: 'var(--bg-card-glass)', 
                          padding: '18px 24px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>
                              {course.display_name}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'ui-monospace, monospace' }}>
                              [{course.course_id}]
                            </span>
                            {isDefault && (
                              <span className="neon-badge neon-badge-primary" style={{ fontSize: '9px', padding: '1px 5px' }}>系统核心</span>
                            )}
                          </div>

                          <div>
                            <button 
                              onClick={() => handleDeleteCourse(course.course_id)}
                              disabled={isDefault}
                              className="cyber-btn"
                              style={{ 
                                padding: '6px 10px', 
                                minHeight: '26px', 
                                background: isDefault ? 'rgba(255,255,255,0.01)' : 'rgba(190, 18, 60, 0.08)', 
                                borderColor: isDefault ? 'rgba(255,255,255,0.05)' : 'rgba(190, 18, 60, 0.2)', 
                                color: isDefault ? 'var(--text-dim)' : 'var(--danger)',
                                cursor: isDefault ? 'not-allowed' : 'pointer',
                                opacity: isDefault ? 0.35 : 1
                              }}
                              title={isDefault ? "核心课程不可删除" : "删除本课程"}
                            >
                              <Trash2 size={12} style={{ marginRight: '4px' }} /> 删除课程
                            </button>
                          </div>
                        </div>

                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          {course.description || "暂无课程描述。"}
                        </div>

                        {/* Keywords badges */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600' }}>识别特征词:</span>
                          {parsedKeywords && parsedKeywords.map((kw, i) => (
                            <span key={i} className="neon-badge neon-badge-primary" style={{ fontSize: '9px', padding: '1px 6px', background: 'rgba(15, 118, 110, 0.04)', borderColor: 'rgba(15, 118, 110, 0.15)', color: 'var(--text-muted)' }}>
                              {kw}
                            </span>
                          ))}
                        </div>

                        {/* Nodes hierarchy summary */}
                        <div style={{ 
                          borderTop: '1px dashed rgba(255, 255, 255, 0.04)', 
                          paddingTop: '12px',
                          marginTop: '4px'
                        }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '8px' }}>
                            自适应关卡大纲 (共 {parsedNodes?.length || 0} 级):
                          </div>
                          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                            {parsedNodes && parsedNodes.map((node, i) => (
                              <div key={node.id} style={{ 
                                flex: '0 0 110px', 
                                background: 'var(--bg-card-active)', 
                                padding: '6px 8px', 
                                borderRadius: '6px', 
                                border: '1px solid rgba(255,255,255,0.02)',
                                fontSize: '11px',
                                textAlign: 'center'
                              }}>
                                <div style={{ color: 'var(--primary-neon)', fontWeight: '700', marginBottom: '2px' }}>L{i+1}</div>
                                <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: '600' }} title={node.title}>
                                  {node.title}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Drag-and-drop file upload zone */}
                        <div 
                          onDragOver={(e) => {
                            e.preventDefault();
                          }}
                          onDrop={async (e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file) {
                              const mockEvent = { target: { files: [file] } };
                              await handleFileUpload(mockEvent, course.course_id);
                            }
                          }}
                          style={{
                            border: '1px dashed rgba(20, 184, 166, 0.2)',
                            borderRadius: '8px',
                            padding: '12px',
                            background: 'rgba(20, 184, 166, 0.01)',
                            marginTop: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: '600' }}>
                              {"\u62d6\u62fd\u8bfe\u4ef6\u6216\u5728\u6b64\u9009\u62e9\u6587\u4ef6\u4e0a\u4f20 (PDF / TXT / MD)"}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                              {"\u9650 10MB\uff0c\u81ea\u52a8\u751f\u6210 600 \u5b57\u7b26\u91cd\u53e0\u8bed\u4e49\u5207\u7247\u5411\u91cf"}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input 
                              type="file" 
                              accept=".pdf,.txt,.md"
                              id={`file-upload-${course.course_id}`}
                              style={{ display: 'none' }}
                              onChange={(e) => handleFileUpload(e, course.course_id)}
                            />
                            <button 
                              onClick={() => document.getElementById(`file-upload-${course.course_id}`).click()}
                              className="cyber-btn"
                              style={{ 
                                padding: '5px 10px', 
                                fontSize: '10px', 
                                background: 'rgba(20, 184, 166, 0.05)', 
                                borderColor: 'rgba(20, 184, 166, 0.2)', 
                                color: 'var(--primary-neon)' 
                              }}
                            >
                              <Upload size={10} style={{ marginRight: '4px' }} /> {"\u9009\u62e9\u6587\u4ef6"}
                            </button>
                            {uploadStatuses[course.course_id] && (
                              <span style={{ fontSize: '10px', color: 'var(--primary-neon)', fontWeight: 'bold' }}>
                                {uploadStatuses[course.course_id]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                  style={{ height: '38px', fontSize: '13px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
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
                  style={{ height: '38px', fontSize: '13px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
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

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999
        }}>
          <div className="cyber-card" style={{
            width: '800px',
            maxWidth: '90%',
            maxHeight: '90vh',
            background: 'var(--bg-card-solid)',
            padding: '28px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            overflow: 'hidden'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '900', borderBottom: '1px solid var(--border-neon)', paddingBottom: '12px', marginBottom: '4px' }}>
              注册高等自适应课程
            </h3>

            <form onSubmit={handleSaveCourse} style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden', flex: 1 }}>
              <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>
                {/* Left Side: General Info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', paddingRight: '4px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary-neon)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    第一部分: 课程元数据
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      课程标识 ID (唯一且仅包含英文、数字、下划线)
                    </label>
                    <input
                      type="text"
                      placeholder="如: data_structures"
                      required
                      value={courseFormData.course_id}
                      onChange={(e) => setCourseFormData(prev => ({ ...prev, course_id: e.target.value }))}
                      className="cyber-input"
                      style={{ height: '36px', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      课程显示名称
                    </label>
                    <input
                      type="text"
                      placeholder="如: 数据结构与算法"
                      required
                      value={courseFormData.display_name}
                      onChange={(e) => setCourseFormData(prev => ({ ...prev, display_name: e.target.value }))}
                      className="cyber-input"
                      style={{ height: '36px', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      RAG 学科分类特征词 (以逗号分隔)
                    </label>
                    <input
                      type="text"
                      placeholder="如: 数据结构, 二叉树, 链表, 算法, 图"
                      required
                      value={courseFormData.keywords}
                      onChange={(e) => setCourseFormData(prev => ({ ...prev, keywords: e.target.value }))}
                      className="cyber-input"
                      style={{ height: '36px', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      课程简介
                    </label>
                    <textarea
                      placeholder="简短描述本自适应课程的学科范围..."
                      required
                      value={courseFormData.description}
                      onChange={(e) => setCourseFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="cyber-input"
                      style={{ height: '100px', fontSize: '12px', resize: 'none', padding: '10px 14px' }}
                    />
                  </div>
                </div>

                {/* Vertical Divider */}
                <div style={{ width: '1px', background: 'var(--border-neon)', alignSelf: 'stretch' }} />

                {/* Right Side: 8-node outline editor */}
                <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', paddingRight: '4px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary-neon)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>第二部分: 自适应关卡节点 (共8关)</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={handleGenerateAISyllabus}
                        disabled={isGeneratingSyllabus}
                        className="cyber-btn"
                        style={{
                          padding: '3px 8px',
                          fontSize: '10px',
                          background: 'rgba(20, 184, 166, 0.08)',
                          borderColor: 'var(--primary-neon)',
                          color: 'var(--primary-neon)',
                          height: '22px',
                          minHeight: '22px',
                          cursor: isGeneratingSyllabus ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isGeneratingSyllabus ? '⚡ \u6b63\u5728\u667a\u80fd\u89c4\u5212\u5927\u7eb2...' : '\u2728 AI \u4e00\u952e\u751f\u6210\u5927\u7eb2'}
                      </button>
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>建议按由易到难排序</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {courseFormData.nodes.map((node, index) => (
                      <div key={index} style={{ 
                        background: 'var(--bg-card-active)', 
                        padding: '10px 14px', 
                        borderRadius: '8px', 
                        border: '1px solid rgba(255,255,255,0.02)' 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--primary-neon)', fontWeight: '800', fontFamily: 'monospace' }}>
                            LEVEL {index + 1}
                          </span>
                          <input
                            type="text"
                            placeholder={`关卡 ${index + 1} 主题标题`}
                            required
                            value={node.title}
                            onChange={(e) => {
                              const updatedNodes = [...courseFormData.nodes];
                              updatedNodes[index].title = e.target.value;
                              setCourseFormData(prev => ({ ...prev, nodes: updatedNodes }));
                            }}
                            className="cyber-input"
                            style={{ height: '28px', fontSize: '11px', padding: '0 8px', flex: 1 }}
                          />
                        </div>
                        <input
                          type="text"
                          placeholder={`输入该关卡的核心考核大纲简介...`}
                          required
                          value={node.description}
                          onChange={(e) => {
                            const updatedNodes = [...courseFormData.nodes];
                            updatedNodes[index].description = e.target.value;
                            setCourseFormData(prev => ({ ...prev, nodes: updatedNodes }));
                          }}
                          className="cyber-input"
                          style={{ height: '28px', fontSize: '11px', padding: '0 8px' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px', marginTop: '4px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddCourseModal(false)}
                  className="cyber-btn"
                  style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="cyber-btn"
                  style={{ padding: '8px 24px' }}
                >
                  提交注册并建档
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
