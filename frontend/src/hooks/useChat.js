import { useState, useRef, useEffect } from 'react';
import { apiSSEStream } from '../utils/api';

export function useChat({ profile, setProfile, setProfileAlert, setPathNodes, setDiagnosticLogs }) {
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

  const submitChatMessage = async (messageText) => {
    if (isStreaming || !messageText.trim()) return;

    const userMessage = { role: 'user', content: messageText };
    setChatHistory(prev => [...prev, userMessage]);
    setIsStreaming(true);
    setTutorStatus('🧠 [主管智能体] 正在唤醒协同网络...');

    let assistantMessageText = '';
    setChatHistory(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      await apiSSEStream('/chat', {
        messages: [...chatHistory, userMessage],
        current_profile: profile
      }, (data) => {
        if (data.type === 'status') {
          setTutorStatus(data.status);
        } else if (data.type === 'content') {
          setTutorStatus('');
          if (data.content !== null && data.content !== undefined) {
            assistantMessageText += data.content;
            setChatHistory(prev => {
              const updated = [...prev];
              updated[updated.length - 1].content = assistantMessageText;
              return updated;
            });
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
          setIsStreaming(false);
          setTutorStatus('');
        }
      });
    } catch (error) {
      console.error("Connection error:", error);
      setChatHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1].content = '⚠️ 本地后端服务未运行。请打开终端进入 backend/ 目录并运行 `python main.py`，再试一次。';
        return updated;
      });
    } finally {
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
