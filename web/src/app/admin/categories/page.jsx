"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAdminGuard } from "../../../lib/useAdminGuard";
import { useLiveReload, useStudio } from "../../../lib/StudioContext";
import AdminShell from "../../../components/AdminShell";

const empty = { name: "", description: "", coverUrl: "", isActive: true };

export default function AdminCategoriesPage() {
  const ready = useAdminGuard();
  const { notifyChange } = useStudio();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  async function load() { setCategories(await api.get("/api/categories?all=1", { cache: "no-store" })); }
  useLiveReload("categories", () => { if (ready) load().catch(console.error); });
  useEffect(() => { if (ready) load().catch(console.error); }, [ready]);

  function closeForm() { setOpen(false); setForm(empty); }

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploaded = await api.upload(file);
    setForm((f) => ({ ...f, coverUrl: uploaded.url }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    await api.post("/api/categories", form);
    notifyChange("categories"); closeForm(); await load();
  }

  async function remove(id) {
    if (!confirm("Supprimer cette catégorie ?")) return;
    await api.delete(`/api/categories/${id}`); notifyChange("categories"); await load();
  }

  if (!ready) return (
    <AdminShell title="Catégories">
      <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
    </AdminShell>
  );

  return (
    <AdminShell title="Catégories">
      <div className="admin-toolbar">
        <div>
          <p className="text-white font-bold">{categories.length} catégorie(s)</p>
          <p className="text-xs text-white/30 mt-0.5">Organisez le portfolio par univers</p>
        </div>
        {!open && <button className="btn-primary-sm" type="button" onClick={() => setOpen(true)}>+ Ajouter une catégorie</button>}
      </div>

      {open && (
        <div className="admin-panel mb-6 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-white">Nouvelle catégorie</h3>
            <button className="text-xs text-white/40 hover:text-white" type="button" onClick={closeForm}>✕ Fermer</button>
          </div>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="admin-input" placeholder="Nom" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="admin-input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input className="admin-input" placeholder="URL couverture" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} />
            <div>
              <p className="text-xs text-white/40 mb-2">Ou uploader une image</p>
              <input type="file" accept="image/*" onChange={onUpload} className="text-sm text-white/50 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-colors" />
            </div>
            <div className="flex gap-2 md:col-span-2">
              <button className="btn-primary-sm" type="submit">Créer la catégorie</button>
              <button className="btn-admin btn-admin-default" type="button" onClick={closeForm}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-panel">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr><th>Nom</th><th>Photos</th><th>Couverture</th><th></th></tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold text-white">{c.name}</td>
                  <td>{c._count?.gallery ?? 0}</td>
                  <td>
                    {c.coverUrl ? (
                      <img src={api.assetUrl(c.coverUrl)} alt="" className="w-16 h-12 object-cover rounded-lg" />
                    ) : "—"}
                  </td>
                  <td>
                    <button className="btn-admin btn-admin-danger" type="button" onClick={() => remove(c.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
              {!categories.length && <tr><td colSpan={4} className="text-center text-white/30 py-10">Aucune catégorie</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
