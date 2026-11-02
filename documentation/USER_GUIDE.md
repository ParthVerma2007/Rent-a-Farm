# Rent-a-Farm — User & Persona Guide

## 1. Quick Persona Switcher
The mobile application includes a floating 1-tap **Persona Switcher** bar at the top of the screen:
- **🥗 Customer:** Ananya Sharma (`customer@rentafarm.com`)
- **🧑‍🌾 Farmer:** Ramesh Patel (`farmer@rentafarm.com`)
- **🛡️ Admin:** Dr. Vikram Rao (`admin@rentafarm.com`)
- **🧪 Agronomist:** Priya Nair (`agronomist@rentafarm.com`)

You can switch roles with a single tap at any time without having to manually log out and re-enter credentials.

---

## 2. Customer Journey Walkthrough

### Step 1: Discover Farms & Plots
1. Tap the **Explore Farms** tab at the bottom.
2. View the interactive OpenStreetMap with farm pins.
3. Tap **View Farm & Plots** on **Green Valley Organic Farm**.
4. Review farm soil profile, perennial irrigation source, and available plot sizes (e.g., 500 sq ft bed).
5. Tap **Select Plot & Build Brief**.

### Step 2: Build Your Farming Brief
1. In the brief builder, choose your preferred cultivation season (**Rabi**).
2. Choose your cultivation preference (**Certified Organic**).
3. Search and select crops:
   - Roma & Cherry Tomatoes: Set target to **30 kg**.
   - Baby Spinach: Set target to **15 kg**.
4. Enter budget allocation in INR: **₹12,000**.
5. Add household dietary instructions.
6. Tap **⚡ Check Agronomic Feasibility**.

### Step 3: Feasibility Decision
1. The **Python Agronomic Rules Engine** analyzes:
   - Soil texture and pH compatibility.
   - Usable bed space vs target yield.
   - Seasonal temperature and water availability.
   - Minimum budget threshold.
2. If feasible, an overall score (e.g. 94/100) is shown with crop projections.
3. Tap **Submit for Agronomist Sign-Off**.

### Step 4: Track Cultivation Lifecycle
1. Open the **My Farm** tab.
2. Follow the 10-stage timeline indicator.
3. Browse weekly activity logs, photo updates, and organic input applications (vermicompost, Jeevamrutha).

### Step 5: Harvest Reconciliation & Feedback
1. Tap **Harvest Reconciliation** to view the target vs actual harvested weight comparison.
2. Receive doorstep delivery notification.
3. Rate produce freshness and leave farmer feedback.

---

## 3. Farmer Operations Walkthrough

### Step 1: Open Farmer Dashboard
1. Switch to **🧑‍🌾 Farmer** in the top bar.
2. View assigned cultivation projects, active crops, and pending tasks.

### Step 2: Execute Tasks
1. Tap **Tasks** in the bottom navigation.
2. Tap **Mark Done ✓** on a completed field operation (e.g. "Drip Channeling & Mulching").
3. Notice that milestone compensation is immediately credited to your earnings ledger!

### Step 3: Log Inputs & Field Activities
1. Tap **Log Work**.
2. Select **Organic Input Applied**.
3. Choose item (e.g. "Earthworm Vermicompost", 25 kg).
4. Tap **Submit & Log to Ledger** — customer receives an instant traceability notification.

### Step 4: Weigh and Grade Harvest
1. Tap **Harvest**.
2. Enter calibrated scale weight (e.g. 36.4 kg for Roma Tomatoes).
3. Select **Grade A+ Organic** and record harvest.
4. The project automatically moves to "Harvest completed" and a ₹1,200 harvest bonus is credited.

### Step 5: Check Compensation
1. Tap **Earnings** to view total earned, paid, and pending balances.

---

## 4. Administrator & Agronomist Walkthrough

### Step 1: Ecosystem Overview
1. Switch to **🛡️ Admin** in the top bar.
2. Review real-time KPIs: active customers, farmers, farms, plots, and pipeline counts.

### Step 2: Approve Briefs & Assign Farmers
1. Tap **Approvals**.
2. Inspect customer brief feasibility scores.
3. Tap **Approve Brief ✓**.
4. Tap **Assign Ramesh Patel** to deploy the farmer and auto-generate the project code.

### Step 3: Run Shared-Land Optimization
1. Tap **Land Optimizer**.
2. Tap **⚡ Run Clustering & Land Optimization**.
3. The engine groups compatible customer crop preferences into optimized companion blocks with a **+28.5%** efficiency gain.
