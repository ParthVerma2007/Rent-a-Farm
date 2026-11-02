"""
Agronomic Assessment Engine - Core Evaluation Logic
Validates customer farming briefs against biological and scientific agricultural parameters.
"""
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from .crop_database import CROP_DATABASE, SOIL_TYPES, SEASONS, get_crop

SQFT_TO_SQM = 0.09290304
EFFECTIVE_CULTIVABLE_RATIO = 0.85 # 85% effective bed area; 15% dedicated to paths, bunds, irrigation lines

@dataclass
class CropEvaluation:
    crop_name: str
    target_quantity_kg: float
    required_area_sqm: float
    estimated_yield_range_kg: Dict[str, float]
    season_compatible: bool
    soil_compatible: bool
    water_demand_liters: float
    estimated_cost_inr: float
    status: str
    notes: List[str]

@dataclass
class FeasibilityResult:
    is_feasible: bool
    status: str # "FEASIBLE", "CONDITIONALLY_FEASIBLE", "INFEASIBLE"
    overall_score: int # 0 to 100
    available_area_sqm: float
    total_required_area_sqm: float
    area_utilization_percent: float
    min_viable_budget_inr: float
    customer_budget_inr: float
    budget_sufficient: bool
    reasons: List[str]
    required_modifications: List[str]
    warnings: List[str]
    recommendations: List[str]
    crop_evaluations: List[Dict[str, Any]]
    cost_breakdown: Dict[str, float]
    shared_land_group_tag: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def evaluate_farming_brief(
    plot_area_sqft: float,
    soil_type: str,
    soil_ph: float,
    water_source: str, # "Drip Irrigation", "Borewell", "Canal", "Rainfed"
    season: str, # "Rabi", "Kharif", "Zaid", or month
    budget_inr: float,
    crops_requested: List[Dict[str, Any]], # [{"name": "Tomato", "target_kg": 50, "preferred_variety": "Roma"}]
    cultivation_preference: str = "Certified Organic", # "Certified Organic", "Natural Farming", "Low-Input Sustainable"
    custom_inputs_requested: Optional[List[str]] = None
) -> FeasibilityResult:
    """
    Evaluates a farming brief and returns a detailed feasibility report.
    """
    reasons = []
    required_modifications = []
    warnings = []
    recommendations = []
    crop_evals = []

    # 1. Area conversions
    total_plot_area_sqm = plot_area_sqft * SQFT_TO_SQM
    cultivable_area_sqm = total_plot_area_sqm * EFFECTIVE_CULTIVABLE_RATIO

    total_required_area_sqm = 0.0
    total_water_demand_liters = 0.0
    direct_cultivation_cost = 0.0

    selected_crop_names = []

    # 2. Per-crop biological evaluations
    for item in crops_requested:
        crop_input_name = item.get("name")
        target_kg = float(item.get("target_kg", 10.0))

        crop_info = get_crop(crop_input_name)
        if not crop_info:
            reasons.append(f"Crop '{crop_input_name}' is not currently in the approved agronomic database.")
            required_modifications.append(f"Replace '{crop_input_name}' with a supported crop from our verified database.")
            continue

        crop_key = crop_info["name"]
        selected_crop_names.append(crop_key)

        # Area needed for target quantity
        avg_yield = crop_info["avg_yield_kg_per_sqm"]
        max_yield = crop_info["max_potential_yield_kg_per_sqm"]
        crop_req_area = target_kg / avg_yield
        total_required_area_sqm += crop_req_area

        # Water demand
        water_demand = crop_req_area * crop_info["water_liters_per_sqm_per_cycle"]
        total_water_demand_liters += water_demand

        # Cultivation cost
        crop_cost = crop_req_area * crop_info["cultivation_cost_per_sqm_inr"]
        direct_cultivation_cost += crop_cost

        # Seasonal compatibility check
        is_season_ok = (season in crop_info["suitable_seasons"]) or ("YearRound" in crop_info["suitable_seasons"])
        if not is_season_ok:
            reasons.append(
                f"Crop '{crop_key}' is not suited for the '{season}' season. It requires {', '.join(crop_info['suitable_seasons'])}."
            )
            required_modifications.append(
                f"Reschedule planting of '{crop_key}' to {crop_info['suitable_seasons'][0]} season or substitute with a seasonal crop."
            )

        # Soil type compatibility check
        is_soil_ok = soil_type in crop_info["suitable_soils"]
        if not is_soil_ok:
            reasons.append(
                f"Soil type '{soil_type}' is suboptimal for '{crop_key}'. Preferred: {', '.join(crop_info['suitable_soils'])}."
            )
            required_modifications.append(
                f"Select a plot with {crop_info['suitable_soils'][0]} soil, or incorporate organic compost to improve texture."
            )

        # Soil pH check
        ph_ok = crop_info["min_ph"] <= soil_ph <= crop_info["max_ph"]
        if not ph_ok:
            warnings.append(
                f"Soil pH {soil_ph} is outside optimum range ({crop_info['min_ph']} - {crop_info['max_ph']}) for {crop_key}."
            )
            recommendations.append(
                f"Farmer should apply agricultural gypsum/compost to buffer soil pH for {crop_key}."
            )

        # Yield realistic warning
        potential_min = target_kg * 0.85
        potential_max = crop_req_area * max_yield

        crop_notes = [
            f"Growth cycle: {crop_info['growth_cycle_days']} days",
            f"Companion crops: {', '.join(crop_info['companion_crops'])}"
        ]
        if target_kg > 100:
            crop_notes.append("Large volume batch: phased staggered harvesting recommended.")

        crop_evals.append({
            "crop_name": crop_key,
            "target_quantity_kg": round(target_kg, 1),
            "required_area_sqm": round(crop_req_area, 2),
            "estimated_yield_range_kg": {
                "conservative_yield": round(potential_min, 1),
                "expected_yield": round(target_kg, 1),
                "max_potential_yield": round(potential_max, 1)
            },
            "season_compatible": is_season_ok,
            "soil_compatible": is_soil_ok,
            "water_demand_liters": round(water_demand, 0),
            "estimated_cost_inr": round(crop_cost, 2),
            "status": "APPROVED" if (is_season_ok and is_soil_ok) else "RESTRICTED",
            "notes": crop_notes
        })

    # 3. Incompatible crop companion check
    for i, c1 in enumerate(selected_crop_names):
        info1 = get_crop(c1)
        if not info1:
            continue
        for c2 in selected_crop_names[i+1:]:
            if c2 in info1.get("incompatible_crops", []):
                warnings.append(
                    f"Agronomic Alert: '{c1}' and '{c2}' are antagonistic companion crops. They must be planted in separated non-adjacent sub-plots."
                )
                recommendations.append(
                    f"Create buffer row of Marigold or Basil between '{c1}' and '{c2}' to deter common pests."
                )

    # 4. Total Area vs Plot Capacity Check
    area_utilization = (total_required_area_sqm / cultivable_area_sqm * 100.0) if cultivable_area_sqm > 0 else 999.0
    if total_required_area_sqm > cultivable_area_sqm:
        area_shortfall_sqm = total_required_area_sqm - cultivable_area_sqm
        area_shortfall_sqft = area_shortfall_sqm / SQFT_TO_SQM
        reasons.append(
            f"Target crop quantities require {round(total_required_area_sqm, 1)} m² of bed area, but the selected plot only has {round(cultivable_area_sqm, 1)} m² usable space."
        )
        required_modifications.append(
            f"Reduce target quantities by {round((1 - cultivable_area_sqm / total_required_area_sqm) * 100, 0)}% or upgrade to a plot with at least {round(total_required_area_sqm / SQFT_TO_SQM, 0)} sq ft."
        )
    elif area_utilization > 90.0:
        warnings.append(
            f"High land utilization ({round(area_utilization, 1)}%). Tight plant spacing will require rigorous weed and airflow management."
        )

    # 5. Water Availability Check
    if water_source == "Rainfed" and season in ["Rabi", "Zaid"]:
        reasons.append("Rainfed irrigation is inadequate during dry winter/summer cycles for high-water horticulture.")
        required_modifications.append("Select a plot equipped with Borewell or Drip Irrigation infrastructure.")
    elif water_source == "Rainfed":
        warnings.append("Rainfed plot selected: yield is heavily reliant on monsoon precipitation patterns.")

    # 6. Budget Evaluation
    # Cost composition:
    # - Direct input & seed cost
    # - Plot lease & maintenance allowance: ₹15 per sqm
    # - Farmer labor & supervision compensation: ₹35 per sqm
    # - 10% Contingency / logistics reserve
    base_plot_lease = cultivable_area_sqm * 15.0
    farmer_compensation = total_required_area_sqm * 35.0
    subtotal = direct_cultivation_cost + base_plot_lease + farmer_compensation
    contingency = subtotal * 0.10
    min_viable_budget = subtotal + contingency

    cost_breakdown = {
        "seeds_and_organic_inputs_inr": round(direct_cultivation_cost, 2),
        "plot_lease_and_irrigation_inr": round(base_plot_lease, 2),
        "farmer_labor_compensation_inr": round(farmer_compensation, 2),
        "contingency_and_logistics_inr": round(contingency, 2),
        "total_min_viable_budget_inr": round(min_viable_budget, 2)
    }

    budget_sufficient = budget_inr >= min_viable_budget
    if not budget_sufficient:
        budget_gap = min_viable_budget - budget_inr
        reasons.append(
            f"Proposed budget of ₹{round(budget_inr, 2)} is below the minimum viable organic cultivation budget of ₹{round(min_viable_budget, 2)} (shortfall: ₹{round(budget_gap, 2)})."
        )
        required_modifications.append(
            f"Increase budget allocation to at least ₹{round(min_viable_budget, 0)} to ensure fair farmer compensation and certified bio-inputs."
        )
    elif budget_inr > min_viable_budget * 1.5:
        recommendations.append("Budget allows for premium biological soil amendments (Panchagavya & Mycorrhiza inoculation).")

    # 7. Prohibited chemicals check
    if custom_inputs_requested:
        prohibited = ["urea", "dap", "chlorpyrifos", "glyphosate", "synthetic", "chemical"]
        for inp in custom_inputs_requested:
            if any(p in inp.lower() for p in prohibited):
                reasons.append(f"Input '{inp}' violates National Organic Production (NPOP) regulations.")
                required_modifications.append(f"Remove prohibited chemical input '{inp}' and substitute with organic neem/compost alternatives.")

    # 8. Guardrail rule reminder
    warnings.append("Guardrail: Target quantities represent planning targets, not guaranteed physical harvest yields.")
    recommendations.append("Farmer will submit weekly photographic logs and input receipts for traceability.")

    # 9. Feasibility determination & Score calculation
    score = 100
    score -= len(reasons) * 25
    score -= len(warnings) * 5
    if area_utilization > 100:
        score -= min(30, int((area_utilization - 100) * 0.5))
    score = max(0, min(100, score))

    if len(reasons) == 0:
        if len(warnings) == 0:
            status = "FEASIBLE"
        else:
            status = "CONDITIONALLY_FEASIBLE"
        is_feasible = True
    else:
        status = "INFEASIBLE"
        is_feasible = False

    # Shared land tag recommendation
    shared_group_tag = f"Group-{season}-{soil_type.replace(' ', '')}"

    return FeasibilityResult(
        is_feasible=is_feasible,
        status=status,
        overall_score=score,
        available_area_sqm=round(cultivable_area_sqm, 2),
        total_required_area_sqm=round(total_required_area_sqm, 2),
        area_utilization_percent=round(area_utilization, 1),
        min_viable_budget_inr=round(min_viable_budget, 2),
        customer_budget_inr=round(budget_inr, 2),
        budget_sufficient=budget_sufficient,
        reasons=reasons,
        required_modifications=required_modifications,
        warnings=warnings,
        recommendations=recommendations,
        crop_evaluations=crop_evals,
        cost_breakdown=cost_breakdown,
        shared_land_group_tag=shared_group_tag
    )
