# Prowider Mini Lead Distribution System

**Live Demo URL:** [abc](abc)

## 📖 Overview
This project is a full-stack lead generation and distribution system. It acts as a bridge between customers submitting service enquiries and service providers receiving them. The system strictly enforces predefined business logic, including mandatory provider assignments, fair round-robin distribution for pool providers, monthly quota limits, and real-time dashboard updates.

The primary focus of this architecture is **engineering correctness, database consistency under concurrency, and system reliability**.

---

## ✨ Core Features

* **Feature 1: Public Customer Form** * Captures lead details (Name, Phone, City, Service).
  * Enforces strict database-level duplication rules (Compound Unique Index on `phone` + `service`).
* **Feature 2: Advanced Lead Distribution Logic**
  * Assigns exactly 3 providers per lead.
  * Prioritizes mandatory providers.
  * Distributes remaining slots fairly to pool providers using a time-based Round-Robin algorithm.
  * Strictly respects the maximum monthly quota of 10 leads per provider.
* **Feature 3 & 4: Real-Time Provider Dashboard**
  * Displays remaining quotas, total leads received, and a detailed list of assigned leads.
  * Updates instantly across all connected clients without a page refresh using **WebSockets**.
* **Feature 5: Webhook & Developer Test Tools**
  * An isolated control panel (`/test-tools`) to simulate payment gateway webhooks.
  * Includes tools for instant Database Seeding and Concurrency Stress Testing.

---

## 🛠️ Technology Stack
* **Frontend:** React.js (via Vite)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (using Mongoose ORM)
* **Real-Time Engine:** Socket.io
* **Architecture:** RESTful API, MVC Pattern

---

## 🧠 Core Engineering Concepts (Evaluator Notes)

As per the submission requirements, here is how the critical backend systems were designed:

### 1. Allocation Algorithm (Fairness & Rules)
The allocation happens in a strict two-step process:
1. **Mandatory Assignment:** The system first queries for providers marked as `mandatoryFor` the requested service whose `quota` is strictly `> 0`. It assigns them up to the required 3 slots.
2. **Fair Round-Robin (Pool Allocation):** If slots remain (less than 3 providers assigned), it queries the `poolFor` providers whose `quota > 0`. To ensure fair rotation, this query is sorted by `lastAssignedAt` in ascending order (`1`). This guarantees that the provider who has waited the longest gets the next lead. Upon assignment, the `lastAssignedAt` timestamp is updated to the current time.

### 2. Concurrency Handling
Handling simultaneous requests (e.g., 10 users submitting a form at the exact same millisecond) is managed at the database level to prevent race conditions. 
* Instead of reading the quota, subtracting in JavaScript, and saving it back (which causes race conditions), the system uses MongoDB's atomic operator: `$inc: { quota: -1 }`.
* This ensures that the database applies a strict lock during the update operation. Even under heavy concurrent loads, the quota will never drop below 0, and the database remains mathematically consistent.

### 3. Webhook Idempotency & Safety
Payment webhooks are notoriously unreliable and may send the same success payload multiple times. 
* **Idempotency Key:** We use the `transactionId` as an idempotency key.
* **The Log Model:** Every incoming webhook is logged in a `WebhookLog` collection which has a `unique` index on `transactionId`.
* **Execution:** Before resetting the provider quotas to 10, the controller checks if the `transactionId` exists. If it does, the system halts the DB update and safely returns a `200 OK` (to satisfy the payment gateway) without duplicating the quota reset. MongoDB's `11000` Duplicate Key Error is also caught to prevent concurrent identical webhooks from bypassing the initial read check.

---

## 🚀 Installation & Setup Instructions

### Prerequisites
* Node.js installed on your machine
* A MongoDB cluster URI (Atlas or Local)

### 1. Backend Setup
```bash
cd backend
npm install 
```

## Create a `.env` file in the `backend` directory and add your MongoDB connection string:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/prowider-assignment
CORS_ORIGIN=http://localhost:5173
```
```
To run backend:
npm start
```

### 2. Frontend Setup

Open a new terminal and navigate to the frontend folder:

```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing Guide for Evaluators

Once both servers are running, please follow these steps to test the strict requirements:

1. **Seed the Database (Mandatory First Step):**
   * Navigate to `http://localhost:5173/test-tools`
   * Click **"🌱 Seed / Reset Database"**. This will populate the 8 providers with a 10/10 quota.

2. **Check Real-time Capabilities:**
   * Open `http://localhost:5173/dashboard` in one browser window.
   * Open `http://localhost:5173/` (Customer Form) in another.
   * Submit a lead. Watch the dashboard update instantly without refreshing.

3. **Test Concurrency:**
   * Go to `/test-tools` and click **"🧨 Generate 10 Leads"**. This fires 10 simultaneous requests.
   * Check the dashboard to verify that quotas dropped correctly and no provider dropped below 0.

4. **Test Webhook Idempotency:**
   * Go to `/test-tools` and enter a transaction ID (e.g., `TXN-001`). Click **Call Webhook**. The dashboard quotas will reset to 10.
   * Click it again with the exact same ID. The terminal will log that idempotency was caught, and quotas will safely remain unchanged.

5. **Test Duplicate Lead Rules:**
   * Submit a lead with Phone `9999999999` for `Service 1`.
   * Try submitting the exact same Phone and Service again. The UI will elegantly reject it based on database unique indexing constraints.