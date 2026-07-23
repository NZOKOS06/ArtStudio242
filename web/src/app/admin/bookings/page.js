"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAdminGuard } from "../../../lib/useAdminGuard";
import { useLiveReload, useStudio } from "../../../lib/StudioContext";
import AdminShell from "../../../components/AdminShell";
import styles from "../admin.module.css";

const empty = {
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  packId: "",
  preferredAt: "",
  message: "",
};

export default function AdminBookingsPage() {
  const ready = useAdminGuard();
  const { notifyChange } = useStudio();
  const [bookings, setBookings] = useState([]);
  const [packs, setPacks] = useState([]);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  async function load() {
    const [data, packList] = await Promise.all([
      api.get("/api/bookings", { cache: "no-store" }),
      api.get("/api/packs?all=1", { cache: "no-store" }),
    ]);
    setBookings(data);
    setPacks(packList);
  }

  useLiveReload(["bookings", "packs"], () => {
    if (ready) load().catch(console.error);
  });

  useEffect(() => {
    if (ready) load().catch(console.error);
  }, [ready]);

  function closeForm() {
    setOpen(false);
    setForm(empty);
  }

  async function updateStatus(id, status) {
    await api.patch(`/api/bookings/${id}`, { status });
    notifyChange("bookings");
    await load();
  }

  async function onSubmit(e) {
    e.preventDefault();
    await api.post("/api/bookings", {
      ...form,
      clientEmail: form.clientEmail || null,
      packId: form.packId || null,
      preferredAt: form.preferredAt ? new Date(form.preferredAt).toISOString() : null,
    });
    notifyChange("bookings");
    closeForm();
    await load();
  }

  if (!ready) {
    return <AdminShell title="Réservations" subtitle="Demandes clients et suivi" loading />;
  }

  return (
    <AdminShell title="Réservations" subtitle="Demandes clients et suivi">
      <div className={styles.toolbar}>
        <div>
          <div className={styles.toolbarTitle}>{bookings.length} réservation(s)</div>
          <div className={styles.toolbarHint}>Confirmez, terminez ou annulez les demandes</div>
        </div>
        {!open && (
          <button className="btn btn-primary btn-sm" type="button" onClick={() => setOpen(true)}>
            + Ajouter une réservation
          </button>
        )}
      </div>

      {open && (
        <div className={styles.composer}>
          <div className={styles.composerHead}>
            <h3>Nouvelle réservation</h3>
            <button className="btn btn-ghost btn-sm" type="button" onClick={closeForm}>Fermer</button>
          </div>
          <form onSubmit={onSubmit} className={styles.composerGrid}>
            <input placeholder="Nom client" required value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
            <input placeholder="Téléphone" required value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} />
            <input placeholder="Email (optionnel)" type="email" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} />
            <select value={form.packId} onChange={(e) => setForm({ ...form, packId: e.target.value })}>
              <option value="">Pack à définir</option>
              {packs.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input type="datetime-local" value={form.preferredAt} onChange={(e) => setForm({ ...form, preferredAt: e.target.value })} />
            <textarea placeholder="Message" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <div className={styles.composerActions}>
              <button className="btn btn-primary btn-sm" type="submit">Créer</button>
              <button className="btn btn-outline btn-sm" type="button" onClick={closeForm}>Annuler</button>
            </div>
          </form>
        </div>
      )}

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
                    <button className={`${styles.actionBtn} ${styles.actionBtnOk}`} type="button" onClick={() => updateStatus(b.id, "CONFIRMED")}>
                      Confirmer
                    </button>
                    <button className={styles.actionBtn} type="button" onClick={() => updateStatus(b.id, "COMPLETED")}>
                      Terminé
                    </button>
                    <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} type="button" onClick={() => updateStatus(b.id, "CANCELLED")}>
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
