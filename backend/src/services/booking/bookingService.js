// src/services/booking/bookingService.js
// Booking Service — manages appointments across clients, stylists, and salons.
// Maps to: GlowSync Backend Server → Booking Service (Composite Diagram)

const { v4: uuidv4 } = require("uuid");
const db = require("../../config/database");

const VALID_STATUSES = ["pending", "confirmed", "in-progress", "completed", "cancelled"];

/**
 * Create a new appointment booking.
 */
const createAppointment = ({ clientId, stylistId, salonId, service, date, time, notes }) => {
  if (!clientId || !stylistId || !salonId || !service || !date || !time) {
    throw new Error("Missing required booking fields.");
  }

  // Conflict check: stylist already has appointment at this time
  const conflict = db.appointments.find(
    (a) =>
      a.stylistId === stylistId &&
      a.date === date &&
      a.time === time &&
      a.status !== "cancelled"
  );
  if (conflict) {
    throw new Error("Stylist is already booked at this date and time.");
  }

  const appointment = {
    id: uuidv4(),
    clientId,
    stylistId,
    salonId,
    service,
    date,
    time,
    status: "pending",
    notes: notes || "",
    createdAt: new Date().toISOString(),
  };

  db.appointments.push(appointment);
  return appointment;
};

/**
 * List appointments filtered by role context.
 */
const getAppointments = ({ role, userId, salonId }) => {
  let results = db.appointments;

  if (role === "client") {
    results = results.filter((a) => a.clientId === userId);
  } else if (role === "stylist") {
    results = results.filter((a) => a.stylistId === userId);
  } else if (role === "manager") {
    results = results.filter((a) => a.salonId === salonId);
  }

  // Enrich with user names for display
  return results.map((a) => {
    const client = db.users.find((u) => u.id === a.clientId);
    const stylist = db.users.find((u) => u.id === a.stylistId);
    return {
      ...a,
      clientName: client?.name || "Unknown",
      stylistName: stylist?.name || "Unknown",
    };
  });
};

/**
 * Get a single appointment by ID.
 */
const getAppointmentById = (appointmentId) => {
  const appointment = db.appointments.find((a) => a.id === appointmentId);
  if (!appointment) throw new Error("Appointment not found.");
  return appointment;
};

/**
 * Update appointment status (e.g. confirm, complete, cancel).
 */
const updateAppointmentStatus = (appointmentId, status, requesterId, requesterRole) => {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  const appointment = db.appointments.find((a) => a.id === appointmentId);
  if (!appointment) throw new Error("Appointment not found.");

  // Clients can only cancel their own appointments
  if (requesterRole === "client" && appointment.clientId !== requesterId) {
    throw new Error("Not authorized to update this appointment.");
  }

  appointment.status = status;
  appointment.updatedAt = new Date().toISOString();
  return appointment;
};

/**
 * Get all stylists belonging to a salon.
 */
const getSalonStylists = (salonId) => {
  return db.users
    .filter((u) => u.role === "stylist" && u.salonId === salonId)
    .map(({ password, ...u }) => u);
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  getSalonStylists,
};
