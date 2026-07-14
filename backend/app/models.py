from pydantic import BaseModel, Field
from typing import List, Optional

class UserProfile(BaseModel):
    knowledge_base: int = Field(default=50, ge=0, le=100, description="Knowledge baseline score")
    learning_pace: int = Field(default=50, ge=0, le=100, description="Preferred learning speed")
    cognitive_style: str = Field(default="Visual/Practical", description="Preferred cognitive learning style")
    error_patterns: List[str] = Field(default_factory=list, description="List of common student mistake domains")
    learning_goals: List[str] = Field(default_factory=list, description="Target learning topics")
    engagement: int = Field(default=80, ge=0, le=100, description="Student motivation/engagement index")
    debugging: int = Field(default=45, ge=0, le=100, description="Debugging proficiency score")
    practical: int = Field(default=50, ge=0, le=100, description="Practical implementation score")
    reasoning: int = Field(default=40, ge=0, le=100, description="Theoretical reasoning score")
    learning_stats: dict = Field(default_factory=lambda: {
        "study_time": 45,
        "quiz_accuracy": 85,
        "mastered_nodes": 1,
        "streak": [True, True, False, False, False, False, False]
    }, description="Academic stats for dashboard homepage")

class UserMessage(BaseModel):
    role: str = Field(..., description="Role of the sender: 'user', 'assistant', or 'system'")
    content: str = Field(..., description="Content of the message")

class ChatRequest(BaseModel):
    messages: List[UserMessage] = Field(..., description="Conversation history")
    current_profile: Optional[UserProfile] = Field(default=None, description="Current student profile status")
    session_id: Optional[str] = Field(default=None, description="Optional chat session ID to save messages")
    tutor_personality: Optional[str] = Field(default=None, description="Optional tutor personality style")
    current_node_id: Optional[str] = Field(default=None, description="Current node ID student is learning")
    current_node_title: Optional[str] = Field(default=None, description="Current node title student is learning")
    current_node_description: Optional[str] = Field(default=None, description="Current node description")
    current_node_status: Optional[str] = Field(default=None, description="Current node status: locked, active, completed")
    current_node_resources: Optional[List[str]] = Field(default=None, description="Current node available resources")
    current_resource_type: Optional[str] = Field(default=None, description="Current active resource type: pdf, slide, quiz, mindmap, code, video")
    last_sandbox_code: Optional[str] = Field(default=None, description="Last code in sandbox")
    last_sandbox_error: Optional[str] = Field(default=None, description="Last error in sandbox")
    last_quiz_score: Optional[str] = Field(default=None, description="Last quiz score")

class PathNode(BaseModel):
    id: str
    title: str
    status: str = Field(default="locked", description="'locked', 'active', or 'completed'")
    description: str
    resources: List[str] = Field(default_factory=list, description="Types of resources available")
    completed_resources: List[str] = Field(default_factory=list, description="Types of resources completed by the user")

class CompleteResourceRequest(BaseModel):
    node_id: str
    resource_type: str

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

class SandboxRunRawRequest(BaseModel):
    code: str
