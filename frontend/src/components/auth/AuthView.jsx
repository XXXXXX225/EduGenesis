import React, { useState, useEffect } from 'react';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { apiPost, apiGet } from '../../utils/api';
import { saveSession } from '../../utils/session';
import { useAppContext } from '../../context/AppContext';

// 密码校验: 至少8位，必须同时包含字母和数字
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) {
    errors.push('密码至少需要8个字符');
  }
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('密码必须包含至少一个字母');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('密码必须包含至少一个数字');
  }
  return errors;
}

// 用户名校验: 非空且去除首尾空格后不为空
function validateUsername(username) {
  if (!username || !username.trim()) {
    return ['用户名不能为空'];
  }
  return [];
}

const AuthView = () => {
  const {
    setCurrentView,
    authMode,
    setAuthMode,
    regUsername,
    setRegUsername,
    regPassword,
    setRegPassword,
    regCognitiveStyle,
    setRegCognitiveStyle,
    regLearningGoal,
    setRegLearningGoal,
    setIsLoggedIn,
    setUserRole,
    setIsLoadingOrchestration,
    setOrchestrationStep,
    loadDashboardState,
    setActiveTab
  } = useAppContext();

  // Login inputs
  const [loginUsername, setLoginUsername] = useState('');
  
  // 找回密码弹窗相关状态
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryUsername, setRecoveryUsername] = useState('');
  const [accountStatus, setAccountStatus] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('totp');
  const [totpVerifyCode, setTotpVerifyCode] = useState('');
  const [questionAnswers, setQuestionAnswers] = useState([]);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetRecoveryStates = () => {
    setRecoveryStep(1);
    setRecoveryUsername('');
    setAccountStatus(null);
    setSelectedMethod('totp');
    setTotpVerifyCode('');
    setQuestionAnswers([]);
    setResetToken('');
    setNewPassword('');
    setConfirmNewPassword('');
    setRecoveryError('');
    setIsSubmitting(false);
  };

  const handleRecoveryStep1 = async (e) => {
    e.preventDefault();
    setRecoveryError('');
    setIsSubmitting(true);
    try {
      const data = await apiPost('/auth/forgot-password/status', { username: recoveryUsername.trim() });
      setAccountStatus(data);
      if (!data.has_totp && !data.has_questions) {
        throw new Error("该账户尚未配置任何找回凭据，请联系系统管理员。");
      }
      if (data.has_totp) {
        setSelectedMethod('totp');
      } else {
        setSelectedMethod('questions');
      }
      if (data.has_questions) {
        setQuestionAnswers(data.questions.map(q => ({ question: q, answer: '' })));
      }
      setRecoveryStep(2);
    } catch (err) {
      setRecoveryError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoveryVerifyTOTP = async (e) => {
    e.preventDefault();
    setRecoveryError('');
    setIsSubmitting(true);
    try {
      const res = await apiPost('/auth/forgot-password/verify-totp', {
        username: recoveryUsername.trim(),
        code: totpVerifyCode.trim()
      });
      setResetToken(res.reset_token);
      setRecoveryStep(3);
    } catch (err) {
      setRecoveryError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoveryVerifyQuestions = async (e) => {
    e.preventDefault();
    setRecoveryError('');
    setIsSubmitting(true);
    try {
      const res = await apiPost('/auth/forgot-password/verify-questions', {
        username: recoveryUsername.trim(),
        answers: questionAnswers
      });
      setResetToken(res.reset_token);
      setRecoveryStep(3);
    } catch (err) {
      setRecoveryError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoveryResetPassword = async (e) => {
    e.preventDefault();
    setRecoveryError('');
    
    const pwdErrors = validatePassword(newPassword);
    if (pwdErrors.length > 0) {
      setRecoveryError(pwdErrors[0]);
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setRecoveryError("两次输入的新密码不匹配，请重新确认。");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost('/auth/forgot-password/reset', {
        reset_token: resetToken,
        new_password: newPassword
      });
      alert("通行密码重置成功，请使用新密码重新登录！");
      setShowRecoveryModal(false);
      resetRecoveryStates();
    } catch (err) {
      setRecoveryError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);


  // Authentication error state
  const [authError, setAuthError] = useState('');
  // 字段级校验错误
  const [fieldErrors, setFieldErrors] = useState({});

  // Dynamic registered courses list
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiGet('/kb/courses');
        setCourses(data);
        if (data && data.length > 0) {
          // If the default regLearningGoal is not in fetched list, set to first course
          const match = data.find(c => c.display_name === regLearningGoal || c.course_id === regLearningGoal);
          if (!match) {
            setRegLearningGoal(data[0].display_name);
          }
        }
      } catch (err) {
        console.error("加载注册课程失败:", err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    // 前端校验
    const errors = {};
    const userErr = validateUsername(loginUsername);
    const pwdErr = validatePassword(loginPassword);
    if (userErr.length) errors.loginUsername = userErr;
    if (pwdErr.length) errors.loginPassword = pwdErr;
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setAuthError('');
      return;
    }
    setFieldErrors({});
    setAuthError('');

    try {
      const resData = await apiPost('/auth/login', {
        username: loginUsername.trim(),
        password: loginPassword
      });
      saveSession({ accessToken: resData.access_token, username: resData.username, role: resData.role }, rememberMe);

      setRegUsername(resData.username);
      setUserRole(resData.role);
      setIsLoggedIn(true);

      // If login successful, show short loading orchestration
      setIsLoadingOrchestration(true);
      setOrchestrationStep(0);

      setTimeout(() => {
        setOrchestrationStep(1);
      }, 800);

      setTimeout(() => {
        setOrchestrationStep(3);
      }, 1600);

      setTimeout(async () => {
        try {
          await loadDashboardState();
        } catch (err) {
          console.warn("Error fetching states on login complete:", err);
        } finally {
          setIsLoadingOrchestration(false);
          setCurrentView('dashboard');
          setActiveTab('home');
        }
      }, 2400);

    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    // 前端校验
    const errors = {};
    const userErr = validateUsername(regUsername);
    const pwdErr = validatePassword(regPassword);
    if (userErr.length) errors.regUsername = userErr;
    if (pwdErr.length) errors.regPassword = pwdErr;
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setAuthError('');
      return;
    }
    setFieldErrors({});
    setAuthError('');

    try {
      const resData = await apiPost('/auth/register', {
        username: regUsername.trim(),
        password: regPassword,
        cognitive_style: regCognitiveStyle,
        learning_goals: [regLearningGoal]
      });
      saveSession({ accessToken: resData.access_token, username: resData.username, role: resData.role || 'user' }, rememberMe);

      setRegUsername(resData.username);
      setUserRole(resData.role || 'user');
      setIsLoggedIn(true);

      // If successful, trigger loading orchestration animation
      setIsLoadingOrchestration(true);
      setOrchestrationStep(0);

      setTimeout(() => {
        setOrchestrationStep(1);
      }, 1200);

      setTimeout(() => {
        setOrchestrationStep(2);
      }, 2400);

      setTimeout(() => {
        setOrchestrationStep(3);
      }, 3600);

      setTimeout(async () => {
        try {
          await loadDashboardState();
        } catch (err) {
          console.warn("Error fetching initial states on registration complete:", err);
        } finally {
          setIsLoadingOrchestration(false);
          setCurrentView('dashboard');
          setActiveTab('home');
        }
      }, 4800);

    } catch (err) {
      setAuthError(err.message);
    }
  };

  // 渲染字段级错误的辅助函数
  const renderFieldErrors = (field) => {
    if (!fieldErrors[field]?.length) return null;
    return (
      <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {fieldErrors[field].map((msg, i) => (
          <span key={i} style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: '600' }}>
            {msg}
          </span>
        ))}
      </div>
    );
  };

  // 清除字段级错误（当用户修改输入时）
  const clearFieldError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="cyber-card auth-card anim-scale-up">
        {/* Back to Home Link */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <span onClick={() => setCurrentView('landing')} style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ← 返回系统门户
          </span>
          <span className="neon-badge neon-badge-primary">学术验证通道</span>
        </div>

        {/* Logo representation in card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{ padding: '6px', background: 'rgba(15, 118, 110, 0.08)', borderRadius: '8px', display: 'flex' }}>
            <GraduationCap size={18} style={{ color: 'var(--primary-neon)' }} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.03em' }}>
            学术登入 Edu<span style={{ color: 'var(--secondary)' }}>Genesis</span>
          </h2>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-chat-form)', padding: '4px', borderRadius: '10px', marginBottom: '28px' }}>
          <button
            onClick={() => { setAuthMode('login'); setFieldErrors({}); setAuthError(''); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '12px',
              background: authMode === 'login' ? 'var(--bg-card-solid)' : 'transparent',
              color: authMode === 'login' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: authMode === 'login' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            验证登录
          </button>
          <button
            onClick={() => { setAuthMode('signup'); setFieldErrors({}); setAuthError(''); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '12px',
              background: authMode === 'signup' ? 'var(--bg-card-solid)' : 'transparent',
              color: authMode === 'signup' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: authMode === 'signup' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            初始化账户
          </button>
        </div>

        {/* Error Display (API 级) */}
        {authError && (
          <div style={{
            background: 'rgba(190, 18, 60, 0.08)',
            border: '1px solid rgba(190, 18, 60, 0.25)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '13px',
            color: 'var(--danger)',
            fontWeight: '600'
          }}>
            {authError}
          </div>
        )}

        {/* Login Form */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="form-group">
              <label className="form-label">学术通行证 (用户名/邮箱)</label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => { setLoginUsername(e.target.value); clearFieldError('loginUsername'); }}
                placeholder="输入您的账号..."
                className="cyber-input"
                style={{ padding: '12px 18px' }}
              />
              {renderFieldErrors('loginUsername')}
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">通行密码</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => { setLoginPassword(e.target.value); clearFieldError('loginPassword'); }}
                placeholder="输入账户密码..."
                className="cyber-input"
                style={{ padding: '12px 18px' }}
              />
              {renderFieldErrors('loginPassword')}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', fontSize: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  style={{ accentColor: 'var(--primary)' }} 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                /> 记住本设备凭证
              </label>

              <span onClick={() => { setShowRecoveryModal(true); setRecoveryError(''); }} style={{ color: 'var(--secondary)', cursor: 'pointer', fontWeight: '600' }}>忘记密钥?</span>
            </div>
            <button type="submit" className="cyber-btn" style={{ justifyContent: 'center', padding: '14px', textTransform: 'none', letterSpacing: '0.05em' }}>
              验证凭证进入空间 <ArrowRight size={16} />
            </button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>
              还没有学术账户? <span onClick={() => setAuthMode('signup')} style={{ color: 'var(--secondary)', cursor: 'pointer', fontWeight: '700' }}>立即创建</span>
            </p>
          </form>
        )}

        {/* Signup Form */}
        {authMode === 'signup' && (
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="form-group">
              <label className="form-label">学术账户名称</label>
              <input
                type="text"
                required
                value={regUsername}
                onChange={(e) => { setRegUsername(e.target.value); clearFieldError('regUsername'); }}
                placeholder="选择您的学术账户名称..."
                className="cyber-input"
                style={{ padding: '12px 18px' }}
              />
              {renderFieldErrors('regUsername')}
            </div>
            <div className="form-group">
              <label className="form-label">账户密码</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => { setRegPassword(e.target.value); clearFieldError('regPassword'); }}
                placeholder="设置您的安全密码..."
                className="cyber-input"
                style={{ padding: '12px 18px' }}
              />
              {renderFieldErrors('regPassword')}
              <div style={{ marginTop: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                  密码要求: 至少8位，必须同时包含字母和数字
                </span>
              </div>
            </div>

            {/* Cognitive Style Option Radio Cards */}
            <div className="form-group">
              <label className="form-label">首选认知风格评估</label>
              <div className="radio-card-grid">
                <div
                  className={`radio-card ${regCognitiveStyle === 'Practical Coding' ? 'selected' : ''}`}
                  onClick={() => setRegCognitiveStyle('Practical Coding')}
                >
                  <span className="radio-card-title">实操编码型 (Practical Coding)</span>
                  <span className="radio-card-desc">偏好代码实战与测试驱动，以源码阅读和诊断测试为主。</span>
                </div>
                <div
                  className={`radio-card ${regCognitiveStyle === 'Theoretical/Self-Paced' ? 'selected' : ''}`}
                  onClick={() => setRegCognitiveStyle('Theoretical/Self-Paced')}
                >
                  <span className="radio-card-title">理论自导型 (Theoretical/Self-Paced)</span>
                  <span className="radio-card-desc">侧重于深层的理论基础、公式讲解，提供更详尽的思维图。</span>
                </div>
                <div
                  className={`radio-card ${regCognitiveStyle === 'Visual/Guided' ? 'selected' : ''}`}
                  onClick={() => setRegCognitiveStyle('Visual/Guided')}
                >
                  <span className="radio-card-title">视觉引导型 (Visual/Guided)</span>
                  <span className="radio-card-desc">侧重于直观动画图解，需要更丰富的音画同步视频讲解。</span>
                </div>
              </div>
            </div>

            {/* Learning Goal Selector */}
            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label">学习目标主题</label>
              {loadingCourses ? (
                <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', border: '1px dashed var(--border-neon)', borderRadius: '8px' }}>
                  正在检索自适应云端学术路径...
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {courses.map((course) => {
                    const isSelected = regLearningGoal === course.display_name || regLearningGoal === course.course_id;
                    return (
                      <div
                        key={course.course_id}
                        className={`cyber-card`}
                        style={{
                          flex: '1 1 calc(50% - 6px)',
                          minWidth: '150px',
                          padding: '12px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(15, 118, 110, 0.08)' : 'var(--bg-card-solid)',
                          borderColor: isSelected ? 'var(--primary-neon)' : 'var(--border-neon)',
                          boxShadow: isSelected ? '0 0 10px rgba(15, 118, 110, 0.15)' : 'none',
                          fontSize: '13px',
                          fontWeight: '700',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          justifyContent: 'center'
                        }}
                        onClick={() => setRegLearningGoal(course.display_name)}
                      >
                        <div style={{ color: isSelected ? 'var(--primary-neon)' : 'var(--text-main)' }}>
                          {course.display_name}
                        </div>
                        {course.description && (
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '400', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={course.description}>
                            {course.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button type="submit" className="cyber-btn" style={{ justifyContent: 'center', padding: '14px', textTransform: 'none', letterSpacing: '0.05em' }}>
              初始化学术环境并登录 <ArrowRight size={16} />
            </button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>
              已有学术账户? <span onClick={() => setAuthMode('login')} style={{ color: 'var(--secondary)', cursor: 'pointer', fontWeight: '700' }}>立即登录</span>
            </p>
          </form>
        )}
        {/* Forgot Password Recovery Modal */}
        {showRecoveryModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(5, 23, 21, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div className="cyber-card anim-scale-up" style={{
              width: '100%',
              maxWidth: '440px',
              padding: '28px',
              background: 'var(--bg-chat-form)',
              border: '1.5px solid var(--border-neon)',
              boxShadow: '0 8px 32px rgba(13, 148, 136, 0.25)',
              position: 'relative'
            }}>
              
              <button
                onClick={() => {
                  setShowRecoveryModal(false);
                  resetRecoveryStates();
                }}
                type="button"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '18px',
                  outline: 'none'
                }}
              >
                ✕
              </button>

              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--secondary)' }}>🔑</span> 通行证安全找回中心
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '20px', lineHeight: '1.5', margin: 0 }}>
                利用系统安全密保或二级身份验证码重新校验并重设您的通行密码。
              </p>

              {recoveryError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  marginTop: '16px',
                  fontSize: '12px',
                  color: '#ef4444',
                  fontWeight: '600'
                }}>
                  {recoveryError}
                </div>
              )}

              {/* Step 1: Input username */}
              {recoveryStep === 1 && (
                <form onSubmit={handleRecoveryStep1} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>学术账户名称</label>
                    <input
                      type="text"
                      required
                      value={recoveryUsername}
                      onChange={(e) => setRecoveryUsername(e.target.value)}
                      placeholder="输入需要找回的用户名..."
                      className="cyber-input"
                      style={{ padding: '10px 14px', fontSize: '13px' }}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="cyber-btn" 
                    style={{ justifyContent: 'center', padding: '12px', marginTop: '6px' }}
                  >
                    {isSubmitting ? '核对账号中...' : '校验账户并下一步'}
                  </button>
                </form>
              )}

              {/* Step 2: Choose verification method & Input codes/answers */}
              {recoveryStep === 2 && accountStatus && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  
                  {accountStatus.has_totp && accountStatus.has_questions && (
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.15)', padding: '3px', borderRadius: '8px' }}>
                      <button
                        onClick={() => { setSelectedMethod('totp'); setRecoveryError(''); }}
                        type="button"
                        style={{
                          flex: 1,
                          padding: '6px',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '11px',
                          background: selectedMethod === 'totp' ? 'var(--bg-card-solid)' : 'transparent',
                          color: selectedMethod === 'totp' ? 'var(--text-main)' : 'var(--text-muted)'
                        }}
                      >
                        验证器 (2FA)
                      </button>
                      <button
                        onClick={() => { setSelectedMethod('questions'); setRecoveryError(''); }}
                        type="button"
                        style={{
                          flex: 1,
                          padding: '6px',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '11px',
                          background: selectedMethod === 'questions' ? 'var(--bg-card-solid)' : 'transparent',
                          color: selectedMethod === 'questions' ? 'var(--text-main)' : 'var(--text-muted)'
                        }}
                      >
                        密保问答
                      </button>
                    </div>
                  )}

                  {/* Method 1: TOTP verification */}
                  {selectedMethod === 'totp' && (
                    <form onSubmit={handleRecoveryVerifyTOTP} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '11px' }}>
                          两步动态验证码 / 备份恢复密钥
                        </label>
                        <input
                          type="text"
                          required
                          value={totpVerifyCode}
                          onChange={(e) => setTotpVerifyCode(e.target.value)}
                          placeholder="输入 6 位验证码 或 GENESIS- 恢复码"
                          className="cyber-input"
                          style={{ padding: '10px 14px', fontSize: '13px', letterSpacing: totpVerifyCode.length === 6 ? '2px' : 'normal' }}
                        />
                        <span style={{ fontSize: '9.5px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                          请输入手机 Authenticator 上当前显示的 6 位动态验证码，或在绑定时留存的备用恢复密钥。
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                        <button
                          onClick={() => setRecoveryStep(1)}
                          type="button"
                          className="cyber-btn"
                          style={{ padding: '12px', background: 'rgba(0,0,0,0.02)', borderColor: 'var(--border-neon)', color: 'var(--text-muted)' }}
                        >
                          返回
                        </button>
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="cyber-btn" 
                          style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
                        >
                          {isSubmitting ? '核对安全凭证...' : '验证并下一步'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Method 2: Security Questions verification */}
                  {selectedMethod === 'questions' && (
                    <form onSubmit={handleRecoveryVerifyQuestions} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {questionAnswers.map((item, index) => (
                          <div key={index} className="form-group" style={{ margin: 0 }}>
                            <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>
                              问答 {index + 1}: <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{item.question}</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={item.answer}
                              onChange={(e) => {
                                const copy = [...questionAnswers];
                                copy[index].answer = e.target.value;
                                setQuestionAnswers(copy);
                              }}
                              placeholder="输入密保答案..."
                              className="cyber-input"
                              style={{ padding: '8px 12px', fontSize: '12px' }}
                            />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                        <button
                          onClick={() => setRecoveryStep(1)}
                          type="button"
                          className="cyber-btn"
                          style={{ padding: '12px', background: 'rgba(0,0,0,0.02)', borderColor: 'var(--border-neon)', color: 'var(--text-muted)' }}
                        >
                          返回
                        </button>
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="cyber-btn" 
                          style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
                        >
                          {isSubmitting ? '核对密保答案...' : '验证并下一步'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Step 3: Input new password to reset */}
              {recoveryStep === 3 && (
                <form onSubmit={handleRecoveryResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>重设新密码</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="设置您的安全新密码..."
                      className="cyber-input"
                      style={{ padding: '10px 14px', fontSize: '13px' }}
                    />
                    <span style={{ fontSize: '9.5px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                      密码必须包含至少一个字母、至少一个数字，长度不少于 8 位。
                    </span>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>确认新密码</label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="再次输入新密码核实..."
                      className="cyber-input"
                      style={{ padding: '10px 14px', fontSize: '13px' }}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !newPassword || newPassword !== confirmNewPassword}
                    className="cyber-btn" 
                    style={{ justifyContent: 'center', padding: '12px', marginTop: '6px' }}
                  >
                    {isSubmitting ? '正在重写凭证...' : '确认重设新密码'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthView;
