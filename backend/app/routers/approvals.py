from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
import json

from ..database import get_db
from ..models import User, FarmingRequest, Approval, FeasibilityAssessment
from ..schemas import ApprovalCreate, FarmingRequestOut
from ..services.auth_service import require_role, log_audit, send_notification

router = APIRouter(prefix="/approvals", tags=["Feasibility & Agronomist Approvals"])

@router.post("", response_model=FarmingRequestOut)
def record_approval_decision(
    approval_in: ApprovalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "agronomist"]))
):
    req = db.query(FarmingRequest).filter(FarmingRequest.id == approval_in.request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Farming request not found")

    feasibility = db.query(FeasibilityAssessment).filter(FeasibilityAssessment.request_id == req.id).first()
    if not feasibility:
        raise HTTPException(status_code=400, detail="Cannot approve without feasibility evaluation")

    # Guardrail: Cannot approve if structurally infeasible unless overridden with verified modifications
    if not feasibility.is_feasible and approval_in.decision == "APPROVED":
        raise HTTPException(
            status_code=400,
            detail="Cannot approve an INFEASIBLE plan. Agronomic constraints must be resolved."
        )

    approval = Approval(
        request_id=req.id,
        approver_user_id=current_user.id,
        decision=approval_in.decision,
        notes=approval_in.notes
    )
    db.add(approval)

    if approval_in.decision == "APPROVED":
        req.status = "APPROVED"
        send_notification(
            db=db,
            user_id=req.customer_id,
            title="Plan Approved by Agronomist!",
            message=f"Your organic cultivation plan for Farm '{req.farm.name}' has been formally approved.",
            category="APPROVAL"
        )
    elif approval_in.decision == "MODIFICATION_REQUESTED":
        req.status = "MODIFICATION_REQUESTED"
        send_notification(
            db=db,
            user_id=req.customer_id,
            title="Modification Requested",
            message=f"Agronomist notes: {approval_in.notes or 'Please adjust your plan'}",
            category="APPROVAL"
        )
    elif approval_in.decision == "REJECTED":
        req.status = "REJECTED"
        send_notification(
            db=db,
            user_id=req.customer_id,
            title="Request Rejected",
            message=f"Reason: {approval_in.notes or 'Does not meet cultivation criteria'}",
            category="APPROVAL"
        )

    db.commit()
    db.refresh(req)

    log_audit(
        db=db,
        entity_type="Approval",
        entity_id=approval.id,
        action=f"DECISION_{approval_in.decision}",
        user_id=current_user.id,
        details=approval_in.notes
    )

    return req
