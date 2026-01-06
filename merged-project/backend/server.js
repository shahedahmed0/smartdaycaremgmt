const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const { createServer } = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const fs = require("fs");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
  }
});

// Enable CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created uploads directory");
}

// Serve static files
app.use("/uploads", express.static(uploadsDir));

// Import Routes
const authRoutes = require("./routes/authRoutes");
const childRoutes = require("./routes/childRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const staffActivityRoutes = require("./routes/staffActivityRoutes");
const activityRoutes = require("./routes/activityRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const chatRoutes = require("./routes/chatRoutes");
const billingRoutes = require("./routes/billingRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/children", childRoutes);
app.use("/api/users", userRoutes);
app.use("/api/staff-activities", staffActivityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reports", reportRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    message: "Smart Daycare Backend is running",
    modules: [
      "Authentication & Authorization",
      "Child Management",
      "User Management",
      "Activity Management & Photos",
      "Parent Notifications",
      "Parent-Staff Chat (Real-time)",
      "Billing & Invoicing",
      "Analytics & Reporting",
      "Admin Dashboard",
      "Daily Reports",
      "Staff Profile Management"
    ],
    timestamp: new Date()
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Smart Daycare Management API is running!",
    version: "1.0.0",
    project: "Smart Daycare Management and Parent Monitoring System",
    availableEndpoints: {
      auth: "/api/auth",
      children: "/api/children",
      activities: "/api/activities",
      notifications: "/api/notifications",
      chats: "/api/chats",
      billing: "/api/billing",
      analytics: "/api/analytics",
      admin: "/api/admin",
      reports: "/api/reports"
    },
  });
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("🔌 New socket connection:", socket.id);

  // User goes online
  socket.on("user_online", ({ userId, role }) => {
    socket.userId = userId;
    socket.userRole = role;

    // Join user to their personal room
    socket.join(`user_${userId}`);

    // Broadcast user online status
    socket.broadcast.emit("user_status", {
      userId,
      status: "online"
    });

    console.log(`👤 User ${userId} (${role}) is online`);
  });

  // User joins a chat room
  socket.on("join_chat", (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`Socket ${socket.id} joined chat: ${chatId}`);
  });

  // Send message
  socket.on("send_message", (messageData) => {
    const { chatId, senderId, content } = messageData;

    // Emit to all users in the chat room except sender
    socket.to(`chat_${chatId}`).emit("receive_message", messageData);

    // Also emit to sender for immediate UI update
    socket.emit("receive_message", messageData);

    console.log(`💬 Message in chat ${chatId} from ${senderId}: ${content.substring(0, 50)}...`);
  });

  // Typing indicator
  socket.on("typing", ({ chatId, userId, isTyping }) => {
    socket.to(`chat_${chatId}`).emit("user_typing", {
      userId,
      chatId,
      isTyping
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    if (socket.userId) {
      // Broadcast user offline status
      socket.broadcast.emit("user_status", {
        userId: socket.userId,
        status: "offline"
      });

      console.log(`👤 User ${socket.userId} disconnected`);
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Server Error",
    message: err.message,
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log("================================");
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log(`💬 Socket.io ready for real-time chat`);
  console.log(`📁 Database: ${process.env.MONGO_URI ? "Connected" : "Not configured"}`);
  console.log(`📁 Collections:`);
  console.log(`   • users`);
  console.log(`   • children`);
  console.log(`   • activities`);
  console.log(`   • notifications`);
  console.log(`   • chats`);
  console.log(`   • messages`);
  console.log(`   • attendance`);
  console.log(`   • invoices`);
  console.log(`📁 Modules loaded:`);
  console.log(`   • Authentication & Authorization`);
  console.log(`   • Child Management`);
  console.log(`   • Activity Management & Photos`);
  console.log(`   • Parent Notifications`);
  console.log(`   • Parent-Staff Chat (Real-time)`);
  console.log(`   • Billing & Invoicing`);
  console.log(`   • Analytics & Reporting`);
  console.log(`   • Admin Dashboard`);
  console.log(`   • Daily Reports`);
  console.log(`   • Staff Profile Management`);
  console.log("================================");
});
