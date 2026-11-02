import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(50), default="customer", nullable=False) # customer, farmer, admin, agronomist
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    customer_profile = relationship("CustomerProfile", back_populates="user", uselist=False)
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False)
    requests = relationship("FarmingRequest", back_populates="customer")
    notifications = relationship("Notification", back_populates="user")


class CustomerProfile(Base):
    __tablename__ = "customer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    delivery_address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(20), nullable=True)
    dietary_preferences = Column(String(255), nullable=True)
    household_size = Column(Integer, default=4)

    user = relationship("User", back_populates="customer_profile")


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    experience_years = Column(Integer, default=5)
    bio = Column(Text, nullable=True)
    specializations = Column(String(255), default="Organic Horticulture, Drip Management")
    base_compensation_rate_inr = Column(Float, default=1500.0) # per milestone or month
    assigned_farm_id = Column(Integer, ForeignKey("farms.id"), nullable=True)

    user = relationship("User", back_populates="farmer_profile")
    assigned_farm = relationship("Farm")


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    location_name = Column(String(255), nullable=False)
    state = Column(String(100), default="Karnataka")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    total_area_sqft = Column(Float, default=50000.0)
    water_source = Column(String(100), default="Drip Irrigation & Borewell")
    infrastructure_details = Column(Text, nullable=True)
    owner_name = Column(String(255), nullable=True)
    image_url = Column(String(500), nullable=True)
    is_organic_certified = Column(Boolean, default=True)
    certification_body = Column(String(255), default="NPOP / Aditi Organic Certifications")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    plots = relationship("FarmPlot", back_populates="farm", cascade="all, delete-orphan")


class FarmPlot(Base):
    __tablename__ = "farm_plots"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    plot_number = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False)
    area_sqft = Column(Float, nullable=False)
    area_sqm = Column(Float, nullable=False)
    soil_type = Column(String(100), default="Loamy")
    soil_ph = Column(Float, default=6.8)
    is_available = Column(Boolean, default=True)
    water_availability = Column(String(100), default="Automated Drip (High)")
    monthly_rental_inr = Column(Float, default=2500.0)

    farm = relationship("Farm", back_populates="plots")
    requests = relationship("FarmingRequest", back_populates="plot")


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    crop_key = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    suitable_seasons = Column(String(255), nullable=False) # JSON or comma separated: "Rabi,Kharif"
    suitable_soils = Column(String(255), nullable=False) # "Loamy,Sandy Loam"
    min_ph = Column(Float, default=6.0)
    max_ph = Column(Float, default=7.5)
    water_level = Column(String(50), default="Medium")
    growth_cycle_days = Column(Integer, default=75)
    avg_yield_kg_per_sqm = Column(Float, default=4.0)
    max_potential_yield_kg_per_sqm = Column(Float, default=5.5)
    cost_per_sqm_inr = Column(Float, default=75.0)
    companion_crops = Column(String(255), nullable=True)
    incompatible_crops = Column(String(255), nullable=True)
    nutritional_highlights = Column(String(255), nullable=True)
    image_url = Column(String(500), nullable=True)


class FarmingRequest(Base):
    __tablename__ = "farming_requests"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    plot_id = Column(Integer, ForeignKey("farm_plots.id"), nullable=False)
    season = Column(String(50), default="Rabi") # Rabi, Kharif, Zaid
    cultivation_preference = Column(String(100), default="Certified Organic")
    budget_inr = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    # Workflow Status:
    # SUBMITTED, FEASIBILITY_CHECKED, APPROVED, REJECTED, MODIFICATION_REQUESTED, ASSIGNED, IN_PROGRESS, HARVESTED, DELIVERED, COMPLETED
    status = Column(String(50), default="SUBMITTED")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    customer = relationship("User", back_populates="requests")
    farm = relationship("Farm")
    plot = relationship("FarmPlot", back_populates="requests")
    requested_crops = relationship("RequestedCrop", back_populates="request", cascade="all, delete-orphan")
    feasibility = relationship("FeasibilityAssessment", back_populates="request", uselist=False, cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="request")
    assignment = relationship("FarmerAssignment", back_populates="request", uselist=False)
    project = relationship("FarmingProject", back_populates="request", uselist=False)


