# 首页内容丰富与交互式动画设计文档 (2026-06-05)

本设计文档详细规划了大赛 A3 赛题 **EduGenesis** 首页门户的整体视觉升级方案（方案 A）。通过引入 GSAP 交互动画、ScrollTrigger 滚动轴驱动和多智能体协同仿真控制台，将传统的静态首页改造成一个高端、生动的智能体协同教学系统看板。

---

## 一、 设计目标 (Goals)

1. **多智能体流光协同 (Hero Animation)**：
   - 展现主管、画像、路径智能体之间的交互逻辑。
   - 鼠标悬浮在任意智能体卡片上时，高亮显示该卡片并使用 GSAP 驱动光效在 SVG 链路虚线上流动。
2. **自适应研学成长地图 (Adaptive Journey Timeline)**：
   - 新增页面板块，以图形化流程展示系统的全生命周期因材施教闭环。
   - 结合 GSAP ScrollTrigger 实现成长中轴线高度渐变及内容卡片的 stagger 动画。
3. **多智能体共识决策模拟器 (Topology Simulation)**：
   - 将原有的静态拓扑说明区升级为可点击仿真的控制台，模拟“沙盒运行通过”、“沙盒代码报错”、“前测诊断问答”等事件发生时智能体的链式对话。

---

## 二、 详细设计说明 (Proposed Sections)

### 1. Hero 区域 SVG 链路流光
- **静态结构**：
  在 Hero 区域的 3 个悬浮卡片之间，添加包含 `<path>` 路径的 `<svg>` 画布。
- **GSAP 动效**：
  - 在 React 的 `useEffect` 中注册一个 GSAP 循环动画，让发光的微型 SVG 圆点（或具有虚线偏置 `stroke-dashoffset` 的流线）沿着路径循环流转。
  - 用户 hover 某张卡片时，该卡片微放大的同时，以高亮色彩从该节点向周围发送脉冲粒子。

### 2. 页面新增：自适应研学成长地图 (Journey Timeline)
- **卡片配置 (5 级结构)**：
  - **Stage 1**: 对话式学习画像无感构建（MessageSquare 图标）
  - **Stage 2**: 自适应路径动态重构规划（TrendingUp 图标）
  - **Stage 3**: 安全代码编程沙盒实操（Terminal 图标）
  - **Stage 4**: 智能错题 ledger 加固练习（BookOpen 图标）
  - **Stage 5**: 权威自适应微专业结业证书（GraduationCap 图标）
- **GSAP 滚动效果**：
  - 中轴虚线由 ScrollTrigger 监听滚动，高度从 `0%` 弹性延展到 `100%`。
  - 卡片在划入视口时从两侧侧滑渐现淡入。

### 3. 多智能体共识决策模拟器
- **操作面板**：
  - 提供 3 个场景测试按钮：
    1. **测试前测诊断**：模拟用户给出知识背景信息。
    2. **安全沙盒成功**：模拟用户安全运行代码、更新进度。
    3. **错题巩固通过**：模拟用户解答错题、更新认知雷达。
- **协同打印逻辑**：
  - 点击按钮触发交互，对应的 SVG 拓扑图节点发出呼吸波纹。
  - 控制台日志输出框会按照时间轴，模拟“主管智能体” -> “画像智能体” -> “路径智能体”的流式对话打字，并更新中央雷达指标数值。

---

## 三、 提议的变更文件

### 1. `frontend/src/index.css`
- 新增成长旅程地图 `.journey-section`，`.timeline-container`，`.timeline-line`，`.timeline-item`，`.timeline-card`，及 `.timeline-badge` 样式。
- 添加流光路径动画类 `.pulse-glow-path`，拓扑图节点点击波纹类等。

### 2. `frontend/src/App.jsx`
- 在首页 LandingView 中插入成长地图组件。
- 升级拓扑图为 `TopologySimulation`，引入状态驱动（`simulationEvent`），添加按钮触发事件、模拟打印日志定时器以及多智能体流式对话的状态管理。
- 绑定对应的 `useEffect` 注册 GSAP 滚动监听和过渡动画，并做好 unmount 时的 `ctx.revert()` 清理以防内存泄露。

---

## 四、 验证计划

1. **构建正确性验证**：
   - 运行 `npm run build` 确保没有 TypeScript 检查或 Vite 打包错误。
2. **动画流畅度与内存验证**：
   - 检查 ScrollTrigger 滚动响应是否符合 60FPS 的视觉要求。
   - 反复在 landing 页面和 auth 页面之间切换，确保 ScrollTrigger 和 Timeline 实例在组件销毁时能正常清理。
