"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../../lib/api";
import { useStudio } from "../../lib/StudioContext";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import styles from "../site.module.css";

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
        if (Date.now() - parsed.ts < 5 * 60 * 1000) {
          setImages(parsed.data);
          setReady(true);
        }
      }
    } catch {
      /* ignore */
    }

    api
      .get("/api/gallery")
      .then((g) => {
        setImages(g);
        setReady(true);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: g }));
        } catch {
          /* ignore */
        }
      })
      .catch(() => setReady(true));
  }, []);

  const filtered =
    active === "all"
      ? images
      : images.filter((img) => img.category?.slug === active);

  return (
    <>
      <SiteHeader settings={settings} />
      <main className="section container">
        <div className="section-head">
          <div className="eyebrow">Portfolio</div>
          <h2>
            Galerie <span className="script">Art Studio</span>
          </h2>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 28 }}>
          <button
            className={`btn ${active === "all" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActive("all")}
            type="button"
          >
            Tout
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`btn ${active === cat.slug ? "btn-primary" : "btn-outline"}`}
              onClick={() => setActive(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {!ready && <p style={{ color: "var(--ink-soft)" }}>Chargement de la galerie…</p>}

        <div className={styles.galleryGrid}>
          {filtered.map((img) => (
            <div key={img.id} className={styles.galleryItem}>
              <img
                src={api.assetUrl(img.imageUrl)}
                alt={img.alt || img.title || "Galerie"}
                loading="lazy"
              />
              {img.title && <div className={styles.galleryCap}>{img.title}</div>}
            </div>
          ))}
        </div>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}

export default function GaleriePage() {
  return (
    <Suspense fallback={<div className="container section">Chargement...</div>}>
      <GalleryContent />
    </Suspense>
  );
}
