import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Trash2, Edit, ChevronDown, ChevronUp, Check, 
  RefreshCw, Key, Database, Cpu, Settings, Sliders, Globe, GraduationCap,
  Upload, X, Sparkles, Shield
} from 'lucide-react';
import { apiGet, apiPost, apiDelete, apiPut } from '../../utils/api';
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
  const { showCustomAlert, showCustomConfirm, regUsername } = useAppContext();
  const [activeSubTab, setActiveSubTab] = useState('providers'); // 'providers' | 'routing' | 'courses' | 'security' | 'search' | 'prompts'
  
  // 联网搜索配置状态
  const [searchSettings, setSearchSettings] = useState({
    search_enabled: false,
    search_provider: 'duckduckgo',
    api_key: '',
    max_results: 3
  });
  const [savingSearch, setSavingSearch] = useState(false);

  // 提示词模板状态
  const [promptTemplates, setPromptTemplates] = useState([]);
  const [showPromptEditModal, setShowPromptEditModal] = useState(false);
  const [promptFormData, setPromptFormData] = useState({
    template_id: '',
    template_name: '',
    system_prompt: '',
    is_active: false
  });
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);  // tracks the prompt template being edited

  // 安全密码找回相关状态
  const [securityStatus, setSecurityStatus] = useState({ has_totp: false, has_questions: false, questions: [] });
  const [loadingSecurity, setLoadingSecurity] = useState(true);
  
  const [secQuestions, setSecQuestions] = useState([
    { question: '你最喜欢的编程语言是？', answer: '' },
    { question: '你写的第一行代码输出是什么？', answer: '' },
    { question: '你心目中最伟大的程序员是？', answer: '' }
  ]);
  const [submittingQuestions, setSubmittingQuestions] = useState(false);
  
  const [totpSetupData, setTotpSetupData] = useState(null);
  const [totpCode, setTotpCode] = useState('');
  const [totpRecoveryCode, setTotpRecoveryCode] = useState('');
  const [bindingTotp, setBindingTotp] = useState(false);

  const loadSecurityStatus = async () => {
    if (!regUsername) return;
    setLoadingSecurity(true);
    try {
      const data = await apiPost('/auth/forgot-password/status', { username: regUsername });
      setSecurityStatus(data);
      if (data.questions && data.questions.length > 0) {
        setSecQuestions(data.questions.map(q => ({ question: q, answer: '' })));
      }
    } catch (err) {
      console.error("加载安全状态失败:", err);
    } finally {
      setLoadingSecurity(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'security') {
      loadSecurityStatus();
    }
  }, [activeSubTab, regUsername]);

  const handleSaveQuestions = async (e) => {
    e.preventDefault();
    setSubmittingQuestions(true);
    try {
      await apiPost('/auth/security-questions', { questions: secQuestions });
      showCustomAlert("密保问题设置成功！", "success");
      loadSecurityStatus();
    } catch (err) {
      showCustomAlert("设置密保问题失败: " + err.message, "danger");
    } finally {
      setSubmittingQuestions(false);
    }
  };
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
      
      // 加载联网搜索和提示词模板
      const searchData = await apiGet('/settings/search');
      setSearchSettings(searchData);
      const promptData = await apiGet('/settings/prompt-templates');
      setPromptTemplates(promptData);
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

  const handleSaveSearchSettings = async (e) => {
    e.preventDefault();
    setSavingSearch(true);
    try {
      await apiPost('/settings/search', searchSettings);
      await showCustomAlert('联网搜索配置保存成功！');
      const searchData = await apiGet('/settings/search');
      setSearchSettings(searchData);
    } catch (err) {
      await showCustomAlert('保存联网搜索配置失败: ' + err.message);
    } finally {
      setSavingSearch(false);
    }
  };

  const handleSavePromptTemplate = async (e) => {
    e.preventDefault();
    setSavingPrompt(true);
    try {
      const payload = {
        ...promptFormData,
        template_id: promptFormData.template_id || `custom_${Date.now()}`
      };
      await apiPost('/settings/prompt-templates', payload);
      await showCustomAlert('提示词模板保存成功！');
      setShowPromptEditModal(false);
      const promptData = await apiGet('/settings/prompt-templates');
      setPromptTemplates(promptData);
    } catch (err) {
      await showCustomAlert('保存提示词模板失败: ' + err.message);
    } finally {
      setSavingPrompt(false);
    }
  };

  const handleSetActivePrompt = async (templateId) => {
    try {
      await apiPut(`/settings/prompt-templates/${templateId}/active`, {});
      await showCustomAlert('提示词模板已成功激活并应用到对话中！');
      const promptData = await apiGet('/settings/prompt-templates');
      setPromptTemplates(promptData);
    } catch (err) {
      await showCustomAlert('激活提示词模板失败: ' + err.message);
    }
  };

  const handleDeletePromptTemplate = async (templateId) => {
    const confirmed = await showCustomConfirm('您确定要删除此自定义提示词模板吗？');
    if (!confirmed) return;
    try {
      await apiDelete(`/settings/prompt-templates/${templateId}`);
      await showCustomAlert('提示词模板删除成功！');
      const promptData = await apiGet('/settings/prompt-templates');
      setPromptTemplates(promptData);
    } catch (err) {
      await showCustomAlert('删除提示词模板失败: ' + err.message);
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
        resources: ["pdf", "mindmap", "code", "quiz", "video"]
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
    <div className="settings-container">
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
      <div className="settings-layout">
        {/* Left Sub-sidebar */}
        <div className="settings-sidebar">
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 12px' }}>模型与工具</span>
          
          <button
            onClick={() => setActiveSubTab('providers')}
            className={`cyber-nav-tab ${activeSubTab === 'providers' ? 'active' : ''}`}
            style={{ 
              width: '100%', 
              textAlign: 'left', 
              cursor: 'pointer', 
              outline: 'none',
              background: activeSubTab === 'providers' ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'transparent',
              border: 'none'
            }}
          >
            <Database size={16} />
            <span style={{ fontSize: '13px' }}>模型供应商</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('routing')}
            className={`cyber-nav-tab ${activeSubTab === 'routing' ? 'active' : ''}`}
            style={{ 
              width: '100%', 
              textAlign: 'left', 
              cursor: 'pointer', 
              outline: 'none',
              background: activeSubTab === 'routing' ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'transparent',
              border: 'none'
            }}
          >
            <Cpu size={16} />
            <span style={{ fontSize: '13px' }}>默认模型绑定</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('courses')}
            className={`cyber-nav-tab ${activeSubTab === 'courses' ? 'active' : ''}`}
            style={{ 
              width: '100%', 
              textAlign: 'left', 
              cursor: 'pointer', 
              outline: 'none',
              background: activeSubTab === 'courses' ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'transparent',
              border: 'none'
            }}
          >
            <GraduationCap size={16} />
            <span style={{ fontSize: '13px' }}>课程管理</span>
          </button>
          
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '16px 12px 6px' }}>系统与安全</span>
          <button
            onClick={() => setActiveSubTab('security')}
            className={`cyber-nav-tab ${activeSubTab === 'security' ? 'active' : ''}`}
            style={{ 
              width: '100%', 
              textAlign: 'left', 
              cursor: 'pointer', 
              outline: 'none',
              background: activeSubTab === 'security' ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'transparent',
              border: 'none'
            }}
          >
            <Shield size={16} />
            <span style={{ fontSize: '13px' }}>账号安全管理</span>
          </button>

          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '16px 12px 6px' }}>智能协同扩展</span>
          <button
            onClick={() => setActiveSubTab('search')}
            className={`cyber-nav-tab ${activeSubTab === 'search' ? 'active' : ''}`}
            style={{ 
              width: '100%', 
              textAlign: 'left', 
              cursor: 'pointer', 
              outline: 'none',
              background: activeSubTab === 'search' ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'transparent',
              border: 'none'
            }}
          >
            <Globe size={16} />
            <span style={{ fontSize: '13px' }}>联网搜索</span>
          </button>
          <button
            onClick={() => setActiveSubTab('prompts')}
            className={`cyber-nav-tab ${activeSubTab === 'prompts' ? 'active' : ''}`}
            style={{ 
              width: '100%', 
              textAlign: 'left', 
              cursor: 'pointer', 
              outline: 'none',
              background: activeSubTab === 'prompts' ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'transparent',
              border: 'none'
            }}
          >
            <Sliders size={16} />
            <span style={{ fontSize: '13px' }}>提示词模板</span>
          </button>
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
                    style={{ padding: '0 12px 0 36px', height: '34px', fontSize: '12px', borderRadius: '10px' }}
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '16px 20px', borderBottom: isExpanded ? '1px solid rgba(15, 118, 110, 0.08)' : 'none' }}>
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
                      label: 'AI 助教聊天 (Tutor Chat)',
                      desc: '负责学生学习过程中的日常问答、答疑解析及情境画像修正。',
                      field: 'chat',
                      activeVal: `${routing.chat_provider_id}|${routing.chat_model}`
                    },
                    {
                      label: '路径大纲规划 (Path Planner)',
                      desc: '负责将学生的学习目标转化为 8 级自适应关卡，定制个性化大纲。',
                      field: 'planner',
                      activeVal: `${routing.planner_provider_id}|${routing.planner_model}`
                    },
                    {
                      label: '错题诊断归档 (Diagnostics)',
                      desc: '负责代码沙盒异常的编译报告提取以及错题强化测验题的逆向生成。',
                      field: 'diagnostics',
                      activeVal: `${routing.diagnostics_provider_id}|${routing.diagnostics_model}`
                    },
                    {
                      label: '学术资源生成 (Resource Generator)',
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

          {/* TAB 4: SECURITY */}
          {activeSubTab === 'security' && (
            <div className="security-settings-pane" style={{ animation: 'fadeIn 0.4s ease-out', width: '100%' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>账户安全与凭证找回</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>
                  配置您的密保问题与两步认证器。当您忘记密码时，可通过这些凭据自主重写并重设密码。
                </p>
              </div>

              {loadingSecurity ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  <RefreshCw className="spin-anim" size={24} style={{ marginBottom: '8px' }} />
                  <div>加载安全凭证配置中...</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  
                  {/* Card 1: 2FA TOTP */}
                  <div className="cyber-card" style={{ padding: '24px', background: 'var(--bg-chat-form)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ padding: '8px', background: securityStatus.has_totp ? 'rgba(13, 148, 136, 0.1)' : 'rgba(239, 68, 68, 0.08)', borderRadius: '10px', display: 'flex' }}>
                        <Shield size={20} style={{ color: securityStatus.has_totp ? 'var(--primary)' : '#ef4444' }} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>二次身份验证器 (2FA)</h4>
                        <span style={{ fontSize: '11px', color: securityStatus.has_totp ? 'var(--primary)' : '#ef4444', fontWeight: '800', marginTop: '2px', display: 'block' }}>
                          {securityStatus.has_totp ? '● 已启用安全防护' : '○ 未启用 (忘记密码时无法使用此通道)'}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
                      使用 Google Authenticator 或 Microsoft Authenticator 扫描动态二维码绑定，生成 6 位安全验证码。完全本地算力加密计算，免除短信和外部网络依赖。
                    </p>

                    {totpRecoveryCode && (
                      <div style={{ 
                        background: 'rgba(245, 158, 11, 0.08)', 
                        border: '1px solid rgba(245, 158, 11, 0.25)', 
                        padding: '12px 16px', 
                        borderRadius: '8px',
                        fontSize: '12px' 
                      }}>
                        <div style={{ fontWeight: '700', color: '#f59e0b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ⚠️ 请妥善记录您的备份恢复密钥！
                        </div>
                        <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)', fontSize: '11px' }}>如果您的验证器设备丢失，输入该密钥仍可重设密码。该密钥仅显示一次：</p>
                        <div style={{ 
                          fontFamily: 'monospace', 
                          fontSize: '13px', 
                          color: '#ffffff', 
                          background: 'rgba(0,0,0,0.2)', 
                          padding: '6px 12px', 
                          borderRadius: '4px', 
                          letterSpacing: '1px', 
                          fontWeight: '700',
                          textAlign: 'center',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          {totpRecoveryCode}
                        </div>
                      </div>
                    )}

                    {!securityStatus.has_totp && !totpSetupData && (
                      <button 
                        onClick={async () => {
                          try {
                            const data = await apiGet('/auth/totp/setup');
                            setTotpSetupData(data);
                            setTotpCode('');
                            setTotpRecoveryCode('');
                          } catch (err) {
                            showCustomAlert("初始化验证器密钥失败: " + err.message, "danger");
                          }
                        }} 
                        type="button"
                        className="cyber-btn" 
                        style={{ padding: '10px', justifyContent: 'center', marginTop: 'auto' }}
                      >
                        开启安全验证器
                      </button>
                    )}

                    {totpSetupData && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border-neon)', paddingTop: '16px' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <img 
                            src={totpSetupData.qr_code_data_url} 
                            alt="TOTP Bind QR" 
                            style={{ 
                              width: '90px', 
                              height: '90px', 
                              background: '#ffffff', 
                              padding: '4px', 
                              borderRadius: '6px', 
                              border: '1px solid var(--border-neon)' 
                            }} 
                          />
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>扫码绑定或输入密钥：</span>
                            <div style={{ 
                              fontSize: '11px', 
                              fontFamily: 'monospace', 
                              background: 'rgba(0,0,0,0.15)', 
                              padding: '4px 8px', 
                              borderRadius: '4px', 
                              color: 'var(--text-main)', 
                              marginTop: '4px',
                              wordBreak: 'break-all',
                              border: '1px solid var(--border-neon)'
                            }}>
                              {totpSetupData.secret}
                            </div>
                          </div>
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '11px' }}>输入 6 位动态验证码确认绑定</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                              type="text" 
                              maxLength={6}
                              value={totpCode}
                              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                              placeholder="000000"
                              className="cyber-input"
                              style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '14px', height: '36px', flex: 1 }}
                            />
                            <button 
                              onClick={async () => {
                                if (totpCode.length !== 6) return;
                                setBindingTotp(true);
                                try {
                                  const res = await apiPost('/auth/totp/bind', {
                                    secret: totpSetupData.secret,
                                    code: totpCode
                                  });
                                  setTotpRecoveryCode(res.recovery_code);
                                  setTotpSetupData(null);
                                  showCustomAlert("身份验证器绑定成功！请务必妥善保存备份恢复密钥。", "success");
                                  loadSecurityStatus();
                                } catch (err) {
                                  showCustomAlert(err.message, "danger");
                                } finally {
                                  setBindingTotp(false);
                                }
                              }}
                              disabled={bindingTotp || totpCode.length !== 6}
                              type="button"
                              className="cyber-btn"
                              style={{ padding: '0 16px', flexShrink: 0, height: '36px' }}
                            >
                              确认
                            </button>
                            <button 
                              onClick={() => setTotpSetupData(null)}
                              type="button"
                              className="cyber-btn"
                              style={{ padding: '0 12px', background: 'rgba(0,0,0,0.02)', borderColor: 'var(--border-neon)', color: 'var(--text-muted)', height: '36px' }}
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {securityStatus.has_totp && (
                      <button 
                        onClick={async () => {
                          const confirm = await showCustomConfirm("确定要解绑两步验证器吗？解绑后将无法使用动态验证码找回密码。");
                          if (!confirm) return;
                          try {
                            await apiPost('/auth/totp/unbind');
                            setTotpRecoveryCode('');
                            showCustomAlert("两步验证已成功解绑", "success");
                            loadSecurityStatus();
                          } catch (err) {
                            showCustomAlert("解绑失败: " + err.message, "danger");
                          }
                        }} 
                        type="button"
                        className="cyber-btn" 
                        style={{ padding: '10px', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', marginTop: 'auto' }}
                      >
                        解绑身份验证器
                      </button>
                    )}
                  </div>

                  {/* Card 2: Security Questions */}
                  <form onSubmit={handleSaveQuestions} className="cyber-card" style={{ padding: '24px', background: 'var(--bg-chat-form)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ padding: '8px', background: securityStatus.has_questions ? 'rgba(13, 148, 136, 0.1)' : 'rgba(245, 158, 11, 0.08)', borderRadius: '10px', display: 'flex' }}>
                        <Key size={20} style={{ color: securityStatus.has_questions ? 'var(--primary)' : '#f59e0b' }} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>安全密保问题找回</h4>
                        <span style={{ fontSize: '11px', color: securityStatus.has_questions ? 'var(--primary)' : '#f59e0b', fontWeight: '800', marginTop: '2px', display: 'block' }}>
                          {securityStatus.has_questions ? '● 已配置密保找回通道' : '○ 未配置密保 (忘记密码时无法使用此通道)'}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
                      配置 3 个您所独占的私人密保问题及回答。答案在存入数据库前会自动加密哈希，确保无明文泄漏风险。
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                      {secQuestions.map((item, index) => (
                        <div key={index} className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>安全密保问题 {index + 1}</span>
                            {securityStatus.has_questions && <span style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '9px' }}>已设置</span>}
                          </label>
                          <input 
                            type="text"
                            required
                            value={item.question}
                            onChange={(e) => {
                              const copy = [...secQuestions];
                              copy[index].question = e.target.value;
                              setSecQuestions(copy);
                            }}
                            placeholder={`请输入自定义密保问题 ${index + 1}...`}
                            className="cyber-input"
                            style={{ height: '32px', fontSize: '12px', padding: '0 12px', width: '100%', outline: 'none' }}
                          />
                          <select 
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                const copy = [...secQuestions];
                                copy[index].question = e.target.value;
                                setSecQuestions(copy);
                              }
                            }}
                            className="cyber-input"
                            style={{ padding: '0 12px', height: '28px', fontSize: '11px', background: 'var(--bg-chat-form)', width: '100%', outline: 'none', marginTop: '4px', opacity: 0.8 }}
                          >
                            <option value="">-- 快速选择推荐密保问题 --</option>
                            <option value="你最喜欢的编程语言是？">你最喜欢的编程语言是？</option>
                            <option value="你写的第一行代码输出是什么？">你写的第一行代码输出是什么？</option>
                            <option value="你心目中最伟大的程序员是？">你心目中最伟大的程序员是？</option>
                            <option value="你第一台电脑的购买年份是？">你第一台电脑的购买年份是？</option>
                            <option value="你最喜欢的研究课题/方向是？">你最喜欢的研究课题/方向是？</option>
                          </select>
                          <input 
                            type="text"
                            required
                            value={item.answer}
                            onChange={(e) => {
                              const copy = [...secQuestions];
                              copy[index].answer = e.target.value;
                              setSecQuestions(copy);
                            }}
                            placeholder={securityStatus.has_questions ? "输入答案以重写此问题配置..." : "输入该密保问题的校验答案..."}
                            className="cyber-input"
                            style={{ height: '32px', fontSize: '12px', padding: '0 12px', marginTop: '6px' }}
                          />
                        </div>
                      ))}
                    </div>

                    <button 
                      type="submit" 
                      disabled={submittingQuestions}
                      className="cyber-btn" 
                      style={{ padding: '10px', justifyContent: 'center', marginTop: 'auto' }}
                    >
                      {submittingQuestions ? '保存中...' : (securityStatus.has_questions ? '更新密保配置' : '开启密保通道')}
                    </button>
                  </form>

                </div>
              )}
            </div>
          )}

          {/* TAB 3: COURSES */}
          {activeSubTab === 'courses' && (
            <div>
              {/* Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
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
                          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
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
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '12px'
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

          {/* TAB: SEARCH */}
          {activeSubTab === 'search' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>智能联网检索配置</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  开启后，系统智能体在与您交流时，会根据对话上下文自动提取关键词进行实时网页检索，补充大模型的时效性知识。
                </p>
              </div>

              <form onSubmit={handleSaveSearchSettings} className="cyber-card" style={{ background: 'var(--bg-card-glass)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Switch row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>启用实时联网搜索</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>允许 AI 导师在面对时效性或需要实时佐证的问题时进行联网查询。</p>
                  </div>
                  <label className="cyber-switch" style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px' }}>
                    <input 
                      type="checkbox" 
                      checked={searchSettings.search_enabled}
                      onChange={(e) => setSearchSettings(prev => ({ ...prev, search_enabled: e.target.checked }))}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: searchSettings.search_enabled ? 'var(--primary-neon)' : 'rgba(255,255,255,0.08)',
                      transition: '0.4s', borderRadius: '34px',
                      boxShadow: searchSettings.search_enabled ? '0 0 8px var(--primary-neon)' : 'none'
                    }}>
                      <span style={{
                        position: 'absolute', content: '""', height: '16px', width: '16px', left: '4px', bottom: '4px',
                        backgroundColor: 'white', transition: '0.4s', borderRadius: '50%',
                        transform: searchSettings.search_enabled ? 'translateX(22px)' : 'none'
                      }} />
                    </span>
                  </label>
                </div>

                {/* Search settings input parameters — always interactive; opacity only dims when disabled */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>搜索引擎提供商</label>
                      <select
                        value={searchSettings.search_provider}
                        onChange={(e) => setSearchSettings(prev => ({ ...prev, search_provider: e.target.value }))}
                        className="cyber-input"
                        style={{ height: '36px', fontSize: '12px', padding: '0 12px', borderRadius: '8px', cursor: 'pointer', background: 'var(--bg-card-solid)', border: '1px solid var(--border-neon)' }}
                      >
                        <option value="duckduckgo">DuckDuckGo (免密内置，极速解析)</option>
                        <option value="tavily">Tavily AI (学术及开发者搜索 API)</option>
                        <option value="google">Google Custom Search (需要自定义 API 密钥)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>单次最大网页检索结果数量 (1-5)</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={searchSettings.max_results}
                          onChange={(e) => setSearchSettings(prev => ({ ...prev, max_results: parseInt(e.target.value) }))}
                          style={{ flex: 1, accentColor: 'var(--primary-neon)' }}
                        />
                        <span style={{ fontSize: '14px', fontWeight: 'bold', minWidth: '24px', textAlign: 'center', color: 'var(--primary-neon)' }}>{searchSettings.max_results} 条</span>
                      </div>
                    </div>
                  </div>

                  {searchSettings.search_provider !== 'duckduckgo' && (
                    <div style={{ animation: 'fadeIn 0.3s' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>API Key (接口校验密钥)</label>
                      <input
                        type="password"
                        placeholder="输入对应服务商的 API Key 接口凭证..."
                        value={searchSettings.api_key}
                        onChange={(e) => setSearchSettings(prev => ({ ...prev, api_key: e.target.value }))}
                        className="cyber-input"
                        style={{ height: '36px', fontSize: '12px', padding: '0 12px', fontFamily: 'monospace' }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="submit" disabled={savingSearch} className="cyber-btn" style={{ padding: '8px 24px', fontSize: '12px' }}>
                    {savingSearch ? '保存配置中...' : '保存联网检索配置'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: PROMPTS */}
          {activeSubTab === 'prompts' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>AI 导师提示词模板管理</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    提示词模板控制 AI 导师对话的基本人设与逻辑。激活其中一个后将自动应用在智能体沟通流中。
                  </p>
                </div>
                
                <button onClick={() => {
                  setPromptFormData({
                    template_id: '',
                    template_name: '',
                    system_prompt: '',
                    is_active: false
                  });
                  setEditingPrompt(null);
                  setShowPromptEditModal(true);
                }} className="cyber-btn" style={{ padding: '8px 16px', fontSize: '12px' }}>
                  <Plus size={14} style={{ marginRight: '6px' }} /> 新增提示词模板
                </button>
              </div>

              {/* Grid Layout of prompt templates */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {promptTemplates.map(t => {
                  const isSystemDefault = ['academic', 'encouraging', 'coder', 'socratic'].includes(t.template_id);
                  
                  return (
                    <div 
                      key={t.template_id} 
                      className="cyber-card" 
                      style={{ 
                        background: 'var(--bg-card-glass)', 
                        padding: '20px',
                        borderColor: t.is_active ? 'var(--border-neon)' : 'rgba(255,255,255,0.03)',
                        boxShadow: t.is_active ? '0 4px 15px rgba(20, 184, 166, 0.15)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '14px',
                        transition: 'all 0.3s'
                      }}
                    >
                      <div>
                        {/* Card Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                              {t.template_name}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                              [{t.template_id}]
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {t.is_active ? (
                              <span className="neon-badge neon-badge-primary" style={{ fontSize: '9px', padding: '1px 6px', background: 'rgba(20, 184, 166, 0.1)', borderColor: 'rgba(20, 184, 166, 0.3)', color: 'var(--primary-neon)' }}>
                                启用中
                              </span>
                            ) : (
                              <button 
                                onClick={() => handleSetActivePrompt(t.template_id)}
                                className="cyber-btn"
                                style={{ padding: '2px 8px', fontSize: '9px', minHeight: '20px', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}
                              >
                                启用该模板
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Prompt preview */}
                        <p style={{ 
                          fontSize: '12px', 
                          color: 'var(--text-muted)', 
                          lineHeight: '1.6', 
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          height: '58px'
                        }} title={t.system_prompt}>
                          {t.system_prompt}
                        </p>
                      </div>

                      {/* Card Footer Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '12px', marginTop: '4px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Sparkles size={10} />
                          {isSystemDefault ? "系统预置核心模板" : "自定义专属模板"}
                        </span>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => {
                              setEditingPrompt(t);
                              setPromptFormData({
                                template_id: t.template_id,
                                template_name: t.template_name,
                                system_prompt: t.system_prompt,
                                is_active: t.is_active
                              });
                              setShowPromptEditModal(true);
                            }}
                            className="cyber-btn"
                            style={{ padding: '4px 10px', fontSize: '11px', minHeight: '24px', background: 'rgba(20, 184, 166, 0.04)', borderColor: 'rgba(20, 184, 166, 0.15)', color: 'var(--primary-neon)' }}
                          >
                            <Edit size={10} style={{ marginRight: '4px' }} /> 编辑
                          </button>
                          
                          <button 
                            onClick={() => handleDeletePromptTemplate(t.template_id)}
                            disabled={isSystemDefault || t.is_active}
                            className="cyber-btn"
                            style={{ 
                              padding: '4px 10px', 
                              fontSize: '11px', 
                              minHeight: '24px', 
                              background: 'rgba(190, 18, 60, 0.05)', 
                              borderColor: 'rgba(190, 18, 60, 0.15)', 
                              color: 'var(--danger)',
                              cursor: (isSystemDefault || t.is_active) ? 'not-allowed' : 'pointer',
                              opacity: (isSystemDefault || t.is_active) ? 0.35 : 1
                            }}
                            title={t.is_active ? "当前激活的模板不能删除" : (isSystemDefault ? "系统核心模板不能删除" : "删除模板")}
                          >
                            <Trash2 size={10} style={{ marginRight: '4px' }} /> 删除
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
          <div className="cyber-card provider-modal-content" style={{}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>
                {editingProvider ? '编辑模型服务' : '添加大模型服务'}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="close-btn"
              >
                <X size={16} />
              </button>
            </div>

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
                  style={{ height: '38px', fontSize: '13px', padding: '0 14px' }}
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
                  style={{ height: '38px', fontSize: '13px', padding: '0 14px' }}
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
                  style={{ height: '38px', fontSize: '13px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', padding: '0 14px' }}
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
                  style={{ height: '38px', fontSize: '13px', padding: '0 14px' }}
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
                  style={{ height: '38px', fontSize: '13px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', padding: '0 14px' }}
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
          <div className="cyber-card settings-sub-modal" style={{}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-neon)', paddingBottom: '12px', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>
                注册高等自适应课程
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddCourseModal(false)}
                className="close-btn"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden', flex: 1 }}>
              <div className="course-form-columns">
                {/* Left Side: General Info */}
                <div className="course-form-column">
                  <div style={{ 
                    marginBottom: '12px',
                    borderBottom: '1px solid var(--border-neon)',
                    paddingBottom: '8px'
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary-neon)', display: 'block' }}>
                      第一部分: 课程元数据
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px', display: 'block' }}>
                      定义课程的唯一编码与识别特征
                    </span>
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
                      style={{ height: '36px', fontSize: '12px', padding: '0 14px' }}
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
                      style={{ height: '36px', fontSize: '12px', padding: '0 14px' }}
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
                      style={{ height: '36px', fontSize: '12px', padding: '0 14px' }}
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
                <div className="course-form-divider" />

                {/* Right Side: 8-node outline editor */}
                <div className="course-form-column" style={{ flex: 1.2 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '12px',
                    borderBottom: '1px solid var(--border-neon)',
                    paddingBottom: '8px'
                  }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary-neon)', display: 'block' }}>
                        第二部分: 自适应关卡节点 (共8关)
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px', display: 'block' }}>
                        建议按由易到难排序
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleGenerateAISyllabus}
                      disabled={isGeneratingSyllabus}
                      className="cyber-btn"
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        background: 'rgba(20, 184, 166, 0.08)',
                        borderColor: 'var(--primary-neon)',
                        color: 'var(--primary-neon)',
                        height: '24px',
                        minHeight: '24px',
                        cursor: isGeneratingSyllabus ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {isGeneratingSyllabus ? (
                        <>
                          <RefreshCw size={11} className="animate-spin" />
                          <span>正在规划...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={11} />
                          <span>AI一键生成</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {courseFormData.nodes.map((node, index) => (
                      <div key={index} style={{ 
                        background: 'rgba(20, 184, 166, 0.02)', 
                        padding: '10px 12px', 
                        borderRadius: '8px', 
                        border: '1px solid rgba(20, 184, 166, 0.1)',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start'
                      }}>
                        <div style={{ 
                          background: 'rgba(20, 184, 166, 0.08)',
                          color: 'var(--primary-neon)',
                          fontSize: '10px',
                          fontWeight: '800',
                          fontFamily: 'monospace',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          textAlign: 'center',
                          minWidth: '40px',
                          marginTop: '2px'
                        }}>
                          L{index + 1}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
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
                            style={{ height: '28px', fontSize: '11px', padding: '0 10px' }}
                          />
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
                            style={{ height: '28px', fontSize: '11px', padding: '0 10px' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-neon)', paddingTop: '16px', marginTop: '4px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddCourseModal(false)}
                  className="cyber-btn"
                  style={{ padding: '8px 18px', background: 'rgba(0, 0, 0, 0.02)', borderColor: 'var(--border-neon)', color: 'var(--text-muted)' }}
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

      {/* Add / Edit Prompt Template Modal */}
      {showPromptEditModal && (
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
          <div className="cyber-card" style={{ width: '560px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>
                {editingPrompt ? '编辑提示词模板' : '新增提示词模板'}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowPromptEditModal(false)}
                className="close-btn"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePromptTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>模板标识 ID (唯一个性化 ID)</label>
                <input
                  type="text"
                  placeholder="如: my_interviewer, academic_advanced"
                  required
                  disabled={!!editingPrompt}
                  value={promptFormData.template_id}
                  onChange={(e) => setPromptFormData(prev => ({ ...prev, template_id: e.target.value }))}
                  className="cyber-input"
                  style={{ height: '36px', fontSize: '12px', padding: '0 14px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>模板名称</label>
                <input
                  type="text"
                  placeholder="如: 模拟面试官"
                  required
                  value={promptFormData.template_name}
                  onChange={(e) => setPromptFormData(prev => ({ ...prev, template_name: e.target.value }))}
                  className="cyber-input"
                  style={{ height: '36px', fontSize: '12px', padding: '0 14px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>系统提示词 (System Prompt)</label>
                <textarea
                  placeholder="编写系统指令，以决定 AI 导师的人格特征、解答方式及重点..."
                  required
                  value={promptFormData.system_prompt}
                  onChange={(e) => setPromptFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                  className="cyber-input"
                  style={{ minHeight: '160px', padding: '12px 14px', fontSize: '12px', lineHeight: '1.6', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="prompt-active-checkbox"
                  checked={promptFormData.is_active}
                  onChange={(e) => setPromptFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  style={{ cursor: 'pointer', accentColor: 'var(--primary-neon)' }}
                />
                <label htmlFor="prompt-active-checkbox" style={{ fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  保存后立即激活此模板
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px', marginTop: '6px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowPromptEditModal(false)}
                  className="cyber-btn"
                  style={{ padding: '8px 18px', background: 'rgba(0, 0, 0, 0.02)', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  disabled={savingPrompt}
                  className="cyber-btn"
                  style={{ padding: '8px 24px' }}
                >
                  {savingPrompt ? '保存中...' : '确认并保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
