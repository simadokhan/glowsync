// src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authService = require("../services/auth/authService");
const { protect } = require("../middleware/authMiddleware");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me  (protected)
router.get("/me", protect, (req, res) => {
  try {
    const profile = authService.getProfile(req.user.id);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

module.exports = router;
