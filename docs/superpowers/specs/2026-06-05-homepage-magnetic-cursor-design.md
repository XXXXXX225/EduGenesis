# 动态磁吸环形光标设计文档 (2026-06-05)

本设计文档详细规划了 **EduGenesis** 网站专属的鼠标样式升级方案。通过引入动态磁吸环形光标（Magnetic Ring & Dot Cursor），配合硬件加速的 CSS 差值物理延迟效果，进一步强化系统的科幻与智能体协同风格。

---

## 一、 设计目标 (Goals)

1. **极致交互手感**：
   - 替换浏览器默认的低阶鼠标指针。
   - 鼠标中心为亮眼微型圆点（Dot），外围环绕以空气阻力缓动跟随的霓虹圆环（Ring）。
2. **磁吸状态感知 (Magnetic Snap Hover)**：
   - 当划过按钮、链接、3D卡片及滑动条等交互元素时，圆环自动平滑动效放大并切换为皇家蓝发光，中点收缩，呈现“磁力吸附”效果。
3. **零帧重排高效率**：
   - 摒弃 React State 高频触发重绘的模式，采用 React Refs 和原生的 `transform` 驱动坐标定位。
   - 在移动端/触屏设备上自动检测并静默禁用自定义鼠标，以保证极致兼容性。

---

## 二、 详细设计说明 (Proposed Components)

### 1. HTML/DOM 结构
在 `App.jsx` 的渲染根节点（即返回 JSX 的最外层容器）的顶部，放置两个代表光标的空容器：
```javascript
<div ref={cursorDotRef} className="custom-cursor-dot" />
<div ref={cursorRingRef} className="custom-cursor-ring" />
```

### 2. 硬件加速渲染与事件侦听
*   **坐标计算**:
    - 在全局 `window` 上绑定 `mousemove`。
    - 将 `e.clientX` 与 `e.clientY` 实时写入 DOM 节点的 `style.transform = "translate3d(Xpx, Ypx, 0)"`。
    - 使用 `translate(-50%, -50%)` 确保圆点和圆环的几何中心点与鼠标精确重合。
*   **差值物理延迟**:
    - 通过 CSS 硬件加速过渡属性：
      `.custom-cursor-ring { transition: transform 0.14s cubic-bezier(0.215, 0.61, 0.355, 1); }`
    - 该贝塞尔曲线会使得圆环随鼠标移动产生空气粘滞的柔韧拉扯拖拽特效。

### 3. 全局代理检测与 hover 类名切换
*   **状态捕捉**:
    - 绑定全局 `mouseover` 与 `mouseout`。
    - 通过 `e.target.closest('a, button, .interactive-btn, .tilt-card, .range-slider-neon, [role="button"]')` 模糊匹配交互元素。
    - 匹配成功后，通过 Ref 手动给两个光标节点增加 `.hovered` 类名。
*   **设备兼容性**:
    - 绑定 `touchstart` 侦听。一旦捕获到触摸屏手势，自动为光标容器添加 `.cursor-disabled` 隐藏自定义光标并恢复浏览器原生样式，防止移动设备上出现失效的浮空指针。

---

## 三、 提议的变更文件

### 1. `frontend/src/index.css`
*   隐藏默认的 `body { cursor: none; }` 以及所有交互按钮上的默认手型指针。
*   编写 `.custom-cursor-dot` 与 `.custom-cursor-ring` 的大小、渐变色霓虹阴影、高 z-index 层级样式。
*   添加 `.hovered` 态下的扩大、换色、阴影呼吸等过渡样式。

### 2. `frontend/src/App.jsx`
*   引入 `cursorDotRef` 和 `cursorRingRef` 钩子。
*   在全局 `useEffect` 内绑定 `mousemove`，`mouseover`，`mouseout`，以及 `touchstart`。
*   在 return 语句开头渲染两块光标 DOM。

---

## 四、 验证计划

1. **构建与运行验证**:
   - 运行 `npm run build` 验证打包无任何语法或路径解析异常。
2. **流畅度检测**:
   - 鼠标在桌面端快速移动，观察是否在 60FPS 满帧运行，没有布局卡顿或拖沓。
3. **移动端回退机制 (Fallback)**:
   - 模拟移动端触摸屏状态下，确认自定义光标被正常隐藏并显示系统原生触摸样式。
