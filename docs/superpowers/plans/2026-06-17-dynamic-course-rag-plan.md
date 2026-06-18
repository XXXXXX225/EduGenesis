# 数据库驱动的动态课程注册与 RAG 检索系统 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 升级 EduGenesis 的自适应学习系统，从数据库动态读取与配置高等教育课程、大纲路径及 RAG 学科关键词，替代原先代码中硬编码的 Python Basics 和 Machine Learning。

**Architecture:** 
1. 新建 `registered_courses` 数据库表，存储课程名称、描述、关卡大纲 JSON 及 RAG 关键词。
2. 开放 `/api/kb/courses` 等 REST 接口进行课程注册和删除，并执行目录安全性过滤。
3. 改造 RAG 分类逻辑与关卡大纲 Seeding，使其查询数据库而非硬编码的 if-else。
4. 前端动态获取课程卡片展示，并在设置面板中提供可视化的课程大纲增删改查后台。

**Tech Stack:** FastAPI (Python), SQLite3, React (Vite, CSS Modules), Lucide React.

---

### Task 1: 数据库表结构扩充与 Seed 数据

**Files:**
- Modify: `backend/app/db.py:662-790` (在 `init_db` 中新建 `registered_courses` 表并加入 Seeding 机制)
- Modify: `backend/tests/test_db.py` (编写测试确保建表和 Seed 数据能正确载入)

- [ ] **Step 1: 编写数据库单元测试**
  在 `backend/tests/test_db.py` 底部增加新测试，验证 `registered_courses` 的建表与 Seeding 成功：
  ```python
  def test_registered_courses_seeding():
      import sqlite3
      from app.db import DB_PATH
      conn = sqlite3.connect(DB_PATH)
      cursor = conn.cursor()
      cursor.execute("SELECT COUNT(*) FROM registered_courses")
      count = cursor.fetchone()[0]
      assert count >= 2  # python_basics and machine_learning should be seeded
      
      cursor.execute("SELECT display_name FROM registered_courses WHERE course_id = 'python_basics'")
      display_name = cursor.fetchone()[0]
      assert "Python" in display_name
      conn.close()
  ```

- [ ] **Step 2: 运行测试验证失败**
  在 `backend/` 目录下运行：
  `pytest tests/test_db.py -k test_registered_courses_seeding -v`
  预期输出：FAIL (Table registered_courses does not exist)

- [ ] **Step 3: 编写数据库表定义与 Seed 逻辑**
  在 `backend/app/db.py` 的 `init_db()` 函数尾部添加：
  ```python
      # Registered Courses Table
      cursor.execute("""
      CREATE TABLE IF NOT EXISTS registered_courses (
          course_id TEXT PRIMARY KEY,
          display_name TEXT NOT NULL,
          keywords TEXT NOT NULL,
          description TEXT NOT NULL,
          nodes TEXT NOT NULL
      )
      """)
      
      # Seed default courses if empty
      cursor.execute("SELECT COUNT(*) FROM registered_courses")
      if cursor.fetchone()[0] == 0:
          # Convert default nodes to JSON strings
          python_nodes_json = json.dumps([n.model_dump() for n in python_path_nodes], ensure_ascii=False)
          ml_nodes_json = json.dumps([n.model_dump() for n in ml_path_nodes], ensure_ascii=False)
          
          cursor.execute(
              "INSERT INTO registered_courses (course_id, display_name, keywords, description, nodes) VALUES (?, ?, ?, ?, ?)",
              ("python_basics", "Python 编程基础", json.dumps(["python", "变量", "循环", "条件", "函数", "数据结构"], ensure_ascii=False), "Python 基础语法与控制流", python_nodes_json)
          )
          cursor.execute(
              "INSERT INTO registered_courses (course_id, display_name, keywords, description, nodes) VALUES (?, ?, ?, ?, ?)",
              ("machine_learning", "机器学习与深度学习", json.dumps(["机器学习", "线性代数", "梯度", "神经网络", "深度学习", "回归", "分类", "反向传播"], ensure_ascii=False), "经典机器学习数学原理与深度学习算法", ml_nodes_json)
          )
  ```

- [ ] **Step 4: 运行测试验证成功**
  `pytest tests/test_db.py -k test_registered_courses_seeding -v`
  预期输出：PASS

- [ ] **Step 5: 提交代码**
  `git add backend/app/db.py backend/tests/test_db.py && git commit -m "feat(kb): add registered_courses table and default seed data"`

---

