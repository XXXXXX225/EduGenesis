import { useState, useRef, useEffect } from 'react';
import { apiSSEStream } from '../utils/api';

export function useChat({ profile, setProfile, setProfileAlert, setPathNodes, setDiagnosticLogs, currentSessionId, tutorPersonality, chatSessions, setChatSessions }) {
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: '您好！我是您的个性化学习助教。我会根据我们的对话动态构建您的学习画像，并定制专属的学习路径。你可以告诉我你的编程水平，或者发送“我想学机器学习”来调整内容。' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [tutorStatus, setTutorStatus] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const typingTimerRef = useRef(null);
  const typingQueueRef = useRef([]);
  const currentTypedTextRef = useRef('');
  const isStreamActiveRef = useRef(false);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

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

  const submitChatMessage = async (messageText) => {
    if (isStreaming || !messageText.trim()) return;

    const userMessage = { role: 'user', content: messageText };
    setChatHistory(prev => [...prev, userMessage]);
    setIsStreaming(true);
    setTutorStatus('[主管智能体] 正在唤醒协同网络...');

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
        current_profile: profile,
        session_id: currentSessionId,
        tutor_personality: tutorPersonality
      }, (data) => {
        if (data.type === 'status') {
          setTutorStatus(data.status);
        } else if (data.type === 'content') {
          setTutorStatus('');
          if (data.content !== null && data.content !== undefined) {
            const chars = Array.from(data.content);
            typingQueueRef.current.push(...chars);
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
          if (currentSessionId && chatSessions && setChatSessions) {
            const currentSess = chatSessions.find(s => s.session_id === currentSessionId);
            if (currentSess && currentSess.title === '新对话') {
              // Retrieve the user message we just sent (which is the second-to-last item since assistant empty bubble is appended)
              const userMsg = messageText || chatHistory[chatHistory.length - 2]?.content || '对话';
              const newTitle = userMsg.slice(0, 15) + (userMsg.length > 15 ? '...' : '');
              setChatSessions(prev => prev.map(s => s.session_id === currentSessionId ? { ...s, title: newTitle } : s));
            }
          }
        }
      });
    } catch (error) {
      console.error("Connection error:", error);
      isStreamActiveRef.current = false;
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      setChatHistory(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1].content = '[警告] 本地后端服务未运行。请打开终端进入 backend/ 目录并运行 `python main.py`，再试一次。';
        }
        return updated;
      });
      setIsStreaming(false);
      setTutorStatus('');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isStreaming) return;
    submitChatMessage(chatInput);
    setChatInput('');
  };

  return {
    chatHistory,
    setChatHistory,
    chatInput,
    setChatInput,
    tutorStatus,
    setTutorStatus,
    isStreaming,
    submitChatMessage,
    handleSendMessage
  };
}
