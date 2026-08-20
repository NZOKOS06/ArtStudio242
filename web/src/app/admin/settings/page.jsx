"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { useAdminGuard } from "../../../lib/useAdminGuard";
import { useStudio } from "../../../lib/StudioContext";
import AdminShell from "../../../components/AdminShell";

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
    <div className={`flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""}`}>
      <label className="text-xs font-bold text-white/50 uppercase tracking-wider">{label}</label>
      {children}
      {hint && <span className="text-xs text-white/25">{hint}</span>}
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
    api.get("/api/settings", { cache: "no-store" })
      .then((data) => {
        const raw = data || {};
        const banner = String(raw.promoBanner || "");
        const parts = banner.split(/\s*[—–]\s*|\s+-\s+/).map((s) => s.trim()).filter(Boolean);
        const title = parts[0] || "OFFRE DE LANCEMENT";
        const detail = parts.slice(1).join(" — ");
        const pctMatch = detail.match(/-?\d+\s*%/);
        const promoPct = pctMatch ? pctMatch[0].replace(/\s+/g, "") : raw.promoPct || "";
        const promoText = pctMatch ? detail.replace(pctMatch[0], "").replace(/^[\s—–-]+/, "").trim() : detail || raw.promoText || "";
        setForm({ ...raw, promoTitle: raw.promoTitle || title, promoPct: raw.promoPct || promoPct, promoText: raw.promoText || promoText });
      })
      .catch((err) => setStatus({ type: "error", message: err.message }))
      .finally(() => setLoadingData(false));
  }, [ready]);

  useEffect(() => {
    if (!ready || loadingData) return;
    const nodes = SECTIONS.map((s) => document.getElementById(`settings-${s.id}`)).filter(Boolean);
    if (!nodes.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveSection(visible.target.id.replace("settings-", ""));
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.2, 0.5, 0.8] }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [ready, loadingData]);

  const logoPreview = useMemo(() => (form.logoUrl ? api.assetUrl(form.logoUrl) : ""), [form.logoUrl]);

  function setValue(key, value) { setForm((prev) => ({ ...prev, [key]: value })); setStatus({ type: "", message: "" }); }

  async function onUploadLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try { const uploaded = await api.upload(file); setValue("logoUrl", uploaded.url); setStatus({ type: "success", message: "Logo uploadé — pensez à enregistrer." }); }
    catch (err) { setStatus({ type: "error", message: err.message }); }
  }

  async function onSubmit(e) {
    e.preventDefault(); setSaving(true); setStatus({ type: "", message: "" });
    try {
      const updated = await api.put("/api/settings", form);
      setForm(updated); clearStudioStorage(); applySettings(updated); await refresh(true); router.refresh();
      setStatus({ type: "success", message: "Paramètres enregistrés — synchronisés en direct." });
    } catch (err) { setStatus({ type: "error", message: err.message }); }
    finally { setSaving(false); }
  }

  function scrollToSection(id) { setActiveSection(id); document.getElementById(`settings-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); }

  if (!ready || loadingData) return (
    <AdminShell title="Paramètres">
      <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
    </AdminShell>
  );

  return (
    <AdminShell title="Paramètres">
      <form onSubmit={onSubmit}>
        {/* Save bar */}
        <div className="flex items-center justify-between gap-4 mb-8 px-6 py-4 bg-white/3 border border-white/8 rounded-2xl">
          <p className={`text-sm ${status.type === "error" ? "text-red-400" : status.type === "success" ? "text-green-400" : "text-white/40"}`}>
            {status.message || "Modifiez une section puis enregistrez."}
          </p>
          <button className="btn-primary-sm shrink-0" type="submit" disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer les paramètres"}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sections sidebar */}
          <aside className="hidden lg:flex flex-col gap-1 w-36 shrink-0 sticky top-24 self-start">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollToSection(s.id)}
                className={`text-left text-xs py-2 px-3 rounded-lg font-medium transition-all duration-200 ${activeSection === s.id ? "bg-primary/15 text-white border border-primary/25" : "text-white/30 hover:text-white hover:bg-white/5 border border-transparent"}`}
              >
                {s.label}
              </button>
            ))}
          </aside>

          <div className="flex-1 flex flex-col gap-8">

            {/* Brand */}
            <section id="settings-brand" className="admin-panel p-6">
              <div className="mb-6">
                <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-1">01. Marque</p>
                <h2 className="font-display font-black text-xl text-white">Identité visuelle</h2>
                <p className="text-sm text-white/40 mt-1">Logo, nom et signature du studio visibles sur tout le site.</p>
              </div>
              <div className="flex gap-6 mb-6 flex-wrap">
                <div className="w-24 h-24 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" /> : <span className="text-xs text-white/30 text-center p-2">Aucun logo</span>}
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <Field label="Importer un logo" hint="PNG ou JPG, fond transparent recommandé.">
                    <input type="file" accept="image/*" onChange={onUploadLogo} className="text-sm text-white/50 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-colors" />
                  </Field>
                  <Field label="URL du logo" hint="Ou collez une URL d'image existante.">
                    <input className="admin-input" value={form.logoUrl || ""} onChange={(e) => setValue("logoUrl", e.target.value)} placeholder="/uploads/logo.png" />
                  </Field>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nom de la marque"><input className="admin-input" value={form.brandName || ""} onChange={(e) => setValue("brandName", e.target.value)} /></Field>
                <Field label="Tagline"><input className="admin-input" value={form.tagline || ""} onChange={(e) => setValue("tagline", e.target.value)} /></Field>
              </div>
            </section>

            {/* Hero */}
            <section id="settings-hero" className="admin-panel p-6">
              <div className="mb-6">
                <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-1">02. Accueil</p>
                <h2 className="font-display font-black text-xl text-white">Section Hero</h2>
                <p className="text-sm text-white/40 mt-1">Le premier écran que voient vos visiteurs.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Eyebrow" hint="Petite ligne au-dessus du titre."><input className="admin-input" value={form.heroEyebrow || ""} onChange={(e) => setValue("heroEyebrow", e.target.value)} /></Field>
                <Field label="Titre principal"><input className="admin-input" value={form.heroTitle || ""} onChange={(e) => setValue("heroTitle", e.target.value)} /></Field>
                <Field label="Sous-titre" full><textarea className="admin-textarea" rows={3} value={form.heroSubtitle || ""} onChange={(e) => setValue("heroSubtitle", e.target.value)} /></Field>
                <Field label="Bouton principal"><input className="admin-input" value={form.heroCtaPrimary || ""} onChange={(e) => setValue("heroCtaPrimary", e.target.value)} /></Field>
                <Field label="Bouton secondaire"><input className="admin-input" value={form.heroCtaSecondary || ""} onChange={(e) => setValue("heroCtaSecondary", e.target.value)} /></Field>
                <Field label="Bannière contact" full><input className="admin-input" value={form.contactBanner || ""} onChange={(e) => setValue("contactBanner", e.target.value)} /></Field>
              </div>
            </section>

            {/* Promo */}
            <section id="settings-promo" className="admin-panel p-6">
              <div className="mb-6">
                <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-1">03. Offre</p>
                <h2 className="font-display font-black text-xl text-white">Promotion</h2>
                <p className="text-sm text-white/40 mt-1">Ces champs alimentent le ruban d'offre sur la page d'accueil.</p>
              </div>
              <div className="flex items-center justify-between gap-4 mb-6 p-4 bg-black/30 rounded-xl border border-white/8">
                <div>
                  <strong className="text-sm text-white">Afficher la promo</strong>
                  <p className="text-xs text-white/40">Ruban d'offre visible dans le hero</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={form.promoActive !== "false"} onChange={(e) => setValue("promoActive", e.target.checked ? "true" : "false")} />
                  <div className="w-10 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Titre du ruban" hint='Ex: OFFRE DE LANCEMENT'>
                  <input className="admin-input" value={form.promoTitle || ""} onChange={(e) => { const t = e.target.value; const b = [t, [form.promoPct, form.promoText].filter(Boolean).join(" ")].filter(Boolean).join(" — "); setForm((p) => ({ ...p, promoTitle: t, promoBanner: b })); setStatus({ type: "", message: "" }); }} />
                </Field>
                <Field label="Réduction" hint="Ex: -70%">
                  <input className="admin-input" value={form.promoPct || ""} onChange={(e) => { const p = e.target.value; const b = [form.promoTitle, [p, form.promoText].filter(Boolean).join(" ")].filter(Boolean).join(" — "); setForm((pr) => ({ ...pr, promoPct: p, promoBanner: b })); setStatus({ type: "", message: "" }); }} />
                </Field>
                <Field label="Détail" hint="Ex: pour les 20 premiers clients" full>
                  <input className="admin-input" value={form.promoText || ""} onChange={(e) => { const t = e.target.value; const b = [form.promoTitle, [form.promoPct, t].filter(Boolean).join(" ")].filter(Boolean).join(" — "); setForm((p) => ({ ...p, promoText: t, promoBanner: b })); setStatus({ type: "", message: "" }); }} />
                </Field>
              </div>
              <p className="text-xs text-white/25 mt-3">Aperçu : <strong className="text-white/50">{form.promoBanner || "—"}</strong></p>
            </section>

            {/* Contact */}
            <section id="settings-contact" className="admin-panel p-6">
              <div className="mb-6">
                <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-1">04. Coordonnées</p>
                <h2 className="font-display font-black text-xl text-white">Contact & localisation</h2>
                <p className="text-sm text-white/40 mt-1">Informations affichées dans le bloc contact et utilisées pour WhatsApp.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Téléphone"><input className="admin-input" value={form.phone || ""} onChange={(e) => setValue("phone", e.target.value)} /></Field>
                <Field label="WhatsApp" hint="Format international sans + (ex: 242069167515)"><input className="admin-input" value={form.whatsapp || ""} onChange={(e) => setValue("whatsapp", e.target.value)} /></Field>
                <Field label="Email"><input className="admin-input" type="email" value={form.email || ""} onChange={(e) => setValue("email", e.target.value)} /></Field>
                <Field label="Adresse"><input className="admin-input" value={form.address || ""} onChange={(e) => setValue("address", e.target.value)} /></Field>
                <Field label="Pays" full><input className="admin-input" value={form.country || ""} onChange={(e) => setValue("country", e.target.value)} /></Field>
              </div>
            </section>

            {/* Social */}
            <section id="settings-social" className="admin-panel p-6">
              <div className="mb-6">
                <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-1">05. Social</p>
                <h2 className="font-display font-black text-xl text-white">Réseaux sociaux</h2>
                <p className="text-sm text-white/40 mt-1">Liens vers vos profils — Instagram, Facebook, TikTok.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Instagram" full><input className="admin-input" value={form.instagram || ""} onChange={(e) => setValue("instagram", e.target.value)} placeholder="https://instagram.com/artstudio242" /></Field>
                <Field label="Facebook"><input className="admin-input" value={form.facebook || ""} onChange={(e) => setValue("facebook", e.target.value)} /></Field>
                <Field label="TikTok"><input className="admin-input" value={form.tiktok || ""} onChange={(e) => setValue("tiktok", e.target.value)} /></Field>
              </div>
            </section>

            {/* SEO */}
            <section id="settings-seo" className="admin-panel p-6">
              <div className="mb-6">
                <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-1">06. Référencement</p>
                <h2 className="font-display font-black text-xl text-white">SEO</h2>
                <p className="text-sm text-white/40 mt-1">Titre et description utilisés par Google et les partages sociaux.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Meta titre" full><input className="admin-input" value={form.metaTitle || ""} onChange={(e) => setValue("metaTitle", e.target.value)} /></Field>
                <Field label="Meta description" full><textarea className="admin-textarea" rows={4} value={form.metaDescription || ""} onChange={(e) => setValue("metaDescription", e.target.value)} /></Field>
              </div>
            </section>

            {/* Bottom save bar */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 bg-white/3 border border-white/8 rounded-2xl">
              <p className={`text-sm ${status.type === "error" ? "text-red-400" : status.type === "success" ? "text-green-400" : "text-white/40"}`}>
                {status.message || "Prêt à enregistrer."}
              </p>
              <button className="btn-primary-sm shrink-0" type="submit" disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer les paramètres"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </AdminShell>
  );
}
