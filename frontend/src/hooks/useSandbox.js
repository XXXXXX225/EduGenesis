import { useState } from 'react';
import { apiGet, apiPost } from '../utils/api';

export function useSandbox({
  setProfile,
  setPathNodes,
  setSelectedNode,
  setProfileAlert,
  setDiagnosticLogs,
  chat
} = {}) {
  const [sandboxChallenge, setSandboxChallenge] = useState(null);
  const [sandboxError, setSandboxError] = useState('');
  const [sandboxCode, setSandboxCode] = useState(
    "# 任务：编写一个函数 check_even(num)，判断一个数字是否是偶数，返回 True 或 False\n" +
    "def check_even(num):\n" +
    "    # 在下方编写你的代码逻辑\n" +
    "    if num % 2 == 0:\n" +
    "        return True\n" +
    "    else:\n" +
    "        return False\n"
  );
  const [sandboxTerminal, setSandboxTerminal] = useState([
    "=== EduGenesis AI Sandbox Terminal v1.0.0 ===",
    "系统就绪。编写代码并点击“运行测试”按钮以执行 PyTest 单元测试。"
  ]);
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);
  const [sandboxAIAdvice, setSandboxAIAdvice] = useState('');

  const fetchSandboxChallenge = async (nodeId = null) => {
    try {
      const data = await apiGet('/sandbox/challenge', nodeId ? { node_id: nodeId } : {});
      setSandboxChallenge(data);
      setSandboxCode(data.initial_code);
    } catch (err) {
      console.warn("Failed to fetch sandbox challenge:", err);
    }
  };

  const runSandboxTest = async (passedSetProfile) => {
    setIsSandboxRunning(true);
    setSandboxTerminal(prev => [...prev, ">>> PyTest test_main.py -v", "运行中..."]);
    try {
      const result = await apiPost('/sandbox/run', {
        code: sandboxCode,
        node_id: sandboxChallenge?.node_id || 'node3',
      });
      setSandboxTerminal(prev => [
        ...prev,
        ...(result.console_output || '').split('\n').filter(Boolean)
      ]);
      if (result.status === 'success') {
        setSandboxError('');
        const activeSetProfile = passedSetProfile || setProfile;
        const updatedProfile = await apiGet('/profile');
        if (activeSetProfile) activeSetProfile(updatedProfile);
        
        // Mark code resource as completed and fetch path nodes
        const nodeId = sandboxChallenge?.node_id || 'node3';
        const pathData = await apiPost('/path/complete-resource', {
          node_id: nodeId,
          resource_type: 'code'
        });
        if (setPathNodes) setPathNodes(pathData.nodes);
        
        if (setProfileAlert) {
          setProfileAlert("恭喜！代码测试全部通过！系统分析显示您的学习能力极佳，已自动剪枝跳过后续概念关卡，直接推送高级实操！");
        }
        if (setDiagnosticLogs) {
          setDiagnosticLogs(prev => [
            ...prev,
            {
              time: new Date().toLocaleTimeString(),
              log: `代码挑战: 关卡 [${sandboxChallenge?.title || '实操关卡'}] 单元测试通过！触发自适应路径快速剪枝机制。`
            }
          ]);
        }
        
        if (setSelectedNode && pathData.nodes) {
          const activeNode = pathData.nodes.find(n => n.status === 'active');
          if (activeNode) {
            setSelectedNode(activeNode);
          }
        }

        if (chat) {
          chat.submitChatMessage(`[系统感知] 学生通过了「${sandboxChallenge?.title || '代码实操'}」的代码测试！`, 'system');
        }
      } else {
        const errorDetail = result.error || '测试未通过';
        setSandboxError(errorDetail);
        if (chat) {
          chat.submitChatMessage(`[系统感知] 学生在「${sandboxChallenge?.title || '代码实操'}」运行代码失败：${errorDetail}`, 'system');
        }
      }
    } catch (err) {
      const errorDetail = err.message || '运行期错误';
      setSandboxTerminal(prev => [...prev, `[运行失败]：${errorDetail}`]);
      setSandboxError(errorDetail);
      if (chat) {
        chat.submitChatMessage(`[系统感知] 学生在「${sandboxChallenge?.title || '代码实操'}」运行代码失败：${errorDetail}`, 'system');
      }
    } finally {
      setIsSandboxRunning(false);
    }
  };

  const diagnoseSandboxCode = async () => {
    setSandboxAIAdvice('[主管智能体] 正在扫描代码特征中...');
    try {
      const result = await apiPost('/sandbox/diagnose', {
        code: sandboxCode,
        node_id: sandboxChallenge?.node_id || 'node3',
      });
      setSandboxAIAdvice(result.advice);
    } catch (err) {
      setSandboxAIAdvice(`[诊断异常]：${err.message}`);
    }
  };

  return {
    sandboxChallenge,
    setSandboxChallenge,
    sandboxCode,
    setSandboxCode,
    sandboxError,
    setSandboxError,
    sandboxTerminal,
    setSandboxTerminal,
    isSandboxRunning,
    setIsSandboxRunning,
    sandboxAIAdvice,
    setSandboxAIAdvice,
    fetchSandboxChallenge,
    runSandboxTest,
    diagnoseSandboxCode
  };
}
