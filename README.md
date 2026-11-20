# ECE Connect - Electronics & Communication Engineering Department Platform

> **ECE Connect** is a departmental operating system and engagement platform designed for students, faculty, and administrative leadership of the Electronics and Communication Engineering (ECE) department.

---

## 🌟 Key Features

1. **Personalized Dashboard & Role Experience:**
   - Tailored KPIs for **Students**, **Faculty Members**, **Student President**, and **Department Admin (HOD)**.
   - Built-in **1-Click Persona Switcher** in the top navigation bar to test any role instantly.
   - Live Indian Standard Time (`Asia/Kolkata`) digital clock and academic calendar widget.

2. **Student Hackathons & Achievement Tracking:**
   - Submit hackathon wins, research paper publications, technical competitions, certifications, and awards.
   - Certificate evidence preview, team member credits, and multi-tier points attribution.
   - Two-tier verification workflow: President and Faculty review queues with audit rejection/approval feedback.

3. **Gamification, Points Ledger & Fair Leaderboards:**
   - Non-negative, immutable **Point Ledger** with strict transactional consistency.
   - Unlockable departmental badges (*Hackathon Veteran*, *Paper Pioneer*, *Department Contributor*).
   - Real-time departmental leaderboards filterable by batch year and overall standings.

4. **Classroom Issue & Equipment Ticketing:**
   - Report malfunctioning fans, missing whiteboards/markers, broken dusters, faulty HDMI projectors, and electrical faults.
   - Automatic unique tracking IDs: `ECE-ISS-2026-XXXX`.
   - Real-time status lifecycles (`OPEN` -> `IN_PROGRESS` -> `RESOLVED`) with assigned faculty/maintenance coordinators.

5. **Faculty Finder with Dynamic Expected Location:**
   - Search faculty by name, specialization, cabin room, or designation.
   - **Algorithmic Expected Location:** Dynamically computed from official timetable slots and declared office hours in `Asia/Kolkata` time.
   - *Privacy Guaranteed:* Strictly avoids intrusive GPS tracking or physical surveillance.

6. **Master Class Timetable & Conflict Engine:**
   - Department-wide scheduling grid across sections (Year 2, 3, 4, Sections A/B/C).
   - Conflict-detection engine preventing faculty double-booking and room overlap.

7. **Student Queries & Anonymous Feedback:**
   - Submit academic, lab equipment, or examination queries directly to the department.
   - Optional anonymous submission toggle for sensitive student feedback.
   - Threaded response interface for faculty and administrators.

8. **Admin Command Center & Data Analytics:**
   - Interactive Recharts visual analytics (achievement trends, maintenance hotspots, student engagement distributions).
   - Verification queue management for achievements and maintenance requests.

9. **Data Engineering (ETL) Pipeline:**
   - Modular Python/Pandas ETL pipeline (`data_pipeline/etl_pipeline.py`).
   - Extracts operational data, performs schema validation and anomaly cleaning, and loads analytical reporting tables (`DailyEngagementMetric`, `CategoryAnalyticsSnapshot`, `RoomIssueSummary`).
   - Extensible architecture ready for PySpark clustering.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 3, Lucide React, Framer Motion, Recharts, Canvas Confetti |
| **Backend** | Python 3.12, Django 6.1, Django REST Framework, django-cors-headers, Pillow |
| **Database** | PostgreSQL 18 (Local instance on port 5432) / Docker PostgreSQL 16 |
| **Data Engineering** | Python, Pandas, OpenPyXL, SQL Aggregations, Modular ETL Pipeline |
| **Testing** | Django TestCase test suite (`backend/core/tests.py`) |

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- PostgreSQL 16+ running locally on port `5432`

---

### Method A: Local Setup (Recommended for Active Development)

#### 1. Clone the Repository
```bash
git clone https://github.com/PRAJEENS2024/ECE-Connect.git
cd ECE-Connect
```

#### 2. Configure Backend & Database
Ensure your PostgreSQL instance is running with a database named `ece_connect_db`:
```sql
CREATE DATABASE ece_connect_db;
```

Setup Python virtual environment and dependencies:
```bash
python -m venv .venv

# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
```

Run database migrations and seed realistic departmental data:
```bash
python backend/manage.py migrate
python backend/seed_data.py
```

Start the Django REST backend server:
```bash
python backend/manage.py runserver 127.0.0.1:8000
```
Backend will be available at `http://127.0.0.1:8000/`.

---

#### 3. Configure & Start Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Frontend will be live at `http://127.0.0.1:5173/`.

---

### Method B: Docker Compose Setup

Run the entire platform including PostgreSQL, Django API, and Vite React frontend with a single command:
```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 👥 Demo Accounts & Personas

The platform includes a **1-Click Persona Switcher** in the top navigation bar. You can switch between any of the following pre-configured personas without logging out:

| Role | Name | Username | Description |
|---|---|---|---|
| **Student** | Priya Sharma | `priya.ece22` | Final year ECE student, top leaderboard rank, 480 points |
| **Student** | Rohit Verma | `rohit.ece23` | Third year ECE student, robotics hackathon participant |
| **Student President** | Aarav Mehta | `aarav.president` | Department Student President with review & coordination privileges |
| **Faculty** | Dr. Anitha Raman | `anitha.faculty` | Associate Professor, DSP & Wireless Lab coordinator |
| **Faculty** | Dr. K. Raghavan | `raghavan.faculty` | Professor, VLSI Design & Microprocessors |
| **Admin (HOD)** | Dr. Senthil Kumar | `senthil.admin` | Head of Department, full administrative privileges |

*Default password for all demo accounts:* `EceConnect@2026`

---

## 🧪 Running Automated Tests

Run the test suite verifying RBAC permissions, non-negative ledger invariants, timetable conflict detection, expected location calculations, and ETL pipeline idempotency:

```bash
python backend/manage.py test core
```

---

## 📊 Running the Data Engineering (ETL) Pipeline

To execute the data cleaning and analytics aggregation pipeline:

```bash
python data_pipeline/etl_pipeline.py
```

The pipeline extracts records from operational tables, generates data quality validation metrics, and loads aggregated summaries into the analytics schema.

---

## 📁 Repository Structure

```
ECE-Connect/
├── .env.example              # Sample environment variables
├── docker-compose.yml        # Multi-container orchestration
├── requirements.txt          # Python dependencies
├── backend/
│   ├── Dockerfile
│   ├── manage.py
│   ├── seed_data.py          # Complete departmental demo dataset
│   ├── ece_backend/          # Project configuration & settings
│   ├── core/                 # User model, authentication, tests
│   ├── achievements/         # Hackathons, verification workflow
│   ├── gamification/         # Points ledger, badge rules, leaderboards
│   ├── timetables/           # Conflict engine, expected location logic
│   ├── issues/               # Equipment ticketing & maintenance
│   ├── feedback/             # Student queries & response threads
│   └── analytics/            # Reporting snapshots & aggregations
├── data_pipeline/
│   └── etl_pipeline.py       # Modular Pandas ETL pipeline
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── api/              # Axios API client with automatic unwrapping
│   │   ├── components/       # UI modals, layout (Sidebar, Topbar)
│   │   ├── context/          # Authentication & persona context
│   │   ├── pages/            # 8 dedicated functional views
│   │   └── types/            # TypeScript data contracts
└── docs/
    ├── ARCHITECTURE.md       # Technical specs & expected location algorithm
    └── ERD.md                # PostgreSQL schema & Entity-Relationship diagram
```

---

## 📄 License
Developed for the Department of Electronics and Communication Engineering. All rights reserved.
