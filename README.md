# Student Portfolio & Full-Stack Task Management Application

[![CI Pipeline](https://github.com/rituchaudhary-07/student-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/rituchaudhary-07/student-portfolio/actions/workflows/ci.yml)

A full-stack application built with React (Vite), Express.js, MongoDB, with in-memory caching, event-driven background processing, and Docker orchestration.

---

## 🐳 Running with Docker Compose (Practical 11)

The entire full-stack application (Frontend, Backend API, and MongoDB) can be run using a single command:

```powershell
docker-compose up --build
```

### Services & Port Mappings:
- **Frontend (React + Vite):** http://localhost:5173
- **Backend API (Node/Express):** http://localhost:5000
- **Database (MongoDB):** `mongodb://mongodb:27017/task-manager`

To stop the containers:
```powershell
docker-compose down
```

---

## 💻 Running Locally without Docker

1. **Start Backend Server:**
   ```powershell
   npm run server
   ```
2. **Start Frontend Client:**
   ```powershell
   npm run dev
   ```
