import json
import sys
import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Ensure agronomic engine is importable
ENGINE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if ENGINE_PATH not in sys.path:
    sys.path.append(ENGINE_PATH)

from agronomic_engine import evaluate_farming_brief
from ..database import get_db
from ..models import (
    User, Farm, FarmPlot, FarmingRequest, RequestedCrop, FeasibilityAssessment
)
from ..schemas import FarmingRequestCreate, FarmingRequestOut
from ..services.auth_service import get_current_user, log_audit, send_notification

router = APIRouter(prefix="/requests", tags=["Farming Requests & Briefs"])

@router.post("", response_model=FarmingRequestOut)
def create_farming_request(
    request_in: FarmingRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify plot
    plot = db.query(FarmPlot).filter(FarmPlot.id == request_in.plot_id).first()
    if not plot:
        raise HTTPException(status_code=404, detail="Selected plot not found")
    
    farm = db.query(Farm).filter(Farm.id == request_in.farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Selected farm not found")

    # 1. Create Request
    req = FarmingRequest(
        customer_id=current_user.id,
        farm_id=farm.id,
        plot_id=plot.id,
        season=request_in.season,
        cultivation_preference=request_in.cultivation_preference,
        budget_inr=request_in.budget_inr,
        notes=request_in.notes,
        status="SUBMITTED"
    )
    db.add(req)
    db.commit()
    db.refresh(req)

    # 2. Add requested crops
    crops_payload = []
    for c in request_in.crops:
        rc = RequestedCrop(
            request_id=req.id,
            crop_name=c.crop_name,
            target_quantity_kg=c.target_quantity_kg,
            preferred_variety=c.preferred_variety
        )
        db.add(rc)
        crops_payload.append({
            "name": c.crop_name,
            "target_kg": c.target_quantity_kg
        })
    db.commit()

    # 3. Invoke Python Agronomic Rules Engine
    feasibility = evaluate_farming_brief(
        plot_area_sqft=plot.area_sqft,
        soil_type=plot.soil_type,
        soil_ph=plot.soil_ph,
        water_source=plot.water_availability,
        season=request_in.season,
        budget_inr=request_in.budget_inr,
        crops_requested=crops_payload,
        cultivation_preference=request_in.cultivation_preference
    )

    # 4. Save Feasibility Assessment
    assessment = FeasibilityAssessment(
        request_id=req.id,
        is_feasible=feasibility.is_feasible,
        status=feasibility.status,
        overall_score=feasibility.overall_score,
        available_area_sqm=feasibility.available_area_sqm,
        total_required_area_sqm=feasibility.total_required_area_sqm,
        area_utilization_percent=feasibility.area_utilization_percent,
        min_viable_budget_inr=feasibility.min_viable_budget_inr,
        reasons_json=json.dumps(feasibility.reasons),
        modifications_json=json.dumps(feasibility.required_modifications),
        warnings_json=json.dumps(feasibility.warnings),
        recommendations_json=json.dumps(feasibility.recommendations),
        crop_evaluations_json=json.dumps(feasibility.crop_evaluations),
        cost_breakdown_json=json.dumps(feasibility.cost_breakdown)
    )
    db.add(assessment)

    # 5. Set status based on feasibility decision (Prompt Step 4)
    if feasibility.is_feasible:
        req.status = "FEASIBILITY_CHECKED"
        send_notification(
            db=db,
            user_id=current_user.id,
            title="Farming Brief Feasible!",
            message=f"Your brief for {farm.name} is feasible (Score: {feasibility.overall_score}/100) and submitted for agronomist review.",
            category="FEASIBILITY",
            project_id=None
        )
    else:
        req.status = "MODIFICATION_REQUESTED"
        send_notification(
            db=db,
            user_id=current_user.id,
            title="Brief Requires Modification",
            message=f"Your brief requires adjustments: {'; '.join(feasibility.reasons[:2])}",
            category="FEASIBILITY",
            project_id=None
        )

    db.commit()
    db.refresh(req)

    log_audit(
        db=db,
        entity_type="FarmingRequest",
        entity_id=req.id,
        action=f"BRIEF_EVALUATED_{feasibility.status}",
        user_id=current_user.id,
        details=json.dumps({"is_feasible": feasibility.is_feasible, "score": feasibility.overall_score})
    )

    return req

@router.get("", response_model=List[FarmingRequestOut])
def get_user_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin" or current_user.role == "agronomist":
        return db.query(FarmingRequest).order_by(FarmingRequest.created_at.desc()).all()
    return db.query(FarmingRequest).filter(FarmingRequest.customer_id == current_user.id).order_by(FarmingRequest.created_at.desc()).all()

@router.get("/{request_id}", response_model=FarmingRequestOut)
def get_request_by_id(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(FarmingRequest).filter(FarmingRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Permission check: customer can only view their own
    if current_user.role == "customer" and req.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this request")
    
    return req

@router.put("/{request_id}/modify", response_model=FarmingRequestOut)
def modify_and_resubmit_request(
    request_id: int,
    request_in: FarmingRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(FarmingRequest).filter(FarmingRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if current_user.role == "customer" and req.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update fields
    plot = db.query(FarmPlot).filter(FarmPlot.id == request_in.plot_id).first()
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")

    req.plot_id = plot.id
    req.farm_id = request_in.farm_id
    req.season = request_in.season
    req.cultivation_preference = request_in.cultivation_preference
    req.budget_inr = request_in.budget_inr
    req.notes = request_in.notes

    # Clear old crops and add new
    db.query(RequestedCrop).filter(RequestedCrop.request_id == req.id).delete()
    crops_payload = []
    for c in request_in.crops:
        rc = RequestedCrop(
            request_id=req.id,
            crop_name=c.crop_name,
            target_quantity_kg=c.target_quantity_kg,
            preferred_variety=c.preferred_variety
        )
        db.add(rc)
        crops_payload.append({
            "name": c.crop_name,
            "target_kg": c.target_quantity_kg
        })

    # Re-run Feasibility Engine
    feasibility = evaluate_farming_brief(
        plot_area_sqft=plot.area_sqft,
        soil_type=plot.soil_type,
        soil_ph=plot.soil_ph,
        water_source=plot.water_availability,
        season=request_in.season,
        budget_inr=request_in.budget_inr,
        crops_requested=crops_payload,
        cultivation_preference=request_in.cultivation_preference
    )

    # Update or create assessment
    old_assessment = db.query(FeasibilityAssessment).filter(FeasibilityAssessment.request_id == req.id).first()
    if old_assessment:
        old_assessment.is_feasible = feasibility.is_feasible
        old_assessment.status = feasibility.status
        old_assessment.overall_score = feasibility.overall_score
        old_assessment.available_area_sqm = feasibility.available_area_sqm
        old_assessment.total_required_area_sqm = feasibility.total_required_area_sqm
        old_assessment.area_utilization_percent = feasibility.area_utilization_percent
        old_assessment.min_viable_budget_inr = feasibility.min_viable_budget_inr
        old_assessment.reasons_json = json.dumps(feasibility.reasons)
        old_assessment.modifications_json = json.dumps(feasibility.required_modifications)
        old_assessment.warnings_json = json.dumps(feasibility.warnings)
        old_assessment.recommendations_json = json.dumps(feasibility.recommendations)
        old_assessment.crop_evaluations_json = json.dumps(feasibility.crop_evaluations)
        old_assessment.cost_breakdown_json = json.dumps(feasibility.cost_breakdown)

    req.status = "FEASIBILITY_CHECKED" if feasibility.is_feasible else "MODIFICATION_REQUESTED"
    db.commit()
    db.refresh(req)

    log_audit(
        db=db,
        entity_type="FarmingRequest",
        entity_id=req.id,
        action="RESUBMITTED_AND_EVALUATED",
        user_id=current_user.id
    )

    return req