class RequestedCrop(Base):
    __tablename__ = "requested_crops"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("farming_requests.id"), nullable=False)
    crop_name = Column(String(100), nullable=False)
    target_quantity_kg = Column(Float, nullable=False)
    preferred_variety = Column(String(100), default="Organic Standard")

    request = relationship("FarmingRequest", back_populates="requested_crops")


class FeasibilityAssessment(Base):
    __tablename__ = "feasibility_assessments"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("farming_requests.id"), unique=True, nullable=False)
    is_feasible = Column(Boolean, nullable=False)
    status = Column(String(50), nullable=False) # FEASIBLE, CONDITIONALLY_FEASIBLE, INFEASIBLE
    overall_score = Column(Integer, default=80)
    available_area_sqm = Column(Float, default=0.0)
    total_required_area_sqm = Column(Float, default=0.0)
    area_utilization_percent = Column(Float, default=0.0)
    min_viable_budget_inr = Column(Float, default=0.0)
    reasons_json = Column(Text, default="[]") # JSON list
    modifications_json = Column(Text, default="[]") # JSON list
    warnings_json = Column(Text, default="[]") # JSON list
    recommendations_json = Column(Text, default="[]") # JSON list
    crop_evaluations_json = Column(Text, default="[]") # JSON list
    cost_breakdown_json = Column(Text, default="{}") # JSON dict
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    request = relationship("FarmingRequest", back_populates="feasibility")


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("farming_requests.id"), nullable=False)
    approver_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    decision = Column(String(50), nullable=False) # APPROVED, REJECTED, MODIFICATION_REQUESTED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    request = relationship("FarmingRequest", back_populates="approvals")
    approver = relationship("User")


class FarmerAssignment(Base):
    __tablename__ = "farmer_assignments"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("farming_requests.id"), unique=True, nullable=False)
    farmer_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default="ASSIGNED") # ASSIGNED, ACCEPTED, DECLINED
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow)
    notes = Column(Text, nullable=True)

    request = relationship("FarmingRequest", back_populates="assignment")
    farmer = relationship("User", foreign_keys=[farmer_user_id])
    assigned_by = relationship("User", foreign_keys=[assigned_by_user_id])


class FarmingProject(Base):
    __tablename__ = "farming_projects"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("farming_requests.id"), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False)
    plot_id = Column(Integer, ForeignKey("farm_plots.id"), nullable=False)
    project_code = Column(String(50), unique=True, nullable=False) # e.g. RAF-2026-001
    
    # Stages from Prompt Section 3.A.6:
    # 1. Request submitted
    # 2. Feasibility assessment
    # 3. Awaiting approval
    # 4. Farmer assigned
    # 5. Cultivation started
    # 6. Crop development
    # 7. Maintenance and monitoring
    # 8. Harvest preparation
    # 9. Harvest completed
    # 10. Delivery in progress
    # 11. Delivered
    current_stage = Column(String(100), default="Cultivation started")
    status = Column(String(50), default="ACTIVE") # ACTIVE, HARVESTED, DELIVERED, COMPLETED, CANCELLED
    estimated_harvest_date = Column(DateTime, nullable=True)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    request = relationship("FarmingRequest", back_populates="project")
    customer = relationship("User", foreign_keys=[customer_id])
    farmer = relationship("User", foreign_keys=[farmer_id])
    farm = relationship("Farm")
    plot = relationship("FarmPlot")
    tasks = relationship("FarmingTask", back_populates="project", cascade="all, delete-orphan")
    activity_logs = relationship("FarmingActivityLog", back_populates="project", cascade="all, delete-orphan")
    inputs = relationship("FarmingInput", back_populates="project", cascade="all, delete-orphan")
    harvest_records = relationship("HarvestRecord", back_populates="project", cascade="all, delete-orphan")
    delivery_records = relationship("DeliveryRecord", back_populates="project", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="project", cascade="all, delete-orphan")


