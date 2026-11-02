from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Feedback, FarmingProject, User
from ..schemas import FeedbackCreate, FeedbackOut
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/feedback", tags=["Customer Feedback"])

@router.post("", response_model=FeedbackOut)
def submit_feedback(
    feed_in: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    proj = db.query(FarmingProject).filter(FarmingProject.id == feed_in.project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    fb = Feedback(
        project_id=feed_in.project_id,
        customer_id=current_user.id,
        overall_rating=feed_in.overall_rating,
        produce_quality_rating=feed_in.produce_quality_rating,
        farmer_rating=feed_in.farmer_rating,
        comments=feed_in.comments,
        suggestions=feed_in.suggestions
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb

@router.get("/project/{project_id}", response_model=List[FeedbackOut])
def get_project_feedbacks(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Feedback).filter(Feedback.project_id == project_id).all()
