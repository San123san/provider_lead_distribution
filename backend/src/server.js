//server.js
import dotenv from 'dotenv'
import connectDB from "./db/mongoDatabase.js"
import { app } from "./app.js"

// For Socket import
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config({
  path:'./.env'
})

connectDB()
.then(() => {
  // 1. Express app ko HTTP server ke andar wrap karo
  const httpServer = createServer(app);

  // 2. Socket.io initialize karo aur CORS allow karo
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173", // React app ka URL
      credentials: true
    }
  });

  // 3. 'io' ko app ke andar save kar do taaki controllers isko use kar sakein
  app.set("io", io);

  io.on("connection", (socket) => {
    console.log("Frontend connected to Socket.io:", socket.id);
  });

  // 4. app.listen ki jagah httpServer.listen use karo
  httpServer.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running at port: ${process.env.PORT || 8000}`);
  });
})
.catch((err) => {
  console.log("MONGO db connection failed !!!", err);
});