// src/components/booking/BookingsPage.js
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { bookingAPI } from "../../services/api";

const STATUSES = ["pending", "confirmed", "in-progress", "completed", "cancelled"];
const SERVICES = ["Haircut", "Color", "Nails", "Facial", "Blowout", "Treatment"];

const statusBadge = (s) => (
  <span className={`badge badge-${s.replace(" ", "-")}`}>{s}</span>
);

// ─── Book Appointment Modal ────────────────────────────────────────────────────
function BookModal({ onClose, onBooked }) {
  const { user } = useAuth();
  const [stylists, setStylists] = useState([]);
  const [form, setForm] = useState({
    stylistId: "", salonId: "s1", service: "Haircut",
    date: "", time: "10:00", notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    bookingAPI.getStylists("s1")
      .then((r) => setStylists(r.data))
      .catch(() => {});
  }, []);

  const submit = async () => {
    setError("");
    if (!form.stylistId || !form.date) {
      setError("Please select a stylist and date.");
      return;
    }
    setLoading(true);
    try {
      await bookingAPI.createAppointment(form);
      onBooked();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Book Appointment</h3>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label>Service</label>
          <select className="form-control" value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}>
            {SERVICES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Stylist</label>
          <select className="form-control" value={form.stylistId}
            onChange={(e) => setForm({ ...form, stylistId: e.target.value })}>
            <option value="">— Select stylist —</option>
            {stylists.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label>Date</label>
            <input className="form-control" type="date" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input className="form-control" type="time" value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>
        </div>

        <div className="form-group">
          <label>Notes (optional)</label>
          <input className="form-control" type="text" value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="e.g. Blonde highlights" />
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? "Booking…" : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [filter, setFilter]             = useState("all");

  const load = () => {
    setLoading(true);
    bookingAPI.getAppointments()
      .then((r) => setAppointments(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    try {
      await bookingAPI.updateStatus(id, status);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = filter === "all"
    ? appointments
    : appointments.filter((a) => a.status === filter);

  const canBook = user?.role === "client" || user?.role === "manager";

  return (
    <div>
      {showModal && (
        <BookModal onClose={() => setShowModal(false)} onBooked={load} />
      )}

      <div className="page-header">
        <h2>Appointments</h2>
        {canBook && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Appointment
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-outline"}`}
            onClick={() => setFilter(s)}
            style={{ textTransform: "capitalize" }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No appointments found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Service</th>
                {user?.role !== "client"  && <th>Client</th>}
                {user?.role !== "stylist" && <th>Stylist</th>}
                <th>Date</th>
                <th>Time</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.service}</strong></td>
                  {user?.role !== "client"  && <td>{a.clientName}</td>}
                  {user?.role !== "stylist" && <td>{a.stylistName}</td>}
                  <td>{a.date}</td>
                  <td>{a.time}</td>
                  <td className="text-muted">{a.notes || "—"}</td>
                  <td>{statusBadge(a.status)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {/* Stylist / Manager can confirm or mark in-progress */}
                      {(user?.role === "stylist" || user?.role === "manager") && a.status === "pending" && (
                        <button className="btn btn-sm btn-outline"
                          onClick={() => updateStatus(a.id, "confirmed")}>
                          Confirm
                        </button>
                      )}
                      {(user?.role === "stylist" || user?.role === "manager") && a.status === "confirmed" && (
                        <button className="btn btn-sm btn-outline"
                          onClick={() => updateStatus(a.id, "in-progress")}>
                          Start
                        </button>
                      )}
                      {(user?.role === "stylist" || user?.role === "manager") && a.status === "in-progress" && (
                        <button className="btn btn-sm btn-outline"
                          onClick={() => updateStatus(a.id, "completed")}>
                          Complete
                        </button>
                      )}
                      {/* Anyone can cancel a non-completed appointment */}
                      {!["completed","cancelled"].includes(a.status) && (
                        <button className="btn btn-sm btn-danger"
                          onClick={() => updateStatus(a.id, "cancelled")}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
