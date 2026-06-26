// src/services/inventory/inventoryService.js
// Inventory Service — manages product stock for salon managers.
// Maps to: GlowSync Backend Server → Inventory Service (Composite Diagram)

const { v4: uuidv4 } = require("uuid");
const db = require("../../config/database");

/**
 * Get all inventory items for a salon.
 * Items below their threshold are flagged with lowStock: true.
 */
const getInventory = (salonId) => {
  return db.inventory
    .filter((item) => item.salonId === salonId)
    .map((item) => ({
      ...item,
      lowStock: item.quantity <= item.threshold,
    }));
};

/**
 * Add a new inventory item to a salon.
 */
const addInventoryItem = ({ salonId, name, quantity, threshold, unit }) => {
  if (!salonId || !name || quantity == null || !threshold) {
    throw new Error("Missing required fields: salonId, name, quantity, threshold.");
  }

  const item = {
    id: uuidv4(),
    salonId,
    name,
    quantity: Number(quantity),
    threshold: Number(threshold),
    unit: unit || "units",
    createdAt: new Date().toISOString(),
  };

  db.inventory.push(item);
  return { ...item, lowStock: item.quantity <= item.threshold };
};

/**
 * Update quantity of an existing item (restock or deduct).
 */
const updateItemQuantity = (itemId, quantity, salonId) => {
  const item = db.inventory.find((i) => i.id === itemId && i.salonId === salonId);
  if (!item) throw new Error("Inventory item not found.");
  if (quantity < 0) throw new Error("Quantity cannot be negative.");

  item.quantity = Number(quantity);
  item.updatedAt = new Date().toISOString();
  return { ...item, lowStock: item.quantity <= item.threshold };
};

/**
 * Delete an inventory item.
 */
const deleteInventoryItem = (itemId, salonId) => {
  const index = db.inventory.findIndex((i) => i.id === itemId && i.salonId === salonId);
  if (index === -1) throw new Error("Inventory item not found.");
  db.inventory.splice(index, 1);
  return { message: "Item deleted successfully." };
};

/**
 * Return only items that are at or below their low-stock threshold.
 */
const getLowStockAlerts = (salonId) => {
  return db.inventory
    .filter((item) => item.salonId === salonId && item.quantity <= item.threshold)
    .map((item) => ({ ...item, lowStock: true }));
};

module.exports = {
  getInventory,
  addInventoryItem,
  updateItemQuantity,
  deleteInventoryItem,
  getLowStockAlerts,
};
