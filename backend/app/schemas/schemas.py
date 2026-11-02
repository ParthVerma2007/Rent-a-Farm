from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime

# --- AUTH SCHEMAS ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str = "customer" # customer, farmer, admin, agronomist

class UserRegister(UserBase):
    password: str
    delivery_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    experience_years: Optional[int] = 5

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

# --- FARM & PLOT SCHEMAS ---
class FarmPlotBase(BaseModel):
    plot_number: str
    name: str
    area_sqft: float
    area_sqm: float
    soil_type: str = "Loamy"
    soil_ph: float = 6.8
    is_available: bool = True
    water_availability: str = "Automated Drip (High)"
    monthly_rental_inr: float = 2500.0

class FarmPlotCreate(FarmPlotBase):
    farm_id: int

class FarmPlotOut(FarmPlotBase):
    id: int
    farm_id: int
    class Config:
        from_attributes = True

class FarmBase(BaseModel):
    name: str
    description: Optional[str] = None
    location_name: str
    state: str = "Karnataka"
    latitude: float
    longitude: float
    total_area_sqft: float = 50000.0
    water_source: str = "Drip Irrigation & Borewell"
    infrastructure_details: Optional[str] = None
    owner_name: Optional[str] = None
    image_url: Optional[str] = None
    is_organic_certified: bool = True
    certification_body: Optional[str] = "NPOP / Aditi Organic"

class FarmCreate(FarmBase):
    pass

class FarmOut(FarmBase):
    id: int
    created_at: datetime
    plots: List[FarmPlotOut] = []
    class Config:
        from_attributes = True

# --- CROP SCHEMAS ---
class CropBase(BaseModel):
    crop_key: str
    name: str
    category: str
    suitable_seasons: str
    suitable_soils: str
    min_ph: float = 6.0
    max_ph: float = 7.5
    water_level: str = "Medium"
    growth_cycle_days: int = 75
    avg_yield_kg_per_sqm: float = 4.0
    max_potential_yield_kg_per_sqm: float = 5.5
    cost_per_sqm_inr: float = 75.0
    companion_crops: Optional[str] = None
    incompatible_crops: Optional[str] = None
    nutritional_highlights: Optional[str] = None
    image_url: Optional[str] = None

class CropOut(CropBase):
    id: int
    class Config:
        from_attributes = True

# --- FARMING REQUEST SCHEMAS ---
class RequestedCropItem(BaseModel):
    crop_name: str
    target_quantity_kg: float
    preferred_variety: Optional[str] = "Organic Standard"

class FarmingRequestCreate(BaseModel):
    farm_id: int
    plot_id: int
    season: str = "Rabi"
    cultivation_preference: str = "Certified Organic"
    budget_inr: float
    notes: Optional[str] = None
    crops: List[RequestedCropItem]

class RequestedCropOut(RequestedCropItem):
    id: int
    class Config:
        from_attributes = True

class FeasibilityOut(BaseModel):
    id: int
    is_feasible: bool
    status: str
    overall_score: int
    available_area_sqm: float
    total_required_area_sqm: float
    area_utilization_percent: float
    min_viable_budget_inr: float
    reasons_json: str
    modifications_json: str
    warnings_json: str
    recommendations_json: str
    crop_evaluations_json: str
    cost_breakdown_json: str
    created_at: datetime
    class Config:
        from_attributes = True

class FarmingRequestOut(BaseModel):
    id: int
    customer_id: int
    farm_id: int
    plot_id: int
    season: str
    cultivation_preference: str
    budget_inr: float
    notes: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    farm: Optional[FarmOut] = None
    plot: Optional[FarmPlotOut] = None
    requested_crops: List[RequestedCropOut] = []
    feasibility: Optional[FeasibilityOut] = None
    class Config:
        from_attributes = True

# --- APPROVAL & ASSIGNMENT SCHEMAS ---
class ApprovalCreate(BaseModel):
    request_id: int
    decision: str # APPROVED, REJECTED, MODIFICATION_REQUESTED
    notes: Optional[str] = None

class FarmerAssignmentCreate(BaseModel):
    request_id: int
    farmer_id: int
    notes: Optional[str] = None

