"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAdminGuard } from "../../../lib/useAdminGuard";
import AdminShell from "../../../components/AdminShell";
import styles from "../admin.module.css";

const empty = {
  name: "",
  price: 15000,
  duration: "",
  photoCount: 20,
  features: "",
  color: "green",
  badge: "",
  isActive: true,
  isFeatured: false,
};

export default function AdminPacksPage() {
  const ready = useAdminGuard();
  const [packs, setPacks] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  async function load() {
    setPacks(await api.get("/api/packs?all=1"));
  }

  useEffect(() => {
    if (ready) load().catch(console.error);
  }, [ready]);

  async function onSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      photoCount: form.photoCount ? Number(form.photoCount) : null,
      features: form.features
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    if (editingId) await api.put(`/api/packs/${editingId}`, payload);
    else await api.post("/api/packs", payload);
    setForm(empty);
    setEditingId(null);
    await load();
  }

  function edit(pack) {
    setEditingId(pack.id);
    setForm({
      name: pack.name,
      price: pack.price,
      duration: pack.duration || "",
      photoCount: pack.photoCount || "",
      features: (pack.features || []).join("\n"),
      color: pack.color || "green",
      badge: pack.badge || "",
      isActive: pack.isActive,
      isFeatured: pack.isFeatured,
    });
  }

  async function remove(id) {
    if (!confirm("Supprimer ce pack ?")) return;
    await api.delete(`/api/packs/${id}`);
    await load();
  }

  if (!ready) return null;

  return (
    <AdminShell title="Packs">
      <div className={styles.panel}>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 560 }}>
          <h3>{editingId ? "Modifier le pack" : "Nouveau pack"}</h3>
          <input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
          <input type="number" placeholder="Prix" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
          <input placeholder="Durée" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
          <textarea placeholder="Features (1 par ligne)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={4} style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
          <select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} style={{ padding: 10, borderRadius: 10 }}>
            <option value="green">Vert</option>
            <option value="gold">Or</option>
            <option value="red">Rouge</option>
            <option value="black">Noir</option>
          </select>
          <input placeholder="Badge" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
          <label><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Actif</label>
          <label><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Mis en avant</label>
          <button className="btn btn-primary" type="submit">{editingId ? "Enregistrer" : "Créer"}</button>
        </form>
      </div>

      <div className={styles.panel}>
        <table className={styles.table}>
          <thead>
            <tr><th>Nom</th><th>Prix</th><th>Couleur</th><th>Actif</th><th></th></tr>
          </thead>
          <tbody>
            {packs.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.price.toLocaleString("fr-FR")} FCFA</td>
                <td>{p.color}</td>
                <td>{p.isActive ? "Oui" : "Non"}</td>
                <td className={styles.rowActions}>
                  <button className="btn btn-outline" type="button" onClick={() => edit(p)}>Éditer</button>
                  <button className="btn btn-outline" type="button" onClick={() => remove(p.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
