import pytest
import sqlite3
from app.db import DB_PATH, init_db, db_get_path_nodes, db_update_single_path_node

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    init_db()

def test_db_update_single_path_node():
    from app.db import db_save_path_nodes, python_path_nodes
    # Insert a dummy node or check existing
    username = "test_user"
    node_id = "node2"
    
    # Pre-seed path nodes for test_user in DB
    db_save_path_nodes(username, python_path_nodes)
    
    # Update it
    new_title = "工程级逻辑回归与二分类实战"
    new_desc = "手动实现带L2正则化的逻辑回归，使用真实乳腺癌数据集"
    
    db_update_single_path_node(username, node_id, new_title, new_desc)
    
    # Retrieve and verify
    nodes = db_get_path_nodes(username)
    target_node = next((n for n in nodes if n.id == node_id), None)
    
    assert target_node is not None
    assert target_node.title == new_title
    assert target_node.description == new_desc
