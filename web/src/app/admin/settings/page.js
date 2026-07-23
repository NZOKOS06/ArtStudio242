"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { useAdminGuard } from "../../../lib/useAdminGuard";
import { useStudio } from "../../../lib/StudioContext";
import AdminShell from "../../../components/AdminShell";
import styles from "../admin.module.css";

const SECTIONS = [
  { id: "brand", label: "Identité" },
  { id: "hero", label: "Hero" },
  { id: "promo", label: "Promotion" },
  { id: "contact", label: "Contact" },
  { id: "social", label: "Réseaux" },
  { id: "seo", label: "SEO" },
];

function Field({ label, hint, children, full }) {
  return (
    <div className={`${styles.field} ${full ? styles.fieldFull : ""}`}>
      <label>{label}</label>
      {children}
      {hint ? <span className={styles.fieldHint}>{hint}</span> : null}
    </div>
  );
}

export default function AdminSettingsPage() {
  const ready = useAdminGuard();
  const router = useRouter();
  const { refresh, applySettings, clearStudioStorage } = useStudio();
  const [form, setForm] = useState({});
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [activeSection, setActiveSection] = useState("brand");

  useEffect(() => {
    if (!ready) return;
    setLoadingData(true);
    api
      .get("/api/settings", { cache: "no-store" })
      .then((data) => {
        const raw = data || {};
        const banner = String(raw.promoBanner || "");
        const parts = banner.split(/\s*[—–]\s*|\s+-\s+/).map((s) => s.trim()).filter(Boolean);
        const title = parts[0] || "OFFRE DE LANCEMENT";
        const detail = parts.slice(1).join(" — ");
        const pctMatch = detail.match(/-?\d+\s*%/);
        const promoPct = pctMatch ? pctMatch[0].replace(/\s+/g, "") : raw.promoPct || "";
        const promoText = pctMatch
          ? detail.replace(pctMatch[0], "").replace(/^[\s—–-]+/, "").trim()
          : detail || raw.promoText || "";
        setForm({
          ...raw,
          promoTitle: raw.promoTitle || title,
          promoPct: raw.promoPct || promoPct,
          promoText: raw.promoText || promoText,
        });
      })
      .catch((err) => setStatus({ type: "error", message: err.message }))
      .finally(() => setLoadingData(false));
  }, [ready]);

  useEffect(() => {
    if (!ready || loadingData || saving) return;
    const onLive = (e) => {
      if (e.detail?.entity !== "settings") return;
      api.get("/api/settings", { cache: "no-store" }).then((data) => {
        const raw = data || {};
        const banner = String(raw.promoBanner || "");
        const parts = banner.split(/\s*[—–]\s*|\s+-\s+/).map((s) => s.trim()).filter(Boolean);
        const title = parts[0] || "OFFRE DE LANCEMENT";
        const detail = parts.slice(1).join(" — ");
        const pctMatch = detail.match(/-?\d+\s*%/);
        const promoPct = pctMatch ? pctMatch[0].replace(/\s+/g, "") : raw.promoPct || "";
        const promoText = pctMatch
          ? detail.replace(pctMatch[0], "").replace(/^[\s—–-]+/, "").trim()
          : detail || raw.promoText || "";
        setForm({
          ...raw,
          promoTitle: raw.promoTitle || title,
          promoPct: raw.promoPct || promoPct,
          promoText: raw.promoText || promoText,
        });
      });
    };
    window.addEventListener("as242:live", onLive);
    return () => window.removeEventListener("as242:live", onLive);
  }, [ready, loadingData, saving]);

  useEffect(() => {
    if (!ready || loadingData) return;
    const nodes = SECTIONS.map((s) => document.getElementById(`settings-${s.id}`)).filter(Boolean);
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          setActiveSection(visible.target.id.replace("settings-", ""));
        }
      },
      { root: null, rootMargin: "-20% 0px -55% 0px", threshold: [0.2, 0.5, 0.8] }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [ready, loadingData]);

  const logoPreview = useMemo(() => {
    if (!form.logoUrl) return "";
    return api.assetUrl(form.logoUrl);
  }, [form.logoUrl]);

  function setValue(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setStatus({ type: "", message: "" });
  }

  async function onUploadLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await api.upload(file);
      setValue("logoUrl", uploaded.url);
      setStatus({ type: "success", message: "Logo uploadé — pensez à enregistrer." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: "", message: "" });
    try {
      const updated = await api.put("/api/settings", form);
      setForm(updated);
      clearStudioStorage();
      applySettings(updated);
      await refresh(true);
      router.refresh();
      setStatus({
        type: "success",
        message: "Paramètres enregistrés — synchronisés en direct sur le site.",
      });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  }

  function scrollToSection(id) {
    setActiveSection(id);
    document.getElementById(`settings-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function SaveBar({ bottom = false }) {
    return (
      <div className={`${styles.saveBar} ${bottom ? styles.saveBarBottom : ""}`}>
        <div
          className={`${styles.saveStatus} ${
            status.type === "error" ? styles.saveStatusError : ""
          }`}
        >
          {status.message || "Modifiez une section puis enregistrez."}
        </div>
        <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer les paramètres"}
        </button>
      </div>
    );
  }

  if (!ready) {
    return <AdminShell title="Paramètres" subtitle="Configuration de la plateforme" loading />;
  }

  return (
    <AdminShell
      title="Paramètres"
      subtitle="Personnalisez l’identité, le contenu et les contacts du studio"
      loading={loadingData}
    >
      <form onSubmit={onSubmit}>
        <SaveBar />

        <div className={styles.settingsLayout}>
          <aside className={styles.settingsNav} aria-label="Sections paramètres">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`${styles.settingsNavBtn} ${
                  activeSection === section.id ? styles.settingsNavBtnActive : ""
                }`}
                onClick={() => scrollToSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </aside>

          <div className={styles.settingsSections}>
            <section id="settings-brand" className={styles.settingsSection}>
              <div className={styles.sectionHead}>
                <div className={styles.sectionEyebrow}>01 — Marque</div>
                <h2>Identité visuelle</h2>
                <p>Logo, nom et signature du studio visibles sur tout le site.</p>
              </div>
              <div className={styles.sectionBody}>
                <div className={styles.logoRow}>
                  <div className={styles.logoPreview}>
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo actuel" />
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "#5a5248", textAlign: "center", padding: 8 }}>
                        Aucun logo
                      </span>
                    )}
                  </div>
                  <div className={styles.logoActions}>
                    <Field label="Importer un logo" hint="PNG ou JPG, fond transparent recommandé.">
                      <input type="file" accept="image/*" onChange={onUploadLogo} />
                    </Field>
                    <Field label="URL du logo" hint="Ou collez une URL d’image existante.">
                      <input
                        value={form.logoUrl || ""}
                        onChange={(e) => setValue("logoUrl", e.target.value)}
                        placeholder="/uploads/logo.png"
                      />
                    </Field>
                  </div>
                </div>

                <div className={styles.fieldGrid}>
                  <Field label="Nom de la marque">
                    <input
                      value={form.brandName || ""}
                      onChange={(e) => setValue("brandName", e.target.value)}
                    />
                  </Field>
                  <Field label="Tagline">
                    <input
                      value={form.tagline || ""}
                      onChange={(e) => setValue("tagline", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section id="settings-hero" className={styles.settingsSection}>
              <div className={styles.sectionHead}>
                <div className={styles.sectionEyebrow}>02 — Accueil</div>
                <h2>Section Hero</h2>
                <p>Le premier écran que voient vos visiteurs. Un message clair, une promesse forte.</p>
              </div>
              <div className={styles.sectionBody}>
                <div className={styles.fieldGrid}>
                  <Field label="Eyebrow" hint="Petite ligne au-dessus du titre.">
                    <input
                      value={form.heroEyebrow || ""}
                      onChange={(e) => setValue("heroEyebrow", e.target.value)}
                    />
                  </Field>
                  <Field label="Titre principal">
                    <input
                      value={form.heroTitle || ""}
                      onChange={(e) => setValue("heroTitle", e.target.value)}
                    />
                  </Field>
                  <Field label="Sous-titre" full>
                    <textarea
                      rows={3}
                      value={form.heroSubtitle || ""}
                      onChange={(e) => setValue("heroSubtitle", e.target.value)}
                    />
                  </Field>
                  <Field label="Bouton principal">
                    <input
                      value={form.heroCtaPrimary || ""}
                      onChange={(e) => setValue("heroCtaPrimary", e.target.value)}
                    />
                  </Field>
                  <Field label="Bouton secondaire">
                    <input
                      value={form.heroCtaSecondary || ""}
                      onChange={(e) => setValue("heroCtaSecondary", e.target.value)}
                    />
                  </Field>
                  <Field label="Bannière contact" full>
                    <input
                      value={form.contactBanner || ""}
                      onChange={(e) => setValue("contactBanner", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section id="settings-promo" className={styles.settingsSection}>
              <div className={styles.sectionHead}>
                <div className={styles.sectionEyebrow}>03 — Offre</div>
                <h2>Promotion</h2>
                <p>Ces champs alimentent directement le ruban d’offre sur la page d’accueil.</p>
              </div>
              <div className={styles.sectionBody}>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleMeta}>
                    <strong>Afficher la promo</strong>
                    <span>Ruban d’offre visible dans le hero</span>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={form.promoActive !== "false"}
                      onChange={(e) => setValue("promoActive", e.target.checked ? "true" : "false")}
                    />
                    <span className={styles.toggleTrack} />
                  </label>
                </div>
                <div className={styles.fieldGrid}>
                  <Field label="Titre du ruban" hint='Ex: OFFRE DE LANCEMENT'>
                    <input
                      value={form.promoTitle || ""}
                      onChange={(e) => {
                        const promoTitle = e.target.value;
                        const promoPct = form.promoPct || "";
                        const promoText = form.promoText || "";
                        const promoBanner = [promoTitle, [promoPct, promoText].filter(Boolean).join(" ")]
                          .filter(Boolean)
                          .join(" — ");
                        setForm((prev) => ({ ...prev, promoTitle, promoBanner }));
                        setStatus({ type: "", message: "" });
                      }}
                    />
                  </Field>
                  <Field label="Réduction" hint="Ex: -70%">
                    <input
                      value={form.promoPct || ""}
                      onChange={(e) => {
                        const promoPct = e.target.value;
                        const promoTitle = form.promoTitle || "";
                        const promoText = form.promoText || "";
                        const promoBanner = [promoTitle, [promoPct, promoText].filter(Boolean).join(" ")]
                          .filter(Boolean)
                          .join(" — ");
                        setForm((prev) => ({ ...prev, promoPct, promoBanner }));
                        setStatus({ type: "", message: "" });
                      }}
                    />
                  </Field>
                  <Field label="Détail" hint="Ex: pour les 20 premiers clients" full>
                    <input
                      value={form.promoText || ""}
                      onChange={(e) => {
                        const promoText = e.target.value;
                        const promoTitle = form.promoTitle || "";
                        const promoPct = form.promoPct || "";
                        const promoBanner = [promoTitle, [promoPct, promoText].filter(Boolean).join(" ")]
                          .filter(Boolean)
                          .join(" — ");
                        setForm((prev) => ({ ...prev, promoText, promoBanner }));
                        setStatus({ type: "", message: "" });
                      }}
                    />
                  </Field>
                </div>
                <p className={styles.fieldHint}>
                  Aperçu enregistré : <strong>{form.promoBanner || "—"}</strong>
                </p>
              </div>
            </section>

            <section id="settings-contact" className={styles.settingsSection}>
              <div className={styles.sectionHead}>
                <div className={styles.sectionEyebrow}>04 — Coordonnées</div>
                <h2>Contact & localisation</h2>
                <p>Informations affichées dans le bloc contact et utilisées pour WhatsApp.</p>
              </div>
              <div className={styles.sectionBody}>
                <div className={styles.fieldGrid}>
                  <Field label="Téléphone">
                    <input value={form.phone || ""} onChange={(e) => setValue("phone", e.target.value)} />
                  </Field>
                  <Field label="WhatsApp" hint="Format international sans + (ex: 242069167515)">
                    <input
                      value={form.whatsapp || ""}
                      onChange={(e) => setValue("whatsapp", e.target.value)}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      value={form.email || ""}
                      onChange={(e) => setValue("email", e.target.value)}
                    />
                  </Field>
                  <Field label="Adresse">
                    <input
                      value={form.address || ""}
                      onChange={(e) => setValue("address", e.target.value)}
                    />
                  </Field>
                  <Field label="Pays" full>
                    <input
                      value={form.country || ""}
                      onChange={(e) => setValue("country", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section id="settings-social" className={styles.settingsSection}>
              <div className={styles.sectionHead}>
                <div className={styles.sectionEyebrow}>05 — Social</div>
                <h2>Réseaux sociaux</h2>
                <p>Liens vers vos profils — Instagram, Facebook, TikTok.</p>
              </div>
              <div className={styles.sectionBody}>
                <div className={styles.fieldGrid}>
                  <Field label="Instagram" full>
                    <input
                      value={form.instagram || ""}
                      onChange={(e) => setValue("instagram", e.target.value)}
                      placeholder="https://instagram.com/artstudio242"
                    />
                  </Field>
                  <Field label="Facebook">
                    <input
                      value={form.facebook || ""}
                      onChange={(e) => setValue("facebook", e.target.value)}
                    />
                  </Field>
                  <Field label="TikTok">
                    <input
                      value={form.tiktok || ""}
                      onChange={(e) => setValue("tiktok", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section id="settings-seo" className={styles.settingsSection}>
              <div className={styles.sectionHead}>
                <div className={styles.sectionEyebrow}>06 — Référencement</div>
                <h2>SEO</h2>
                <p>Titre et description utilisés par Google et les partages sociaux.</p>
              </div>
              <div className={styles.sectionBody}>
                <div className={styles.fieldGrid}>
                  <Field label="Meta titre" full>
                    <input
                      value={form.metaTitle || ""}
                      onChange={(e) => setValue("metaTitle", e.target.value)}
                    />
                  </Field>
                  <Field label="Meta description" full>
                    <textarea
                      rows={4}
                      value={form.metaDescription || ""}
                      onChange={(e) => setValue("metaDescription", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </section>
          </div>
        </div>

        <SaveBar bottom />
      </form>
    </AdminShell>
  );
}
