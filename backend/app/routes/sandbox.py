import os
import sys
import json
import sqlite3
import tempfile
import subprocess
from fastapi import APIRouter, Depends, HTTPException
from app.ai.scenes import diagnose_sandbox_submission
from app.auth_utils import get_current_username
from app.models import SandboxRunRequest, SandboxDiagnoseRequest, SandboxRunRawRequest
from app.db import (
    DB_PATH,
    db_get_profile,
    db_save_profile,
    db_get_path_nodes,
    db_log_agent_action,
    db_record_contribution
)
from app.challenges import ML_CHALLENGES, PYTHON_CHALLENGES
from app.security import is_code_safe
from app.limiter import rate_limit_resource

router = APIRouter()

@router.get("/sandbox/challenge")
def get_sandbox_challenge(node_id: str | None = None, current_username: str = Depends(get_current_username)):
    target_user = current_username
    profile = db_get_profile(target_user)
    is_ml = any(any(x in g for x in ["Machine Learning", "机器学习", "machine_learning"]) for g in profile.learning_goals)
    challenges = ML_CHALLENGES if is_ml else PYTHON_CHALLENGES
    
    if not node_id:
        nodes = db_get_path_nodes(target_user)
        for node in nodes:
            if node.status == "active":
                node_id = node.id
                break
        if not node_id and len(nodes) > 0:
            node_id = nodes[0].id
            
    if not node_id or node_id not in challenges:
        node_id = "node1"
        
    challenge = challenges[node_id]
    return {
        "node_id": node_id,
        "title": challenge["title"],
        "description": challenge["description"],
        "initial_code": challenge["initial_code"]
    }

