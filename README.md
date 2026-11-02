# Rent-a-Farm

> **Tagline:** *Your Land. Your Crops. Your Harvest.*  
> **Concept:** Personalized Organic Farming as a Service (connecting urban consumers with agricultural landowners, farmers, and agronomists).

---

## 🌾 Project Overview

**Rent-a-Farm** transforms how urban consumers access fresh, personalized, and traceable organic produce without having to purchase farmland or manage day-to-day farming operations. 

Through Rent-a-Farm:
1. Customers discover verified agricultural plots on an **interactive OpenStreetMap**.
2. Customers build customized **farming briefs** choosing specific crops, target quantities (in kg), seasons, and organic preferences.
3. A scientific **Python Agronomic Rules Engine** evaluates feasibility against physical land area, biological yield limits, soil pH/texture, water availability, and budget viability.
4. Licensed agronomists review and approve plans; qualified farmers are assigned to execute sequential cultivation.
5. All field operations, organic composts, and neem sprays are timestamped in a **transparency ledger**.
6. At maturity, harvests are weighed on calibrated digital scales and reconciled against initial target briefs.
7. Fresh organic produce is dispatched in chilled containers directly to urban doorsteps.

---

## 🛠️ Technology Stack

- **Mobile Frontend:** React Native, TypeScript, Expo SDK 52, React Navigation, React Native Safe Area Context, Vector Icons, Axios, Zustand.
- **Backend API:** Python 3.11+, FastAPI, SQLAlchemy ORM, Pydantic v2, PyJWT, Passlib / Bcrypt.
- **Agronomic Engine:** Dedicated Python module with biological knowledge base, FAO/ICAR guidelines, companion planting checks, and shared-land block clustering.
- **Database:** PostgreSQL (with Supabase compatibility) & SQLite for zero-config local execution.
- **Mapping:** OpenStreetMap geo-coordinate mapping and interactive plot visualization.
- **Testing:** Pytest & FastAPI TestClient for automated end-to-end lifecycle verification.

---

## 📂 Monorepo Structure

```text
rent-a-farm/
├── backend/                    # FastAPI Backend Application
│   ├── app/
│   │   ├── models/             # SQLAlchemy ORM Database Models
│   │   ├── schemas/            # Pydantic v2 Validation Schemas
│   │   ├── routers/            # Modular API Routers (Auth, Farms, Briefs, Projects, Tasks, Harvest, etc.)
│   │   ├── services/           # Security, Notifications, Audit Trails
│   │   ├── seed_data.py        # Realistic Seed Data Initializer
│   │   ├── config.py           # Settings and Environment Variables
│   │   └── main.py             # ASGI Application Entrypoint
│   ├── tests/                  # Pytest Automated Test Suites
│   ├── requirements.txt        # Backend Python Dependencies
│   └── .env.example            # Environment Configuration Template
│
├── agronomic_engine/           # Standalone Python Agronomic Intelligence Engine
│   ├── crop_database.py        # FAO/ICAR Biological Benchmarks & Spacing
│   ├── rules.py                # Land Area, Soil, Season, & Budget Validator
│   └── optimizer.py            # Shared-Land Crop Block Optimization
│
├── mobile/                     # React Native Expo Mobile Application
│   ├── App.tsx                 # Root Component
│   ├── app.json                # Expo Application Manifest
│   ├── package.json            # Node Dependencies
│   ├── tsconfig.json           # Strict TypeScript Configuration
│   └── src/
│       ├── components/         # FarmMap, StageTimeline, InputCard, ReconciliationCard, Switcher
│       ├── navigation/         # Role-Based Navigators (Customer, Farmer, Admin)
│       ├── screens/            # Screens for Customer, Farmer, Admin, and Auth
│       ├── services/           # Axios REST API Client
│       ├── store/              # Zustand Authentication & Persona Switcher State
│       ├── theme/              # Premium Agritech Design System & Palette
│       └── types/              # Comprehensive TypeScript Interfaces
│
└── documentation/              # Engineering Specifications
    ├── ARCHITECTURE.md         # System Architecture & Lifecycle Flowcharts
    ├── AGRONOMIC_RULES.md      # Agronomic Formulations & Biological Yield Benchmarks
    ├── DATABASE_SCHEMA.md      # Normalized Relational ERD & Tables
    ├── API_DOCUMENTATION.md    # OpenAPI Endpoint Specifications
    └── USER_GUIDE.md           # Persona Walkthroughs & User Guide
```

