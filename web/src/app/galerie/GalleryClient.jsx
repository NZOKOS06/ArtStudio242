"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../../lib/api";
import { useStudio } from "../../lib/StudioContext";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

export default function GalleryClient({ initial }) {
  const searchParams = useSearchParams();
  const { settings: liveSettings, categories: liveCategories } = useStudio();

  const settings = { ...(initial?.settings || {}), ...liveSettings };
  const categories = liveCategories?.length ? liveCategories : (initial?.categories || []);
  const [images, setImages] = useState(initial?.gallery || []);
  const [active, setActive] = useState(searchParams.get("cat") || "all");

  // Recharger côté client si les données initiales étaient vides
  useEffect(() => {
    if (!initial?.gallery || initial.gallery.length === 0) {
      api.get("/api/gallery")
        .then((data) => {
          if (Array.isArray(data)) setImages(data);
        })
        .catch(console.error);
    }
  }, [initial]);

  // Synchroniser avec les query params
  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat) setActive(cat);
  }, [searchParams]);

  const filtered = active === "all" 
    ? images 
    : images.filter((img) => img.category?.slug === active);

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

          {/* Grille d'images - Gérée exactement comme sur la page d'accueil */}
          {images.length > 0 ? (
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
              {filtered.map((img) => (
                <div 
                  key={img.id} 
                  className="break-inside-avoid rounded-xl overflow-hidden group relative bg-surface border border-white/5"
                >
                  <img
                    src={api.assetUrl(img.imageUrl)}
                    alt={img.alt || img.title || "Art Studio 242"}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {img.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-xs text-white font-semibold">{img.title}</p>
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center text-white/30 py-16">
                  Aucune image dans cette catégorie.
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div 
                  key={i} 
                  className="aspect-[3/4] rounded-xl bg-white/3 border border-white/8 animate-pulse" 
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter settings={settings} />
    </>
  );
}
