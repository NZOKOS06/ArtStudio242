"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAdminGuard } from "../../../lib/useAdminGuard";
import { useLiveReload, useStudio } from "../../../lib/StudioContext";
import AdminShell from "../../../components/AdminShell";
import styles from "../admin.module.css";

const empty = {
  title: "",
  imageUrl: "",
  categoryId: "",
  isFeatured: true,
  isActive: true,
};

export default function AdminGalleryPage() {
  const ready = useAdminGuard();
  const { notifyChange } = useStudio();
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  async function load() {
    const [imgs, cats] = await Promise.all([
      api.get("/api/gallery?all=1", { cache: "no-store" }),
      api.get("/api/categories?all=1", { cache: "no-store" }),
    ]);
    setImages(imgs);
    setCategories(cats);
  }

  useLiveReload(["gallery", "categories"], () => {
    if (ready) load().catch(console.error);
  });

  useEffect(() => {
    if (ready) load().catch(console.error);
  }, [ready]);

  function closeForm() {
    setOpen(false);
    setForm(empty);
  }

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
    notifyChange("gallery");
    closeForm();
    await load();
  }

  async function remove(id) {
    if (!confirm("Supprimer cette image ?")) return;
    await api.delete(`/api/gallery/${id}`);
    notifyChange("gallery");
    await load();
  }

  if (!ready) {
    return <AdminShell title="Galerie" subtitle="Portfolio visible sur le site" loading />;
  }

  return (
    <AdminShell title="Galerie" subtitle="Portfolio visible sur le site">
      <div className={styles.toolbar}>
        <div>
          <div className={styles.toolbarTitle}>{images.length} photo(s)</div>
          <div className={styles.toolbarHint}>Ajoutez des images au portfolio</div>
        </div>
        {!open && (
          <button className="btn btn-primary btn-sm" type="button" onClick={() => setOpen(true)}>
            + Ajouter une photo
          </button>
        )}
      </div>

      {open && (
        <div className={styles.composer}>
          <div className={styles.composerHead}>
            <h3>Nouvelle photo</h3>
            <button className="btn btn-ghost btn-sm" type="button" onClick={closeForm}>Fermer</button>
          </div>
          <form onSubmit={onSubmit} className={styles.composerGrid}>
            <input placeholder="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input placeholder="URL image" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required />
            <input type="file" accept="image/*" onChange={onUpload} />
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Sans catégorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <label><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Mise en avant</label>
            <div className={styles.composerActions}>
              <button className="btn btn-primary btn-sm" type="submit">Ajouter la photo</button>
              <button className="btn btn-outline btn-sm" type="button" onClick={closeForm}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.panel}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12 }}>
          {images.map((img) => (
            <div key={img.id} style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
              <img src={api.assetUrl(img.imageUrl)} alt={img.title || ""} style={{ width: "100%", height: 140, objectFit: "cover" }} />
              <div style={{ padding: 8 }}>
                <strong style={{ fontSize: "0.85rem" }}>{img.title || "Sans titre"}</strong>
                <div className={styles.rowActions} style={{ marginTop: 8 }}>
                  <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} type="button" onClick={() => remove(img.id)}>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
