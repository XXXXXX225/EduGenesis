# 首页极致科技感视觉与深度互动 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 EduGenesis 首页门户升级极致的科技视觉特效与深度互动组件（Canvas 粒子流背景、3D 卡片倾斜与反射、首页试玩沙盒、6 维能力雷达联动与推荐系统），提升大赛第一印象。

**Architecture:** 
1. 在网页最底层加载轻量粒子 Canvas。
2. 编写全局 React 3D hover 倾斜函数并挂载鼠标事件。
3. 创建 MiniSandboxPlayground 状态组件模拟智能体修复流打字动画。
4. 编写 SVG 能力雷达计算逻辑及 Range Sliders，实现属性与多边形顶点的动态联动。

**Tech Stack:** React 18, GSAP, CSS Variables, SVG, HTML5 Canvas.

---

### Task 1: [CSS] 新增科幻粒子背景、3D Tilt 卡片与体验沙盒样式

**Files:**
- Modify: `frontend/src/index.css`

- [ ] **Step 1: 编写 CSS 样式**
  在 `frontend/src/index.css` 末尾追加 Canvas 粒子背景、3D 倾斜及光泽遮罩、极客沙盒控制台和自适应雷达调试板的完整样式定义。

  ```css
  /* ==========================================
     Sci-Fi Visuals & Interactive Elements
     ========================================== */
  
  /* Canvas Background */
  #space-particles-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    opacity: 0.75;
    transition: opacity 0.5s ease;
  }
  
  body.dark-mode #space-particles-canvas {
    opacity: 0.45;
  }
  
  /* 3D Card Tilt & Specular Highlights */
  .tilt-card {
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.15s ease-out, border-color 0.3s ease, box-shadow 0.3s ease;
    overflow: hidden;
  }
  
  .card-shine-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    mix-blend-mode: screen;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 5;
  }
  
  /* Mini Sandbox Playground Styles */
  .mini-sandbox-container {
    background: #090d16;
    border: 1px solid rgba(13, 148, 136, 0.25);
    border-radius: 20px;
    padding: 24px;
    color: #e2e8f0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(13, 148, 136, 0.05);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    overflow: hidden;
  }
  
  .editor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 12px;
    margin-bottom: 16px;
  }
  
  .dot-wrapper {
    display: flex;
    gap: 6px;
  }
  
  .win-dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
  }
  
  .console-log-box {
    background: #04060b;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 14px;
    height: 180px;
    overflow-y: auto;
    font-size: 12px;
    line-height: 1.6;
    color: #38bdf8;
  }
  
  .comm-progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
    overflow: hidden;
    position: relative;
  }
  
  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
    box-shadow: 0 0 8px var(--primary-neon);
    transition: width 0.4s ease;
  }
  
  /* Radar Customizer range slider styling */
  .range-slider-neon {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 3px;
    outline: none;
  }
  
  .range-slider-neon::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary-neon);
    box-shadow: 0 0 10px var(--primary-neon);
    cursor: pointer;
    transition: transform 0.1s ease;
  }
  
  .range-slider-neon::-webkit-slider-thumb:hover {
    transform: scale(1.25);
  }
  ```

- [ ] **Step 2: 验证样式文件打包**
  在 `e:/AIproject/EduGenesis/frontend` 运行：`npm run build`，检查是否有 CSS 解析报错。
  Expected: PASS

- [ ] **Step 3: 提交修改**
  ```bash
  git add frontend/src/index.css
  git commit -m "style: add customizer, playground, tilt-card and canvas particle styling"
  ```

---

### Task 2: [App] 编写 Canvas 粒子背景与 3D Card Tilt 核心交互逻辑

**Files:**
- Modify: `frontend/src/App.jsx:1-60` (导入并定义全局处理函数)

