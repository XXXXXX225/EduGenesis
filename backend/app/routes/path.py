import os
import json
import sqlite3
from fastapi import APIRouter, HTTPException, Depends
from app.auth_utils import get_current_username
from app.models import PathNode, CompleteNodeRequest
from app.db import (
    DB_PATH,
    python_path_nodes,
    ml_path_nodes,
    db_get_profile,
    db_get_path_nodes,
    db_save_path_nodes,
    db_save_profile,
    db_log_agent_action,
    get_fallback_assets_for_topic,
    db_get_error_tags,
    db_insert_reinforcement_node,
    db_delete_reinforcement_node,
    db_cleanup_reinforcement_nodes,
    db_record_contribution
)
from app.limiter import rate_limit_resource
from app.ai.scenes import generate_path_nodes

router = APIRouter()

@router.get("/path")
def get_path(current_username: str = Depends(get_current_username)):
    nodes = db_get_path_nodes(current_username)
    return {"nodes": nodes}

@router.post("/path/regenerate", dependencies=[Depends(rate_limit_resource)])
def regenerate_path(current_username: str = Depends(get_current_username)):
    target_user = current_username
    profile = db_get_profile(target_user)
    goals = profile.learning_goals
    
    # Try calling the AI path planner
    ai_nodes = generate_path_nodes(goals, profile.cognitive_style, target_user)
    
    new_nodes = []
    if ai_nodes and len(ai_nodes) == 8:
        for idx, node in enumerate(ai_nodes):
            # Safely get node id or default to node{index}
            node_id = node.get("id") or node.get("node_id") or f"node{idx+1}"
            
            # Maintain correct lock/unlock status for the nodes
            status = "completed" if node_id == "node1" else ("active" if node_id == "node2" else "locked")
            
            # Ensure "video" and "mindmap" are always included in the node's resources
            node_resources = list(node.get("resources", []))
            if "video" not in node_resources:
                node_resources.append("video")
            if "mindmap" not in node_resources:
                node_resources.append("mindmap")
                
            new_nodes.append(
                PathNode(
                    id=node_id,
                    title=node.get("title", f"关卡{idx+1}"),
                    status=status,
                    description=node.get("description", ""),
                    resources=node_resources
                )
            )
        db_log_agent_action(target_user, "路径智能体", f"定制路径规划完成！已通过大模型在线实时生成 8 个定制自适应关卡。", "info")
    else:
        # Fallback to predefined lists
        is_ml = any(any(x in g for x in ["Machine Learning", "机器学习", "machine_learning"]) for g in goals)
        base_nodes = ml_path_nodes if is_ml else python_path_nodes
        style = profile.cognitive_style.lower()
        
        for node in base_nodes:
            desc = node.description
            if "practical" in style:
                desc += " (已针对您的实操风格，增加核心编码练习与PyTest断言用例)"
            elif "visual" in style:
                desc += " (已针对您的直观视觉风格，植入思维脑图与音画对齐幻灯课件)"
            else:
                desc += " (已为您强化深度概念精讲、文献引用与防御性编码理论)"
                
            node_resources = list(node.resources)
            if "video" not in node_resources:
                node_resources.append("video")
                
            new_nodes.append(
                PathNode(
                    id=node.id,
                    title=node.title,
                    status="completed" if node.id == "node1" else ("active" if node.id == "node2" else "locked"),
                    description=desc,
                    resources=node_resources
                )
            )
        db_log_agent_action(target_user, "路径智能体", f"大模型接口离线，已启用自适应静态路径模板为您匹配 8 个关卡。", "warning")
            
    db_save_path_nodes(target_user, new_nodes)
    
    # 1. Clear old user resources cache to prevent title/data mismatch
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM user_resources WHERE username = ?", (target_user,))
    conn.commit()
    conn.close()
    
    # 2. Pre-generate and write back resources for ALL nodes to SQLite to ensure instant loading for presentation
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    for node in new_nodes:
        node_assets = get_fallback_assets_for_topic(node.title, profile, node.id)
        for res_type in node.resources:
            content_val = node_assets.get(res_type, "")
            if not isinstance(content_val, str):
                content_val = json.dumps(content_val, ensure_ascii=False)
            cursor.execute(
                "INSERT OR REPLACE INTO user_resources (username, node_id, resource_type, content) VALUES (?, ?, ?, ?)",
                (target_user, node.id, res_type, content_val)
            )
            
    conn.commit()
    conn.close()
    
    return {"status": "success", "nodes": new_nodes}

