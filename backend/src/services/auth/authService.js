// src/services/auth/authService.js
// Authentication Service — handles registration, login, and token issuance.
// Maps to: GlowSync Backend Server → Authentication Service (Composite Diagram)

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("../../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "glowsync_secret_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Generate a signed JWT for a given user payload.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, salonId: user.salonId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Register a new user (client, stylist, or manager).
 */
const register = async ({ name, email, password, role, salonId }) => {
  const existing = db.users.find((u) => u.email === email);
  if (existing) {
    throw new Error("A user with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    role: role || "client",
    salonId: salonId || null,
  };

  db.users.push(newUser);

  const token = generateToken(newUser);
  return {
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
  };
};

/**
 * Log in an existing user and return a JWT.
 */
const login = async ({ email, password }) => {
  const user = db.users.find((u) => u.email === email);
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password.");
  }

  const token = generateToken(user);
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, salonId: user.salonId },
  };
};

/**
 * Return the currently authenticated user's profile.
 */
const getProfile = (userId) => {
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found.");
  const { password, ...safeUser } = user;
  return safeUser;
};

module.exports = { register, login, getProfile };
