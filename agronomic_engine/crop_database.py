"""
Agronomic Database of Crops, Seasons, Soil Types, and Baseline Yield Metrics
Based on FAO, ICAR (Indian Council of Agricultural Research), and National Centre for Organic and Natural Farming guidelines.
"""
from typing import Dict, List, Any

# Seasons definition
SEASONS = {
    "Kharif": {"months": [6, 7, 8, 9, 10], "desc": "Monsoon / Autumn crop season (June - October)"},
    "Rabi": {"months": [10, 11, 12, 1, 2, 3], "desc": "Winter crop season (October - March)"},
    "Zaid": {"months": [3, 4, 5, 6], "desc": "Summer crop season (March - June)"},
    "YearRound": {"months": list(range(1, 13)), "desc": "Suitable across multiple cycles / protected micro-climate"}
}

# Soil Types and qualities
SOIL_TYPES = {
    "Loamy": {"drainage": "Good", "water_retention": "Moderate", "fertility": "High", "typical_ph": (6.0, 7.5)},
    "Sandy Loam": {"drainage": "Excellent", "water_retention": "Low-Moderate", "fertility": "Moderate", "typical_ph": (6.0, 7.0)},
    "Clay Loam": {"drainage": "Moderate", "water_retention": "High", "fertility": "High", "typical_ph": (6.5, 8.0)},
    "Black Cotton": {"drainage": "Poor-Moderate", "water_retention": "Very High", "fertility": "High", "typical_ph": (7.0, 8.5)},
    "Red Soil": {"drainage": "Good", "water_retention": "Low", "fertility": "Moderate", "typical_ph": (5.5, 7.0)},
    "Alluvial": {"drainage": "Good", "water_retention": "High", "fertility": "Very High", "typical_ph": (6.5, 8.0)}
}

