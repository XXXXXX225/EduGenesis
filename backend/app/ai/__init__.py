from app.ai.platform import (
    AIModelConfig,
    extract_json_block,
    generate_embedding_vector,
    get_capability_config,
    probe_provider_connection,
    request_chat_completion,
    request_json_completion,
    request_stream_completion,
    request_text_completion,
    synthesize_tts_audio,
)
from app.ai.rag import cosine_similarity, rag_retrieve_context, rag_search
from app.ai.scenes import (
    analyze_chat_profile,
    diagnose_runtime_error,
    diagnose_sandbox_submission,
    generate_course_syllabus,
    generate_learning_resources,
    generate_path_nodes,
    generate_remedy_quiz,
    optimize_rag_query,
    optimize_video_search_query,
    optimize_video_query_from_message,
    rerank_videos_for_learning,
    stream_tutor_reply,
)

__all__ = [
    # platform
    "AIModelConfig",
    "extract_json_block",
    "generate_embedding_vector",
    "get_capability_config",
    "probe_provider_connection",
    "request_chat_completion",
    "request_json_completion",
    "request_stream_completion",
    "request_text_completion",
    "synthesize_tts_audio",
    # rag
    "cosine_similarity",
    "rag_retrieve_context",
    "rag_search",
    # scenes
    "analyze_chat_profile",
    "diagnose_runtime_error",
    "diagnose_sandbox_submission",
    "generate_course_syllabus",
    "generate_learning_resources",
    "generate_path_nodes",
    "generate_remedy_quiz",
    "optimize_rag_query",
    "optimize_video_search_query",
    "optimize_video_query_from_message",
    "rerank_videos_for_learning",
    "stream_tutor_reply",
]
