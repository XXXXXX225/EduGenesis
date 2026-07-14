import { useState } from 'react';
import { apiPost } from '../utils/api';

export function useQuiz({
  profile,
  setProfile,
  selectedNode,
  setSelectedNode,
  setPathNodes,
  setProfileAlert,
  setDiagnosticLogs,
  chat
}) {
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizStep, setQuizStep] = useState('intro'); // 'intro' | 'question' | 'completed'
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [quizQuestionIdx, setQuizQuestionIdx] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState('');
  const [lastQuizScore, setLastQuizScore] = useState('');

  const handleCompleteQuiz = async (score, total) => {
    const wrongCount = total - score;
    const accuracy = Math.round((score / total) * 100);
    const passed = accuracy >= 60;

    const updatedStats = {
      ...profile.learning_stats,
      study_time: (profile.learning_stats?.study_time || 45) + 10,
      quiz_accuracy: Math.round(((profile.learning_stats?.quiz_accuracy || 80) + accuracy) / 2)
    };

    const oldReasoning = profile.reasoning !== undefined ? profile.reasoning : 40;
    const reasoningBump = passed ? 5 : -3;
    const newReasoning = Math.min(100, Math.max(10, oldReasoning + reasoningBump));

    const updatedProfile = {
      ...profile,
      knowledge_base: Math.max(10, profile.knowledge_base - (wrongCount > 0 ? wrongCount * 4 : -5)),
      engagement: Math.min(100, profile.engagement + 5),
      reasoning: newReasoning,
      learning_stats: updatedStats
    };

    try {
      setLastQuizScore(`${score}/${total}`);
      const newData = await apiPost('/profile', updatedProfile);
      setProfile(newData);

      if (selectedNode) {
        const pathData = await apiPost('/path/complete-node', {
          node_id: selectedNode.id,
          score: score,
          total: total
        });
        setPathNodes(pathData.nodes);

        if (passed) {
          const currentUpdatedNode = pathData.nodes.find(n => n.id === selectedNode.id);
          if (currentUpdatedNode) {
            setSelectedNode(currentUpdatedNode);
          }
          setProfileAlert("恭喜通关！自适应答题合格，下一阶段关卡及资源已成功解锁。");
          setDiagnosticLogs(prev => [
            ...prev,
            {
              time: new Date().toLocaleTimeString(),
              log: `关卡解锁: 节点 [${selectedNode.title}] 已通关！下一节点已开启。`
            }
          ]);
          if (chat) {
            chat.submitChatMessage(`[系统感知] 学生完成了「${selectedNode?.title || '自适应测评'}」的自适应测评，得分：${score}/${total}，通过！`, 'system');
          }
        } else {
          const extraNodeId = `${selectedNode.id}_extra`;
          const extraNodeObj = pathData.nodes.find(n => n.id === extraNodeId);
          if (extraNodeObj) {
            setSelectedNode(extraNodeObj);
          }
          setProfileAlert("自适应测验完成！由于正确率未达标，路径智能体已为您定制并自动挂载了 [加固关卡]，快去点击加固突破吧！");
          setDiagnosticLogs(prev => [
            ...prev,
            {
              time: new Date().toLocaleTimeString(),
              log: `路径加固: 测验正确率未达标，动态分支 [${selectedNode.title} 强化] 挂载并解锁。`
            }
          ]);
          if (chat) {
            chat.submitChatMessage(`[系统感知] 学生完成了「${selectedNode?.title || '自适应测评'}」的自适应测评，得分：${score}/${total}，未通过。画像智能体已动态挂载加固关卡。`, 'system');
          }
        }
      }

      setTimeout(() => setProfileAlert(''), 5000);
      setDiagnosticLogs(prev => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          log: `测验分析: 答对=${score}/${total}, 正确率=${accuracy}%, 自适应反馈分析计算完成。`
        }
      ]);
    } catch (err) {
      console.error("Failed to update profile and path after quiz:", err);
    }
    setQuizStep('completed');
  };

  return {
    quizAnswers,
    setQuizAnswers,
    quizSubmitted,
    setQuizSubmitted,
    quizStep,
    setQuizStep,
    quizCorrectCount,
    setQuizCorrectCount,
    quizQuestionIdx,
    setQuizQuestionIdx,
    quizFeedback,
    setQuizFeedback,
    handleCompleteQuiz,
    lastQuizScore,
    setLastQuizScore
  };
}
