# Typewriter Streaming Effect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a smooth typewriter streaming animation in the chat interface that dynamically catches up with backend chunk streaming.

**Architecture:** Use `useRef` states in `useChat.js` to buffer incoming characters from SSE, and run a recursive `setTimeout` loop that updates React's `chatHistory` state at a dynamic pace depending on the queue backlog.

**Tech Stack:** React 18 (Vite, Javascript)

---

### Task 1: Initialize Refs and Effect Cleanup in useChat.js

**Files:**
- Modify: `frontend/src/hooks/useChat.js`

- [ ] **Step 1: Import `useRef` and `useEffect` at the top of the file**
  Add imports in `frontend/src/hooks/useChat.js` if they are not already imported.
  ```javascript
  import { useState, useRef, useEffect } from 'react';
  ```

- [ ] **Step 2: Declare reference refs in useChat**
  Declare refs inside `useChat` before `submitChatMessage`:
  ```javascript
  const typingTimerRef = useRef(null);
  const typingQueueRef = useRef([]);
  const currentTypedTextRef = useRef('');
  const isStreamActiveRef = useRef(false);
  ```

- [ ] **Step 3: Add useEffect for timer cleanup**
  Add a cleanup effect in `useChat` to clear the timeout when the context/component unmounts:
  ```javascript
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);
  ```

- [ ] **Step 4: Commit changes**
  ```bash
  git add frontend/src/hooks/useChat.js
  git commit -m "feat(chat): initialize refs and cleanup for typewriter effect"
  ```

---

### Task 2: Implement Dynamic Typewriter Loop (tick function)

**Files:**
- Modify: `frontend/src/hooks/useChat.js`

- [ ] **Step 1: Implement the recursive tick function inside useChat**
  Add the typing loop function `tick` inside the hook. This function consumes characters from the queue at a dynamic rate and updates the state.
  ```javascript
  const startTyping = () => {
    if (typingTimerRef.current) return; // already typing

    const tick = () => {
      if (typingQueueRef.current.length === 0) {
        if (!isStreamActiveRef.current) {
          typingTimerRef.current = null;
          setIsStreaming(false);
          setTutorStatus('');
          return;
        }
        // Stream still active but queue temporarily empty: wait and check again
        typingTimerRef.current = setTimeout(tick, 50);
        return;
      }

      // Dynamic typewriter speed based on queue size
      const queueLength = typingQueueRef.current.length;
      let charsToPop = 1;
      let nextDelay = 25; // default delay in ms

      if (queueLength > 150) {
        charsToPop = Math.min(queueLength, 6);
        nextDelay = 5;
      } else if (queueLength > 80) {
        charsToPop = Math.min(queueLength, 4);
        nextDelay = 10;
      } else if (queueLength > 30) {
        charsToPop = Math.min(queueLength, 2);
        nextDelay = 15;
      }

      let poppedText = '';
      for (let i = 0; i < charsToPop; i++) {
        if (typingQueueRef.current.length > 0) {
          poppedText += typingQueueRef.current.shift();
        }
      }

      currentTypedTextRef.current += poppedText;

      setChatHistory(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1].content = currentTypedTextRef.current;
        }
        return updated;
      });

      typingTimerRef.current = setTimeout(tick, nextDelay);
    };

    typingTimerRef.current = setTimeout(tick, 20);
  };
  ```

- [ ] **Step 2: Commit changes**
  ```bash
  git add frontend/src/hooks/useChat.js
  git commit -m "feat(chat): implement dynamic typewriter tick loop"
  ```

---

### Task 3: Integrate Typewriter Loop with apiSSEStream

**Files:**
- Modify: `frontend/src/hooks/useChat.js`

- [ ] **Step 1: Rewrite submitChatMessage to buffer chunks and trigger typewriter**
  Modify `submitChatMessage` to initialize state, push SSE content to `typingQueueRef`, and manage `isStreamActiveRef.current`.
  Replace the existing stream handling block in `submitChatMessage` with the typewriter integration.
  ```javascript
  const submitChatMessage = async (messageText) => {
    if (isStreaming || !messageText.trim()) return;

    const userMessage = { role: 'user', content: messageText };
    setChatHistory(prev => [...prev, userMessage]);
    setIsStreaming(true);
    setTutorStatus('🧠 [主管智能体] 正在唤醒协同网络...');

    // Clear and reset typewriter state
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    typingQueueRef.current = [];
    currentTypedTextRef.current = '';
    isStreamActiveRef.current = true;

    setChatHistory(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      await apiSSEStream('/chat', {
        messages: [...chatHistory, userMessage],
        current_profile: profile
      }, (data) => {
        if (data.type === 'status') {
          setTutorStatus(data.status);
        } else if (data.type === 'content') {
          // Reset status when content arrives
          setTutorStatus('');
          if (data.content !== null && data.content !== undefined) {
            // Buffer content characters
            const chars = Array.from(data.content);
            typingQueueRef.current.push(...chars);
            // Trigger typewriter loop
            startTyping();
          }
        } else if (data.type === 'profile_update') {
          setProfile(data.profile);
          setProfileAlert('主管智能体已为您同步更新 6 维学习画像！');
          setTimeout(() => setProfileAlert(''), 4000);
          setDiagnosticLogs(prev => [
            ...prev,
            {
              time: new Date().toLocaleTimeString(),
              log: `画像指标变动: 知识库=${data.profile.knowledge_base}%, 节奏=${data.profile.learning_pace}%, 风格=${data.profile.cognitive_style}`
            }
          ]);
        } else if (data.type === 'path_update') {
          setPathNodes(data.nodes);
        } else if (data.type === 'done') {
          isStreamActiveRef.current = false;
        }
      });
    } catch (error) {
      console.error("Connection error:", error);
      isStreamActiveRef.current = false;
      // Abort typewriter and immediately show error
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      setChatHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1].content = '⚠️ 本地后端服务未运行。请打开终端进入 backend/ 目录并运行 `python main.py`，再试一次。';
        return updated;
      });
      setIsStreaming(false);
      setTutorStatus('');
    }
  };
  ```

- [ ] **Step 2: Commit changes**
  ```bash
  git add frontend/src/hooks/useChat.js
  git commit -m "feat(chat): integrate typewriter loop with SSE stream"
  ```

---

## Verification Plan

### Automated Verification
- Run frontend linter to check for syntax errors or imports:
  Run: `npm run lint` inside `frontend/`
  Expected: Command runs successfully with zero warnings/errors in the modified file.

### Manual Verification
1. Run backend server: `python main.py` in `backend/`
2. Run frontend dev server: `npm run dev` in `frontend/`
3. Send prompt "我想学 Python 基础" in chat.
4. Verify:
   - Output letters appear one by one.
   - Text updates seamlessly.
   - Fast SSE bursts (simulated or real) speed up typewriter output automatically.
   - Sending form input and suggestion chips are disabled during the entire typing sequence.
