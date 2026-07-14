import pytest
from app.db import init_db, db_get_path_nodes, db_save_path_nodes, python_path_nodes
from app.models import PathNode, CompleteResourceRequest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    init_db()

def test_resource_completion_flow():
    username = "test_user_res"
    # Pre-seed nodes in DB
    import copy
    test_nodes = copy.deepcopy(python_path_nodes)
    
    # Let's set node1 status as "active" and others as "locked"
    test_nodes[0].status = "active"
    for n in test_nodes[1:]:
        n.status = "locked"
        
    db_save_path_nodes(username, test_nodes)
    
    client = TestClient(app)
    
    # Mock auth dependency
    from app.auth_utils import get_current_username
    app.dependency_overrides[get_current_username] = lambda: username
    
    # 1. Complete 'pdf' resource
    response = client.post("/api/path/complete-resource", json={
        "node_id": "node1",
        "resource_type": "pdf"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["node_completed"] is False
    
    # Verify node1 has 'pdf' in completed_resources
    updated_nodes = db_get_path_nodes(username)
    node1 = updated_nodes[0]
    assert "pdf" in node1.completed_resources
    
    # 2. Complete all remaining resources of node1
    for res in node1.resources:
        if res != "pdf":
            response = client.post("/api/path/complete-resource", json={
                "node_id": "node1",
                "resource_type": res
            })
            assert response.status_code == 200
            
    # The last resource completion should trigger node completion and next node activation
    last_data = response.json()
    assert last_data["node_completed"] is True
    
    # Verify DB state
    updated_nodes = db_get_path_nodes(username)
    assert updated_nodes[0].status == "completed"
    assert updated_nodes[1].status == "active"
    
    # Clean overrides
    app.dependency_overrides.clear()