### Task 2: 后端课程注册管理 API 端点

**Files:**
- Create: `backend/app/routes/kb.py` (开发课程获取、注册、删除接口)
- Modify: `backend/app/routes/__init__.py` (注册新路由模块)
- Create: `backend/tests/test_kb_endpoints.py` (测试端点的功能与安全性过滤)

- [ ] **Step 1: 编写接口路由与目录遍历安全测试**
  新建 `backend/tests/test_kb_endpoints.py`：
  ```python
  from fastapi.testclient import TestClient
  from main import app
  
  client = TestClient(app)
  
  def test_get_courses():
      response = client.get("/api/kb/courses")
      assert response.status_code == 200
      data = response.json()
      assert len(data) >= 2
      assert any(c["course_id"] == "python_basics" for c in data)
  
  def test_post_course_valid_and_delete():
      # Test valid course post
      payload = {
          "course_id": "test_course",
          "display_name": "测试专业课",
          "keywords": ["测试", "样例"],
          "description": "测试大纲描述",
          "nodes": [
              { "id": "node1", "title": "第一章", "description": "第一章大纲", "resources": ["pdf"] },
              { "id": "node2", "title": "第二章", "description": "第二章大纲", "resources": ["pdf"] },
              { "id": "node3", "title": "第三章", "description": "第三章大纲", "resources": ["pdf"] },
              { "id": "node4", "title": "第四章", "description": "第四章大纲", "resources": ["pdf"] },
              { "id": "node5", "title": "第五章", "description": "第五章大纲", "resources": ["pdf"] },
              { "id": "node6", "title": "第六章", "description": "第六章大纲", "resources": ["pdf"] },
              { "id": "node7", "title": "第七章", "description": "第七章大纲", "resources": ["pdf"] },
              { "id": "node8", "title": "第八章", "description": "第八章大纲", "resources": ["pdf"] }
          ]
      }
      resp = client.post("/api/kb/courses", json=payload)
      assert resp.status_code == 200
      
      # Clean up delete
      del_resp = client.delete("/api/kb/courses/test_course")
      assert del_resp.status_code == 200
  
  def test_post_course_invalid_path_traversal():
      payload = {
          "course_id": "../invalid_path",
          "display_name": "非法路径课程",
          "keywords": ["非法"],
          "description": "检测路径穿越",
          "nodes": []
      }
      resp = client.post("/api/kb/courses", json=payload)
      assert resp.status_code == 400
  ```

- [ ] **Step 2: 运行接口测试确认失败**
  `pytest tests/test_kb_endpoints.py -v`
  预期输出：FAIL (404 Not Found)

- [ ] **Step 3: 编写 `/api/kb` 接口路由实现**
  创建 `backend/app/routes/kb.py`：
  ```python
  import os
  import re
  import json
  import sqlite3
  from typing import List
  from fastapi import APIRouter, HTTPException
  from pydantic import BaseModel, Field
  from app.db import DB_PATH, COURSES_DIR
  
  router = APIRouter()
  
  class NodeInput(BaseModel):
      id: str
      title: str
      description: str
      resources: List[str]
  
  class CourseInput(BaseModel):
      course_id: str
      display_name: str
      keywords: List[str]
      description: str
      nodes: List[NodeInput]
  
  @router.get("/courses")
  def get_courses():
      conn = sqlite3.connect(DB_PATH)
      cursor = conn.cursor()
      cursor.execute("SELECT course_id, display_name, keywords, description, nodes FROM registered_courses")
      rows = cursor.fetchall()
      conn.close()
      
      res = []
      for r in rows:
          res.append({
              "course_id": r[0],
              "display_name": r[1],
              "keywords": json.loads(r[2]),
              "description": r[3],
              "nodes": json.loads(r[4])
          })
      return res
  
  @router.post("/courses")
  def register_course(course: CourseInput):
      # Path Traversal Check
      if not re.match(r"^[a-zA-Z0-9_]+$", course.course_id):
          raise HTTPException(status_code=400, detail="Invalid course_id. Must be alphanumeric and underscore only.")
          
      if len(course.nodes) != 8:
          raise HTTPException(status_code=400, detail="Higher Education syllabi must contain exactly 8 chapters/nodes.")
          
      conn = sqlite3.connect(DB_PATH)
      cursor = conn.cursor()
      try:
          cursor.execute(
              """INSERT OR REPLACE INTO registered_courses (course_id, display_name, keywords, description, nodes) 
                 VALUES (?, ?, ?, ?, ?)""",
              (
                  course.course_id,
                  course.display_name,
                  json.dumps(course.keywords, ensure_ascii=False),
                  course.description,
                  json.dumps([n.model_dump() for n in course.nodes], ensure_ascii=False)
              )
          )
          conn.commit()
      except Exception as e:
          conn.close()
          raise HTTPException(status_code=500, detail=str(e))
      conn.close()
      
      # Dynamically create physical storage folder for course text RAG files
      physical_path = os.path.join(COURSES_DIR, course.course_id)
      os.makedirs(physical_path, exist_ok=True)
      
      return {"status": "success", "course_id": course.course_id}
  
  @router.delete("/courses/{course_id}")
  def delete_course(course_id: str):
      if course_id in ["python_basics", "machine_learning"]:
          raise HTTPException(status_code=400, detail="Cannot delete system default courses.")
          
      conn = sqlite3.connect(DB_PATH)
      cursor = conn.cursor()
      cursor.execute("DELETE FROM registered_courses WHERE course_id = ?", (course_id,))
      conn.commit()
      conn.close()
      return {"status": "success"}
  ```

