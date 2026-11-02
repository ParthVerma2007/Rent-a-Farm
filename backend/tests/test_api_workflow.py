import pytest
import sys
import os
from fastapi.testclient import TestClient

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from backend.app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health_and_root(client):
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["service"] == "Rent-a-Farm Core API"

    h = client.get("/health")
    assert h.status_code == 200
    assert h.json()["status"] == "HEALTHY"

def test_auth_login(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "customer@rentafarm.com",
        "password": "password123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "customer"

def test_farms_and_plots(client):
    res = client.get("/api/v1/farms")
    assert res.status_code == 200
    farms = res.json()
    assert len(farms) >= 3
    farm1 = farms[0]
    assert "plots" in farm1
    assert len(farm1["plots"]) > 0

def test_crops_catalog(client):
    res = client.get("/api/v1/crops")
    assert res.status_code == 200
    crops = res.json()
    assert len(crops) >= 5

def test_complete_end_to_end_farming_lifecycle(client):
    # 1. Customer Login
    c_login = client.post("/api/v1/auth/login", json={
        "email": "customer@rentafarm.com",
        "password": "password123"
    })
    cust_token = c_login.json()["access_token"]
    cust_headers = {"Authorization": f"Bearer {cust_token}"}

    # 2. Get available farm & plot
    farms = client.get("/api/v1/farms").json()
    farm = farms[0]
    available_plots = [p for p in farm["plots"] if p["is_available"]]
    plot = available_plots[0]

    # 3. Customer builds farming brief & submits
    req_payload = {
        "farm_id": farm["id"],
        "plot_id": plot["id"],
        "season": "Rabi",
        "cultivation_preference": "Certified Organic",
        "budget_inr": 12500.0,
        "notes": "End-to-end integration test brief",
        "crops": [
            {"crop_name": "Tomato", "target_quantity_kg": 25.0},
            {"crop_name": "Carrot", "target_quantity_kg": 15.0}
        ]
    }
    req_res = client.post("/api/v1/requests", json=req_payload, headers=cust_headers)
    assert req_res.status_code == 200
    req_data = req_res.json()
    req_id = req_data["id"]
    assert req_data["status"] == "FEASIBILITY_CHECKED"
    assert req_data["feasibility"]["is_feasible"] is True

    # 4. Agronomist / Admin login & Approves plan
    a_login = client.post("/api/v1/auth/login", json={
        "email": "admin@rentafarm.com",
        "password": "password123"
    })
    admin_token = a_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    appr_res = client.post("/api/v1/approvals", json={
        "request_id": req_id,
        "decision": "APPROVED",
        "notes": "E2E automated test approval"
    }, headers=admin_headers)
    assert appr_res.status_code == 200
    assert appr_res.json()["status"] == "APPROVED"

    # 5. Admin assigns Farmer
    farmer_user = client.get("/api/v1/admin/users?role=farmer", headers=admin_headers).json()[0]
    assign_res = client.post("/api/v1/assignments", json={
        "request_id": req_id,
        "farmer_id": farmer_user["id"],
        "notes": "Assigned for E2E run"
    }, headers=admin_headers)
    assert assign_res.status_code == 200
    project = assign_res.json()
    proj_id = project["id"]
    assert project["project_code"].startswith("RAF-")

    # 6. Farmer logs in & completes a task
    f_login = client.post("/api/v1/auth/login", json={
        "email": "farmer@rentafarm.com",
        "password": "password123"
    })
    farmer_token = f_login.json()["access_token"]
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}

    tasks = client.get(f"/api/v1/tasks?project_id={proj_id}", headers=farmer_headers).json()
    assert len(tasks) > 0
    t1 = tasks[0]

    update_task_res = client.put(f"/api/v1/tasks/{t1['id']}", json={
        "status": "COMPLETED",
        "notes": "Land preparation completed with vermicompost."
    }, headers=farmer_headers)
    assert update_task_res.status_code == 200
    assert update_task_res.json()["status"] == "COMPLETED"

    # 7. Farmer records organic input
    input_res = client.post("/api/v1/inputs", json={
        "project_id": proj_id,
        "input_type": "BIO_FERTILIZER",
        "item_name": "Organic Jeevamrutha Microbial Extract",
        "quantity": 15.0,
        "unit": "Liters",
        "is_organic_certified": True
    }, headers=farmer_headers)
    assert input_res.status_code == 200

    # 8. Farmer records Harvest
    harvest_res = client.post("/api/v1/harvest", json={
        "project_id": proj_id,
        "crop_name": "Tomato",
        "requested_target_kg": 25.0,
        "estimated_yield_kg": 25.0,
        "actual_harvested_kg": 26.2,
        "quality_grade": "Grade A Heirloom Organic",
        "notes": "Sweet and deep red."
    }, headers=farmer_headers)
    assert harvest_res.status_code == 200

    # 9. Harvest Reconciliation endpoint check
    recon_res = client.get(f"/api/v1/harvest/reconciliation/{proj_id}", headers=cust_headers)
    assert recon_res.status_code == 200
    recon = recon_res.json()
    assert recon["total_actual_harvested_kg"] == 26.2
    assert recon["total_requested_kg"] == 25.0

    # 10. Schedule Delivery & Deliver produce
    deliv_res = client.post("/api/v1/delivery", json={
        "project_id": proj_id,
        "recipient_name": "Ananya Sharma",
        "delivery_address": "Indiranagar, Bengaluru",
        "contact_phone": "+91 9876543210"
    }, headers=admin_headers)
    assert deliv_res.status_code == 200
    deliv_id = deliv_res.json()["id"]

    deliv_update = client.put(f"/api/v1/delivery/{deliv_id}/status?status_str=DELIVERED", headers=admin_headers)
    assert deliv_update.status_code == 200
    assert deliv_update.json()["status"] == "DELIVERED"

    # 11. Customer submits feedback
    fb_res = client.post("/api/v1/feedback", json={
        "project_id": proj_id,
        "overall_rating": 5,
        "produce_quality_rating": 5,
        "farmer_rating": 5,
        "comments": "Incredible taste and full traceability! Loved the progress photos.",
        "suggestions": "Would love to rent a larger plot next season."
    }, headers=cust_headers)
    assert fb_res.status_code == 200
    assert fb_res.json()["overall_rating"] == 5
