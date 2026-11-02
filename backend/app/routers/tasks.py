from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import FarmingTask, FarmingProject, User, CompensationRecord
from ..schemas import TaskCreate, TaskUpdate, TaskOut
from ..services.auth_service import get_current_user, log_audit, send_notification

router = APIRouter(prefix="/tasks", tags=["Farming Tasks"])

@router.get("", response_model=List[TaskOut])
def get_tasks(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(FarmingTask)
    if project_id:
        query = query.filter(FarmingTask.project_id == project_id)
    elif current_user.role == "farmer":
        query = query.filter(FarmingTask.farmer_id == current_user.id)
    
    return query.order_by(FarmingTask.due_date.asc()).all()

@router.post("", response_model=TaskOut)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proj = db.query(FarmingProject).filter(FarmingProject.id == task_in.project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    new_task = FarmingTask(
        project_id=task_in.project_id,
        farmer_id=proj.farmer_id,
        title=task_in.title,
        description=task_in.description,
        category=task_in.category,
        due_date=task_in.due_date,
        status="PENDING"
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.put("/{task_id}", response_model=TaskOut)
def update_task_status(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(FarmingTask).filter(FarmingTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_in.status:
        task.status = task_in.status
        if task_in.status == "COMPLETED" and not task.completed_at:
            task.completed_at = datetime.utcnow()
            
            # Automatically record farmer milestone compensation for completed task
            comp = CompensationRecord(
                farmer_id=task.farmer_id,
                project_id=task.project_id,
                task_id=task.id,
                amount_inr=650.0,
                description=f"Task Completion: {task.title}",
                status="APPROVED"
            )
            db.add(comp)
            
            # Notify customer
            send_notification(
                db=db,
                user_id=task.project.customer_id,
                title=f"Task Completed: {task.title}",
                message=f"Farmer has completed '{task.title}' for your farm plot.",
                category="TASK",
                project_id=task.project_id
            )

    if task_in.notes:
        task.notes = task_in.notes
    if task_in.photo_url:
        task.photo_url = task_in.photo_url

    db.commit()
    db.refresh(task)
    return task
