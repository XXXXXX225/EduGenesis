import base64
import hashlib
import io
import time
import secrets
import sqlite3
import json
from typing import List, Dict

import pyotp
import qrcode
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.auth_utils import get_current_username
from app.db import (
    DB_PATH,
    get_password_hash,
    db_bind_totp,
    db_unbind_totp,
    db_get_totp_info,
    db_verify_recovery_code_and_invalidate,
    db_set_security_questions,
    db_get_security_questions,
    db_reset_password
)

router = APIRouter()

# ----------------- 数据模型 -----------------
class BindTOTPRequest(BaseModel):
    code: str
    secret: str

class SecurityQuestionItem(BaseModel):
    question: str
    answer: str

class SetSecurityQuestionsRequest(BaseModel):
    questions: List[SecurityQuestionItem]

class ForgotPasswordStatusRequest(BaseModel):
    username: str

class VerifyTOTPRequest(BaseModel):
    username: str
    code: str

class VerifyQuestionsItem(BaseModel):
    question: str
    answer: str

class VerifyQuestionsRequest(BaseModel):
    username: str
    answers: List[VerifyQuestionsItem]

class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str


# ----------------- 内存重置 Token 缓存 -----------------
# 保存 5 分钟内有效的临时密码重置 Token
# key: reset_token, value: {"username": username, "expires_at": float}
RESET_TOKENS: Dict[str, dict] = {}

def clean_expired_tokens():
    now = time.time()
    for token in list(RESET_TOKENS.keys()):
        if RESET_TOKENS[token]["expires_at"] < now:
            RESET_TOKENS.pop(token, None)

def generate_reset_token(username: str) -> str:
    clean_expired_tokens()
    token = secrets.token_hex(20)
    RESET_TOKENS[token] = {
        "username": username,
        "expires_at": time.time() + 300.0  # 5 分钟后过期
    }
    return token

def verify_reset_token(token: str) -> str:
    clean_expired_tokens()
    if token in RESET_TOKENS:
        info = RESET_TOKENS[token]
        if info["expires_at"] >= time.time():
            return info["username"]
    return None

def invalidate_reset_token(token: str):
    RESET_TOKENS.pop(token, None)


# ----------------- 安全答案标准化哈希 -----------------
def normalize_and_hash_answer(answer: str) -> str:
    # 去除首尾与内部所有空白，转换为小写以最大化匹配容错
    cleaned = "".join(answer.split()).lower()
    return hashlib.sha256(cleaned.encode("utf-8")).hexdigest()


# ----------------- 接口实现 -----------------

@router.get("/auth/totp/setup")
def totp_setup(current_username: str = Depends(get_current_username)):
    """生成随机 Base32 密钥以及供绑定的二维码图像 Data URL"""
    try:
        secret = pyotp.random_base32()
        totp = pyotp.TOTP(secret)
        # 生成扫码 URI
        provisioning_uri = totp.provisioning_uri(name=current_username, issuer_name="EduGenesis")
        
        # 使用 qrcode 生成 Base64 Data URL 图片，避免前端复杂的二维码解析库
        qr = qrcode.QRCode(version=None, box_size=4, border=1)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        qr_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        qr_code_data_url = f"data:image/png;base64,{qr_base64}"
        
        return {
            "secret": secret,
            "provisioning_uri": provisioning_uri,
            "qr_code_data_url": qr_code_data_url
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"初始化验证器失败: {str(e)}"
        )

@router.post("/auth/totp/bind")
def totp_bind(request: BindTOTPRequest, current_username: str = Depends(get_current_username)):
    """利用前端提交的 6 位动态验证码进行验证，成功后绑定并生成 16 位备用恢复码"""
    totp = pyotp.TOTP(request.secret)
    # verify 支持验证当前时间点前后一定范围的验证码以解决时钟偏移
    if not totp.verify(request.code, valid_window=1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="验证码无效或已过期，请核对手机时间是否与服务器同步。"
        )
    
    # 生成 16 位随机大写恢复密钥，并用短横线分隔成 4-4-4-4 格式增强可读性
    raw_key = secrets.token_hex(8).upper() # 16 个十六进制大写字符
    recovery_code = f"GENESIS-{raw_key[:4]}-{raw_key[4:8]}-{raw_key[8:12]}-{raw_key[12:16]}"
    
    try:
        db_bind_totp(current_username, request.secret, recovery_code)
        return {
            "status": "success",
            "message": "两步验证器绑定成功",
            "recovery_code": recovery_code
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"保存绑定状态失败: {str(e)}"
        )

@router.post("/auth/totp/unbind")
def totp_unbind(current_username: str = Depends(get_current_username)):
    """解绑当前用户的二级验证器"""
    try:
        db_unbind_totp(current_username)
        return {
            "status": "success",
            "message": "两步验证器已解绑"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"解绑失败: {str(e)}"
        )

