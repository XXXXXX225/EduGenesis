import os
import json
import asyncio
from fastapi import APIRouter, Depends
from app.auth_utils import get_current_username
from fastapi.responses import StreamingResponse
from app.models import ChatRequest
import uuid
import datetime
from app.db import (
    db_get_profile,
    db_save_profile,
    db_get_path_nodes,
    db_sync_path_nodes_by_goals,
    db_get_all_registered_courses,
    db_auto_register_course,
    db_create_chat_session,
    db_get_chat_sessions,
    db_update_chat_session_title,
    db_delete_chat_session,
    db_clear_chat_sessions,
    db_save_chat_message,
    db_get_chat_messages
)
from app.limiter import rate_limit_chat
from app.ai.platform import get_capability_config
from app.ai.scenes import analyze_chat_profile, stream_tutor_reply, optimize_rag_query
from app.ai.rag import rag_retrieve_context

router = APIRouter()

@router.get("/chat/sessions")
async def get_sessions(current_username: str = Depends(get_current_username)):
    return db_get_chat_sessions(current_username)

@router.post("/chat/sessions")
async def create_session(request: dict, current_username: str = Depends(get_current_username)):
    session_id = request.get("session_id") or str(uuid.uuid4())
    title = request.get("title") or "新对话"
    db_create_chat_session(current_username, session_id, title)
    return {"session_id": session_id, "title": title}

@router.put("/chat/sessions/{session_id}")
async def update_session(session_id: str, request: dict, current_username: str = Depends(get_current_username)):
    title = request.get("title", "未命名会话")
    db_update_chat_session_title(session_id, title)
    return {"status": "success"}

@router.delete("/chat/sessions/{session_id}")
async def delete_session(session_id: str, current_username: str = Depends(get_current_username)):
    db_delete_chat_session(session_id)
    return {"status": "success"}

@router.delete("/chat/sessions")
async def clear_sessions(current_username: str = Depends(get_current_username)):
    db_clear_chat_sessions(current_username)
    return {"status": "success"}

@router.get("/chat/sessions/{session_id}/messages")
async def get_session_messages(session_id: str, current_username: str = Depends(get_current_username)):
    return db_get_chat_messages(session_id)

