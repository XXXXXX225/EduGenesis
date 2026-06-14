import { useState } from 'react';
import { apiPost } from '../utils/api';

export function useQuiz({
  profile,
  setProfile,
  selectedNode,
  setSelectedNode,
  setPathNodes,
  setProfileAlert,
  setDiagnosticLogs
}) {
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizStep, setQuizStep] = useState('intro'); // 'intro' | 'question' | 'completed'
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [quizQuestionIdx, setQuizQuestionIdx] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState('');

  const handleCompleteQuiz = async (score, total) => {
    const wrongCount = total - score;
    const accuracy = Math.round((score / total) * 100);
    const passed = accuracy >= 60;

    const updatedStats = {
      ...profile.learning_stats,
      study_time: (profile.learning_stats?.study_time || 45) + 10,
      quiz_accuracy: Math.round(((profile.learning_stats?.quiz_accuracy || 80) + accuracy) / 2)
    };

    const updatedProfile = {
      ...profile,
      knowledge_base: Math.max(10, profile.knowledge_base - (wrongCount > 0 ? wrongCount * 4 : -5)),
      engagement: Math.min(100, profile.engagement + 5),
      learning_stats: updatedStats
    };

    try {
      const newData = await apiPost('/profile', updatedProfile);
      setProfile(newData);

      if (passed && selectedNode) {
        const pathData = await apiPost('/path/complete-node', {
          node_id: selectedNode.id
        });
        setPathNodes(pathData.nodes);

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
      } else {
        setProfileAlert("自适应测验已完成！答题指标已同步更新到您的画像。但由于正确率未达标（要求 60%），关卡未能晋级，建议重新阅读课本后重试。");
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
    handleCompleteQuiz
  };
}