- [ ] **Step 4: 注册路由并验证测试**
  在 `backend/app/routes/__init__.py` 中导入并挂载 `kb_router`：
  ```python
  from app.routes.kb import router as kb_router
  # 在 API router.include_router 中挂载
  router.include_router(kb_router, prefix="/kb", tags=["Knowledge Base"])
  ```
  运行测试：`pytest tests/test_kb_endpoints.py -v`
  预期输出：PASS

- [ ] **Step 5: 提交代码**
  `git add backend/app/routes/kb.py backend/app/routes/__init__.py backend/tests/test_kb_endpoints.py && git commit -m "feat(kb): add courses registry API endpoints and traversal check"`

---

### Task 3: 知识库 RAG 学科检索解耦改造

**Files:**
- Modify: `backend/app/knowledge_base.py:16-27` (重写 `clean_subject_name` 匹配数据库注册课程)
- Modify: `backend/tests/test_knowledge_base.py` (测试不同学科关键词识别是否生效)

- [ ] **Step 1: 修改 RAG 学科匹配测试用例**
  在 `backend/tests/test_knowledge_base.py` 的 `test_clean_subject_name` 中增加自定义注册学科测试逻辑：
  ```python
  def test_dynamic_clean_subject_name():
      # Inject test course
      import sqlite3
      import json
      from app.db import DB_PATH
      from app.knowledge_base import clean_subject_name
      
      conn = sqlite3.connect(DB_PATH)
      cursor = conn.cursor()
      cursor.execute(
          "INSERT OR REPLACE INTO registered_courses (course_id, display_name, keywords, description, nodes) VALUES (?, ?, ?, ?, ?)",
          ("data_structures", "数据结构与算法", json.dumps(["链表", "树", "图", "算法"], ensure_ascii=False), "测试用", "[]")
      )
      conn.commit()
      conn.close()
      
      # Match keywords
      assert clean_subject_name("数据结构") == "data_structures"
      assert clean_subject_name("二叉树和图") == "data_structures"
      
      # Clean up test course
      conn = sqlite3.connect(DB_PATH)
      cursor = conn.cursor()
      cursor.execute("DELETE FROM registered_courses WHERE course_id = 'data_structures'")
      conn.commit()
      conn.close()
  ```

- [ ] **Step 2: 运行测试验证失败**
  `pytest tests/test_knowledge_base.py -k test_dynamic_clean_subject_name -v`
  预期输出：FAIL

- [ ] **Step 3: 优化 `clean_subject_name` 匹配数据库**
  在 `backend/app/knowledge_base.py` 中重构 `clean_subject_name` 函数：
  ```python
  def clean_subject_name(subject: str) -> str:
      """Standardize the subject string to map to directory names using db registry."""
      try:
          conn = sqlite3.connect(DB_PATH)
          cursor = conn.cursor()
          cursor.execute("SELECT course_id, display_name, keywords FROM registered_courses")
          rows = cursor.fetchall()
          conn.close()
      except Exception as e:
          print(f"Error reading registered courses: {e}")
          return "python_basics"
          
      sub_lower = subject.lower().strip()
      
      # 1. Direct match course_id or display_name
      for course_id, display_name, _ in rows:
          if sub_lower == course_id.lower() or sub_lower == display_name.lower():
              return course_id
              
      # 2. Check keyword list matching
      for course_id, _, keywords_json in rows:
          try:
              keywords = json.loads(keywords_json)
              for kw in keywords:
                  if kw.lower() in sub_lower:
                      return course_id
          except Exception:
              continue
              
      return "python_basics"
  ```