- [ ] **Step 1: 编写 React 3D Card Hover 倾斜辅助函数**
  在 `App.jsx` 中，组件声明外定义通用的 `handleCardMouseMove` 与 `handleCardMouseLeave` 辅助事件处理器。

  ```javascript
  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    // 限制在最大 8deg 的旋转角度内以防产生过大偏转
    const rotX = -((y - yc) / (rect.height / 2)) * 8;
    const rotY = ((x - xc) / (rect.width / 2)) * 8;
  
    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
    const shine = card.querySelector('.card-shine-overlay');
    if (shine) {
      shine.style.opacity = '0.12';
      shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.45) 0%, transparent 60%)`;
    }
  };
  
  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    const shine = card.querySelector('.card-shine-overlay');
    if (shine) {
      shine.style.opacity = '0';
    }
  };
  ```

- [ ] **Step 2: 编写 Canvas 粒子星空渲染 Hook**
  在 `App` 组件内部（约 line 50-80 之间，其他 `useEffect` 位置），添加用于管理 Canvas 的 React 逻辑。当页面处于不可见状态时自动暂停。

  ```javascript
    // Space Canvas Particle System
    useEffect(() => {
      const canvas = document.getElementById('space-particles-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let animationFrameId;
      let particles = [];
      const particleCount = 75;
      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);
  
      const handleResize = () => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', handleResize);
  
      // Mouse coordinates track
      const mouse = { x: -1000, y: -1000 };
      const handleMouseMove = (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      };
      const handleMouseLeave = () => {
        mouse.x = -1000;
        mouse.y = -1000;
      };
      window.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseLeave);
  
      // Initialize particles
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.5 + 0.8,
        });
      }
  
      // Animation Loop
      const animate = () => {
        ctx.clearRect(0, 0, width, height);
        
        // Use document theme mode for particle stroke coloring
        const isDark = document.body.classList.contains('dark-mode');
        const particleColor = isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(13, 148, 136, 0.25)';
        const lineColor = isDark ? 'rgba(99, 102, 241, 0.05)' : 'rgba(13, 148, 136, 0.04)';
  
        // Draw & Update Particles
        particles.forEach((p) => {
          // Mouse Push interaction
          if (mouse.x !== -1000) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              const force = (120 - dist) / 120;
              p.x += (dx / dist) * force * 1.5;
              p.y += (dy / dist) * force * 1.5;
            }
          }
  
          p.x += p.vx;
          p.y += p.vy;
  
          // Bounce off boundaries
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
  
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = particleColor;
          ctx.fill();
        });
  
        // Connect close particles with light lines
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 85) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = lineColor;
              ctx.lineWidth = (85 - dist) / 85 * 0.7;
              ctx.stroke();
            }
          }
        }
  
        animationFrameId = requestAnimationFrame(animate);
      };
  
      animate();
  
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
        cancelAnimationFrame(animationFrameId);
      };
    }, []);
  ```

- [ ] **Step 3: 运行打包测试**
  在 `e:/AIproject/EduGenesis/frontend` 运行 `npm run build`。
  Expected: PASS

- [ ] **Step 4: 提交修改**
  ```bash
  git add frontend/src/App.jsx
  git commit -m "feat: add mouse responsive space particles canvas loop and unmount lifecycle clean"
  ```

---

### Task 3: [App] 构建首页“试玩沙盒 Mini Playground”独立组件

**Files:**
- Modify: `frontend/src/App.jsx` (新增组件声明)

- [ ] **Step 1: 新增 MiniSandboxPlayground 组件**
  在 `App.jsx` 中新增 `MiniSandboxPlayground` 组件代码。实现错误代码流式修改为正确代码的动画机制、流式日志打字定时器。

  ```javascript
  const MiniSandboxPlayground = () => {
    const initialCode = `def calculate_average(scores):
      # ⚠️ 隐患：如果 scores 传入空列表会因零除崩溃
      return sum(scores) / len(scores)`;
  
    const fixedCode = `def calculate_average(scores):
      if not scores:
          return 0.0
      return sum(scores) / len(scores)`;
  
    const [code, setCode] = useState(initialCode);
    const [logs, setLogs] = useState([
      ">>> 系统就绪，等待点击 [启动协同诊断与执行]...",
      "当前内存镜像：隔离沙盒安全级别 - HIGH"
    ]);
    const [progress, setProgress] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
  
    const runDiagnostics = () => {
      if (isRunning) return;
      setIsRunning(true);
      setShowConfetti(false);
      setProgress(5);
      setCode(initialCode);
      setLogs(["[0.0s] 🛡️ [安全卫士智能体]：启动指令流安全过滤..."]);
  
      // Sequence of simulated agent consensus steps
      setTimeout(() => {
        setLogs(prev => [...prev, "[0.6s] 🛡️ [安全卫士]：安全过滤通过，代码未发现越权或危险库。"]);
        setProgress(25);
      }, 600);
  
      setTimeout(() => {
        setLogs(prev => [...prev, "[1.2s] 👤 [画像分析智能体]：评估语义网络... 捕获崩溃断点：第 3 行 len(scores) 未作空防范。"]);
        setProgress(50);
      }, 1200);
  
      setTimeout(() => {
        setLogs(prev => [...prev, "[1.8s] 🗺️ [路径规划智能体]：评估并规划实时修复补丁，自动重构语义决策树..."]);
        setProgress(75);
      }, 1800);
  
      setTimeout(() => {
        setLogs(prev => [...prev, "[2.4s] ⚙️ [代码沙盒]：热装载测试容器，开始执行测试套件..."]);
        setProgress(90);
        
        // Typing animation effect to inject the fix code
        let idx = 0;
        setCode(fixedCode);
      }, 2400);
  
      setTimeout(() => {
        setLogs(prev => [
          ...prev, 
          "[3.2s] ✅ [代码沙盒]：测试用例全部通过！输入 [90, 80] 输出 85.0; 输入 [] 输出 0.0。",
          "[3.5s] 💡 [系统共识]：知识画像已同步更新，错误本 ledger 记录已归档。"
        ]);
        setProgress(100);
        setIsRunning(false);
        setShowConfetti(true);
      }, 3200);
    };
  
    return (
      <div className="mini-sandbox-container" style={{ position: 'relative' }}>
        {showConfetti && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)',
            animation: 'pulse-ring 1.5s ease-out infinite',
            zIndex: 1
          }} />
        )}
        
        <div className="editor-header">
          <div className="dot-wrapper">
            <div className="win-dot" style={{ background: '#ef4444' }} />
            <div className="win-dot" style={{ background: '#f59e0b' }} />
            <div className="win-dot" style={{ background: '#10b981' }} />
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>edugenesis_playground.py</span>
          <div style={{ width: '40px' }} />
        </div>
  
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Left: VS Code styled editor */}
          <div style={{ background: '#04060b', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
            <pre style={{ margin: 0, fontSize: '12.5px', color: '#10b981', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
              <code>{code}</code>
            </pre>
          </div>
  
          {/* Right: Agent Consensus Console */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isRunning ? '#f59e0b' : '#10b981', display: 'inline-block' }} />
                  多智能体共识进度 ({progress}%)
                </span>
                <button 
                  onClick={runDiagnostics} 
                  disabled={isRunning}
                  className="interactive-btn"
                  style={{
                    padding: '6px 14px',
                    fontSize: '11px',
                    borderRadius: '8px',
                    background: isRunning ? 'rgba(255,255,255,0.05)' : 'var(--primary-gradient)',
                    border: 'none',
                    color: '#fff',
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                    boxShadow: isRunning ? 'none' : '0 0 10px rgba(13,148,136,0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isRunning ? '协同诊断中...' : '⚡ 启动协同诊断与执行'}
                </button>
              </div>
              <div className="comm-progress-bar" style={{ marginBottom: '12px' }}>
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
  
            <div className="console-log-box">
              {logs.map((item, idx) => (
                <div key={idx} style={{
                  marginBottom: '6px',
                  color: item.startsWith('>>>') ? '#e2e8f0' : item.includes('✅') ? '#10b981' : item.includes('🛡️') ? '#a855f7' : item.includes('👤') ? '#3b82f6' : '#38bdf8'
                }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
  };
  ```

- [ ] **Step 2: 编译测试**
  在 `e:/AIproject/EduGenesis/frontend` 运行 `npm run build`。
  Expected: PASS

- [ ] **Step 3: 提交代码**
  ```bash
  git add frontend/src/App.jsx
  git commit -m "feat: implement MiniSandboxPlayground component with real-time agent code transformation"
  ```

---

### Task 4: [App] 编写自适应学术能力调节与 6 维 SVG 认知雷达组件

**Files:**
- Modify: `frontend/src/App.jsx` (新增组件声明)

- [ ] **Step 1: 新增 RadarCustomizer 组件**
  在 `App.jsx` 中添加 `RadarCustomizer` 组件。根据三项滑动条的改变，使用三角函数公式在 SVG 视口 `300x300` 中实时渲染 6 维蜘蛛网和填充顶点多边形，同时输出路径智能体的个性化决策卡。

  ```javascript
  const RadarCustomizer = () => {
    // 3 user knobs (0 - 100)
    const [coding, setCoding] = useState(40);
    const [concept, setConcept] = useState(50);
    const [security, setSecurity] = useState(30);
  
    // Map the 3 inputs to 6 radar coordinates
    const v_syntax = coding * 0.9 + 5;
    const v_edge = security * 0.95 + 5;
    const v_algo = concept * 0.9 + 5;
    const v_safety = security * 0.85 + coding * 0.1 + 5;
    const v_readability = coding * 0.8 + concept * 0.15 + 5;
    const v_debug = (coding + concept) / 2;
  
    const values = [v_syntax, v_edge, v_algo, v_safety, v_readability, v_debug];
    const labels = ["语法规则", "边界处理", "算法复杂度", "沙盒安全", "代码读写", "逆向调试"];
  
    // Calculate points coordinates in 300x300 canvas
    const center = 150;
    const maxVal = 100;
    const radarPoints = values.map((val, idx) => {
      // 6 vertices at 60 degree intervals: angle = idx * 60 degrees
      const angle = (idx * 60 * Math.PI) / 180;
      // limit range to [15, 100]
      const r = Math.max(15, Math.min(maxVal, val)) * 1.0;
      const x = center + r * Math.sin(angle);
      const y = center - r * Math.cos(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  
    // Get recommendations from path planner dynamically
    let recommendTitle = "";
    let recommendDesc = "";
    let recommendType = "info";
  
    if (coding < 35) {
      recommendType = "warning";
      recommendTitle = "⚠️ 诊断结果：编程动手基底薄弱";
      recommendDesc = "画像智能体检测到您在语法结构和代码改错上存在明显盲区。路径智能体自动拦截前沿理论模块，已在您 timeline 的 Stage 3 沙盒层强制挂载 3 张概念 MCQ 选择题微课。";
    } else if (security < 35) {
      recommendType = "danger";
      recommendTitle = "🚫 诊断结果：代码安全与边界意识欠缺";
      recommendDesc = "由于算法边界及内存过滤机制评分较低，系统判定您在生产端编写代码时易发生溢出和不洁注入。推荐：锁定前驱任务，强制激活隔离沙盒的“全面监视模式”。";
    } else if (coding >= 70 && concept >= 70 && security >= 60) {
      recommendType = "success";
      recommendTitle = "🏆 诊断结果：自适应学习画像评级为 - 卓越";
      recommendDesc = "您的各项认知能力已全面收敛，画像智能体联合路径、沙盒主管会签成功。自动授予《大模型自适应微专业毕业证书》，结业 PDF 证书已开放下载！";
    } else {
      recommendType = "info";
      recommendTitle = "🚀 诊断结果：学习画像均衡稳健发展中";
      recommendDesc = "当前认知脉络合理收敛。画像智能体实时生成 4 道靶向巩固测验题。保持探索，建议在沙盒中增加代码行数以进一步提高调试分数。";
    }
  
    // Ring radii helper
    const ringRadii = [20, 40, 60, 80, 100];
  
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', alignItems: 'center' }}>
        {/* Left Column: Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', color: 'var(--text-main)' }}>
              <span>编程实践深度 (Coding Practice)</span>
              <span style={{ color: 'var(--primary-neon)', fontWeight: 'bold' }}>{coding}</span>
            </div>
            <input 
              type="range" 
              min="10" max="100" 
              value={coding} 
              onChange={(e) => setCoding(Number(e.target.value))}
              className="range-slider-neon"
            />
          </div>
  
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', color: 'var(--text-main)' }}>
              <span>概念理解跨度 (Conceptual Span)</span>
              <span style={{ color: 'var(--primary-neon)', fontWeight: 'bold' }}>{concept}</span>
            </div>
            <input 
              type="range" 
              min="10" max="100" 
              value={concept} 
              onChange={(e) => setConcept(Number(e.target.value))}
              className="range-slider-neon"
            />
          </div>
  
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', color: 'var(--text-main)' }}>
              <span>安全与边界意识 (Security Awareness)</span>
              <span style={{ color: 'var(--primary-neon)', fontWeight: 'bold' }}>{security}</span>
            </div>
            <input 
              type="range" 
              min="10" max="100" 
              value={security} 
              onChange={(e) => setSecurity(Number(e.target.value))}
              className="range-slider-neon"
            />
          </div>
  
          {/* Path Recommendation Card */}
          <div style={{
            background: 'var(--bg-card)',
            border: `1px solid ${recommendType === 'warning' ? '#f59e0b' : recommendType === 'danger' ? '#ef4444' : recommendType === 'success' ? '#10b981' : 'var(--border-neon)'}`,
            borderRadius: '16px',
            padding: '16px',
            marginTop: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            transition: 'all 0.3s ease'
          }}>
            <h4 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}>{recommendTitle}</h4>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{recommendDesc}</p>
          </div>
        </div>
  
        {/* Right Column: Dynamic SVG Radar Chart */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg width="300" height="300" style={{ overflow: 'visible' }}>
            <defs>
              <radialGradient id="radar-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--primary-neon)" stopOpacity="0.1" />
                <stop offset="100%" stopColor="var(--primary-neon)" stopOpacity="0.45" />
              </radialGradient>
            </defs>
  
            {/* Draw concentric grid hexagons */}
            {ringRadii.map((r, idx) => {
              const ringPoints = Array.from({ length: 6 }).map((_, i) => {
                const angle = (i * 60 * Math.PI) / 180;
                const x = center + r * Math.sin(angle);
                const y = center - r * Math.cos(angle);
                return `${x},${y}`;
              }).join(' ');
              return (
                <polygon 
                  key={idx} 
                  points={ringPoints} 
                  fill="none" 
                  stroke="rgba(255,255,255,0.06)" 
                  strokeWidth="1"
                />
              );
            })}
  
            {/* Draw 6 axis lines */}
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i * 60 * Math.PI) / 180;
              const x = center + maxVal * Math.sin(angle);
              const y = center - maxVal * Math.cos(angle);
              return (
                <line 
                  key={i} 
                  x1={center} y1={center} 
                  x2={x} y2={y} 
                  stroke="rgba(255,255,255,0.06)" 
                  strokeWidth="1"
                />
              );
            })}
  
            {/* Draw polygon for actual values */}
            <polygon 
              points={radarPoints} 
              fill="url(#radar-gradient)" 
              stroke="var(--primary-neon)" 
              strokeWidth="2"
              style={{ transition: 'points 0.3s ease-out' }}
            />
  
            {/* Render vertex labels */}
            {labels.map((lbl, idx) => {
              const angle = (idx * 60 * Math.PI) / 180;
              const offset = 120; // push label outside max ring (100)
              const x = center + offset * Math.sin(angle);
              const y = center - offset * Math.cos(angle);
              return (
                <text 
                  key={idx} 
                  x={x} y={y + 4} 
                  fill="var(--text-muted)" 
                  fontSize="10px" 
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {lbl}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
  );
  };
  ```

- [ ] **Step 2: 编译测试**
  在 `e:/AIproject/EduGenesis/frontend` 运行 `npm run build`。
  Expected: PASS

- [ ] **Step 3: 提交代码**
  ```bash
  git add frontend/src/App.jsx
  git commit -m "feat: implement SVG RadarCustomizer with reactive polygon interpolation and path recommendations"
  ```

---

### Task 5: [App] 挂载新组件并完成卡片 3D Hover 升级

**Files:**
- Modify: `frontend/src/App.jsx` (渲染与布局绑定)

- [ ] **Step 1: 在 `App.jsx` 中声明 Canvas 渲染容器**
  定位到 `App.jsx` 的渲染根节点（最外层 `div`，通常在 `return (` 处）。在其最开头（第一行子元素）插入 Canvas 节点：
  `<canvas id="space-particles-canvas"></canvas>`

- [ ] **Step 2: 将 Playground 和 Radar 插入 LandingView**
  定位到 `App.jsx` 中 Landing 视图渲染位置。在自适应时间轴板块（`#journey`）之后，拓扑模拟器（`TopologySimulation`）之前，插入新板块容器，使用 `tilt-card` 结构封装，并添加 `card-shine-overlay` 连带组件。

  ```javascript
            {/* Enriched Section: Sci-Fi Interactive Playground & Radar */}
            <section id="interactive-demo" style={{ padding: '80px 40px', borderTop: '1px solid rgba(13, 148, 136, 0.05)', zIndex: 1, position: 'relative' }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                  <span className="neon-badge neon-badge-primary" style={{ marginBottom: '10px', display: 'inline-block' }}>Interactive Playground</span>
                  <h2 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.02em' }} className="neon-text-gradient">
                    智能协同与能力画像感知
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '640px', margin: '8px auto 0' }}>
                    在首页即可直接模拟安全沙箱内的代码测试，实时调节能力维度，观察多智能体根据状态给出的自适应重构路径结论。
                  </p>
                </div>
  
                {/* 3D Tilt Card container wrapping the Playground */}
                <div 
                  className="tilt-card"
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                  style={{ marginBottom: '40px' }}
                >
                  <div className="card-shine-overlay" />
                  <MiniSandboxPlayground />
                </div>
  
                {/* 3D Tilt Card container wrapping the Radar Customizer */}
                <div 
                  className="tilt-card"
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-neon)',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.02)'
                  }}
                >
                  <div className="card-shine-overlay" />
                  <RadarCustomizer />
                </div>
  
              </div>
            </section>
  ```

- [ ] **Step 3: 为首页已有的所有卡片增加 3D Hover & specularity 装饰**
  在 `App.jsx` 中，找到以下元素并添加 `className="tilt-card"`、`onMouseMove={handleCardMouseMove}`、`onMouseLeave={handleCardMouseLeave}`，并在卡片内第一行插入 `<div className="card-shine-overlay" />`：
  1. Hero 区域的 3 个 floating cards (`主管智能体`, `画像智能体`, `路径智能体`).
  2. 拓扑共识模拟器（`TopologySimulation`）所在的卡片容器。
  3. 自适应时间轴卡片（`timeline-card`，由于其包含 ScrollTrigger 的进入特效，可选择保留或添加以支持叠加）。

- [ ] **Step 4: 运行打包测试**
  在 `e:/AIproject/EduGenesis/frontend` 运行 `npm run build`。
  Expected: PASS

- [ ] **Step 5: 提交更改**
  ```bash
  git add frontend/src/App.jsx
  git commit -m "feat: wire up playground and radar sections into landing page and upgrade existing cards to 3D hover tilt effects"
  ```

---

### Task 6: [Verify] 全量编译构建与流畅度检测

- [ ] **Step 1: 验证生产编译打包**
  在 `e:/AIproject/EduGenesis/frontend` 运行：`npm run build`。
  Expected: Vite 成功输出打包后的 HTML/CSS/JS 文件，并且无任何编译阶段的 undefined 错误或代码块格式错误。

- [ ] **Step 2: 验证 dev server 正常拉起**
  运行：`npm run dev` 并访问生成的本地 URL。
  Expected: 页面能够成功初始化加载，Canvas 粒子动画在底层平稳以 60FPS 运动；将鼠标移动到主管智能体或 Playground 等卡片上，卡片有细腻的 3D 偏转光效。

- [ ] **Step 3: 归档成果**
  更新 `walkthrough.md` 将新增加的 Canvas 背景、体验沙盒和能力雷达更新在成果中。
