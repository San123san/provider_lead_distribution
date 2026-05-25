## Database Configuration (`src/db` Folder)

This folder contains the logic responsible for establishing a secure and stable connection with the MongoDB database.

### 1. `mongoDatabase.js` (The Connection Manager)
* **What it is:** This module utilizes Mongoose to connect to the MongoDB cluster (Atlas or local).
* **Why we use it:** Establishing a database connection is an asynchronous operation. Abstracting this into a dedicated file keeps `server.js` clean and readable.
* **Benefits:** It includes graceful error handling. If the database connection fails, the process is explicitly terminated (`process.exit(1)`) to prevent the application from running in an unstable state.
* **Important Logic:** It strictly uses environment variables (`process.env.MONGODB_URI`) to ensure sensitive credentials remain secure and are never hardcoded into the repository.