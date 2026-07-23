"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAdminGuard } from "../../lib/useAdminGuard";
import { useLiveReload } from "../../lib/StudioContext";
import AdminShell from "../../components/AdminShell";
import styles from "./admin.module.css";

export default function AdminDashboardPage() {
  const ready = useAdminGuard();
  const [stats, setStats] = useState(null);

  function load() {
    return api.get("/api/dashboard/stats", { cache: "no-store" }).then(setStats);
  }

  useEffect(() => {
    if (!ready) return;
    load().catch(console.error);
  }, [ready]);

  useLiveReload(["bookings", "reviews", "gallery", "packs"], () => {
    if (ready) load().catch(console.error);
  });

  if (!ready) {
    return <AdminShell title="Dashboard" subtitle="Vue d’ensemble de l’activité" loading />;
  }

  return (
    <AdminShell title="Dashboard" subtitle="Vue d’ensemble de l’activité">
      <div className={styles.cards}>
        <div className={styles.stat}>
          <span>Réservations</span>
          <strong>{stats?.bookings ?? "—"}</strong>
        </div>
        <div className={styles.stat}>
          <span>En attente</span>
          <strong>{stats?.pending ?? "—"}</strong>
        </div>
        <div className={styles.stat}>
          <span>Avis à valider</span>
          <strong>{stats?.pendingReviews ?? "—"}</strong>
        </div>
        <div className={styles.stat}>
          <span>Photos galerie</span>
          <strong>{stats?.images ?? "—"}</strong>
        </div>
      </div>

      <div className={styles.panel}>
        <h3 style={{ marginBottom: 12 }}>Dernières réservations</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Client</th>
              <th>Téléphone</th>
              <th>Pack</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {(stats?.recentBookings || []).map((b) => (
              <tr key={b.id}>
                <td>{b.clientName}</td>
                <td>{b.clientPhone}</td>
                <td>{b.packName || "—"}</td>
                <td>
                  <span className={`${styles.badge} ${styles[`badge${b.status[0]}${b.status.slice(1).toLowerCase()}`] || ""}`}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
