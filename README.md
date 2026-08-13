# Therapy Appointment Summary Application

A professional, clinical-grade management platform for therapists to track patient caseloads, log individual appointments, and generate secure AI consolidated clinical "Summary of Summaries". 

Built with React (Vite) on the frontend and Node.js (Express) with MySQL on the backend.

---

## Installation Steps

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)
* [MySQL Server](https://dev.mysql.com/downloads/installer/)

### 1. Database Setup
Ensure MySQL is running. Connect to MySQL and create the database (or the backend will attempt to initialize it automatically on startup):
```sql
CREATE DATABASE IF NOT EXISTS therapy_summary_db;
```

### 2. Backend Setup
1. Open a terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `server/.env` (see below).
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the root directory:
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the client development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at `http://localhost:5173`.

---

## Environment Variables

Create a `.env` file in the `server/` directory and configure the following variables:

```ini
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_DATABASE_PASSWORD
DB_NAME=therapy_summary_db
OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
```

---

## API Endpoints

### 1. Therapists

#### **GET /api/therapists**
Retrieve a list of all therapist profiles.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "therapist_id": 1,
        "therapist_name": "Dr. Sarah Smith",
        "specialization": "Trauma Recovery",
        "description": "Specializes in EMDR and PTSD clinical recovery.",
        "profile_image": "https://images.unsplash.com/photo-...",
        "created_at": "2026-08-12T05:00:00.000Z"
      }
    ]
  }
  ```

#### **POST /api/therapists**
Create a new therapist profile.
* **Request Body**:
  ```json
  {
    "therapist_name": "Dr. Sarah Smith",
    "specialization": "Trauma Recovery",
    "description": "Specializes in EMDR and PTSD clinical recovery.",
    "profile_image": "/images/sarah_williams.png",
    "experience_years": 12,
    "location": "Bangalore",
    "availability_status": "Available Today"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Therapist created successfully",
    "data": {
      "therapist_id": 1,
      "therapist_name": "Dr. Sarah Smith",
      "specialization": "Trauma Recovery",
      "description": "Specializes in EMDR and PTSD clinical recovery.",
      "profile_image": "/images/sarah_williams.png",
      "experience_years": 12,
      "location": "Bangalore",
      "availability_status": "Available Today"
    }
  }
  ```

#### **PUT /api/therapists/:id**
Update an existing therapist profile.
* **Request Body**:
  ```json
  {
    "therapist_name": "Dr. Sarah J. Smith",
    "specialization": "Trauma Recovery & EMDR"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Therapist updated successfully",
    "data": {
      "therapist_id": 1,
      "therapist_name": "Dr. Sarah J. Smith",
      "specialization": "Trauma Recovery & EMDR",
      "description": "Specializes in EMDR and PTSD clinical recovery.",
      "profile_image": "https://images.unsplash.com/photo-..."
    }
  }
  ```

#### **DELETE /api/therapists/:id**
Remove a therapist profile (cascade deletes all associated appointments).
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Therapist deleted successfully"
  }
  ```

---

### 2. Appointments

#### **GET /api/appointments/therapist/:id**
Retrieve all appointments logged under a specific therapist ID, sorted by latest date and time.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "appointment_id": 5,
        "therapist_id": 1,
        "appointment_title": "Cognitive Reframing Session",
        "summary": "Patient explored negative automatic thoughts and began cognitive reconstruction exercises.",
        "appointment_date": "2026-08-15",
        "appointment_time": "10:30",
        "created_at": "2026-08-12T06:00:00.000Z"
      }
    ]
  }
  ```

#### **POST /api/appointments**
Log a new appointment.
* **Request Body**:
  ```json
  {
    "therapist_id": 1,
    "appointment_title": "Cognitive Reframing Session",
    "summary": "Patient explored negative automatic thoughts and began cognitive reconstruction exercises.",
    "appointment_date": "2026-08-15",
    "appointment_time": "10:30",
    "status": "Scheduled"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Appointment created successfully",
    "data": {
      "appointment_id": 5,
      "therapist_id": 1,
      "appointment_title": "Cognitive Reframing Session",
      "summary": "Patient explored negative automatic thoughts and began cognitive reconstruction exercises.",
      "appointment_date": "2026-08-15",
      "appointment_time": "10:30",
      "status": "Scheduled"
    }
  }
  ```

#### **PUT /api/appointments/:id**
Update an existing appointment.
* **Request Body**:
  ```json
  {
    "appointment_title": "Advanced Cognitive Reframing",
    "summary": "Deep-dive session investigating core beliefs. Significant progress achieved."
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Appointment updated successfully",
    "data": {
      "appointment_id": 5,
      "therapist_id": 1,
      "appointment_title": "Advanced Cognitive Reframing",
      "summary": "Deep-dive session investigating core beliefs. Significant progress achieved.",
      "appointment_date": "2026-08-15",
      "appointment_time": "10:30"
    }
  }
  ```

#### **DELETE /api/appointments/:id**
Delete an appointment log.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Appointment deleted successfully"
  }
  ```

---

### 3. Recent Activities

#### **GET /api/activities**
Get the latest 10 logs of modifications across therapists and appointments.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "activity_id": 12,
        "activity_type": "Appointment Added",
        "activity_message": "Appointment Added",
        "formatted_time": "10:30 AM",
        "created_at": "2026-08-12T06:00:00.000Z"
      }
    ]
  }
  ```

---

### 4. AI Consolidation

#### **POST /api/generate-summary/:therapistId**
Consolidate all logs for a therapist using AI into a single clinical synthesis.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "therapistId": 1,
    "summary": "Over the logged sessions, the patient demonstrated progress in recognizing automatic negative thoughts. Focus was placed on emotional regulation..."
  }
  ```

---

## Backend Validation Errors

Validation failures return status code `400 Bad Request` with:
```json
{
  "success": false,
  "message": "Validation error"
}
```