---

## 🚀 Execution & Quick Start Instructions

### 1. Backend Setup & Startup

From the project root:
```bash
cd backend
pip install -r requirements.txt
```

Start the FastAPI backend with hot-reload:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

*Note: The database (`rent_a_farm.db`) and all seed data (farms, plots, crops, demo accounts, and active projects) are automatically created upon server startup.*

---

### 2. Run Backend Automated Test Suite

Verify all 9 tests covering the agronomic rules engine, auth, role-based checks, and full 10-step lifecycle:
```bash
cd backend
pytest tests -v
```

---

### 3. Mobile Application Startup

From the project root:
```bash
cd mobile
npm install
```

Start Expo:
```bash
# To run in your default web browser:
npm run web

# To run on Android Emulator or physical device with Expo Go:
npm run android

# To run on iOS Simulator (macOS):
npm run ios
```

---

## 👥 Pre-Configured Demonstration Accounts

Use these accounts to test each role's dedicated mobile dashboard:

| Role | Email | Password | Persona & Focus |
| :--- | :--- | :--- | :--- |
| **🥗 Customer** | `customer@rentafarm.com` | `password123` | **Ananya Sharma:** Plot discovery, brief builder, tracking, harvest reconciliation |
| **🧑‍🌾 Farmer** | `farmer@rentafarm.com` | `password123` | **Ramesh Patel:** Field tasks, input logs, calibrated scale harvest weighing |
| **🛡️ Admin** | `admin@rentafarm.com` | `password123` | **Dr. Vikram Rao:** Platform overview, agronomist approval, land optimizer |
| **🧪 Agronomist** | `agronomist@rentafarm.com` | `password123` | **Priya Nair:** Feasibility review and organic certification audits |

> 💡 **Tip:** The mobile app features a floating **1-Tap Persona Switcher** at the top of the screen. You can tap between Customer, Farmer, and Admin to test different perspectives instantly without logging in and out.

---

## 🛡️ Mandatory Business Rules & Guardrails Implemented

1. **Planning Targets vs Guaranteed Yields:** Target quantities requested by customers are strictly treated as planning objectives, never promised as guaranteed biological yields.
2. **Feasibility Gate:** No cultivation plan can proceed without first clearing the Python Agronomic Rules Engine (checking season, soil pH/type, physical bed space, water availability, and minimum budget).
3. **Agronomist & Farmer Sign-off:** A plan cannot begin field operations until formal agronomist approval and farmer assignment are recorded in the audit trail.
4. **Organic Traceability Guardrail:** Synthetic chemicals (Urea, DAP, Chlorpyrifos, Glyphosate) are rejected by backend input validation. Only certified bio-inputs (vermicompost, Jeevamrutha, neem oil) can be logged.
5. **Demand-to-Harvest Reconciliation:** Tracks Requested Target (kg), Estimated Biological Yield (kg), Actual Scale Harvested Weight (kg), and Doorstep Delivered (kg) with variance percentages.
6. **Shared-Land Optimization:** Module groups compatible customer crop preferences into contiguous companion blocks without compromising individual crop orders or traceability.
7. **Transparent Farmer Compensation:** Itemized earnings ledger with automatic milestone credits when operational tasks and harvest batches are completed.

---

## 🔮 Future-Ready Architecture

The codebase is structured to readily accommodate advanced agritech modules:
- AI-based biological yield forecasting based on historical micro-climate logs.
- Satellite / IoT soil moisture and sensor telemetry integration.
- Dynamic cold-chain routing and doorstep dispatch optimization.
