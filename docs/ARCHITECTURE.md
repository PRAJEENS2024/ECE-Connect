# ECE Connect - System Architecture & Technical Specifications

## 1. System Overview

**ECE Connect** is a production-minded departmental operating system built specifically for the Electronics and Communication Engineering (ECE) department of an engineering college. It integrates student achievements, faculty availability, classroom maintenance ticketing, academic queries, timetable schedules, and departmental data analytics into a cohesive, role-governed platform.

```
+------------------------------------------------------------------------------------+
|                                    CLIENT LAYER                                    |
|   Vite + React 19 + TypeScript + Tailwind CSS 3 + Recharts + Framer Motion         |
|   Role-aware UI (Student, Faculty, President, Admin) + 1-Click Persona Switcher    |
+-----------------------------------------+------------------------------------------+
                                          | REST API (Axios client with CSRF & JWT)
                                          v
+------------------------------------------------------------------------------------+
|                                   BACKEND LAYER                                    |
|   Django 6.1 + Django REST Framework                                               |
|   - core: Custom User model, Roles (STUDENT, FACULTY, PRESIDENT, ADMIN)            |
|   - achievements: Verification workflow, certificates, team attribution           |
|   - gamification: Non-negative points ledger, badge criteria, dynamic leaderboard  |
|   - timetables: Conflict detection, dynamic expected faculty location              |
|   - issues: Hardware/classroom tracking (ECE-ISS-2026-XXXX)                        |
|   - feedback: Anonymous queries, threaded faculty/admin responses                  |
|   - analytics: Recharts-ready aggregation endpoints                                |
+-----------------------------------------+------------------------------------------+
                                          |
                     +--------------------+--------------------+
                     |                                         |
                     v                                         v
+--------------------------------------+   +-----------------------------------------+
|           DATA STORAGE               |   |        DATA ENGINEERING (ETL)           |
|  PostgreSQL 18 (Port 5432)           |   |  data_pipeline/etl_pipeline.py          |
|  - Relational schemas with FKs       |   |  - Automated extraction via Django ORM  |
|  - Check constraints & unique index  |   |  - Pandas data cleaning & validation    |
|  - Immutable audit points ledger     |   |  - Idempotent upsert into snapshots     |
|  - Asia/Kolkata timezone support     |   |  - PySpark modular interface ready      |
+--------------------------------------+   +-----------------------------------------+
```

---

## 2. Role-Based Access Control (RBAC) Matrix

| Feature / Action | Student | Faculty Member | Student President | Department Admin (HOD) |
|---|---|---|---|---|
| **View Dashboard & Personal KPIs** | Yes (Own stats) | Yes (Assigned duties) | Yes (Departmentwide) | Yes (Full metrics) |
| **Submit Achievement** | Yes | No | Yes | Yes |
| **Verify / Reject Achievement** | No (Enforced) | Yes (Departmental) | Yes | Yes |
| **Leaderboard Visibility** | Yes | Yes | Yes | Yes |
| **Report Classroom Issue** | Yes | Yes | Yes | Yes |
| **Update Issue Status & Assignee** | No | Yes (Assigned) | Yes | Yes |
| **Submit Query / Feedback** | Yes (Optionally Anon) | No | Yes | Yes |
| **Respond to Student Query** | No | Yes (Department) | Yes | Yes |
| **Faculty Finder & Schedule** | Yes | Yes | Yes | Yes |
| **Update Faculty Availability** | No | Yes (Self only) | Yes | Yes |
| **Manage Timetable & Allocations** | No | No | Yes | Yes |
| **View Command Center Analytics** | No | No | Yes | Yes |
| **Run Data Engineering Pipeline** | No | No | Yes | Yes |

---

## 3. Faculty Finder: Expected Location Algorithm

The system computes the **live expected location** of every faculty member dynamically based on the current day and time in `Asia/Kolkata` (`UTC+05:30`), avoiding any intrusive physical GPS/surveillance tracking:

```
+-------------------------------------------------------------+
| Query Current IST Time (e.g. Wednesday 11:30 AM)            |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Check Faculty Active Timetable Slots for Day = Wednesday    |
| WHERE start_time <= 11:30 <= end_time                       |
+------------------------------+------------------------------+
         |                                            |
      (Match)                                      (No Match)
         v                                            v
+----------------------------------+   +----------------------------------+
| Status: IN_CLASS / IN_LAB        |   | Check Availability Preference:   |
| Location: e.g. "Lab 2 (DSP Lab)" |   | - OFFICE_HOURS -> "Cabin 304"    |
| Subject: "EC8501 - DSP"          |   | - BUSY / MEETING -> "Unavailable"|
| Activity: Scheduled Class        |   | - ON_LEAVE -> "On Leave"         |
| Source: Published Timetable Grid |   | - AVAILABLE -> "Faculty Cabin"   |
+----------------------------------+   +----------------------------------+
```

> **Privacy Disclaimer (Enforced in UI and API):**
> *Expected locations are computed algorithmically from officially published departmental timetable schedules and declared office hours. The system strictly avoids any hardware GPS tracking, Wi-Fi tri-angulation, or physical surveillance.*

---

## 4. Timetable Conflict Detection Engine

The backend rejects schedule collisions at both the model validation level and API endpoint level:
1. **Faculty Collision Check:** A faculty member cannot be assigned to two classes simultaneously (`day_of_week` and overlapping `[start_time, end_time]`).
2. **Room Collision Check:** A classroom/lab room cannot host two sections at the same time.
3. **Database Constraints:** Composite unique constraints ensure timetable integrity.

---

## 5. Gamification & Points Ledger Engine

- Every approved achievement awards non-negative points according to tier (`COLLEGE`: 50 pts, `STATE`: 100 pts, `NATIONAL`: 250 pts, `INTERNATIONAL`: 500 pts).
- The `PointLedger` is strictly append-only: points cannot be manually edited or artificially inflated.
- Badges are automatically unlocked when students fulfill criteria (e.g., *Hackathon Veteran*, *Paper Pioneer*, *Department Contributor*).
- Dynamic SQL rank calculations generate real-time leaderboards by batch, year, and overall standings.

---

## 6. Data Engineering & Analytics Pipeline

- **Extractor:** Queries operational Django tables (`achievements`, `issues`, `point_ledger`, `timetables`).
- **Transformer:** Cleans and normalizes records with Pandas, detects anomalies, and computes KPI aggregations.
- **Loader:** Idempotently upserts aggregated summaries into analytical reporting tables (`DailyEngagementMetric`, `CategoryAnalyticsSnapshot`, `RoomIssueSummary`).
- **Reproducibility:** Logged with timestamped data quality reports and duplicate detection. Ready for PySpark scale-out.