@router.post("/path/complete-node")
def complete_node(request: CompleteNodeRequest, current_username: str = Depends(get_current_username)):
    target_user = current_username
    nodes = db_get_path_nodes(target_user)
    profile = db_get_profile(target_user)
    
    node_found = False
    current_idx = -1
    
    for idx, node in enumerate(nodes):
        if node.id == request.node_id:
            node.status = "completed"
            node_found = True
            current_idx = idx
            break
            
    if not node_found:
        raise HTTPException(status_code=404, detail="Node not found in user path.")
        
    next_node_to_unlock = None
    is_failed_quiz = False
    
    # Check if quiz was failed (< 60% accuracy)
    if request.score is not None and request.total is not None and request.total > 0:
        accuracy = (request.score / request.total) * 100
        if accuracy < 60:
            is_failed_quiz = True
            
    if is_failed_quiz:
        # Dynamic Reinforcement Branch Insertion
        current_node = nodes[current_idx]
        extra_node_id = f"{request.node_id}_extra"
        
        # Check if the extra node is already present in the list to avoid duplicate insertions
        exists = any(n.id == extra_node_id for n in nodes)
        if not exists:
            extra_node = PathNode(
                id=extra_node_id,
                title=f"【加固】{current_node.title}强化",
                status="active",
                description=f"自适应评测提示：由于您在“{current_node.title}”自适应测试中表现出薄弱点，画像智能体已为您插入该加固关卡。系统已为您自动调配 courses 高校知识库专属课本及针对性 PyTest 单元测试练习。",
                resources=["pdf", "code", "video"]
            )
            # Insert right after the current completed node
            nodes.insert(current_idx + 1, extra_node)
            next_node_to_unlock = extra_node
            
            # Lock all nodes after the extra node to force completion of the reinforcement node first
            for next_idx in range(current_idx + 2, len(nodes)):
                nodes[next_idx].status = "locked"
        else:
            # If it already exists, just make sure it's active
            for n in nodes:
                if n.id == extra_node_id:
                    n.status = "active"
                    next_node_to_unlock = n
                    break
                    
        # Update user profile to reflect mistakes and lower knowledge score
        profile.engagement = min(100, profile.engagement + 5)
        wrong_count = request.total - request.score
        profile.knowledge_base = max(10, profile.knowledge_base - wrong_count * 4)
        err_pattern = f"{current_node.title}概念与语法偏差"
        if err_pattern not in profile.error_patterns:
            profile.error_patterns.append(err_pattern)
        db_save_profile(target_user, profile)
        
        db_log_agent_action(target_user, "画像智能体", f"自适应评估未通过：已对该章节易错模式进行记录，在画像中标记易错领域 [{err_pattern}]。", "warning")
        db_log_agent_action(target_user, "路径智能体", f"启动动态加固机制！在后续路径中成功插入并激活加固关卡 [{next_node_to_unlock.title}]，已成功适配资源包。", "consensus")
    else:
        # Standard Unlock Flow (Quiz Passed, or direct complete)
        if current_idx + 1 < len(nodes):
            next_node_to_unlock = nodes[current_idx + 1]
            
        if next_node_to_unlock and next_node_to_unlock.status == "locked":
            next_node_to_unlock.status = "active"
            
        # Update profile knowledge score if they passed a quiz
        if request.score is not None:
            profile.knowledge_base = min(100, profile.knowledge_base + 6)
            db_save_profile(target_user, profile)
            db_log_agent_action(target_user, "画像智能体", "自适应评估合格：知识库掌握度提升，未发现显著认知偏离。", "consensus")
            
        db_log_agent_action(target_user, "路径智能体", f"关卡节点 [{request.node_id}] 通关标记更新，解锁下一阶段关卡。", "info")
        
    # Save the updated path nodes list first so subsequent db calls see the updated status!
    db_save_path_nodes(target_user, nodes)
        
    # Dynamic path reinforcement: check error tags and insert reinforcement node
    error_tags = db_get_error_tags(target_user)
    if error_tags:
        nodes = db_insert_reinforcement_node(target_user, request.node_id, error_tags)
    
    # If completed node is a reinforcement node, clean it up
    if request.node_id.startswith("reinforce_"):
        nodes = db_delete_reinforcement_node(target_user, request.node_id)
        
    # Save the updated path nodes list again (after insertion/deletion)
    db_save_path_nodes(target_user, nodes)
    
    # Update mastered count in profile
    completed_count = sum(1 for n in nodes if n.status == "completed")
    profile.learning_stats["mastered_nodes"] = min(8, completed_count)
    db_save_profile(target_user, profile)
    
    # Pre-seed resources for the newly unlocked active node (standard or extra)
    if next_node_to_unlock:
        fallback_assets = get_fallback_assets_for_topic(next_node_to_unlock.title, profile, next_node_to_unlock.id)
        
        # Fetch fallback assets first (which is instant and contains fallback videos)
        pass
                
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        for res_type in next_node_to_unlock.resources:
            cursor.execute(
                "SELECT count(*) FROM user_resources WHERE username = ? AND node_id = ? AND resource_type = ?",
                (target_user, next_node_to_unlock.id, res_type)
            )
            exists = cursor.fetchone()[0]
            if exists == 0:
                content_val = fallback_assets.get(res_type, "")
                if not isinstance(content_val, str):
                    content_val = json.dumps(content_val, ensure_ascii=False)
                cursor.execute(
                    "INSERT OR REPLACE INTO user_resources (username, node_id, resource_type, content) VALUES (?, ?, ?, ?)",
                    (target_user, next_node_to_unlock.id, res_type, content_val)
                )
        conn.commit()
        conn.close()
        
    db_record_contribution(target_user, 1)
    updated_nodes = db_get_path_nodes(target_user)
    return {"nodes": [n.model_dump() for n in updated_nodes]}