@router.post("/chat", dependencies=[Depends(rate_limit_chat)])
async def chat_interaction(request: ChatRequest, current_username: str = Depends(get_current_username)):
    target_user = current_username
    current_profile = db_get_profile(target_user)
    _chat_cfg = get_capability_config(target_user, 'chat')
    
    async def event_generator():
        assistant_chunks = []
        
        # Save user message to the DB
        now_ts = datetime.datetime.now().isoformat()
        if request.session_id and request.messages:
            user_msg = request.messages[-1]
            db_save_chat_message(
                session_id=request.session_id,
                message_id=f"user-{now_ts}-{str(uuid.uuid4())[:8]}",
                role="user",
                content=user_msg.content
            )
            
            # Automatically rename the session title if it's currently "新对话" and this is the first user message
            sessions = db_get_chat_sessions(target_user)
            current_sess = next((s for s in sessions if s["session_id"] == request.session_id), None)
            if current_sess and current_sess["title"] == "新对话":
                new_title = user_msg.content[:15] + ("..." if len(user_msg.content) > 15 else "")
                db_update_chat_session_title(request.session_id, new_title)

        # Fetch relevant Bilibili videos from video agent
        from app.video_agent import get_video_recommendations_for_node
        rec_videos = []
        try:
            active_node = None
            nodes = db_get_path_nodes(target_user)
            active_node = next((n for n in nodes if n.status == 'active'), None)
            if not active_node and nodes:
                active_node = nodes[0]
            
            # Check if user specifically asked for videos in the current message
            user_msg_content = request.messages[-1].content if request.messages else ""
            from app.ai import optimize_video_query_from_message
            specific_kw = await asyncio.to_thread(optimize_video_query_from_message, user_msg_content, target_user)
            
            if specific_kw:
                print(f"[Video Recommendation Query] Extracted specific keyword: '{specific_kw}' from user message")
                node_title = specific_kw
                node_desc = f"关于 {specific_kw} 的精品微课推荐"
            else:
                node_title = active_node.title if active_node else "Python 变量与数据类型"
                node_desc = active_node.description if active_node else "探索 Python 基础语法"
            
            rec_videos = await asyncio.to_thread(
                get_video_recommendations_for_node,
                node_title,
                node_desc,
                current_profile,
                target_user
            )
        except Exception as e:
            print(f"Failed to fetch videos in chat route: {e}")

        # Step 1: Supervisor orchestrator thinking state
        yield f"data: {json.dumps({'type': 'status', 'status': '🧠 [主管智能体] 正在唤醒协同智能体网络...'})}\n\n"
        await asyncio.sleep(0.4)
        
        if _chat_cfg.api_key:
            # Step 2: Structured Analyzer Call
            yield f"data: {json.dumps({'type': 'status', 'status': '📊 [画像智能体] 正在对您的认知指标进行多维提取与诊断...'})}\n\n"
            
            analysis = await asyncio.to_thread(analyze_chat_profile, request.messages, current_profile, target_user)
            
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
                if not subj and "profile_updates" in analysis and isinstance(analysis["profile_updates"], dict):
                    subj = analysis["profile_updates"].get("switch_to_subject")
                
                if subj:
                    subj_str = str(subj).strip().lower()
                    all_courses = db_get_all_registered_courses()
                    matched_course = None
                    for course in all_courses:
                        c_display = course["display_name"].lower()
                        c_id = course["course_id"].lower()
                        kws = [k.lower() for k in course.get("keywords", [])]
                        
                        # Match display name, course ID, or any of the keywords
                        if subj_str == c_display or subj_str == c_id or subj_str in c_display or c_display in subj_str or any(kw in subj_str for kw in kws):
                            matched_course = course
                            break
                            
                    if matched_course:
                        subj = matched_course["display_name"]
                        
                if subj and subj not in current_profile.learning_goals:
                    # Check if course is already registered
                    all_courses = db_get_all_registered_courses()
                    valid_names = {c["display_name"] for c in all_courses}
                    
                    if subj not in valid_names:
                        # Auto-register the new course on-the-fly!
                        yield f"data: {json.dumps({'type': 'status', 'status': f'🎓 [规划智能体] 正在为「{subj}」自动生成课程大纲，请稍候...'})}\n\n"
                        registered_ok = await asyncio.to_thread(db_auto_register_course, subj, target_user)
                        if registered_ok:
                            valid_names.add(subj)
                    
                    if subj in valid_names:
                        current_profile.learning_goals = [subj]
                        db_sync_path_nodes_by_goals(target_user, [subj])
                        profile_updated = True
                        path_updated = True
            
            if profile_updated:
                db_save_profile(target_user, current_profile)
                
            yield f"data: {json.dumps({'type': 'status', 'status': '📍 [路径智能体] 正在优化您的知识时间轴拓扑结构...'})}\n\n"
            await asyncio.sleep(0.4)
            
            yield f"data: {json.dumps({'type': 'status', 'status': '💬 [导师智能体] 正在根据新画像为您生成个性化讲义...'})}\n\n"
            
            from app.knowledge_base import clean_subject_name
            subject = current_profile.learning_goals[0] if (current_profile.learning_goals and len(current_profile.learning_goals) > 0) else "python_basics"
            subject_id = clean_subject_name(subject)
            user_msg = request.messages[-1].content if request.messages else ""
            knowledge_context = ""
            if user_msg:
                if len(request.messages) > 1:
                    optimized_query = await asyncio.to_thread(optimize_rag_query, request.messages, target_user)
                    print(f"[RAG Query Optimization] Original: '{user_msg}' -> Optimized: '{optimized_query}'")
                else:
                    optimized_query = user_msg
                knowledge_context = rag_retrieve_context(optimized_query, subject_id, username=target_user)

            stream_response = await asyncio.to_thread(
                stream_tutor_reply,
                request.messages,
                current_profile,
                target_user,
                rec_videos,
                request.tutor_personality,
                knowledge_context
            )
            
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
                                if "content" in delta and delta["content"] is not None:
                                    assistant_chunks.append(delta["content"])
                                    yield f"data: {json.dumps({'type': 'content', 'content': delta['content']})}\n\n"
                            except Exception:
                                pass
                
                # If LLM stream produced no content (e.g. API authentication error), fallback to simulator
                if not assistant_chunks:
                    async for chunk in run_fallback_simulator(request.messages, current_profile, rec_videos, assistant_chunks):
                        yield chunk
                else:
                    # Check if we should auto-append video recommendation cards
                    full_reply = "".join(assistant_chunks)
                    user_msg_lower = user_msg.lower() if user_msg else ""
                    video_keywords = ["视频", "录像", "推荐几段", "视频推荐", "b站", "bilibili", "哔哩哔哩", "推荐视频", "视频链接", "网课", "vlog", "讲解", "mv", "课程"]
                    if any(kw in user_msg_lower for kw in video_keywords) or (request.messages and "video" in request.messages[-1].content.lower()):
                        if rec_videos and "[VIDEO_RECOMMEND:" not in full_reply:
                            append_text = "\n\n为您推荐以下相关微课视频，您可以直接点击播放：\n"
                            yield f"data: {json.dumps({'type': 'content', 'content': append_text})}\n\n"
                            assistant_chunks.append(append_text)
                            
                            for v in rec_videos[:3]:
                                reason_str = v.get("recommend_reason") or v.get("reason") or "精选相关教学视频"
                                video_json_str = json.dumps({
                                    "bvid": v.get("bvid", ""),
                                    "title": v.get("title", ""),
                                    "pic": v.get("pic", ""),
                                    "play": v.get("play", "0"),
                                    "duration": v.get("duration", "00:00"),
                                    "reason": reason_str
                                }, ensure_ascii=False)
                                
                                card_tag = f"\n[VIDEO_RECOMMEND: {video_json_str}]\n"
                                yield f"data: {json.dumps({'type': 'content', 'content': card_tag})}\n\n"
                                assistant_chunks.append(card_tag)

                    # Check if we should auto-append quiz cards
                    quiz_keywords = ["测试", "quiz", "题", "测验", "考试"]
                    if any(kw in user_msg_lower for kw in quiz_keywords) and "[QUIZ:" not in "".join(assistant_chunks):
                        try:
                            from app.ai.scenes import generate_learning_resources
                            res = await asyncio.to_thread(
                                generate_learning_resources,
                                node_title,
                                ["quiz"],
                                current_profile,
                                target_user,
                                knowledge_context
                            )
                            if res and "quiz" in res and res["quiz"]:
                                quiz_data = res["quiz"][0]
                                quiz_json_str = json.dumps({
                                    "question": quiz_data.get("question", ""),
                                    "options": quiz_data.get("options", []),
                                    "answer": quiz_data.get("answer", 0),
                                    "explanation": quiz_data.get("explanation", "")
                                }, ensure_ascii=False)
                                
                                append_text = "\n\n根据当前知识点，为您生成了以下随堂测试题，您可以直接点击作答：\n"
                                yield f"data: {json.dumps({'type': 'content', 'content': append_text})}\n\n"
                                assistant_chunks.append(append_text)
                                
                                card_tag = f"\n[QUIZ: {quiz_json_str}]\n"
                                yield f"data: {json.dumps({'type': 'content', 'content': card_tag})}\n\n"
                                assistant_chunks.append(card_tag)
                        except Exception as e:
                            print(f"Failed to generate fallback quiz: {e}")

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
                async for chunk in run_fallback_simulator(request.messages, current_profile, rec_videos, assistant_chunks):
                    yield chunk
        else:
            # No LLM API key provided, default to simulator fallback
            async for chunk in run_fallback_simulator(request.messages, current_profile, rec_videos, assistant_chunks):
                yield chunk
            
        if request.session_id and assistant_chunks:
            full_reply = "".join(assistant_chunks)
            now_ts = datetime.datetime.now().isoformat()
            db_save_chat_message(
                session_id=request.session_id,
                message_id=f"assistant-{now_ts}-{str(uuid.uuid4())[:8]}",
                role="assistant",
                content=full_reply
            )
            
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    async def run_fallback_simulator(messages, profile, rec_videos_list=None, assistant_chunks=None):
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
            
        # Dynamically match user input against all registered courses by keyword
        all_courses = db_get_all_registered_courses()
        switched_course = None
        for course in all_courses:
            kws = course.get("keywords", [])
            # Also check the display_name itself
            check_terms = kws + [course["display_name"].lower()]
            if any(term.lower() in user_input_clean for term in check_terms):
                switched_course = course
                break
        
        if switched_course and switched_course["display_name"] not in profile.learning_goals:
            profile.learning_goals = [switched_course["display_name"]]
            db_sync_path_nodes_by_goals(target_user, [switched_course["display_name"]])
            profile_updated_sim = True
            path_updated_sim = True
                
        if profile_updated_sim:
            db_save_profile(target_user, profile)


        tutor_response = ""
        if "video" in user_input_clean or "视频" in user_input_clean:
            if rec_videos_list:
                v = rec_videos_list[0]
                video_json_str = json.dumps({
                    "bvid": v["bvid"],
                    "title": v["title"],
                    "pic": v["pic"],
                    "play": v["play"],
                    "duration": v["duration"],
                    "reason": v["recommend_reason"]
                }, ensure_ascii=False)
                tutor_response = f"""结合你的学习目标与风格，为您精选了以下来自我们生成资源库的实战精讲视频，均侧重基础夯实，帮您避开常见语法和缩进坑：

[VIDEO_RECOMMEND: {video_json_str}]

如果您看完视频，可以发送“我要做测试”来检验一下自己的基础知识！"""
            else:
                tutor_response = """结合你的学习目标与风格，为您精选了以下实战导向的入门视频，均侧重基础夯实，帮您避开常见语法和缩进坑：

[VIDEO_RECOMMEND: {"bvid": "BV1rpWjevEip", "title": "B站最火的 Python 零基础精讲课程", "pic": "https://i2.hdslb.com/bfs/archive/a979056b1a32012cdd00d48fbc3732d253e30620.jpg", "play": "1671.8万", "duration": "39:58:14", "reason": "B站播放量最高的经典零基础教程，适合新手入门"}]

如果您看完视频，可以发送“我要做测试”来检验一下自己的基础知识！"""
        elif "test" in user_input_clean or "测试" in user_input_clean or "quiz" in user_input_clean or "题" in user_input_clean:
            tutor_response = """根据您的学习画像，我为您量身定制了这道随堂测验，来检验一下您的理解程度：

[QUIZ: {"question": "Python中关于变量声明的描述，以下哪项是正确的？", "options": ["必须使用var或let关键字声明", "变量在第一次赋值时自动创建，不需要声明类型", "必须显式指定变量的类型（如 int x）", "变量名可以以数字开头"], "answer": 1, "explanation": "Python是动态类型语言，变量不需要显式声明类型，在第一次赋值时即被创建。"}]

答完题后，点击选项就可以看到我的深度学术解析！"""
        elif "mindmap" in user_input_clean or "思维导图" in user_input_clean or "脑图" in user_input_clean:
            tutor_response = """为您梳理了当前关卡的核心概念脉络拓扑，请点击右上角放大查看完整大图：

[MINDMAP: graph TD
    A[Python变量] --> B[基础数据类型]
    B --> C[整型 int]
    B --> D[浮点型 float]
    B --> E[字符串 str]
    A --> F[动态类型绑定]
]

这张概念图能帮助您更直观地把握知识拓扑结构。"""
        elif "code" in user_input_clean or "代码" in user_input_clean or "sandbox" in user_input_clean:
            tutor_response = """这是一段带有 PyTest 单元测试校验的代码实例，您可以在卡片上点击“一键运行”在本地沙盒校验，也可以点击“导入沙盒练习”导入到编程面板：

[CODE: python | def check_even(num):
    # 验证是否为偶数
    return num % 2 == 0

def test_check_even():
    assert check_even(2) is True
    assert check_even(3) is False
]

试试看运行它，测试框架会自动输出校验结果！"""
        elif "slide" in user_input_clean or "幻灯片" in user_input_clean or "课件" in user_input_clean:
            tutor_response = """为您加载了本关卡的音画同步幻灯片，点击下方“播读此页”可以体验智能语音导学：

[SLIDES: 欢迎学习自适应模块 | 我们将通过多模态语音播放与动画特效，带您深入浅出地掌握本章核心逻辑。 --- 核心避坑指南与错误模式 | 根据系统对您常见错误的画像诊断，本章节已强化防幻觉和防御性断言测试校验。]

课件会自动随着声音的播放进行翻页。"""
        elif "pdf" in user_input_clean or "课本" in user_input_clean or "教材" in user_input_clean or "讲义" in user_input_clean:
            tutor_response = """为您生成了本章节的个性化自适应教材，点击下方即可进入深色精美阅读视窗阅读：

[PDF: Python变量与动态类型系统 | # Python变量与动态类型系统\\n\\n在Python中，变量不需要显式声明类型。变量类型是动态绑定的。\\n\\n## 1. 动态类型绑定\\n当您写下 `x = 10` 时，Python创建了整型对象 `10`，并将 `x` 指向它。随后执行 `x = 'hello'` 时，`x` 改为指向字符串对象，这体现了动态绑定的灵活性。]

教材采用高质量学术排版，适合离线阅读。"""
        elif "machine learning" in user_input_clean or "机器学习" in user_input_clean:
            tutor_response = "您好！我已经收到了您的学习期望。系统已经检测到您对**机器学习**感兴趣。我已为您加载了《机器学习核心理论与应用实操》的个性化学习路径，包括从线性代数到神经网络的实践案例。我们可以先从第一关“线性代数基础”开始！"
        elif "beginner" in user_input_clean or "初学者" in user_input_clean or "不懂" in user_input_clean:
            tutor_response = "没关系！我们都会从零开始。我已经把您的学习节奏调到了**慢速温和**模式，并降低了初始难度门槛（知识库水平已调整为 15%）。学习路径里的内容现在将包含更多的代码注释和可视化卡片。让我们先试试“Python变量”第一课吧！"
        else:
            tutor_response = f"您好！我是您的个性化 AI 助教。我已经接收到了您的消息：“{user_input_clean}”。基于多智能体协同，我为您量身定制了这套方案。在对话过程中，我会自动评估您的学习特征，并实时微调左侧的动态学习雷达画像与下方的学习路径。"
            
        chunk_size = 5
        for i in range(0, len(tutor_response), chunk_size):
            chunk = tutor_response[i:i+chunk_size]
            if assistant_chunks is not None:
                assistant_chunks.append(chunk)
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
