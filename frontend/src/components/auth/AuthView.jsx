import React, { useState } from 'react';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { apiPost } from '../../utils/api';
import { saveSession } from '../../utils/session';
import { useAppContext } from '../../context/AppContext';

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
    setIsLoadingOrchestration,
    setOrchestrationStep,
    loadDashboardState,
    setActiveTab
  } = useAppContext();

  // Login inputs
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Authentication error state
  const [authError, setAuthError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) return;
    setAuthError('');

    try {
      const resData = await apiPost('/auth/login', {
        username: loginUsername,
        password: loginPassword
      });
      saveSession({ accessToken: resData.access_token, username: resData.username });
      setRegUsername(resData.username);
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
    if (!regUsername.trim() || !regPassword.trim()) return;
    setAuthError('');

    try {
      const resData = await apiPost('/auth/register', {
        username: regUsername,
        password: regPassword,
        cognitive_style: regCognitiveStyle,
        learning_goals: [regLearningGoal]
      });
      saveSession({ accessToken: resData.access_token, username: resData.username });
      setRegUsername(resData.username);
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
            onClick={() => setAuthMode('login')}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              background: authMode === 'login' ? 'var(--bg-card-solid)' : 'transparent',
              color: authMode === 'login' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: authMode === 'login' ? '0 2px 6px rgba(0,0,0,0.03)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            验证登录
          </button>
          <button
            onClick={() => setAuthMode('signup')}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              background: authMode === 'signup' ? 'var(--bg-card-solid)' : 'transparent',
              color: authMode === 'signup' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: authMode === 'signup' ? '0 2px 6px rgba(0,0,0,0.03)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            初始化账户
          </button>
        </div>

        {authError && (
          <div
            className="cyber-card"
            style={{
              padding: '12px 16px',
              background: 'rgba(190, 18, 60, 0.05)',
              borderColor: 'var(--danger)',
              color: 'var(--danger)',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '20px',
              borderRadius: '10px'
            }}
          >
            ⚠️ {authError}
          </div>
        )}

        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="form-group">
              <label className="form-label">学术通行证 (用户名/邮箱)</label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="输入您的账号..."
                className="cyber-input"
                style={{ padding: '12px 18px' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">通行密码</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="输入账户密码..."
                className="cyber-input"
                style={{ padding: '12px 18px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', fontSize: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--primary)' }} /> 记住本设备凭证
              </label>
              <span style={{ color: 'var(--secondary)', cursor: 'pointer', fontWeight: '600' }}>忘记密钥?</span>
            </div>
            <button type="submit" className="cyber-btn" style={{ justifyContent: 'center', padding: '14px', textTransform: 'none', letterSpacing: '0.05em' }}>
              验证凭证进入空间 <ArrowRight size={16} />
            </button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>
              还没有学术账户? <span onClick={() => setAuthMode('signup')} style={{ color: 'var(--secondary)', cursor: 'pointer', fontWeight: '700' }}>立即创建</span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="form-group">
              <label className="form-label">注册用户名</label>
              <input
                type="text"
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="设置您的学术昵称..."
                className="cyber-input"
                style={{ padding: '12px 18px' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">账户密码</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="设置您的安全密码..."
                className="cyber-input"
                style={{ padding: '12px 18px' }}
              />
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
              <div style={{ display: 'flex', gap: '10px' }}>
                <div
                  className={`cyber-card`}
                  style={{
                    flex: 1,
                    padding: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: regLearningGoal === 'Python Basics' ? 'rgba(15, 118, 110, 0.05)' : 'var(--bg-card-solid)',
                    borderColor: regLearningGoal === 'Python Basics' ? 'var(--primary-neon)' : 'var(--border-neon)',
                    fontSize: '13px',
                    fontWeight: '700'
                  }}
                  onClick={() => setRegLearningGoal('Python Basics')}
                >
                  Python 编程基础
                </div>
                <div
                  className={`cyber-card`}
                  style={{
                    flex: 1,
                    padding: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: regLearningGoal === 'Machine Learning' ? 'rgba(15, 118, 110, 0.05)' : 'var(--bg-card-solid)',
                    borderColor: regLearningGoal === 'Machine Learning' ? 'var(--primary-neon)' : 'var(--border-neon)',
                    fontSize: '13px',
                    fontWeight: '700'
                  }}
                  onClick={() => setRegLearningGoal('Machine Learning')}
                >
                  机器学习与深度学习
                </div>
              </div>
            </div>

            <button type="submit" className="cyber-btn" style={{ justifyContent: 'center', padding: '14px', textTransform: 'none', letterSpacing: '0.05em' }}>
              初始化学术环境并登录 <ArrowRight size={16} />
            </button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>
              已有学术账户? <span onClick={() => setAuthMode('login')} style={{ color: 'var(--secondary)', cursor: 'pointer', fontWeight: '700' }}>立即登录</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthView;