- [ ] **Step 4: 验证测试用例**
  `pytest tests/test_knowledge_base.py -v`
  预期输出：PASS

- [ ] **Step 5: 提交代码**
  `git add backend/app/knowledge_base.py backend/tests/test_knowledge_base.py && git commit -m "refactor(rag): decouples clean_subject_name using database course definitions"`

---

### Task 4: 关卡大纲 Seeding 数据库动态映射

**Files:**
- Modify: `backend/app/db.py:574-592` (重构 `db_sync_path_nodes_by_goals` 加载自定义关卡)
- Modify: `backend/tests/test_db.py` (添加对自定义关卡 Seeding 的测试)

- [ ] **Step 1: 编写关卡 Seeding 单元测试**
  在 `backend/tests/test_db.py` 底部增加新测试：
  ```python
  def test_dynamic_sync_path_nodes_by_goals():
      from app.db import db_sync_path_nodes_by_goals, db_get_path_nodes
      import sqlite3
      import json
      from app.db import DB_PATH
      
      # Register data_structures course with custom 8 nodes
      conn = sqlite3.connect(DB_PATH)
      cursor = conn.cursor()
      custom_nodes = [
          {"id": f"node{i}", "title": f"自定义大纲{i}", "description": "大纲描述", "resources": ["pdf"]}
          for i in range(1, 9)
      ]
      cursor.execute(
          "INSERT OR REPLACE INTO registered_courses (course_id, display_name, keywords, description, nodes) VALUES (?, ?, ?, ?, ?)",
          ("data_structures", "数据结构与算法", json.dumps(["数据结构"], ensure_ascii=False), "测试描述", json.dumps(custom_nodes, ensure_ascii=False))
      )
      conn.commit()
      conn.close()
      
      # Clear existing path nodes for default_user
      conn = sqlite3.connect(DB_PATH)
      cursor = conn.cursor()
      cursor.execute("DELETE FROM user_path_nodes WHERE username = 'test_user_goal'")
      conn.commit()
      conn.close()
      
      # Call sync
      db_sync_path_nodes_by_goals("test_user_goal", ["数据结构与算法"])
      
      nodes = db_get_path_nodes("test_user_goal")
      assert len(nodes) == 8
      assert nodes[0].title == "自定义大纲1"
      
      # Cleanup
      conn = sqlite3.connect(DB_PATH)
      cursor = conn.cursor()
      cursor.execute("DELETE FROM user_path_nodes WHERE username = 'test_user_goal'")
      cursor.execute("DELETE FROM registered_courses WHERE course_id = 'data_structures'")
      conn.commit()
      conn.close()
  ```

- [ ] **Step 2: 运行大纲 Seeding 测试验证失败**
  `pytest tests/test_db.py -k test_dynamic_sync_path_nodes_by_goals -v`
  预期输出：FAIL

- [ ] **Step 3: 实现大纲 Seeding 数据库动态拉取**
  在 `backend/app/db.py` 中更新 `db_sync_path_nodes_by_goals` 实现：
  ```python
  def db_sync_path_nodes_by_goals(username: str, goals: List[str]):
      if not goals:
          return
      goal = goals[0]
      
      conn = sqlite3.connect(DB_PATH)
      cursor = conn.cursor()
      cursor.execute("SELECT count(*) FROM user_path_nodes WHERE username = ?", (username,))
      count = cursor.fetchone()[0]
      
      # Find course by id or display name
      cursor.execute("SELECT nodes, course_id FROM registered_courses WHERE course_id = ? OR display_name = ?", (goal, goal))
      row = cursor.fetchone()
      
      # Fallback to keyword match
      if not row:
          from app.knowledge_base import clean_subject_name
          matched_id = clean_subject_name(goal)
          cursor.execute("SELECT nodes, course_id FROM registered_courses WHERE course_id = ?", (matched_id,))
          row = cursor.fetchone()
          
      conn.close()
      
      if row:
          nodes_json, course_id = row
          nodes_data = json.loads(nodes_json)
          nodes_to_seed = [PathNode(**n) for n in nodes_data]
          
          if count != 8:
              db_save_path_nodes(username, nodes_to_seed)
          else:
              existing = db_get_path_nodes(username)
              if existing and existing[0].title != nodes_to_seed[0].title:
                  db_save_path_nodes(username, nodes_to_seed)
  ```

