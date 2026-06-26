// src/services/api.js
// Centralized API client — all calls go through the GlowSync Cloud Backend gateway

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getHeaders = () => {
  const token = localStorage.getItem("glowsync_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ─── Authentication Service ───────────────────────────────────────────────────
export const authAPI = {
  login: (credentials) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    }).then(handleResponse),

  register: (userData) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(userData),
    }).then(handleResponse),

  getMe: () =>
    fetch(`${BASE_URL}/auth/me`, { headers: getHeaders() }).then(handleResponse),
};

// ─── Booking Service ──────────────────────────────────────────────────────────
export const bookingAPI = {
  getAppointments: () =>
    fetch(`${BASE_URL}/bookings`, { headers: getHeaders() }).then(handleResponse),

  createAppointment: (data) =>
    fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateStatus: (id, status) =>
    fetch(`${BASE_URL}/bookings/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    }).then(handleResponse),

  getStylists: (salonId) =>
    fetch(`${BASE_URL}/bookings/stylists/${salonId}`, {
      headers: getHeaders(),
    }).then(handleResponse),
};

// ─── Inventory Service ────────────────────────────────────────────────────────
export const inventoryAPI = {
  getInventory: () =>
    fetch(`${BASE_URL}/inventory`, { headers: getHeaders() }).then(handleResponse),

  getLowStockAlerts: () =>
    fetch(`${BASE_URL}/inventory/alerts`, { headers: getHeaders() }).then(handleResponse),

  addItem: (item) =>
    fetch(`${BASE_URL}/inventory`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(item),
    }).then(handleResponse),

  updateQuantity: (id, quantity) =>
    fetch(`${BASE_URL}/inventory/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ quantity }),
    }).then(handleResponse),

  deleteItem: (id) =>
    fetch(`${BASE_URL}/inventory/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleResponse),
};
