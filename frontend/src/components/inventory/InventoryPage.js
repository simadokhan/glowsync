// src/components/inventory/InventoryPage.js
// Manager-only — maps to Inventory Service in the Composite Diagram
import { useEffect, useState } from "react";
import { inventoryAPI } from "../../services/api";

const UNITS = ["bottles", "tubes", "jars", "sets", "units", "boxes", "packs"];

// ─── Add Item Modal ────────────────────────────────────────────────────────────
function AddItemModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: "", quantity: "", threshold: "", unit: "bottles" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!form.name || form.quantity === "" || form.threshold === "") {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      await inventoryAPI.addItem(form);
      onAdded();
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
        <h3>Add Inventory Item</h3>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label>Product Name</label>
          <input className="form-control" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Shampoo Pro" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label>Quantity</label>
            <input className="form-control" type="number" min="0" value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Low-Stock Threshold</label>
            <input className="form-control" type="number" min="1" value={form.threshold}
              onChange={(e) => setForm({ ...form, threshold: e.target.value })} />
          </div>
        </div>

        <div className="form-group">
          <label>Unit</label>
          <select className="form-control" value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}>
            {UNITS.map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? "Saving…" : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Quantity Modal ───────────────────────────────────────────────────────
function EditQtyModal({ item, onClose, onUpdated }) {
  const [qty, setQty]       = useState(item.quantity);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await inventoryAPI.updateQuantity(item.id, Number(qty));
      onUpdated();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Update Quantity — {item.name}</h3>
        <div className="form-group">
          <label>New Quantity ({item.unit})</label>
          <input className="form-control" type="number" min="0"
            value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? "Saving…" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [editing, setEditing]     = useState(null);
  const [filterLow, setFilterLow] = useState(false);

  const load = () => {
    setLoading(true);
    inventoryAPI.getInventory()
      .then((r) => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await inventoryAPI.deleteItem(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const lowCount = items.filter((i) => i.lowStock).length;
  const displayed = filterLow ? items.filter((i) => i.lowStock) : items;

  return (
    <div>
      {showAdd  && <AddItemModal  onClose={() => setShowAdd(false)} onAdded={load} />}
      {editing  && <EditQtyModal item={editing} onClose={() => setEditing(null)} onUpdated={load} />}

      <div className="page-header">
        <h2>Inventory</h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add Item
        </button>
      </div>

      {/* Stats row */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-value">{items.length}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className={`stat-card ${lowCount > 0 ? "alert" : ""}`}>
          <div className="stat-value">{lowCount}</div>
          <div className="stat-label">Low Stock</div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button className={`btn btn-sm ${!filterLow ? "btn-primary" : "btn-outline"}`}
          onClick={() => setFilterLow(false)}>All Items</button>
        <button className={`btn btn-sm ${filterLow ? "btn-primary" : "btn-outline"}`}
          onClick={() => setFilterLow(true)}>
          ⚠️ Low Stock ({lowCount})
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner">Loading…</div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            {filterLow ? "No low-stock items." : "No inventory items yet."}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong></td>
                  <td style={{ color: item.lowStock ? "var(--danger)" : "inherit", fontWeight: item.lowStock ? 600 : 400 }}>
                    {item.quantity}
                  </td>
                  <td>{item.unit}</td>
                  <td className="text-muted">{item.threshold}</td>
                  <td>
                    {item.lowStock
                      ? <span className="badge badge-low">Low Stock</span>
                      : <span className="badge badge-confirmed">OK</span>
                    }
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-sm btn-outline"
                        onClick={() => setEditing(item)}>
                        Update Qty
                      </button>
                      <button className="btn btn-sm btn-danger"
                        onClick={() => deleteItem(item.id)}>
                        Delete
                      </button>
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
