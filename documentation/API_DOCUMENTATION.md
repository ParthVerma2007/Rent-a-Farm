# Rent-a-Farm — Backend REST API Documentation

FastAPI provides interactive OpenAPI/Swagger documentation at `http://localhost:8000/docs` and ReDoc at `http://localhost:8000/redoc`.

All protected endpoints require an HTTP Authorization header:
```http
Authorization: Bearer <jwt_access_token>
```

---

## 1. Authentication (`/api/v1/auth`)

### `POST /api/v1/auth/register`
Creates a new customer or farmer account and issues a JWT token.
- **Payload:**
  ```json
  {
    "email": "customer@example.com",
    "password": "password123",
    "full_name": "Ananya Sharma",
    "phone": "+91 98765 43210",
    "role": "customer",
    "delivery_address": "Indiranagar, Bengaluru",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560038"
  }
  ```
- **Response:** `200 OK` with access token and user metadata.

### `POST /api/v1/auth/login`
Authenticates user with JSON credentials.
- **Payload:**
  ```json
  {
    "email": "customer@rentafarm.com",
    "password": "password123"
  }
  ```
- **Response:** `200 OK` with Bearer token.

### `GET /api/v1/auth/me`
Returns current authenticated user profile.

---

## 2. Farms & Plots Discovery (`/api/v1/farms`)

### `GET /api/v1/farms`
List all certified organic farm estates with OpenStreetMap geographical coordinates, water sources, and plot counts.
- **Query Params:** `organic_only` (bool), `location` (string)
- **Response:** `200 OK` List of farms with embedded plots.

### `GET /api/v1/farms/{farm_id}`
Returns details for a specific farm estate, including soil profiles and available plots.

### `GET /api/v1/farms/{farm_id}/plots`
List available plots for a farm.
- **Query Params:** `available_only=true`

### `POST /api/v1/farms` *(Admin only)*
Create a new farm estate.

---

## 3. Crop Knowledge Base (`/api/v1/crops`)

### `GET /api/v1/crops`
List approved crops with seasonal suitability, water requirements, and biological yield benchmarks.
- **Query Params:** `category`, `season`, `search`

### `GET /api/v1/crops/{crop_key}`
Returns detailed biological profile, companion planting suggestions, and pest protocols.

---

## 4. Farming Briefs & Feasibility Engine (`/api/v1/requests`)

### `POST /api/v1/requests`
Submits a custom farming brief and automatically invokes the **Python Agronomic Rules Engine**.
- **Payload:**
  ```json
  {
    "farm_id": 1,
    "plot_id": 1,
    "season": "Rabi",
    "cultivation_preference": "Certified Organic",
    "budget_inr": 12500.0,
    "notes": "Prefer heirloom tomatoes and baby spinach",
    "crops": [
      {
        "crop_name": "Tomato",
        "target_quantity_kg": 35.0,
        "preferred_variety": "Roma Heirloom"
      },
      {
        "crop_name": "Spinach",
        "target_quantity_kg": 20.0,
        "preferred_variety": "Baby Spinach"
      }
    ]
  }
  ```
- **Workflow State Transition:**
  - If **Feasible**: sets status to `FEASIBILITY_CHECKED` and notifies agronomist.
  - If **Infeasible**: sets status to `MODIFICATION_REQUESTED` and returns actionable modifications.

### `PUT /api/v1/requests/{request_id}/modify`
Allows customer to edit parameters of an infeasible brief and re-run feasibility evaluation.

---

## 5. Agronomist Approvals (`/api/v1/approvals`)

### `POST /api/v1/approvals` *(Admin / Agronomist only)*
Records formal agronomic sign-off on a feasible brief.
- **Payload:**
  ```json
  {
    "request_id": 1,
    "decision": "APPROVED", // "APPROVED", "REJECTED", "MODIFICATION_REQUESTED"
    "notes": "Verified soil pH and irrigation capacity."
  }
  ```
- **Guardrail:** Cannot approve structurally infeasible plans without resolving constraints.

---

## 6. Farmer Assignments & Project Creation (`/api/v1/assignments`)

### `POST /api/v1/assignments` *(Admin only)*
Assigns an approved cultivation brief to a certified farmer.
- **Payload:**
  ```json
  {
    "request_id": 1,
    "farmer_id": 2,
    "notes": "Assigned based on experience in companion horticulture."
  }
  ```
- **Automatic Orchestration:**
  - Generates unique project code (e.g. `RAF-2026-001`).
  - Marks plot as occupied/dedicated.
  - Seeds initial operational cultivation tasks (Land prep, Bio-fertilization, Sowing, Drip setup).
  - Notifies customer and assigned farmer.

---

## 7. Projects & Cultivation Lifecycle (`/api/v1/projects`)

### `GET /api/v1/projects`
List projects. Customers view their own; farmers view assigned projects; admins view all.

### `GET /api/v1/projects/{project_id}`
Returns full project data: current stage, tasks, activity logs, input logs, harvest records, and delivery status.

### `PUT /api/v1/projects/{project_id}/stage` *(Farmer / Admin only)*
Advances project along the 10-stage lifecycle:
- *Cultivation started*
- *Crop development*
- *Maintenance and monitoring*
- *Harvest preparation*
- *Harvest completed*
- *Delivery in progress*
- *Delivered*

---

## 8. Tasks & Field Activities (`/api/v1/tasks`, `/api/v1/activities`, `/api/v1/inputs`)

### `PUT /api/v1/tasks/{task_id}`
Mark operational task completed with notes and photo proof. Automatically credits farmer milestone compensation.

### `POST /api/v1/activities`
Log cultivation activity (Bed preparation, Sprouting, Trellising, Weeding, Irrigation).

### `POST /api/v1/inputs`
Log organic input application (seeds, compost, Jeevamrutha, neem oil).
- **Guardrail:** Rejects non-organic synthetic chemicals.

---

## 9. Harvest Weighing & Reconciliation (`/api/v1/harvest`)

### `POST /api/v1/harvest`
Record actual calibrated scale harvest weight per crop. Advances project to `Harvest completed` and credits harvest bonus to farmer.

### `GET /api/v1/harvest/reconciliation/{project_id}`
Returns side-by-side comparison of:
- Requested Target (kg)
- Estimated Yield (kg)
- Actual Harvested (kg)
- Doorstep Delivered (kg)
- Variance percentage and quality tier.

---

## 10. Produce Delivery Tracking (`/api/v1/delivery`)

### `POST /api/v1/delivery`
Schedules and prepares harvest dispatch with unique tracking number (`TRK-XXXXXXXX`).

### `PUT /api/v1/delivery/{delivery_id}/status?status_str=DELIVERED`
Marks delivery complete, sets project status to `COMPLETED`, updates customer delivery receipt.

---

## 11. Customer Feedback (`/api/v1/feedback`)

### `POST /api/v1/feedback`
Submits star ratings (1-5) for Overall Experience, Produce Quality, and Farmer Performance, along with suggestions.

---

## 12. Administrator Control & Optimization (`/api/v1/admin`)

### `GET /api/v1/admin/overview`
Platform-wide KPI metrics and pipeline counts.

### `POST /api/v1/admin/shared-land/optimize?season=Rabi`
Executes the Shared-Land Optimization Algorithm, clustering compatible customer requests into optimized companion blocks.
