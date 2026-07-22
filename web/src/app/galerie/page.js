"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../../lib/api";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import styles from "../site.module.css";

function GalleryContent() {
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState({});
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [active, setActive] = useState(searchParams.get("cat") || "all");

  useEffect(() => {
    Promise.all([
      api.get("/api/settings"),
      api.get("/api/categories"),
      api.get("/api/gallery"),
    ]).then(([s, c, g]) => {
      setSettings(s);
      setCategories(c);
      setImages(g);
    }).catch(() => {});
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

        <div className={styles.galleryGrid}>
          {filtered.map((img) => (
            <div key={img.id} className={styles.galleryItem}>
              <img
                src={api.assetUrl(img.imageUrl)}
                alt={img.alt || img.title || "Galerie"}
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
