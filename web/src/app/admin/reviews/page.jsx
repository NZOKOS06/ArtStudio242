"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAdminGuard } from "../../../lib/useAdminGuard";
import { useLiveReload, useStudio } from "../../../lib/StudioContext";
import AdminShell from "../../../components/AdminShell";

export default function AdminReviewsPage() {
  const ready = useAdminGuard();
  const { notifyChange } = useStudio();
  const [reviews, setReviews] = useState([]);

  async function load() { setReviews(await api.get("/api/reviews?all=1", { cache: "no-store" })); }
  useLiveReload("reviews", () => { if (ready) load().catch(console.error); });
  useEffect(() => { if (ready) load().catch(console.error); }, [ready]);

  async function approve(id, isApproved) {
    await api.patch(`/api/reviews/${id}`, { isApproved });
    notifyChange("reviews"); await load();
  }

  async function remove(id) {
    if (!confirm("Supprimer cet avis ?")) return;
    await api.delete(`/api/reviews/${id}`); notifyChange("reviews"); await load();
  }

  if (!ready) return (
    <AdminShell title="Avis">
      <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
    </AdminShell>
  );

  return (
    <AdminShell title="Avis">
      <div className="admin-panel">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr><th>Auteur</th><th>Note</th><th>Commentaire</th><th>Statut</th><th></th></tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td className="font-semibold text-white">{r.authorName}</td>
                  <td className="text-yellow-400">{"★".repeat(r.rating)}</td>
                  <td className="max-w-[240px]"><p className="line-clamp-2 text-white/60">{r.comment}</p></td>
                  <td>
                    <span className={r.isApproved ? "badge badge-confirmed" : "badge badge-pending"}>
                      {r.isApproved ? "Publié" : "En attente"}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1.5">
                      {!r.isApproved && <button className="btn-admin btn-admin-ok" type="button" onClick={() => approve(r.id, true)}>Approuver</button>}
                      {r.isApproved && <button className="btn-admin btn-admin-default" type="button" onClick={() => approve(r.id, false)}>Masquer</button>}
                      <button className="btn-admin btn-admin-danger" type="button" onClick={() => remove(r.id)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!reviews.length && <tr><td colSpan={5} className="text-center text-white/30 py-10">Aucun avis</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
