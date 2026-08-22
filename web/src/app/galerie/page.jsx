"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../../lib/api";
import { useStudio } from "../../lib/StudioContext";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import SimpleOptimizedImage from "../../components/SimpleOptimizedImage";

function GalleryContent() {
  const searchParams = useSearchParams();
  const { settings, categories } = useStudio();
  const [images, setImages] = useState([]);
  const [active, setActive] = useState(searchParams.get("cat") || "all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  function load() {
    setLoading(true);
    setError(false);
    api.get("/api/gallery")
      .then((data) => setImages(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
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

          {/* Loading skeleton */}
          {loading && images.length === 0 && (
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div 
                  key={i} 
                  className="break-inside-avoid rounded-xl bg-white/3 animate-pulse"
                  style={{ height: `${200 + Math.random() * 200}px` }}
                />
              ))}
            </div>
          )}

          {/* Error state avec retry */}
          {error && images.length === 0 && (
            <div className="text-center py-16">
              <p className="text-white/60 mb-4">Erreur de chargement des images</p>
              <button
                onClick={load}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* Image masonry optimisée */}
          {images.length > 0 && (
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
              {filtered.map((img, index) => (
                <div key={img.id} className="break-inside-avoid rounded-xl overflow-hidden group relative">
                  <SimpleOptimizedImage
                    src={api.assetUrl(img.imageUrl)}
                    alt={img.alt || img.title || "Galerie Art Studio 242"}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    loading={index < 6 ? "eager" : "lazy"} // Premières images en eager
                    priority={index < 3} // 3 premières en priorité
                  />
                  {img.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-xs text-white font-semibold">{img.title}</p>
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && !loading && (
                <div className="col-span-full text-center text-white/30 py-16">
                  Aucune image dans cette catégorie.
                </div>
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
