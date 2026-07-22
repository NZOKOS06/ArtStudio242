"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAdminGuard } from "../../../lib/useAdminGuard";
import AdminShell from "../../../components/AdminShell";
import styles from "../admin.module.css";

export default function AdminBookingsPage() {
  const ready = useAdminGuard();
  const [bookings, setBookings] = useState([]);

  async function load() {
    const data = await api.get("/api/bookings");
    setBookings(data);
  }

  useEffect(() => {
    if (ready) load().catch(console.error);
  }, [ready]);

  async function updateStatus(id, status) {
    await api.patch(`/api/bookings/${id}`, { status });
    await load();
  }

  if (!ready) return null;

  return (
    <AdminShell title="Réservations">
      <div className={styles.panel}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Client</th>
              <th>Contact</th>
              <th>Pack</th>
              <th>Date souhaitée</th>
              <th>Message</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.clientName}</td>
                <td>
                  {b.clientPhone}
                  <br />
                  <small>{b.clientEmail}</small>
                </td>
                <td>{b.packName || "—"}</td>
                <td>{b.preferredAt ? new Date(b.preferredAt).toLocaleString("fr-FR") : "—"}</td>
                <td>{b.message || "—"}</td>
                <td>
                  <div className={styles.rowActions}>
                    <span className={styles.badge}>{b.status}</span>
                    <button className="btn btn-outline" type="button" onClick={() => updateStatus(b.id, "CONFIRMED")}>
                      Confirmer
                    </button>
                    <button className="btn btn-outline" type="button" onClick={() => updateStatus(b.id, "COMPLETED")}>
                      Terminé
                    </button>
                    <button className="btn btn-outline" type="button" onClick={() => updateStatus(b.id, "CANCELLED")}>
                      Annuler
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
