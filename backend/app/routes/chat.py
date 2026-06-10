import os
import json
import asyncio
from fastapi import APIRouter, Depends
from app.auth_utils import get_current_username
from fastapi.responses import StreamingResponse
from app.models import ChatRequest
from app.db import (
    db_get_profile,
    db_save_profile,
    db_get_path_nodes,
    db_sync_path_nodes_by_goals
)
from app.limiter import rate_limit_chat
from app.llm_client import call_llm_structured_analysis, call_llm_stream_tutor, get_route_llm_params

router = APIRouter()

@router.post("/chat", dependencies=[Depends(rate_limit_chat)])
async def chat_interaction(request: ChatRequest, current_username: str = Depends(get_current_username)):
    target_user = current_username
    current_profile = db_get_profile(target_user)
    _, api_key, _ = get_route_llm_params(target_user, 'chat')
    
    async def event_generator():
        # Step 1: Supervisor orchestrator thinking state
        yield f"data: {json.dumps({'type': 'status', 'status': '🧠 [主管智能体] 正在唤醒协同智能体网络...'})}\n\n"
        await asyncio.sleep(0.4)
        
        if api_key:
            # Step 2: Structured Analyzer Call
            yield f"data: {json.dumps({'type': 'status', 'status': '📊 [画像智能体] 正在对您的认知指标进行多维提取与诊断...'})}\n\n"
            
            analysis = await asyncio.to_thread(call_llm_structured_analysis, request.messages, current_profile, target_user)
            
            profile_updated = False
            path_updated = False
            
            if analysis:
                p_updates = analysis.get("profile_updates")
                if p_updates:
                    for k, v in p_updates.items():
                        if v is not None and hasattr(current_profile, k):
                            setattr(current_profile, k, v)
                            profile_updated = True
                
                subj = analysis.get("switch_to_subject")
                if subj in ["Python Basics", "Machine Learning"]:
                    if subj not in current_profile.learning_goals:
                        current_profile.learning_goals = [subj]
                        db_sync_path_nodes_by_goals(target_user, [subj])
                        profile_updated = True
                        path_updated = True
            
            if profile_updated:
                db_save_profile(target_user, current_profile)
                
            yield f"data: {json.dumps({'type': 'status', 'status': '📍 [路径智能体] 正在优化您的知识时间轴拓扑结构...'})}\n\n"
            await asyncio.sleep(0.4)
            
            yield f"data: {json.dumps({'type': 'status', 'status': '💬 [导师智能体] 正在根据新画像为您生成个性化讲义...'})}\n\n"
            
            stream_response = await asyncio.to_thread(call_llm_stream_tutor, request.messages, current_profile, target_user)
            
            if stream_response and stream_response.status_code == 200:
                yield f"data: {json.dumps({'type': 'status', 'status': ''})}\n\n"
                
                for chunk_bytes in stream_response.iter_lines():
                    if chunk_bytes:
                        line = chunk_bytes.decode('utf-8').strip()
                        if line.startswith("data:"):
                            data_str = line[5:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                data_json = json.loads(data_str)
                                delta = data_json["choices"][0]["delta"]
                                if "content" in delta:
                                    yield f"data: {json.dumps({'type': 'content', 'content': delta['content']})}\n\n"
                            except Exception:
                                pass
                
                # Push database updates to client
                if profile_updated:
                    yield f"data: {json.dumps({'type': 'profile_update', 'profile': current_profile.model_dump()})}\n\n"
                    await asyncio.sleep(0.2)
                if path_updated:
                    nodes_list = [n.model_dump() for n in db_get_path_nodes(target_user)]
                    yield f"data: {json.dumps({'type': 'path_update', 'nodes': nodes_list})}\n\n"
                    await asyncio.sleep(0.2)
            else:
                # LLM API call failed, fallback to simulator
                async for chunk in run_fallback_simulator(request.messages, current_profile):
                    yield chunk
        else:
            # No LLM API key provided, default to simulator fallback
            async for chunk in run_fallback_simulator(request.messages, current_profile):
                yield chunk
            
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    async def run_fallback_simulator(messages, profile):
        yield f"data: {json.dumps({'type': 'status', 'status': '⚠️ 未检测到 API Key，已自动启用本地仿真模型。'})}\n\n"
        await asyncio.sleep(0.6)
        yield f"data: {json.dumps({'type': 'status', 'status': ''})}\n\n"
        
        user_input_clean = messages[-1].content.lower() if messages else ""
        profile_updated_sim = False
        path_updated_sim = False
        
        if "beginner" in user_input_clean or "初学者" in user_input_clean or "不懂" in user_input_clean:
            profile.knowledge_base = 15
            profile.learning_pace = 30
            profile.cognitive_style = "Visual/Guided"
            profile.error_patterns = ["Basic logic errors", "Syntax Errors"]
            profile_updated_sim = True
        elif "advanced" in user_input_clean or "懂一点" in user_input_clean or "有基础" in user_input_clean:
            profile.knowledge_base = 65
            profile.learning_pace = 75
            profile.cognitive_style = "Theoretical/Self-Paced"
            profile_updated_sim = True
            
        if "machine learning" in user_input_clean or "机器学习" in user_input_clean or "算法" in user_input_clean:
            if "Machine Learning" not in profile.learning_goals:
                profile.learning_goals = ["Machine Learning"]
                db_sync_path_nodes_by_goals(target_user, ["Machine Learning"])
                profile_updated_sim = True
                path_updated_sim = True
        elif "python" in user_input_clean or "基础" in user_input_clean or "重置" in user_input_clean:
            if "Python Basics" not in profile.learning_goals:
                profile.learning_goals = ["Python Basics"]
                db_sync_path_nodes_by_goals(target_user, ["Python Basics"])
                profile_updated_sim = True
                path_updated_sim = True
                
        if profile_updated_sim:
            db_save_profile(target_user, profile)

        tutor_response = ""
        if "machine learning" in user_input_clean or "机器学习" in user_input_clean:
            tutor_response = "您好！我已经收到了您的学习期望。系统已经检测到您对**机器学习**感兴趣。我已为您加载了《机器学习核心理论与应用实操》的个性化学习路径，包括从线性代数到神经网络的实践案例。我们可以先从第一关“线性代数基础”开始！"
        elif "beginner" in user_input_clean or "初学者" in user_input_clean or "不懂" in user_input_clean:
            tutor_response = "没关系！我们都会从零开始。我已经把您的学习节奏调到了**慢速温和**模式，并降低了初始难度门槛（知识库水平已调整为 15%）。学习路径里的内容现在将包含更多的代码注释和可视化卡片。让我们先试试“Python变量”第一课吧！"
        else:
            tutor_response = f"您好！我是您的个性化 AI 助教。我已经接收到了您的消息：“{user_input_clean}”。基于多智能体协同，我为您量身定制了这套方案。在对话过程中，我会自动评估您的学习特征，并实时微调左侧的动态学习雷达画像与下方的学习路径。"
            
        chunk_size = 5
        for i in range(0, len(tutor_response), chunk_size):
            chunk = tutor_response[i:i+chunk_size]
            yield f"data: {json.dumps({'type': 'content', 'content': chunk})}\n\n"
            await asyncio.sleep(0.04)
            
        if profile_updated_sim:
            yield f"data: {json.dumps({'type': 'profile_update', 'profile': profile.model_dump()})}\n\n"
            await asyncio.sleep(0.2)
        if path_updated_sim:
            nodes_list = [n.model_dump() for n in db_get_path_nodes(target_user)]
            yield f"data: {json.dumps({'type': 'path_update', 'nodes': nodes_list})}\n\n"
            await asyncio.sleep(0.2)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
