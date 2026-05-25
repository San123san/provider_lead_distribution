## API Routes (`src/routes` Folder)

This folder maps HTTP endpoints (URLs) to their respective Controller functions.

### 1. `api.routes.js` (The Main Router)
* **What it is:** Acts as the traffic controller for the application. It receives API calls and directs them to the appropriate functions in the `controllers` directory.
* **Why we use it:** Centralizing all endpoints (`/request-service`, `/dashboard`, `/webhook/reset-quota`, `/test/bulk-leads`) in one file makes the API structure highly visible and easy to document.
* **Benefits:** Clean architecture. If the API version needs to be upgraded (e.g., from `v1` to `v2`), developers only need to update the routing configuration without heavily modifying the underlying business logic controllers.