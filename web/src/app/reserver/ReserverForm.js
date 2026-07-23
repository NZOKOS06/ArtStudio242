"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";
import { useStudio } from "../../lib/StudioContext";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import styles from "../site.module.css";

export default function ReserverForm() {
  const searchParams = useSearchParams();
  const { settings, packs } = useStudio();
  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    packId: "",
    preferredAt: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const slug = searchParams.get("pack");
    if (slug && packs.length) {
      const match = packs.find((x) => x.slug === slug);
      if (match) setForm((f) => ({ ...f, packId: match.id }));
    }
  }, [searchParams, packs]);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      await api.post("/api/bookings", {
        ...form,
        clientEmail: form.clientEmail || null,
        preferredAt: form.preferredAt
          ? new Date(form.preferredAt).toISOString()
          : null,
        packId: form.packId || null,
      });
      setStatus({
        type: "success",
        message: "Demande envoyée ! Nous vous recontactons rapidement.",
      });
      setForm({
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        packId: "",
        preferredAt: "",
        message: "",
      });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  const whatsapp = settings.whatsapp || "242069167515";

  return (
    <>
      <SiteHeader settings={settings} />
      <main className="section container">
        <div className="section-head">
          <div className="eyebrow">Réservation</div>
          <h2>
            Prenez <span className="script">rendez-vous</span>
          </h2>
        </div>

        <div className="grid-2">
          <form className={styles.formCard} onSubmit={onSubmit}>
            <div className={styles.formGrid}>
              <label className={styles.label}>
                Nom complet
                <input
                  className={styles.input}
                  required
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                />
              </label>
              <label className={styles.label}>
                Téléphone / WhatsApp
                <input
                  className={styles.input}
                  required
                  value={form.clientPhone}
                  onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                />
              </label>
              <label className={styles.label}>
                Email (optionnel)
                <input
                  className={styles.input}
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                />
              </label>
              <label className={styles.label}>
                Pack
                <select
                  className={styles.select}
                  value={form.packId}
                  onChange={(e) => setForm({ ...form, packId: e.target.value })}
                >
                  <option value="">À définir</option>
                  {packs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.price.toLocaleString("fr-FR")} FCFA
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.label}>
                Date souhaitée
                <input
                  className={styles.input}
                  type="datetime-local"
                  value={form.preferredAt}
                  onChange={(e) => setForm({ ...form, preferredAt: e.target.value })}
                />
              </label>
              <label className={styles.label}>
                Message
                <textarea
                  className={styles.textarea}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Décrivez votre projet photo..."
                />
              </label>

              {status.message && (
                <div
                  className={
                    status.type === "success" ? styles.success : styles.error
                  }
                >
                  {status.message}
                </div>
              )}

              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Envoi..." : "Envoyer ma demande"}
              </button>
            </div>
          </form>

          <aside>
            <div className={styles.formCard}>
              <h3 style={{ marginBottom: 12 }}>Besoin d&apos;aide ?</h3>
              <p style={{ color: "var(--ink-soft)", marginBottom: 18 }}>
                Vous pouvez aussi réserver directement via WhatsApp — réponse rapide.
              </p>
              <a
                className="btn btn-gold"
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ouvrir WhatsApp
              </a>
              <div style={{ marginTop: 24 }}>
                <Link href="/#packs" className="btn btn-outline">
                  Voir les packs
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
