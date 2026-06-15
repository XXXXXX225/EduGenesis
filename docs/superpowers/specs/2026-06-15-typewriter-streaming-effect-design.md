# Typewriter Streaming Effect Design Spec

## Goal Description
Improve the chat assistant output experience by replacing the chunk-based rendering with a smooth, character-by-character typewriter streaming animation. When backend responses arrive in large segments (due to model output granularity or network buffering), the frontend typewriter effect will dynamically increase typing speed and chunk sizes to catch up without lagging.

## Proposed Changes

### Frontend Component / Hooks

#### [MODIFY] [useChat.js](file:///e:/AIproject/EduGenesis/frontend/src/hooks/useChat.js)
Modify the `useChat` custom hook to introduce character buffering, streaming lifecycle tracking, and a dynamic typewriter execution loop:
1. **Refs initialization**:
   - `typingTimerRef` (`useRef(null)`): Stores reference to active `setTimeout`.
   - `typingQueueRef` (`useRef([])`): Buffer containing characters received from backend but not yet rendered.
   - `currentTypedTextRef` (`useRef('')`): Tracks accumulated typed content of the active message being printed.
   - `isStreamActiveRef` (`useRef(false)`): Tracks if SSE stream connection is active.
2. **Streaming and Typewriter Integration**:
   - On chat submit: clear queue, text refs, reset timers, and set `isStreamActiveRef.current = true`.
   - On `content` packet: push characters to `typingQueueRef.current` and initialize the typewriter loop if idle.
   - On `done` or `catch` block: set `isStreamActiveRef.current = false`. If queue is empty, terminate streaming state.
3. **Typewriter Loop (`tick` function)**:
   - Calculate delay and step size dynamically based on queue length:
     - `len > 150`: consume up to 6 characters, 5ms delay.
     - `len > 80`: consume up to 4 characters, 10ms delay.
     - `len > 30`: consume up to 2 characters, 15ms delay.
     - Otherwise: consume 1 character, 25ms delay.
   - Append consumed characters to `currentTypedTextRef.current`.
   - Update state via `setChatHistory`.
   - Schedule next step via `setTimeout(tick, delay)`.
   - Terminate when stream is inactive and queue is empty, updating `isStreaming` to `false` and clearing `tutorStatus`.
4. **Cleanup**:
   - Implement `useEffect` unmount handler to clear any outstanding typing timeouts.

## Verification Plan

### Automated Verification
Run frontend tests or verify code compilation using available tools.

### Manual Verification
1. Launch backend server and run frontend dashboard locally.
2. Open chat window, send various prompts (e.g., "我想学 Python 基础" / "测试我的机器学习基础").
3. Observe output:
   - Text streams out character by character smoothly.
   - Blinking cursor aligns perfectly with typewriter printing position.
   - Input and chips remain disabled until typing completely finishes.
   - Verify that when backend returns large chunks, the typing speed dynamically accelerates.
