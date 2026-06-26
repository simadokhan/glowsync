// src/components/auth/LoginPage.js
import { useState } from "react";
import { useAuth } from "./AuthContext";

// SUC: User Authentication — Client, Stylist, Manager login
export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const demos = {
      manager: { email: "manager@glowsync.com", password: "password" },
      stylist: { email: "stylist@glowsync.com", password: "password" },
      client:  { email: "client@glowsync.com",  password: "password" },
    };
    setForm(demos[role]);
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">GlowSync</div>
        <div className="auth-sub">Sign in to your salon platform</div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              className="form-control"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              className="form-control"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: 24, borderTop: "1px solid #eee", paddingTop: 16 }}>
          <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 10 }}>Demo accounts:</p>
          <div style={{ display: "flex", gap: 8 }}>
            {["manager","stylist","client"].map((role) => (
              <button
                key={role}
                className="btn btn-outline btn-sm"
                onClick={() => fillDemo(role)}
                style={{ textTransform: "capitalize" }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