@router.post("/sandbox/run", dependencies=[Depends(rate_limit_resource)])
def run_sandbox_code(request: SandboxRunRequest, current_username: str = Depends(get_current_username)):
    target_user = current_username
    code = request.code
    node_id = request.node_id
    
    is_safe, err_msg = is_code_safe(code)
    if not is_safe:
        db_log_agent_action(target_user, "安全校验智能体", f"在节点 [{node_id}] 中拦截到不安全代码执行：{err_msg}", "danger")
        return {
            "status": "failed",
            "error": f"安全检查未通过：{err_msg}请仅使用纯粹的 Python 逻辑进行解题！",
            "console_output": "Security Violation: Access denied."
        }
            
    profile = db_get_profile(target_user)
    is_ml = any(any(x in g for x in ["Machine Learning", "机器学习", "machine_learning"]) for g in profile.learning_goals)
    challenges = ML_CHALLENGES if is_ml else PYTHON_CHALLENGES
    
    if node_id not in challenges:
        raise HTTPException(status_code=404, detail="Challenge not found.")
        
    challenge = challenges[node_id]
    test_suite = challenge.get("test_suite", "")
    combined_code = code + "\n" + test_suite
    
    with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode="w", encoding="utf-8") as temp_file:
        temp_file.write(combined_code)
        temp_file_path = temp_file.name
        
    try:
        proc = subprocess.run(
            [sys.executable, temp_file_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=2.0
        )
        stdout_output = proc.stdout
        stderr_output = proc.stderr
        
        try:
            os.remove(temp_file_path)
        except Exception:
            pass
            
        if proc.returncode == 0:
            # 1. Check if they passed on the first try (no previous error logged for this node)
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT count(*) FROM user_errors WHERE username = ? AND error_id = ?", (target_user, f"err_{node_id}"))
            failed_attempts = cursor.fetchone()[0]
            conn.close()
            
            first_time_pass = (failed_attempts == 0)
            
            stats = profile.learning_stats
            stats["study_time"] = stats.get("study_time", 0) + 10
            profile.learning_stats = stats
            
            practical_bump = 10 if first_time_pass else 5
            debugging_bump = 8 if first_time_pass else 4
            
            old_practical = getattr(profile, 'practical', 50)
            old_debugging = getattr(profile, 'debugging', 45)
            
            profile.practical = min(100, old_practical + practical_bump)
            profile.debugging = min(100, old_debugging + debugging_bump)
            
            db_log_agent_action(
                target_user, 
                "画像智能体", 
                f"代码测试通过！实践评分: {old_practical} -> {profile.practical}，调试评分: {old_debugging} -> {profile.debugging}。", 
                "consensus"
            )
            
            if first_time_pass:
                # 知识基础指数暴涨 (+15)
                old_kb = profile.knowledge_base
                profile.knowledge_base = min(100, profile.knowledge_base + 15)
                db_log_agent_action(target_user, "画像智能体", f"代码挑战一次性通关！学情分析显示其基础极其扎实，知识基础暴涨：{old_kb}% -> {profile.knowledge_base}%。", "consensus")
                
            db_save_profile(target_user, profile)
            db_record_contribution(target_user, 1)
            db_log_agent_action(target_user, "主管智能体", f"代码提交成功：关卡 [{challenge['title']}] 单元测试通过！", "info")
            
            # 2. 快速剪枝机制：跳过下一个不含代码的简单概念关卡
            from app.db import db_get_path_nodes, db_save_path_nodes, get_fallback_assets_for_topic
            nodes = db_get_path_nodes(target_user)
            current_idx = -1
            for idx, node in enumerate(nodes):
                if node.id == node_id:
                    current_idx = idx
                    break
                    
            if current_idx != -1:
                # Mark current as completed
                nodes[current_idx].status = "completed"
                
                # Check next node
                if current_idx + 1 < len(nodes):
                    next_node = nodes[current_idx + 1]
                    if "code" not in next_node.resources:
                        # Skip next node since it's just concept/slides/pdf
                        next_node.status = "completed"
                        db_log_agent_action(target_user, "路径智能体", f"检测到学生代码挑战一次通关，启动快速剪枝！自动越过基础概念关卡 [{next_node.title}] 并将其标为已通关。", "consensus")
                        
                        # Unlock the one after next
                        if current_idx + 2 < len(nodes):
                            nodes[current_idx + 2].status = "active"
                            db_log_agent_action(target_user, "路径智能体", f"直接推送解锁更高难度实操关卡 [{nodes[current_idx + 2].title}]，资源匹配完成。", "info")
                    else:
                        # Next node has coding, unlock normally
                        next_node.status = "active"
                db_save_path_nodes(target_user, nodes)
                
                # Update mastered count in profile to keep it in sync with the path nodes status
                completed_count = sum(1 for n in nodes if n.status == "completed")
                profile.learning_stats["mastered_nodes"] = min(8, completed_count)
                db_save_profile(target_user, profile)
                

            
            # Sync mastered count
            nodes = db_get_path_nodes(target_user)
            completed_count = sum(1 for n in nodes if n.status == "completed")
            profile.learning_stats["mastered_nodes"] = min(8, completed_count)
            db_save_profile(target_user, profile)
            
            return {
                "status": "success",
                "error": "",
                "console_output": stdout_output or "Execution succeeded (No standard output)."
            }
        else:
            error_msg = stderr_output.strip()
            lines = error_msg.split("\n")
            short_error = "\n".join(lines[-3:]) if len(lines) > 3 else error_msg
            
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            err_id = f"err_{node_id}"
            cursor.execute("SELECT count(*) FROM user_errors WHERE username = ? AND error_id = ?", (target_user, err_id))
            exists = cursor.fetchone()[0]
            
            ai_exp = "等待您点击 💡 智能体解析 按钮来生成针对该错误的详细学术诊断反馈。"
            sol = "根据题目要求并参照错误提示，调整代码中的变量或逻辑结构。"
            
            if exists == 0:
                cursor.execute(
                    """INSERT INTO user_errors (username, error_id, title, code, error_msg, ai_explanation, solution, status) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                    (target_user, err_id, f"编程沙盒错题: {challenge['title']}", code, short_error, ai_exp, sol, "unresolved")
                )
            else:
                cursor.execute(
                    """UPDATE user_errors SET code = ?, error_msg = ?, status = 'unresolved' WHERE username = ? AND error_id = ?""",
                    (code, short_error, target_user, err_id)
                )
            conn.commit()
            conn.close()
            
            db_log_agent_action(target_user, "错题诊断归档", f"检测到编译/运行期异常：已捕获错题并归档至错题本 [{challenge['title']}]", "warning")
            
            from app.agents.coordinator import AgentCommandBus
            AgentCommandBus.send_command(
                sender="错题诊断归档",
                recipient="AI助教聊天",
                command="PUSH_ERROR_DIAGNOSIS",
                payload={"error_msg": short_error, "code": code, "node_id": node_id},
                username=target_user
            )
            
            return {
                "status": "failed",
                "error": short_error,
                "console_output": stdout_output or ""
            }
            
    except subprocess.TimeoutExpired:
        try:
            os.remove(temp_file_path)
        except Exception:
            pass
        db_log_agent_action(target_user, "安全校验智能体", "检测到代码运行超时，可能包含无限循环。执行强行终止。", "danger")
        return {
            "status": "failed",
            "error": "TimeLimitExceeded: 代码运行超时（限时2.0秒），可能存在死循环，请检查循环退出条件！",
            "console_output": "Execution timed out."
        }
    except Exception as e:
        try:
            os.remove(temp_file_path)
        except Exception:
            pass
        return {
            "status": "failed",
            "error": f"SystemError: 虚拟机沙盒内部异常: {str(e)}",
            "console_output": ""
        }

@router.post("/sandbox/diagnose", dependencies=[Depends(rate_limit_resource)])
def diagnose_sandbox_code(request: SandboxDiagnoseRequest, current_username: str = Depends(get_current_username)):
    target_user = current_username
    profile = db_get_profile(target_user)
    
    is_safe, err_msg = is_code_safe(request.code)
    if not is_safe:
        db_log_agent_action(target_user, "安全校验智能体", f"在节点 [{request.node_id}] 中拦截到不安全代码诊断请求：{err_msg}", "danger")
        blocked_msg = f"❌ 安全检查未通过：{err_msg}请仅使用纯粹的 Python 逻辑进行解题！"
        return {"diagnostic": blocked_msg, "advice": blocked_msg}
        
    try:
        explanation = diagnose_sandbox_submission(request.code, request.node_id, profile, target_user)
        if explanation:
            db_log_agent_action(target_user, "画像智能体", "为用户生成代码诊断评估报告成功。", "consensus")
            return {"diagnostic": explanation, "advice": explanation}
    except Exception as e:
        print(f"AI platform sandbox diagnosis failed: {e}")
            
    explanation = f"""[EXPLANATION]
1. 缩进检查：请确保 Python 代码块缩进为标准的 4 个空格，避免混用空格和 Tab 键。
2. 返回值确认：确认函数是使用 `return` 返回计算结果，而不是使用 `print()` 打印。
3. 学习特征匹配：基于您的 **{profile.cognitive_style}** 认知风格，建议通过手工代入测试用例进行白盒调试。

[CODE]
```python
# 请参考以下标准偶数判断逻辑：
def check_even(num):
    return num % 2 == 0
```"""
    db_log_agent_action(target_user, "画像智能体", "完成本地规则适配诊断生成。", "consensus")
    return {"diagnostic": explanation, "advice": explanation}

@router.post("/sandbox/run_raw", dependencies=[Depends(rate_limit_resource)])
def run_raw_code(request: SandboxRunRawRequest, current_username: str = Depends(get_current_username)):
    target_user = current_username
    code = request.code
    
    is_safe, err_msg = is_code_safe(code)
    if not is_safe:
        db_log_agent_action(target_user, "安全校验智能体", f"在运行任意代码时拦截到不安全代码：{err_msg}", "danger")
        return {
            "status": "failed",
            "error": f"安全检查未通过：{err_msg}请仅使用纯粹的 Python 逻辑进行解题！",
            "console_output": "Security Violation: Access denied."
        }
        
    with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode="w", encoding="utf-8") as temp_file:
        temp_file.write(code)
        temp_file_path = temp_file.name
        
    try:
        proc = subprocess.run(
            [sys.executable, temp_file_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=2.0
        )
        stdout_output = proc.stdout
        stderr_output = proc.stderr
        
        try:
            os.remove(temp_file_path)
        except Exception:
            pass
            
        if proc.returncode == 0:
            db_log_agent_action(target_user, "主管智能体", "用户在聊天代码沙箱中成功运行任意代码。", "info")
            return {
                "status": "success",
                "error": "",
                "console_output": stdout_output or "运行成功（无标准输出）。"
            }
        else:
            error_msg = stderr_output.strip()
            lines = error_msg.split("\n")
            short_error = "\n".join(lines[-3:]) if len(lines) > 3 else error_msg
            db_log_agent_action(target_user, "画像智能体", f"用户聊天代码沙箱运行报错：{short_error}", "warning")
            return {
                "status": "failed",
                "error": short_error,
                "console_output": stdout_output or ""
            }
            
    except subprocess.TimeoutExpired:
        try:
            os.remove(temp_file_path)
        except Exception:
            pass
        db_log_agent_action(target_user, "安全校验智能体", "检测到代码运行超时，可能包含无限循环。执行强行终止。", "danger")
        return {
            "status": "failed",
            "error": "TimeLimitExceeded: 代码运行超时（限时2.0秒），可能存在死循环，请检查循环退出条件！",
            "console_output": "Execution timed out."
        }
    except Exception as e:
        try:
            os.remove(temp_file_path)
        except Exception:
            pass
        return {
            "status": "failed",
            "error": f"SystemError: 虚拟机沙盒内部异常: {str(e)}",
            "console_output": ""
        }
