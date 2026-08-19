"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAdminGuard } from "../../lib/useAdminGuard";
import { useLiveReload } from "../../lib/StudioContext";
import AdminShell from "../../components/AdminShell";

function StatusBadge({ status }) {
  const map = {
    PENDING: "badge badge-pending",
    CONFIRMED: "badge badge-confirmed",
    COMPLETED: "badge badge-completed",
    CANCELLED: "badge badge-cancelled",
  };
  return <span className={map[status] || "badge badge-pending"}>{status}</span>;
}

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
    return (
      <AdminShell title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminShell>
    );
  }

  const statCards = [
    { label: "Réservations", value: stats?.bookings ?? "—", color: "text-blue-400" },
    { label: "En attente", value: stats?.pending ?? "—", color: "text-yellow-400" },
    { label: "Avis à valider", value: stats?.pendingReviews ?? "—", color: "text-orange-400" },
    { label: "Photos galerie", value: stats?.images ?? "—", color: "text-primary" },
  ];

  return (
    <AdminShell title="Dashboard">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white/3 border border-white/8 rounded-2xl px-6 py-5">
            <p className="text-xs text-white/30 font-bold uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`font-display font-black text-3xl ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="admin-panel">
        <div className="px-6 py-4 border-b border-white/8">
          <h3 className="text-sm font-bold text-white">Dernières réservations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
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
                  <td className="font-medium text-white">{b.clientName}</td>
                  <td>{b.clientPhone}</td>
                  <td>{b.packName || "—"}</td>
                  <td><StatusBadge status={b.status} /></td>
                </tr>
              ))}
              {!stats?.recentBookings?.length && (
                <tr>
                  <td colSpan={4} className="text-center text-white/30 py-8">Aucune réservation récente</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
