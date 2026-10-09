"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";
import { useStudio } from "../../lib/StudioContext";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

const DEFAULT_PACKS = [
  { id: "1", name: "Enfant (jusqu’à 12 ans)", slug: "enfant-jusqu-a-12-ans", price: 7500, features: ["Séance enfant"], isFallback: true },
  { id: "2", name: "Découverte", slug: "decouverte", price: 15000, features: ["1 fond", "3 tenues", "1 heure : 30 photos"], isFallback: true },
  { id: "3", name: "Silver", slug: "silver", price: 30000, features: ["Fonds au choix", "5 tenues", "2 heures : 50 photos"], isFallback: true },
  { id: "4", name: "Gold", slug: "gold", price: 60000, features: ["Fonds inclus", "Plus de 5 tenues", "3 heures : 70 photos"], isFallback: true },
  { id: "5", name: "Événements", slug: "evenement", price: 100000, features: ["Couverture complète", "Tarif selon l’événement et sa durée"], isFallback: true },
];

const EVENT_DURATIONS = [
  { id: "event-1h", slug: "evenement-1h", name: "1 heure", price: 20000, features: ["Anniversaire, soutenance, dot…"] },
  { id: "event-2h", slug: "evenement-2h", name: "2 heures", price: 40000, features: ["Anniversaire, soutenance, dot…"] },
  { id: "event-3h", slug: "evenement-3h", name: "3 heures", price: 60000, features: ["Anniversaire, soutenance, dot…"] },
];

