from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

from ..database import get_db
from ..models import (
    User, FarmingRequest, FarmerAssignment, FarmingProject,
    FarmingTask, FarmPlot
)
from ..schemas import FarmerAssignmentCreate, ProjectOut
from ..services.auth_service import require_role, log_audit, send_notification

router = APIRouter(prefix="/assignments", tags=["Farmer Assignments"])

@router.post("", response_model=ProjectOut)
def assign_farmer_and_create_project(
    assign_in: FarmerAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    req = db.query(FarmingRequest).filter(FarmingRequest.id == assign_in.request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Farming request not found")

    if req.status != "APPROVED":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot assign farmer: Request must be 'APPROVED' first (Current status: {req.status})"
        )

    farmer = db.query(User).filter(User.id == assign_in.farmer_id, User.role == "farmer").first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Designated farmer not found")

    # 1. Create or update assignment
    assignment = FarmerAssignment(
        request_id=req.id,
        farmer_user_id=farmer.id,
        assigned_by_user_id=current_user.id,
        status="ASSIGNED",
        notes=assign_in.notes
    )
    db.add(assignment)

    # 2. Check if project already exists
    existing_project = db.query(FarmingProject).filter(FarmingProject.request_id == req.id).first()
    if existing_project:
        project = existing_project
        project.farmer_id = farmer.id
    else:
        # Generate project code
        code_num = db.query(FarmingProject).count() + 1
        project_code = f"RAF-{datetime.utcnow().year}-{code_num:03d}"
        
        # Estimate harvest date: default 80 days from today
        est_harvest = datetime.utcnow() + timedelta(days=80)

        project = FarmingProject(
            request_id=req.id,
            customer_id=req.customer_id,
            farmer_id=farmer.id,
            farm_id=req.farm_id,
            plot_id=req.plot_id,
            project_code=project_code,
            current_stage="Farmer assigned",
            status="ACTIVE",
            estimated_harvest_date=est_harvest
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        # 3. Create initial sequential farming tasks
        initial_tasks = [
            ("Soil Preparation & Bed Ridging", "Tilling soil, laying organic raised beds, and setting up drip emitter channels.", 5),
            ("Basal Bio-Fertilization", "Application of well-cured vermicompost (250kg) and Jeevamrutha inoculation.", 9),
            ("Seed Treatment & Sowing", "Trichoderma viride bio-treatment followed by line sowing at recommended spacing.", 14),
            ("Germination & Thinning Check", "Assessing sprout emergence rate and thinning crowded seedlings.", 22),
            ("Weed Management & Mulching", "Manual hand weeding and organic straw mulching for moisture retention.", 32),
            ("Organic Pest Prevention Spray", "Prophylactic neem oil (1500 ppm) spray and yellow sticky trap deployment.", 45),
            ("Flowering & Fruit Setting Inspection", "Monitoring blossom health, bee activity, and adjusting drip volume.", 60),
            ("Pre-Harvest Yield Assessment", "Checking fruit ripeness, sugar levels, and planning harvest batching.", 75),
            ("Harvest & Precision Weighing", "Early morning harvest, crate grading, and precision digital scale recording.", 80)
        ]

        for title, desc, days_offset in initial_tasks:
            due = datetime.utcnow() + timedelta(days=days_offset)
            t = FarmingTask(
                project_id=project.id,
                farmer_id=farmer.id,
                title=title,
                description=desc,
                category="Field Operations",
                due_date=due,
                status="PENDING"
            )
            db.add(t)

    # Update request status
    req.status = "ASSIGNED"

    # Mark plot as occupied
    plot = db.query(FarmPlot).filter(FarmPlot.id == req.plot_id).first()
    if plot:
        plot.is_available = False

    db.commit()
    db.refresh(project)

    # Send notifications
    send_notification(
        db=db,
        user_id=req.customer_id,
        title="Farmer Assigned to Your Project!",
        message=f"Farmer {farmer.full_name} has been assigned to project {project.project_code}.",
        category="ASSIGNMENT",
        project_id=project.id
    )
    send_notification(
        db=db,
        user_id=farmer.id,
        title="New Cultivation Project Assigned",
        message=f"You have been assigned project {project.project_code} at {req.farm.name}.",
        category="ASSIGNMENT",
        project_id=project.id
    )

    log_audit(
        db=db,
        entity_type="FarmerAssignment",
        entity_id=assignment.id,
        action="FARMER_ASSIGNED",
        user_id=current_user.id,
        details=f"Assigned Farmer {farmer.id} to Request {req.id}"
    )

    return project
