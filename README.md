# 🔗 TeenyURL — Production-Ready URL Shortener

TeenyURL is a full-stack, production-grade URL shortening service designed for **low-latency redirection, scalable analytics, and seamless user experience** — with or without authentication.

---

## 🚀 Live Demo

* 🌐 **Frontend**: *https://teeny-url-six.vercel.app/*
* 🔗 **Backend API**: *https://teenyurl-production.up.railway.app*

---

## 📸 Screenshots

<p align="center">
  <img width="615" src="https://github.com/user-attachments/assets/cccb3d1e-acc9-4da0-9117-8bbd5f1ac624" />
  <br/>
  <strong>Login/Signup page</strong>
</p>
## 📸 Screenshots

<p align="center">
  <img width="1042" src="https://github.com/user-attachments/assets/d859bdc7-3ed2-416b-a8ae-16788e40cc31" />
  <br/>
  <strong>Dashboard Overview with Total Links</strong>
</p>

<p align="center">
  <img width="881" src="https://github.com/user-attachments/assets/c5f93b4d-4679-4aea-9843-58b40ab767b2" />
  <br/>
  <strong>URL Shortening Interface with Custom Alias and Expiry Options</strong>
</p>

<p align="center">
  <img width="807" src="https://github.com/user-attachments/assets/d4d2b881-4e73-4b19-847b-353e93eeb207" />
  <br/>
  <strong>Listing all User Links</strong>
</p>

<p align="center">
  <img width="582" src="https://github.com/user-attachments/assets/5b6c3d9f-fd3e-4f32-909d-62cf5545dcc2" />
  <br/>
  <strong>Device, Browser analytics for Links</strong>
</p>


---

## ✨ Features

### 🔹 Core Functionality

* Shorten long URLs instantly
* Custom alias support (e.g. `/my-link`)
* Optional expiration for links
* QR code generation for every short URL

### 🔹 Authentication (Optional)

* Use without login (anonymous users supported)
* JWT-based authentication for registered users
* Persistent tracking via `client_id` for anonymous users

### 🔹 Analytics

* Track clicks per short URL
* Device, browser, OS detection
* Time-series analytics
* Top performing links dashboard

### 🔹 Performance & Scalability

* ⚡ Low-latency redirects using Redis caching
* 🚦 Token bucket rate limiting to prevent abuse
* 🔄 Asynchronous analytics processing using background worker

---

## 🧠 System Design Overview

### High-Level Architecture

```
Client → API Server → Redis (Cache + Queue) → Worker → PostgreSQL
```

---

### 🔁 Request Flow

#### 1. URL Shortening

```
User → POST /shorten → Generate Base62 code → Store in DB → Return short URL + QR
```

#### 2. Redirection

```
User → /:code → Check Redis cache → Redirect instantly
                           ↓
                   Push analytics event → Redis queue
```

#### 3. Analytics Processing

```
Worker → Consume Redis queue → Parse user-agent → Store in PostgreSQL
```

---

## ⚙️ Tech Stack

### Backend

* Node.js + Express
* PostgreSQL (Neon)
* Redis (Upstash)

### Frontend

* React (Vite)
* Modern UI with responsive design

### Infrastructure

* Backend + Worker: Railway
* Frontend: Vercel

---

## 🔥 Key Engineering Decisions

### 1. ⚡ Redis for Low Latency

* Frequently accessed URLs cached in Redis
* Avoids DB lookup on every redirect

---

### 2. 🔄 Asynchronous Analytics Pipeline

* Redirect is **non-blocking**
* Analytics handled via background worker
* Improves response time significantly

---

### 3. 🪣 Token Bucket Rate Limiting

* Prevents abuse under high traffic
* Handles burst traffic efficiently

---

### 4. 👤 Dual User Handling

* Logged-in users → tracked via `user_id`
* Anonymous users → tracked via `client_id`

---

### 5. 🔢 Base62 Encoding

* Generates short, URL-friendly codes
* Efficient mapping from numeric IDs

---

## 📊 Database Schema

### URLs Table

* `id`
* `short_code`
* `long_url`
* `user_id`
* `client_id`
* `created_at`
* `expires_at`

---

### Analytics Table

* `short_code`
* `clicked_at`
* `browser`
* `os`
* `device`
* `ip`

---

## 🛠️ Local Setup

### 1. Clone repo

```bash
git clone https://github.com/<your-username>/teenyurl.git
cd teenyurl
```

---

### 2. Backend setup

```bash
npm install
```

Create `.env`:

```env
DATABASE_URL=...
JWT_SECRET=...
UPSTASH_URL=...
UPSTASH_TOKEN=...
BASE_URL=http://localhost:3000
```

Run backend:

```bash
node index.js
```

---

### 3. Worker setup

```bash
node worker/worker.js
```

---

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🌍 Deployment

### Backend & Worker

* Hosted on Railway
* Separate services for API and worker

### Frontend

* Hosted on Vercel
* Environment variable:

```env
VITE_API_URL=https://your-backend-url
```

---

## 🚨 Challenges & Learnings

* Handling **anonymous vs authenticated users** cleanly
* Designing **non-blocking analytics pipeline**
* Managing **multi-service deployment (API + worker)**
* Debugging **CORS, routing conflicts, and environment configs**
* Ensuring **correct URL generation (BASE_URL issues in production)**
