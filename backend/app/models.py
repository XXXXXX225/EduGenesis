from pydantic import BaseModel, Field
from typing import List, Optional

class UserProfile(BaseModel):
    knowledge_base: int = Field(default=50, ge=0, le=100, description="Knowledge baseline score")
    learning_pace: int = Field(default=50, ge=0, le=100, description="Preferred learning speed")
    cognitive_style: str = Field(default="Visual/Practical", description="Preferred cognitive learning style")
    error_patterns: List[str] = Field(default_factory=list, description="List of common student mistake domains")
    learning_goals: List[str] = Field(default_factory=list, description="Target learning topics")
    engagement: int = Field(default=80, ge=0, le=100, description="Student motivation/engagement index")

class UserMessage(BaseModel):
    role: str = Field(..., description="Role of the sender: 'user' or 'assistant'")
    content: str = Field(..., description="Content of the message")

class ChatRequest(BaseModel):
    messages: List[UserMessage] = Field(..., description="Conversation history")
    current_profile: Optional[UserProfile] = Field(default=None, description="Current student profile status")

class PathNode(BaseModel):
    id: str
    title: str
    status: str = Field(default="locked", description="'locked', 'active', or 'completed'")
    description: str
    resources: List[str] = Field(default_factory=list, description="Types of resources available")
