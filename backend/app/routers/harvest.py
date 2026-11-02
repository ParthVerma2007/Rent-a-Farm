from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import HarvestRecord, FarmingProject, User, CompensationRecord
from ..schemas import HarvestRecordCreate, HarvestRecordOut
from ..services.auth_service import get_current_user, require_role, log_audit, send_notification

router = APIRouter(prefix="/harvest", tags=["Harvest Management & Reconciliation"])

@router.get("", response_model=List[HarvestRecordOut])
def get_harvest_records(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(HarvestRecord)
    if project_id:
        query = query.filter(HarvestRecord.project_id == project_id)
    return query.order_by(HarvestRecord.harvest_date.desc()).all()

@router.post("", response_model=HarvestRecordOut)
def record_harvest(
    harvest_in: HarvestRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proj = db.query(FarmingProject).filter(FarmingProject.id == harvest_in.project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    rec = HarvestRecord(
        project_id=harvest_in.project_id,
        crop_name=harvest_in.crop_name,
        requested_target_kg=harvest_in.requested_target_kg,
        estimated_yield_kg=harvest_in.estimated_yield_kg,
        actual_harvested_kg=harvest_in.actual_harvested_kg,
        delivered_kg=0.0,
        harvest_date=datetime.utcnow(),
        status="RECORDED",
        photo_url=harvest_in.photo_url,
        quality_grade=harvest_in.quality_grade,
        notes=harvest_in.notes
    )
    db.add(rec)

    # Advance project stage
    proj.current_stage = "Harvest completed"
    proj.status = "HARVESTED"

    # Farmer bonus for harvest completion
    comp = CompensationRecord(
        farmer_id=proj.farmer_id,
        project_id=proj.id,
        amount_inr=1200.0,
        description=f"Harvest Completion & Weighing: {harvest_in.crop_name} ({harvest_in.actual_harvested_kg} kg)",
        status="APPROVED"
    )
    db.add(comp)

    db.commit()
    db.refresh(rec)

    diff = rec.actual_harvested_kg - rec.requested_target_kg
    diff_text = f"+{round(diff, 1)} kg" if diff >= 0 else f"{round(diff, 1)} kg"

    send_notification(
        db=db,
        user_id=proj.customer_id,
        title=f"Harvest Completed: {rec.crop_name}!",
        message=f"Weighed {rec.actual_harvested_kg} kg ({diff_text} vs target). Quality: {rec.quality_grade}. Preparing for delivery.",
        category="HARVEST",
        project_id=proj.id
    )

    log_audit(
        db=db,
        entity_type="HarvestRecord",
        entity_id=rec.id,
        action="HARVEST_RECORDED",
        user_id=current_user.id,
        details=f"Crop: {rec.crop_name}, Actual: {rec.actual_harvested_kg} kg, Target: {rec.requested_target_kg} kg"
    )

    return rec

@router.get("/reconciliation/{project_id}")
def get_project_harvest_reconciliation(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proj = db.query(FarmingProject).filter(FarmingProject.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    records = db.query(HarvestRecord).filter(HarvestRecord.project_id == project_id).all()
    
    crops_summary = []
    total_requested = 0.0
    total_estimated = 0.0
    total_harvested = 0.0
    total_delivered = 0.0

    for r in records:
        total_requested += r.requested_target_kg
        total_estimated += r.estimated_yield_kg
        total_harvested += r.actual_harvested_kg
        total_delivered += r.delivered_kg

        harvest_variance_pct = round(((r.actual_harvested_kg - r.requested_target_kg) / r.requested_target_kg) * 100, 1) if r.requested_target_kg > 0 else 0

        crops_summary.append({
            "crop_name": r.crop_name,
            "requested_target_kg": r.requested_target_kg,
            "estimated_yield_kg": r.estimated_yield_kg,
            "actual_harvested_kg": r.actual_harvested_kg,
            "delivered_kg": r.delivered_kg,
            "harvest_variance_pct": harvest_variance_pct,
            "reconciliation_status": "EXCEEDED_TARGET" if r.actual_harvested_kg >= r.requested_target_kg else "BELOW_TARGET",
            "quality_grade": r.quality_grade,
            "harvest_date": r.harvest_date.isoformat(),
            "photo_url": r.photo_url
        })

    return {
        "project_id": project_id,
        "project_code": proj.project_code,
        "current_stage": proj.current_stage,
        "crops": crops_summary,
        "total_requested_kg": round(total_requested, 1),
        "total_estimated_kg": round(total_estimated, 1),
        "total_actual_harvested_kg": round(total_harvested, 1),
        "total_delivered_kg": round(total_delivered, 1),
        "overall_realization_rate": round((total_harvested / total_requested * 100), 1) if total_requested > 0 else 100.0,
        "notes": "Biological yields naturally vary with weather and micro-climate. Actual produce weighed using calibrated on-site farm scales."
    }
