# 侧栏对话历史与自适应控制台设计规范 (Design Spec)

**主题:** 可收起左侧栏及数据库持久化多会话历史设计
**日期:** 2026-06-15
**作者:** Antigravity

---

## 1. 业务目标

1. **解决刷新清空问题**：目前所有的对话状态仅保存在 React state 中，刷新页面即丢失。本规范引入 SQLite 数据库持久化，将对话历史记录永久关联到用户账户。
2. **多会话管理 (Multi-Session)**：支持用户创建、切换、重命名和删除多个不同的对话会话（如“Python 基础”、“机器学习实战”），类似于 ChatGPT。
3. **自适应控制台侧栏 (方案 B)**：左侧栏包含三个核心板块：
   * **顶部控制**：开启新对话按钮与侧栏折叠开关。
   * **中部导航**：历史会话列表，支持悬浮删除。
   * **底部快捷控制台**：包含一键导出/导入、清空历史、预设学习捷径（一键调整目标或重置路线）以及**导师性格切换**功能。

---

## 2. 数据库设计

在 `backend/app/db.py` 中引入两张新表，并在 `init_db()` 中创建它们。

### 2.1 会话表 `chat_sessions`
存储会话的元数据。

| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `session_id` | TEXT | PRIMARY KEY | 会话唯一标识符 (UUID 或时间戳) |
| `username` | TEXT | FOREIGN KEY (users.username) | 关联所属用户 |
| `title` | TEXT | NOT NULL | 会话标题（默认取用户发送的第一条消息前几字） |
| `created_at` | TEXT | NOT NULL | ISO-8601 创建时间 |
| `updated_at` | TEXT | NOT NULL | ISO-8601 更新时间（用于按最新交互排序） |

### 2.2 消息表 `chat_messages`
存储会话中的具体消息，支持多模态卡片标签（如 `[QUIZ: ...]`）。

| 字段名 | 类型 | 约束 | 描述 |
| :--- | :--- | :--- | :--- |
| `message_id` | TEXT | PRIMARY KEY | 消息唯一 ID |
| `session_id` | TEXT | FOREIGN KEY (chat_sessions.session_id) | 关联会话 ID |
| `role` | TEXT | NOT NULL | 角色: `'user'` 或 `'assistant'` |
| `content` | TEXT | NOT NULL | 消息内容文本，可包含卡片标签 |
| `created_at` | TEXT | NOT NULL | ISO-8601 创建时间 |

---

## 3. 后端 API 接口设计

在 `backend/app/routes/chat.py` 中增加以下路由接口：

### 3.1 获取所有会话列表
* **接口：** `GET /api/chat/sessions`
* **鉴权：** 需要 Bearer Token
* **返回：**
  ```json
  [
    {
      "session_id": "session-123456",
      "username": "default_user",
      "title": "Python 变量学习",
      "created_at": "2026-06-15T21:00:00",
      "updated_at": "2026-06-15T21:05:00"
    }
  ]
  ```

### 3.2 创建新会话
* **接口：** `POST /api/chat/sessions`
* **参数：**
  ```json
  {
    "session_id": "session-123456",
    "title": "新对话"
  }
  ```

### 3.3 重命名会话
* **接口：** `PUT /api/chat/sessions/{session_id}`
* **参数：** `{"title": "新标题"}`

### 3.4 删除单会话
* **接口：** `DELETE /api/chat/sessions/{session_id}`

### 3.5 清空所有会话
* **接口：** `DELETE /api/chat/sessions`

### 3.6 获取会话的全部历史消息
* **接口：** `GET /api/chat/sessions/{session_id}/messages`
* **返回：**
  ```json
  [
    {
      "message_id": "msg-001",
      "session_id": "session-123456",
      "role": "user",
      "content": "我想学 Python",
      "created_at": "2026-06-15T21:00:00"
    },
    {
      "message_id": "msg-002",
      "session_id": "session-123456",
      "role": "assistant",
      "content": "您好！我已经为您加载了...",
      "created_at": "2026-06-15T21:00:05"
    }
  ]
  ```

### 3.7 修改 `/chat` 对话流式接口
* 修改 `ChatRequest` 模型，添加可选字段 `session_id: Optional[str] = None` 与 `tutor_personality: Optional[str] = None`（导师性格）。
* 当收到 `session_id` 时，在 event_generator 中：
  1. 将用户的最新一条消息插入到 `chat_messages` 数据库中。
  2. 开始调用 LLM 模型流式输出，并在内存中拼接完整的 assistant 回复。
  3. 当 SSE 流式完成且返回 `[DONE]` 前，将完整的 assistant 回复插入到 `chat_messages` 数据库中。
