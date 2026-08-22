# FasalDirect — Aggregating Small-Farmer Produce for Better Pricing

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black.svg?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.6-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-D71F00.svg?style=flat&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900.svg?style=flat&logo=leaflet&logoColor=white)](https://leafletjs.com/)

> **FasalDirect** is a farmer-first collective produce selling platform designed to help smallholder farmers aggregate compatible harvest lots, form trusted four-member micro-collectives, negotiate directly with institutional buyers, share transportation logistics, and receive guaranteed automatic contribution-based payouts in their digital wallet.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Project Objective & Solution Overview](#project-objective--solution-overview)
3. [Innovation in Technical Terms](#innovation-in-technical-terms)
4. [Key Features](#key-features)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Complete System & User Workflows](#complete-system--user-workflows)
   - [Farmer Workflow](#farmer-workflow)
   - [Team Representative Responsibilities](#team-representative-responsibilities)
   - [Buyer Workflow](#buyer-workflow)
   - [Admin Workflow](#admin-workflow)
7. [Smart Team Opportunity & Compatibility Engine](#smart-team-opportunity--compatibility-engine)
   - [6-Factor Scoring Algorithm & Exact Weights](#6-factor-scoring-algorithm--exact-weights)
   - [Four-Member Hard Limit & Backend Locking](#four-member-hard-limit--backend-locking)
   - [Join Request & Review Lifecycle](#join-request--review-lifecycle)
   - [Recently Created Teams Discovery](#recently-created-teams-discovery)
   - [Team Creation When No Match Exists](#team-creation-when-no-match-exists)
   - [Replacement Farmer & Withdrawal Handling](#replacement-farmer--withdrawal-handling)
8. [Innovative Implemented Mechanics](#innovative-implemented-mechanics)
   - [Buyer Unlock Progress Meter](#buyer-unlock-progress-meter)
   - [What-If Collective Benefit Simulator](#what-if-collective-benefit-simulator)
   - [Team Growth & Potential Simulator](#team-growth--potential-simulator)
   - [Team Health Monitor](#team-health-monitor)
   - [Smart Collection Point Centroid Calculation](#smart-collection-point-centroid-calculation)
   - [Shared Transport Freight Savings Engine](#shared-transport-freight-savings-engine)
   - [Sustainability & Carbon Impact Engine](#sustainability--carbon-impact-engine)
   - [Digital Collective Lot Passport & QR Provenance](#digital-collective-lot-passport--qr-provenance)
   - [Grounded AI Explainability Assistant](#grounded-ai-explainability-assistant)
9. [Data Flow & System Architecture](#data-flow--system-architecture)
   - [System Architecture Diagram](#system-architecture-diagram)
   - [End-to-End Sequence Diagram](#end-to-end-sequence-diagram)
10. [Technology Stack](#technology-stack)
11. [Project Structure](#project-structure)
12. [Frontend Architecture & Interfaces](#frontend-architecture--interfaces)
13. [Backend Architecture & Business Engines](#backend-architecture--business-engines)
14. [Database Design & Schema](#database-design--schema)
    - [Entity Relationship Diagram](#entity-relationship-diagram)
    - [Database Models & Relationships](#database-models--relationships)
15. [API Documentation](#api-documentation)
16. [Authentication & Authorization](#authentication--authorization)
17. [Core Business Rules & State Transitions](#core-business-rules--state-transitions)
18. [Offline & PWA Functionality](#offline--pwa-functionality)
19. [Maps & Geospatial Location System](#maps--geospatial-location-system)
20. [Payment & Settlement System (Simulated Flow)](#payment--settlement-system-simulated-flow)
21. [In-App Notifications System](#in-app-notifications-system)
22. [Installation & Local Development Setup](#installation--local-development-setup)
23. [Environment Variables](#environment-variables)
24. [Database Setup & Migrations](#database-setup--migrations)
25. [Testing & Verification](#testing--verification)
26. [Build & Production Deployment](#build--production-deployment)
27. [Error Handling & Validation](#error-handling--validation)
28. [Security Considerations](#security-considerations)
29. [Complete End-to-End Example Journey](#complete-end-to-end-example-journey)
30. [Troubleshooting Guide](#troubleshooting-guide)
31. [Known Limitations & Prototype Boundaries](#known-limitations--prototype-boundaries)
32. [Future Enhancements Roadmap](#future-enhancements-roadmap)
33. [Quick Start for Developers](#quick-start-for-developers)
34. [Contributing & Development Guidelines](#contributing--development-guidelines)
35. [License & Project Status](#license--project-status)
36. [Git Deployment Instructions](#git-deployment-instructions)

---

## Problem Statement

Smallholder farmers in India (operating on less than 2 hectares of land) face acute structural disadvantages when marketing their agricultural harvest:

1. **Distress Mandi Selling & Price Asymmetry**: Small individual volumes (200–800 kg) give farmers zero price bargaining power, forcing them to accept low spot prices from local commission agents and village aggregators.
2. **Punitive Transport Overheads**: Renting an individual small commercial vehicle (e.g., ₹800 base fare + ₹18/km) consumes up to 15–25% of gross produce revenue for a small harvest load.
3. **Institutional Buyer Disconnect**: Large institutional food processors, retail supermarket chains, and exporters require uniform bulk batches (1,000–5,000+ kg) of authenticated grade, making individual smallholder transactions unviable for corporate procurement teams.
4. **Opaque & Delayed Payments**: Traditional informal physical trade suffers from hidden deductions (unregulated weighbridge fees, unauthorized grading cuts) and delayed settlement cycles.

---

## Project Objective & Solution Overview

**FasalDirect** bridges the smallholder-buyer divide through an automated, software-driven aggregation model:

```
+-----------------------------------------------------------------------------------+
|                           Traditional Solo Mandi Model                            |
| 4 Small Farmers ---> 4 Separate Tempos ---> High Transport Costs ---> Distress Cuts|
+-----------------------------------------------------------------------------------+
                                         VS
+-----------------------------------------------------------------------------------+
|                         FasalDirect 4-Farmer Model                                |
| 4 Compatible Farmers ===> 1 Consolidated Commercial Truck (50% Freight Savings)  |
| Multi-Factor Synergy ===> Direct Institutional Buyer Bidding (+15-25% Bulk Rate) |
| Central Depot Hub    ===> Digital Lot Passport (QR Provenance Authentication)     |
| Escrow Checkout      ===> Automatic Proportional Wallet Settlement (Paisa-Exact) |
+-----------------------------------------------------------------------------------+
```

---

## Innovation in Technical Terms

FasalDirect introduces several technical innovations designed specifically for rural agricultural dynamics:

1. **Compatibility-Driven Four-Farmer Team Formation**:
   - Rather than forming large, bureaucratic cooperatives (FPOs) that suffer from governance overhead and delayed decisions, FasalDirect enforces **4-farmer micro-collectives**.
   - Teams are formed dynamically using a multi-factor scoring algorithm that calculates crop identity, variety compatibility, grade homogeneity, harvest date synchronization, and Haversine geospatial proximity.
2. **Paisa-Perfect Automatic Settlement Engine**:
   - The platform calculates each farmer's exact financial distribution based on their verified contribution fraction:
     $$\text{Fraction}_i = \frac{\text{Contributed kg}_i}{\text{Total Lot kg}}$$
     $$\text{Gross Payout}_i = \text{Gross Revenue} \times \text{Fraction}_i$$
     $$\text{Net Payout}_i = \text{Gross Payout}_i - (\text{Transport Share}_i + \text{Platform Fee Share}_i)$$
   - The engine performs **exact penny/paisa reconciliation on the final member's share** to eliminate all floating-point rounding discrepancies, ensuring $\sum \text{Net Payouts} = \text{Net Distributable Amount}$ down to the exact paisa.
3. **Smart Collection Point Centroid Calculation**:
   - Dynamically calculates the optimal geographic center of mass across confirmed member farm coordinates, with an optional directional vector pull toward the buyer's delivery depot corridor.
4. **Digital Collective Lot Passport**:
   - Cryptographically verifiable lot certificate with unique lot code (`LOT-{CROP}-{UUID}`) and QR code certifying multi-farmer provenance, harvest window, authenticated grade, and pickup depot.

---

## Key Features

- **Farmer Onboarding & Produce Listing**: Easy mobile-first registration, multi-crop support, grade classification (Grade A, B, C), and selling window declaration.
- **Smart Team Opportunity Engine**: Algorithmic compatibility scoring (0–100%) ranking open teams for any produce lot.
- **Strict 4-Member Team Limit**: Hard-capped team capacity preventing fifth-member joins and automatically transitioning full teams to market readiness.
- **Democratic Deal Governance**: Team Representative negotiates on behalf of the team with built-in democratic member deal voting (`approved` / `rejected`).
- **Buyer Demand Posting & Marketplace**: Verified buyers post volume demands with target prices and discover compatible collective lots.
- **Automated Settlement & Digital Wallet**: Automated payout distribution crediting farmer wallets with complete audit logging.
- **Simulators (What-If & Team Growth)**: Real-time interactive calculation of solo vs collective earnings and batch expansion forecasts.
- **Team Health Monitor**: Automated assessment of team capacity, grade homogeneity, and buyer demand alignment.
- **Offline Produce Drafts**: Native IndexedDB storage enabling farmers to save produce drafts without an active internet connection.
- **Geospatial Mapping**: OpenStreetMap integration via Leaflet displaying member farms, collection centroids, and buyer depots.
- **In-App Notification Center**: Category-tagged real-time alerts for join requests, approvals, buyer offers, deals, and payouts.
- **Administrative Portal**: Real-time turnover analytics, crop distribution charts, user KYC verification toggles, and global platform parameter configuration.

---

## User Roles & Permissions

FasalDirect implements clean Role-Based Access Control (RBAC) enforced at the API route dependency layer:

| Feature / Action | Farmer | Team Representative | Buyer | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Register Produce Lots | Yes | Yes | No | No |
| Create 4-Farmer Team | Yes (Becomes Rep) | Yes | No | No |
| Request to Join Team | Yes | N/A | No | No |
| Review & Approve Join Requests | No | **Yes (Exclusive)** | No | No |
| Submit Counter-Offer to Buyer | No | **Yes (Exclusive)** | No | No |
| Vote on Active Negotiation | Yes | Yes | No | No |
| Finalize / Accept Agreed Deal | No | **Yes (Exclusive)** | **Yes (Exclusive)** | No |
| Post Buyer Procurement Demands | No | No | Yes | No |
| Browse Aggregated Lots & Make Offers | No | No | Yes | No |
| Checkout & Simulate Payment | No | No | Yes | Yes |
| Receive Automatic Wallet Credit | Yes | Yes | No | No |
| Withdraw Funds (Bank/UPI) | Yes | Yes | Yes | Yes |
| Audit KYC, Users, Teams & Config | No | No | No | **Yes (Exclusive)** |

> **Note on Team Representative**: The Team Representative is not a separate authentication role; it is a team-level responsibility held by Member #1 (the team creator) or automatically transferred to the next confirmed member if the creator withdraws.

---

## Complete System & User Workflows

```mermaid
flowchart TD
    A([Farmer Registration]) --> B[Produce Lot Submission]
    B --> C{Run Compatibility Engine}
    C -->|Compatible Team Found| D[Submit Join Request]
    C -->|No Compatible Team| E[Create New 4-Farmer Team]
    E --> F[Farmer 1 becomes Team Representative]
    D --> G[Representative Reviews Request]
    G -->|Approve| H[Member Added, Produce Locked]
    G -->|Reject| B
    H --> I{4 Members Confirmed?}
    I -->|No| G
    I -->|Yes| J[Team Status = FULL, Centroid Generated]
    J --> K[Buyer Discovers Team Lot / Submits Offer]
    K --> L[Representative Sends Counter-Offer]
    L --> M[Team Members Vote on Deal]
    M --> N[Deal Agreed & Competing Offers Rejected]
    N --> O[Buyer Initiates Checkout]
    O --> P[Payment Simulated & Escrow Verified]
    P --> Q[Automatic Settlement Engine Executes]
    Q --> R[Exact Proportional Payout Credited to Wallets]
    Q --> S[Digital Lot Passport Generated]
    R --> T[Farmer Withdraws to Bank/UPI]
```

### Farmer Workflow
1. **Registration**: Farmer registers via mobile number, password, full name, village, district, state, and GPS coordinates.
2. **Produce Entry**: Farmer submits harvest details: crop, variety, quantity (kg), grade (A/B/C), harvest date, expected selling date, and minimum price per kg.
3. **Compatibility Matching**: For any available produce lot, farmer views open teams ranked by compatibility score.
4. **Joining a Team**: Farmer sends a join request with an optional message.
5. **Team Creation**: If no suitable team exists, the farmer creates a new team, becoming the Representative (Member #1).
6. **Deal Notification & Voting**: When a buyer submits an offer, the farmer receives an in-app notification and casts an approval vote.
7. **Settlement**: Upon payment completion, the farmer receives an instant notification, views the detailed payout receipt, and checks their updated wallet balance.

### Team Representative Responsibilities
1. **Managing Join Requests**: Reviews applicant compatibility breakdowns and approves up to 3 additional members.
2. **Negotiating with Buyers**: Receives buyer purchase offers, formulates counter-offers, and communicates team terms.
3. **Finalizing Deals**: Evaluates member voting consensus and formally accepts the finalized price per kg.
4. **Leadership Succession**: If the representative withdraws prior to a sale agreement, leadership is automatically passed to the next confirmed member.

### Buyer Workflow
1. **Registration**: Buyer signs up with trade name, business type (Wholesaler, Food Processor, Retail Chain, Exporter), GST/license, and delivery depot coordinates.
2. **Procurement Demands**: Posts crop requirements specifying min/max quantity, target delivery date, preferred grade, and offered price.
3. **Lot Discovery**: Browses verified 4-farmer collective lots, reviewing aggregate volume, quality grade, harvest dates, and pickup centroid.
4. **Offer & Negotiation**: Submits offers, receives representative counter-offers, and agrees on a price per kg.
5. **Checkout & Escrow Payment**: Completes simulated checkout with transparent breakdown of gross produce cost, transport deduction, and platform fee.
6. **Provenance Verification**: Receives the official Digital Lot Passport with QR provenance.

### Admin Workflow
1. **System Overview**: Monitors real-time aggregated volume (kg), gross turnover (₹), platform commission, and monthly sales trends.
2. **User KYC Management**: Audits farmer and buyer registrations, with the ability to toggle KYC verification.
3. **Team Lifecycle Audits**: Inspects teams across all states (`open`, `full`, `selling`, `completed`).
4. **Dynamic Configuration**: Adjusts platform parameters (compatibility threshold, platform commission fee %, transport rate per km/kg) without code deployment.

---

## Smart Team Opportunity & Compatibility Engine

The Compatibility Engine (`backend/app/engine/compatibility.py`) calculates match synergy using a multi-factor weighted scoring formula:

### 6-Factor Scoring Algorithm & Exact Weights

$$\text{Final Score} = \sum_{i=1}^6 (\text{Factor Score}_i \times \text{Weight}_i) \times 100$$

| Factor | Weight | Evaluation Logic & Rules |
| :--- | :---: | :--- |
| **1. Crop Match** | **30%** | Strict crop match required. If crops differ $\to$ Score is **0.0%** immediately. |
| **2. Variety Match** | **15%** | Identical variety $\to$ `1.0`; Compatible sub-profile $\to$ `0.8`; Different variety $\to$ `0.5`. |
| **3. Quality Grade** | **15%** | Same grade (e.g. A with A) $\to$ `1.0`; Minor difference (A with B) $\to$ `0.6`; Disparity (A with C) $\to$ `0.3`. |
| **4. Selling Window** | **15%** | Date difference $\le 3$ days $\to$ `1.0`; $\le 7$ days $\to$ `0.85`; $\le 14$ days $\to$ `0.60`; $> 14$ days $\to$ `0.20`. |
| **5. Proximity (Haversine)** | **15%** | Distance $\le 15\text{ km} \to 1.0$; $\le 35\text{ km} \to 0.85$; $\le 65\text{ km} \to 0.65$; $\le 100\text{ km} \to 0.40$; $> 100\text{ km} \to 0.15$. *(Fallback to district match = 0.90 if GPS missing).* |
| **6. Quantity Fit / Unlock**| **10%** | Contribution unlocks active buyer requirement tier $\to$ `1.0`; Lot $\ge 1,000\text{ kg} \to 0.90$; Lot $\ge 200\text{ kg} \to 0.80$; Else $\to 0.60$. |

### Four-Member Hard Limit & Backend Locking
- Teams are strictly limited to **4 members**.
- Backend route validation in `backend/app/routers/teams.py` enforces `len(members) < 4` at both join-request submission and review approval.
- When the 4th member is approved:
  1. Team status automatically updates from `open` to `full`.
  2. All other pending join requests for that team are automatically marked as `rejected`.
  3. The Smart Collection Centroid is computed from all 4 members' coordinates.

### Join Request & Review Lifecycle
- Join requests are created with status `pending` and include calculated compatibility score and match reasons.
- Team Representative approves (`approve`) or rejects (`reject`) the request.
- On approval, produce status is updated to `locked_in_team`.

### Recently Created Teams Discovery
- `GET /api/v1/teams/recently-created`: For buyers, matches open and full teams against active procurement demands; for farmers, presents active opportunities in their region.

### Team Creation When No Match Exists
- Farmers can create a new team at any time using `POST /api/v1/teams`, providing a team name and selecting an available produce lot.
- The creator is immediately registered as Member #1 and designated as Team Representative.

### Replacement Farmer & Withdrawal Handling
- If a farmer withdraws before a sale is agreed (`POST /api/v1/teams/{team_id}/withdraw`):
  - Their produce lot status resets to `available`.
  - The team member record is deleted.
  - If the team was `full`, its status reverts to `open`, making a slot available for a replacement farmer.
  - If the representative withdraws, the role is automatically assigned to the first remaining member.

---

## Innovative Implemented Mechanics

### Buyer Unlock Progress Meter
- Visualized in `frontend/src/components/BuyerUnlockCard.tsx`.
- Queries active buyer requirements matching the team's crop and tracks current aggregated volume against buyer minimum thresholds.
- Shows exact progress percentage and kilograms needed to unlock bulk pricing.

### What-If Collective Benefit Simulator
- Visualized in `frontend/src/components/WhatIfSimulator.tsx` and backed by `POST /api/v1/teams/{team_id}/what-if-simulation`.
- Compares individual solo sales (standalone tempo rental ₹800 + ₹18/km) against 4-farmer collective sales (shared 1/4th truck freight + 2% platform fee), demonstrating a net in-hand earnings boost of +15–25%.

### Team Growth & Potential Simulator
- Implemented in `frontend/src/components/TeamGrowthSimulator.tsx` and `GET /api/v1/teams/{team_id}/growth-simulation`.
- Forecasts final batch volume, unlocked buyer demand, and batch market value when open slots (e.g., 2/4 or 3/4) are filled.

### Team Health Monitor
- Implemented in `GET /api/v1/teams/{team_id}/health`.
- Evaluates Member Capacity (slots filled), Grade Homogeneity (quality consistency across members), and Market Demand Alignment.

### Smart Collection Point Centroid Calculation
- Implemented in `backend/app/engine/logistics.py`.
- Calculates the arithmetic mean of all confirmed member GPS coordinates, with an optional 20% directional vector pull toward the buyer's delivery depot:
  $$\text{Centroid Lat} = \frac{1}{N}\sum_{i=1}^N \text{Lat}_i, \quad \text{Centroid Lng} = \frac{1}{N}\sum_{i=1}^N \text{Lng}_i$$

### Shared Transport Freight Savings Engine
- Implemented in `backend/app/engine/logistics.py`.
- Compares $N$ solo trips ($N \times (₹800 + 18 \times \text{km})$) with 1 consolidated commercial truck ($₹1400 + 25 \times \text{km}$), proving freight cost reductions exceeding 50%.

### Sustainability & Carbon Impact Engine
- Implemented in `backend/app/engine/logistics.py` and displayed at `/dashboard/impact`.
- For completed collective batches, calculates avoided vehicle trips ($N - 1$), distance saved ($\text{trips} \times 45\text{ km}$), diesel saved ($0.09\text{ L/km}$), and $\text{CO}_2$ avoided ($2.68\text{ kg CO}_2\text{/L}$).

### Digital Collective Lot Passport & QR Provenance
- Implemented in `backend/app/models.py`, `backend/app/routers/sales.py`, and rendered at `/passport/[lotCode]`.
- Issues an authenticated certificate containing unique lot code, crop grade, contributing farmer count, harvest window, pickup depot, buyer details, and QR verification string.

### Grounded AI Explainability Assistant
- Implemented in `backend/app/engine/explainability.py` and `frontend/src/components/AIExplanationModal.tsx`.
- Generates natural language explanations for team recommendations, eligibility constraints, and transport savings without external ungrounded LLM dependencies.

---

## Data Flow & System Architecture

### System Architecture Diagram

```mermaid
graph TB
    subgraph ClientLayer ["Client Layer (Next.js 14 / React 18 / TailwindCSS)"]
        FarmerUI["Farmer Dashboard & Team Hub<br/>(/dashboard)"]
        BuyerUI["Buyer Procurement Portal<br/>(/buyer)"]
        AdminUI["Admin Analytics Portal<br/>(/admin)"]
        PassportUI["Digital Lot Passport<br/>(/passport/[lotCode])"]
        AuthContext["Auth Context & LocalStorage Token"]
        OfflineStorage["IndexedDB (Offline Drafts)"]
    end

    subgraph APILayer ["API Gateway & Security Layer (FastAPI)"]
        CORS["CORS Middleware"]
        AuthGuard["JWT Auth & Role Guards<br/>(require_farmer, require_buyer, require_admin)"]
        Routers["10 Route Handlers<br/>(/auth, /produce, /teams, /buyers, /negotiations, /sales, /wallet, /notifications, /admin, /ai)"]
    end

    subgraph EngineLayer ["Core Business Logic Engines"]
        CompatEngine["Compatibility Engine<br/>(Haversine Distance, 6-Factor Weighted Scoring)"]
        SettleEngine["Settlement Engine<br/>(Paisa-Perfect Reconciliation, Wallet Crediting)"]
        LogisticsEngine["Logistics Engine<br/>(Centroid Calculation, Shared Freight, CO2 Impact)"]
        ExplainEngine["Explainability Engine<br/>(Grounded Natural Language Explanations)"]
    end

    subgraph PersistenceLayer ["Persistence Layer (SQLAlchemy ORM)"]
        DB[(Database Engine<br/>SQLite dev / PostgreSQL prod)]
        T_Users[users]
        T_Produce[produce_lots]
        T_Teams[teams & team_members]
        T_Reqs[buyer_requirements]
        T_Negs[collective_negotiations]
        T_Sales[sale_transactions & settlement_records]
        T_Wallets[wallets & wallet_transactions]
        T_Passports[collective_lot_passports]
    end

    FarmerUI -->|HTTP JSON / Bearer JWT| AuthGuard
    BuyerUI -->|HTTP JSON / Bearer JWT| AuthGuard
    AdminUI -->|HTTP JSON / Bearer JWT| AuthGuard
    PassportUI -->|Public GET| Routers
    FarmerUI <--> OfflineStorage
    AuthContext --> FarmerUI

    AuthGuard --> Routers
    Routers --> CompatEngine
    Routers --> SettleEngine
    Routers --> LogisticsEngine
    Routers --> ExplainEngine

    Routers --> DB
    CompatEngine --> DB
    SettleEngine --> DB
    LogisticsEngine --> DB
```

### End-to-End Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor F1 as Farmer 1 (Representative)
    actor F2 as Farmer 2 (Applicant)
    actor B as Institutional Buyer
    participant API as FastAPI Backend
    participant ENG as Engine (Compat/Settle)
    participant DB as SQLAlchemy / Database

    F1->>API: POST /api/v1/teams (Create team with Produce #1)
    API->>DB: Insert Team (status: 'open', rep: F1)
    API->>DB: Update Produce #1 status = 'locked_in_team'

    F2->>API: GET /api/v1/teams/compatible?produce_lot_id=2
    API->>ENG: compute_compatibility_score()
    ENG-->>API: 92.5% compatibility score + breakdown
    API-->>F2: List of compatible teams

    F2->>API: POST /api/v1/teams/1/join-request
    API->>DB: Insert JoinRequest (status: 'pending')
    API->>DB: Create Notification for F1

    F1->>API: POST /api/v1/teams/1/join-requests/1/review (approve)
    API->>DB: Insert TeamMember #2, lock Produce #2
    Note over API,DB: When 4th member joins, Team status -> 'full'

    B->>API: POST /api/v1/negotiations/offer (₹29.5/kg)
    API->>DB: Insert CollectiveNegotiation (status: 'offer_received')
    
    F1->>API: POST /api/v1/negotiations/1/counter (₹31.0/kg)
    API->>DB: Update Negotiation status = 'counter_sent'

    B->>API: POST /api/v1/negotiations/1/accept
    API->>DB: Update Negotiation -> 'deal_agreed', Team -> 'selling'

    B->>API: POST /api/v1/sales/checkout
    API->>DB: Create SaleTransaction (payment_status: 'pending')

    B->>API: POST /api/v1/sales/1/simulate-payment
    API->>ENG: process_automatic_settlement()
    ENG->>DB: Create 4 SettlementRecords (paisa-perfect)
    ENG->>DB: Credit Wallets for all 4 farmers
    ENG->>DB: Create CollectiveLotPassport
    ENG->>DB: Update ProduceLots -> 'sold', Team -> 'completed'
    API-->>B: Return Settled Sale & Lot Passport
```

---

## Technology Stack

The project relies on verified technologies from the codebase:

| Category | Technology | Detected Version | Purpose in FasalDirect |
| :--- | :--- | :--- | :--- |
| **Backend Framework** | **FastAPI** | `0.110+` | Asynchronous REST API, dependency injection, OpenAPI documentation |
| **ASGI Web Server** | **Uvicorn** | `standard` | High-performance ASGI web server |
| **Database ORM** | **SQLAlchemy** | `2.0+` | Declarative ORM, session management, relational modeling |
| **Data Validation** | **Pydantic** | `2.0+` | Request/response schema validation and data serialization |
| **Settings Management** | **Pydantic-Settings**| `2.0+` | Environment variable management via `BaseSettings` |
| **Authentication** | **PyJWT** | `2.8+` | Cryptographic JWT token generation and validation (`HS256`) |
| **Password Security** | **Bcrypt** | `4.0+` | Salted password hashing and verification |
| **Database Drivers** | **psycopg2-binary** | `2.9+` | PostgreSQL connectivity with SQLite development fallback |
| **Frontend Framework** | **Next.js** | `14.2.5` | React framework with Pages router and SSR |
| **UI Library** | **React** | `18.3.1` | Declarative component UI library |
| **Styling** | **TailwindCSS** | `3.4.6` | Custom design system (`agri`, `ochre`, `earth` color palettes) |
| **Icons** | **Lucide React** | `0.428.0` | Agricultural and dashboard iconography |
| **Charts & Analytics** | **Recharts** | `2.12.7` | Responsive SVG charts for admin and impact metrics |
| **Mapping Engine** | **Leaflet & React-Leaflet**| `1.9.4 / 4.2.1` | OpenStreetMap rendering for farm locations and collection centroids |
| **Offline Storage** | **Native IndexedDB API** | `W3C Standard` | Local browser storage for offline produce listing drafts |
| **Testing** | **Pytest & TestClient** | `8.x` | End-to-end integration and business logic verification |

---

## Project Structure

```
FasalDirect/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── auth.py                  # JWT creation, Bcrypt password hashing, role dependencies
│   │   ├── config.py                # Pydantic BaseSettings, platform constants & algorithm weights
│   │   ├── database.py              # SQLAlchemy engine, session maker, Base, init_db()
│   │   ├── models.py                # 15 SQLAlchemy ORM models and relationships
│   │   ├── schemas.py               # Pydantic v2 validation models & request/response schemas
│   │   ├── main.py                  # FastAPI application entry point, CORS, startup events, router inclusion
│   │   ├── engine/                  # Core calculation & business logic algorithms
│   │   │   ├── __init__.py
│   │   │   ├── compatibility.py     # Haversine formula, 6-factor farmer & buyer compatibility scoring
│   │   │   ├── settlement.py        # Automatic proportional payout & exact penny reconciliation
│   │   │   ├── logistics.py         # Smart Collection centroid calculation, freight & CO2 impact
│   │   │   └── explainability.py   # Grounded natural language explanations for AI Assistant
│   │   └── routers/                 # 10 API route group controllers
│   │       ├── __init__.py
│   │       ├── auth.py              # Registration (Farmer, Buyer, Admin), Login, Profile (/me)
│   │       ├── produce.py           # Farmer produce CRUD & lock enforcement
│   │       ├── teams.py             # Team formation, discovery, join requests, approval, simulators
│   │       ├── buyers.py            # Buyer requirements CRUD, demand listing, buyer reliability
│   │       ├── negotiations.py      # Collective bidding, counter-offers, deal voting, deal confirmation
│   │       ├── sales.py             # Sale checkout, payment simulation, digital lot passports
│   │       ├── wallet.py            # Digital wallet balance, transaction ledger, withdrawals
│   │       ├── notifications.py     # In-app alerts, unread counts, mark-as-read
│   │       ├── admin.py             # System stats, KYC verification toggle, team audit, config
│   │       └── ai_assistant.py      # Grounded AI explanation endpoint (/ai/explain)
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_e2e.py              # Comprehensive Pytest E2E suite covering 4-farmer lifecycle
│   ├── fasaldirect.db               # SQLite development database file
│   └── requirements.txt             # Python dependencies
├── frontend/
│   ├── public/
│   │   └── manifest.json            # PWA Web App Manifest
│   ├── src/
│   │   ├── components/              # Modular UI components
│   │   │   ├── AIExplanationModal.tsx    # Grounded AI advisor explanation popup
│   │   │   ├── Breadcrumb.tsx            # Navigation breadcrumb component
│   │   │   ├── BuyerUnlockCard.tsx       # Progress bar tracking bulk buyer unlock status
│   │   │   ├── Footer.tsx                # Global footer with platform mission & links
│   │   │   ├── LeafletMap.tsx            # OpenStreetMap component for farm pins & centroids
│   │   │   ├── Navbar.tsx                # Role-aware navigation header with notification trigger
│   │   │   ├── NotificationDrawer.tsx    # Slide-over drawer for real-time in-app notifications
│   │   │   ├── TeamGrowthSimulator.tsx   # Interactive batch growth and value projection card
│   │   │   └── WhatIfSimulator.tsx       # Real-time solo vs collective financial comparison
│   │   ├── lib/
│   │   │   ├── api.ts                    # Centralized typed HTTP client with fetch wrapper
│   │   │   ├── authContext.tsx           # React Auth Provider, JWT state, login/logout actions
│   │   │   └── indexedDB.ts              # Browser IndexedDB storage for offline produce drafts
│   │   ├── pages/                   # Next.js page routes
│   │   │   ├── _app.tsx                  # Root layout wrapper with AuthProvider, Navbar & Footer
│   │   │   ├── _document.tsx             # HTML structure with meta tags and typography fonts
│   │   │   ├── index.tsx                 # Landing page with value proposition & live demo tools
│   │   │   ├── login.tsx                 # Mobile/Password authentication interface
│   │   │   ├── register.tsx              # Multi-step tabbed registration (Farmer & Buyer)
│   │   │   ├── admin/
│   │   │   │   └── index.tsx             # Admin portal (Analytics, KYC, Team Audits, Parameters)
│   │   │   ├── buyer/
│   │   │   │   ├── checkout/
│   │   │   │   │   └── [id].tsx          # Escrow payment simulation and checkout invoice
│   │   │   │   ├── index.tsx             # Buyer dashboard with key procurement metrics
│   │   │   │   ├── lots.tsx              # Marketplace for discovering aggregated 4-farmer lots
│   │   │   │   ├── negotiations.tsx      # Buyer negotiation inbox & counter-offer manager
│   │   │   │   ├── purchases.tsx         # Purchase history & digital passport access
│   │   │   │   └── requirements.tsx      # Crop requirement creation & active demand manager
│   │   │   ├── dashboard/
│   │   │   │   ├── index.tsx             # Farmer dashboard overview (status, active team, wallet)
│   │   │   │   ├── impact.tsx            # Sustainability & carbon savings report
│   │   │   │   ├── negotiations.tsx      # Farmer collective negotiation viewer & vote monitor
│   │   │   │   ├── produce.tsx           # Produce lot management & offline draft synchronization
│   │   │   │   ├── sales.tsx             # Completed sales history and settlement receipts
│   │   │   │   ├── wallet.tsx            # Digital wallet ledger & bank/UPI withdrawal
│   │   │   │   └── teams/
│   │   │   │       ├── [id].tsx          # Comprehensive Team Hub (members, map, voting, unlocks)
│   │   │   │       ├── create.tsx        # New 4-farmer collective team creation
│   │   │   │       ├── index.tsx         # Smart Opportunity Explorer & compatible team finder
│   │   │   │       └── requests.tsx      # Representative join-request review manager
│   │   │   └── passport/
│   │   │       └── [lotCode].tsx         # Public QR-traceable provenance lot certificate
│   │   └── styles/
│   │       └── globals.css               # Tailwind directives, custom scrollbars & Leaflet fixes
│   ├── next.config.js               # Next.js configuration
│   ├── package.json                 # Node dependencies and build scripts
│   ├── postcss.config.js            # PostCSS configuration for TailwindCSS
│   ├── tailwind.config.js           # Custom theme colors (agri, ochre, earth) and font families
│   └── tsconfig.json                # TypeScript compiler configuration
├── verify_live_workflow.py          # Standalone verification script running end-to-end flow
├── .gitignore                       # Git ignore rules for node_modules, DBs, caches
└── README.md                        # Complete technical documentation (this document)
```

---

## Frontend Architecture & Interfaces

### Next.js Pages & Routes
- `/`: Landing page with hero banner, 4-step workflow explanation, interactive What-If Simulator, and registration CTAs.
- `/login`: Unified mobile number and password authentication.
- `/register`: Tabbed onboarding for Farmers (including initial produce submission) and Buyers (including procurement demand).
- `/dashboard`: Farmer dashboard overview displaying active team membership, listed produce, and wallet summary.
- `/dashboard/produce`: Produce lot inventory manager, grade classification, harvest window picker, and offline draft sync.
- `/dashboard/teams`: Opportunity Explorer for discovering compatible teams matching produce lots.
- `/dashboard/teams/create`: Team creation form for starting a new collective.
- `/dashboard/teams/[id]`: Central Team Hub featuring confirmed member cards, OpenStreetMap centroid, buyer unlock progress bars, deal voting, counter-offer form, and simulators.
- `/dashboard/teams/requests`: Team Representative inbox for reviewing pending applicant compatibility and reasons.
- `/dashboard/negotiations`: Negotiation monitor displaying active buyer offers and vote tallies.
- `/dashboard/sales`: Completed sale receipts and payout distribution history.
- `/dashboard/wallet`: Financial ledger, credit/debit audit logs, and bank/UPI payout requests.
- `/dashboard/impact`: Environmental impact metrics ($\text{CO}_2$ avoided, diesel saved, trips avoided).
- `/buyer`: Buyer dashboard with procurement KPIs, active demands, and negotiations.
- `/buyer/requirements`: Demands manager for creating and listing crop procurement requirements.
- `/buyer/lots`: Marketplace for discovering aggregated 4-farmer collective lots.
- `/buyer/negotiations`: Negotiation hub for reviewing team counter-offers and accepting deals.
- `/buyer/purchases`: Order history and lot passport links.
- `/buyer/checkout/[id]`: Simulated escrow checkout invoice and payment simulation.
- `/admin`: Administrative portal with Recharts visualizations, user KYC toggles, team audits, and platform settings.
- `/passport/[lotCode]`: Public certificate page displaying verified multi-farmer provenance and QR code.

---

## Backend Architecture & Business Engines

### FastAPI Router Hierarchy
- `/api/v1/auth`: Registration, login, and profile endpoints.
- `/api/v1/produce`: Produce creation, inventory, and deletion with status locking.
- `/api/v1/teams`: Team formation, compatibility discovery, join requests, approval, withdrawal, and simulations.
- `/api/v1/buyers`: Procurement demand management and buyer reliability scoring.
- `/api/v1/negotiations`: Offer submission, counter-offers, deal voting, and acceptance.
- `/api/v1/sales`: Checkout creation, simulated payment processing, and lot passports.
- `/api/v1/wallet`: Wallet balance retrieval and withdrawal ledger.
- `/api/v1/notifications`: Notification listing, unread counts, and mark-as-read actions.
- `/api/v1/admin`: Analytics overview, KYC management, team audits, and configuration updates.
- `/api/v1/ai`: Grounded natural language explanations for recommendations, eligibility, and savings.

---

## Database Design & Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ produce_lots : owns
    users ||--o{ buyer_requirements : posts
    users ||--o{ teams : represents
    users ||--o{ team_members : belongs_to
    users ||--o{ join_requests : submits
    users ||--o| wallets : owns
    users ||--o{ notifications : receives
    users ||--o{ team_reviews : writes

    teams ||--|{ team_members : contains
    teams ||--o{ join_requests : receives
    teams ||--o{ collective_negotiations : negotiates
    teams ||--o{ sale_transactions : sells
    teams ||--o{ collective_lot_passports : certified_by
    teams ||--o{ team_reviews : evaluated_by

    produce_lots ||--o{ team_members : committed_in
    produce_lots ||--o{ join_requests : attached_to

    buyer_requirements ||--o{ collective_negotiations : fulfills

    collective_negotiations ||--o{ sale_transactions : results_in

    sale_transactions ||--|{ settlement_records : divides_into
    sale_transactions ||--o| collective_lot_passports : generates

    wallets ||--o{ wallet_transactions : logs
```

### Database Models & Relationships

1. **`User` (`users`)**:
   - Fields: `id` (PK), `phone` (Unique, Index), `email` (Unique, Index), `password_hash`, `role` (`farmer`, `buyer`, `admin`), `full_name`, `village`, `district`, `state`, `latitude`, `longitude`, `preferred_language`, `business_name`, `buyer_type`, `business_address`, `gst_or_license`, `kyc_verified`, `created_at`.
   - Relationships: `produce_lots`, `buyer_requirements`, `represented_teams`, `memberships`, `join_requests`, `wallet`, `notifications`.
2. **`ProduceLot` (`produce_lots`)**:
   - Fields: `id` (PK), `farmer_id` (FK `users.id`), `crop` (Index), `variety`, `quantity_kg`, `available_quantity_kg`, `grade` (A, B, C), `harvest_date`, `expected_selling_date`, `min_price_per_kg`, `photo_url`, `status` (`available`, `locked_in_team`, `sold`), `created_at`.
3. **`Team` (`teams`)**:
   - Fields: `id` (PK), `name`, `representative_id` (FK `users.id`), `crop` (Index), `variety`, `grade`, `target_selling_date`, `status` (`open`, `full`, `ready_to_sell`, `selling`, `sold`, `payment_processing`, `completed`), `collection_lat`, `collection_lng`, `collection_address`, `created_at`.
4. **`TeamMember` (`team_members`)**:
   - Fields: `id` (PK), `team_id` (FK `teams.id`), `farmer_id` (FK `users.id`), `produce_lot_id` (FK `produce_lots.id`), `contributed_kg`, `joined_at`, `vote_status` (`pending`, `approved`, `rejected`).
5. **`JoinRequest` (`join_requests`)**:
   - Fields: `id` (PK), `team_id` (FK `teams.id`), `farmer_id` (FK `users.id`), `produce_lot_id` (FK `produce_lots.id`), `compatibility_score`, `reasons_json`, `message`, `status` (`pending`, `approved`, `rejected`), `created_at`, `reviewed_at`.
6. **`BuyerRequirement` (`buyer_requirements`)**:
   - Fields: `id` (PK), `buyer_id` (FK `users.id`), `crop` (Index), `variety`, `min_quantity_kg`, `max_quantity_kg`, `preferred_grade`, `target_delivery_date`, `offered_price_per_kg`, `delivery_state`, `delivery_district`, `delivery_address`, `delivery_lat`, `delivery_lng`, `buying_preferences`, `status` (`active`, `negotiating`, `fulfilled`, `cancelled`), `created_at`.
7. **`CollectiveNegotiation` (`collective_negotiations`)**:
   - Fields: `id` (PK), `team_id` (FK `teams.id`), `buyer_id` (FK `users.id`), `buyer_requirement_id` (FK `buyer_requirements.id`), `offered_price_per_kg`, `counter_price_per_kg`, `final_agreed_price_per_kg`, `transport_cost_total`, `platform_fee_total`, `status` (`offer_received`, `counter_sent`, `voting`, `deal_agreed`, `rejected`, `cancelled`), `notes`, `created_at`, `updated_at`.
8. **`SaleTransaction` (`sale_transactions`)**:
   - Fields: `id` (PK), `team_id` (FK `teams.id`), `buyer_id` (FK `users.id`), `negotiation_id` (FK `collective_negotiations.id`), `total_quantity_kg`, `price_per_kg`, `gross_amount`, `transport_deduction`, `platform_fee`, `net_distributable_amount`, `payment_status` (`pending`, `completed`), `payment_reference`, `created_at`.
9. **`SettlementRecord` (`settlement_records`)**:
   - Fields: `id` (PK), `sale_id` (FK `sale_transactions.id`), `farmer_id` (FK `users.id`), `contributed_kg`, `percentage_share`, `gross_payout`, `transport_share`, `platform_fee_share`, `net_payout`, `status` (`credited`), `created_at`.
10. **`Wallet` (`wallets`)**:
    - Fields: `id` (PK), `user_id` (FK `users.id`, Unique), `available_balance`, `pending_balance`, `total_earned`, `total_withdrawn`, `updated_at`.
11. **`WalletTransaction` (`wallet_transactions`)**:
    - Fields: `id` (PK), `wallet_id` (FK `wallets.id`), `amount`, `type` (`credit_payout`, `debit_withdrawal`), `description`, `reference_id`, `created_at`.
12. **`CollectiveLotPassport` (`collective_lot_passports`)**:
    - Fields: `id` (PK), `lot_code` (Unique, Index), `team_id` (FK `teams.id`), `sale_id` (FK `sale_transactions.id`), `crop`, `grade`, `total_kg`, `farmer_count`, `harvest_window`, `collection_point`, `buyer_name`, `final_price`, `qr_data`, `created_at`.
13. **`Notification` (`notifications`)**:
    - Fields: `id` (PK), `user_id` (FK `users.id`), `title`, `message`, `category` (`join_request`, `approval`, `team_status`, `offer`, `sale`, `payment`, `system`), `link`, `read`, `created_at`.
14. **`TeamReview` (`team_reviews`)**:
    - Fields: `id` (PK), `team_id` (FK `teams.id`), `buyer_id` (FK `users.id`), `rating`, `comment`, `created_at`.
15. **`PlatformConfig` (`platform_configs`)**:
    - Fields: `id` (PK), `key` (Unique, Index), `value`, `description`, `updated_at`.

---

## API Documentation

All routes are served under the `/api/v1` prefix. Interactive development docs are accessible at `http://localhost:8000/docs`.

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth / Role | Key Request Params / Body | Response Summary |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `POST` | `/auth/register/farmer` | Register a new Farmer account | Public | `phone`, `password`, `full_name`, `village`, `district`, `state`, optional crop fields | JWT token, user info |
| `POST` | `/auth/register/buyer` | Register a new Buyer account | Public | `phone`, `password`, `full_name`, `business_name`, `buyer_type`, optional demand | JWT token, user info |
| `POST` | `/auth/register/admin` | Register a new Admin account | Public | `phone`, `password`, `full_name`, optional `email` | JWT token, user info |
| `POST` | `/auth/login` | Login with mobile number and password | Public | `phone`, `password` | JWT token, user info |
| `GET` | `/auth/me` | Fetch authenticated user profile | Any Auth | None | Full `UserResponse` object |

### Farmer Produce (`/api/v1/produce`)
| Method | Endpoint | Description | Auth / Role | Key Request Params / Body | Response Summary |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `POST` | `/produce` | Create a new produce lot | `farmer` | `crop`, `variety`, `quantity_kg`, `grade`, `harvest_date`, `expected_selling_date`, `min_price_per_kg` | Created `ProduceResponse` |
| `GET` | `/produce/my` | List current farmer's produce lots | `farmer` | None | `List[ProduceResponse]` |
| `GET` | `/produce/{id}` | Get produce lot by ID | Any Auth | Path `produce_id` | `ProduceResponse` |
| `DELETE`| `/produce/{id}` | Delete uncommitted produce lot | `farmer` | Path `produce_id` | Deletion confirmation message |

### Collective Teams (`/api/v1/teams`)
| Method | Endpoint | Description | Auth / Role | Key Request Params / Body | Response Summary |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `POST` | `/teams` | Create a new 4-farmer collective team | `farmer` | `name`, `produce_lot_id`, optional `target_selling_date` | Full `TeamDetailResponse` |
| `GET` | `/teams/compatible` | Discover compatible open teams for a produce lot | `farmer` | Query `produce_lot_id` | `List[TeamOpportunityResponse]` |
| `GET` | `/teams/recently-created`| Feed of active teams (buyer demand or farmer feed) | Any Auth | Optional query `produce_lot_id` | `List[TeamOpportunityResponse]` |
| `GET` | `/teams/my` | List all teams the farmer belongs to or represents | `farmer` | None | `List[TeamDetailResponse]` |
| `GET` | `/teams/{id}` | Full Team Hub details, members, centroid & unlocks | Any Auth | Path `team_id` | Full `TeamDetailResponse` |
| `POST` | `/teams/{id}/join-request` | Submit request to join open team | `farmer` | `produce_lot_id`, optional `message` | Created `JoinRequestResponse` |
| `GET` | `/teams/{id}/join-requests` | View pending join requests | Rep Only | Path `team_id` | `List[JoinRequestResponse]` |
| `POST` | `/teams/{id}/join-requests/{req_id}/review` | Approve or reject applicant | Rep Only | `action` (`"approve"` or `"reject"`) | Status confirmation message |
| `POST` | `/teams/{id}/withdraw` | Withdraw from team and unlock produce | `farmer` | Path `team_id` | Status confirmation message |
| `POST` | `/teams/{id}/what-if-simulation` | Calculate solo vs collective financial comparison | `farmer` | `produce_lot_id`, optional solo/team prices | `WhatIfSimulationResponse` |
| `GET` | `/teams/{id}/growth-simulation` | Forecast lot size and commercial value | Any Auth | Path `team_id` | `TeamGrowthSimulationResponse` |
| `GET` | `/teams/{id}/health` | Health audit (capacity, grade consistency, demand) | Any Auth | Path `team_id` | Health JSON report |

### Buyers & Requirements (`/api/v1/buyers`)
| Method | Endpoint | Description | Auth / Role | Key Request Params / Body | Response Summary |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `POST` | `/buyers/requirements` | Post procurement requirement | `buyer` | `crop`, `variety`, `min_quantity_kg`, `max_quantity_kg`, `preferred_grade`, `target_delivery_date`, `offered_price_per_kg`, `delivery_state`, `delivery_district`, `delivery_address` | Created `BuyerRequirementResponse` |
| `GET` | `/buyers/requirements/my` | List buyer's posted requirements | `buyer` | None | `List[BuyerRequirementResponse]` |
| `GET` | `/buyers/requirements` | Browse all active marketplace requirements | Any Auth | Optional query `crop` | `List[BuyerRequirementResponse]` |
| `DELETE`| `/buyers/requirements/{id}` | Delete posted requirement | `buyer` | Path `req_id` | Deletion confirmation message |
| `GET` | `/buyers/{id}/reliability` | View buyer transaction history & score | Public | Path `buyer_id` | Buyer reliability summary |

### Negotiations & Voting (`/api/v1/negotiations`)
| Method | Endpoint | Description | Auth / Role | Key Request Params / Body | Response Summary |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `POST` | `/negotiations/offer` | Buyer submits purchase offer | `buyer` | `team_id`, `offered_price_per_kg`, optional `buyer_requirement_id`, `notes` | Created `NegotiationResponse` |
| `POST` | `/negotiations/{id}/counter` | Representative counters buyer offer | Rep Only | `counter_price_per_kg`, optional `notes` | Updated `NegotiationResponse` |
| `POST` | `/negotiations/{id}/vote` | Member votes on active offer | Member | `vote` (`"approved"` or `"rejected"`) | Vote confirmation message |
| `POST` | `/negotiations/{id}/accept` | Accept deal and lock sale | Buyer/Rep | Path `neg_id` | Updated `NegotiationResponse` |
| `GET` | `/negotiations/team/{id}` | List negotiations for a team | Any Auth | Path `team_id` | `List[NegotiationResponse]` |
| `GET` | `/negotiations/buyer/my` | List negotiations initiated by buyer | `buyer` | None | `List[NegotiationResponse]` |

### Sales & Settlement (`/api/v1/sales`)
| Method | Endpoint | Description | Auth / Role | Key Request Params / Body | Response Summary |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `POST` | `/sales/checkout` | Create idempotent sale transaction | `buyer`/`admin` | `negotiation_id` | Created `SaleResponse` |
| `POST` | `/sales/{id}/simulate-payment` | Trigger payment & automatic settlement | `buyer`/`admin` | `payment_method`, optional `transaction_reference` | Settled `SaleResponse` with 4 settlements |
| `GET` | `/sales/{id}` | Get sale invoice and settlement details | Any Auth | Path `sale_id` | Full `SaleResponse` |
| `GET` | `/sales/passport/{lot_code}` | Public Digital Lot Passport by lot code | Public | Path `lot_code` | `LotPassportResponse` |
| `GET` | `/sales/my/all` | List completed sales for user | Any Auth | None | `List[SaleResponse]` |

### Wallet & Payouts (`/api/v1/wallet`)
| Method | Endpoint | Description | Auth / Role | Key Request Params / Body | Response Summary |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `GET` | `/wallet/my` | Fetch wallet balances & ledger logs | Any Auth | None | `WalletResponse` |
| `POST` | `/wallet/withdraw` | Request payout withdrawal | Any Auth | `amount`, `bank_account_or_upi` | Confirmation & new balance |

### Notifications (`/api/v1/notifications`)
| Method | Endpoint | Description | Auth / Role | Key Request Params / Body | Response Summary |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `GET` | `/notifications` | List user notifications | Any Auth | None | `List[NotificationResponse]` |
| `GET` | `/notifications/unread-count` | Count unread notifications | Any Auth | None | `{"unread_count": N}` |
| `POST` | `/notifications/{id}/read` | Mark notification as read | Any Auth | Path `notif_id` | Status confirmation |
| `POST` | `/notifications/read-all` | Mark all notifications as read | Any Auth | None | Status confirmation |

### Admin Portal (`/api/v1/admin`)
| Method | Endpoint | Description | Auth / Role | Key Request Params / Body | Response Summary |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `GET` | `/admin/stats` | System analytics and volume metrics | `admin` | None | Full `AdminStatsResponse` |
| `GET` | `/admin/users` | List registered users | `admin` | Optional query `role` | `List[UserResponse]` |
| `POST` | `/admin/users/{id}/verify` | Toggle user KYC verification | `admin` | `kyc_verified` (boolean) | Verification status message |
| `GET` | `/admin/teams` | Audit all platform teams | `admin` | None | Team audit list |
| `GET` | `/admin/config` | Read platform configuration | `admin` | None | Key-value settings map |
| `POST` | `/admin/config` | Update platform configuration | `admin` | `key`, `value` | Update confirmation message |

### AI Assistant & Explainability (`/api/v1/ai`)
| Method | Endpoint | Description | Auth / Role | Key Request Params / Body | Response Summary |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `POST` | `/ai/explain` | Generate grounded natural language explanation | Any Auth | `query_type`, `target_id`, optional `farmer_produce_id` | `AIExplainResponse` |

---

## Authentication & Authorization

- **Cryptographic Standard**: HMAC-SHA256 (`HS256`) JSON Web Tokens generated via `PyJWT`.
- **Token Claims**: `sub` (User ID), `role` (`farmer`, `buyer`, `admin`), `name` (Full Name), `exp` (Expiration, default 7 days).
- **Password Security**: Salted blowfish password hashing using `bcrypt.hashpw` with unique auto-generated salts.
- **Route Guards**: Injected via FastAPI dependencies (`require_farmer`, `require_buyer`, `require_admin`).
- **Representative-Specific Guards**: Operations such as join-request approval, counter-offer creation, and deal finalization verify `team.representative_id == current_user.id`.

---

## Core Business Rules & State Transitions

1. **Strict 4-Member Cap**: Teams cannot exceed 4 members. Once 4 members are confirmed, the team transitions to `full`, and further join requests are rejected.
2. **Produce Availability & Locking**: Produce lots committed to a team are marked `locked_in_team` and cannot be deleted or committed to another team. Produce is marked `sold` upon settlement.
3. **Exclusive Representative Authority**: Only the Team Representative can review join requests, counter buyer offers, and accept final deals.
4. **Democratic Deal Voting**: All 4 confirmed team members have voting rights (`approved` or `rejected`) on active negotiations.
5. **Competing Negotiation Invalidation**: When a deal is agreed upon, all other competing negotiations for that team are automatically marked `rejected`.
6. **Withdrawal Produce Release**: If a member withdraws before a deal is locked in sale, their produce lot status resets to `available`. If the representative withdraws, leadership passes automatically to the first remaining member.
7. **Idempotent Checkout & Settlement**: Checkout and payment simulation can only be executed once per sale; duplicate requests return the existing record or fail safely.
8. **Paisa-Perfect Financial Reconciliation**: Rounding differences in proportional division are reconciled on the final member's share to guarantee zero balance leakage.

---

## Offline & PWA Functionality

- **Native IndexedDB API**: Implemented in `frontend/src/lib/indexedDB.ts` (`FasalDirect_Offline_DB`, object store `produce_drafts`).
- **Offline Draft Saving**: When a farmer submits produce without network connectivity (`!navigator.onLine`), the lot is stored locally with a timestamp.
- **Synchronization**: When connectivity returns, farmers can review offline drafts and sync them to the backend API with one click.
- **PWA Manifest**: Located at `frontend/public/manifest.json`, providing standalone mobile display mode, theme colors (`#285d3b`), and launch metadata.

---

## Maps & Geospatial Location System

- **Map Engine**: Leaflet 1.9.4 and React-Leaflet 4.2.1 utilizing OpenStreetMap raster tiles.
- **Client Dynamic Loading**: Map components use `next/dynamic` with `ssr: false` to prevent server-side window/document execution errors.
- **Custom HTML Div Icons**:
  - 🌱 **Farmer Location** (`farmer`): Forest green rounded badge.
  - 📍 **Smart Collection Centroid** (`collection`): Ochre pulsing location marker.
  - 🏢 **Buyer Delivery Depot** (`buyer`): Deep navy corporate badge.
- **Centroid Calculation**: Uses arithmetic mean of valid member GPS coordinates with a 20% vector pull toward the buyer's delivery depot.
- **Interactive Pinning**: Supports click-to-pin coordinate selection during farmer/buyer onboarding.

---

## Payment & Settlement System (Simulated Flow)

> **Important Disclosure**: The payment flow in the current implementation uses a **simulated escrow settlement model** (`UPI_Simulated_Escrow`). It demonstrates the complete financial calculation, deduction, and distribution workflow without requiring live banking credentials.

### Automatic Settlement Breakdown
1. **Gross Transaction Value**: $\text{Total kg} \times \text{Agreed Price/kg}$
2. **Freight Deduction**: Shared transport cost split proportionally by contributed weight.
3. **Platform Fee**: Configurable percentage (default 2%) deducted transparently.
4. **Net Payout Calculation**:
   $$\text{Net Distributable} = \text{Gross Amount} - \text{Transport Deduction} - \text{Platform Fee}$$
5. **Exact Paisa Reconciliation**:
   - For members $1$ to $N-1$: $\text{Payout}_i = \text{round}(\text{Gross Amount} \times \text{Fraction}_i - \text{Deductions}_i, 2)$
   - For member $N$ (last member): $\text{Payout}_N = \text{Net Distributable} - \sum_{i=1}^{N-1} \text{Payout}_i$
6. **Wallet Crediting**: Instantly increments each farmer's `available_balance` and logs a traceable `WalletTransaction`.

---

## In-App Notifications System

- **Storage**: Persisted in the `notifications` database table.
- **Categories**:
  - `join_request`: Alert to representative for new applicant.
  - `approval`: Alert to farmer upon join acceptance/rejection.
  - `team_status`: Alert for team full or leadership handover.
  - `offer`: Alert for buyer purchase offers or team counter-offers.
  - `sale`: Alert for deal agreement and payment prompts.
  - `payment`: Alert for wallet credit after automatic settlement.
  - `system`: Onboarding and system notices.
- **UI Presentation**: Real-time slide-over notification drawer with unread count badge on the Navbar, category-specific icons, and direct navigation links.

---

## Installation & Local Development Setup

### Prerequisites
- **Python**: Version `3.10` or higher
- **Node.js**: Version `18.x` or higher (`npm` package manager)
- **Git**: Installed and configured

### 1. Clone the Repository
```bash
git clone <REPOSITORY_URL>
cd "FasalDirect - 2"
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node dependencies
npm install
```

### 4. Running Both Services Concurrently
- **Terminal 1 (Backend API)**:
  ```bash
  cd backend
  uvicorn app.main:app --reload --port 8000
  ```
- **Terminal 2 (Frontend UI)**:
  ```bash
  cd frontend
  npm run dev
  ```
- Access Frontend Application: `http://localhost:3000`
- Access Backend API Docs: `http://localhost:8000/docs`

---

## Environment Variables

### Backend Configuration (`backend/.env` or system environment)
| Variable Name | Default Value | Purpose |
| :--- | :--- | :--- |
| `PROJECT_NAME` | `FasalDirect` | API application name |
| `API_V1_STR` | `/api/v1` | Global API route prefix |
| `SECRET_KEY` | `fasaldirect_super_secure_jwt_secret_key_2026_india` | Secret key for JWT signing |
| `ALGORITHM` | `HS256` | JWT cryptographic algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` (7 days) | Access token expiration duration |
| `DATABASE_URL` | `sqlite:///./fasaldirect.db` | Database connection URI (PostgreSQL / SQLite) |
| `DEFAULT_COMPATIBILITY_THRESHOLD`| `75.0` | Minimum score for team recommendations |
| `DEFAULT_PLATFORM_FEE_PERCENT` | `2.0` | Platform transaction commission (%) |
| `BASE_TRANSPORT_RATE_PER_KM_PER_KG`| `0.008` | Base transport calculation rate |

### Frontend Configuration (`frontend/.env.local`)
| Variable Name | Default Value | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | Backend REST API endpoint |

---

## Database Setup & Migrations

- The application uses SQLAlchemy's `Base.metadata.create_all(bind=engine)` inside `init_db()` (`backend/app/database.py`).
- Tables are **created automatically on application startup**.
- Development uses the local SQLite database (`fasaldirect.db`).
- The application starts with a clean database where users register their own Farmer, Buyer, or Admin accounts.
- To connect to PostgreSQL in production, set `DATABASE_URL`:
  ```bash
  DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/fasaldirect
  ```

---

## Testing & Verification

### Automated Pytest Test Suite
The repository includes an end-to-end integration test suite (`backend/tests/test_e2e.py`) verifying the complete 4-farmer collective lifecycle:

```bash
cd backend
pytest -v tests/test_e2e.py
```

#### Test Suite Verification Includes:
- Root & health check verification (`/`, `/health`)
- Registration of 4 farmers with produce lots
- Team creation by Farmer 1 (Representative) & produce locking
- Rejection of produce deletion when locked
- Compatibility scoring and join requests for Farmers 2, 3, and 4
- Review approval and team status transition to `full`
- Enforcement of the strict 4-member limit (rejection of 5th farmer)
- Buyer registration and procurement demand posting
- Buyer team discovery & offer submission
- Representative counter-offer & unauthorized member counter rejection
- Democratic member deal voting
- Deal agreement & competing offer auto-rejection
- Idempotent sale checkout creation
- Payment simulation & automatic contribution-based settlement
- Paisa-perfect reconciliation ($\sum \text{Payouts} == \text{Net Distributable}$)
- Individual wallet crediting & produce status transition to `sold`
- Lot Passport generation and public verification
- Negative tests for invalid produce, role access violations, and excessive wallet withdrawals

### Live Full-Stack Verification Script
Run the standalone verification script:
```bash
python verify_live_workflow.py
```

---

## Build & Production Deployment

### Frontend Production Build
```bash
cd frontend
npm run build
npm run start
```
- Creates an optimized production bundle in `.next/` and serves on port `3000`.

### Backend Production Execution
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Error Handling & Validation

- **Pydantic Validation**: Validates all incoming payloads, enforcing positive quantities, valid date windows, and required fields.
- **HTTP 400 (Bad Request)**: Returned on business rule violations (e.g., attempting to join a full team, deleting locked produce, insufficient wallet balance).
- **HTTP 401 (Unauthorized)**: Returned on missing, invalid, or expired JWT credentials.
- **HTTP 403 (Forbidden)**: Returned on role access violations or unauthorized representative actions.
- **HTTP 404 (Not Found)**: Returned when queried entities do not exist.

---

## Security Considerations

1. **Password Protection**: Salted blowfish password hashing using `bcrypt` prevents plain-text credential leaks.
2. **JWT Authorization**: Cryptographically signed access tokens validated per request.
3. **Role Guards**: Strict dependency injection guards enforcing farmer, buyer, and admin role boundaries.
4. **Idempotency**: Prevents duplicate checkouts or double-settlements on the same transaction.
5. **No Exposed Secrets**: Zero hardcoded production credentials in the repository.

---

## Complete End-to-End Example Journey

```
[Step 1: Farmer 1 (Ramesh) - Pimpalgaon Baswant, Nashik]
• Ramesh lists 500 kg Onion (Nasik Red, Grade A, Min Price: ₹25/kg).
• Ramesh creates team "Nashik Premium Onion Alliance" and becomes Representative.
• Produce #1 is locked in team (1/4 slots filled, 500 kg total).

[Step 2: Farmers 2, 3 & 4 Join the Team]
• Suresh (Ozar, 400 kg), Ganesh (Dindori, 350 kg), and Anil (Sinnar, 250 kg) discover the team with >85% compatibility.
• They submit join requests. Ramesh reviews match reasons and approves all three.
• The team reaches exactly 4 members (1,500 kg total) and transitions to 'full'.
• The Smart Collection Centroid is automatically calculated at Central Depot (20.08°N, 73.88°E).

[Step 3: Buyer Discovery & Negotiation]
• Vikram Mehta (AgroFresh Logistics, Mumbai) needs 1,000–2,000 kg Onion Grade A.
• Vikram discovers the 1,500 kg lot and submits an offer of ₹29.50/kg.
• Representative Ramesh counters with ₹31.00/kg.
• All 4 farmers vote 'approved' on the deal.
• Buyer Vikram accepts the counter-offer at ₹31.00/kg.

[Step 4: Sale, Payment & Automatic Settlement]
• Total Gross Value: 1,500 kg × ₹31.00/kg = ₹46,500.00
• Deductions: Shared Freight ₹750.00 | Platform Fee (2%) ₹930.00
• Net Distributable Amount: ₹44,820.00

• Automatic Wallet Payouts:
  - Ramesh (33.33% share, 500 kg)  ==> ₹14,940.00 credited
  - Suresh (26.67% share, 400 kg)  ==> ₹11,952.00 credited
  - Ganesh (23.33% share, 350 kg)  ==> ₹10,458.00 credited
  - Anil   (16.67% share, 250 kg)  ==> ₹7,470.00 credited
  - Reconciliation check: 14940 + 11952 + 10458 + 7470 = ₹44,820.00 (Exact 100.00%)

• Digital Lot Passport LOT-ONI-A8F29C is issued with QR provenance.
• Farmers withdraw their earnings to UPI / Bank.
```

---

## Troubleshooting Guide

1. **Backend Database Connection**: If `sqlite3.OperationalError` occurs, ensure write permissions in `backend/`. For PostgreSQL, verify `DATABASE_URL` credentials.
2. **Frontend API Connection**: If `Failed to fetch` occurs, ensure backend is running at `http://localhost:8000` and `NEXT_PUBLIC_API_URL` is set to `http://localhost:8000/api/v1`.
3. **Leaflet SSR Errors**: Leaflet requires browser `window`. Leaflet components in `LeafletMap.tsx` are wrapped with `next/dynamic(..., { ssr: false })`.
4. **Token Expiration**: If 401 errors persist, clear `localStorage.removeItem("fasaldirect_token")` and log in again.

---

## Known Limitations & Prototype Boundaries

1. **Simulated Payment Gateway**: Payment simulation (`UPI_Simulated_Escrow`) models the complete financial settlement without live banking credentials.
2. **Simulated SMS / OTP**: Mobile authentication uses bcrypt passwords rather than SMS OTP gateways.
3. **Deterministic AI Engine**: The AI Assistant utilizes grounded domain heuristics and explainability algorithms rather than ungrounded generative LLM calls to prevent hallucinated pricing or advice.

---

## Future Enhancements Roadmap

- **Live Payment Gateway Integration**: Razorpay Route / Cashfree automated split settlements.
- **Multilingual Voice Assistant**: Speech navigation in regional languages (Hindi, Marathi, Telugu, Tamil, Kannada).
- **APMC Mandi Price Feeds**: Live integration with Agmarknet APMC mandi benchmark pricing.
- **IoT Quality & Moisture Sensor Integration**: Automated grading using portable digital refraction and moisture meters.
- **Cold Storage Aggregation Nodes**: Partnerships with rural micro-cold-storage providers for extended selling windows.

---

## Quick Start for Developers

```bash
# 1. Start Backend API
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1   # On Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 2. Start Frontend (in a separate terminal)
cd frontend
npm install
npm run dev

# 3. Access Application
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

---

## Contributing & Development Guidelines

1. **Branching**: Create feature branches (`git checkout -b feature/feature-name`).
2. **Code Style**: Follow PEP 8 for Python and Prettier/ESLint for TypeScript.
3. **Testing**: Run `pytest -v backend/tests/test_e2e.py` before submitting pull requests.

---

## License & Project Status

- **Status**: Complete Functional Implementation & Verified E2E Prototype (v1.0.0).
- **License**: Not specified.

---
*FasalDirect — Empowering smallholder farmers through collective bargaining and smart aggregation.*
