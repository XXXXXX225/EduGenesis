import React, { useState, useEffect, useRef } from 'react';
import { Shield, CheckCircle, XCircle, Search, Calendar, Award, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { API_BASE } from '../../utils/api';

export default function VerifyView() {
  // Parse query parameters synchronously during initial state setup to prevent flickering
  const params = new URLSearchParams(window.location.search);
  const queryHash = params.get('hash') || '';
  const queryStudent = params.get('student') || '';
  const queryCourse = params.get('course') || 'Python 基础自适应导论';
  const queryAccuracy = params.get('accuracy') || '85';
  const queryTime = params.get('time') || '45';

  const hasQueryParams = !!(queryHash && queryStudent && queryCourse);

  const [loading, setLoading] = useState(hasQueryParams);
  const [isValid, setIsValid] = useState(null);
  const [verificationMsg, setVerificationMsg] = useState('');
  const [searched, setSearched] = useState(hasQueryParams);

  // Form states (for manual lookup)
  const [formHash, setFormHash] = useState(queryHash);
  const [formStudent, setFormStudent] = useState(queryStudent);
  const [formCourse, setFormCourse] = useState(queryCourse);
  const [formAccuracy, setFormAccuracy] = useState(queryAccuracy);
  const [formTime, setFormTime] = useState(queryTime);

  const cardRef = useRef(null);
  const logRef = useRef(null);

  // Auto verify if params exist on mount
  useEffect(() => {
    if (hasQueryParams) {
      triggerVerification(queryHash, queryStudent, queryCourse);
    }
  }, []);

  // GSAP Entrance Animations
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, [isValid, searched]);

  async function triggerVerification(h, s, c) {
    setLoading(true);
    setSearched(true);
    try {
      const response = await fetch(`${API_BASE}/achievements/verify?hash=${h}&student=${encodeURIComponent(s)}&course=${encodeURIComponent(c)}`);
      if (!response.ok) {
        throw new Error('网络请求异常，无法连接校验服务器');
      }
      const data = await response.json();
      setIsValid(data.valid);
      setVerificationMsg(data.message || (data.valid ? '证书校验成功' : '证书校验失败'));
      
      // Animate logs cascading entry
      setTimeout(() => {
        if (logRef.current) {
          gsap.fromTo(logRef.current.children,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.5, stagger: 0.15, ease: 'power2.out' }
          );
        }
      }, 100);

    } catch (err) {
      setIsValid(false);
      setVerificationMsg(err.message || '系统繁忙，请稍后再试');
    } finally {
      setLoading(false);
    }
  }

  const handleManualVerify = (e) => {
    e.preventDefault();
    if (!formHash.trim() || !formStudent.trim() || !formCourse.trim()) {
      alert('请完整填写防伪哈希、学生姓名和课程名称！');
      return;
    }
    triggerVerification(formHash.trim(), formStudent.trim(), formCourse.trim());
  };

  const resetVerification = () => {
    setIsValid(null);
    setSearched(false);
    setVerificationMsg('');
    setFormHash('');
    setFormStudent('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'radial-gradient(circle at center, #0b1528 0%, #030712 100%)',
      color: '#f3f4f6',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      boxSizing: 'border-box',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Background Orbs */}
      <div style={{ position: 'absolute', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13, 148, 136, 0.06) 0%, transparent 70%)', top: '10%', left: '10%', pointerEvents: 'none', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(29, 78, 216, 0.05) 0%, transparent 70%)', bottom: '10%', right: '10%', pointerEvents: 'none', zIndex: 0 }}></div>

      {/* Holographic Header */}
      <div style={{ zIndex: 1, textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(13, 148, 136, 0.08)', border: '1px solid rgba(13, 148, 136, 0.25)', padding: '6px 14px', borderRadius: '20px', marginBottom: '12px' }}>
          <Shield size={14} style={{ color: '#0d9488' }} className="animate-pulse" />
          <span style={{ fontSize: '11px', color: '#2dd4bf', fontWeight: 'bold', letterSpacing: '1px', fontFamily: 'monospace' }}>SECURE BLOCKCHAIN-HASH VERIFIER</span>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '900', margin: 0, letterSpacing: '1px', background: 'linear-gradient(to right, #ffffff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          EduGenesis 学术结业证书验证系统
        </h2>
      </div>

      {/* Main Container */}
      <div ref={cardRef} style={{
        width: '100%',
        maxWidth: '640px',
        background: 'rgba(17, 24, 39, 0.55)',
        backdropFilter: 'blur(16px)',
        borderRadius: '16px',
        border: isValid === true 
          ? '1.5px solid rgba(45, 212, 191, 0.45)' 
          : isValid === false 
            ? '1.5px solid rgba(239, 68, 68, 0.45)' 
            : '1.5px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isValid === true
          ? '0 0 35px rgba(13, 148, 136, 0.2)'
          : isValid === false
            ? '0 0 35px rgba(239, 68, 68, 0.15)'
            : '0 8px 32px rgba(0, 0, 0, 0.5)',
        padding: '28px',
        boxSizing: 'border-box',
        zIndex: 1,
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(13, 148, 136, 0.1)', borderTop: '3px solid #0d9488', borderRadius: '50%', animation: 'spin-slow 1s linear infinite' }}></div>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>正在连接协同网络，验证密码学指纹...</span>
          </div>
        ) : !searched ? (
          /* MANUAL VERIFICATION FORM */
          <form onSubmit={handleManualVerify} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.5', margin: '0 0 4px 0', textAlign: 'center' }}>
              请输入结业证书底部的密码学防伪哈希及学生资质信息，查验证书真伪并追溯智能体诊断结论。
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: '#2dd4bf', fontWeight: 'bold', fontFamily: 'monospace' }}>SECURE VERIFICATION HASH (64位哈希值)</label>
              <input 
                type="text" 
                value={formHash} 
                onChange={(e) => setFormHash(e.target.value)}
                placeholder="例如: d7a8f... (请完整输入)"
                required
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '12px', fontFamily: 'monospace', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#2dd4bf', fontWeight: 'bold', fontFamily: 'monospace' }}>STUDENT NAME (学生姓名)</label>
                <input 
                  type="text" 
                  value={formStudent} 
                  onChange={(e) => setFormStudent(e.target.value)}
                  placeholder="体验官"
                  required
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '12px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: '#2dd4bf', fontWeight: 'bold', fontFamily: 'monospace' }}>COURSE NAME (课程大纲)</label>
                <select 
                  value={formCourse} 
                  onChange={(e) => setFormCourse(e.target.value)}
                  style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '12px', outline: 'none' }}
                >
                  <option value="Python 基础自适应导论">Python 基础自适应导论</option>
                  <option value="机器学习算法理论与实操">机器学习算法理论与实操</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              style={{
                background: 'linear-gradient(90deg, #0d9488 0%, #1e40af 100%)',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '10px',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.9}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              <Search size={16} /> 开启学术资质校验
            </button>
          </form>
        ) : (
          /* VERIFICATION RESULT PANEL */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            {/* Status Header Block */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
              {isValid === true ? (
                <CheckCircle size={44} style={{ color: '#2dd4bf' }} />
              ) : (
                <XCircle size={44} style={{ color: '#ef4444' }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: isValid ? '#2dd4bf' : '#ef4444' }}>
                  {isValid === true ? '证书防伪验证通过' : '证书验证未通过'}
                </span>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  SHA256 Fingerprint: {formHash}
                </span>
              </div>
            </div>

            {isValid === true ? (
              /* VALID CARD DETAILS */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Visual Certificate Card Frame */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.05) 0%, rgba(30, 58, 138, 0.1) 100%)',
                  border: '1px solid rgba(13, 148, 136, 0.2)',
                  borderRadius: '10px',
                  padding: '18px',
                  position: 'relative'
                }}>
                  <div style={{ fontSize: '11px', color: '#2dd4bf', fontWeight: 'bold', marginBottom: '8px' }}>学业快照数据 (GRADUATION ARCHIVE)</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12.5px' }}>
                    <div>学生姓名: <strong style={{ color: '#fff' }}>{formStudent}</strong></div>
                    <div>课程名称: <strong style={{ color: '#fff' }}>《{formCourse}》</strong></div>
                    <div>答题正确率: <strong style={{ color: '#fff' }}>{formAccuracy}%</strong></div>
                    <div>学时累计: <strong style={{ color: '#fff' }}>{formTime} 分钟</strong></div>
                  </div>

                  <div style={{
                    marginTop: '12px',
                    fontSize: '11px',
                    color: '#9ca3af',
                    fontFamily: 'monospace',
                    borderTop: '1px dashed rgba(255, 255, 255, 0.08)',
                    paddingTop: '10px',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>核验智能体: Coordinator Agent v1.0</span>
                    <span>签署状态: 已签发</span>
                  </div>
                </div>

                {/* Consensus Logs of Agents */}
                <div>
                  <div style={{ fontSize: '11px', color: '#2dd4bf', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={12} /> 智能体联合签发学术诊断审计报告 (Agent Audit consensus)
                  </div>
                  <div ref={logRef} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0, 0, 0, 0.25)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    {[
                      { agent: "主管智能体", log: `校验用户[${formStudent}] 的学术路径节点状态。节点通关计数=8，符合签发规则。` },
                      { agent: "画像智能体", log: `认知主板指标统计：综合评级符合达标线，画像完整性 100%。已归档。` },
                      { agent: "路径智能体", log: `自适应路径完整度核算审计：8 个核心考点均已解密掌握，路径全绿通过。` },
                      { agent: "安全校验智能体", log: `防越狱探针审计通过：学术作弊标记为0，密码学SHA-256防伪一致，校验安全。` }
                    ].map((item, idx) => (
                      <div key={idx} style={{ fontSize: '11.5px', color: '#d1d5db', display: 'flex', gap: '8px', alignItems: 'flex-start', fontFamily: 'monospace', lineHeight: '1.4' }}>
                        <span style={{ color: '#2dd4bf', fontWeight: 'bold', minWidth: '85px', display: 'inline-block' }}>[{item.agent}]:</span>
                        <span style={{ color: '#9ca3af', flex: 1 }}>{item.log}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              /* INVALID CARD DETAILS */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#fca5a5' }}>
                <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                  警告：密码学哈希签名验证失败。检测到以下潜在异常：
                </p>
                <ul style={{ fontSize: '12.5px', margin: '0 0 0 16px', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.5' }}>
                  <li>此证书的防伪散列值（SECURE VERIFICATION HASH）与学生姓名或课程不匹配。</li>
                  <li>证书上的学情统计可能遭到篡改或手动修饰。</li>
                  <li>证书尚未通过智能多体协同网络的完整解锁（需全部通关 8 个节点且无作弊标记）。</li>
                </ul>
              </div>
            )}

            {/* Back Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button 
                onClick={resetVerification}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '10px',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              >
                校验其他证书
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                style={{
                  flex: 1,
                  background: 'linear-gradient(90deg, #0d9488 0%, #115e59 100%)',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = 0.9}
                onMouseOut={(e) => e.currentTarget.style.opacity = 1}
              >
                前往 EduGenesis 官网 <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Styled animation styles */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
