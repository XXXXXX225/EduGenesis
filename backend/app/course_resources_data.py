# -*- coding: utf-8 -*-
# EduGenesis Demonstration Course Resources Database Loader

from app.course_data.python_basics import PYTHON_BASICS_RESOURCES
from app.course_data.machine_learning import MACHINE_LEARNING_RESOURCES

DEFAULT_TITLES = {
    "python_basics": {
        "node1": "Python 环境部署",
        "node2": "变量与数据类型",
        "node3": "控制流条件判断",
        "node4": "循环控制结构",
        "node5": "内置核心数据结构",
        "node6": "函数与封装抽象",
        "node7": "文件读写与异常处理",
        "node8": "综合项目实战应用",
    },
    "machine_learning": {
        "node1": "线性代数算力证明",
        "node2": "微积分与梯度下降",
        "node3": "经典线性回归算法",
        "node4": "逻辑回归与分类法则",
        "node5": "正则化防御过拟合",
        "node6": "前馈深度神经网络",
        "node7": "反向传播求导推演",
        "node8": "经典回归场景实战部署",
    }
}

def is_node_unmodified(course_id: str, node_id: str, current_title: str) -> bool:
    """
    Check if a node in the demo course is still unmodified (has its default title).
    If it was changed/adjusted, it is no longer considered unmodified.
    """
    node_id_clean = node_id.lower().strip()
    if "extra" in node_id_clean or "reinforce" in node_id_clean:
        return False
        
    course_titles = DEFAULT_TITLES.get(course_id)
    if not course_titles:
        return False
        
    default_title = course_titles.get(node_id_clean)
    if not default_title:
        return False
        
    return current_title.strip() == default_title.strip()

def get_curated_resources_for_node(subject_cleaned: str, node_id: str):
    """
    Get curated quizzes, slides, code, and videos for the given subject and node_id.
    Returns a dict with keys: 'quiz', 'slides', 'code', 'videos' if matched, otherwise None.
    """
    node_id_clean = node_id.lower().strip()
    # Handle possible extra/reinforcement node ids mapping to their parent nodes
    if "_extra" in node_id_clean:
        node_id_clean = node_id_clean.split("_")[0]
    elif "reinforce_" in node_id_clean:
        # e.g., reinforce_node1_3 -> node1
        parts = node_id_clean.split("_")
        if len(parts) >= 2:
            node_id_clean = parts[1]

    if subject_cleaned == "python_basics":
        return PYTHON_BASICS_RESOURCES.get(node_id_clean)
    elif subject_cleaned == "machine_learning":
        return MACHINE_LEARNING_RESOURCES.get(node_id_clean)
    return None
