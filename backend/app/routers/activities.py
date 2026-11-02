from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import FarmingActivityLog, FarmingInput, FarmingProject, User
from ..schemas import (
    ActivityLogCreate, ActivityLogOut, InputLogCreate, InputLogOut
)
from ..services.auth_service import get_current_user, send_notification

activities_router = APIRouter(prefix="/activities", tags=["Farming Activities"])
inputs_router = APIRouter(prefix="/inputs", tags=["Farming Inputs & Transparency"])

@activities_router.get("", response_model=List[ActivityLogOut])
def get_activities(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(FarmingActivityLog)
    if project_id:
        query = query.filter(FarmingActivityLog.project_id == project_id)
    return query.order_by(FarmingActivityLog.created_at.desc()).all()

@activities_router.post("", response_model=ActivityLogOut)
def record_activity(
    activity_in: ActivityLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proj = db.query(FarmingProject).filter(FarmingProject.id == activity_in.project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    act = FarmingActivityLog(
        project_id=activity_in.project_id,
        farmer_id=current_user.id,
        activity_type=activity_in.activity_type,
        title=activity_in.title,
        description=activity_in.description,
        photo_url=activity_in.photo_url
    )
    db.add(act)
    db.commit()
    db.refresh(act)

    send_notification(
        db=db,
        user_id=proj.customer_id,
        title=f"New Activity Logged: {activity_in.title}",
        message=f"{act.description[:100]}...",
        category="CULTIVATION_UPDATE",
        project_id=proj.id
    )

    return act

@inputs_router.get("", response_model=List[InputLogOut])
def get_inputs(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(FarmingInput)
    if project_id:
        query = query.filter(FarmingInput.project_id == project_id)
    return query.order_by(FarmingInput.recorded_at.desc()).all()

@inputs_router.post("", response_model=InputLogOut)
def record_input(
    input_in: InputLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proj = db.query(FarmingProject).filter(FarmingProject.id == input_in.project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    # Organic verification guardrail:
    prohibited_keywords = ["urea", "dap", "glyphosate", "chemical", "chlorpyrifos", "synthetic"]
    if any(k in input_in.item_name.lower() for k in prohibited_keywords):
        raise HTTPException(
            status_code=400,
            detail=f"Prohibited non-organic substance '{input_in.item_name}' violates certified organic farming protocol."
        )

    inp = FarmingInput(
        project_id=input_in.project_id,
        farmer_id=current_user.id,
        input_type=input_in.input_type,
        item_name=input_in.item_name,
        quantity=input_in.quantity,
        unit=input_in.unit,
        is_organic_certified=input_in.is_organic_certified,
        certification_notes=input_in.certification_notes,
        photo_url=input_in.photo_url
    )
    db.add(inp)
    db.commit()
    db.refresh(inp)

    send_notification(
        db=db,
        user_id=proj.customer_id,
        title=f"Organic Input Applied: {input_in.item_name}",
        message=f"Applied {input_in.quantity} {input_in.unit} of {input_in.item_name} with organic traceability.",
        category="INPUT_LOG",
        project_id=proj.id
    )

    return inp
