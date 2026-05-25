# Frontend Architecture & Implementation Details

This repository contains the frontend implementation of the Provider Lead Allocation System. It is built using **React (via Vite)** for fast compilation and optimized bundling. The architecture is designed to be a lightweight, responsive Single Page Application (SPA) that seamlessly handles real-time data updates and complex backend integrations.

## Core Architecture & Routing

### `src/App.jsx` (Application Shell & Routing)
* **What it is:** The root component that houses the Navigation Bar and implements `react-router-dom` to switch between different views.
* **Why we use it:** To create a Single Page Application (SPA) experience.
* **Benefits:** Users can navigate between the Customer Form, Live Dashboard, and Test Tools instantly without triggering a full page reload. This preserves the WebSocket connection and provides a native-app-like user experience.

---

## Pages Breakdown (`src/pages/`)

### 1. `LeadForm.jsx` (Customer Input Interface)
* **What it is:** The public-facing interface where customers submit their service requests.
* **Important Logic:** * Implements **Controlled Components** in React to manage form state securely.
  * Captures backend HTTP status codes to provide graceful error handling. If the backend throws a `400 Bad Request` (e.g., a duplicate lead or insufficient provider quota), the UI intercepts it and displays a clean, user-friendly error message rather than breaking the application.
* **Benefits:** Prevents submission of empty fields through HTML5 validation and ensures users get immediate, clear feedback (Success in Green, Errors in Red) while the submit button is disabled during the API call to prevent accidental double-clicks.

### 2. `Dashboard.jsx` (Real-Time Provider View)
* **What it is:** The core requirement of the assignment (Feature 3 & 4). It displays the live status of all 8 providers, their remaining quotas, and the list of leads assigned to them.
* **Important Logic (WebSockets over Polling):** * Instead of using HTTP Polling (which blasts the server with continuous API requests every few seconds), this component establishes a persistent **Socket.io** connection on mount.
  * It listens for the `dashboardUpdate` broadcast from the backend. When heard, it silently refetches the data in the background and updates the React State.
* **Benefits:** Fulfills the strict requirement that the dashboard must update *automatically without a page refresh*. It is highly efficient, network-friendly, and ensures the manager always sees the most accurate, real-time allocation of leads.

### 3. `TestTools.jsx` (Developer & Evaluation Control Room)
* **What it is:** A dedicated, isolated panel built specifically for the evaluator to test the system's edge cases without relying on terminal commands or third-party tools like Postman.
* **Important Logic:**
  * **Database Seeding:** A single button to securely wipe old data and inject the 8 default providers.
  * **Concurrency Stress Test:** Triggers the `/bulk-leads` backend endpoint to simulate 10 simultaneous users, validating the atomic `$inc` database locking mechanism.
  * **Idempotency Webhook Simulation:** Allows the evaluator to fire manual Transaction IDs to reset quotas. Firing the exact same ID twice will visually demonstrate the system catching the duplicate request.
* **Benefits:** It strictly adheres to the assignment rule: *"Webhook logic must not be triggered from normal user UI"*. By isolating this in `/test-tools`, we keep the customer and provider UIs perfectly clean and realistic while providing a playground to test complex system limits.

---

## Key Technical Decisions

1. **Vite over Create React App (CRA):** Vite provides significantly faster Hot Module Replacement (HMR) and optimized build times compared to Webpack-based CRA.
2. **Axios over Fetch API:** Axios automatically parses JSON responses and provides cleaner error handling (rejecting promises on 4xx/5xx status codes), which makes handling backend constraints much more predictable in the UI components.
3. **Inline Styling:** As per the assignment guidelines (*"Keep the implementation simple... No complex styling needed"*), styling is handled via standard inline CSS and semantic HTML tables to prioritize functionality and logic over cosmetic design.