import os
import sys
import json
import sqlite3
import tempfile
import subprocess
from fastapi import APIRouter, Depends, HTTPException
from app.ai.scenes import diagnose_sandbox_submission
from app.auth_utils import get_current_username
from app.models import SandboxRunRequest, SandboxDiagnoseRequest
from app.db import (
    DB_PATH,
    db_get_profile,
    db_save_profile,
    db_get_path_nodes,
    db_log_agent_action
)
from app.challenges import ML_CHALLENGES, PYTHON_CHALLENGES
from app.security import is_code_safe
from app.limiter import rate_limit_resource

router = APIRouter()

@router.get("/sandbox/challenge")
def get_sandbox_challenge(node_id: str | None = None, current_username: str = Depends(get_current_username)):
    target_user = current_username
    profile = db_get_profile(target_user)
    is_ml = any("Machine Learning" in g for g in profile.learning_goals)
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
    is_ml = any("Machine Learning" in g for g in profile.learning_goals)
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
            
            if first_time_pass:
                # 知识基础指数暴涨 (+15)
                old_kb = profile.knowledge_base
                profile.knowledge_base = min(100, profile.knowledge_base + 15)
                db_log_agent_action(target_user, "画像智能体", f"代码挑战一次性通关！学情分析显示其基础极其扎实，知识基础暴涨：{old_kb}% -> {profile.knowledge_base}%。", "consensus")
                
            db_save_profile(target_user, profile)
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
                
                # Pre-seed resources for the newly active node (either idx+1 or idx+2)
                active_node = None
                for n in nodes:
                    if n.status == "active":
                        active_node = n
                        break
                if active_node:
                    fallback_assets = get_fallback_assets_for_topic(active_node.title, profile, active_node.id)
                    conn = sqlite3.connect(DB_PATH)
                    cursor = conn.cursor()
                    for res_type in active_node.resources:
                        cursor.execute(
                            "SELECT count(*) FROM user_resources WHERE username = ? AND node_id = ? AND resource_type = ?",
                            (target_user, active_node.id, res_type)
                        )
                        exists = cursor.fetchone()[0]
                        if exists == 0:
                            content_val = fallback_assets.get(res_type, "")
                            if not isinstance(content_val, str):
                                content_val = json.dumps(content_val, ensure_ascii=False)
                            cursor.execute(
                                "INSERT OR REPLACE INTO user_resources (username, node_id, resource_type, content) VALUES (?, ?, ?, ?)",
                                (target_user, active_node.id, res_type, content_val)
                            )
                    conn.commit()
                    conn.close()
            
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
            
            db_log_agent_action(target_user, "画像智能体", f"检测到编译/运行期异常：已捕获错题并归档至错题本 [{challenge['title']}]", "warning")
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
            
    explanation = f"✨ **[自适应画像智能体诊断报告]**\n\n您的代码包含基本 Python 逻辑。建议检查：\n1. 函数缩进是否为标准的 4 个空格。\n2. 是否正确返回了题目要求的结果（而非直接打印）。\n3. 变量生命周期及作用域是否合规。\n\n学习特征提示：基于您的 **{profile.cognitive_style}** 认知风格，建议通过手写 debug 输出方式调试核心逻辑。"
    db_log_agent_action(target_user, "画像智能体", "完成本地规则适配诊断生成。", "consensus")
    return {"diagnostic": explanation, "advice": explanation}
