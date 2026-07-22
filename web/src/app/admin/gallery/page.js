"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAdminGuard } from "../../../lib/useAdminGuard";
import AdminShell from "../../../components/AdminShell";
import styles from "../admin.module.css";

export default function AdminGalleryPage() {
  const ready = useAdminGuard();
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    categoryId: "",
    isFeatured: true,
    isActive: true,
  });

  async function load() {
    const [imgs, cats] = await Promise.all([
      api.get("/api/gallery?all=1"),
      api.get("/api/categories?all=1"),
    ]);
    setImages(imgs);
    setCategories(cats);
  }

  useEffect(() => {
    if (ready) load().catch(console.error);
  }, [ready]);

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploaded = await api.upload(file);
    setForm((f) => ({ ...f, imageUrl: uploaded.url }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    await api.post("/api/gallery", {
      ...form,
      categoryId: form.categoryId || null,
    });
    setForm({ title: "", imageUrl: "", categoryId: "", isFeatured: true, isActive: true });
    await load();
  }

  async function remove(id) {
    if (!confirm("Supprimer cette image ?")) return;
    await api.delete(`/api/gallery/${id}`);
    await load();
  }

  if (!ready) return null;

  return (
    <AdminShell title="Galerie">
      <div className={styles.panel}>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 560 }}>
          <h3>Ajouter une photo</h3>
          <input placeholder="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
          <input placeholder="URL image" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }} />
          <input type="file" accept="image/*" onChange={onUpload} />
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} style={{ padding: 10, borderRadius: 10 }}>
            <option value="">Sans catégorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <label><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Mise en avant</label>
          <button className="btn btn-primary" type="submit">Ajouter</button>
        </form>
      </div>

      <div className={styles.panel}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12 }}>
          {images.map((img) => (
            <div key={img.id} style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
              <img src={api.assetUrl(img.imageUrl)} alt={img.title || ""} style={{ width: "100%", height: 140, objectFit: "cover" }} />
              <div style={{ padding: 8 }}>
                <strong>{img.title || "Sans titre"}</strong>
                <div className={styles.rowActions} style={{ marginTop: 8 }}>
                  <button className="btn btn-outline" type="button" onClick={() => remove(img.id)}>Supprimer</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
