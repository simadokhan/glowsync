// src/server.js
// GlowSync Backend API Gateway
// Connects: Authentication Service | Booking Service | Inventory Service

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logger (development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ─── API Routes (Gateway) ─────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);         // Authentication Service
app.use("/api/bookings", bookingRoutes);  // Booking Service
app.use("/api/inventory", inventoryRoutes); // Inventory Service

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    services: ["AuthService", "BookingService", "InventoryService"],
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Fallback ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`✅ GlowSync Backend running on http://localhost:${PORT}`);
  console.log(`   Services: AuthService | BookingService | InventoryService`);
});

module.exports = app;