- [ ] **Step 4: 运行测试验证成功**
  `pytest tests/test_db.py -k test_dynamic_sync_path_nodes_by_goals -v`
  预期输出：PASS

- [ ] **Step 5: 提交代码**
  `git add backend/app/db.py backend/tests/test_db.py && git commit -m "feat(kb): seed user path nodes dynamically from registered courses"`

---

### Task 5: 前端注册登录页动态拉取课程

**Files:**
- Modify: `frontend/src/components/auth/AuthView.jsx` (动态请求 `/api/kb/courses` 替换硬编码的卡片列表)

- [ ] **Step 1: 引入挂载加载接口逻辑**
  在 `AuthView.jsx` 头部引入 `apiGet`：
  ```javascript
  import { apiPost, apiGet } from '../../utils/api';
  ```
  在 `AuthView` 组件中，新增 `availableCourses` 状态，并使用 `useEffect` 在挂载时动态获取课程列表并重置初始目标：
  ```javascript
    const [availableCourses, setAvailableCourses] = useState([]);
  
    React.useEffect(() => {
      const fetchCourses = async () => {
        try {
          const data = await apiGet('/kb/courses');
          setAvailableCourses(data);
          if (data && data.length > 0) {
            setRegLearningGoal(data[0].display_name);
          }
        } catch (err) {
          console.error("Failed to load dynamic courses:", err);
          // Fallback static defaults
          setAvailableCourses([
            { course_id: 'python_basics', display_name: 'Python Basics' },
            { course_id: 'machine_learning', display_name: 'Machine Learning' }
          ]);
        }
      };
      fetchCourses();
    }, []);
  ```

- [ ] **Step 2: 动态渲染选择卡片**
  定位至 `AuthView.jsx` 中 `Learning Goal Selector` 的渲染代码，将其改写为 `map` 渲染：
  ```javascript
              {/* Learning Goal Selector */}
              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">学习目标主题</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {availableCourses.map(course => (
                    <div
                      key={course.course_id}
                      className="cyber-card"
                      style={{
                        flex: '1 1 calc(50% - 10px)',
                        padding: '12px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: regLearningGoal === course.display_name ? 'rgba(15, 118, 110, 0.05)' : 'var(--bg-card-solid)',
                        borderColor: regLearningGoal === course.display_name ? 'var(--primary-neon)' : 'var(--border-neon)',
                        fontSize: '13px',
                        fontWeight: '700',
                        minWidth: '140px'
                      }}
                      onClick={() => setRegLearningGoal(course.display_name)}
                    >
                      {course.display_name}
                    </div>
                  ))}
                </div>
              </div>
  ```

- [ ] **Step 3: 运行生产环境打包，确保前端无 TS/JSX 语法错误**
  在 `frontend/` 目录运行：
  `npm run build`
  预期输出：Built successfully

- [ ] **Step 4: 提交代码**
  `git add frontend/src/components/auth/AuthView.jsx && git commit -m "feat(frontend): load available courses dynamically from backend API in AuthView"`

---

### Task 6: 前端管理面板新增“高等教育课程”配置后台

**Files:**
- Modify: `frontend/src/components/dashboard/SettingsView.jsx` (添加 Tab 及课程大纲注册管理面板)

- [ ] **Step 1: 新增菜单项与界面控制状态**
  在 `SettingsView.jsx` 中新增 Tab 状态：
  `const [activeSubTab, setActiveSubTab] = useState('providers');`（已有状态，用于判断标签激活）。
  新增课程相关的状态变量：
  ```javascript
    const [courses, setCourses] = useState([]);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [newCourse, setNewCourse] = useState({
      course_id: '',
      display_name: '',
      keywords_raw: '',
      description: '',
      nodes: Array.from({ length: 8 }, (_, i) => ({
        id: `node${i + 1}`,
        title: '',
        description: '',
        resources: ['pdf', 'code', 'slide', 'video', 'quiz']
      }))
    });
  ```

- [ ] **Step 2: 挂载加载与生命周期钩子**
  在 `fetchSettings` 中同步获取课程列表：
  ```javascript
    const fetchSettings = async () => {
      try {
        const provs = await apiGet('/settings/providers');
        setProviders(provs);
        const rout = await apiGet('/settings/routing');
        setRouting(rout);
        const kbCourses = await apiGet('/kb/courses');
        setCourses(kbCourses);
      } catch (err) {
        console.error('Failed to load settings:', err);
        setErrorMessage('加载配置信息失败，请稍后重试。');
      }
    };
  ```

