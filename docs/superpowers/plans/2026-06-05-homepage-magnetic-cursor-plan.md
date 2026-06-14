# 动态磁吸环形光标 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 EduGenesis 网站开发专属的动态磁吸环形光标，提升平台整体视觉品质与手势操作沉浸感。

**Architecture:** 
1. 隐藏默认鼠标指针，利用 CSS 编写光标圆点与缓动圆环的样式。
2. 在 `App.jsx` 中声明 refs、全局侦听事件以及触摸屏回退禁用机制。
3. 在渲染顶层加载光标 DOM。

**Tech Stack:** React 18, CSS Hardware Acceleration.

---

### Task 1: [CSS] 隐藏浏览器原生光标并添加自定义霓虹光标样式

**Files:**
- Modify: `frontend/src/index.css`

- [ ] **Step 1: 编写 CSS 样式**
  在 `frontend/src/index.css` 末尾追加原生指针隐藏、自定义光标 Dot 和 Ring、磁吸 `.hovered` 态、以及移动端禁用 `.cursor-disabled` 的样式定义。

  ```css
  /* ==========================================
     Custom Dynamic Magnetic Cursor Styles
     ========================================== */
  
  /* Hide default browser cursor in desktop */
  @media (pointer: fine) {
    body, 
    a, 
    button, 
    input, 
    select, 
    textarea,
    .interactive-btn,
    .tilt-card,
    .cyber-btn,
    .range-slider-neon {
      cursor: none !important;
    }
  }
  
  .custom-cursor-dot {
    position: fixed;
    top: 0;
    left: 0;
    width: 8px;
    height: 8px;
    background-color: var(--primary-neon);
    border-radius: 50%;
    pointer-events: none;
    z-index: 99999;
    transform: translate3d(-50%, -50%, 0);
    transition: width 0.2s ease, height 0.2s ease, background-color 0.2s ease;
  }
  
  .custom-cursor-ring {
    position: fixed;
    top: 0;
    left: 0;
    width: 34px;
    height: 34px;
    border: 1.5px solid var(--primary-neon);
    border-radius: 50%;
    pointer-events: none;
    z-index: 99998;
    transform: translate3d(-50%, -50%, 0);
    /* Cubic-bezier lag drag effect */
    transition: transform 0.14s cubic-bezier(0.215, 0.61, 0.355, 1), 
                width 0.2s ease, 
                height 0.2s ease, 
                border-color 0.2s ease,
                box-shadow 0.2s ease;
  }
  
  /* Hovered Magnetic state */
  .custom-cursor-dot.hovered {
    width: 4px;
    height: 4px;
    background-color: var(--secondary);
  }
  
  .custom-cursor-ring.hovered {
    width: 48px;
    height: 48px;
    border-color: var(--secondary);
    border-width: 2px;
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
  }
  
  /* Disable on touch devices */
  .cursor-disabled {
    display: none !important;
  }
  ```

- [ ] **Step 2: 验证编译打包**
  在 `e:/AIproject/EduGenesis/frontend` 运行 `npm run build`，确保样式解析无报错。
  Expected: PASS

- [ ] **Step 3: 提交修改**
  ```bash
  git add frontend/src/index.css
  git commit -m "style: add dynamic magnetic cursor css variables and classes"
  ```

---

### Task 2: [App] 编写光标追踪与全局 hover 代理逻辑

**Files:**
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: 声明 Refs 节点**
  在 `export default function App() {` 开头部分（约 line 416），引入光标节点的 refs 声明：
  ```javascript
    const cursorDotRef = useRef(null);
    const cursorRingRef = useRef(null);
  ```

