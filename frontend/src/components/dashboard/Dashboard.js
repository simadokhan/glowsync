// src/components/dashboard/Dashboard.js
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { bookingAPI, inventoryAPI } from "../../services/api";

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [lowStock, setLowStock]         = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const apptRes = await bookingAPI.getAppointments();
        setAppointments(apptRes.data);
        if (user?.role === "manager") {
          const stockRes = await inventoryAPI.getLowStockAlerts();
          setLowStock(stockRes.data);
        }
      } catch (_) {}
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  if (loading) return <div className="spinner">Loading…</div>;

  const today = new Date().toISOString().split("T")[0];
  const todayAppts   = appointments.filter((a) => a.date === today);
  const pending      = appointments.filter((a) => a.status === "pending");
  const confirmed    = appointments.filter((a) => a.status === "confirmed");
  const recent       = [...appointments].slice(0, 5);

  const statusBadge = (s) => (
    <span className={`badge badge-${s.replace(" ", "-")}`}>{s}</span>
  );

  return (
    <div>
      {/* ── Stats ── */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{appointments.length}</div>
          <div className="stat-label">Total Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{todayAppts.length}</div>
          <div className="stat-label">Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pending.length}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{confirmed.length}</div>
          <div className="stat-label">Confirmed</div>
        </div>
        {user?.role === "manager" && (
          <div className={`stat-card ${lowStock.length > 0 ? "alert" : ""}`}>
            <div className="stat-value">{lowStock.length}</div>
            <div className="stat-label">Low Stock Alerts</div>
          </div>
        )}
      </div>

      {/* ── Low Stock Warning ── */}
      {user?.role === "manager" && lowStock.length > 0 && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          ⚠️ {lowStock.length} inventory item{lowStock.length > 1 ? "s are" : " is"} running low —{" "}
          <span
            style={{ textDecoration: "underline", cursor: "pointer", fontWeight: 600 }}
            onClick={() => onNavigate("inventory")}
          >
            view inventory
          </span>
        </div>
      )}

      {/* ── Recent Appointments ── */}
      <div className="card">
        <div className="page-header" style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Recent Appointments</div>
          <button className="btn btn-outline btn-sm" onClick={() => onNavigate("bookings")}>
            View All
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="empty-state">No appointments yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Service</th>
                {user?.role !== "client"  && <th>Client</th>}
                {user?.role !== "stylist" && <th>Stylist</th>}
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((a) => (
                <tr key={a.id}>
                  <td>{a.service}</td>
                  {user?.role !== "client"  && <td>{a.clientName}</td>}
                  {user?.role !== "stylist" && <td>{a.stylistName}</td>}
                  <td>{a.date}</td>
                  <td>{a.time}</td>
                  <td>{statusBadge(a.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
