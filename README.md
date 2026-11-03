# 🎓 EventSphere — College Event Management Platform

A full-stack web application for managing college events with student registration via Google Forms.

---

## ✨ Features

### Student Features
- 🔍 Browse and search events with category filters
- 📋 View full event details with countdown timer
- 📝 Register for events (tracked in MongoDB) and redirect to Google Form
- 📊 Personal dashboard showing registered events

### Admin Features
- ➕ Create events with poster image upload
- ✏️ Edit and delete events
- 📈 Admin dashboard with stats and category breakdown
- 🗂️ Manage all events in a data table

### Technical Highlights
- 🔐 JWT authentication with role-based access (student / admin)
- 🖼️ Image upload via Multer (served statically)
- ⏱️ Live countdown timers
- 📱 Fully responsive dark UI (deep navy + indigo + amber)
- 🔔 Toast notifications for all user actions

---

## 🗂️ Folder Structure

```
college-event-platform/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, getMe
│   │   └── eventController.js     # CRUD + registration + stats
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + adminOnly
│   │   └── upload.js              # Multer config
│   ├── models/
│   │   ├── User.js                # name, email, password, role, registeredEvents
│   │   └── Event.js               # Full event schema
│   ├── routes/
│   │   ├── auth.js                # /api/auth/*
│   │   └── events.js              # /api/events/*
│   ├── uploads/                   # Uploaded poster images (auto-created)
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js                  # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── CountdownTimer.jsx
    │   │   ├── EventCard.jsx
    │   │   ├── Loaders.jsx
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── EventDetailPage.jsx
    │   │   ├── EventFormPage.jsx  # Create + Edit (shared)
    │   │   ├── HomePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   └── StudentDashboard.jsx
    │   ├── services/
    │   │   └── api.js             # Axios instance + all API calls
    │   ├── utils/
    │   │   └── helpers.js         # formatDate, formatCurrency, etc.
    │   ├── App.jsx                # Router + Toaster setup
    │   ├── index.css              # Tailwind + custom styles
    │   └── main.jsx
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js v18+
- A MongoDB Atlas account (free tier works)
- Git

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/college-event-platform.git
cd college-event-platform
```

---

### Step 2 — Set up MongoDB Atlas

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign in / sign up
2. Click **"Build a Database"** → choose **Free (M0 Shared)**
3. Choose a cloud provider and region, then click **"Create"**
4. Set a **database username** and **password** (save these!)
5. Under **"Network Access"**, add `0.0.0.0/0` to allow all IPs (or your specific IP)
6. Once created, click **"Connect"** → **"Connect your application"**
7. Copy the connection string — it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
8. Replace `<username>` and `<password>` with your credentials
9. Add `college-events` as the database name:
   ```
   mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/college-events?retryWrites=true&w=majority
   ```

---

### Step 3 — Configure Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env`:
```env
MONGO_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/college-events?retryWrites=true&w=majority
JWT_SECRET=your_very_long_random_secret_key_here_make_it_32+_chars
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ADMIN_SECRET=supersecretadminkey123
```

> 💡 **ADMIN_SECRET** is used to create admin accounts. Keep it private.

Start the backend:
```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000 in development mode
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
```

---

### Step 4 — Configure Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 👤 Creating an Admin Account

Three options:

1. **Signup page** – tick *"I'm an organiser"* and enter the value of `ADMIN_SECRET` from `backend/.env`.
2. **Seed script** – `cd backend && npm run seed` creates `admin@college.edu` / `admin123` plus 4 sample events
   (override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`). Safe to re-run.
3. **API** – `POST /api/auth/register` with `"role": "admin"` and `"adminSecret": "<ADMIN_SECRET>"`.

> Change the seeded admin password before deploying anywhere public.

---

## 📡 API Reference

### Auth Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Private | Get current user |

### Event Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/events` | Public | List events (filter, search, paginate) |
| GET | `/api/events/:id` | Public | Get single event |
| POST | `/api/events` | Admin | Create event (with image) |
| PUT | `/api/events/:id` | Admin | Update event |
| DELETE | `/api/events/:id` | Admin | Soft-delete event |
| POST | `/api/events/:id/register` | Private | Register for event |
| GET | `/api/events/admin/stats` | Admin | Dashboard stats |

#### Query Parameters for `GET /api/events`
- `?category=Tech` — filter by category
- `?search=hackathon` — full-text search
- `?page=1&limit=9` — pagination
- `?sort=-date` — sort (default: `-createdAt`)

---

## 🌐 Deployment

### Backend → Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo, select the `backend/` folder
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Add all environment variables from `.env`
7. Set `CLIENT_URL` to your Vercel frontend URL (e.g., `https://eventsphere.vercel.app`)
8. Deploy

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
5. Deploy

> ⚠️ **CORS**: Make sure `CLIENT_URL` in your backend `.env` matches your Vercel deployment URL exactly.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Notifications | react-hot-toast |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| File Uploads | Multer |
| Dev Server | Nodemon |

---

## 📦 MongoDB Collections

### `users`
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (unique)",
  "password": "String (hashed)",
  "role": "student | admin",
  "registeredEvents": ["ObjectId"],
  "createdAt": "Date"
}
```

### `events`
```json
{
  "_id": "ObjectId",
  "title": "String",
  "description": "String",
  "category": "Tech | Cultural | Sports | Workshop",
  "venue": "String",
  "date": "Date",
  "registrationFee": "Number",
  "googleFormLink": "String",
  "posterImage": "String (path)",
  "createdBy": "ObjectId (User)",
  "registrations": ["ObjectId (User)"],
  "isActive": "Boolean",
  "createdAt": "Date"
}
```

---

## 🔑 Environment Variables Summary

### Backend `.env`
```
MONGO_URI          MongoDB Atlas connection string
JWT_SECRET         Secret for signing JWTs (32+ chars recommended)
PORT               Server port (default: 5000)
NODE_ENV           development | production
CLIENT_URL         Frontend URL for CORS
ADMIN_SECRET       Secret key to create admin accounts via API
```

### Frontend `.env`
```
VITE_API_URL       Backend API base URL
```

---

## 🧪 Testing the App

1. **Register a student** via the Signup page
2. **Create an admin** via the signup checkbox or `npm run seed` (see above)
3. **Log in as admin** → Create a sample event with a Google Form link
4. **Log in as student** → Browse events, click Register
5. The Google Form will open in a new tab after registration

---

## 📄 License

MIT — Free to use and modify.
