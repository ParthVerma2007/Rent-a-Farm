# Rent-a-Farm — System Architecture & Flowchart

**Tagline:** *Your Land. Your Crops. Your Harvest.*  
**Domain:** Agritech Service Platform (Personalized Organic Farming as a Service)

---

## 1. High-Level Architecture Overview

Rent-a-Farm bridges urban consumers with verified agricultural landowners, farmers, and certified agronomists through a unified 3-role ecosystem:

```mermaid
flowchart TD
    subgraph Clients["Cross-Platform Client Layer (React Native + Expo)"]
        C["Customer Interface\n(Discovery, Brief, Tracking, Reconciliation)"]
        F["Farmer Dashboard\n(Field Operations, Task Logs, Harvest Scales)"]
        A["Administrator Portal\n(Approvals, Assignments, Shared-Land Optimizer)"]
    end

    subgraph API["FastAPI Backend (REST & Security)"]
        GW["FastAPI Core Service"]
        AUTH["JWT Auth & Role Guard\n(Bcrypt / Sub Tokens)"]
        ROUTERS["Modular Routers:\n/farms, /crops, /requests,\n/approvals, /projects, /tasks,\n/inputs, /harvest, /delivery"]
    end

    subgraph Intelligence["Agronomic Rules & Optimization Engine"]
        BIO["Biological Crop DB\n(FAO / ICAR / NPOP Standards)"]
        FEAS["Feasibility Evaluator\n(Soil, Water, Season, Yields, Budget)"]
        OPT["Shared-Land Optimizer\n(Companion Clustering & Zoned Irrigation)"]
    end

    subgraph DataStore["Persistence & Storage Layer"]
        DB[("PostgreSQL / SQLite ORM\n(Normalized Schema, Audit Trails)")]
        STORAGE["Static & Image File Storage\n(Inputs, Harvest Seals, Progress)"]
    end

    C --> GW
    F --> GW
    A --> GW

    GW --> AUTH
    GW --> ROUTERS
    ROUTERS <--> FEAS
    ROUTERS <--> OPT
    FEAS <--> BIO
    ROUTERS <--> DB
    GW <--> STORAGE
```

---

## 2. Core 10-Step Traceable Lifecycle Flowchart

The application enforces a strictly traceable, sequential workflow:

```mermaid
flowchart LR
    S1["1. Register\n& Login"] --> S2["2. Farm &\nPlot Choice"]
    S2 --> S3["3. Build Farming\nBrief (Crops/Target kg)"]
    S3 --> S4{"4. Agronomic\nFeasibility"}
    
    S4 -- "Infeasible" --> S4_MOD["Return with Modifications\n& Resubmit"]
    S4_MOD --> S3
    
    S4 -- "Feasible" --> S5["5. Agronomist\nApproval"]
    S5 --> S6["6. Farmer\nAssignment"]
    S6 --> S7["7. Cultivation &\nInput Logging"]
    S7 --> S8["8. Precision Harvest\nWeighing"]
    S8 --> S9["9. Doorstep\nDelivery"]
    S9 --> S10["10. Customer\nFeedback"]
```

---

## 3. The 3 Distinct Roles & Permission Boundaries

| Role | Permitted Actions | Boundaries |
| :--- | :--- | :--- |
| **Customer** | • Browse organic farms & available plots<br>• Submit custom farming briefs & target yields<br>• Review scientific feasibility assessment<br>• Track 10-stage cultivation lifecycle<br>• Inspect organic input records & receipts<br>• Access harvest reconciliation and variance<br>• Rate experience and produce quality | Restriced to their own farm projects and requests. Cannot approve plans, reassign farmers, or modify field logs. |
| **Farmer** | • View assigned plots and customer requirements<br>• Execute sequential operational field tasks<br>• Log agricultural inputs (with organic verification)<br>• Record calibrated digital harvest scale weights<br>• Review itemized compensation balance and payouts | Restriced to authorized farm assignments. Cannot modify rental rates or override agronomic feasibility rules. |
| **Administrator / Agronomist** | • Ecosystem dashboard and farm estate onboarding<br>• Review submitted briefs & feasibility reports<br>• Approve or reject cultivation plans with notes<br>• Assign qualified farmers based on workload<br>• Run Shared-Land Optimization engine<br>• Reconcile harvested weights & dispatch delivery | Platform-wide management and governance across all users, farms, and audit logs. |
