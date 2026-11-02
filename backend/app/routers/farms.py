from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import Farm, FarmPlot, User
from ..schemas import FarmOut, FarmCreate, FarmPlotOut, FarmPlotCreate
from ..services.auth_service import get_current_user, require_role

router = APIRouter(prefix="/farms", tags=["Farms & Plots"])

@router.get("", response_model=List[FarmOut])
def get_farms(
    db: Session = Depends(get_db),
    organic_only: Optional[bool] = Query(None),
    location: Optional[str] = Query(None)
):
    query = db.query(Farm)
    if organic_only is not None:
        query = query.filter(Farm.is_organic_certified == organic_only)
    if location:
        query = query.filter(Farm.location_name.ilike(f"%{location}%"))
    return query.all()

@router.get("/{farm_id}", response_model=FarmOut)
def get_farm(farm_id: int, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return farm

@router.get("/{farm_id}/plots", response_model=List[FarmPlotOut])
def get_farm_plots(
    farm_id: int,
    db: Session = Depends(get_db),
    available_only: bool = Query(True)
):
    query = db.query(FarmPlot).filter(FarmPlot.farm_id == farm_id)
    if available_only:
        query = query.filter(FarmPlot.is_available == True)
    return query.all()

@router.get("/plots/{plot_id}", response_model=FarmPlotOut)
def get_plot(plot_id: int, db: Session = Depends(get_db)):
    plot = db.query(FarmPlot).filter(FarmPlot.id == plot_id).first()
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")
    return plot

@router.post("", response_model=FarmOut)
def create_farm(
    farm_in: FarmCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    farm = Farm(**farm_in.dict())
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm

@router.post("/plots", response_model=FarmPlotOut)
def create_plot(
    plot_in: FarmPlotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    farm = db.query(Farm).filter(Farm.id == plot_in.farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    
    plot = FarmPlot(**plot_in.dict())
    db.add(plot)
    db.commit()
    db.refresh(plot)
    return plot
