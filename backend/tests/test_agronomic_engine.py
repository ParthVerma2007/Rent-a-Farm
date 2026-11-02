import pytest
import sys
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from agronomic_engine import evaluate_farming_brief, optimize_shared_land_blocks

def test_feasible_brief():
    result = evaluate_farming_brief(
        plot_area_sqft=600.0,
        soil_type="Loamy",
        soil_ph=6.8,
        water_source="Drip Irrigation",
        season="Rabi",
        budget_inr=15000.0,
        crops_requested=[
            {"name": "Tomato", "target_kg": 40.0},
            {"name": "Spinach", "target_kg": 20.0}
        ]
    )
    assert result.is_feasible is True
    assert result.status in ["FEASIBLE", "CONDITIONALLY_FEASIBLE"]
    assert result.overall_score >= 80
    assert result.budget_sufficient is True
    assert len(result.crop_evaluations) == 2

def test_infeasible_area_overcrowding():
    result = evaluate_farming_brief(
        plot_area_sqft=100.0, # ~9.3 sqm total, ~7.9 sqm usable
        soil_type="Loamy",
        soil_ph=6.8,
        water_source="Drip Irrigation",
        season="Rabi",
        budget_inr=20000.0,
        crops_requested=[
            {"name": "Tomato", "target_kg": 150.0} # Requires ~33 sqm!
        ]
    )
    assert result.is_feasible is False
    assert result.status == "INFEASIBLE"
    assert any("bed area" in r for r in result.reasons)
    assert len(result.required_modifications) > 0

def test_infeasible_budget_shortfall():
    result = evaluate_farming_brief(
        plot_area_sqft=500.0,
        soil_type="Loamy",
        soil_ph=6.8,
        water_source="Drip Irrigation",
        season="Rabi",
        budget_inr=300.0, # Absurdly low budget
        crops_requested=[
            {"name": "Tomato", "target_kg": 30.0}
        ]
    )
    assert result.is_feasible is False
    assert result.budget_sufficient is False
    assert any("Proposed budget" in r for r in result.reasons)

def test_shared_land_optimizer():
    requests = [
        {
            "id": 1,
            "season": "Rabi",
            "preferred_soil": "Loamy",
            "required_area_sqm": 25.0,
            "crops": [{"name": "Tomato"}],
            "status": "APPROVED"
        },
        {
            "id": 2,
            "season": "Rabi",
            "preferred_soil": "Loamy",
            "required_area_sqm": 35.0,
            "crops": [{"name": "Spinach"}],
            "status": "APPROVED"
        }
    ]
    plots = [
        {"id": 101, "name": "Plot 101", "soil_type": "Loamy", "area_sqm": 100.0, "is_available": True}
    ]
    result = optimize_shared_land_blocks(requests, plots)
    assert result["status"] == "SUCCESS"
    assert result["total_optimized_blocks"] == 1
    assert result["blocks"][0]["customer_requests_count"] == 2
