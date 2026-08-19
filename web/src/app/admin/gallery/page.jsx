"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAdminGuard } from "../../../lib/useAdminGuard";
import { useLiveReload, useStudio } from "../../../lib/StudioContext";
import AdminShell from "../../../components/AdminShell";

const empty = { title: "", imageUrl: "", categoryId: "", isFeatured: true, isActive: true };

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
    setImages(imgs); setCategories(cats);
  }
  useLiveReload(["gallery", "categories"], () => { if (ready) load().catch(console.error); });
  useEffect(() => { if (ready) load().catch(console.error); }, [ready]);

  function closeForm() { setOpen(false); setForm(empty); }

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploaded = await api.upload(file);
    setForm((f) => ({ ...f, imageUrl: uploaded.url }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    await api.post("/api/gallery", { ...form, categoryId: form.categoryId || null });
    notifyChange("gallery"); closeForm(); await load();
  }

  async function remove(id) {
    if (!confirm("Supprimer cette image ?")) return;
    await api.delete(`/api/gallery/${id}`); notifyChange("gallery"); await load();
  }

  if (!ready) return (
    <AdminShell title="Galerie">
      <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
    </AdminShell>
  );

  return (
    <AdminShell title="Galerie">
      <div className="admin-toolbar">
        <div>
          <p className="text-white font-bold">{images.length} photo(s)</p>
          <p className="text-xs text-white/30 mt-0.5">Ajoutez des images au portfolio</p>
        </div>
        {!open && <button className="btn-primary-sm" type="button" onClick={() => setOpen(true)}>+ Ajouter une photo</button>}
      </div>

      {open && (
        <div className="admin-panel mb-6 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-white">Nouvelle photo</h3>
            <button className="text-xs text-white/40 hover:text-white" type="button" onClick={closeForm}>✕ Fermer</button>
          </div>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="admin-input" placeholder="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="admin-input" placeholder="URL image" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required />
            <div>
              <p className="text-xs text-white/40 mb-2">Uploader une image</p>
              <input type="file" accept="image/*" onChange={onUpload} className="text-sm text-white/50 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-colors" />
            </div>
            <select className="admin-select" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Sans catégorie</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
              <input type="checkbox" className="accent-primary" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
              Mise en avant
            </label>
            <div className="flex gap-2 md:col-span-2">
              <button className="btn-primary-sm" type="submit">Ajouter la photo</button>
              <button className="btn-admin btn-admin-default" type="button" onClick={closeForm}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Image grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden bg-white/3 border border-white/8">
            <img src={api.assetUrl(img.imageUrl)} alt={img.title || ""} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
              <p className="text-xs text-white text-center font-semibold truncate w-full">{img.title || "Sans titre"}</p>
              <button
                className="btn-admin btn-admin-danger text-xs"
                type="button"
                onClick={() => remove(img.id)}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
        {!images.length && (
          <div className="col-span-full text-center text-white/30 py-16">Aucune photo</div>
        )}
      </div>
    </AdminShell>
  );
}
