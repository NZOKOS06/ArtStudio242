"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAdminGuard } from "../../../lib/useAdminGuard";
import { useLiveReload, useStudio } from "../../../lib/StudioContext";
import AdminShell from "../../../components/AdminShell";

const empty = { name: "", price: 15000, duration: "", photoCount: 20, features: "", color: "green", badge: "", isActive: true, isFeatured: false };

export default function AdminPacksPage() {
  const ready = useAdminGuard();
  const { notifyChange } = useStudio();
  const [packs, setPacks] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);

  async function load() { setPacks(await api.get("/api/packs?all=1", { cache: "no-store" })); }
  useLiveReload(["packs", "settings"], () => { if (ready) load().catch(console.error); });
  useEffect(() => { if (ready) load().catch(console.error); }, [ready]);

  function closeForm() { setOpen(false); setEditingId(null); setForm(empty); }

  async function onSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      photoCount: form.photoCount ? Number(form.photoCount) : null,
      features: form.features.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    if (editingId) await api.put(`/api/packs/${editingId}`, payload);
    else await api.post("/api/packs", payload);
    notifyChange("packs"); closeForm(); await load();
  }

  function edit(pack) {
    setEditingId(pack.id);
    setForm({ name: pack.name, price: pack.price, duration: pack.duration || "", photoCount: pack.photoCount || "", features: (pack.features || []).join("\n"), color: pack.color || "green", badge: pack.badge || "", isActive: pack.isActive, isFeatured: pack.isFeatured });
    setOpen(true);
  }

  async function remove(id) {
    if (!confirm("Supprimer ce pack ?")) return;
    await api.delete(`/api/packs/${id}`); notifyChange("packs"); await load();
  }

  if (!ready) return (
    <AdminShell title="Packs">
      <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
    </AdminShell>
  );

  return (
    <AdminShell title="Packs">
      <div className="admin-toolbar">
        <div>
          <p className="text-white font-bold">{packs.length} pack(s)</p>
          <p className="text-xs text-white/30 mt-0.5">Gérez les offres visibles sur le site</p>
        </div>
        {!open && <button className="btn-primary-sm" type="button" onClick={() => setOpen(true)}>+ Ajouter un pack</button>}
      </div>

      {open && (
        <div className="admin-panel mb-6 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-white">{editingId ? "Modifier le pack" : "Nouveau pack"}</h3>
            <button className="text-xs text-white/40 hover:text-white" type="button" onClick={closeForm}>✕ Fermer</button>
          </div>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <input className="admin-input" placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="admin-input" type="number" placeholder="Prix" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <input className="admin-input" placeholder="Durée (ex: 2h)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <textarea className="admin-textarea md:col-span-2" placeholder="Features (1 par ligne)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={4} />
            <div className="flex flex-col gap-3">
              <select className="admin-select" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}>
                <option value="green">Vert</option>
                <option value="gold">Or</option>
                <option value="red">Rouge</option>
                <option value="black">Noir</option>
              </select>
              <input className="admin-input" placeholder="Badge (ex: Populaire)" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
            </div>
            <div className="flex gap-6 items-center md:col-span-2 lg:col-span-3">
              <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                <input type="checkbox" className="accent-primary" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Actif
              </label>
              <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                <input type="checkbox" className="accent-primary" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                Mis en avant
              </label>
            </div>
            <div className="flex gap-2 md:col-span-2 lg:col-span-3">
              <button className="btn-primary-sm" type="submit">{editingId ? "Enregistrer" : "Créer le pack"}</button>
              <button className="btn-admin btn-admin-default" type="button" onClick={closeForm}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-panel">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr><th>Nom</th><th>Prix</th><th>Durée</th><th>Badge</th><th>Actif</th><th></th></tr>
            </thead>
            <tbody>
              {packs.map((p) => (
                <tr key={p.id}>
                  <td className="font-semibold text-white">{p.name}</td>
                  <td className="text-primary font-bold">{p.price.toLocaleString("fr-FR")} FCFA</td>
                  <td>{p.duration || "—"}</td>
                  <td>{p.badge ? <span className="badge badge-confirmed">{p.badge}</span> : "—"}</td>
                  <td><span className={p.isActive ? "badge badge-confirmed" : "badge badge-cancelled"}>{p.isActive ? "Oui" : "Non"}</span></td>
                  <td>
                    <div className="flex gap-1.5">
                      <button className="btn-admin btn-admin-default" type="button" onClick={() => edit(p)}>Éditer</button>
                      <button className="btn-admin btn-admin-danger" type="button" onClick={() => remove(p.id)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!packs.length && <tr><td colSpan={6} className="text-center text-white/30 py-10">Aucun pack</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
