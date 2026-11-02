from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import CompensationRecord, User
from ..schemas import schemas
from ..services.auth_service import get_current_user, require_role

router = APIRouter(prefix="/compensation", tags=["Farmer Compensation"])

@router.get("")
def get_compensation_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(CompensationRecord)
    if current_user.role == "farmer":
        query = query.filter(CompensationRecord.farmer_id == current_user.id)
    
    records = query.order_by(CompensationRecord.created_at.desc()).all()
    
    total_earned = sum(r.amount_inr for r in records if r.status in ["APPROVED", "PAID"])
    total_paid = sum(r.amount_inr for r in records if r.status == "PAID")
    total_pending = sum(r.amount_inr for r in records if r.status == "PENDING" or r.status == "APPROVED")

    return {
        "farmer_id": current_user.id if current_user.role == "farmer" else None,
        "total_earned_inr": total_earned,
        "total_paid_inr": total_paid,
        "total_pending_inr": total_pending,
        "records": [
            {
                "id": r.id,
                "project_id": r.project_id,
                "amount_inr": r.amount_inr,
                "description": r.description,
                "status": r.status,
                "paid_at": r.paid_at.isoformat() if r.paid_at else None,
                "created_at": r.created_at.isoformat()
            }
            for r in records
        ]
    }

@router.put("/{record_id}/pay")
def mark_compensation_paid(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    rec = db.query(CompensationRecord).filter(CompensationRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    rec.status = "PAID"
    rec.paid_at = datetime.utcnow()
    db.commit()
    return {"status": "SUCCESS", "message": f"Payment of INR {rec.amount_inr} recorded as PAID"}
