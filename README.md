# 🌿 TheraSync – Therapy Appointment & Session Summary Platform

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel&logoColor=white&style=flat-square)](https://therapy-appointment-summary-system.vercel.app)
[![Render Deployment](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=white&style=flat-square)](https://therapy-appointment-summary-system.onrender.com)
[![MySQL/TiDB Cloud](https://img.shields.io/badge/Database-TiDB%20Cloud-blue?logo=mysql&logoColor=white&style=flat-square)](https://en.pingcap.com/tidb-cloud/)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js&logoColor=white&style=flat-square)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

TheraSync is a premium, full-stack MERN & MySQL web application designed to help therapists and clinical managers organize client files, schedule session appointments, record clinical observations, and generate AI-assisted therapy summaries. 

The application utilizes a sleek, dark-themed glassmorphic user interface tailored for professional clinical environments, eliminating distracting clutter while retaining a premium aesthetic.

---

## 🚀 Key Features

*   **👥 Therapist Directory Management**:
    *   Create, view, edit, and delete comprehensive therapist profiles.
    *   Multi-column layouts with specialization, years of experience, email, and biography.
    *   Support for the following specialization categories:
        *   **CBT** (Cognitive Behavioral Therapy)
        *   **Trauma Recovery**
        *   **Family Therapy**
        *   **Mindfulness**
        *   **Child Therapy**
*   **📷 Local File Upload Integration**:
    *   File upload capabilities powered by **Multer** on the backend.
    *   Validates image formats (`.png`, `.jpg`, `.jpeg`, `.webp`) and enforces a maximum size of `5MB`.
    *   Interactive client-side image previewing before profile updates.
*   **📅 Session Appointment Booking**:
    *   Add appointments containing title, time, date, and status (`Scheduled`, `Completed`, `Cancelled`).
    *   Automatic cascade-deletion of appointments when the parent therapist profile is deleted.
*   **🧠 AI-Assisted Session Summaries**:
    *   Generate clinical session summaries utilizing integrated Google Gemini AI templates.
*   **🔒 Robust Storage & Seed Datasets**:
    *   Configured remote connections to TiDB/MySQL Cloud with secure SSL certificates.
    *   Self-healing auto-seeding system: automatically builds and seeds the database with 25 unique, realistic therapist records and 125 scheduled session appointments if startup checks return empty.

---

## 🛠️ Tech Stack

*   **Frontend**: React (Vite-powered SPA), CSS3 (Custom Glassmorphism and Backdrop Blurs), Axios (Multipart/FormData configurations)
*   **Backend**: Node.js, Express.js REST API
*   **Database**: MySQL / TiDB Cloud
*   **File Uploads**: Multer
*   **Deployment**: Vercel (Client Routing redirects configured via `vercel.json`), Render (Node Server hosting)

---

## 📂 Project Structure

```text
TheraSync/
├── public/                 # Static public assets
├── src/
│   ├── components/         # Reusable React components (Modals, Cards, Nav)
│   ├── pages/              # SPA Dashboard pages (Therapists, Insights, Appointments)
│   ├── services/           # Axios network configurations & API mappings
│   ├── index.css           # Global design tokens and UI theme styling
│   └── main.jsx
├── server/
│   ├── config/             # Database connection and initialization settings
│   ├── controllers/        # Express handlers (Therapist, Appointment, Activity controllers)
│   ├── middleware/         # Upload verification (Multer) & error handling middleware
│   ├── routes/             # REST endpoints route declarations
│   ├── services/           # Gemini AI wrapper service
│   ├── uploads/            # Server static storage for therapist images
│   ├── seed-db.js          # Standalone seed utility
│   └── server.js           # Server runner configuration
├── therapists.sql          # Pre-packaged therapists seed script
├── appointments.sql        # Pre-packaged appointments seed script
├── vercel.json             # SPA Routing directives for Vercel deployment
└── package.json
```

---

## 🔧 Installation & Local Setup

### Prerequisites
*   **Node.js** (v18.0.0 or higher)
*   **MySQL Server** or **TiDB Cloud** cluster

### 1. Database Setup
Create a new MySQL database:
```sql
CREATE DATABASE therasync_db;
```

### 2. Backend Installation & Environment Config
Navigate to the `server/` directory:
```bash
cd server
npm install
```
Create a `.env` file inside the `server/` folder and populate the following keys:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=therasync_db
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Database Seeding
To quickly populate the database with 25 therapists and 125 appointments:
```bash
npm run seed
```

### 4. Frontend Installation
Return to the project root directory:
```bash
npm install
```
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Running the Application
Start the backend development server (inside `server/`):
```bash
npm run dev
```
Start the frontend development server (inside root directory):
```bash
npm run dev
```

---

## 🔗 REST API Endpoints

### 👥 Therapists
*   `GET /api/therapists` — Fetch all therapist profiles.
*   `GET /api/therapists/:id` — Fetch single therapist profile details.
*   `POST /api/therapists` — Create a profile (`multipart/form-data` with `profileImage` file).
*   `PUT /api/therapists/:id` — Update a profile (`multipart/form-data` with `profileImage` file).
*   `DELETE /api/therapists/:id` — Delete a therapist and cascade-delete their appointments.

### 📅 Appointments
*   `GET /api/appointments` — Fetch all appointments.
*   `POST /api/appointments` — Schedule a new session appointment.

### 📝 Insights & AI
*   `GET /api/insights` — Retrieve platform activity statistics and category analytics.
*   `POST /api/generate-summary` — Process session outlines and generate AI summaries.

### 🔧 Diagnostics
*   `GET /api/debug/database` — Check table statistics, row counts, and active connections.

---

## 🛡️ License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🧑‍💻 Author

Developed with care by **Dhanush Ragava R V**.
For issues, feature requests, or contributions, feel free to open a Pull Request.
