from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import FarmingProject, User
from ..schemas import ProjectOut
from ..services.auth_service import get_current_user, log_audit, send_notification

router = APIRouter(prefix="/projects", tags=["Farming Projects"])

@router.get("", response_model=List[ProjectOut])
def get_projects(
    db: Session = Depends(get_db),
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    query = db.query(FarmingProject)
    if current_user.role == "customer":
        query = query.filter(FarmingProject.customer_id == current_user.id)
    elif current_user.role == "farmer":
        query = query.filter(FarmingProject.farmer_id == current_user.id)
    
    if status_filter:
        query = query.filter(FarmingProject.status == status_filter)

    return query.order_by(FarmingProject.created_at.desc()).all()

@router.get("/{project_id}", response_model=ProjectOut)
def get_project_by_id(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proj = db.query(FarmingProject).filter(FarmingProject.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    # Access control
    if current_user.role == "customer" and proj.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this project")
    if current_user.role == "farmer" and proj.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this project")

    return proj

@router.put("/{project_id}/stage", response_model=ProjectOut)
def update_project_stage(
    project_id: int,
    new_stage: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proj = db.query(FarmingProject).filter(FarmingProject.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    if current_user.role not in ["farmer", "admin"]:
        raise HTTPException(status_code=403, detail="Only assigned farmer or admin can update project stage")

    old_stage = proj.current_stage
    proj.current_stage = new_stage
    proj.updated_at = datetime.utcnow()

    if new_stage in ["Delivered", "Completed"]:
        proj.status = "COMPLETED"
        proj.completed_at = datetime.utcnow()
    elif new_stage in ["Harvest completed"]:
        proj.status = "HARVESTED"

    db.commit()
    db.refresh(proj)

    # Notify customer of stage progression
    send_notification(
        db=db,
        user_id=proj.customer_id,
        title=f"Project Update: {new_stage}",
        message=f"Your farm project {proj.project_code} has advanced to '{new_stage}'.",
        category="PROJECT_STAGE",
        project_id=proj.id
    )

    log_audit(
        db=db,
        entity_type="FarmingProject",
        entity_id=proj.id,
        action="STAGE_UPDATED",
        user_id=current_user.id,
        details=f"Stage changed from '{old_stage}' to '{new_stage}'"
    )

    return proj
