"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAdminGuard } from "../../../lib/useAdminGuard";
import AdminShell from "../../../components/AdminShell";
import styles from "../admin.module.css";

export default function AdminCategoriesPage() {
  const ready = useAdminGuard();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", coverUrl: "", isActive: true });

  async function load() {
    setCategories(await api.get("/api/categories?all=1"));
  }

  useEffect(() => {
    if (ready) load().catch(console.error);
  }, [ready]);

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploaded = await api.upload(file);
    setForm((f) => ({ ...f, coverUrl: uploaded.url }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    await api.post("/api/categories", form);
    setForm({ name: "", description: "", coverUrl: "", isActive: true });
    await load();
  }

  async function remove(id) {
    if (!confirm("Supprimer cette catégorie ?")) return;
    await api.delete(`/api/categories/${id}`);
    await load();
  }

  if (!ready) return null;

  return (
    <AdminShell title="Catégories">
      <div className={styles.panel}>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 560 }}>
          <h3>Nouvelle catégorie</h3>
          <input placeholder="Nom" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
          <input placeholder="URL couverture" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
          <input type="file" accept="image/*" onChange={onUpload} />
          <button className="btn btn-primary" type="submit">Créer</button>
        </form>
      </div>
      <div className={styles.panel}>
        <table className={styles.table}>
          <thead>
            <tr><th>Nom</th><th>Photos</th><th>Couverture</th><th></th></tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c._count?.gallery ?? 0}</td>
                <td>{c.coverUrl ? <img src={api.assetUrl(c.coverUrl)} alt="" style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 8 }} /> : "—"}</td>
                <td><button className="btn btn-outline" type="button" onClick={() => remove(c.id)}>Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
