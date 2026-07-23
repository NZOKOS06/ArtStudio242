"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAdminGuard } from "../../../lib/useAdminGuard";
import { useLiveReload, useStudio } from "../../../lib/StudioContext";
import AdminShell from "../../../components/AdminShell";
import styles from "../admin.module.css";

const empty = { name: "", description: "", coverUrl: "", isActive: true };

export default function AdminCategoriesPage() {
  const ready = useAdminGuard();
  const { notifyChange } = useStudio();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  async function load() {
    setCategories(await api.get("/api/categories?all=1", { cache: "no-store" }));
  }

  useLiveReload("categories", () => {
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
    setForm((f) => ({ ...f, coverUrl: uploaded.url }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    await api.post("/api/categories", form);
    notifyChange("categories");
    closeForm();
    await load();
  }

  async function remove(id) {
    if (!confirm("Supprimer cette catégorie ?")) return;
    await api.delete(`/api/categories/${id}`);
    notifyChange("categories");
    await load();
  }

  if (!ready) {
    return <AdminShell title="Catégories" subtitle="Univers photo du studio" loading />;
  }

  return (
    <AdminShell title="Catégories" subtitle="Univers photo du studio">
      <div className={styles.toolbar}>
        <div>
          <div className={styles.toolbarTitle}>{categories.length} catégorie(s)</div>
          <div className={styles.toolbarHint}>Organisez le portfolio par univers</div>
        </div>
        {!open && (
          <button className="btn btn-primary btn-sm" type="button" onClick={() => setOpen(true)}>
            + Ajouter une catégorie
          </button>
        )}
      </div>

      {open && (
        <div className={styles.composer}>
          <div className={styles.composerHead}>
            <h3>Nouvelle catégorie</h3>
            <button className="btn btn-ghost btn-sm" type="button" onClick={closeForm}>Fermer</button>
          </div>
          <form onSubmit={onSubmit} className={styles.composerGrid}>
            <input placeholder="Nom" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input placeholder="URL couverture" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} />
            <input type="file" accept="image/*" onChange={onUpload} />
            <div className={styles.composerActions}>
              <button className="btn btn-primary btn-sm" type="submit">Créer la catégorie</button>
              <button className="btn btn-outline btn-sm" type="button" onClick={closeForm}>Annuler</button>
            </div>
          </form>
        </div>
      )}

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
                <td>
                  {c.coverUrl ? (
                    <img src={api.assetUrl(c.coverUrl)} alt="" style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 8 }} />
                  ) : "—"}
                </td>
                <td>
                  <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} type="button" onClick={() => remove(c.id)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
