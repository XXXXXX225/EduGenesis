from typing import List, Optional

from pydantic import BaseModel

from app.ai.platform import extract_json_block, get_capability_config
from app.ai.scenes import (
    analyze_chat_profile,
    generate_course_syllabus,
    generate_learning_resources,
    generate_path_nodes,
    stream_tutor_reply,
)
from app.models import UserProfile


def get_route_llm_params(username: str, role_field: str):
    config = get_capability_config(username, role_field)
    return config.api_base, config.api_key, config.model_name


def call_llm_structured_analysis(messages: List[BaseModel], current_profile: UserProfile, username: str = "default_user"):
    return analyze_chat_profile(messages, current_profile, username)


def call_llm_stream_tutor(
    messages: List[BaseModel],
    current_profile: UserProfile,
    username: str = "default_user",
    videos_context: Optional[List[dict]] = None,
    tutor_personality: Optional[str] = None,
    knowledge_context: Optional[str] = None,
):
    return stream_tutor_reply(
        messages,
        current_profile,
        username=username,
        videos_context=videos_context,
        tutor_personality=tutor_personality,
        knowledge_context=knowledge_context,
    )


def call_llm_resource_agent(topic: str, resources: List[str], profile: UserProfile, username: str = "default_user", context: str = ""):
    return generate_learning_resources(topic, resources, profile, username=username, context=context) or {}


def call_llm_path_planner(goals: List[str], style: str, username: str = "default_user") -> List[dict]:
    return generate_path_nodes(goals, style, username)


def call_llm_syllabus_generator(course_name: str, description: str, username: str = "default_user") -> List[dict]:
    return generate_course_syllabus(course_name, description, username)