- [ ] **Step 3: 编写添加与删除接口触发器**
  在 `SettingsView.jsx` 中追加如下动作方法：
  ```javascript
    const handleRegisterCourse = async (e) => {
      e.preventDefault();
      try {
        // Validation check
        if (!/^[a-zA-Z0-9_]+$/.test(newCourse.course_id)) {
          await showCustomAlert('学科代码仅限英文字母、数字和下划线！');
          return;
        }
        
        const payload = {
          course_id: newCourse.course_id,
          display_name: newCourse.display_name,
          keywords: newCourse.keywords_raw.split(',').map(k => k.trim()).filter(Boolean),
          description: newCourse.description,
          nodes: newCourse.nodes
        };
        
        await apiPost('/kb/courses', payload);
        setShowCourseModal(false);
        fetchSettings();
      } catch (err) {
        await showCustomAlert('添加课程失败: ' + err.message);
      }
    };
  
    const handleDeleteCourse = async (courseId) => {
      if (['python_basics', 'machine_learning'].includes(courseId)) {
        await showCustomAlert('系统内置核心课程无法删除。');
        return;
      }
      const confirmed = await showCustomConfirm('您确定要彻底删除该课程及其所有大纲大点配置吗？此操作无法恢复。');
      if (!confirmed) return;
      
      try {
        await apiDelete(`/kb/courses/${courseId}`);
        fetchSettings();
      } catch (err) {
        await showCustomAlert('删除课程失败: ' + err.message);
      }
    };
  ```

- [ ] **Step 4: 渲染左侧 Tab 导航项**
  在 `SettingsView.jsx` 侧边栏中追加“高等教育课程”入口（位于默认模型绑定下方）：
  ```javascript
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '16px 12px 6px' }}>知识库管理</span>
            <button
              onClick={() => setActiveSubTab('courses')}
              className={`cyber-nav-tab ${activeSubTab === 'courses' ? 'active' : ''}`}
              style={{ width: '100%', textAlign: 'left', cursor: 'pointer', outline: 'none' }}
            >
              <Database size={16} />
              <span style={{ fontSize: '13px' }}>高等教育课程</span>
            </button>
  ```

- [ ] **Step 5: 渲染“courses”管理面板与注册表单 Modal**
  在面板右侧添加 Tab 视图：
  ```javascript
            {/* TAB 3: COURSES */}
            {activeSubTab === 'courses' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px' }}>高等教育学科管理后台</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>您可以注册新的专业科目并为其编排 8 个自适应大纲关卡，大模型将自动为新路径拉取 RAG 物理文档切片。</p>
                  </div>
                  <button onClick={() => setShowCourseModal(true)} className="cyber-btn" style={{ padding: '8px 16px', fontSize: '12px' }}>
                    <Plus size={14} style={{ marginRight: '6px' }} /> 注册新学科
                  </button>
                </div>
  
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {courses.map(c => (
                    <div key={c.course_id} className="cyber-card" style={{ background: 'var(--bg-card-glass)', padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <strong style={{ fontSize: '15px', color: '#fff' }}>{c.display_name}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: '10px', fontFamily: 'monospace' }}>[{c.course_id}]</span>
                        </div>
                        {!['python_basics', 'machine_learning'].includes(c.course_id) && (
                          <button onClick={() => handleDeleteCourse(c.course_id)} className="cyber-btn" style={{ padding: '4px 8px', background: 'rgba(190,18,60,0.08)', borderColor: 'rgba(190,18,60,0.2)', color: 'var(--danger)', fontSize: '11px' }}>
                            <Trash2 size={12} style={{ marginRight: '4px' }} /> 删除
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>{c.description}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {c.keywords.map((kw, idx) => (
                          <span key={idx} className="neon-badge neon-badge-primary" style={{ fontSize: '10px' }}>{kw}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
  ```
  在文件最后追加 `showCourseModal` 表单弹窗代码（限制 ID 规则、并遍历渲染 8 行关卡 input 元件以允许老师编辑 1~8 关卡的 title 和 description）。

- [ ] **Step 6: 前端运行打包检验**
  在 `frontend/` 目录运行：
  `npm run build`
  预期输出：Vite build complete with no syntax errors.

- [ ] **Step 7: 提交代码**
  `git add frontend/src/components/dashboard/SettingsView.jsx && git commit -m "feat(frontend): implement course syllabus settings tab with course add/delete actions"`
