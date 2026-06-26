// src/routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const bookingService = require("../services/booking/bookingService");
const { protect, authorize } = require("../middleware/authMiddleware");

// All booking routes require authentication
router.use(protect);

// GET /api/bookings — fetch appointments based on user role
router.get("/", (req, res) => {
  try {
    const appointments = bookingService.getAppointments({
      role: req.user.role,
      userId: req.user.id,
      salonId: req.user.salonId,
    });
    res.json({ success: true, data: appointments });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/bookings — create a new appointment (clients only)
router.post("/", authorize("client", "manager"), (req, res) => {
  try {
    const appointment = bookingService.createAppointment({
      ...req.body,
      clientId: req.user.role === "client" ? req.user.id : req.body.clientId,
    });
    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/bookings/:id/status — update appointment status
router.patch("/:id/status", (req, res) => {
  try {
    const { status } = req.body;
    const updated = bookingService.updateAppointmentStatus(
      req.params.id,
      status,
      req.user.id,
      req.user.role
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/stylists/:salonId — get stylists for a salon
router.get("/stylists/:salonId", (req, res) => {
  try {
    const stylists = bookingService.getSalonStylists(req.params.salonId);
    res.json({ success: true, data: stylists });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
