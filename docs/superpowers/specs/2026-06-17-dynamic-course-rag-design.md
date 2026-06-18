# 设计规约：数据库驱动的动态课程注册与 RAG 检索系统

本设计规约详述了如何在 EduGenesis 系统中支持多智能体自适应学习环境的高等教育课程动态扩展。通过将课程大纲和 RAG 触发元数据移入 SQLite 数据库管理，摆脱目前系统中硬编码的学科限制，使系统能够自适应扩展任何高等教育学科。

---

## 1. 业务目标与需求分析

### 1.1 核心问题
1. **硬编码学科**：现有的 RAG 匹配、8关卡大纲节点和前端注册界面均硬编码为 `Python Basics` 和 `Machine Learning` 两个主题。
2. **缺乏扩展性**：无法方便地增加新专业（如《数据结构》、《计算机网络》等），也无法让老师或管理员动态注册、调整教学关卡。

### 1.2 建设目标
- **动态专业扩展**：提供统一的后端课程注册接口与前端管理表单，支持无限量扩展专业课程。
- **动态大纲 Seeding**：用户在注册选择特定目标时，系统根据数据库定义的 8 关卡数据结构动态分配路径，无须在代码中预存静态节点。
- **解耦 RAG 路由**：RAG 检索在匹配关键词时直接查询数据库注册的课程关键字，自适应将对话导向物理磁盘上对应的课程讲义目录。

---

## 2. 系统架构与技术细节

### 2.1 数据库结构 (Database Schema)
在 `backend/app/db.py` 中定义新的数据库表 `registered_courses`。

```sql
CREATE TABLE IF NOT EXISTS registered_courses (
    course_id TEXT PRIMARY KEY,       -- 唯一代码 (如: data_structures)，对应物理文件夹名
    display_name TEXT NOT NULL,       -- 学科显示名称 (如: 数据结构与算法)
    keywords TEXT NOT NULL,           -- JSON 格式的检索关联词数组 (如: '["链表", "二叉树", "哈希表"]')
    description TEXT NOT NULL,        -- 学科概述
    nodes TEXT NOT NULL               -- 包含 8 关卡定义的 JSON 字符串 (如: '[{"id":"node1", "title":"...", ...}]')
);
```

#### 系统内置课程 Seed 机制
系统在初始化 `init_db()` 时，若检测到 `registered_courses` 行为空，会自动将旧系统中的 `python_basics` 与 `machine_learning` 对应的 8 关卡节点元数据转换并插入到该表中，确保系统的高兼容性与平滑迁移。

---

## 2.2 后端 API 接口设计

#### 1. 获取课程列表
- **URL**: `GET /api/kb/courses`
- **响应格式 (JSON)**:
```json
[
  {
    "course_id": "python_basics",
    "display_name": "Python 编程基础",
    "keywords": ["变量", "条件", "循环"],
    "description": "Python编程与基本控制流",
    "nodes": [...]
  }
]
```

#### 2. 注册新课程
- **URL**: `POST /api/kb/courses`
- **请求格式 (JSON)**:
```json
{
  "course_id": "data_structures",
  "display_name": "数据结构与算法",
  "keywords": ["数据结构", "二叉树", "链表", "栈"],
  "description": "高等教育计算机专业核心理论基础课程",
  "nodes": [
    { "id": "node1", "title": "线性表与单链表", "description": "学习单链表与双向链表的增删改查及防错处理", "resources": ["pdf", "code", "video"] },
    ... (依次包含8个节点定义)
  ]
}
```
- **后端动作**：
  1. 校验 `course_id` 是否为仅包含英文、数字、下划线的安全字符串（过滤任何 `/`、`\` 或 `..`），防止物理存储层面的目录穿越安全隐患。
  2. 写入 `registered_courses` 数据库表。
  3. 在 `backend/courses/` 下自动创建同名子文件夹 `data_structures`。
  4. 返回成功状态。

#### 3. 删除课程
- **URL**: `DELETE /api/kb/courses/{course_id}`
- **说明**：系统拒绝删除内置的 `python_basics` 与 `machine_learning` 课程以保障基础体验的稳健。

---

## 2.3 RAG 归类匹配改造 (`knowledge_base.py`)
替换原有根据硬编码关键词的 if-else 逻辑，改为从数据库中动态查询已注册的 `keywords`：

1. 载入所有已注册课程的 `course_id` 及其 `keywords` 列表。
2. 对用户输入（如“树”或“链表”）在 `keywords` 中寻找子串包含匹配。
3. 匹配成功则返回该课程 `course_id`，使其后续的 RAG 文件载入路径正确拼接为 `backend/courses/<course_id>/*.md`。
4. 若均匹配失败，则落入默认的 `python_basics` 兜底。

---

## 2.4 关卡大纲动态分派改造 (`db.py`)
修改 `db_sync_path_nodes_by_goals` 函数：
1. 根据用户的注册目标或修改的目标 `goal`，查询 `registered_courses` 表对应的关卡 `nodes` 数据。
2. 将 JSON 节点转换并实例化为 Python Pydantic `PathNode` 实例列表。
3. 调用 `db_save_path_nodes` 将大纲保存为该用户的个性化专属关卡路径。

---

## 2.5 前端动态课程配置与管理 UI

#### 1. 账号注册页 (`AuthView.jsx`)
- 挂载时通过 `apiGet('/kb/courses')` 加载可用课程。
- 将原本硬编码的“Python编程基础”和“机器学习”两张卡片改为 `map` 动态遍历 `availableCourses`。

#### 2. 学术控制台设置面板 (`SettingsView.jsx`)
- 新增 **“高等教育课程”** (知识库管理) 子菜单。
- **列表显示区**：展示各课程的基本特征，点击可拉开展示其 8 个关卡的名字和大纲。对于非内置课程，提供“删除”功能。
- **表单编辑区**：点击“添加课程”打开遮罩表单，允许用户填写课程 ID、显示名称、关键词、简介，并依次输入 1~8 关卡的标题、描述及勾选可选资源项（PDF、代码、幻灯片、测验、视频）。

---

## 3. 安全防范与错误处理
- **接口防注防穿越**：对注册接口中的 `course_id` 进行严格的正规正则表达式校验 `^[a-zA-Z0-9_]+$`，确保不会因为畸形输入破坏服务器目录树。
- **RAG 文件缺失兜底**：当用户请求已注册课程的讲义，但物理磁盘上尚未上传相应 markdown 讲义文件时，RAG 加载模块自动返回空上下文，LLM 生成器会自动降级到本地静态自适应库，以保障页面展现不中断。
