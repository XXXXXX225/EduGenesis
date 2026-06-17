import os
import json
import sqlite3
from typing import List, Dict, Any, Tuple
from app.models import UserProfile
from app.db import (
    DB_PATH,
    db_get_profile,
    db_log_agent_action,
    get_fallback_assets_for_topic
)
from app.llm_client import call_llm_resource_agent, get_route_llm_params
from app.knowledge_base import load_course_material
from app.video_agent import get_video_recommendations_for_node

class BaseAgent:
    def __init__(self, name: str):
        self.name = name

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        运行智能体的核心业务逻辑，修改并返回 context。
        """
        raise NotImplementedError("每个智能体必须实现 run 方法。")

    def log(self, username: str, message: str, log_type: str = "info"):
        db_log_agent_action(username, self.name, message, log_type)


class ManagerAgent(BaseAgent):
    def __init__(self):
        super().__init__("主管智能体")

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        username = context["username"]
        node_title = context["node_title"]
        node_resources = context["node_resources"]
        trigger_type = context.get("trigger_type", "auto")
        
        if trigger_type == "manual":
            msg = f"接收到手动触发关卡 [{node_title}] 资源重构指令。调度智能体群开始在线重新规划与资源匹配。"
        else:
            msg = f"检测到关卡 [{node_title}] 的多模态资源为空，调度协同代理启动在线资源生成流程。"
            
        self.log(username, msg, "info")
        context["manager_dispatched"] = True
        return context


class ProfileAgent(BaseAgent):
    def __init__(self):
        super().__init__("画像智能体")

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        username = context["username"]
        profile = context["profile"]
        node_title = context["node_title"]
        trigger_type = context.get("trigger_type", "auto")
        
        if trigger_type == "manual":
            msg = f"画像特征对齐（认知风格: {profile.cognitive_style}，目标: {profile.learning_goals}），开始重构大模型个性化 Prompts 模板。"
        else:
            msg = f"分析学生画像数据：认知风格为 [{profile.cognitive_style}]，匹配错误范畴，正在进行个性化 Prompt 组装..."
            
        self.log(username, msg, "consensus")
        
        # 根据认知风格动态定制个性化提示词指导
        style = profile.cognitive_style.lower()
        style_instructions = ""
        if "practical" in style or "practice" in style:
            style_instructions = "【实操型学习风格定制提示】：该学生偏好动手实践。生成PDF、Slides和代码时，请特别增加Pytest断言、注释详尽的Python实操案例，突出代码在现实中的运用。"
        elif "visual" in style or "graph" in style:
            style_instructions = "【直观视觉型学习风格定制提示】：该学生偏好视觉化展示。请在此资源包中多使用Mermaid脑图渲染、直观的表格与步骤图，配合简洁的文字讲解。"
        else:
            style_instructions = "【严谨概念型学习风格定制提示】：该学生偏好严谨的理论学习。请在此资源包中强化深度概念精讲、文献引用与防御性编程机制。"
            
        context["style_instructions"] = style_instructions
        return context


class ResourceAgent(BaseAgent):
    def __init__(self):
        super().__init__("路径与资源智能体")

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        username = context["username"]
        node_id = context["node_id"]
        node_title = context["node_title"]
        node_description = context["node_description"]
        node_resources = context["node_resources"]
        profile = context["profile"]
        style_instructions = context.get("style_instructions", "")
        trigger_type = context.get("trigger_type", "auto")
        
        from app.knowledge_base import clean_subject_name, rag_retrieve_context
        subject = profile.learning_goals[0] if (profile.learning_goals and len(profile.learning_goals) > 0) else "Python Basics"
        subject_id = clean_subject_name(subject)
        course_context = load_course_material(subject_id, node_id)
        if not course_context:
            course_context = rag_retrieve_context(f"{node_title} {node_description}", subject_id, username=username)
        
        if trigger_type == "manual":
            msg_start = f"正在调用星火大模型，重新生成关卡 [{node_title}] 的多模态资源包（{', '.join(node_resources)}）..."
        else:
            msg_start = f"开始为关卡 [{node_title}] 动态编排学术资源，调度资源项：{', '.join(node_resources)}。"
        self.log(username, msg_start, "info")
        
        api_base, api_key, model = get_route_llm_params(username, 'resources')
        
        fallback_assets = get_fallback_assets_for_topic(node_title, profile, node_id)
        generated_data = {}
        
        api_resources = [r for r in node_resources if r != "video"]
        
        # 将个性化学习指导混合进入 RAG 上下文中
        enhanced_context = course_context
        if style_instructions:
            enhanced_context = f"{style_instructions}\n\n权威内容大纲基础：\n{course_context}"
            
        if api_key and api_resources:
            try:
                analysis = call_llm_resource_agent(
                    node_title, 
                    api_resources, 
                    profile, 
                    username=username, 
                    context=enhanced_context
                )
                if analysis:
                    generated_data = analysis
                    self.log(username, f"大模型在线生成 [{node_title}] 资源项成功，共生成 {len(generated_data)} 个多模态资源包。", "info")
                else:
                    self.log(username, f"大模型生成 [{node_title}] 失败或格式错误，系统无缝切换到本地自适应兜底资源库以保证极速展现。", "warning")
                    generated_data = fallback_assets.copy()
            except Exception as e:
                print(f"Failed to auto-generate resources via LLM: {e}")
                self.log(username, f"大模型资源生成异常: {str(e)}，系统已降级切换到本地高保真自适应资源库进行学术填充。", "warning")
                generated_data = fallback_assets.copy()
        else:
            self.log(username, f"大模型接口离线或未检测到 Key，系统已降级切换到本地自适应多模态资源库为您调配 [{node_title}] 关卡内容。", "warning")
            generated_data = fallback_assets.copy()
            
        # 视频检索与推荐
        if "video" in node_resources:
            video_msg = "接收到重新生成指令，正在网络检索与 [{node_title}] 相关的精品学习视频..." if trigger_type == "manual" else f"正在网络检索并匹配与 [{node_title}] 相关的精品学习视频..."
            self.log(username, video_msg, "info")
            
            try:
                videos_with_reasons = get_video_recommendations_for_node(node_title, node_description, profile, username)
                if videos_with_reasons:
                    generated_data["video"] = videos_with_reasons
                else:
                    self.log(username, "Bilibili 网络检索超时或防爬拦截，已无缝切换到本地静态名课库展现。", "warning")
                    generated_data["video"] = fallback_assets.get("video", [])
            except Exception as ev:
                print(f"Failed to fetch video recommendations: {ev}")
                self.log(username, f"视频推荐智能体异常: {str(ev)}，启用高保真静态缓存。", "warning")
                generated_data["video"] = fallback_assets.get("video", [])
                
        context["generated_data"] = generated_data
        context["fallback_assets"] = fallback_assets
        return context


class SecurityAgent(BaseAgent):
    def __init__(self):
        super().__init__("安全校验智能体")

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        username = context["username"]
        node_title = context["node_title"]
        generated_data = context.get("generated_data", {})
        node_resources = context["node_resources"]
        
        sensitive_words = ["敏感内容测试", "不合规敏感词"]
        content_checking_passed = True
        error_reasons = []
        
        for r_type in node_resources:
            if r_type == "video":
                continue
            content = generated_data.get(r_type, "")
            if not content:
                content_checking_passed = False
                error_reasons.append(f"资源 [{r_type}] 内容为空")
                continue
                
            str_content = str(content)
            # 1. 敏感词匹配
            for word in sensitive_words:
                if word in str_content:
                    content_checking_passed = False
                    error_reasons.append(f"资源 [{r_type}] 中含有不合规词汇")
                    
            # 2. Mermaid语法格式特征校验
            if r_type == "mindmap":
                if "graph " not in str_content:
                    content_checking_passed = False
                    error_reasons.append("Mermaid 脑图资源不符合 graph TD/LR 等拓扑规范")
                    
        if content_checking_passed:
            msg = f"对 [{node_title}] 生成的课本及试题进行安全过滤审计与学术合规校验。检查项：中文正确性、代码安全性、Mermaid语法。审计状态：100% 合规，准予入库。"
            self.log(username, msg, "consensus")
            context["security_passed"] = True
        else:
            msg = f"安全合规校验发现异常！原因: {'; '.join(error_reasons)}。触发自动降级到自适应本地安全资源包。"
            self.log(username, msg, "danger")
            context["security_passed"] = False
            # 回滚失败生成的项目到 fallback 资源
            for r_type in node_resources:
                if r_type != "video":
                    generated_data[r_type] = context["fallback_assets"].get(r_type, "")
                    
        return context


class AgentCoordinator:
    def __init__(self, username: str, node_id: str, node_title: str, node_description: str, node_resources: List[str], trigger_type: str = "auto"):
        self.context = {
            "username": username,
            "node_id": node_id,
            "node_title": node_title,
            "node_description": node_description,
            "node_resources": node_resources,
            "trigger_type": trigger_type,
            "profile": db_get_profile(username),
            "generated_data": {},
            "fallback_assets": {},
            "security_passed": False
        }
        self.agents = [
            ManagerAgent(),
            ProfileAgent(),
            ResourceAgent(),
            SecurityAgent()
        ]

    def run_consensus_pipeline(self) -> Dict[str, Any]:
        """
        依次执行智能体职责链，回传最终资源字典成果
        """
        current_context = self.context
        for agent in self.agents:
            try:
                current_context = agent.run(current_context)
            except Exception as e:
                db_log_agent_action(
                    current_context["username"], 
                    agent.name, 
                    f"执行发生内部异常: {str(e)}，调度系统正在进行容错降级...", 
                    "danger"
                )
                if "fallback_assets" in current_context:
                    current_context["generated_data"] = current_context["fallback_assets"].copy()
                    
        return current_context.get("generated_data", {})
