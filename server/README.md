# Therapy Appointment Summary Application - Backend API

This is the Express-based Node.js backend for the Therapy Appointment Summary application. It features automated MySQL initialization and connection pooling, standard REST APIs for Therapist and Appointment resources, a centralized global error handler, and a template for future Google Gemini AI integration.

## Technologies Used
- **Node.js** & **Express.js** for REST API structure.
- **MySQL** via `mysql2` driver with promise-based connection pool.
- **dotenv** for configuration management.
- **cors** to allow frontend React connection.
- **nodemon** for auto-reloading during development.

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher recommended)
- [MySQL Server](https://dev.mysql.com/downloads/) active locally

### 2. Configure Environment variables
Rename or update the `server/.env` file:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=therapy_summary_db
```
*Note: Make sure to replace `YOUR_PASSWORD` with your actual local MySQL password.*

### 3. Database Schema Setup
You can set up the database and tables manually by running the SQL commands below in your MySQL terminal.
Alternatively, the backend pool initialization is **fully automated** and will automatically create the database and tables on startup if they do not exist!

```sql
CREATE DATABASE IF NOT EXISTS therapy_summary_db;
USE therapy_summary_db;

CREATE TABLE IF NOT EXISTS therapists (
  therapist_id INT AUTO_INCREMENT PRIMARY KEY,
  therapist_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS appointments (
  appointment_id INT AUTO_INCREMENT PRIMARY KEY,
  therapist_id INT NOT NULL,
  appointment_title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  FOREIGN KEY (therapist_id)
    REFERENCES therapists(therapist_id)
    ON DELETE CASCADE
);
```

### 4. Install Dependencies
Navigate to the `server/` directory and run:
```bash
npm install
```

### 5. Running the Application
To run in **Development Mode** (with nodemon hot-reload):
```bash
npm run dev
```

To run in **Production Mode**:
```bash
npm start
```

---

## API Endpoints Reference

### 1. Therapist APIs

| Method | Endpoint | Description | Request Body (JSON) |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/therapists` | Get list of all therapists | *None* |
| **GET** | `/api/therapists/:id` | Get details of a single therapist | *None* |
| **POST** | `/api/therapists` | Create a new therapist | `{"therapist_name": "Dr. John"}` |
| **PUT** | `/api/therapists/:id` | Update a therapist name | `{"therapist_name": "Dr. John Watson"}` |
| **DELETE** | `/api/therapists/:id` | Delete therapist & cascade appointments | *None* |

### 2. Appointment APIs

| Method | Endpoint | Description | Request Body (JSON) |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/appointments/therapist/:therapistId` | Get all appointments for a therapist | *None* |
| **GET** | `/api/appointments/:id` | Get details of a single appointment | *None* |
| **POST** | `/api/appointments` | Create a new appointment | `{"therapist_id": 1, "appointment_title": "Session 1", "summary": "Improvement..."}` |
| **PUT** | `/api/appointments/:id` | Update an existing appointment | `{"appointment_title": "Session 1 Update", "summary": "New status..."}` |
| **DELETE** | `/api/appointments/:id` | Delete an appointment | *None* |

### 3. AI Services Placeholder

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/generate-summary/:therapistId` | AI placeholder endpoint | *None* |

---

## Testing

### Automated Test Runner
You can run the built-in validation script to verify all 14 standard test scenarios.
Ensure the server is running on `http://localhost:5000` (e.g. `npm run dev`) and run:
```bash
node test-endpoints.js
```

### Manual Testing with Postman
You can import the provided Postman collection into Postman to run individual requests manually:
- Import `server/therapy_appointment_summary.postman_collection.json` file.
