"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAdminGuard } from "../../../lib/useAdminGuard";
import { useLiveReload, useStudio } from "../../../lib/StudioContext";
import AdminShell from "../../../components/AdminShell";

const empty = { clientName: "", clientPhone: "", clientEmail: "", packId: "", preferredAt: "", message: "" };

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

function StatusBadge({ status }) {
  const map = {
    PENDING: "badge badge-pending",
    CONFIRMED: "badge badge-confirmed",
    COMPLETED: "badge badge-completed",
    CANCELLED: "badge badge-cancelled",
  };
  return <span className={map[status] || "badge badge-pending"}>{status}</span>;
}

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

  useLiveReload(["bookings", "packs"], () => { if (ready) load().catch(console.error); });
  useEffect(() => { if (ready) load().catch(console.error); }, [ready]);

  function closeForm() { setOpen(false); setForm(empty); }

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
    return (
      <AdminShell title="Réservations">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Réservations">
      <div className="admin-toolbar">
        <div>
          <p className="text-white font-bold">{bookings.length} réservation(s)</p>
          <p className="text-xs text-white/30 mt-0.5">Confirmez, terminez ou annulez les demandes</p>
        </div>
        {!open && (
          <button className="btn-primary-sm" type="button" onClick={() => setOpen(true)}>
            + Ajouter
          </button>
        )}
      </div>

      {/* Add form */}
      {open && (
        <div className="admin-panel mb-6 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-white">Nouvelle réservation</h3>
            <button className="text-xs text-white/40 hover:text-white" type="button" onClick={closeForm}>✕ Fermer</button>
          </div>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <input className="admin-input" placeholder="Nom client" required value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
            <input className="admin-input" placeholder="Téléphone" required value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} />
            <input className="admin-input" placeholder="Email (optionnel)" type="email" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} />
            <select className="admin-select" value={form.packId} onChange={(e) => setForm({ ...form, packId: e.target.value })}>
              <option value="">Pack à définir</option>
              {packs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input className="admin-input [color-scheme:dark]" type="datetime-local" value={form.preferredAt} onChange={(e) => setForm({ ...form, preferredAt: e.target.value })} />
            <textarea className="admin-textarea" placeholder="Message" rows={2} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <div className="flex gap-2 md:col-span-2 lg:col-span-3">
              <button className="btn-primary-sm" type="submit">Créer</button>
              <button className="btn-admin btn-admin-default" type="button" onClick={closeForm}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="admin-panel">
        <div className="overflow-x-auto">
          <table className="admin-table">
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
                  <td className="font-semibold text-white">{b.clientName}</td>
                  <td>
                    <div>{b.clientPhone}</div>
                    {b.clientEmail && <div className="text-xs text-white/40">{b.clientEmail}</div>}
                  </td>
                  <td>{b.packName || "—"}</td>
                  <td>{b.preferredAt ? new Date(b.preferredAt).toLocaleString("fr-FR") : "—"}</td>
                  <td className="max-w-[160px] truncate">{b.message || "—"}</td>
                  <td>
                    <div className="flex flex-col gap-1.5">
                      <StatusBadge status={b.status} />
                      <div className="flex gap-1.5 flex-wrap">
                        <button className="btn-admin btn-admin-ok" type="button" onClick={() => updateStatus(b.id, "CONFIRMED")}>Confirmer</button>
                        <button className="btn-admin btn-admin-default" type="button" onClick={() => updateStatus(b.id, "COMPLETED")}>Terminé</button>
                        <button className="btn-admin btn-admin-danger" type="button" onClick={() => updateStatus(b.id, "CANCELLED")}>Annuler</button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {!bookings.length && (
                <tr><td colSpan={6} className="text-center text-white/30 py-10">Aucune réservation</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
