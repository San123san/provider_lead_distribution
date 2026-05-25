## The Core Backend Setup (`src` Folder)

This directory contains the main initialization files for the Express application, the Node.js server, and the database seeding scripts.

### 1. `app.js` (Application Configuration)
* **What it is:** This file configures the main Express application, setting up necessary middlewares (like CORS and JSON body parsers) and defining the base API routes.
* **Why we use it:** Its primary responsibility is to "prepare" the app, not to start the server. 
* **Benefits:** This decouples the application logic from the network logic. It makes testing significantly easier, as the app can be tested independently without binding to a physical network port.
* **Important Logic:** We utilize `app.set("io", io)` here to store the Socket.io instance globally within the Express app, allowing any controller to trigger real-time events seamlessly.

### 2. `server.js` (The Server Entry Point)
* **What it is:** The actual entry point of the application. It establishes the database connection, creates the HTTP server, initializes Socket.io, and listens on the designated port.
* **Why we use it:** Keeping the Express app and the HTTP server separate makes it much easier to wrap WebSockets (Socket.io) around the standard HTTP server.
* **Benefits:** Clean separation of concerns. Network and connection logic reside here, while routing and middleware reside in `app.js`.

### 3. `seed.js` (Database Setup Script)
* **What it is:** A standalone execution script used to wipe legacy data and populate the database with the 8 default providers (each with a quota of 10).
* **Why we use it:** The assignment strictly requires providers to be "pre-inserted" without exposing an admin UI to regular users.
* **Benefits:** It drastically speeds up the testing and deployment process. A single terminal command resets the entire database to its default, stable state.