# Crop Knowledge Base
CROP_DATABASE: Dict[str, Dict[str, Any]] = {
    "Tomato": {
        "id": "crop_tomato",
        "name": "Organic Roma & Cherry Tomatoes",
        "category": "Solanaceous Vegetable",
        "suitable_seasons": ["Rabi", "Kharif"],
        "suitable_soils": ["Loamy", "Sandy Loam", "Clay Loam", "Alluvial"],
        "min_ph": 6.0,
        "max_ph": 7.5,
        "water_requirement_level": "Medium", # Liters/sqm/day: ~4-6
        "water_liters_per_sqm_per_cycle": 450,
        "growth_cycle_days": 90,
        "avg_yield_kg_per_sqm": 4.5, # ~4-5 kg per sq meter under organic management
        "max_potential_yield_kg_per_sqm": 6.0,
        "min_spacing_sqm_per_plant": 0.35,
        "cultivation_cost_per_sqm_inr": 85,
        "organic_pest_protocols": ["Neem oil spray (1500ppm)", "Trichoderma viride root drench", "Yellow sticky traps", "Pheromone traps"],
        "companion_crops": ["Basil", "Marigold", "Carrot"],
        "incompatible_crops": ["Potato", "Cabbage", "Fennel"],
        "nutritional_highlights": "Rich in Lycopene, Vitamin C, Potassium"
    },
    "Spinach": {
        "id": "crop_spinach",
        "name": "Palak / English Spinach",
        "category": "Leafy Green",
        "suitable_seasons": ["Rabi", "Zaid", "YearRound"],
        "suitable_soils": ["Loamy", "Sandy Loam", "Alluvial"],
        "min_ph": 6.2,
        "max_ph": 7.5,
        "water_requirement_level": "Low-Medium",
        "water_liters_per_sqm_per_cycle": 250,
        "growth_cycle_days": 40,
        "avg_yield_kg_per_sqm": 2.2,
        "max_potential_yield_kg_per_sqm": 3.0,
        "min_spacing_sqm_per_plant": 0.05,
        "cultivation_cost_per_sqm_inr": 45,
        "organic_pest_protocols": ["Neem leaf extract", "Dashaparni kashayam", "Wood ash dusting"],
        "companion_crops": ["Strawberry", "Brassicas", "Onion"],
        "incompatible_crops": ["Fennel"],
        "nutritional_highlights": "High Iron, Folate, Vitamin K"
    },
    "Carrot": {
        "id": "crop_carrot",
        "name": "Organic Red & Orange Carrots",
        "category": "Root Vegetable",
        "suitable_seasons": ["Rabi"],
        "suitable_soils": ["Sandy Loam", "Loamy"],
        "min_ph": 6.0,
        "max_ph": 7.0,
        "water_requirement_level": "Medium",
        "water_liters_per_sqm_per_cycle": 350,
        "growth_cycle_days": 85,
        "avg_yield_kg_per_sqm": 3.2,
        "max_potential_yield_kg_per_sqm": 4.2,
        "min_spacing_sqm_per_plant": 0.08,
        "cultivation_cost_per_sqm_inr": 60,
        "organic_pest_protocols": ["Companion planting with onion", "Beneficial nematodes", "Crop rotation"],
        "companion_crops": ["Tomato", "Lettuce", "Rosemary"],
        "incompatible_crops": ["Fennel", "Dill", "Parsnip"],
        "nutritional_highlights": "Beta-carotene, Vitamin A, Dietary Fiber"
    },
    "Bell Pepper": {
        "id": "crop_bell_pepper",
        "name": "Capsicum / Bell Pepper (Green & Colored)",
        "category": "Solanaceous Vegetable",
        "suitable_seasons": ["Rabi", "Kharif"],
        "suitable_soils": ["Loamy", "Sandy Loam", "Clay Loam"],
        "min_ph": 6.0,
        "max_ph": 7.2,
        "water_requirement_level": "Medium-High",
        "water_liters_per_sqm_per_cycle": 500,
        "growth_cycle_days": 100,
        "avg_yield_kg_per_sqm": 3.5,
        "max_potential_yield_kg_per_sqm": 5.0,
        "min_spacing_sqm_per_plant": 0.30,
        "cultivation_cost_per_sqm_inr": 95,
        "organic_pest_protocols": ["Beauveria bassiana", "Neem soap", "Mulching"],
        "companion_crops": ["Basil", "Carrot", "Coriander"],
        "incompatible_crops": ["Beans", "Fennel"],
        "nutritional_highlights": "Vitamin C (200% DV), Antioxidants"
    },
    "Cucumber": {
        "id": "crop_cucumber",
        "name": "Crisp Garden Cucumber",
        "category": "Cucurbit",
        "suitable_seasons": ["Zaid", "Kharif"],
        "suitable_soils": ["Sandy Loam", "Loamy", "Alluvial"],
        "min_ph": 6.0,
        "max_ph": 7.0,
        "water_requirement_level": "High",
        "water_liters_per_sqm_per_cycle": 550,
        "growth_cycle_days": 60,
        "avg_yield_kg_per_sqm": 4.0,
        "max_potential_yield_kg_per_sqm": 5.5,
        "min_spacing_sqm_per_plant": 0.40,
        "cultivation_cost_per_sqm_inr": 70,
        "organic_pest_protocols": ["Yellow sticky traps", "Milk spray for powdery mildew", "Trichoderma"],
        "companion_crops": ["Beans", "Corn", "Peas"],
        "incompatible_crops": ["Potato", "Sage"],
        "nutritional_highlights": "Cucurbitacins, Hydration, Potassium"
    },
    "Broccoli": {
        "id": "crop_broccoli",
        "name": "Organic Calabrese Broccoli",
        "category": "Brassica",
        "suitable_seasons": ["Rabi"],
        "suitable_soils": ["Loamy", "Clay Loam", "Alluvial"],
        "min_ph": 6.0,
        "max_ph": 7.5,
        "water_requirement_level": "Medium",
        "water_liters_per_sqm_per_cycle": 400,
        "growth_cycle_days": 75,
        "avg_yield_kg_per_sqm": 2.5,
        "max_potential_yield_kg_per_sqm": 3.5,
        "min_spacing_sqm_per_plant": 0.25,
        "cultivation_cost_per_sqm_inr": 80,
        "organic_pest_protocols": ["Bacillus thuringiensis (Bt)", "Row covers", "Companion herbs"],
        "companion_crops": ["Onion", "Celery", "Chamomile"],
        "incompatible_crops": ["Tomato", "Mustard", "Strawberries"],
        "nutritional_highlights": "Sulforaphane, Vitamin K, Glucosinolates"
    },
    "Okra": {
        "id": "crop_okra",
        "name": "Bhindi / Lady Finger",
        "category": "Warm-season Pod Vegetable",
        "suitable_seasons": ["Kharif", "Zaid"],
        "suitable_soils": ["Loamy", "Sandy Loam", "Clay Loam", "Black Cotton"],
        "min_ph": 6.0,
        "max_ph": 7.8,
        "water_requirement_level": "Medium",
        "water_liters_per_sqm_per_cycle": 420,
        "growth_cycle_days": 65,
        "avg_yield_kg_per_sqm": 2.8,
        "max_potential_yield_kg_per_sqm": 3.8,
        "min_spacing_sqm_per_plant": 0.25,
        "cultivation_cost_per_sqm_inr": 55,
        "organic_pest_protocols": ["Neem seed kernel extract (NSKE)", "Trichogramma egg parasitoids", "Pheromone traps"],
        "companion_crops": ["Pepper", "Melon", "Cucumber"],
        "incompatible_crops": [],
        "nutritional_highlights": "Soluble dietary fiber, Folate, Magnesium"
    },
    "Coriander": {
        "id": "crop_coriander",
        "name": "Fresh Organic Cilantro / Dhaniya",
        "category": "Herb",
        "suitable_seasons": ["Rabi", "YearRound"],
        "suitable_soils": ["Loamy", "Sandy Loam", "Alluvial", "Clay Loam"],
        "min_ph": 6.2,
        "max_ph": 7.8,
        "water_requirement_level": "Low",
        "water_liters_per_sqm_per_cycle": 180,
        "growth_cycle_days": 35,
        "avg_yield_kg_per_sqm": 1.5,
        "max_potential_yield_kg_per_sqm": 2.2,
        "min_spacing_sqm_per_plant": 0.02,
        "cultivation_cost_per_sqm_inr": 35,
        "organic_pest_protocols": ["Garlic-chili extract", "Beneficial insect attraction", "Light aeration"],
        "companion_crops": ["Tomato", "Spinach", "Carrot"],
        "incompatible_crops": ["Fennel"],
        "nutritional_highlights": "Antioxidants, Vitamin A, Linalool"
    }
}

