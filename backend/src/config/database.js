// src/config/database.js
// In-memory store — replace with a real DB (PostgreSQL, MongoDB) in production

const db = {
  users: [
    {
      id: "u1",
      name: "Admin Manager",
      email: "manager@glowsync.com",
      password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      role: "manager",
      salonId: "s1",
    },
    {
      id: "u2",
      name: "Sara Stylist",
      email: "stylist@glowsync.com",
      password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      role: "stylist",
      salonId: "s1",
    },
    {
      id: "u3",
      name: "Client User",
      email: "client@glowsync.com",
      password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      role: "client",
      salonId: null,
    },
  ],

  salons: [
    {
      id: "s1",
      name: "Luna Salon",
      managerId: "u1",
      services: ["Haircut", "Color", "Nails", "Facial"],
    },
  ],

  appointments: [
    {
      id: "a1",
      clientId: "u3",
      stylistId: "u2",
      salonId: "s1",
      service: "Haircut",
      date: "2026-07-01",
      time: "10:00",
      status: "confirmed",
      notes: "Regular trim",
    },
    {
      id: "a2",
      clientId: "u3",
      stylistId: "u2",
      salonId: "s1",
      service: "Color",
      date: "2026-07-05",
      time: "14:00",
      status: "pending",
      notes: "Blonde highlights",
    },
  ],

  inventory: [
    { id: "i1", salonId: "s1", name: "Shampoo Pro", quantity: 24, threshold: 5, unit: "bottles" },
    { id: "i2", salonId: "s1", name: "Hair Dye – Blonde", quantity: 3, threshold: 5, unit: "tubes" },
    { id: "i3", salonId: "s1", name: "Conditioner Mask", quantity: 12, threshold: 4, unit: "jars" },
    { id: "i4", salonId: "s1", name: "Nail Polish Set", quantity: 8, threshold: 3, unit: "sets" },
    { id: "i5", salonId: "s1", name: "Styling Gel", quantity: 2, threshold: 5, unit: "tubes" },
  ],
};

module.exports = db;
