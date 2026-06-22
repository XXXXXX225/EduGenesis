import React, { useState, useEffect } from 'react';
import { 
  Users, MessageSquare, HelpCircle, Shield, 
  Search, RefreshCw, Cpu, Activity, Clock, CheckCircle2, Award, AlertCircle,
  AlertTriangle, X
} from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '../../utils/api';
import { getStoredUsername } from '../../utils/session';

const AdminView = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserLog, setSelectedUserLog] = useState('');
  const [selectedLogLevel, setSelectedLogLevel] = useState('');

  // User Management State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  
  // Create User Form State
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState('user');
  const [createCognitiveStyle, setCreateCognitiveStyle] = useState('Practical Coding');
  const [createLearningGoals, setCreateLearningGoals] = useState(['Python Basics']);
  
  // Edit Password Form State
  const [newPassword, setNewPassword] = useState('');
  
  // Submit & Alert State
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });

  const showAlert = (type, msg) => {
    setAlertInfo({ type, message: msg });
    setTimeout(() => {
      setAlertInfo({ type: '', message: '' });
    }, 5000);
  };

  // Opening Modals
  const openCreateModal = () => {
    setCreateUsername('');
    setCreatePassword('');
    setCreateRole('user');
    setCreateCognitiveStyle('Practical Coding');
    setCreateLearningGoals(['Python Basics']);
    setShowCreateModal(true);
  };

  const openPasswordModal = (username) => {
    setSelectedUser(username);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const openDeleteModal = (username) => {
    setSelectedUser(username);
    setShowDeleteModal(true);
  };

  // Submit handlers
  const handleCreateUser = async (e) => {
    e.preventDefault();
    const cleanUsername = createUsername.trim();
    if (!cleanUsername) return showAlert('error', '请输入用户名！');
    if (createPassword.length < 4) return showAlert('error', '密码太短，至少 4 位！');
    if (createLearningGoals.length === 0) return showAlert('error', '请至少选择一个学习目标！');

    setModalSubmitting(true);
    try {
      const response = await apiPost('/admin/users/create', {
        username: cleanUsername,
        password: createPassword,
        role: createRole,
        cognitive_style: createCognitiveStyle,
        learning_goals: createLearningGoals
      });
      showAlert('success', response.detail || '用户创建成功！');
      setShowCreateModal(false);
      fetchAdminData(true);
    } catch (err) {
      console.error(err);
      showAlert('error', err.message || '创建用户失败！');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 4) return showAlert('error', '密码太短，至少 4 位！');

    setModalSubmitting(true);
    try {
      const response = await apiPost('/admin/users/password', {
        username: selectedUser,
        password: newPassword
      });
      showAlert('success', response.detail || '密码修改成功！');
      setShowPasswordModal(false);
      fetchAdminData(true);
    } catch (err) {
      console.error(err);
      showAlert('error', err.message || '重置密码失败！');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleToggleRole = async (username, currentRole) => {
    const targetRole = currentRole === 'admin' ? 'user' : 'admin';
    const currentUsername = getStoredUsername();
    
    if (username === currentUsername) {
      return showAlert('error', '安全拦截：不能修改自身管理员账户的权限角色！');
    }

    setModalSubmitting(true);
    try {
      const response = await apiPost('/admin/users/role', { username, role: targetRole });
      showAlert('success', response.detail || `已成功将 "${username}" 的角色更新为 "${targetRole}"。`);
      fetchAdminData(true);
    } catch (err) {
      console.error(err);
      showAlert('error', err.message || '更新角色失败！');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    const currentUsername = getStoredUsername();
    if (selectedUser === currentUsername) {
      setShowDeleteModal(false);
      return showAlert('error', '安全拦截：不能删除当前正在登录的管理员账户！');
    }

    setModalSubmitting(true);
    try {
      const response = await apiDelete(`/admin/users/${selectedUser}`);
      showAlert('success', response.detail || '账户已彻底删除！');
      setShowDeleteModal(false);
      fetchAdminData(true);
    } catch (err) {
      console.error(err);
      showAlert('error', err.message || '删除账户失败！');
    } finally {
      setModalSubmitting(false);
    }
  };

  // Fetch admin dashboard details
  const fetchAdminData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [statsData, usersData, logsData] = await Promise.all([
        apiGet('/admin/stats'),
        apiGet('/admin/users'),
        apiGet('/admin/logs')
      ]);
      setStats(statsData);
      setUsers(usersData);
      setLogs(logsData);
    } catch (err) {
      console.error("加载管理员数据异常:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRefresh = () => {
    fetchAdminData(true);
  };

  // Filtered users list
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered logs list
  const filteredLogs = logs.filter(log => {
    const userMatch = selectedUserLog ? log.username === selectedUserLog : true;
    const levelMatch = selectedLogLevel ? log.log_type === selectedLogLevel : true;
    return userMatch && levelMatch;
  });

  const getLogTypeBadgeClass = (type) => {
    if (type === 'error') return 'neon-badge-danger';
    if (type === 'warning') return 'neon-badge-warning';
    return 'neon-badge-primary';
  };

  const getLogSenderColor = (sender) => {
    if (sender === '主管智能体') return 'var(--secondary)';
    if (sender === '画像智能体') return 'var(--primary-neon)';
    if (sender === '路径智能体') return 'var(--accent-cyan)';
    if (sender === '安全校验智能体') return 'var(--accent)';
    return 'var(--text-main)';
  };

  // Helper to render stylish progress bar chart
  const renderProgressBar = (label, count, total, gradient) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '5px', fontWeight: '700' }}>
          <span style={{ color: 'var(--text-main)' }}>{label}</span>
          <span style={{ color: 'var(--text-muted)' }}>{count} 人 ({percentage}%)</span>
        </div>
        <div style={{ height: '7px', background: 'rgba(0, 0, 0, 0.04)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${percentage}%`, 
            background: gradient, 
            borderRadius: '99px',
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' 
          }} />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', padding: '40px', gap: '16px' }}>
        <div className="pulse-glow-green" style={{ display: 'flex', padding: '12px', background: 'rgba(15, 118, 110, 0.05)', borderRadius: '12px', border: '1px solid var(--border-neon)' }}>
          <Shield size={24} style={{ color: 'var(--primary-neon)' }} className="anim-rotate" />
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 'bold' }}>正在建立系统层主审计信道...</div>
      </div>
    );
  }

  const totalRegisteredUsers = stats?.total_users || 0;

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', overflowY: 'auto' }}>
      {/* Dynamic alert banner */}
      {alertInfo.message && (
        <div className={`neon-badge ${alertInfo.type === 'error' ? 'neon-badge-danger' : 'neon-badge-primary'}`} style={{ 
          padding: '12px 18px', 
          fontSize: '12.5px', 
          borderRadius: '10px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          animation: 'tabFadeIn 0.3s ease-out',
          flexShrink: 0 
        }}>
          <AlertCircle size={16} />
          <span>{alertInfo.message}</span>
        </div>
      )}

      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.03em', margin: 0 }}>
              系统主监察审计中心
            </h2>
            <span className="neon-badge neon-badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', padding: '2px 8px' }}>
              <Activity size={10} /> 管理员态
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            实时审计学术空间用户画像分布、智能体操作日志及系统核心负载指标。
          </p>
        </div>
        <button 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="cyber-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '12px' }}
        >
          <RefreshCw size={12} className={refreshing ? 'anim-rotate' : ''} />
          {refreshing ? '更新中...' : '刷新看板'}
        </button>
      </div>

      {/* Grid: 4 Core metrics stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', flexShrink: 0 }}>
        <div className="cyber-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-card-glass)' }}>
          <div style={{ padding: '10px', background: 'rgba(15, 118, 110, 0.06)', borderRadius: '10px', display: 'flex', border: '1px solid rgba(15, 118, 110, 0.1)' }}>
            <Users size={20} style={{ color: 'var(--primary-neon)' }} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: 'bold' }}>注册学生总量</span>
            <span style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{stats?.total_users || 0}</span>
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-card-glass)' }}>
          <div style={{ padding: '10px', background: 'rgba(29, 78, 216, 0.06)', borderRadius: '10px', display: 'flex', border: '1px solid rgba(29, 78, 216, 0.1)' }}>
            <MessageSquare size={20} style={{ color: 'var(--secondary)' }} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: 'bold' }}>活跃会话总数</span>
            <span style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{stats?.total_sessions || 0}</span>
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-card-glass)' }}>
          <div style={{ padding: '10px', background: 'rgba(180, 83, 9, 0.06)', borderRadius: '10px', display: 'flex', border: '1px solid rgba(180, 83, 9, 0.1)' }}>
            <HelpCircle size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: 'bold' }}>错题本总记录</span>
            <span style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{stats?.total_errors || 0}</span>
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-card-glass)' }}>
          <div style={{ padding: '10px', background: 'rgba(2, 132, 199, 0.06)', borderRadius: '10px', display: 'flex', border: '1px solid rgba(2, 132, 199, 0.1)' }}>
            <Cpu size={20} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: 'bold' }}>智能体操作日志</span>
            <span style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{stats?.total_logs || 0}</span>
          </div>
        </div>
      </div>

      {/* Grid: Style distribution and Goals distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', flexShrink: 0 }}>
        {/* Style distribution */}
        <div className="cyber-card" style={{ padding: '18px', background: 'var(--bg-card-glass)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '8px', margin: 0 }}>
            <Activity size={14} style={{ color: 'var(--primary-neon)' }} /> 认知学习风格分布
          </h3>
          <div style={{ padding: '4px 0' }}>
            {renderProgressBar(
              "实操编码型 (Practical Coding)", 
              stats?.cognitive_distribution?.["Practical Coding"] || 0, 
              totalRegisteredUsers, 
              'linear-gradient(90deg, var(--primary-neon), var(--secondary))'
            )}
            {renderProgressBar(
              "理论自导型 (Theoretical/Self-Paced)", 
              stats?.cognitive_distribution?.["Theoretical/Self-Paced"] || 0, 
              totalRegisteredUsers, 
              'linear-gradient(90deg, var(--secondary), var(--accent-cyan))'
            )}
            {renderProgressBar(
              "视觉引导型 (Visual/Guided)", 
              stats?.cognitive_distribution?.["Visual/Guided"] || 0, 
              totalRegisteredUsers, 
              'linear-gradient(90deg, var(--accent), var(--primary))'
            )}
          </div>
        </div>

        {/* Learning goals distribution */}
        <div className="cyber-card" style={{ padding: '18px', background: 'var(--bg-card-glass)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '8px', margin: 0 }}>
            <Award size={14} style={{ color: 'var(--secondary)' }} /> 热门学习目标统计
          </h3>
          <div style={{ maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
            {stats?.goals_distribution && Object.keys(stats.goals_distribution).length > 0 ? (
              Object.entries(stats.goals_distribution).map(([goal, count]) => (
                <div key={goal} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px dashed rgba(0,0,0,0.04)', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{goal}</span>
                  <span className="neon-badge neon-badge-primary" style={{ padding: '1px 8px', fontSize: '10px' }}>
                    {count} 位学习者
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>暂无学习目标分布</div>
            )}
          </div>
        </div>
      </div>

      {/* User profile list section */}
      <div className="cyber-card" style={{ padding: '20px', background: 'var(--bg-card-glass)', display: 'flex', flexDirection: 'column', gap: '16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            <Users size={15} style={{ color: 'var(--primary-neon)' }} /> 学生画像大纲与学术档案
          </h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* User search bar */}
            <div style={{ position: 'relative', width: '200px' }}>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索学术通行证..."
                className="cyber-input"
                style={{ padding: '8px 12px 8px 32px', fontSize: '12px', width: '100%', borderRadius: '8px' }}
              />
              <Search size={12} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            {/* Create account button */}
            <button 
              onClick={openCreateModal}
              className="cyber-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '12px', background: 'rgba(15, 118, 110, 0.08)', color: 'var(--primary-neon)' }}
            >
              <Users size={12} />
              创建账户
            </button>
          </div>
        </div>

        {/* User list table wrapper */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-neon)', borderRadius: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-neon)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 'bold' }}>用户名</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 'bold' }}>账户权限</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 'bold' }}>学习目标</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 'bold' }}>掌握度</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 'bold' }}>自适应节奏</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 'bold' }}>累计时间</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 'bold' }}>正确率</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 'bold' }}>关卡进度</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 'bold', textAlign: 'center' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.username} style={{ borderBottom: '1px solid var(--border-neon)', transition: 'background 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '12px 16px', fontWeight: 'bold', color: 'var(--text-main)' }}>{user.username}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`neon-badge ${user.role === 'admin' ? 'neon-badge-danger' : 'neon-badge-primary'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                        {user.role === 'admin' ? '管理员' : '普通学生'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{user.learning_goals.join(', ')}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--primary)' }}>{user.knowledge_base}%</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-dim)' }}>{user.learning_pace}%</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} /> {user.study_time} 分钟
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={11} style={{ color: 'var(--success)' }} /> {user.quiz_accuracy}%
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{user.mastered_nodes}</span> / 8 关
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                        <button 
                          onClick={() => setSelectedUserLog(user.username)}
                          className="cyber-btn"
                          style={{ padding: '4px 8px', fontSize: '10.5px', textTransform: 'none', borderRadius: '6px' }}
                          title="追踪协作日志"
                        >
                          日志
                        </button>
                        <button 
                          onClick={() => openPasswordModal(user.username)}
                          className="cyber-btn"
                          style={{ padding: '4px 8px', fontSize: '10.5px', textTransform: 'none', borderRadius: '6px', background: 'rgba(180, 83, 9, 0.05)', color: 'var(--accent)' }}
                          title="修改账户密码"
                        >
                          改密
                        </button>
                        <button 
                          onClick={() => handleToggleRole(user.username, user.role)}
                          className="cyber-btn"
                          style={{ padding: '4px 8px', fontSize: '10.5px', textTransform: 'none', borderRadius: '6px', background: 'rgba(29, 78, 216, 0.05)', color: 'var(--secondary)' }}
                          title={user.role === 'admin' ? "降权为普通学生" : "提权为管理员"}
                        >
                          {user.role === 'admin' ? '降权' : '提权'}
                        </button>
                        <button 
                          onClick={() => openDeleteModal(user.username)}
                          className="cyber-btn"
                          style={{ padding: '4px 8px', fontSize: '10.5px', textTransform: 'none', borderRadius: '6px', background: 'rgba(220, 38, 38, 0.05)', color: 'var(--danger)' }}
                          title="彻底删除账户"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    未匹配到任何学术空间用户档案。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Agent operation logs stream panel */}
      <div className="cyber-card" style={{ padding: '20px', background: 'var(--bg-card-glass)', display: 'flex', flexDirection: 'column', gap: '16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <Cpu size={15} style={{ color: 'var(--secondary)' }} /> 系统多智能体全局协作日志流
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              捕获并呈现自适应网络中画像、路径、主管和安全防幻觉智能体之间的会话及操作流。
            </p>
          </div>
          {/* Logs Filter control bar */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {selectedUserLog && (
              <span 
                onClick={() => setSelectedUserLog('')}
                className="neon-badge neon-badge-danger" 
                style={{ cursor: 'pointer', padding: '4px 10px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="点击清除过滤"
              >
                过滤用户: {selectedUserLog} <X size={10} style={{ marginLeft: '2px' }} />
              </span>
            )}
            <select
              value={selectedLogLevel}
              onChange={(e) => setSelectedLogLevel(e.target.value)}
              className="cyber-input"
              style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '6px', width: '120px', background: 'var(--bg-card-active)', border: '1px solid var(--border-neon)' }}
            >
              <option value="">全部日志级别</option>
              <option value="info">INFO (常规协作)</option>
              <option value="error">ERROR (沙盒错误/异常)</option>
            </select>
          </div>
        </div>

        {/* Scrollable logs viewport */}
        <div 
          style={{ 
            height: '240px', 
            background: 'var(--bg-chat-form)', 
            borderRadius: '12px', 
            padding: '16px', 
            fontFamily: 'monospace', 
            fontSize: '11.5px', 
            overflowY: 'auto',
            border: '1px solid var(--border-neon)',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  padding: '8px 12px', 
                  background: 'var(--bg-card-solid)', 
                  borderRadius: '6px',
                  borderLeft: `3px solid ${log.log_type === 'error' ? 'var(--danger)' : 'var(--primary)'}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-dim)', fontWeight: 'bold' }}>[{log.timestamp}]</span>
                    <span style={{ color: getLogSenderColor(log.sender), fontWeight: 'bold' }}>{log.sender}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({log.username})</span>
                  </div>
                  <span className={`neon-badge ${getLogTypeBadgeClass(log.log_type)}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                    {log.log_type.toUpperCase()}
                  </span>
                </div>
                <div style={{ color: log.log_type === 'error' ? 'var(--danger)' : 'var(--text-main)', wordBreak: 'break-all', paddingLeft: '4px' }}>
                  {log.message}
                </div>
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--text-dim)', gap: '8px' }}>
              <AlertCircle size={14} />
              没有匹配到对应的智能体运行期协作日志。
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 15, 30, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="cyber-card" style={{
            width: '100%',
            maxWidth: '460px',
            padding: '24px',
            background: 'var(--bg-card)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
            animation: 'tabFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', paddingBottom: '12px', margin: 0 }}>
              <Users size={18} style={{ color: 'var(--primary-neon)' }} /> 初始化新学术通行证
            </h3>
            
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>用户名 / 昵称 (学术主键)</label>
                <input 
                  type="text"
                  required
                  value={createUsername}
                  onChange={(e) => setCreateUsername(e.target.value)}
                  placeholder="请输入用户名，如: student_bob"
                  className="cyber-input"
                  style={{ padding: '10px 14px', fontSize: '12.5px', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>学术登录密码</label>
                <input 
                  type="password"
                  required
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="请设置登录密码，至少 4 位"
                  className="cyber-input"
                  style={{ padding: '10px 14px', fontSize: '12.5px', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>账户权限角色</label>
                  <select 
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value)}
                    className="cyber-input"
                    style={{ padding: '10px 14px', fontSize: '12.5px', borderRadius: '8px', background: 'var(--bg-card-active)' }}
                  >
                    <option value="user">普通学生 (user)</option>
                    <option value="admin">系统管理员 (admin)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>认知学习风格</label>
                  <select 
                    value={createCognitiveStyle}
                    onChange={(e) => setCreateCognitiveStyle(e.target.value)}
                    className="cyber-input"
                    style={{ padding: '10px 14px', fontSize: '12.5px', borderRadius: '8px', background: 'var(--bg-card-active)' }}
                  >
                    <option value="Practical Coding">实操编码型 (Practical)</option>
                    <option value="Theoretical/Self-Paced">理论自导型 (Theoretical)</option>
                    <option value="Visual/Guided">视觉引导型 (Visual)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>核心学习目标</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '10px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px solid var(--border-neon)' }}>
                  {['Python Basics', 'Machine Learning'].map(goal => (
                    <label key={goal} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>
                      <input 
                        type="checkbox"
                        checked={createLearningGoals.includes(goal)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCreateLearningGoals([...createLearningGoals, goal]);
                          } else {
                            setCreateLearningGoals(createLearningGoals.filter(g => g !== goal));
                          }
                        }}
                      />
                      {goal === 'Python Basics' ? 'Python 编程基础' : 'Machine Learning 机器学习'}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid rgba(0, 0, 0, 0.05)', paddingTop: '16px' }}>
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="cyber-btn"
                  style={{ padding: '8px 16px', fontSize: '12px', background: 'transparent', border: '1px solid var(--border-neon)', color: 'var(--text-muted)' }}
                  disabled={modalSubmitting}
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="cyber-btn"
                  style={{ padding: '8px 20px', fontSize: '12px', background: 'var(--primary)', color: '#fff' }}
                  disabled={modalSubmitting}
                >
                  {modalSubmitting ? '正在初始化...' : '确认创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Password Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 15, 30, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="cyber-card" style={{
            width: '100%',
            maxWidth: '380px',
            padding: '24px',
            background: 'var(--bg-card)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
            animation: 'tabFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', paddingBottom: '12px', margin: 0 }}>
              <Shield size={18} style={{ color: 'var(--accent)' }} /> 重置学术密码
            </h3>
            
            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '12.5px', color: 'var(--text-main)', marginBottom: '4px' }}>
                目标用户: <span style={{ fontWeight: '900', color: 'var(--primary-neon)' }}>{selectedUser}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-muted)' }}>新登录密码</label>
                <input 
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="请输入新密码，至少 4 位"
                  className="cyber-input"
                  style={{ padding: '10px 14px', fontSize: '12.5px', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid rgba(0, 0, 0, 0.05)', paddingTop: '16px' }}>
                <button 
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="cyber-btn"
                  style={{ padding: '8px 16px', fontSize: '12px', background: 'transparent', border: '1px solid var(--border-neon)', color: 'var(--text-muted)' }}
                  disabled={modalSubmitting}
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="cyber-btn"
                  style={{ padding: '8px 20px', fontSize: '12px', background: 'var(--accent)', color: '#fff' }}
                  disabled={modalSubmitting}
                >
                  {modalSubmitting ? '正在提交...' : '确认重置'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 15, 30, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="cyber-card" style={{
            width: '100%',
            maxWidth: '380px',
            padding: '24px',
            background: 'var(--bg-card)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
            animation: 'tabFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', paddingBottom: '12px', margin: 0, color: 'var(--danger)' }}>
              <AlertCircle size={18} /> 安全确认：彻底删除账户
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '12.5px', color: 'var(--text-main)', margin: 0, lineHeight: 1.5 }}>
                您确定要删除学术通行证 <span style={{ fontWeight: '900', color: 'var(--danger)' }}>{selectedUser}</span> 吗？
              </p>
              
              <div style={{ 
                padding: '12px', 
                background: 'rgba(220, 38, 38, 0.05)', 
                border: '1px solid rgba(220, 38, 38, 0.15)', 
                borderRadius: '8px', 
                fontSize: '11.5px', 
                color: 'var(--danger)', 
                lineHeight: 1.4 
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>级联删除警示：</strong><br />
                    此操作将从物理层清除该用户的所有学术档案、对话记录、错题本、LLM 配置以及系统内一切关联的缓存数据。此过程<strong>不可逆且无法恢复</strong>！
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid rgba(0, 0, 0, 0.05)', paddingTop: '16px' }}>
                <button 
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="cyber-btn"
                  style={{ padding: '8px 16px', fontSize: '12px', background: 'transparent', border: '1px solid var(--border-neon)', color: 'var(--text-muted)' }}
                  disabled={modalSubmitting}
                >
                  取消
                </button>
                <button 
                  onClick={handleDeleteUser}
                  className="cyber-btn"
                  style={{ padding: '8px 20px', fontSize: '12px', background: 'var(--danger)', color: '#fff' }}
                  disabled={modalSubmitting}
                >
                  {modalSubmitting ? '正在擦除...' : '确认安全删除'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
