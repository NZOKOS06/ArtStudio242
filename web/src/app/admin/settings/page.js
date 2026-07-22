"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAdminGuard } from "../../../lib/useAdminGuard";
import AdminShell from "../../../components/AdminShell";
import styles from "../admin.module.css";

const FIELDS = [
  ["brandName", "Nom de la marque"],
  ["tagline", "Tagline"],
  ["logoUrl", "URL du logo"],
  ["heroEyebrow", "Hero — eyebrow"],
  ["heroTitle", "Hero — titre"],
  ["heroSubtitle", "Hero — sous-titre"],
  ["heroCtaPrimary", "CTA principal"],
  ["heroCtaSecondary", "CTA secondaire"],
  ["promoBanner", "Bannière promo"],
  ["promoActive", "Promo active (true/false)"],
  ["contactBanner", "Bannière contact"],
  ["phone", "Téléphone"],
  ["whatsapp", "WhatsApp (ex: 242069167515)"],
  ["email", "Email"],
  ["instagram", "Instagram URL"],
  ["facebook", "Facebook URL"],
  ["tiktok", "TikTok URL"],
  ["address", "Adresse"],
  ["country", "Pays"],
  ["metaTitle", "SEO titre"],
  ["metaDescription", "SEO description"],
];

export default function AdminSettingsPage() {
  const ready = useAdminGuard();
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!ready) return;
    api.get("/api/settings").then(setForm).catch(console.error);
  }, [ready]);

  async function onUploadLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploaded = await api.upload(file);
    setForm((f) => ({ ...f, logoUrl: uploaded.url }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const updated = await api.put("/api/settings", form);
    setForm(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!ready) return null;

  return (
    <AdminShell title="Paramètres">
      <div className={styles.panel}>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 720 }}>
          <label style={{ display: "grid", gap: 6, fontWeight: 700 }}>
            Upload logo
            <input type="file" accept="image/*" onChange={onUploadLogo} />
          </label>
          {FIELDS.map(([key, label]) => (
            <label key={key} style={{ display: "grid", gap: 6, fontWeight: 700 }}>
              {label}
              {key === "metaDescription" || key === "heroSubtitle" ? (
                <textarea
                  rows={3}
                  value={form[key] || ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                />
              ) : (
                <input
                  value={form[key] || ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                />
              )}
            </label>
          ))}
          {saved && <div style={{ color: "#0e4d27", fontWeight: 700 }}>Paramètres enregistrés</div>}
          <button className="btn btn-primary" type="submit">Enregistrer</button>
        </form>
      </div>
    </AdminShell>
  );
}
