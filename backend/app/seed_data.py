import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import (
    User, CustomerProfile, FarmerProfile, Farm, FarmPlot, Crop,
    FarmingRequest, RequestedCrop, FeasibilityAssessment, Approval,
    FarmerAssignment, FarmingProject, FarmingTask, FarmingActivityLog,
    FarmingInput, HarvestRecord, DeliveryRecord, CompensationRecord,
    Notification
)
from .services.auth_service import hash_password
from agronomic_engine import CROP_DATABASE

def seed_all(db: Session):
    # Ensure all tables exist
    Base.metadata.create_all(bind=engine)

    # Check if already seeded
    if db.query(User).filter(User.email == "customer@rentafarm.com").first():
        print("Database already contains seed data.")
        return

    print("Seeding Rent-a-Farm database...")

    # 1. Users
    pwd = hash_password("password123")

    cust = User(
        email="customer@rentafarm.com",
        hashed_password=pwd,
        full_name="Ananya Sharma",
        phone="+91 98765 43210",
        role="customer"
    )
    db.add(cust)
    db.commit()
    db.refresh(cust)

    cust_prof = CustomerProfile(
        user_id=cust.id,
        delivery_address="Flat 402, Green Orchid Enclave, Indiranagar",
        city="Bengaluru",
        state="Karnataka",
        pincode="560038",
        dietary_preferences="100% Certified Organic, Non-GMO",
        household_size=4
    )
    db.add(cust_prof)

    farmer = User(
        email="farmer@rentafarm.com",
        hashed_password=pwd,
        full_name="Ramesh Patel",
        phone="+91 98220 11223",
        role="farmer"
    )
    db.add(farmer)
    db.commit()
    db.refresh(farmer)

    farmer_prof = FarmerProfile(
        user_id=farmer.id,
        experience_years=14,
        bio="Specialist in biodynamic raised-bed horticulture, companion planting, and drip fertigation with 14 years organic experience.",
        specializations="Heirloom Solanaceae, Root Crops, Biological Pest Management",
        base_compensation_rate_inr=1800.0
    )
    db.add(farmer_prof)

    admin = User(
        email="admin@rentafarm.com",
        hashed_password=pwd,
        full_name="Dr. Vikram Rao",
        phone="+91 98450 99887",
        role="admin"
    )
    db.add(admin)

    agronomist = User(
        email="agronomist@rentafarm.com",
        hashed_password=pwd,
        full_name="Priya Nair (M.Sc. Agronomy)",
        phone="+91 99160 55443",
        role="agronomist"
    )
    db.add(agronomist)
    db.commit()

    # 2. Crops Knowledge Base
    for key, c in CROP_DATABASE.items():
        crop_model = Crop(
            crop_key=key,
            name=c["name"],
            category=c["category"],
            suitable_seasons=",".join(c["suitable_seasons"]),
            suitable_soils=",".join(c["suitable_soils"]),
            min_ph=c["min_ph"],
            max_ph=c["max_ph"],
            water_level=c["water_requirement_level"],
            growth_cycle_days=c["growth_cycle_days"],
            avg_yield_kg_per_sqm=c["avg_yield_kg_per_sqm"],
            max_potential_yield_kg_per_sqm=c["max_potential_yield_kg_per_sqm"],
            cost_per_sqm_inr=c["cultivation_cost_per_sqm_inr"],
            companion_crops=",".join(c.get("companion_crops", [])),
            incompatible_crops=",".join(c.get("incompatible_crops", [])),
            nutritional_highlights=c.get("nutritional_highlights", ""),
            image_url=f"https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80"
        )
        db.add(crop_model)
    db.commit()

    # 3. Farms & Plots
    farm1 = Farm(
        name="Green Valley Organic Farm",
        description="A certified organic 15-acre sanctuary located along the fertile Cauvery basin corridor with automated micro-drip networks.",
        location_name="Ramanagara, Mysore Highway",
        state="Karnataka",
        latitude=12.7209,
        longitude=77.2799,
        total_area_sqft=650000.0,
        water_source="Automated Drip Irrigation & Rainwater Harvesting",
        infrastructure_details="Protected Poly-tunnel Nursery, Vermicompost Beds, Cold-chain Transit Facility, Automated Drip Fertigation",
        owner_name="Soma Sundaram",
        image_url="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80",
        is_organic_certified=True,
        certification_body="NPOP & Aditi Organic Certification Services (AOCS-024)"
    )
    db.add(farm1)
    db.commit()
    db.refresh(farm1)

    farm2 = Farm(
        name="Nandi Foothills Agro-Eco Park",
        description="Cool micro-climate organic estate at the base of Nandi Hills, pristine mountain-runoff irrigation and mineral-rich alluvial soil.",
        location_name="Nandi Foothills, Chikkaballapur",
        state="Karnataka",
        latitude=13.3702,
        longitude=77.6834,
        total_area_sqft=420000.0,
        water_source="Deep Borewell & Sub-surface Drip",
        infrastructure_details="Bio-fertilizer Lab, Shade Net Houses, On-site Calibrated Digital Weighing Stations",
        owner_name="Kavita Reddy",
        image_url="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800&auto=format&fit=crop&q=80",
        is_organic_certified=True,
        certification_body="Jaivik Bharat / OneCert International"
    )
    db.add(farm2)
    db.commit()
    db.refresh(farm2)

    farm3 = Farm(
        name="Sahyadri Heritage Farmstead",
        description="Sub-tropical organic cultivation terrace overlooking the Western Ghats with rich humus clay loam soil.",
        location_name="Sakleshpur Foothills, Hassan",
        state="Karnataka",
        latitude=12.9442,
        longitude=75.7865,
        total_area_sqft=550000.0,
        water_source="Perennial Mountain Spring",
        infrastructure_details="Solar Dehydrator, Bio-dynamic Compost Tanks, On-site Tasting Gazebo",
        owner_name="Devanand Gowda",
        image_url="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80",
        is_organic_certified=True,
        certification_body="APEDA Accredited NPOP"
    )
    db.add(farm3)
    db.commit()
    db.refresh(farm3)

    # Plots for Farm 1
    plot1 = FarmPlot(
        farm_id=farm1.id,
        plot_number="GV-A101",
        name="Plot Lotus - Premium Bed",
        area_sqft=500.0,
        area_sqm=46.45,
        soil_type="Loamy",
        soil_ph=6.8,
        is_available=False, # dedicated to demo project
        water_availability="Automated Drip (High)",
        monthly_rental_inr=3200.0
    )
    plot2 = FarmPlot(
        farm_id=farm1.id,
        plot_number="GV-A102",
        name="Plot Jasmine - Sunny Ridge",
        area_sqft=800.0,
        area_sqm=74.32,
        soil_type="Loamy",
        soil_ph=7.0,
        is_available=True,
        water_availability="Automated Drip (High)",
        monthly_rental_inr=4800.0
    )
    plot3 = FarmPlot(
        farm_id=farm1.id,
        plot_number="GV-B201",
        name="Plot Marigold - Herbaceous Quarter",
        area_sqft=350.0,
        area_sqm=32.51,
        soil_type="Sandy Loam",
        soil_ph=6.6,
        is_available=True,
        water_availability="Borewell + Drip",
        monthly_rental_inr=2400.0
    )
    db.add_all([plot1, plot2, plot3])

    # Plots for Farm 2
    plot4 = FarmPlot(
        farm_id=farm2.id,
        plot_number="NF-01",
        name="Hillcrest Terrace Alpha",
        area_sqft=600.0,
        area_sqm=55.74,
        soil_type="Alluvial",
        soil_ph=6.7,
        is_available=True,
        water_availability="Deep Borewell Drip (High)",
        monthly_rental_inr=3800.0
    )
    plot5 = FarmPlot(
        farm_id=farm2.id,
        plot_number="NF-02",
        name="Orchard Side Plot",
        area_sqft=1000.0,
        area_sqm=92.90,
        soil_type="Loamy",
        soil_ph=6.9,
        is_available=True,
        water_availability="Automated Drip (High)",
        monthly_rental_inr=5800.0
    )
    db.add_all([plot4, plot5])
    db.commit()
    db.refresh(plot1)

    # 4. Live Demonstration Farming Request (Full Traceable Workflow)
    req1 = FarmingRequest(
        customer_id=cust.id,
        farm_id=farm1.id,
        plot_id=plot1.id,
        season="Rabi",
        cultivation_preference="Certified Organic",
        budget_inr=14500.0,
        notes="Family household consumption. Please prioritize heirloom Roma tomatoes and tender baby spinach. Use only certified neem cake and vermicompost.",
        status="ASSIGNED"
    )
    db.add(req1)
    db.commit()
    db.refresh(req1)

    rc1 = RequestedCrop(request_id=req1.id, crop_name="Tomato", target_quantity_kg=35.0, preferred_variety="Roma Heirloom")
    rc2 = RequestedCrop(request_id=req1.id, crop_name="Spinach", target_quantity_kg=20.0, preferred_variety="English Baby Spinach")
    db.add_all([rc1, rc2])

    feas1 = FeasibilityAssessment(
        request_id=req1.id,
        is_feasible=True,
        status="CONDITIONALLY_FEASIBLE",
        overall_score=94,
        available_area_sqm=39.48,
        total_required_area_sqm=16.87,
        area_utilization_percent=42.7,
        min_viable_budget_inr=6250.0,
        reasons_json=json.dumps([]),
        modifications_json=json.dumps([]),
        warnings_json=json.dumps([
            "Guardrail: Target quantities represent planning targets, not guaranteed physical harvest yields.",
            "High winter dew in December requires prophylactic biological neem aeration."
        ]),
        recommendations_json=json.dumps([
            "Stagger spinach sowing across 3 successive fortnights for continuous family harvest.",
            "Intercrop with African Marigolds to biologically deter root-knot nematodes."
        ]),
        crop_evaluations_json=json.dumps([
            {
                "crop_name": "Tomato",
                "target_quantity_kg": 35.0,
                "required_area_sqm": 7.78,
                "estimated_yield_range_kg": {"conservative_yield": 29.8, "expected_yield": 35.0, "max_potential_yield": 46.7},
                "season_compatible": True,
                "soil_compatible": True,
                "water_demand_liters": 3500,
                "estimated_cost_inr": 661.3,
                "status": "APPROVED",
                "notes": ["Growth cycle: 90 days", "Companion: Marigold, Basil"]
            },
            {
                "crop_name": "Spinach",
                "target_quantity_kg": 20.0,
                "required_area_sqm": 9.09,
                "estimated_yield_range_kg": {"conservative_yield": 17.0, "expected_yield": 20.0, "max_potential_yield": 27.3},
                "season_compatible": True,
                "soil_compatible": True,
                "water_demand_liters": 2272,
                "estimated_cost_inr": 409.1,
                "status": "APPROVED",
                "notes": ["Growth cycle: 40 days", "Tender succulent leaf harvest"]
            }
        ]),
        cost_breakdown_json=json.dumps({
            "seeds_and_organic_inputs_inr": 1070.4,
            "plot_lease_and_irrigation_inr": 592.2,
            "farmer_labor_compensation_inr": 590.5,
            "contingency_and_logistics_inr": 225.3,
            "total_min_viable_budget_inr": 2478.4
        })
    )
    db.add(feas1)

    appr1 = Approval(
        request_id=req1.id,
        approver_user_id=agronomist.id,
        decision="APPROVED",
        notes="Approved. Soil pH 6.8 and loamy profile are ideal. Drip emitters spaced at 30cm calibrated for solanaceous root zone."
    )
    db.add(appr1)

    assign1 = FarmerAssignment(
        request_id=req1.id,
        farmer_user_id=farmer.id,
        assigned_by_user_id=admin.id,
        status="ASSIGNED",
        notes="Farmer Ramesh Patel assigned. Proven expertise in companion planting."
    )
    db.add(assign1)

    # 5. Live Farming Project
    proj1 = FarmingProject(
        request_id=req1.id,
        customer_id=cust.id,
        farmer_id=farmer.id,
        farm_id=farm1.id,
        plot_id=plot1.id,
        project_code="RAF-2026-001",
        current_stage="Maintenance and monitoring",
        status="ACTIVE",
        estimated_harvest_date=datetime.utcnow() + timedelta(days=20),
        started_at=datetime.utcnow() - timedelta(days=45)
    )
    db.add(proj1)
    db.commit()
    db.refresh(proj1)

    # 6. Tasks
    t1 = FarmingTask(
        project_id=proj1.id,
        farmer_id=farmer.id,
        title="Land Preparation & Raised Bed Ridging",
        description="Deep tilling, setting up 4ft wide raised organic beds with furrow irrigation paths.",
        category="Field Operations",
        due_date=datetime.utcnow() - timedelta(days=42),
        status="COMPLETED",
        completed_at=datetime.utcnow() - timedelta(days=41),
        notes="Soil tilth optimal; incorporated 80kg compost.",
        photo_url="https://images.unsplash.com/photo-1592417817098-8f3d69104a47?w=600&auto=format&fit=crop&q=80"
    )
    t2 = FarmingTask(
        project_id=proj1.id,
        farmer_id=farmer.id,
        title="Seed Treatment & Direct Line Sowing",
        description="Bio-priming seeds with Trichoderma harzianum and line sowing at recommended spacing.",
        category="Field Operations",
        due_date=datetime.utcnow() - timedelta(days=35),
        status="COMPLETED",
        completed_at=datetime.utcnow() - timedelta(days=34),
        notes="100% organic heirloom seeds sown.",
        photo_url="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80"
    )
    t3 = FarmingTask(
        project_id=proj1.id,
        farmer_id=farmer.id,
        title="Drip Irrigation Channeling & Mulching",
        description="Laying organic paddy straw mulch around tomato root zones to conserve soil moisture.",
        category="Irrigation & Soil",
        due_date=datetime.utcnow() - timedelta(days=20),
        status="COMPLETED",
        completed_at=datetime.utcnow() - timedelta(days=19),
        notes="Drip calibrated to 3.5 liters/hour emitter flow.",
        photo_url="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=80"
    )
    t4 = FarmingTask(
        project_id=proj1.id,
        farmer_id=farmer.id,
        title="Organic Pest Prophylaxis & Sticky Traps",
        description="Applying cold-pressed neem oil (1500ppm) and mounting yellow/blue sticky insect cards.",
        category="Pest Management",
        due_date=datetime.utcnow() + timedelta(days=2),
        status="IN_PROGRESS",
        notes="Zero synthetic pesticide protocol strictly maintained."
    )
    t5 = FarmingTask(
        project_id=proj1.id,
        farmer_id=farmer.id,
        title="Harvest & Calibrated Digital Weighing",
        description="Batch harvesting ripe fruit at sunrise, grading, and recording calibrated weight.",
        category="Harvesting",
        due_date=datetime.utcnow() + timedelta(days=20),
        status="PENDING"
    )
    db.add_all([t1, t2, t3, t4, t5])

    # 7. Activity Logs
    act1 = FarmingActivityLog(
        project_id=proj1.id,
        farmer_id=farmer.id,
        activity_type="Bed Preparation",
        title="Aeration and Basal Compost Blending",
        description="Turned top 20cm soil, added well-decomposed cow manure and vermicompost. Soil moisture measured at 65%.",
        photo_url="https://images.unsplash.com/photo-1592417817098-8f3d69104a47?w=600&auto=format&fit=crop&q=80",
        created_at=datetime.utcnow() - timedelta(days=40)
    )
    act2 = FarmingActivityLog(
        project_id=proj1.id,
        farmer_id=farmer.id,
        activity_type="Sprouting Observation",
        title="95% Emergence Rate Recorded",
        description="Both spinach rows and tomato seedlings show uniform cotyledon development. No fungal damping off observed.",
        photo_url="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80",
        created_at=datetime.utcnow() - timedelta(days=28)
    )
    act3 = FarmingActivityLog(
        project_id=proj1.id,
        farmer_id=farmer.id,
        activity_type="Trellising & Pruning",
        title="Bamboo Staking for Roma Tomatoes",
        description="Installed 5ft bamboo trellis stakes and tied organic jute twine to support vigorous fruit truss growth.",
        photo_url="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
        created_at=datetime.utcnow() - timedelta(days=10)
    )
    db.add_all([act1, act2, act3])

    # 8. Inputs Records (Full Organic Transparency)
    inp1 = FarmingInput(
        project_id=proj1.id,
        farmer_id=farmer.id,
        input_type="SEED",
        item_name="Roma Heirloom Certified Organic Seeds",
        quantity=150.0,
        unit="grams",
        is_organic_certified=True,
        certification_notes="Certified by Navdanya Seed Bank (Batch #ND-2026)",
        recorded_at=datetime.utcnow() - timedelta(days=35)
    )
    inp2 = FarmingInput(
        project_id=proj1.id,
        farmer_id=farmer.id,
        input_type="COMPOST",
        item_name="Earthworm Vermicompost (Enriched with Neem)",
        quantity=80.0,
        unit="kg",
        is_organic_certified=True,
        certification_notes="NPOP Certified Organic Compost from Green Valley bio-shed",
        recorded_at=datetime.utcnow() - timedelta(days=30)
    )
    inp3 = FarmingInput(
        project_id=proj1.id,
        farmer_id=farmer.id,
        input_type="BIO_FERTILIZER",
        item_name="Fermented Jeevamrutha Microbial Wash",
        quantity=25.0,
        unit="Liters",
        is_organic_certified=True,
        certification_notes="Indigenous Gir cow dung & urine based microbial formulation",
        recorded_at=datetime.utcnow() - timedelta(days=15)
    )
    inp4 = FarmingInput(
        project_id=proj1.id,
        farmer_id=farmer.id,
        input_type="ORGANIC_PEST_CONTROL",
        item_name="Cold-Pressed Neem Oil (Azadirachtin 1500 ppm)",
        quantity=500.0,
        unit="ml",
        is_organic_certified=True,
        certification_notes="Govt. Approved botanical bio-pesticide",
        recorded_at=datetime.utcnow() - timedelta(days=5)
    )
    db.add_all([inp1, inp2, inp3, inp4])

    # 9. Harvest Record for Spinach (First partial harvest)
    hr1 = HarvestRecord(
        project_id=proj1.id,
        crop_name="Spinach",
        requested_target_kg=20.0,
        estimated_yield_kg=20.0,
        actual_harvested_kg=21.4, # slightly exceeded target
        delivered_kg=21.4,
        harvest_date=datetime.utcnow() - timedelta(days=2),
        status="DELIVERED",
        photo_url="https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80",
        quality_grade="Grade A+ Crisp Organic",
        notes="First batch morning cut. Weighed on calibrated digital scale. High tenderness."
    )
    db.add(hr1)

    # 10. Delivery Record for the first harvest
    deliv1 = DeliveryRecord(
        project_id=proj1.id,
        recipient_name="Ananya Sharma",
        delivery_address="Flat 402, Green Orchid Enclave, Indiranagar, Bengaluru - 560038",
        contact_phone="+91 98765 43210",
        scheduled_date=datetime.utcnow() - timedelta(days=1),
        delivered_date=datetime.utcnow() - timedelta(days=1),
        tracking_number="TRK-RAF98421",
        status="DELIVERED",
        delivery_notes="Delivered in insulated chilled organic cotton crate. Produce accepted in pristine condition."
    )
    db.add(deliv1)

    # 11. Farmer Compensation Records
    comp1 = CompensationRecord(
        farmer_id=farmer.id,
        project_id=proj1.id,
        amount_inr=1500.0,
        description="Bed preparation & Seed Sowing Milestone",
        status="PAID",
        paid_at=datetime.utcnow() - timedelta(days=25)
    )
    comp2 = CompensationRecord(
        farmer_id=farmer.id,
        project_id=proj1.id,
        amount_inr=650.0,
        description="Drip Channeling & Mulching Task",
        status="PAID",
        paid_at=datetime.utcnow() - timedelta(days=15)
    )
    comp3 = CompensationRecord(
        farmer_id=farmer.id,
        project_id=proj1.id,
        amount_inr=1200.0,
        description="First Harvest Batch (Spinach 21.4kg) Weighing & Packing",
        status="APPROVED"
    )
    db.add_all([comp1, comp2, comp3])

    # 12. Notifications
    notif1 = Notification(
        user_id=cust.id,
        title="Welcome to Rent-a-Farm!",
        message="Your farm-to-doorstep journey begins. Discover farms and tailor your organic harvest brief.",
        category="GENERAL",
        project_id=None
    )
    notif2 = Notification(
        user_id=cust.id,
        title="Produce Delivered!",
        message="Your first batch of crisp organic Spinach (21.4 kg) was delivered yesterday to your Indiranagar home.",
        category="DELIVERY",
        project_id=proj1.id
    )
    notif3 = Notification(
        user_id=farmer.id,
        title="New Task Scheduled",
        message="Organic Pest Prophylaxis spray scheduled for Plot Lotus (GV-A101).",
        category="TASK",
        project_id=proj1.id
    )
    db.add_all([notif1, notif2, notif3])

    db.commit()
    print("Seed data successfully populated!")
