## Data Models (`src/models` Folder)

This folder contains the Mongoose schemas. These models act as the strict blueprints and gatekeepers for our database operations.

### 1. `provider.model.js` (The Service Providers)
* **What it is:** Stores the configurations and current states of the 8 service providers.
* **Important Logic:** * `quota`: Strictly defaults to `10` with a minimum constraint of `0`.
  * `lastAssignedAt`: Stored as a `Date` object. This is a crucial metric for the Round-Robin algorithm, ensuring leads are fairly assigned to the provider who has been waiting the longest.

### 2. `lead.model.js` (Customer Inquiries)
* **What it is:** Records the data submitted by customers requesting services.
* **Important Logic:** It contains an `assignedProviders` array storing ObjectIds. This creates a relational link indicating exactly which 3 providers received the lead. 

### 3. `webhookLog.models.js` (Idempotency Tracker)
* **What it is:** Logs the "Transaction IDs" of incoming webhook payment requests.
* **Benefits:** This is the core pillar of our Idempotency implementation. If a `transactionId` already exists in this collection, the database will reject duplicate processing, ensuring provider quotas are not accidentally reset multiple times for the same payment.