## Business Logic (`src/controllers` Folder)

Controllers represent the "Brain" of the application. They intercept incoming requests, enforce business rules, interact with the database via Models, and format the final responses.

### 1. `lead.controller.js` (Allocation & Concurrency)
* **Purpose:** Handles incoming customer leads and executes the logic to assign them to exactly 3 eligible providers.
* **Important Logic:**
  * **Round-Robin Allocation:** Pool providers are queried and sorted by their `lastAssignedAt` timestamp to ensure fair distribution.
  * **Concurrency Protection:** To prevent race conditions when multiple leads arrive simultaneously, the quota reduction uses MongoDB's atomic operator (`$inc: { quota: -1 }`). This guarantees quotas never drop below zero, even under heavy stress.
  * **Real-time Trigger:** Upon successful assignment, `io.emit("dashboardUpdate")` is fired to silently update connected clients.

### 2. `provider.controller.js` (Dashboard Aggregation)
* **Purpose:** Aggregates provider statuses and their respective assigned leads to power the live frontend dashboard.
* **Important Logic:** Utilizes native JavaScript sorting (`a.providerId - b.providerId`) post-query. This ensures the dashboard always displays providers sequentially (1 to 8) without risking Mongoose query conflicts.

### 3. `webhook.controller.js` (Idempotent Payment Webhook)
* **Purpose:** Simulates a payment gateway callback that resets all provider quotas back to 10.
* **Important Logic:** **Idempotency Check.** The controller first checks the `WebhookLog` database. If the transaction ID is recognized, it gracefully skips the database update and returns a `200 OK`. This safely handles redundant webhook retries.

### 4. `test.controller.js` (Developer Test Tools)
* **Purpose:** Exposes API endpoints specifically designed to validate assignment constraints (Concurrency and DB Seeding).
* **Important Logic:** The `generateBulkLeads` method utilizes `Promise.all()` to fire 10 concurrent requests in parallel at the exact same millisecond, effectively stress-testing the database's atomic locking mechanisms.