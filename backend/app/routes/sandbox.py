import os
import sys
import json
import sqlite3
import tempfile
import subprocess
import requests
from fastapi import APIRouter, Depends, HTTPException
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
            stats = profile.learning_stats
            stats["study_time"] = stats.get("study_time", 0) + 10
            profile.learning_stats = stats
            db_save_profile(target_user, profile)
            
            db_log_agent_action(target_user, "主管智能体", f"代码提交成功：关卡 [{challenge['title']}] 单元测试通过！", "info")
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
    api_key = os.getenv("LLM_API_KEY")
    
    is_safe, err_msg = is_code_safe(request.code)
    if not is_safe:
        db_log_agent_action(target_user, "安全校验智能体", f"在节点 [{request.node_id}] 中拦截到不安全代码诊断请求：{err_msg}", "danger")
        blocked_msg = f"❌ 安全检查未通过：{err_msg}请仅使用纯粹的 Python 逻辑进行解题！"
        return {"diagnostic": blocked_msg, "advice": blocked_msg}
        
    if api_key:
        try:
            api_base = os.getenv("LLM_API_BASE", "https://spark-api-open.xf-yun.com/v1")
            model = os.getenv("LLM_MODEL", "generalv3.5")
            url = f"{api_base.rstrip('/')}/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            system_prompt = f"""You are the Academic Diagnostics Agent in an adaptive multi-agent tutoring network.
Analyze the student's python code and provide diagnostic feedback.
Topic/Challenge Node: {request.node_id}
Student Cognitive Profile:
- Learning style: {profile.cognitive_style}
- Common error patterns: {json.dumps(profile.error_patterns)}

Provide a friendly, encouraging analysis highlighting what is wrong (e.g. indentation, name error, logic) and how to fix it, following their {profile.cognitive_style} style. Keep it concise, professional and written in Chinese."""
            
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Here is my code:\n{request.code}"}
                ],
                "temperature": 0.3
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            if response.status_code == 200:
                res_data = response.json()
                explanation = res_data["choices"][0]["message"]["content"].strip()
                db_log_agent_action(target_user, "画像智能体", f"为用户生成代码诊断评估报告成功。", "consensus")
                return {"diagnostic": explanation, "advice": explanation}
        except Exception as e:
            print(f"Xunfei Sandbox Diagnosis failed: {e}")
            
    explanation = f"✨ **[自适应画像智能体诊断报告]**\n\n您的代码包含基本 Python 逻辑。建议检查：\n1. 函数缩进是否为标准的 4 个空格。\n2. 是否正确返回了题目要求的结果（而非直接打印）。\n3. 变量生命周期及作用域是否合规。\n\n学习特征提示：基于您的 **{profile.cognitive_style}** 认知风格，建议通过手写 debug 输出方式调试核心逻辑。"
    db_log_agent_action(target_user, "画像智能体", "完成本地规则适配诊断生成。", "consensus")
    return {"diagnostic": explanation, "advice": explanation}