class FarmingTask(Base):
    __tablename__ = "farming_tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("farming_projects.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False) # Land preparation, Seed sowing, Irrigation, Fertilization, Pest monitoring
    description = Column(Text, nullable=True)
    category = Column(String(100), default="Cultivation")
    due_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="PENDING") # PENDING, IN_PROGRESS, COMPLETED
    completed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)

    project = relationship("FarmingProject", back_populates="tasks")
    farmer = relationship("User")


class FarmingActivityLog(Base):
    __tablename__ = "farming_activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("farming_projects.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_type = Column(String(100), nullable=False) # Bed Preparation, Sowing, Weeding, Trellising, Pest Inspection, Irrigation
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    photo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("FarmingProject", back_populates="activity_logs")
    farmer = relationship("User")


class FarmingInput(Base):
    __tablename__ = "farming_inputs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("farming_projects.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    input_type = Column(String(100), nullable=False) # SEED, COMPOST, BIO_FERTILIZER, ORGANIC_PEST_CONTROL, IRRIGATION_WATER
    item_name = Column(String(255), nullable=False) # e.g. Vermicompost, Neem Oil 1500ppm, Jeevamrutha
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), default="kg") # kg, Liters, Bags
    is_organic_certified = Column(Boolean, default=True)
    certification_notes = Column(String(255), default="NPOP organic compliant bio-input")
    photo_url = Column(String(500), nullable=True)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("FarmingProject", back_populates="inputs")
    farmer = relationship("User")


class HarvestRecord(Base):
    __tablename__ = "harvest_records"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("farming_projects.id"), nullable=False)
    crop_name = Column(String(100), nullable=False)
    requested_target_kg = Column(Float, nullable=False)
    estimated_yield_kg = Column(Float, nullable=False)
    actual_harvested_kg = Column(Float, nullable=False)
    delivered_kg = Column(Float, default=0.0)
    harvest_date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(50), default="RECORDED") # RECORDED, VERIFIED_BY_ADMIN, PACKED, DELIVERED
    photo_url = Column(String(500), nullable=True)
    quality_grade = Column(String(50), default="Grade A Organic")
    notes = Column(Text, nullable=True)

    project = relationship("FarmingProject", back_populates="harvest_records")


class DeliveryRecord(Base):
    __tablename__ = "delivery_records"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("farming_projects.id"), nullable=False)
    recipient_name = Column(String(255), nullable=False)
    delivery_address = Column(String(500), nullable=False)
    contact_phone = Column(String(50), nullable=False)
    scheduled_date = Column(DateTime, nullable=True)
    delivered_date = Column(DateTime, nullable=True)
    tracking_number = Column(String(100), nullable=True)
    status = Column(String(50), default="PREPARING") # PREPARING, OUT_FOR_DELIVERY, DELIVERED
    delivery_notes = Column(Text, nullable=True)

    project = relationship("FarmingProject", back_populates="delivery_records")


class CompensationRecord(Base):
    __tablename__ = "compensation_records"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("farming_projects.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("farming_tasks.id"), nullable=True)
    amount_inr = Column(Float, nullable=False)
    description = Column(String(255), nullable=False)
    status = Column(String(50), default="APPROVED") # PENDING, APPROVED, PAID
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer = relationship("User")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(100), default="ORDER_UPDATE") # FEASIBILITY, APPROVAL, TASK, HARVEST, DELIVERY
    is_read = Column(Boolean, default=False)
    project_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("farming_projects.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    overall_rating = Column(Integer, default=5) # 1 - 5
    produce_quality_rating = Column(Integer, default=5)
    farmer_rating = Column(Integer, default=5)
    comments = Column(Text, nullable=True)
    suggestions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("FarmingProject", back_populates="feedbacks")
    customer = relationship("User")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(100), nullable=False) # FarmingRequest, Approval, HarvestRecord
    entity_id = Column(Integer, nullable=False)
    action = Column(String(100), nullable=False) # FEASIBILITY_EVALUATION, APPROVAL_GRANTED, RECONCILIATION
    performed_by_user_id = Column(Integer, nullable=True)
    details_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
