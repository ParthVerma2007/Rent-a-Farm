import os
import sys
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

ENGINE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if ENGINE_PATH not in sys.path:
    sys.path.append(ENGINE_PATH)

from agronomic_engine import optimize_shared_land_blocks
from ..database import get_db
from ..models import (
    User, Farm, FarmPlot, FarmingRequest, FarmingProject,
    HarvestRecord, DeliveryRecord, AuditLog
)
from ..schemas import UserOut
from ..services.auth_service import require_role

router = APIRouter(prefix="/admin", tags=["Administrator Dashboard & Ecosystem"])

@router.get("/overview")
def get_platform_overview(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))
):
    total_customers = db.query(User).filter(User.role == "customer").count()
    total_farmers = db.query(User).filter(User.role == "farmer").count()
    total_farms = db.query(Farm).count()
    total_plots = db.query(FarmPlot).count()
    available_plots = db.query(FarmPlot).filter(FarmPlot.is_available == True).count()
    
    active_projects = db.query(FarmingProject).filter(FarmingProject.status == "ACTIVE").count()
    pending_feasibility = db.query(FarmingRequest).filter(FarmingRequest.status == "SUBMITTED").count()
    awaiting_farmer_assignment = db.query(FarmingRequest).filter(FarmingRequest.status == "APPROVED").count()
    
    upcoming_harvests = db.query(FarmingProject).filter(
        FarmingProject.current_stage.in_(["Crop development", "Maintenance and monitoring", "Harvest preparation"])
    ).count()
    completed_deliveries = db.query(DeliveryRecord).filter(DeliveryRecord.status == "DELIVERED").count()

    return {
        "total_customers": total_customers,
        "total_farmers": total_farmers,
        "total_farms": total_farms,
        "total_plots": total_plots,
        "available_plots": available_plots,
        "active_projects": active_projects,
        "pending_feasibility_requests": pending_feasibility,
        "projects_awaiting_assignment": awaiting_farmer_assignment,
        "upcoming_harvests": upcoming_harvests,
        "completed_deliveries": completed_deliveries,
        "system_status": "Healthy / All Services Operational"
    }

@router.get("/users", response_model=List[UserOut])
def list_users(
    role: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.all()

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    new_role: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if new_role not in ["customer", "farmer", "admin", "agronomist"]:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    user.role = new_role
    db.commit()
    return {"status": "SUCCESS", "user_id": user_id, "new_role": new_role}

@router.get("/audit-logs")
def get_audit_trail(
    limit: int = 50,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin", "agronomist"]))
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "action": l.action,
            "performed_by_user_id": l.performed_by_user_id,
            "details": l.details_json,
            "created_at": l.created_at.isoformat()
        }
        for l in logs
    ]

@router.post("/shared-land/optimize")
def run_shared_land_optimizer(
    season: str = "Rabi",
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin", "agronomist"]))
):
    # Fetch approved/feasible farming requests
    reqs = db.query(FarmingRequest).filter(
        FarmingRequest.status.in_(["APPROVED", "FEASIBILITY_CHECKED"])
    ).all()

    requests_payload = []
    for r in reqs:
        req_crops = [{"name": rc.crop_name, "target_kg": rc.target_quantity_kg} for rc in r.requested_crops]
        req_area = r.feasibility.total_required_area_sqm if r.feasibility else 25.0
        requests_payload.append({
            "id": r.id,
            "customer_id": r.customer_id,
            "season": r.season,
            "preferred_soil": r.plot.soil_type if r.plot else "Loamy",
            "required_area_sqm": req_area,
            "crops": req_crops,
            "status": "APPROVED"
        })

    # Fetch available plots
    plots = db.query(FarmPlot).filter(FarmPlot.is_available == True).all()
    plots_payload = [
        {
            "id": p.id,
            "name": f"{p.farm.name} - {p.name}",
            "soil_type": p.soil_type,
            "area_sqm": p.area_sqm,
            "is_available": p.is_available
        }
        for p in plots
    ]

    optimization_result = optimize_shared_land_blocks(requests_payload, plots_payload)
    return optimization_result
