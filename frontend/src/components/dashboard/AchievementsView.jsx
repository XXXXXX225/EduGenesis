import React from 'react';
import { BookOpen, Cpu, Code2, TrendingUp, Download, Trophy, BarChart2, GraduationCap } from 'lucide-react';
import { apiGetRaw, apiGet, API_BASE } from '../../utils/api';
import { useAppContext } from '../../context/AppContext';

export default function AchievementsView() {
  const {
    profile,
    setProfileAlert,
    goDashboardHome,
    regUsername
  } = useAppContext();

  const [downloading, setDownloading] = React.useState(false);
  const [contributions, setContributions] = React.useState({});
  const [certHash, setCertHash] = React.useState("");

  React.useEffect(() => {
    async function fetchContributions() {
      try {
        const data = await apiGet('/achievements/contributions');
        setContributions(data || {});
      } catch (err) {
        console.error("Failed to load contributions:", err);
      }
    }
    fetchContributions();
  }, []);

  const masteredNodes = profile.learning_stats?.mastered_nodes || 0;
  const accuracy = profile.learning_stats?.quiz_accuracy || 85;
  const studyTime = profile.learning_stats?.study_time || 45;
  const isQualified = masteredNodes >= 8;

  const isML = profile.learning_goals?.some(g => g.includes("Machine Learning") || g.includes("机器学习") || g.includes("machine_learning"));
  const courseTitle = isML ? "机器学习算法理论与实操" : "Python 基础自适应导论";
  const studentName = regUsername || "体验官";

  React.useEffect(() => {
    async function calculateHash() {
      const msg = `${studentName}:${courseTitle}`;
      const msgBuffer = new TextEncoder().encode(msg);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setCertHash(hashHex);
    }
    calculateHash().catch(err => console.error("Hash calculation failed", err));
  }, [studentName, courseTitle]);

  const contributionCells = React.useMemo(() => {
    const cells = [];
    const today = new Date();
    for (let i = 370; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const count = contributions[dateStr] || 0;
      
      let levelClass = "";
      if (count >= 10) levelClass = "level-4";
      else if (count >= 5) levelClass = "level-3";
      else if (count >= 3) levelClass = "level-2";
      else if (count >= 1) levelClass = "level-1";
      
      cells.push({ dateStr, count, levelClass });
    }
    return cells;
  }, [contributions]);

  const kb = profile.knowledge_base || 0;
  const debuggingVal = profile.debugging !== undefined ? profile.debugging : Math.round(kb * 0.9);
  const practicalVal = profile.practical !== undefined ? profile.practical : Math.round(kb * 0.95);
  const reasoningVal = profile.reasoning !== undefined ? profile.reasoning : Math.round(kb * 0.85);

  return (
    <>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes neon-glow-cert {
          0% { box-shadow: 0 0 10px rgba(13, 148, 136, 0.15), inset 0 0 10px rgba(13, 148, 136, 0.05); border-color: rgba(13, 148, 136, 0.25); }
          50% { box-shadow: 0 0 25px rgba(13, 148, 136, 0.4), inset 0 0 15px rgba(13, 148, 136, 0.2); border-color: rgba(13, 148, 136, 0.5); }
          100% { box-shadow: 0 0 10px rgba(13, 148, 136, 0.15), inset 0 0 10px rgba(13, 148, 136, 0.05); border-color: rgba(13, 148, 136, 0.25); }
        }
        .cert-glow-active {
          animation: neon-glow-cert 3s infinite ease-in-out;
        }
      `}</style>

      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Trophy size={16} style={{ color: 'var(--primary)' }} /> 学术成就与勋章墙
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0, lineHeight: '1.4' }}>
          根据您当前的认知指标，画像自动签发勋章与毕业证书。
        </p>
      </div>

      {/* Badges Grid (adapted to a vertical flex list of horizontal items) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
        {[
          { name: "百科全书学霸", desc: "基础知识库得分 >= 70 解锁", rule: kb >= 70, icon: <BookOpen size={18} /> },
          { name: "虫洞终结者", desc: "调试能力得分 >= 70 解锁", rule: debuggingVal >= 70, icon: <Cpu size={18} /> },
          { name: "代码实操狂魔", desc: "实践能力得分 >= 70 解锁", rule: practicalVal >= 70, icon: <Code2 size={18} /> },
          { name: "逻辑推导演绎家", desc: "推理分析得分 >= 70 解锁", rule: reasoningVal >= 70, icon: <TrendingUp size={18} /> }
        ].map((badge, idx) => (
          <div key={idx} className={`badge-card ${badge.rule ? 'unlocked' : 'locked'}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', padding: '10px 12px', textAlign: 'left', borderRadius: '12px' }}>
            <div className="badge-icon-wrapper" style={{ margin: 0, padding: '6px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {badge.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ fontSize: '12.5px', fontWeight: '800', margin: '0 0 2px 0', color: 'var(--text-main)' }}>{badge.name}</h4>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>{badge.desc}</p>
            </div>
            <div style={{ flexShrink: 0 }}>
              {badge.rule ? (
                <span className="neon-badge neon-badge-success" style={{ fontSize: '8px', padding: '1px 4px' }}>已解锁</span>
              ) : (
                <span className="neon-badge" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-dim)', fontSize: '8px', padding: '1px 4px' }}>未解锁</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Study heat map & certificate card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
        {/* Contribution Activity Map */}
        <div className="cyber-card" style={{ padding: '12px 14px', background: 'var(--bg-card-glass)' }}>
          <h4 style={{ fontSize: '12.5px', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            <BarChart2 size={15} style={{ color: 'var(--primary)' }} /> 学术研学活力图
          </h4>
          <div className="heatmap-grid">
            {contributionCells.map((cell, idx) => (
              <div 
                key={idx} 
                className={`heatmap-cell ${cell.levelClass}`} 
                title={`${cell.dateStr}: ${cell.count}次学术活力贡献`}
              ></div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-dim)', marginTop: '6px' }}>
            <span>365天研学活力追踪</span>
            <span>少 <span className="heatmap-cell" style={{ display: 'inline-block', width: '6px', height: '6px', minWidth: 'auto', borderRadius: '1px', verticalAlign: 'middle', margin: '0 2px' }}></span> <span style={{ display: 'inline-block', width: '6px', height: '6px', background: 'var(--primary-neon)', borderRadius: '1px', verticalAlign: 'middle', margin: '0 2px' }}></span> 多</span>
          </div>
        </div>

        {/* Graduation Certificate Preview and Download */}
        <div className="cyber-card" style={{ padding: '16px 20px', background: 'var(--bg-card-glass)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <GraduationCap size={16} style={{ color: 'var(--primary)' }} /> 自适应加密结业证书
            </h4>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
              当您通关全部 8 个关卡时，多智能体系统将共同签发属于您的加密防伪学术结业证书。
            </p>
          </div>

          {/* Certificate Viewport */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.03) 0%, rgba(30, 58, 138, 0.08) 100%)',
            borderRadius: '12px',
            padding: '20px',
            border: isQualified ? '1.5px solid rgba(13, 148, 136, 0.35)' : '1px dashed rgba(255, 255, 255, 0.1)',
            transition: 'all 0.4s ease',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: isQualified ? '0 0 25px rgba(13, 148, 136, 0.15)' : 'none'
          }} className={isQualified ? "cert-glow-active" : ""}>
            
            {/* Watermark for draft */}
            {!isQualified && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(1px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                pointerEvents: 'none',
                userSelect: 'none'
              }}>
                <div style={{
                  transform: 'rotate(-15deg)',
                  border: '3px solid rgba(239, 68, 68, 0.45)',
                  color: 'rgba(239, 68, 68, 0.45)',
                  fontSize: '22px',
                  fontWeight: '900',
                  letterSpacing: '3px',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  textAlign: 'center',
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.05)'
                }}>
                  DRAFT / UNVERIFIED
                  <div style={{ fontSize: '9px', marginTop: '3px', fontWeight: 'bold', letterSpacing: '1px' }}>
                    未达结业标准 (需通关 8 个节点)
                  </div>
                </div>
              </div>
            )}

            {/* Certificate Inner Double Border Box */}
            <div style={{
              width: '100%',
              maxWidth: '600px',
              border: '3px solid rgba(13, 148, 136, 0.4)',
              padding: '3px',
              borderRadius: '8px',
              background: 'rgba(5, 10, 20, 0.4)',
              boxSizing: 'border-box'
            }}>
              <div style={{
                border: '1px solid rgba(234, 179, 8, 0.3)',
                padding: '24px 20px',
                borderRadius: '5px',
                position: 'relative',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                
                {/* Vintage gold corner frames */}
                <div style={{ position: 'absolute', top: '5px', left: '5px', width: '10px', height: '10px', borderTop: '1.5px solid rgba(234, 179, 8, 0.45)', borderLeft: '1.5px solid rgba(234, 179, 8, 0.45)' }}></div>
                <div style={{ position: 'absolute', top: '5px', right: '5px', width: '10px', height: '10px', borderTop: '1.5px solid rgba(234, 179, 8, 0.45)', borderRight: '1.5px solid rgba(234, 179, 8, 0.45)' }}></div>
                <div style={{ position: 'absolute', bottom: '5px', left: '5px', width: '10px', height: '10px', borderBottom: '1.5px solid rgba(234, 179, 8, 0.45)', borderLeft: '1.5px solid rgba(234, 179, 8, 0.45)' }}></div>
                <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '10px', height: '10px', borderBottom: '1.5px solid rgba(234, 179, 8, 0.45)', borderRight: '1.5px solid rgba(234, 179, 8, 0.45)' }}></div>

                {/* Rotating Gold Seal */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '16px',
                  width: '56px',
                  height: '56px',
                  opacity: isQualified ? 1 : 0.25,
                  transform: 'scale(0.85)',
                  transformOrigin: 'top right'
                }}>
                  <svg width="56" height="56" viewBox="0 0 100 100" style={{ animation: 'spin-slow 20s linear infinite' }}>
                    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(234, 179, 8, 0.7)" strokeWidth="2" strokeDasharray="3 3" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(234, 179, 8, 0.5)" strokeWidth="1" />
                    <defs>
                      <path id="previewSealPath" d="M 18,50 A 32,32 0 1,1 82,50" />
                      <path id="previewSealPathBottom" d="M 82,50 A 32,32 0 1,1 18,50" />
                    </defs>
                    <text fill="gold" fontSize="8" fontWeight="bold" letterSpacing="0.8">
                      <textPath href="#previewSealPath" startOffset="50%" textAnchor="middle">
                        EDUGENESIS ACADEMIC
                      </textPath>
                    </text>
                    <text fill="gold" fontSize="8" fontWeight="bold" letterSpacing="0.8">
                      <textPath href="#previewSealPathBottom" startOffset="50%" textAnchor="middle">
                        * SECURE VERIFIED *
                      </textPath>
                    </text>
                    <polygon points="50,28 55,42 70,42 58,50 63,65 50,56 37,65 42,50 30,42 45,42" fill="gold" />
                  </svg>
                </div>

                {/* Subtitle */}
                <span style={{
                  fontSize: '9.5px',
                  color: 'var(--primary)',
                  letterSpacing: '2px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  marginBottom: '6px'
                }}>
                  EduGenesis 自适应多智能体学术空间
                </span>

                {/* Main Title */}
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '900',
                  color: 'var(--text-main)',
                  letterSpacing: '3px',
                  margin: '0 0 14px 0',
                  textShadow: '0 0 10px rgba(13, 148, 136, 0.2)'
                }}>
                  结业证书 (Certificate of Graduation)
                </h2>

                {/* Recipient and text */}
                <p style={{
                  fontSize: '10.5px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: '1.7',
                  margin: '0 0 12px 0',
                  maxWidth: '480px'
                }}>
                  兹证明学生 <strong style={{ color: 'var(--primary-neon)', fontWeight: 'bold' }}>{studentName}</strong> 在本系统的自适应多智能体协同学习环境下，
                  成功通关了 <strong style={{ color: 'var(--text-main)' }}>《{courseTitle}》</strong> 个性化课程的全部关卡。
                  经主管、画像、路径及安全校验智能体多维度学术诊断与测试，各项指标达到合格标准，特发此证，以兹鼓励。
                </p>

                {/* Achievements stats sub-report */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
                  borderBottom: '1px dashed rgba(255, 255, 255, 0.1)',
                  width: '100%',
                  padding: '6px 0',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '20px',
                  fontSize: '9.5px',
                  color: 'var(--text-muted)',
                  marginBottom: '14px'
                }}>
                  <span>通关进度: <strong style={{ color: 'var(--text-main)' }}>{masteredNodes} / 8</strong></span>
                  <span>综合正确率: <strong style={{ color: 'var(--text-main)' }}>{accuracy}%</strong></span>
                  <span>学习时长: <strong style={{ color: 'var(--text-main)' }}>{studyTime} 分钟</strong></span>
                </div>

                {/* Signature Rows */}
                <div style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '10px',
                  marginBottom: '14px',
                  gap: '8px'
                }}>
                  {[
                    { title: "主管智能体", desc: "调度主席", sig: "M 5 15 Q 15 5 25 15 T 45 15 T 65 5 T 85 15" },
                    { title: "画像智能体", desc: "指标诊断", sig: "M 5 10 Q 20 25 35 5 T 55 15 T 75 10" },
                    { title: "路径智能体", desc: "大纲规划", sig: "M 8 8 Q 22 22 30 8 T 50 12 T 70 8" },
                    { title: "安全校验", desc: "护栏校验", sig: "M 10 12 Q 18 5 35 15 T 55 8 T 75 18" }
                  ].map((agent, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '23%' }}>
                      <svg width="60" height="20" viewBox="0 0 90 20" style={{ opacity: isQualified ? 0.9 : 0.2 }}>
                        <path d={agent.sig} fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '2px' }}>{agent.title}</span>
                      <span style={{ fontSize: '7.5px', color: 'var(--text-dim)' }}>{agent.desc}</span>
                    </div>
                  ))}
                </div>

                {/* QR Code and Cryptographic Verification Hash block */}
                <div style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.01)',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.04)',
                  boxSizing: 'border-box',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '7px', color: 'var(--text-dim)', fontWeight: 'bold', letterSpacing: '0.5px' }}>SECURE VERIFICATION HASH:</span>
                    <span style={{
                      fontSize: '7.5px',
                      fontFamily: 'monospace',
                      color: isQualified ? 'rgba(13, 148, 136, 0.9)' : 'var(--text-dim)',
                      wordBreak: 'break-all',
                      textAlign: 'left',
                      marginTop: '3px',
                      paddingRight: '8px',
                      lineHeight: '1.2'
                    }}>
                      {isQualified ? certHash : "----------------------------------------------------------------"}
                    </span>
                  </div>
                  {isQualified && (
                    <div style={{
                      width: '42px',
                      height: '42px',
                      background: '#ffffff',
                      border: '1.5px solid var(--primary)',
                      borderRadius: '4px',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box'
                    }}>
                      <img 
                        src={`${API_BASE}/achievements/qrcode?hash=${certHash}&student=${encodeURIComponent(studentName)}&course=${encodeURIComponent(courseTitle)}&accuracy=${accuracy}&time=${studyTime}`}
                        alt="Verification QR Code"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Alert Note */}
            {!isQualified && (
              <span style={{ fontSize: '9px', color: '#ef4444', fontWeight: 'bold', marginTop: '6px' }}>
                ⚠️ 您当前已通关 {masteredNodes} 个节点，需要通关全部 8 个关卡方可完成解密签发。
              </span>
            )}
          </div>

          {/* Export Action Button */}
          <button
            type="button"
            disabled={downloading}
            onClick={async () => {
              if (downloading) return;
              setDownloading(true);
              setProfileAlert("正在为您签发PDF结业证书，请稍候...");
              try {
                const response = await apiGetRaw('/achievements/certificate');
                if (!response.ok) {
                  throw new Error('证书下载失败');
                }
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = 'certificate.pdf';
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(downloadUrl);
              } catch (err) {
                setProfileAlert(err.message);
              } finally {
                setDownloading(false);
                setTimeout(() => setProfileAlert(''), 3000);
              }
            }}
            className="cyber-btn"
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              padding: '8px 10px', 
              fontSize: '11px',
              opacity: downloading ? 0.6 : 1,
              cursor: downloading ? 'not-allowed' : 'pointer'
            }}
          >
            <Download size={14} /> {downloading ? '正在签发证书...' : isQualified ? '导出 PDF 结业证书' : '下载学术草稿 PDF'}
          </button>
        </div>
      </div>
    </>
  );
}
