from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from ..database import get_db
from ..models import DeliveryRecord, HarvestRecord, FarmingProject, User
from ..schemas import DeliveryRecordCreate, DeliveryRecordOut
from ..services.auth_service import get_current_user, require_role, log_audit, send_notification

router = APIRouter(prefix="/delivery", tags=["Produce Delivery Tracking"])

@router.get("", response_model=List[DeliveryRecordOut])
def get_delivery_records(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(DeliveryRecord)
    if project_id:
        query = query.filter(DeliveryRecord.project_id == project_id)
    return query.order_by(DeliveryRecord.scheduled_date.desc()).all()

@router.post("", response_model=DeliveryRecordOut)
def schedule_or_record_delivery(
    deliv_in: DeliveryRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proj = db.query(FarmingProject).filter(FarmingProject.id == deliv_in.project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    tracking_num = f"TRK-{uuid.uuid4().hex[:8].upper()}"

    deliv = DeliveryRecord(
        project_id=deliv_in.project_id,
        recipient_name=deliv_in.recipient_name,
        delivery_address=deliv_in.delivery_address,
        contact_phone=deliv_in.contact_phone,
        scheduled_date=deliv_in.scheduled_date or datetime.utcnow(),
        tracking_number=tracking_num,
        status="PREPARING",
        delivery_notes=deliv_in.delivery_notes
    )
    db.add(deliv)

    # Advance project stage
    proj.current_stage = "Delivery in progress"
    db.commit()
    db.refresh(deliv)

    send_notification(
        db=db,
        user_id=proj.customer_id,
        title="Delivery Scheduled!",
        message=f"Fresh harvest delivery prepared. Tracking number: {tracking_num}.",
        category="DELIVERY",
        project_id=proj.id
    )

    return deliv

@router.put("/{delivery_id}/status", response_model=DeliveryRecordOut)
def update_delivery_status(
    delivery_id: int,
    status_str: str, # "OUT_FOR_DELIVERY", "DELIVERED"
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "farmer"]))
):
    deliv = db.query(DeliveryRecord).filter(DeliveryRecord.id == delivery_id).first()
    if not deliv:
        raise HTTPException(status_code=404, detail="Delivery record not found")

    deliv.status = status_str
    if status_str == "DELIVERED":
        deliv.delivered_date = datetime.utcnow()
        deliv.project.current_stage = "Delivered"
        deliv.project.status = "COMPLETED"
        deliv.project.completed_at = datetime.utcnow()

        # Update harvest records delivered_kg to match actual_harvested_kg if not already set
        for hr in deliv.project.harvest_records:
            if hr.delivered_kg == 0:
                hr.delivered_kg = hr.actual_harvested_kg
                hr.status = "DELIVERED"

        send_notification(
            db=db,
            user_id=deliv.project.customer_id,
            title="Produce Delivered to Your Doorstep!",
            message=f"Your farm fresh harvest has been delivered safely. Please rate your experience and produce freshness!",
            category="DELIVERY",
            project_id=deliv.project_id
        )
    elif status_str == "OUT_FOR_DELIVERY":
        deliv.project.current_stage = "Delivery in progress"
        send_notification(
            db=db,
            user_id=deliv.project.customer_id,
            title="Out for Delivery",
            message=f"Driver is on the way with your organic farm produce.",
            category="DELIVERY",
            project_id=deliv.project_id
        )

    db.commit()
    db.refresh(deliv)

    log_audit(
        db=db,
        entity_type="DeliveryRecord",
        entity_id=deliv.id,
        action=f"DELIVERY_STATUS_{status_str}",
        user_id=current_user.id
    )

    return deliv
