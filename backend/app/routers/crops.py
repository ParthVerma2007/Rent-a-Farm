from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import Crop
from ..schemas import CropOut

router = APIRouter(prefix="/crops", tags=["Crops Knowledge Base"])

@router.get("", response_model=List[CropOut])
def get_crops(
    db: Session = Depends(get_db),
    category: Optional[str] = Query(None),
    season: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    query = db.query(Crop)
    if category:
        query = query.filter(Crop.category.ilike(f"%{category}%"))
    if season:
        query = query.filter(Crop.suitable_seasons.ilike(f"%{season}%"))
    if search:
        query = query.filter(Crop.name.ilike(f"%{search}%"))
    return query.all()

@router.get("/{crop_key}", response_model=CropOut)
def get_crop_by_key(crop_key: str, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.crop_key == crop_key).first()
    if not crop:
        crop = db.query(Crop).filter(Crop.name.ilike(f"%{crop_key}%")).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop
