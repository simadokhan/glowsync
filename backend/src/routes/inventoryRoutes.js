// src/routes/inventoryRoutes.js
const express = require("express");
const router = express.Router();
const inventoryService = require("../services/inventory/inventoryService");
const { protect, authorize } = require("../middleware/authMiddleware");

// All inventory routes are manager-only
router.use(protect, authorize("manager"));

// GET /api/inventory — get all items for the manager's salon
router.get("/", (req, res) => {
  try {
    const items = inventoryService.getInventory(req.user.salonId);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/inventory/alerts — low-stock alerts
router.get("/alerts", (req, res) => {
  try {
    const alerts = inventoryService.getLowStockAlerts(req.user.salonId);
    res.json({ success: true, data: alerts, count: alerts.length });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/inventory — add a new item
router.post("/", (req, res) => {
  try {
    const item = inventoryService.addInventoryItem({
      ...req.body,
      salonId: req.user.salonId,
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/inventory/:id — update item quantity
router.patch("/:id", (req, res) => {
  try {
    const { quantity } = req.body;
    const updated = inventoryService.updateItemQuantity(
      req.params.id,
      quantity,
      req.user.salonId
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/inventory/:id — remove an item
router.delete("/:id", (req, res) => {
  try {
    const result = inventoryService.deleteInventoryItem(req.params.id, req.user.salonId);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
