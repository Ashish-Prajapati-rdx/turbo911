🚨 Turbo911 — Emergency Medical Ecosystem
Turbo911 is a high-density, real-time emergency medical orchestration network designed for high-stress tracking and monitoring. The system bridges the gap between citizens, ambulance fleets, and emergency rooms by utilizing geospatial intelligence and active telemetry synchronization.

🛠️ Tech Stack & Architecture
Frontend: Vite + React + TypeScript + Tailwind CSS + React Router

Backend: Node.js (ES Modules framework) + Express + Socket.io

Database: MongoDB Atlas (Mongoose Object Modeling)

Geospatial Target: 2dsphere indexing for precise sub-meter coordination

🔄 Core Multi-Role Ecosystem Workflows
The application coordinates live telemetry across four distinct, decoupled user viewports:
                              ┌───────────────┐
                              │ Patient View  │ (Open Access)
                              └───────┬───────┘
                                      │
                                      ▼
┌──────────────────┐           ┌──────────────┐          ┌───────────────────┐
│ Ambulance Crew   ├──────────►│  Socket.io   ├─────────►│ Hospital Command  │
│ Live Telemetry   │ (Vitals)  │ Router Hub   │ (Radar)  │ & ER Specialists  │
└──────────────────┘           └──────────────┘          └───────────────────┘

1.Patient / Citizen Portal (/patient/explore)

Open-access geo-explorer targeted at the Indore region (e.g., Vijay Nagar, LIG Square, Bhawarkuan, Palasia).

Leverages MongoDB $nearSphere queries to fetch adjacent healthcare units filtered by real-time distance, live ICU/Oxygen bed availability, and specialist physician shifts.

2.Ambulance Live Console (/ambulance/dashboard)

State console for operational crews allowing real-time triage scoring (CRITICAL, SERIOUS, STABLE).

Features an inline telemetry matrix updating vitals (Heart Rate, Blood Pressure, SpO2) pushed across low-latency network connections.

3.Hospital Command Center (/hospital/dashboard)

Emergency operations workspace featuring bed inventory capacity controllers and an approaching vehicle radar tracking ETAs and incoming vehicle configurations.

4.Doctor Specialist Portal (/doctor/dashboard)

High-density emergency room view focused strictly on live telemetry streams of inbound patients before arrival.
