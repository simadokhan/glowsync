// src/App.js
import { useState } from "react";
import { AuthProvider, useAuth } from "./components/auth/AuthContext";
import LoginPage from "./components/auth/LoginPage";
import Dashboard from "./components/dashboard/Dashboard";
import BookingsPage from "./components/booking/BookingsPage";
import InventoryPage from "./components/inventory/InventoryPage";

// ─── Icons (inline SVG to avoid extra deps) ───────────────────────────────────
const Icon = ({ name }) => {
  const icons = {
    dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    calendar:  "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    inventory: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    logout:    "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  };
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d={icons[name]} />
    </svg>
  );
};

// ─── Shell (sidebar + topbar + page area) ─────────────────────────────────────
function AppShell() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState("dashboard");

  const navItems = [
    { id: "dashboard", label: "Dashboard",  icon: "dashboard" },
    { id: "bookings",  label: "Appointments", icon: "calendar" },
    // Inventory only visible to managers
    ...(user?.role === "manager"
      ? [{ id: "inventory", label: "Inventory", icon: "inventory" }]
      : []),
  ];

  const pageTitle = {
    dashboard: "Dashboard",
    bookings:  "Appointments",
    inventory: "Inventory",
  }[page];

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>GlowSync</h1>
          <span>Salon Platform</span>
        </div>

        <nav>
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${page === item.id ? "active" : ""}`}
              onClick={() => setPage(item.id)}
            >
              <Icon name={item.icon} />
              {item.label}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div
            className="nav-item"
            onClick={logout}
            style={{ padding: "10px 0", color: "rgba(255,255,255,0.4)" }}
          >
            <Icon name="logout" />
            Sign Out
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        <header className="topbar">
          <span className="topbar-title">{pageTitle}</span>
          <div className="topbar-user">
            <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <span>{user?.name}</span>
            <span style={{
              background: "var(--rose-pale)",
              color: "var(--rose-dark)",
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 20,
              fontWeight: 600,
              textTransform: "capitalize",
            }}>
              {user?.role}
            </span>
          </div>
        </header>

        <main className="page">
          {page === "dashboard"  && <Dashboard onNavigate={setPage} />}
          {page === "bookings"   && <BookingsPage />}
          {page === "inventory"  && <InventoryPage />}
        </main>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontFamily: "Inter, sans-serif", color: "#6B7280",
      }}>
        Loading GlowSync…
      </div>
    );
  }

  return user ? <AppShell /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
