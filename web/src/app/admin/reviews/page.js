"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAdminGuard } from "../../../lib/useAdminGuard";
import { useLiveReload, useStudio } from "../../../lib/StudioContext";
import AdminShell from "../../../components/AdminShell";
import styles from "../admin.module.css";

export default function AdminReviewsPage() {
  const ready = useAdminGuard();
  const { notifyChange } = useStudio();
  const [reviews, setReviews] = useState([]);

  async function load() {
    setReviews(await api.get("/api/reviews?all=1", { cache: "no-store" }));
  }

  useLiveReload("reviews", () => {
    if (ready) load().catch(console.error);
  });

  useEffect(() => {
    if (ready) load().catch(console.error);
  }, [ready]);

  async function approve(id, isApproved) {
    await api.patch(`/api/reviews/${id}`, { isApproved });
    notifyChange("reviews");
    await load();
  }

  async function remove(id) {
    if (!confirm("Supprimer cet avis ?")) return;
    await api.delete(`/api/reviews/${id}`);
    notifyChange("reviews");
    await load();
  }

  if (!ready) {
    return <AdminShell title="Avis" subtitle="Modération des témoignages" loading />;
  }

  return (
    <AdminShell title="Avis" subtitle="Modération des témoignages">
      <div className={styles.panel}>
        <table className={styles.table}>
          <thead>
            <tr><th>Auteur</th><th>Note</th><th>Commentaire</th><th>Statut</th><th></th></tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td>{r.authorName}</td>
                <td>{"★".repeat(r.rating)}</td>
                <td>{r.comment}</td>
                <td>{r.isApproved ? "Publié" : "En attente"}</td>
                <td className={styles.rowActions}>
                  {!r.isApproved && (
                    <button className={`${styles.actionBtn} ${styles.actionBtnOk}`} type="button" onClick={() => approve(r.id, true)}>
                      Approuver
                    </button>
                  )}
                  {r.isApproved && (
                    <button className={styles.actionBtn} type="button" onClick={() => approve(r.id, false)}>
                      Masquer
                    </button>
                  )}
                  <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} type="button" onClick={() => remove(r.id)}>
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