# --- TASK & LOG SCHEMAS ---
class TaskCreate(BaseModel):
    project_id: int
    title: str
    description: Optional[str] = None
    category: str = "Cultivation"
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    photo_url: Optional[str] = None

class TaskOut(BaseModel):
    id: int
    project_id: int
    farmer_id: int
    title: str
    description: Optional[str] = None
    category: str
    due_date: Optional[datetime] = None
    status: str
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None
    photo_url: Optional[str] = None
    class Config:
        from_attributes = True

class ActivityLogCreate(BaseModel):
    project_id: int
    activity_type: str
    title: str
    description: str
    photo_url: Optional[str] = None

class ActivityLogOut(BaseModel):
    id: int
    project_id: int
    farmer_id: int
    activity_type: str
    title: str
    description: str
    photo_url: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class InputLogCreate(BaseModel):
    project_id: int
    input_type: str # SEED, COMPOST, BIO_FERTILIZER, ORGANIC_PEST_CONTROL, IRRIGATION_WATER
    item_name: str
    quantity: float
    unit: str = "kg"
    is_organic_certified: bool = True
    certification_notes: Optional[str] = "NPOP compliant"
    photo_url: Optional[str] = None

class InputLogOut(BaseModel):
    id: int
    project_id: int
    farmer_id: int
    input_type: str
    item_name: str
    quantity: float
    unit: str
    is_organic_certified: bool
    certification_notes: Optional[str] = None
    photo_url: Optional[str] = None
    recorded_at: datetime
    class Config:
        from_attributes = True

# --- HARVEST & DELIVERY SCHEMAS ---
class HarvestRecordCreate(BaseModel):
    project_id: int
    crop_name: str
    requested_target_kg: float
    estimated_yield_kg: float
    actual_harvested_kg: float
    photo_url: Optional[str] = None
    quality_grade: str = "Grade A Organic"
    notes: Optional[str] = None

class HarvestRecordOut(BaseModel):
    id: int
    project_id: int
    crop_name: str
    requested_target_kg: float
    estimated_yield_kg: float
    actual_harvested_kg: float
    delivered_kg: float
    harvest_date: datetime
    status: str
    photo_url: Optional[str] = None
    quality_grade: str
    notes: Optional[str] = None
    class Config:
        from_attributes = True

class DeliveryRecordCreate(BaseModel):
    project_id: int
    recipient_name: str
    delivery_address: str
    contact_phone: str
    scheduled_date: Optional[datetime] = None
    delivered_kg_by_crop: Optional[Dict[str, float]] = None # crop_name -> kg
    delivery_notes: Optional[str] = None

class DeliveryRecordOut(BaseModel):
    id: int
    project_id: int
    recipient_name: str
    delivery_address: str
    contact_phone: str
    scheduled_date: Optional[datetime] = None
    delivered_date: Optional[datetime] = None
    tracking_number: Optional[str] = None
    status: str
    delivery_notes: Optional[str] = None
    class Config:
        from_attributes = True

# --- PROJECT SCHEMAS ---
class ProjectOut(BaseModel):
    id: int
    request_id: int
    customer_id: int
    farmer_id: int
    farm_id: int
    plot_id: int
    project_code: str
    current_stage: str
    status: str
    estimated_harvest_date: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    farm: Optional[FarmOut] = None
    plot: Optional[FarmPlotOut] = None
    tasks: List[TaskOut] = []
    activity_logs: List[ActivityLogOut] = []
    inputs: List[InputLogOut] = []
    harvest_records: List[HarvestRecordOut] = []
    delivery_records: List[DeliveryRecordOut] = []
    class Config:
        from_attributes = True

# --- FEEDBACK SCHEMAS ---
class FeedbackCreate(BaseModel):
    project_id: int
    overall_rating: int = 5
    produce_quality_rating: int = 5
    farmer_rating: int = 5
    comments: Optional[str] = None
    suggestions: Optional[str] = None

class FeedbackOut(FeedbackCreate):
    id: int
    customer_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- NOTIFICATION SCHEMAS ---
class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    category: str
    is_read: bool
    project_id: Optional[int] = None
    created_at: datetime
    class Config:
        from_attributes = True