@router.post("/auth/security-questions")
def set_security_questions(request: SetSecurityQuestionsRequest, current_username: str = Depends(get_current_username)):
    """批量设定用户的密保问题和哈希后的答案"""
    if not request.questions or len(request.questions) < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="密保问题至少需要设置一个。"
        )
    
    questions_data = []
    for item in request.questions:
        if not item.question.strip() or not item.answer.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="密保问题和答案均不能为空。"
            )
        questions_data.append({
            "question": item.question.strip(),
            "answer_hash": normalize_and_hash_answer(item.answer)
        })
        
    try:
        db_set_security_questions(current_username, json.dumps(questions_data, ensure_ascii=False))
        return {
            "status": "success",
            "message": "密保问题设置成功"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"保存密保问题失败: {str(e)}"
        )

@router.get("/auth/security-questions")
def get_security_questions_list(current_username: str = Depends(get_current_username)):
    """回显当前用户已设置的密保问题（不返回答案哈希，避免信息泄漏）"""
    try:
        raw_json = db_get_security_questions(current_username)
        questions_data = json.loads(raw_json)
        return [q["question"] for q in questions_data]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取密保问题失败: {str(e)}"
        )

@router.post("/auth/forgot-password/status")
def forgot_password_status(request: ForgotPasswordStatusRequest):
    """公开接口：根据用户名，加载该用户已配置的找回密码验证选项（如密保问题列表，是否绑定TOTP）"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT totp_secret, security_questions FROM users WHERE username = ?", (request.username,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="该学术账号不存在，请确认拼写。"
        )
        
    totp_secret, raw_questions = row[0], row[1]
    has_totp = totp_secret is not None
    
    questions = []
    if raw_questions:
        try:
            questions_data = json.loads(raw_questions)
            questions = [q["question"] for q in questions_data]
        except Exception:
            pass
            
    return {
        "username": request.username,
        "has_totp": has_totp,
        "has_questions": len(questions) > 0,
        "questions": questions
    }

@router.post("/auth/forgot-password/verify-totp")
def forgot_password_verify_totp(request: VerifyTOTPRequest):
    """公开接口：提交用户名和验证码（6位OTP码或GENESIS-开头的恢复码），验证成功后产生 reset_token"""
    info = db_get_totp_info(request.username)
    secret = info.get("totp_secret")
    
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该账号未开启两步验证，请选择其他找回方式。"
        )
        
    code_clean = request.code.strip()
    
    # 1. 尝试当成 6 位 OTP 动态验证码校验
    if len(code_clean) == 6 and code_clean.isdigit():
        totp = pyotp.TOTP(secret)
        if totp.verify(code_clean, valid_window=1):
            reset_token = generate_reset_token(request.username)
            return {"status": "success", "reset_token": reset_token}
            
    # 2. 尝试当成备用恢复码校验 (格式为 GENESIS-XXXX-XXXX-XXXX-XXXX)
    if code_clean.startswith("GENESIS-"):
        if db_verify_recovery_code_and_invalidate(request.username, code_clean):
            reset_token = generate_reset_token(request.username)
            return {
                "status": "success", 
                "reset_token": reset_token,
                "message": "一次性恢复密钥校验通过（该密钥已失效，请稍后重新绑定生成）"
            }
            
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="安全验证码错误，请重新核对。"
    )

@router.post("/auth/forgot-password/verify-questions")
def forgot_password_verify_questions(request: VerifyQuestionsRequest):
    """公开接口：校验填写的密保问题答案，全部答对后产生 reset_token"""
    raw_questions = db_get_security_questions(request.username)
    if not raw_questions or raw_questions == "[]":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该账户尚未设置密保问题，请尝试其他找回方式。"
        )
        
    try:
        db_questions = json.loads(raw_questions)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="读取密保问题配置出错。"
        )
        
    # 将用户提交的回答映射为字典，方便检索
    user_answers_dict = {item.question: item.answer for item in request.answers}
    
    # 循环校验所有在数据库中存盘的问题
    for db_item in db_questions:
        q = db_item["question"]
        expected_hash = db_item["answer_hash"]
        
        user_ans = user_answers_dict.get(q)
        if not user_ans:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"密保问题「{q}」缺少回答。"
            )
            
        if normalize_and_hash_answer(user_ans) != expected_hash:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="密保问题验证失败，请核对答案。"
            )
            
    # 如果能完整跑完循环而没有抛出异常，说明全部密保答案均一致！
    reset_token = generate_reset_token(request.username)
    return {"status": "success", "reset_token": reset_token}

@router.post("/auth/forgot-password/reset")
def forgot_password_reset(request: ResetPasswordRequest):
    """公开接口：使用有效的 reset_token 对用户名密码进行重写"""
    username = verify_reset_token(request.reset_token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="重置凭证无效或已过期，请重新发起验证流程。"
        )
        
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="新密码长度至少需要8位。"
        )
        
    try:
        new_hash = get_password_hash(request.new_password, username)
        db_reset_password(username, new_hash)
        # 重置密码成功后，立即使当前 reset_token 失效
        invalidate_reset_token(request.reset_token)
        return {
            "status": "success",
            "message": "通行密码重设成功，请使用新密码登入系统。"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新密码失败: {str(e)}"
        )