function normalizeLabel(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function ReserverForm() {
  const searchParams = useSearchParams();
  const { settings, packs, categories } = useStudio();
  const displayPacks = packs.length > 0 ? packs : DEFAULT_PACKS;
  const databaseEventPack = packs.find((pack) => pack.slug === "evenement" || normalizeLabel(pack.name) === "evenement");
  const eventOptions = [
    ...EVENT_DURATIONS.map((option) => ({ ...option, isEventOption: true, bookingPackId: databaseEventPack?.id || null })),
    {
      id: "event-complete",
      slug: "evenement-complet",
      alternateSlugs: ["evenement"],
      name: "Couverture complète",
      price: 100000,
      from: true,
      features: ["Couverture complète", "Tarif selon l’événement et sa durée"],
      isEventOption: true,
      bookingPackId: databaseEventPack?.id || null,
    },
  ];
  const [form, setForm] = useState({
    projectName: "",
    packId: "",
    preferredAt: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    clientInstagram: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const slug = searchParams.get("pack");
    const project = searchParams.get("project");
    const startsEvent = slug?.startsWith("evenement") || normalizeLabel(project) === "evenement";
    const choices = startsEvent ? [...eventOptions, ...displayPacks] : displayPacks;
    const match = slug && choices.find((pack) => pack.slug === slug || pack.alternateSlugs?.includes(slug));
    if (match || startsEvent) {
      setForm((current) => ({
        ...current,
        projectName: startsEvent ? "Événement" : current.projectName,
        packId: match?.id || current.packId,
      }));
    }
  }, [searchParams, displayPacks]);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const selectedPack = [...displayPacks, ...eventOptions].find((pack) => pack.id === form.packId);
      const eventDetails = selectedPack?.isEventOption
        ? `Formule événement : ${selectedPack.name} — ${selectedPack.from ? "à partir de " : ""}${selectedPack.price.toLocaleString("fr-FR")} FCFA.`
        : selectedPack?.isFallback
          ? `Formule choisie : ${selectedPack.name} — ${selectedPack.price.toLocaleString("fr-FR")} FCFA.`
          : "";
      await api.post("/api/bookings", {
        ...form,
        clientEmail: form.clientEmail || null,
        clientInstagram: form.clientInstagram || null,
        projectName: form.projectName || null,
        preferredAt: form.preferredAt ? new Date(form.preferredAt).toISOString() : null,
        packId: selectedPack?.isEventOption ? selectedPack.bookingPackId : selectedPack?.isFallback ? null : form.packId || null,
        message: [form.message, eventDetails].filter(Boolean).join("\n") || null,
      });
      setStatus({ type: "success", message: "Demande envoyée ! Nous vous recontactons rapidement." });
      setForm({ projectName: "", packId: "", preferredAt: "", clientName: "", clientPhone: "", clientEmail: "", clientInstagram: "", message: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  const selectedPack = [...displayPacks, ...eventOptions].find((p) => p.id === form.packId);
  const isEventProject = normalizeLabel(form.projectName) === "evenement";
  const visiblePacks = isEventProject
    ? eventOptions
    : displayPacks.filter((pack) => pack.slug !== "evenement" && normalizeLabel(pack.name) !== "evenement");
  const whatsapp = settings.whatsapp || "242069167515";
  const whatsappMessage = [
    "Bonjour Art Studio 242, je souhaite réserver",
    form.projectName ? `un projet ${form.projectName}` : "",
    selectedPack
      ? `la formule ${selectedPack.name} (${selectedPack.from ? "à partir de " : ""}${selectedPack.price.toLocaleString("fr-FR")} FCFA)`
      : "",
  ].filter(Boolean).join(" — ");
  const defaultCategories = [
    { id: 1, name: "Portrait" }, { id: 2, name: "Mode" },
    { id: 3, name: "Corporate" }, { id: 4, name: "Couple" },
    { id: 5, name: "Famille" }, { id: 6, name: "Événement" },
  ];
  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <>
      <SiteHeader settings={settings} />

      {/* Page header */}
      <section className="relative min-h-[40vh] flex items-end bg-black pt-28 pb-14 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full bg-primary/10 blur-3xl -translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <p className="text-primary text-xs font-bold tracking-[0.25em] uppercase mb-4">Réservation</p>
          <h1 className="font-display font-black text-5xl md:text-7xl text-white leading-[1.05]">
            Réservez votre<br />
            <span className="italic text-primary">séance.</span>
          </h1>
          <p className="text-white/50 mt-4 text-lg">Votre prochaine image commence ici.</p>
        </div>
      </section>

      <main className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-6">
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Projet */}
                <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xs font-black text-white/40 tracking-[0.2em] uppercase mb-5">
                    01. Votre projet
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {displayCategories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={form.projectName === c.name}
                        onClick={() => setForm((current) => ({
                          ...current,
                          projectName: c.name,
                          packId: current.projectName === c.name ? current.packId : "",
                        }))}
                        className={`py-3 px-3 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                          form.projectName === c.name
                            ? "bg-primary border-primary text-white"
                            : "bg-transparent border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

              {/* Expérience */}
              <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xs font-black text-white/40 tracking-[0.2em] uppercase mb-5">
                  02. Votre expérience
                </h3>
                <div className="flex flex-col gap-3">
                  {visiblePacks.map((p) => (
                    <label
                      key={p.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                        form.packId === p.id
                          ? "border-primary bg-primary/10"
                          : "border-white/10 hover:border-white/25 bg-transparent"
                      }`}
                    >
                      <input
                        type="radio"
                        name="packId"
                        value={p.id}
                        checked={form.packId === p.id}
                        onChange={(e) => setForm((current) => ({ ...current, packId: e.target.value }))}
                        className="accent-primary w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-sm text-white">{p.name}</div>
                        {p.features?.map((feature) => <div key={feature} className="text-xs text-white/40 mt-0.5">{feature}</div>)}
                      </div>
                      <div className="text-sm font-black text-primary shrink-0">
                        {p.from ? "À partir de " : ""}{p.price.toLocaleString("fr-FR")} FCFA
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xs font-black text-white/40 tracking-[0.2em] uppercase mb-5">
                  03. Votre date
                </h3>
                <input
                  type="datetime-local"
                  name="preferredAt"
                  autoComplete="off"
                  value={form.preferredAt}
                  onChange={(e) => setForm({ ...form, preferredAt: e.target.value })}
                  required
                  className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition-colors [color-scheme:dark]"
                />
              </div>

              {/* Vos informations */}
              <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xs font-black text-white/40 tracking-[0.2em] uppercase mb-5">
                  04. Vos informations
                </h3>
                <div className="flex flex-col gap-3">
                  {[
                    { key: "clientName", placeholder: "Nom complet", required: true },
                    { key: "clientPhone", placeholder: "Téléphone / WhatsApp", required: true },
                    { key: "clientEmail", placeholder: "Email (optionnel)", type: "email" },
                    { key: "clientInstagram", placeholder: "Instagram @... (optionnel)" },
                  ].map(({ key, placeholder, required, type }) => (
                    <input
                      key={key}
                      type={type || "text"}
                      name={key}
                      autoComplete={key === "clientName" ? "name" : key === "clientPhone" ? "tel" : key === "clientEmail" ? "email" : "off"}
                      placeholder={placeholder}
                      required={required}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition-colors"
                    />
                  ))}
                  <textarea
                    placeholder="Un message ou une précision sur votre projet ?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={3}
                    className="w-full bg-black/50 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* ── Résumé & Actions ── */}
            <div className="mt-8 bg-white/3 border border-primary/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <p className="text-xs font-black text-white/30 tracking-[0.2em] uppercase mb-3">Résumé de la demande</p>
                <p className="text-white text-sm">
                  <span className="text-white/50">Projet :</span>{" "}
                  <strong>{form.projectName || "Non sélectionné"}</strong>
                </p>
                <p className="text-white text-sm mt-1">
                  <span className="text-white/50">Formule :</span>{" "}
                  <strong>{selectedPack ? `${selectedPack.from ? "À partir de " : ""}${selectedPack.price.toLocaleString("fr-FR")} FCFA — ${selectedPack.name}` : "Non sélectionnée"}</strong>
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-auto">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-black text-sm px-10 py-4 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 tracking-wide min-w-[240px]"
                >
                  {loading ? "Envoi en cours..." : "ENVOYER LA DEMANDE"}
                </button>
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-white/20 hover:border-white/50 text-white/70 hover:text-white font-semibold text-sm px-10 py-4 rounded-full transition-all duration-200 text-center"
                >
                  Continuer sur WhatsApp →
                </a>
              </div>
            </div>

            {status.message && (
              <div
                className={`mt-6 px-6 py-4 rounded-xl text-sm font-medium ${
                  status.type === "success"
                    ? "bg-green-500/10 border border-green-500/20 text-green-400"
                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                }`}
              >
                {status.message}
              </div>
            )}
          </form>
        </div>
      </main>

      <SiteFooter settings={settings} />
    </>
  );
}