- [ ] **Step 2: 编写全局追踪与事件侦听 Hook**
  在 `App` 组件内部的 hooks 声明区中（例如 Canvas `useEffect` 或 theme `useEffect` 后），加入光标处理逻辑，并考虑移动触屏端退回机制。

  ```javascript
    // Dynamic Custom Cursor pointer listeners
    useEffect(() => {
      // 仅在支持 fine pointer (鼠标/触控板) 设备的桌面端激活光标追踪
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (isTouchDevice) {
        cursorDotRef.current?.classList.add('cursor-disabled');
        cursorRingRef.current?.classList.add('cursor-disabled');
        return;
      }
  
      const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        if (cursorDotRef.current) {
          cursorDotRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
        }
        if (cursorRingRef.current) {
          cursorRingRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
        }
      };
  
      const handleMouseOver = (e) => {
        const target = e.target;
        if (target && target.closest('a, button, .interactive-btn, .tilt-card, .range-slider-neon, [role="button"], input, select, textarea')) {
          cursorDotRef.current?.classList.add('hovered');
          cursorRingRef.current?.classList.add('hovered');
        }
      };
  
      const handleMouseOut = (e) => {
        const target = e.target;
        if (target && target.closest('a, button, .interactive-btn, .tilt-card, .range-slider-neon, [role="button"], input, select, textarea')) {
          cursorDotRef.current?.classList.remove('hovered');
          cursorRingRef.current?.classList.remove('hovered');
        }
      };
  
      // Listen touchstart to dynamically disable cursor if screen is touched
      const handleTouchStart = () => {
        cursorDotRef.current?.classList.add('cursor-disabled');
        cursorRingRef.current?.classList.add('cursor-disabled');
      };
  
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseover', handleMouseOver);
      window.addEventListener('mouseout', handleMouseOut);
      window.addEventListener('touchstart', handleTouchStart);
  
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseover', handleMouseOver);
        window.removeEventListener('mouseout', handleMouseOut);
        window.removeEventListener('touchstart', handleTouchStart);
      };
    }, []);
  ```

- [ ] **Step 3: 验证编译打包**
  在 `e:/AIproject/EduGenesis/frontend` 运行 `npm run build`，确保逻辑中无未定义变量。
  Expected: PASS

- [ ] **Step 4: 提交修改**
  ```bash
  git add frontend/src/App.jsx
  git commit -m "feat: implement cursor pointer move trackers and global hover delegation hooks"
  ```

---

### Task 3: [App] 在渲染层加载光标 DOM

**Files:**
- Modify: `frontend/src/App.jsx` (两处 return 节点渲染)

- [ ] **Step 1: 在第一处 Return 节点挂载光标 DOM**
  定位到 `App.jsx` 的首个 return block（约 line 2794）：
  ```javascript
    if (currentView === 'landing' || currentView === 'auth' || !isLoggedIn) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
  ```
  在 `<div style={{ ... }}>` 子节点第一行挂载光标元素：
  ```javascript
          {/* Custom Dynamic Magnetic Cursor */}
          <div ref={cursorDotRef} className="custom-cursor-dot" />
          <div ref={cursorRingRef} className="custom-cursor-ring" />
  ```

- [ ] **Step 2: 在第二处 Return 节点挂载光标 DOM**
  定位到 `App.jsx` 的第二个 return block（约 line 3678）：
  ```javascript
    return (
      <>
        <div className="app-container">
  ```
  在 `<div className="app-container">` 子节点第一行挂载光标元素：
  ```javascript
          {/* Custom Dynamic Magnetic Cursor */}
          <div ref={cursorDotRef} className="custom-cursor-dot" />
          <div ref={cursorRingRef} className="custom-cursor-ring" />
  ```

- [ ] **Step 3: 验证编译打包**
  在 `e:/AIproject/EduGenesis/frontend` 运行 `npm run build`。
  Expected: PASS

- [ ] **Step 4: 提交修改**
  ```bash
  git add frontend/src/App.jsx
  git commit -m "feat: render custom cursor elements in portal and dashboard views"
  ```

---

### Task 4: [Verify] 生产环境编译与指针流畅度验证

- [ ] **Step 1: 全量编译验证**
  运行：`npm run build`。
  Expected: Vite 编译顺利输出 dist 产物。

- [ ] **Step 2: 页面测试验证**
  启动 dev server (`npm run dev`)，并载入页面。
  Expected: 鼠标划过交互节点时，光标能灵巧膨胀，外层环有顺滑的滞后跟进物理动效。
