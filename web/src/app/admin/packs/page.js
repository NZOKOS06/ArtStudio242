"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAdminGuard } from "../../../lib/useAdminGuard";
import { useLiveReload, useStudio } from "../../../lib/StudioContext";
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
  const { notifyChange } = useStudio();
  const [packs, setPacks] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);

  async function load() {
    setPacks(await api.get("/api/packs?all=1", { cache: "no-store" }));
  }

  useLiveReload(["packs", "settings"], () => {
    if (ready) load().catch(console.error);
  });

  useEffect(() => {
    if (ready) load().catch(console.error);
  }, [ready]);

  function closeForm() {
    setOpen(false);
    setEditingId(null);
    setForm(empty);
  }

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
    notifyChange("packs");
    closeForm();
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
    setOpen(true);
  }

  async function remove(id) {
    if (!confirm("Supprimer ce pack ?")) return;
    await api.delete(`/api/packs/${id}`);
    notifyChange("packs");
    await load();
  }

  if (!ready) {
    return <AdminShell title="Packs" subtitle="Offres et tarifs du studio" loading />;
  }

  return (
    <AdminShell title="Packs" subtitle="Offres et tarifs du studio">
      <div className={styles.toolbar}>
        <div>
          <div className={styles.toolbarTitle}>{packs.length} pack(s)</div>
          <div className={styles.toolbarHint}>Gérez les offres visibles sur le site</div>
        </div>
        {!open && (
          <button className="btn btn-primary btn-sm" type="button" onClick={() => setOpen(true)}>
            + Ajouter un pack
          </button>
        )}
      </div>

      {open && (
        <div className={styles.composer}>
          <div className={styles.composerHead}>
            <h3>{editingId ? "Modifier le pack" : "Nouveau pack"}</h3>
            <button className="btn btn-ghost btn-sm" type="button" onClick={closeForm}>
              Fermer
            </button>
          </div>
          <form onSubmit={onSubmit} className={styles.composerGrid}>
            <input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input type="number" placeholder="Prix" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <input placeholder="Durée" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <textarea placeholder="Features (1 par ligne)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={4} />
            <select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}>
              <option value="green">Vert</option>
              <option value="gold">Or</option>
              <option value="red">Rouge</option>
              <option value="black">Noir</option>
            </select>
            <input placeholder="Badge" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
            <label><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Actif</label>
            <label><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Mis en avant</label>
            <div className={styles.composerActions}>
              <button className="btn btn-primary btn-sm" type="submit">{editingId ? "Enregistrer" : "Créer le pack"}</button>
              <button className="btn btn-outline btn-sm" type="button" onClick={closeForm}>Annuler</button>
            </div>
          </form>
        </div>
      )}

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
                  <button className={styles.actionBtn} type="button" onClick={() => edit(p)}>Éditer</button>
                  <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} type="button" onClick={() => remove(p.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
