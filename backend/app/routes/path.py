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
    get_fallback_assets_for_topic
)
from app.limiter import rate_limit_resource
from app.llm_client import call_llm_path_planner

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
    ai_nodes = call_llm_path_planner(goals, profile.cognitive_style, target_user)
    
    new_nodes = []
    if ai_nodes and len(ai_nodes) == 8:
        for idx, node in enumerate(ai_nodes):
            # Maintain correct lock/unlock status for the nodes
            status = "completed" if node["id"] == "node1" else ("active" if node["id"] == "node2" else "locked")
            
            # Ensure "video" is always included in the node's resources
            node_resources = list(node.get("resources", []))
            if "video" not in node_resources:
                node_resources.append("video")
                
            new_nodes.append(
                PathNode(
                    id=node["id"],
                    title=node["title"],
                    status=status,
                    description=node["description"],
                    resources=node_resources
                )
            )
        db_log_agent_action(target_user, "路径智能体", f"定制路径规划完成！已通过大模型在线实时生成 8 个定制自适应关卡。", "info")
    else:
        # Fallback to predefined lists
        is_ml = any("Machine Learning" in g for g in goals)
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
    
    # 2. Pre-generate assets for node1 and node2 based on current profile
    # Fetch fallback assets first (which is instant)
    fallback_n1 = get_fallback_assets_for_topic(new_nodes[0].title, profile, new_nodes[0].id)
    fallback_n2 = get_fallback_assets_for_topic(new_nodes[1].title, profile, new_nodes[1].id)
    
    # 3. Crawl live Bilibili videos dynamically in Python space (outside SQLite lock)
    if "video" in new_nodes[0].resources:
        try:
            from app.video_agent import get_video_recommendations_for_node
            videos_with_reasons = get_video_recommendations_for_node(
                new_nodes[0].title, new_nodes[0].description, profile, target_user
            )
            if videos_with_reasons:
                fallback_n1["video"] = videos_with_reasons
        except Exception as e:
            print(f"Failed to pre-crawl Bilibili videos for node1: {e}")
            
    if "video" in new_nodes[1].resources:
        try:
            from app.video_agent import get_video_recommendations_for_node
            videos_with_reasons = get_video_recommendations_for_node(
                new_nodes[1].title, new_nodes[1].description, profile, target_user
            )
            if videos_with_reasons:
                fallback_n2["video"] = videos_with_reasons
        except Exception as e:
            print(f"Failed to pre-crawl Bilibili videos for node2: {e}")
            
    # 4. Write back all resources to SQLite
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # node1
    for res_type in new_nodes[0].resources:
        content_val = fallback_n1.get(res_type, "")
        if not isinstance(content_val, str):
            content_val = json.dumps(content_val, ensure_ascii=False)
        cursor.execute(
            "INSERT OR REPLACE INTO user_resources (username, node_id, resource_type, content) VALUES (?, ?, ?, ?)",
            (target_user, new_nodes[0].id, res_type, content_val)
        )
        
    # node2
    for res_type in new_nodes[1].resources:
        content_val = fallback_n2.get(res_type, "")
        if not isinstance(content_val, str):
            content_val = json.dumps(content_val, ensure_ascii=False)
        cursor.execute(
            "INSERT OR REPLACE INTO user_resources (username, node_id, resource_type, content) VALUES (?, ?, ?, ?)",
            (target_user, new_nodes[1].id, res_type, content_val)
        )
        
    conn.commit()
    conn.close()
    
    return {"status": "success", "nodes": new_nodes}

@router.post("/path/complete-node")
def complete_node(request: CompleteNodeRequest, current_username: str = Depends(get_current_username)):
    target_user = current_username
    nodes = db_get_path_nodes(target_user)
    
    node_found = False
    next_node_to_unlock = None
    
    for idx, node in enumerate(nodes):
        if node.id == request.node_id:
            node.status = "completed"
            node_found = True
            if idx + 1 < len(nodes):
                next_node_to_unlock = nodes[idx + 1]
            break
            
    if not node_found:
        raise HTTPException(status_code=404, detail="Node not found in user path.")
        
    if next_node_to_unlock and next_node_to_unlock.status == "locked":
        next_node_to_unlock.status = "active"
        
    db_save_path_nodes(target_user, nodes)
    
    profile = db_get_profile(target_user)
    completed_count = sum(1 for n in nodes if n.status == "completed")
    profile.learning_stats["mastered_nodes"] = completed_count
    db_save_profile(target_user, profile)
    
    db_log_agent_action(target_user, "路径智能体", f"关卡节点 [{request.node_id}] 通关标记更新，解锁下一阶段关卡。", "info")
    
    if next_node_to_unlock:
        fallback_assets = get_fallback_assets_for_topic(next_node_to_unlock.title, profile, next_node_to_unlock.id)
        
        # Crawl Bilibili videos dynamically in Python space
        if "video" in next_node_to_unlock.resources:
            try:
                from app.video_agent import get_video_recommendations_for_node
                videos_with_reasons = get_video_recommendations_for_node(
                    next_node_to_unlock.title, next_node_to_unlock.description, profile, target_user
                )
                if videos_with_reasons:
                    fallback_assets["video"] = videos_with_reasons
            except Exception as e:
                print(f"Failed to crawl live Bilibili videos for unlocked node: {e}")
                
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
        
    updated_nodes = db_get_path_nodes(target_user)
    return {"nodes": [n.model_dump() for n in updated_nodes]}
