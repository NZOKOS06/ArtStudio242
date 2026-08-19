"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../../lib/api";
import { useStudio } from "../../lib/StudioContext";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

function GalleryContent() {
  const searchParams = useSearchParams();
  const { settings, categories } = useStudio();
  const [images, setImages] = useState([]);
  const [active, setActive] = useState(searchParams.get("cat") || "all");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cacheKey = "as242_gallery_v1";
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.ts < 5 * 60 * 1000) { setImages(parsed.data); setReady(true); }
      }
    } catch { /* ignore */ }
    api.get("/api/gallery")
      .then((g) => { setImages(g); setReady(true); try { sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: g })); } catch { /* ignore */ } })
      .catch(() => setReady(true));
  }, []);

  const filtered = active === "all" ? images : images.filter((img) => img.category?.slug === active);

  return (
    <>
      <SiteHeader settings={settings} />

      {/* Hero */}
      <section className="relative min-h-[35vh] flex items-end bg-black pt-28 pb-14 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-primary/8 blur-3xl -translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <p className="text-primary text-xs font-bold tracking-[0.25em] uppercase mb-4">Portfolio</p>
          <h1 className="font-display font-black text-5xl md:text-7xl text-white leading-[1.05]">
            Des histoires<br />
            <span className="italic text-primary">racontées en images.</span>
          </h1>
        </div>
      </section>

      <main className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-12">
            {[{ slug: "all", name: "Tout" }, ...categories].map((cat) => (
              <button
                key={cat.slug || "all"}
                type="button"
                onClick={() => setActive(cat.slug || "all")}
                className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  active === (cat.slug || "all")
                    ? "bg-primary border-primary text-white"
                    : "border-white/15 text-white/50 hover:text-white hover:border-white/40"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {!ready && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl bg-white/3 animate-pulse" />
              ))}
            </div>
          )}

          {/* Image masonry */}
          {ready && (
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
              {filtered.map((img) => (
                <div key={img.id} className="break-inside-avoid rounded-xl overflow-hidden group relative">
                  <img
                    src={api.assetUrl(img.imageUrl)}
                    alt={img.alt || img.title || "Galerie Art Studio 242"}
                    loading="lazy"
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {img.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-xs text-white font-semibold">{img.title}</p>
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && ready && (
                <div className="col-span-full text-center text-white/30 py-16">Aucune image dans cette catégorie.</div>
              )}
            </div>
          )}
        </div>
      </main>

      <SiteFooter settings={settings} />
    </>
  );
}

export default function GaleriePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}
