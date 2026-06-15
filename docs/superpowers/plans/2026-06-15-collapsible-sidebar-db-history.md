# Collapsible Left Sidebar & Database Chat History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a database-backed multi-session chat history system and a collapsible left sidebar containing chat history navigation and advanced adaptive tutor console controls.

**Architecture:** Extend the backend SQLite database with `chat_sessions` and `chat_messages` tables, add FastAPI routes to perform CRUD operations on sessions and retrieve messages, update the frontend React AppContext/useChat hooks to manage multi-session states, and adapt the CSS layout grid to introduce a sliding collapsible panel.

**Tech Stack:** React, CSS Grid (Vanilla CSS), GSAP/Lucide Icons, FastAPI (Python), SQLite3

---

### Task 1: Backend Database Changes

**Files:**
- Modify: `backend/app/db.py`
- Create: `backend/tests/test_chat_history.py`

- [ ] **Step 1: Create the new tables in `backend/app/db.py`**
  Open [db.py](file:///e:/AIproject/EduGenesis/backend/app/db.py) and modify both `init_db()` functions (around lines 662-767 and lines 1287-1392) to add table creation for `chat_sessions` and `chat_messages` tables.

  ```python
  # Add this right before the "# Seed default user" section in both init_db() functions
  
  # Chat Sessions Table
  cursor.execute("""
  CREATE TABLE IF NOT EXISTS chat_sessions (
      session_id TEXT PRIMARY KEY,
      username TEXT,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (username) REFERENCES users(username)
  )
  """)
  
  # Chat Messages Table
  cursor.execute("""
  CREATE TABLE IF NOT EXISTS chat_messages (
      message_id TEXT PRIMARY KEY,
      session_id TEXT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id)
  )
  """)
  ```

- [ ] **Step 2: Add database CRUD helper functions to `backend/app/db.py`**
  At the end of [db.py](file:///e:/AIproject/EduGenesis/backend/app/db.py) (around line 1637), add the following CRUD helper functions:

  ```python
  def db_create_chat_session(username: str, session_id: str, title: str) -> None:
      conn = sqlite3.connect(DB_PATH)
      cursor = conn.cursor()
      now_str = datetime.datetime.now().isoformat()
      cursor.execute(
          "INSERT INTO chat_sessions (session_id, username, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
          (session_id, username, title, now_str, now_str)
      )
      conn.commit()
      conn.close()

  def db_get_chat_sessions(username: str) -> list:
      conn = sqlite3.connect(DB_PATH)
      cursor = conn.cursor()
      cursor.execute(
          "SELECT session_id, username, title, created_at, updated_at FROM chat_sessions WHERE username = ? ORDER BY updated_at DESC",
          (username,)
      )
      rows = cursor.fetchall()
      conn.close()
      return [
          {
              "session_id": r[0],
              "username": r[1],
              "title": r[2],
              "created_at": r[3],
              "updated_at": r[4]
          }
          for r in rows
      ]

  def db_update_chat_session_title(session_id: str, title: str) -> None:
      conn = sqlite3.connect(DB_PATH)
      cursor = conn.cursor()
      now_str = datetime.datetime.now().isoformat()
      cursor.execute(
          "UPDATE chat_sessions SET title = ?, updated_at = ? WHERE session_id = ?",
          (title, now_str, session_id)
      )
      conn.commit()
      conn.close()

  def db_delete_chat_session(session_id: str) -> None:
      conn = sqlite3.connect(DB_PATH)
      cursor = conn.cursor()
      cursor.execute("DELETE FROM chat_sessions WHERE session_id = ?", (session_id,))
      cursor.execute("DELETE FROM chat_messages WHERE session_id = ?", (session_id,))
      conn.commit()
      conn.close()

  def db_clear_chat_sessions(username: str) -> None:
      conn = sqlite3.connect(DB_PATH)
      cursor = conn.cursor()
      cursor.execute("SELECT session_id FROM chat_sessions WHERE username = ?", (username,))
      session_ids = [r[0] for r in cursor.fetchall()]
      for session_id in session_ids:
          cursor.execute("DELETE FROM chat_messages WHERE session_id = ?", (session_id,))
      cursor.execute("DELETE FROM chat_sessions WHERE username = ?", (username,))
      conn.commit()
      conn.close()

  def db_save_chat_message(session_id: str, message_id: str, role: str, content: str) -> None:
      conn = sqlite3.connect(DB_PATH)
      cursor = conn.cursor()
      now_str = datetime.datetime.now().isoformat()
      cursor.execute(
          "INSERT INTO chat_messages (message_id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",
          (message_id, session_id, role, content, now_str)
      )
      cursor.execute(
          "UPDATE chat_sessions SET updated_at = ? WHERE session_id = ?",
          (now_str, session_id)
      )
      conn.commit()
      conn.close()

  def db_get_chat_messages(session_id: str) -> list:
      conn = sqlite3.connect(DB_PATH)
      cursor = conn.cursor()
      cursor.execute(
          "SELECT message_id, session_id, role, content, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC",
          (session_id,)
      )
      rows = cursor.fetchall()
      conn.close()
      return [
          {
              "message_id": r[0],
              "session_id": r[1],
              "role": r[2],
              "content": r[3],
              "created_at": r[4]
          }
          for r in rows
      ]
  ```

- [ ] **Step 3: Write tests for database helpers in `backend/tests/test_chat_history.py`**
  Create [test_chat_history.py](file:///e:/AIproject/EduGenesis/backend/tests/test_chat_history.py) with the following content:

  ```python
  import pytest
  from app.db import (
      init_db,
      db_create_chat_session,
      db_get_chat_sessions,
      db_update_chat_session_title,
      db_delete_chat_session,
      db_clear_chat_sessions,
      db_save_chat_message,
      db_get_chat_messages
  )

  def test_chat_history_operations():
      init_db()
      # Clean up potential test residue
      db_clear_chat_sessions("test_user_history")
      
      # 1. Create session
      db_create_chat_session("test_user_history", "test-session-id-1", "Test Title 1")
      sessions = db_get_chat_sessions("test_user_history")
      assert len(sessions) == 1
      assert sessions[0]["title"] == "Test Title 1"

      # 2. Update title
      db_update_chat_session_title("test-session-id-1", "Updated Title 1")
      sessions = db_get_chat_sessions("test_user_history")
      assert sessions[0]["title"] == "Updated Title 1"

      # 3. Save messages
      db_save_chat_message("test-session-id-1", "m1", "user", "Hello tutor")
      db_save_chat_message("test-session-id-1", "m2", "assistant", "Hello student")
      messages = db_get_chat_messages("test-session-id-1")
      assert len(messages) == 2
      assert messages[0]["role"] == "user"
      assert messages[1]["content"] == "Hello student"

      # 4. Delete session
      db_delete_chat_session("test-session-id-1")
      sessions = db_get_chat_sessions("test_user_history")
      assert len(sessions) == 0
      messages = db_get_chat_messages("test-session-id-1")
      assert len(messages) == 0
  ```

- [ ] **Step 4: Run database tests to verify**
  Run command in `backend/`:
  `python -m pytest tests/test_chat_history.py`
  Expected: 1 passed.

- [ ] **Step 5: Commit changes**
  Run commands:
  ```bash
  git add backend/app/db.py backend/tests/test_chat_history.py
  git commit -m "feat: add database tables and helpers for chat history"
  ```

---

### Task 2: Backend API Endpoints

**Files:**
- Modify: `backend/app/models.py`
- Modify: `backend/app/routes/chat.py`

- [ ] **Step 1: Update ChatRequest model in `backend/app/models.py`**
  Modify [models.py](file:///e:/AIproject/EduGenesis/backend/app/models.py) to update `ChatRequest`:

  ```python
  # Around line 22:
  class ChatRequest(BaseModel):
      messages: List[UserMessage] = Field(..., description="Conversation history")
      current_profile: Optional[UserProfile] = Field(default=None, description="Current student profile status")
      session_id: Optional[str] = Field(default=None, description="Optional chat session ID to save messages")
      tutor_personality: Optional[str] = Field(default=None, description="Optional tutor personality style")
  ```

- [ ] **Step 2: Add API routes and database saves in `backend/app/routes/chat.py`**
  Open [chat.py](file:///e:/AIproject/EduGenesis/backend/app/routes/chat.py):
  1. Add imports at the top:
     ```python
     import uuid
     import datetime
     from app.db import (
         db_create_chat_session,
         db_get_chat_sessions,
         db_update_chat_session_title,
         db_delete_chat_session,
         db_clear_chat_sessions,
         db_save_chat_message,
         db_get_chat_messages
     )
     ```
  2. Implement new API endpoints:
     ```python
     @router.get("/chat/sessions")
     async def get_sessions(current_username: str = Depends(get_current_username)):
         return db_get_chat_sessions(current_username)

     @router.post("/chat/sessions")
     async def create_session(request: dict, current_username: str = Depends(get_current_username)):
         session_id = request.get("session_id") or str(uuid.uuid4())
         title = request.get("title") or "新对话"
         db_create_chat_session(current_username, session_id, title)
         return {"session_id": session_id, "title": title}

     @router.put("/chat/sessions/{session_id}")
     async def update_session(session_id: str, request: dict, current_username: str = Depends(get_current_username)):
         title = request.get("title", "未命名会话")
         db_update_chat_session_title(session_id, title)
         return {"status": "success"}

     @router.delete("/chat/sessions/{session_id}")
     async def delete_session(session_id: str, current_username: str = Depends(get_current_username)):
         db_delete_chat_session(session_id)
         return {"status": "success"}

     @router.delete("/chat/sessions")
     async def clear_sessions(current_username: str = Depends(get_current_username)):
         db_clear_chat_sessions(current_username)
         return {"status": "success"}

     @router.get("/chat/sessions/{session_id}/messages")
     async def get_session_messages(session_id: str, current_username: str = Depends(get_current_username)):
         return db_get_chat_messages(session_id)
     ```
  3. Modify `/chat` endpoint logic to support `session_id` and personality selection:
     - Save user message to the DB at the start of `/chat`:
       ```python
       # inside event_generator() before yielding status:
       now_ts = datetime.datetime.now().isoformat()
       if request.session_id and request.messages:
           user_msg = request.messages[-1]
           db_save_chat_message(
               session_id=request.session_id,
               message_id=f"user-{now_ts}-{str(uuid.uuid4())[:8]}",
               role="user",
               content=user_msg.content
           )
           
           # Automatically rename the session title if it's currently "新对话" and this is the first message
           sessions = db_get_chat_sessions(target_user)
           current_sess = next((s for s in sessions if s["session_id"] == request.session_id), None)
           if current_sess and current_sess["title"] == "新对话":
               new_title = user_msg.content[:15] + ("..." if len(user_msg.content) > 15 else "")
               db_update_chat_session_title(request.session_id, new_title)
       ```
     - Accumulate generated content and save assistant message to DB:
       ```python
       # inside event_generator():
       assistant_chunks = []
       
       # Modify where you yield 'content' data (both LLM client streaming and fallback simulator):
       # In LLM stream:
       yield f"data: {json.dumps({'type': 'content', 'content': delta['content']})}\n\n"
       assistant_chunks.append(delta['content'])
       
       # In simulator:
       yield f"data: {json.dumps({'type': 'content', 'content': chunk})}\n\n"
       assistant_chunks.append(chunk)
       
       # Right before yielding "done" at the end of the generator:
       if request.session_id and assistant_chunks:
           full_reply = "".join(assistant_chunks)
           now_ts = datetime.datetime.now().isoformat()
           db_save_chat_message(
               session_id=request.session_id,
               message_id=f"assistant-{now_ts}-{str(uuid.uuid4())[:8]}",
               role="assistant",
               content=full_reply
           )
       ```
     - Support `request.tutor_personality` in LLM prompts (optional personality context: append prompt context if academic/encouraging/coder style).

- [ ] **Step 3: Test endpoints with `pytest`**
  Modify/run python backend test files to verify uvicorn routes can compile.
  Run: `python -m pytest tests/test_auth.py`

- [ ] **Step 4: Commit changes**
  Run commands:
  ```bash
  git add backend/app/models.py backend/app/routes/chat.py
  git commit -m "feat: implement FastAPI session endpoints and autowrite messages"
  ```

---

### Task 3: Frontend AppContext & State Sync

**Files:**
- Modify: `frontend/src/context/AppContext.jsx`

- [ ] **Step 1: Add new state variables and handlers to AppContext**
  Open [AppContext.jsx](file:///e:/AIproject/EduGenesis/frontend/src/context/AppContext.jsx).
  1. Add new state hooks inside `AppProvider`:
     ```javascript
     // Around line 80:
     const [chatSessions, setChatSessions] = useState([]);
     const [currentSessionId, setCurrentSessionId] = useState(null);
     const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(() => {
       const saved = localStorage.getItem('isLeftSidebarOpen');
       return saved !== 'false'; // default true
     });
     const [tutorPersonality, setTutorPersonality] = useState(() => {
       return localStorage.getItem('tutorPersonality') || 'academic';
     });

     useEffect(() => {
       localStorage.setItem('isLeftSidebarOpen', isLeftSidebarOpen);
     }, [isLeftSidebarOpen]);

     useEffect(() => {
       localStorage.setItem('tutorPersonality', tutorPersonality);
     }, [tutorPersonality]);
     ```
  2. Implement backend sync helpers inside `AppProvider`:
     ```javascript
     const loadChatSessions = async () => {
       try {
         const data = await apiGet('/chat/sessions');
         setChatSessions(data);
         if (data.length > 0 && !currentSessionId) {
           // Set the latest active session as current
           const latestSessionId = data[0].session_id;
           setCurrentSessionId(latestSessionId);
           await loadSessionMessages(latestSessionId);
         } else if (data.length === 0) {
           // If no sessions exist, start a default one
           await startNewChat();
         }
       } catch (err) {
         console.warn("Failed to load chat sessions from server:", err);
       }
     };

     const loadSessionMessages = async (sessionId) => {
       try {
         const data = await apiGet(`/chat/sessions/${sessionId}/messages`);
         if (data.length > 0) {
           chatHook.setChatHistory(data.map(m => ({
             role: m.role,
             content: m.content
           })));
         } else {
           chatHook.setChatHistory([
             { role: 'assistant', content: '您好！我是您的个性化学习助教。我会根据我们的对话动态构建您的学习画像，并定制专属的学习路径。你可以告诉我你的编程水平，或者发送“我想学机器学习”来调整内容。' }
           ]);
         }
       } catch (err) {
         console.warn(`Failed to fetch messages for session ${sessionId}:`, err);
       }
     };

     const startNewChat = async () => {
       const newSessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
       try {
         const newSess = await apiPost('/chat/sessions', {
           session_id: newSessionId,
           title: '新对话'
         });
         setChatSessions(prev => [newSess, ...prev]);
         setCurrentSessionId(newSessionId);
         chatHook.setChatHistory([
           { role: 'assistant', content: '您好！我是您的个性化学习助教。我会根据我们的对话动态构建您的学习画像，并定制专属的学习路径。你可以告诉我你的编程水平，或者发送“我想学机器学习”来调整内容。' }
         ]);
       } catch (err) {
         console.error("Failed to create new session:", err);
       }
     };

     const deleteSession = async (sessionId) => {
       try {
         await apiPost(`/chat/sessions/${sessionId}`, {}, 'DELETE'); // using customized delete
         setChatSessions(prev => {
           const updated = prev.filter(s => s.session_id !== sessionId);
           if (currentSessionId === sessionId) {
             if (updated.length > 0) {
               const nextSess = updated[0].session_id;
               setCurrentSessionId(nextSess);
               loadSessionMessages(nextSess);
             } else {
               // Started empty default
               setTimeout(() => startNewChat(), 100);
             }
           }
           return updated;
         });
       } catch (err) {
         console.error(`Failed to delete session ${sessionId}:`, err);
       }
     };

     const renameSession = async (sessionId, newTitle) => {
       if (!newTitle.trim()) return;
       try {
         await apiPost(`/chat/sessions/${sessionId}`, { title: newTitle }, 'PUT');
         setChatSessions(prev => prev.map(s => {
           if (s.session_id === sessionId) {
             return { ...s, title: newTitle };
           }
           return s;
         }));
       } catch (err) {
         console.error(`Failed to rename session ${sessionId}:`, err);
       }
     };

     const clearAllSessions = async () => {
       try {
         await apiPost('/chat/sessions', {}, 'DELETE');
         setChatSessions([]);
         setCurrentSessionId(null);
         startNewChat();
       } catch (err) {
         console.error("Failed to clear sessions:", err);
       }
     };
     ```
  3. Load the session history when the page loads (refresh recovery) in the main `useEffect`:
     ```javascript
     // Update around line 182 inside useEffect:
     useEffect(() => {
       if (isLoggedIn) {
         setIsLoadingDashboard(true);
         Promise.all([
           loadDashboardState(),
           loadChatSessions()
         ]).finally(() => setIsLoadingDashboard(false));
       }
     }, [isLoggedIn]);
     ```
  4. Expose all new states and handlers in the `<AppContext.Provider>` value object (around lines 385-455):
     ```javascript
     chatSessions,
     setChatSessions,
     currentSessionId,
     setCurrentSessionId,
     isLeftSidebarOpen,
     setIsLeftSidebarOpen,
     tutorPersonality,
     setTutorPersonality,
     loadChatSessions,
     loadSessionMessages,
     startNewChat,
     deleteSession,
     renameSession,
     clearAllSessions,
     ```

- [ ] **Step 2: Commit**
  Run command:
  ```bash
  git add frontend/src/context/AppContext.jsx
  git commit -m "feat: add AppContext states and API integration for chat history"
  ```

---

### Task 4: Frontend useChat Hook Update

**Files:**
- Modify: `frontend/src/hooks/useChat.js`

- [ ] **Step 1: Pass current session information inside submitChatMessage**
  Open [useChat.js](file:///e:/AIproject/EduGenesis/frontend/src/hooks/useChat.js).
  In `submitChatMessage`:
  Modify the `/chat` api call (around line 99) to include `session_id` and `tutor_personality` in the body payload.
  Since `useChat` runs within the AppContext Provider but hook values are loaded before, we should extract `currentSessionId` and `tutorPersonality` dynamically.
  Wait, let's look at how `useChat` receives arguments:
  `export function useChat({ profile, setProfile, setProfileAlert, setPathNodes, setDiagnosticLogs })`
  Wait, we can pass `currentSessionIdRef` or get it from parameters!
  Let's add `currentSessionId` and `tutorPersonality` as dynamic params to `useChat` or pass it directly in the hook declaration:
  ```javascript
  // Around line 4:
  export function useChat({ profile, setProfile, setProfileAlert, setPathNodes, setDiagnosticLogs, currentSessionId, tutorPersonality, chatSessions, setChatSessions })
  ```
  Wait! Let's modify `submitChatMessage` to pass `session_id` and `tutor_personality` to backend:
  ```javascript
  // In useChat.js around line 99:
  await apiSSEStream('/chat', {
    messages: [...chatHistory, userMessage],
    current_profile: profile,
    session_id: currentSessionId,
    tutor_personality: tutorPersonality
  }, (data) => {
    ...
  ```
  And if the user message changes the title of the session, we should sync the local sessions state.
  ```javascript
  // inside SSE handler on 'content' or 'done':
  // If the session was named "新对话", the backend renamed it. Let's refresh sessions state
  if (data.type === 'content' && chatHistory[chatHistory.length - 1].content === '') {
    // If it was the first message in the session (after welcome msg), update local sessions list title
    if (chatHistory.length === 2 && chatSessions && setChatSessions) {
      const firstMsg = chatHistory[0].content;
      const shortenedTitle = firstMsg.slice(0, 15) + (firstMsg.length > 15 ? '...' : '');
      setChatSessions(prev => prev.map(s => s.session_id === currentSessionId ? { ...s, title: shortenedTitle } : s));
    }
  }
  ```
  Wait, to get the newest session list if renamed, we can simply fetch `/chat/sessions` when stream is `done`. Let's trigger a `loadChatSessions` or refresh the session title in the client:
  ```javascript
  // in SSE done branch:
  if (data.type === 'done') {
    isStreamActiveRef.current = false;
    // We can run a small fetch to refresh session titles
    if (currentSessionId && chatSessions && setChatSessions) {
      // Find current session. If title is '新对话', rename locally
      const currentSess = chatSessions.find(s => s.session_id === currentSessionId);
      if (currentSess && currentSess.title === '新对话') {
        const userMsg = chatHistory[chatHistory.length - 2]?.content || '对话';
        const newTitle = userMsg.slice(0, 15) + (userMsg.length > 15 ? '...' : '');
        setChatSessions(prev => prev.map(s => s.session_id === currentSessionId ? { ...s, title: newTitle } : s));
      }
    }
  }
  ```
  Wait, let's also pass these new arguments into `useChat` call in `AppContext.jsx` (around line 116):
  ```javascript
  // in AppContext.jsx:
  const chatHook = useChat({ 
    profile, 
    setProfile, 
    setProfileAlert, 
    setPathNodes, 
    setDiagnosticLogs,
    currentSessionId,
    tutorPersonality,
    chatSessions,
    setChatSessions
  });
  ```

- [ ] **Step 2: Commit changes**
  Run commands:
  ```bash
  git add frontend/src/hooks/useChat.js frontend/src/context/AppContext.jsx
  git commit -m "feat: wire useChat submitChatMessage with currentSessionId"
  ```

---

### Task 5: Frontend Layout & Left Sidebar UI

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Update grid layout in `frontend/src/index.css`**
  Modify [index.css](file:///e:/AIproject/EduGenesis/frontend/src/index.css) around line 1417 to support collapsible columns:

  ```css
  .agent-body {
    display: grid;
    grid-template-columns: var(--left-sidebar-width, 260px) 1fr 4px var(--sidebar-width, 340px);
    height: calc(100vh - 72px);
    width: 100vw;
    overflow: hidden;
    transition: grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* Collapsible Left Panel Styles */
  .agent-panel-left-collapsible {
    width: var(--left-sidebar-width, 260px);
    border-right: 1px solid rgba(0, 0, 0, 0.06);
    background: rgba(245, 243, 237, 0.55);
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-right-color 0.3s ease, padding 0.3s ease;
    flex-shrink: 0;
    box-sizing: border-box;
    position: relative;
  }
  
  .dark-mode .agent-panel-left-collapsible {
    background: rgba(10, 15, 30, 0.45);
    border-right: 1px solid rgba(255, 255, 255, 0.06);
  }
  
  /* History list items */
  .history-session-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 13px;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    margin-bottom: 6px;
    user-select: none;
  }
  
  .history-session-item:hover {
    background: var(--bg-card-active);
    color: var(--text-main);
  }
  
  .history-session-item.active {
    background: var(--bg-card-glass);
    border-color: var(--border-neon);
    color: var(--primary-neon);
    font-weight: 700;
  }

  .history-item-actions {
    display: none;
    align-items: center;
    gap: 8px;
  }

  .history-session-item:hover .history-item-actions {
    display: flex;
  }
  ```

- [ ] **Step 2: Add left sidebar toggle button in header in `frontend/src/App.jsx`**
  Modify [App.jsx](file:///e:/AIproject/EduGenesis/frontend/src/App.jsx):
  1. Import necessary Lucide Icons if missing: `PanelLeftOpen`, `PanelLeftClose`, `Plus`, `Trash2`, `FolderDown`, `FolderUp`, `ChevronDown`, `Settings2`.
  2. Inside `AppContent` header section, render the PanelLeft toggle button on the left of the Logo title:
     ```javascript
     // Around line 447:
     <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
       <button
         onClick={() => setIsLeftSidebarOpen(prev => !prev)}
         style={{
           padding: '8px',
           borderRadius: '10px',
           background: 'var(--bg-card-active)',
           border: '1px solid var(--border-neon)',
           color: 'var(--text-main)',
           cursor: 'pointer',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           transition: 'all 0.3s'
         }}
         title={isLeftSidebarOpen ? "收起侧栏" : "展开侧栏"}
       >
         {isLeftSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
       </button>
       <div style={{ padding: '10px', background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.15) ...
     ```

- [ ] **Step 3: Render Left Sidebar in `.agent-body` in `frontend/src/App.jsx`**
  Modify [App.jsx](file:///e:/AIproject/EduGenesis/frontend/src/App.jsx) (around line 542):
  1. Add `--left-sidebar-width` variables to `.agent-body`:
     ```javascript
     <div 
       className="agent-body" 
       style={{ 
         '--sidebar-width': `${sidebarWidth}px`,
         '--left-sidebar-width': isLeftSidebarOpen ? '260px' : '0px'
       }}
     >
     ```
  2. Render the collapsible left sidebar before the `<main>` tag:
     ```javascript
     {/* Collapsible Left Sidebar */}
     <aside 
       className="agent-panel-left-collapsible"
       style={{
         borderRight: isLeftSidebarOpen ? undefined : 'none',
         padding: isLeftSidebarOpen ? '20px 14px' : '0px'
       }}
     >
       {isLeftSidebarOpen && (
         <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
           {/* Top: New Chat button */}
           <div>
             <button
               onClick={startNewChat}
               className="cyber-btn"
               style={{
                 width: '100%',
                 padding: '12px',
                 borderRadius: '12px',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 gap: '8px',
                 fontSize: '13px',
                 fontWeight: 'bold',
                 marginBottom: '20px'
               }}
             >
               <Plus size={16} /> 开启新对话
             </button>
             
             {/* Middle: Sessions scroll list */}
             <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px', paddingLeft: '4px' }}>
               会话历史
             </div>
             
             <div style={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 430px)', paddingRight: '2px' }}>
               {chatSessions.map((sess) => (
                 <div
                   key={sess.session_id}
                   className={`history-session-item ${currentSessionId === sess.session_id ? 'active' : ''}`}
                   onClick={() => {
                     setCurrentSessionId(sess.session_id);
                     loadSessionMessages(sess.session_id);
                   }}
                 >
                   <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                     💬 {sess.title}
                   </span>
                   <div className="history-item-actions">
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         const newTitle = prompt("输入新标题:", sess.title);
                         if (newTitle) renameSession(sess.session_id, newTitle);
                       }}
                       style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '10px' }}
                       title="重命名"
                     >
                       ✏️
                     </button>
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         if (confirm("确定要删除此对话吗？")) deleteSession(sess.session_id);
                       }}
                       style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '10px' }}
                       title="删除"
                     >
                       🗑️
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           </div>
           
           {/* Bottom: Quick Console panel */}
           <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '15px' }}>
             {/* Character personality select */}
             <div style={{ marginBottom: '12px' }}>
               <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '6px' }}>导师性格设定</div>
               <select
                 value={tutorPersonality}
                 onChange={(e) => setTutorPersonality(e.target.value)}
                 style={{
                   width: '100%',
                   padding: '8px',
                   borderRadius: '8px',
                   background: 'var(--bg-card-active)',
                   border: '1px solid var(--border-neon)',
                   color: 'var(--text-main)',
                   fontSize: '12px',
                   outline: 'none',
                   cursor: 'pointer'
                 }}
               >
                 <option value="academic">🎓 严肃学术风</option>
                 <option value="encouraging">🌟 温暖鼓励风</option>
                 <option value="coder">🤖 极客代码风</option>
               </select>
             </div>

             {/* Shortcut triggers */}
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
               <button
                 onClick={() => {
                   chat.setChatInput("我想学 Python 基础");
                   setTimeout(() => document.querySelector("form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true })), 100);
                 }}
                 style={{ padding: '6px', fontSize: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-neon)', color: 'var(--text-muted)', cursor: 'pointer' }}
               >
                 🐍 Python基础
               </button>
               <button
                 onClick={() => {
                   chat.setChatInput("我想学习机器学习");
                   setTimeout(() => document.querySelector("form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true })), 100);
                 }}
                 style={{ padding: '6px', fontSize: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-neon)', color: 'var(--text-muted)', cursor: 'pointer' }}
               >
                 📈 机器学习
               </button>
             </div>
             
             {/* Clear all and export buttons */}
             <div style={{ display: 'flex', gap: '8px' }}>
               <button
                 onClick={() => {
                   const historyText = chat.chatHistory.map(m => `**${m.role}**: ${m.content}\n`).join('\n');
                   const blob = new Blob([historyText], { type: 'text/markdown' });
                   const url = URL.createObjectURL(blob);
                   const a = document.createElement('a');
                   a.href = url;
                   a.download = `edugenesis-chat-${currentSessionId}.md`;
                   a.click();
                 }}
                 className="cyber-btn"
                 style={{ flex: 1, padding: '6px', fontSize: '11px', textTransform: 'none' }}
               >
                 📤 导出
               </button>
               <button
                 onClick={() => {
                   if (confirm("确定要清空全部会话历史吗？")) clearAllSessions();
                 }}
                 className="cyber-btn"
                 style={{ flex: 1, padding: '6px', fontSize: '11px', textTransform: 'none', background: 'rgba(190, 18, 60, 0.04)', borderColor: 'rgba(190, 18, 60, 0.12)', color: 'var(--danger)' }}
               >
                 🗑️ 清空
               </button>
             </div>
           </div>
         </div>
       )}
     </aside>
     ```

- [ ] **Step 4: Launch local site and verify**
  Run dev server if not already running: `npm run dev` in `frontend/`.
  Open browser to verify left sidebar fold/unfold layout, new chat generation, active session styling, and DB recovery.

- [ ] **Step 5: Commit changes**
  Run commands:
  ```bash
  git add frontend/src/App.jsx frontend/src/index.css
  git commit -m "feat: implement collapsible left sidebar and console UI"
  ```
