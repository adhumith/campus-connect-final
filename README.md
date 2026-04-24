# 🏫 Campus Communication Platform

A full-stack college communication platform built for SREC College, featuring role-based dashboards, course management, assignments, blogs, AI chatbot, and real-time notifications.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | MongoDB + GridFS |
| Cache | Redis (Upstash) |
| Authentication | Firebase Auth |
| AI Chatbot | Google Gemini + Pinecone (RAG) |
| File Storage | MongoDB GridFS |

---

## ✨ Features

### 🔐 Authentication
- Firebase Email/Password authentication
- Only `@srec.ac.in` emails allowed
- Role-based access control (Admin / Staff / Student)
- Forgot password via email
- Change password from dashboard

### 👥 User Management (Admin)
- Create single users
- Bulk upload via Excel/CSV
- Edit user details
- Delete users
- Search by name, email, roll number
- Filter by role

### 📚 Course Materials
- Upload PDF, PPT, DOC files (stored in MongoDB GridFS)
- Filter by department, class, batch
- Google Classroom-style UI
- Students download materials
- Staff/Admin upload and delete

### 📝 Assignments
- Staff creates assignments with deadlines
- Deadline countdown timer
- Students submit files
- Staff views all submissions
- Expired deadline protection

### ✍️ Blogs
- Students and staff can post blogs
- AI content moderation (Gemini)
- Club-based categories
- Auto notifications on new blog post
- Cover image upload

### 🔔 Notifications
- Auto notifications when blogs are posted
- Admin/Staff send custom notifications
- Target by department, class, batch, role
- Mark as read / Mark all as read

### 🤖 RAG AI Chatbot
- Upload college PDFs to AI knowledge base
- Ask questions about college rules, schedules, syllabus
- Powered by Gemini + Pinecone vector search
- Available to all users

### 🏠 Dashboards
- **Admin** — Stats, user management, full access
- **Staff** — Quick actions, notifications, blogs
- **Student** — Assignments, courses, notifications, blogs

---

## 📁 Project Structure

```
campus-platform/
├── backend/                  # FastAPI Backend
│   ├── app/
│   │   ├── api/routes/       # API endpoints
│   │   ├── core/             # Config, security
│   │   ├── db/               # MongoDB, Redis
│   │   ├── models/           # Data models
│   │   ├── schemas/          # Request/response schemas
│   │   ├── services/         # Business logic
│   │   └── utils/            # Firebase, Pinecone
│   ├── main.py               # FastAPI app entry point
│   ├── .env                  # Environment variables (not committed)
│   └── firebase-admin.json   # Firebase credentials (not committed)
│
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── context/          # Auth context
│   │   ├── pages/
│   │   │   ├── admin/        # Admin pages
│   │   │   ├── staff/        # Staff pages
│   │   │   ├── student/      # Student pages
│   │   │   └── auth/         # Login page
│   │   ├── utils/            # API helper
│   │   └── firebase.js       # Firebase config
│   └── package.json
│
├── run.bat                   # One-click startup script
├── .gitignore
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 20+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/adhumith/campus-connect-final.git
cd campus-connect-final
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file in backend folder:
```env
MONGO_URL=your_mongodb_url
REDIS_URL=your_redis_url
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=campusplatform
GOOGLE_API_KEY=your_gemini_api_key
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
APP_ENV=development
DB_NAME=campus_platform
```

Add `firebase-admin.json` to the backend folder (download from Firebase Console → Project Settings → Service Accounts).

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Run the project

**Option 1 — One click (Windows):**
```
Double click run.bat
```

**Option 2 — Manual:**

Terminal 1 (Backend):
```bash
cd backend
uvicorn main:app --reload
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Open 👉 http://localhost:5173

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | test@srec.ac.in | Test1234 |
| Student | student1@srec.ac.in | Welcome@1234 |

> Users created via Admin panel get default password: `Welcome@1234`

---

## 🌐 API Documentation

Once the backend is running, visit:
👉 http://127.0.0.1:8000/docs

---

## 📦 Required Services

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| MongoDB Atlas | Database | ✅ Free |
| Upstash Redis | Caching | ✅ Free |
| Pinecone | Vector DB for AI | ✅ Free |
| Firebase | Authentication | ✅ Free |
| Google AI Studio | Gemini API | ✅ Free (limited) |

---

## 🏗️ Architecture

```
React Frontend (Vite)
        ↓
FastAPI Backend
        ↓
    ┌───┴───┐
    │       │
MongoDB   Redis
GridFS    Cache
    │
Firebase  Pinecone
  Auth     Vector DB
    │
  Gemini AI
```

---

## 🔒 Security Features
- Firebase token verification on every request
- Role-based route protection
- Email domain restriction (@srec.ac.in only)
- API keys stored in environment variables
- Firebase credentials never committed to git

---

## 👨‍💻 Developed By

**Adhumith** — SREC College Campus Platform
- GitHub: [@adhumith](https://github.com/adhumith)

---

## 📄 License

This project is for educational purposes — SREC College Internal Use.
