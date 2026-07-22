"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import styles from "../site.module.css";

export default function AvisPage() {
  const [settings, setSettings] = useState({});
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ authorName: "", rating: 5, comment: "" });
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    Promise.all([api.get("/api/settings"), api.get("/api/reviews")])
      .then(([s, r]) => {
        setSettings(s);
        setReviews(r);
      })
      .catch(() => {});
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/api/reviews", {
        ...form,
        rating: Number(form.rating),
      });
      setStatus({ type: "success", message: res.message || "Merci pour votre avis !" });
      setForm({ authorName: "", rating: 5, comment: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  return (
    <>
      <SiteHeader settings={settings} />
      <main className="section container">
        <div className="section-head">
          <div className="eyebrow">Témoignages</div>
          <h2>
            Avis <span className="script">clients</span>
          </h2>
        </div>

        <div className="grid-2">
          <div className="grid-1" style={{ display: "grid", gap: 16 }}>
            {reviews.map((r) => (
              <article key={r.id} className={styles.reviewCard}>
                <div className={styles.stars}>{"★".repeat(r.rating)}</div>
                <p style={{ margin: "12px 0" }}>&ldquo;{r.comment}&rdquo;</p>
                <strong>{r.authorName}</strong>
              </article>
            ))}
          </div>

          <form className={styles.formCard} onSubmit={onSubmit}>
            <h3 style={{ marginBottom: 16 }}>Laisser un avis</h3>
            <div className={styles.formGrid}>
              <label className={styles.label}>
                Votre nom
                <input
                  className={styles.input}
                  required
                  value={form.authorName}
                  onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                />
              </label>
              <label className={styles.label}>
                Note
                <select
                  className={styles.select}
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} ★
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.label}>
                Commentaire
                <textarea
                  className={styles.textarea}
                  required
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                />
              </label>
              {status.message && (
                <div className={status.type === "success" ? styles.success : styles.error}>
                  {status.message}
                </div>
              )}
              <button className="btn btn-primary" type="submit">
                Publier
              </button>
            </div>
          </form>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