* 如果传入了 `tutor_personality`，主管智能体在拼装 LLM system prompt 时，将注入对应的性格特征（严肃学术风、温暖鼓励风、极客代码风）。

---

## 4. 前端状态与 UI 设计

### 4.1 全局状态层 (`AppContext.jsx`)
* 新增状态：
  * `chatSessions` (Array): 保存当前用户的会话列表。
  * `currentSessionId` (String|null): 当前活动会话的 ID。
  * `isLeftSidebarOpen` (Boolean): 侧栏展开/收起状态，默认 `true`，存入 `localStorage` 中。
  * `tutorPersonality` (String): 导师性格风格（`academic` / `encouraging` / `coder`）。
* 提供全局函数：
  * `loadChatSessions()`: 初始化或登录后加载用户会话。
  * `startNewChat()`: 生成新 UUID 创建空会话，插入到 `chatSessions` 顶部，切换为当前会话，并重置聊天输入和默认欢迎词。
  * `switchSession(sessionId)`: 切换活动会话并请求 `/api/chat/sessions/{session_id}/messages` 装载历史消息。
  * `deleteSession(sessionId)`: 删除会话并在前端列表移除，若删除的是当前活动会话，则自动切换到下一个或新建。
  * `renameSession(sessionId, newTitle)`: 更新会话标题。
  * `clearAllSessions()`: 清空全部会话。

### 4.2 侧栏布局与 CSS (`App.jsx` 与 `index.css`)
* 在 `App.jsx` 的 `.agent-body` 网格中引入第四列 `.agent-panel-left-collapsible`：
  ```css
  .agent-body {
    display: grid;
    /* 通过变量控制左侧栏宽度 */
    grid-template-columns: var(--left-sidebar-width, 260px) 1fr 4px var(--sidebar-width, 340px);
    height: calc(100vh - 72px);
    width: 100vw;
    overflow: hidden;
    transition: grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  ```
* 侧栏收起状态：
  * 收起时，`--left-sidebar-width` 设为 `0px`，`.agent-panel-left-collapsible` 设置为 `border-right: 0px solid transparent; padding: 0;` 以实现完全无缝的折叠过渡。
  * 展开时，宽度为 `260px`。
* 侧栏收起按钮：
  * 位于顶部 `header` 的最左侧，靠近 logo，放置一个简洁的 `☰` (Menu) 图标或 Lucide-React 的 `PanelLeftClose` / `PanelLeftOpen`。

### 4.3 侧栏内组件结构
1. **Header & Fold**: 顶部有侧栏的快捷标题与折叠微标。
2. **“+ 开启新对话”按钮**：常驻顶部，点击调用 `startNewChat()`。
3. **会话列表滚动区**：
   * 展示最近会话，活动会话高亮（使用 glassmorphism 悬浮质感）。
   * 双击会话标题可直接编辑（重命名），失焦或按回车保存。
   * 会话条右侧悬浮出现垃圾桶 `🗑️` 按钮，点击调用删除。
4. **自适应控制台（底部）**：
   * **快捷导师性格选择**：下拉菜单或图标切换按钮（🎓 学术 / 🌟 鼓励 / 🤖 极客），切换时更新 `tutorPersonality`，下一次对话请求时生效。
   * **快捷动作按钮组**：
     * 📥 **导入对话** / 📤 **导出 Markdown**
     * 🗑️ **清空全部对话**
   * **系统快捷预设指令卡片**：
     * “🎯 Python 零基础”：点击直接发送预设问题，调整学习路径。
     * “🚀 机器学习特快”：点击一键切换为机器学习模式。
     * “🔄 重构学习路径”：调用路径重置路由。

---

## 5. 验证与测试方案

### 5.1 单元测试与接口验证
* **测试用例 1 (数据库底层)**: 编写 `tests/test_chat_history.py` 验证 `db_create_chat_session`, `db_save_chat_message` 等函数的增删改查动作正常，外键约束有效。
* **测试用例 2 (API 端点)**: 模拟请求验证 `GET /api/chat/sessions` 以及 `/api/chat` 流式响应后，消息是否如期落库。

### 5.2 手动集成验证
1. **登录验证**：登录 `default_user`，发送消息，页面强制刷新，验证对话记录不会清空并从数据库恢复。
2. **多会话切换**：点击“+ 开启新对话”创建一个新会话，在新旧会话间来回切换，验证消息独立且渲染正常。
3. **侧栏收起**：点击顶部 Menu 按钮，侧栏以平滑的 CSS Transition (0.3s) 折叠，主对话视窗自适应铺满；再次点击能正常展开。
4. **控制台交互**：切换导师性格为“温暖鼓励风”，发送编程求助，确认回复内容是否比默认更加通俗，且带有关怀语气；点击“导出 Markdown”下载当前对话记录 file。
