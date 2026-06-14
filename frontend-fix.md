读完整个项目后，我对前端有以下建议，按优先级排列：

---

## 🎯 前端改进建议

### 一、工程结构（影响最大）

**当前问题**: `App.jsx` 5135 行单一文件，所有组件、逻辑、样式混在一起。

**建议**:
1. **拆分组件事不宜迟** — 至少拆出这些独立文件：

```
src/
├── components/
│   ├── landing/
│   │   ├── HeroSection.jsx
│   │   ├── TimelineJourney.jsx
│   │   ├── MiniSandboxPlayground.jsx
│   │   ├── RadarCustomizer.jsx
│   │   └── TopologySimulator.jsx
│   ├── dashboard/
│   │   ├── ChatTab.jsx
│   │   ├── PathTab.jsx
│   │   ├── ResourceTab.jsx
│   │   ├── SandboxTab.jsx
│   │   ├── ErrorsTab.jsx
│   │   ├── ConsoleTab.jsx
│   │   └── AchievementsTab.jsx
│   ├── modals/
│   │   ├── PdfModal.jsx
│   │   ├── SlideModal.jsx
│   │   ├── QuizModal.jsx
│   │   └── MindmapCodeModal.jsx
│   └── shared/
│       ├── InteractiveChatBubble.jsx
│       ├── RadarChart.jsx
│       └── CustomCursor.jsx
├── hooks/
│   ├── useCanvasParticles.js
│   ├── useCustomCursor.js
│   ├── useProfile.js
│   └── useSSEStream.js
├── utils/
│   ├── api.js          (统一 fetch 封装)
│   ├── parseMarkdown.js
│   └── highlightCode.js
└── App.jsx             (< 300 行，只做路由/状态编排)
```

**收益**: 评委看代码时直接定位、易读性强、在配套文档中便于叙述架构设计（评分标准 10% 配套文档丰富度）。

---

### 二、路由与 URL 管理

**当前问题**: 手动解析 `window.location.pathname`，`pushState` 无 popstate 监听，无法支持浏览器前进/后退。

**建议**: 引入轻量路由（`react-router-dom` 仅 12KB gzip），或者至少：

```javascript
// 最小代价修复：监听 popstate 支持前进后退
useEffect(() => {
  const handlePopState = () => {
    const { view, mode, tab } = parseStateFromURL();
    setCurrentView(view);
    setAuthMode(mode);
    setActiveTab(tab);
  };
  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, []);
```

**收益**: 评委演示时浏览器的后退按钮能正常工作，避免尴尬。

---

### 三、API 层统一封装

**当前问题**: `http://127.0.0.1:8000/api/...` 硬编码散布在 ~20+ 处。

**建议**:

```javascript
// utils/api.js
const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api';

export async function apiGet(path, params = {}) { ... }
export async function apiPost(path, body = {}) { ... }
export async function apiSSEStream(path, body, onChunk) { ... }
```

**收益**: 切换部署环境只需改一处；符合 `.env.example` 已有的环境变量约定。

---

### 四、视觉效果加分项（低成本高收益）

这些改动小但演示效果好，直接提升「创新价值与实用性 (35%)」的印象分：

1. **流式输出光标闪烁动画** — Chat 流式回复时在文末加一个闪烁的 `▊` 光标。当前代码在 `setChatHistory` 中已实时更新，只需加一个 CSS 动画的 caret 元素。

2. **Canvas 粒子连线加「认知图谱」隐喻** — 目前的粒子是纯随机的，可以加几组固定坐标的「智能体节点」，粒子靠近节点时形成连接线，视觉上体现多智能体协同。改动约 30 行。

3. **Page transition 动画** — Landing → Dashboard 切换时用 GSAP 做一个简单的 fade + scale 过渡，当前是无过渡直接切换。

4. **Quiz 正确/错误时的震动反馈** — 答对绿色脉冲 + 轻微 scale up；答错红色抖动（CSS `@keyframes shake`）。当前只有静态的 feedback 文字。

5. **暗色模式的 canvas 粒子颜色** — 当前代码已支持（`body.dark-mode #space-particles-canvas`），但切换暗色模式时 canvas 需要重新获取颜色变量，目前 `useEffect` 的依赖是 `[]`，首次渲染后不再更新。需要监听主题变化。

---

### 五、移动端响应式

**当前问题**: 1024px 以下 sidebar 折叠到顶部，但 Landing 页面的时间轴、Hero 卡片在手机端体验不佳。

**建议**: 
- 时间轴中轴线在小屏改到左对齐（CSS 里已有 768px 的 media query，但布局仍需微调）
- Hero 3 卡片在小屏改为垂直堆叠
- 雷达图在高宽比 < 1 的设备上缩放

---

### 六、性能优化

1. **`App.jsx` 中定义的函数组件不要在每次 render 时重新创建** — `InteractiveChatBubble`、`MiniSandboxPlayground`、`RadarCustomizer` 等内嵌组件，每次 App 状态变化都会导致它们重新 mount（丢失内部动画状态）。移到外部或用 `useMemo` 稳定引用。

2. **Canvas 粒子的 `requestAnimationFrame`** — 当前代码在 `document.hidden` 时不暂停（plan 文档里提到了检测 `document.hidden` 但实际代码中未实现）。加上：

```javascript
const handleVisibility = () => {
  if (document.hidden) cancelAnimationFrame(afId);
  else animate();
};
document.addEventListener('visibilitychange', handleVisibility);
```

3. **GSAP ScrollTrigger 清理** — 代码里注册了 ScrollTrigger 但需要在 App unmount 时调用 `ScrollTrigger.getAll().forEach(t => t.kill())`，防止在 SPA 视图切换时残留监听。

---

### 七、赛题加分项对齐

对照评分标准，当前缺失或可加强的点：

| 加分项                   | 当前状态                                           | 建议                                                         |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------ |
| **智能辅导（即时答疑）** | Chat Tab 已有基础对话                              | 加一个浮动「问号」按钮，选中任意 PDF/幻灯片文字后弹出上下文解释，体现多模态辅导 |
| **学习效果评估闭环**     | profile 更新后推送，但缺少可视化反馈               | 主页画像雷达旁加一个 `对比上次` 的 delta 指标（↑/↓），让评委看到「随学随新」的闭环效果 |
| **生成进度追踪**         | 后端 SSE 有 status 推送，前端 `tutorStatus` 已显示 | 再加一个进度条或步骤指示器（已在沙盒 mini playground 里有类似设计，Chat 流式生成时复用） |

---

### 📊 建议优先级排序

| 优先级 | 改动                            | 预计工时 | 影响维度              |
| ------ | ------------------------------- | -------- | --------------------- |
| 🔴 P0   | 组件拆分                        | 3-4h     | 配套文档 + 代码可读性 |
| 🔴 P0   | 浏览器前进后退支持              | 0.5h     | 演示流畅度            |
| 🟡 P1   | API 封装                        | 1h       | 部署灵活性            |
| 🟡 P1   | Quiz 震动动画 + 光标闪烁        | 0.5h     | 演示效果              |
| 🟡 P1   | GSAP/Canvas 清理                | 0.5h     | 内存泄漏风险          |
| 🟢 P2   | 移动端优化                      | 2h       | 多设备演示            |
| 🟢 P2   | 加分项（上下文答疑/delta 指标） | 2h       | 评分竞争力            |
| 🟢 P2   | Page transition                 | 1h       | 视觉品质              |

---

需要我帮你实施其中某项吗？比如从组件拆分或者浏览器前进后退支持开始？