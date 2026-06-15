from pydantic import BaseModel, Field
from typing import List, Optional

class UserProfile(BaseModel):
    knowledge_base: int = Field(default=50, ge=0, le=100, description="Knowledge baseline score")
    learning_pace: int = Field(default=50, ge=0, le=100, description="Preferred learning speed")
    cognitive_style: str = Field(default="Visual/Practical", description="Preferred cognitive learning style")
    error_patterns: List[str] = Field(default_factory=list, description="List of common student mistake domains")
    learning_goals: List[str] = Field(default_factory=list, description="Target learning topics")
    engagement: int = Field(default=80, ge=0, le=100, description="Student motivation/engagement index")
    learning_stats: dict = Field(default_factory=lambda: {
        "study_time": 45,
        "quiz_accuracy": 85,
        "mastered_nodes": 1,
        "streak": [True, True, False, False, False, False, False]
    }, description="Academic stats for dashboard homepage")

class UserMessage(BaseModel):
    role: str = Field(..., description="Role of the sender: 'user' or 'assistant'")
    content: str = Field(..., description="Content of the message")

class ChatRequest(BaseModel):
    messages: List[UserMessage] = Field(..., description="Conversation history")
    current_profile: Optional[UserProfile] = Field(default=None, description="Current student profile status")
    session_id: Optional[str] = Field(default=None, description="Optional chat session ID to save messages")
    tutor_personality: Optional[str] = Field(default=None, description="Optional tutor personality style")

class PathNode(BaseModel):
    id: str
    title: str
    status: str = Field(default="locked", description="'locked', 'active', or 'completed'")
    description: str
    resources: List[str] = Field(default_factory=list, description="Types of resources available")

class RegisterRequest(BaseModel):
    username: str
    password: str
    cognitive_style: str
    learning_goals: List[str]

class LoginRequest(BaseModel):
    username: str
    password: str

class ResourceGenerateRequest(BaseModel):
    node_id: str
    username: Optional[str] = None

class SandboxRunRequest(BaseModel):
    code: str
    node_id: str
    username: Optional[str] = None

class SandboxDiagnoseRequest(BaseModel):
    code: str
    node_id: str
    username: Optional[str] = None

class ErrorDiagnoseRequest(BaseModel):
    error_id: str
    username: Optional[str] = None

class ErrorRemedyRequest(BaseModel):
    error_id: str
    username: Optional[str] = None

class ConsoleLogRequest(BaseModel):
    sender: str
    message: str
    log_type: str = "info"
    username: Optional[str] = None

class CompleteNodeRequest(BaseModel):
    node_id: str
    username: Optional[str] = None
    score: Optional[int] = None
    total: Optional[int] = None
