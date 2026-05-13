import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { startAutoResolveJob } from "./jobs/autoResolveOldIssues.js";
import { attachSocket } from "./services/socketService.js";

dotenv.config();

const port = Number(process.env.PORT || 5000);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  socket.on("join:user", (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  socket.on("join:admin-department", (department) => {
    if (typeof department === "string" && department.trim()) {
      socket.join(`admin-department:${department.trim()}`);
    }
  });
});

attachSocket(io);

const startServer = async () => {
  try {
    await connectDatabase();
    startAutoResolveJob();

    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
