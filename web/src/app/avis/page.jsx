"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useStudio } from "../../lib/StudioContext";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

export default function AvisPage() {
  const { settings } = useStudio();
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ authorName: "", rating: 5, comment: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("as242_reviews_v1");
      if (raw) { const parsed = JSON.parse(raw); if (Date.now() - parsed.ts < 5 * 60 * 1000) setReviews(parsed.data); }
    } catch { /* ignore */ }
    api.get("/api/reviews").then((r) => {
      setReviews(r);
      try { sessionStorage.setItem("as242_reviews_v1", JSON.stringify({ ts: Date.now(), data: r })); } catch { /* ignore */ }
    }).catch(() => {});
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/reviews", { ...form, rating: Number(form.rating) });
      setStatus({ type: "success", message: res.message || "Merci pour votre avis !" });
      setForm({ authorName: "", rating: 5, comment: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader settings={settings} />

      {/* Hero */}
      <section className="relative min-h-[35vh] flex items-end bg-black pt-28 pb-14 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-80 h-80 rounded-full bg-primary/8 blur-3xl -translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <p className="text-primary text-xs font-bold tracking-[0.25em] uppercase mb-4">Témoignages</p>
          <h1 className="font-display font-black text-5xl md:text-7xl text-white leading-[1.05]">
            Ils ont vécu<br />
            <span className="italic text-primary">l'expérience.</span>
          </h1>
        </div>
      </section>

      <main className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Reviews list */}
            <div className="flex flex-col gap-4">
              {reviews.length === 0 && (
                <p className="text-white/30 text-sm">Aucun avis pour le moment.</p>
              )}
              {reviews.map((r) => (
                <article
                  key={r.id}
                  className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-colors"
                >
                  <div className="text-primary text-xl mb-3">{"★".repeat(r.rating)}<span className="text-white/20">{"★".repeat(5 - r.rating)}</span></div>
                  <p className="text-white/70 text-sm italic leading-relaxed mb-4">"{r.comment}"</p>
                  <strong className="text-sm text-white">{r.authorName}</strong>
                </article>
              ))}
            </div>

            {/* Submit form */}
            <div className="sticky top-28">
              <form
                onSubmit={onSubmit}
                className="bg-white/3 border border-white/10 rounded-2xl p-8 flex flex-col gap-4"
              >
                <h3 className="font-display font-black text-xl text-white mb-2">Laisser un avis</h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Votre nom</label>
                  <input
                    required
                    value={form.authorName}
                    onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Note</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition-colors [color-scheme:dark]"
                  >
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Commentaire</label>
                  <textarea
                    required
                    rows={4}
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition-colors resize-none"
                  />
                </div>

                {status.message && (
                  <div className={`px-4 py-3 rounded-xl text-sm font-medium ${status.type === "success" ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                    {status.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-black text-sm py-4 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 tracking-wide"
                >
                  {loading ? "Envoi..." : "Publier mon avis"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter settings={settings} />
    </>
  );
}
