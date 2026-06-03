from fastapi import APIRouter, Body, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.models import UserProfile, ChatRequest, PathNode
import json
import asyncio
import sqlite3
import hashlib
from typing import List

router = APIRouter()

DB_PATH = "users.db"

# Pydantic models for authentication
class RegisterRequest(BaseModel):
    username: str
    password: str
    cognitive_style: str
    learning_goals: List[str]

class LoginRequest(BaseModel):
    username: str
    password: str

# Initialize the SQLite database and create users table if not exists
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        cognitive_style TEXT NOT NULL,
        learning_goals TEXT NOT NULL
    )
    """)
    conn.commit()
    conn.close()

init_db()

# Password hashing helper function
def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


# Memory database for user profile and path nodes (simulated state)
current_user_profile = UserProfile(
    knowledge_base=40,
    learning_pace=50,
    cognitive_style="Practical Coding",
    error_patterns=["Syntax Errors", "Indentation Issues"],
    learning_goals=["Python Basics"],
    engagement=80
)

python_path_nodes = [
    PathNode(id="node1", title="Python Environment", status="completed", description="Install Python & setup VS Code", resources=["pdf", "code"]),
    PathNode(id="node2", title="Variables & Data Types", status="active", description="Learn integers, floats, strings and variables", resources=["slide", "pdf", "quiz"]),
    PathNode(id="node3", title="Control Flow", status="locked", description="If-statements, loops and logical operations", resources=["slide", "quiz", "code"]),
    PathNode(id="node4", title="Functions & Modules", status="locked", description="Defining reusable code and importing libraries", resources=["slide", "pdf", "mindmap", "code"]),
    PathNode(id="node5", title="Final Project", status="locked", description="Build a CLI Calculator using functions", resources=["code", "quiz"])
]

ml_path_nodes = [
    PathNode(id="node1", title="Linear Algebra Basics", status="completed", description="Matrices, vectors, and dot products", resources=["pdf"]),
    PathNode(id="node2", title="Linear Regression", status="active", description="Implement gradient descent for line fitting", resources=["slide", "quiz", "code"]),
    PathNode(id="node3", title="Classification & Logistic Regression", status="locked", description="Binary classification and sigmoid activation", resources=["slide", "quiz"]),
    PathNode(id="node4", title="Neural Networks", status="locked", description="Backpropagation and activation functions", resources=["slide", "mindmap", "code"]),
    PathNode(id="node5", title="Project: Predict House Prices", status="locked", description="Deploy a custom ML predictor", resources=["code", "quiz"])
]

current_path_nodes = list(python_path_nodes)

@router.post("/auth/register")
def register_user(request: RegisterRequest):
    global current_user_profile, current_path_nodes
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT username FROM users WHERE username = ?", (request.username,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该用户名已被占用，请重新选择昵称。"
        )
    
    pwd_hash = get_password_hash(request.password)
    goals_str = ",".join(request.learning_goals)
    cursor.execute(
        "INSERT INTO users (username, password_hash, cognitive_style, learning_goals) VALUES (?, ?, ?, ?)",
        (request.username, pwd_hash, request.cognitive_style, goals_str)
    )
    conn.commit()
    conn.close()
    
    # Initialize active profile states with the registered details
    current_user_profile.cognitive_style = request.cognitive_style
    current_user_profile.learning_goals = request.learning_goals
    current_user_profile.knowledge_base = 30 if "Machine Learning" in request.learning_goals else 40
    current_user_profile.learning_pace = 60 if "Machine Learning" in request.learning_goals else 50
    current_user_profile.error_patterns = ["Gradient instability"] if "Machine Learning" in request.learning_goals else ["Syntax Errors", "Indentation Issues"]
    
    # Sync path nodes
    if "Machine Learning" in request.learning_goals:
        current_path_nodes = list(ml_path_nodes)
    else:
        current_path_nodes = list(python_path_nodes)
        
    return {"status": "success", "detail": "注册成功，学术环境已初始化。"}

@router.post("/auth/login")
def login_user(request: LoginRequest):
    global current_user_profile, current_path_nodes
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash, cognitive_style, learning_goals FROM users WHERE username = ?", (request.username,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名不存在，请重新输入或注册账号。"
        )
        
    pwd_hash = row[0]
    cognitive_style = row[1]
    learning_goals = row[2].split(",") if row[2] else []
    
    if get_password_hash(request.password) != pwd_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="密码错误，请重新输入学术密码。"
        )
    
    # Sync active states with the logged-in user profile
    current_user_profile.cognitive_style = cognitive_style
    current_user_profile.learning_goals = learning_goals
    current_user_profile.knowledge_base = 30 if "Machine Learning" in learning_goals else 40
    current_user_profile.learning_pace = 60 if "Machine Learning" in learning_goals else 50
    current_user_profile.error_patterns = ["Gradient instability"] if "Machine Learning" in learning_goals else ["Syntax Errors", "Indentation Issues"]
    
    # Sync path nodes
    if "Machine Learning" in learning_goals:
        current_path_nodes = list(ml_path_nodes)
    else:
        current_path_nodes = list(python_path_nodes)
        
    return {"status": "success", "username": request.username, "cognitive_style": cognitive_style, "learning_goals": learning_goals}

@router.get("/health")
def health_check():
    return {"status": "healthy", "service": "EduGenesis Core API"}

@router.get("/profile", response_model=UserProfile)
def get_profile():
    return current_user_profile

@router.post("/profile", response_model=UserProfile)
def update_profile(profile: UserProfile):
    global current_user_profile, current_path_nodes
    current_user_profile = profile
    # Dynamically sync path nodes based on learning goals
    if "Machine Learning" in profile.learning_goals:
        current_path_nodes = list(ml_path_nodes)
    else:
        current_path_nodes = list(python_path_nodes)
    return current_user_profile

@router.get("/path")
def get_path():
    return {"nodes": current_path_nodes}

@router.post("/chat")
async def chat_interaction(request: ChatRequest):
    global current_user_profile, current_path_nodes
    
    # Simple rule-based simulator to make the app dynamic and reactive
    user_input = request.messages[-1].content.lower() if request.messages else ""
    
    # State update flags
    profile_updated = False
    path_updated = False
    
    if "beginner" in user_input or "初学者" in user_input or "不懂" in user_input:
        current_user_profile.knowledge_base = 15
        current_user_profile.learning_pace = 30
        current_user_profile.cognitive_style = "Visual/Guided"
        current_user_profile.error_patterns = ["Basic logic errors", "Syntax Errors"]
        profile_updated = True
    elif "advanced" in user_input or "懂一点" in user_input or "有基础" in user_input:
        current_user_profile.knowledge_base = 65
        current_user_profile.learning_pace = 75
        current_user_profile.cognitive_style = "Theoretical/Self-Paced"
        profile_updated = True
        
    if "machine learning" in user_input or "机器学习" in user_input or "算法" in user_input:
        if "Machine Learning" not in current_user_profile.learning_goals:
            current_user_profile.learning_goals = ["Machine Learning"]
            current_path_nodes = list(ml_path_nodes)
            profile_updated = True
            path_updated = True
    elif "python" in user_input or "基础" in user_input or "重置" in user_input:
        if "Python Basics" not in current_user_profile.learning_goals:
            current_user_profile.learning_goals = ["Python Basics"]
            current_path_nodes = list(python_path_nodes)
            profile_updated = True
            path_updated = True

    async def event_generator():
        # Step 1: Simulated Agent Orchestration thinking phase
        yield f"data: {json.dumps({'type': 'status', 'status': '🧠 [Orchestrator Agent] Analyzing input...'})}\n\n"
        await asyncio.sleep(0.6)
        
        yield f"data: {json.dumps({'type': 'status', 'status': '📊 [Profile Agent] Updating cognitive parameters...'})}\n\n"
        await asyncio.sleep(0.6)
        
        yield f"data: {json.dumps({'type': 'status', 'status': '📍 [Path Planner Agent] Optimizing curriculum node structures...'})}\n\n"
        await asyncio.sleep(0.6)
        
        # Step 2: Streaming tutor content
        tutor_response = ""
        if "machine learning" in user_input or "机器学习" in user_input:
            tutor_response = "您好！我已经收到了您的学习期望。系统已经检测到您对**机器学习**感兴趣。我已为您加载了《机器学习核心理论与应用实操》的个性化学习路径，包括从线性代数到神经网络的实践案例。我们可以先从第一关“线性代数基础”开始！"
        elif "beginner" in user_input or "初学者" in user_input or "不懂" in user_input:
            tutor_response = "没关系！我们都会从零开始。我已经把您的学习节奏调到了**慢速温和**模式，并降低了初始难度门槛（知识库水平已调整为 15%）。学习路径里的内容现在将包含更多的代码注释和可视化卡片。让我们先试试“Python变量”第一课吧！"
        else:
            tutor_response = f"您好！我是您的个性化 AI 助教。我已经接收到了您的消息：“{user_input}”。基于多智能体协同，我为您量身定制了这套方案。在对话过程中，我会自动评估您的学习特征，并实时微调左侧的动态学习雷达画像与下方的学习路径。"
        
        # Stream response chunk-by-chunk
        chunk_size = 5
        for i in range(0, len(tutor_response), chunk_size):
            chunk = tutor_response[i:i+chunk_size]
            yield f"data: {json.dumps({'type': 'content', 'content': chunk})}\n\n"
            await asyncio.sleep(0.08)
            
        # Step 3: Stream updates (profile / path) if triggered
        if profile_updated:
            profile_dict = current_user_profile.model_dump()
            yield f"data: {json.dumps({'type': 'profile_update', 'profile': profile_dict})}\n\n"
            await asyncio.sleep(0.3)
            
        if path_updated:
            nodes_list = [n.model_dump() for n in current_path_nodes]
            yield f"data: {json.dumps({'type': 'path_update', 'nodes': nodes_list})}\n\n"
            await asyncio.sleep(0.3)
            
        # Finish stream
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