def get_crop(query: str):
    """
    Intelligent lookup that matches a crop by its canonical key, display name,
    substring, or common vernacular alias.
    """
    if not query:
        return None
    # 1. Direct canonical key match
    if query in CROP_DATABASE:
        return CROP_DATABASE[query]

    q = str(query).strip().lower()

    # 2. Case-insensitive key match
    for k, v in CROP_DATABASE.items():
        if k.lower() == q:
            return v

    # 3. Exact match against display name
    for k, v in CROP_DATABASE.items():
        if v["name"].lower() == q:
            return v

    # 4. Keyword / Alias matches
    keyword_map = {
        "carrot": "Carrot",
        "tomato": "Tomato",
        "spinach": "Spinach",
        "palak": "Spinach",
        "pepper": "Bell Pepper",
        "capsicum": "Bell Pepper",
        "cucumber": "Cucumber",
        "cuke": "Cucumber",
        "broccoli": "Broccoli",
        "okra": "Okra",
        "bhindi": "Okra",
        "lady finger": "Okra",
        "coriander": "Coriander",
        "cilantro": "Coriander",
        "dhaniya": "Coriander",
    }
    for kw, key in keyword_map.items():
        if kw in q:
            return CROP_DATABASE[key]

    # 5. Fuzzy substring match against key or display name
    for k, v in CROP_DATABASE.items():
        if k.lower() in q or q in k.lower():
            return v
        if q in v["name"].lower() or v["name"].lower() in q:
            return v

    return None
