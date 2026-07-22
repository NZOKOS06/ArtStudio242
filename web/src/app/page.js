import Link from "next/link";
import { api } from "../lib/api";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import styles from "./site.module.css";

async function loadHome() {
  try {
    const [settings, packs, gallery, categories, reviews] = await Promise.all([
      api.get("/api/settings"),
      api.get("/api/packs"),
      api.get("/api/gallery?featured=1"),
      api.get("/api/categories"),
      api.get("/api/reviews"),
    ]);
    return { settings, packs, gallery, categories, reviews };
  } catch {
    return {
      settings: {},
      packs: [],
      gallery: [],
      categories: [],
      reviews: [],
      offline: true,
    };
  }
}

function packClass(color) {
  if (color === "gold") return styles.pGold;
  if (color === "red") return styles.pRed;
  if (color === "black") return styles.pBlack;
  return styles.pGreen;
}

function formatPrice(price) {
  return new Intl.NumberFormat("fr-FR").format(price);
}

export default async function HomePage() {
  const { settings, packs, gallery, categories, reviews, offline } = await loadHome();

  const heroTitle = settings.heroTitle || "Capturez vos meilleurs Moments";
  const titleParts = heroTitle.split("vos meilleurs");

  return (
    <>
      <SiteHeader settings={settings} />

      <section className={styles.hero}>
        <div className={styles.watermark} aria-hidden>
          242
        </div>
        <div className={`container ${styles.heroInner}`}>
          <div className="eyebrow">{settings.heroEyebrow || "Studio photo — Brazzaville"}</div>
          <h1>
            {titleParts[0] || "Capturez"}
            <span className="script">vos meilleurs</span>
            {titleParts[1] || "Moments"}
          </h1>
          <p className={styles.sub}>
            <span className={styles.rule} />
            {settings.heroSubtitle || "Des souvenirs authentiques, des images éternelles."}
            <span className={`${styles.rule}`} />
          </p>

          {settings.promoActive !== "false" && settings.promoBanner && (
            <div className={styles.offerRibbon}>
              <div className={styles.offerA}>OFFRE DE<br />LANCEMENT</div>
              <div className={styles.offerB}>
                <span className={styles.pct}>-20%</span>
                <span className={styles.txt}>pour les 10<br />premiers clients</span>
              </div>
            </div>
          )}

          <div className={styles.heroActions}>
            <Link href="/reserver" className="btn btn-primary">
              {settings.heroCtaPrimary || "Réserver une séance"}
            </Link>
            <a href="#packs" className="btn btn-outline">
              {settings.heroCtaSecondary || "Voir nos packs"}
            </a>
          </div>

          {offline && (
            <p className={styles.error} style={{ marginTop: 20 }}>
              API hors ligne — démarrez le backend pour charger les données dynamiques.
            </p>
          )}
        </div>
      </section>

      <section className="section container reveal" id="packs">
        <div className="section-head">
          <div className="eyebrow">Tarifs</div>
          <h2>Nos packs</h2>
        </div>
        <div className={styles.packsGrid}>
          {packs.map((pack) => (
            <article key={pack.id} className={`${styles.pack} ${packClass(pack.color)}`}>
              <div className={styles.packBar} />
              <h3>{pack.name}</h3>
              {pack.badge && <span className={styles.badge}>{pack.badge}</span>}
              <div className={styles.details}>
                {(pack.features || []).map((f) => (
                  <p key={f}>{f}</p>
                ))}
              </div>
              <div className={styles.price}>
                {formatPrice(pack.price)}
                <small>{pack.currency || "FCFA"}</small>
              </div>
              <Link href={`/reserver?pack=${pack.slug}`} className="btn btn-outline" style={{ marginTop: 14 }}>
                Choisir
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section container reveal">
        <div className={styles.extrasGrid}>
          <div className={`${styles.extrasCard} ${styles.bonus}`}>
            <div className={styles.extrasHead}>Nos bonus</div>
            <div className={styles.extrasBody}>
              {["Conseils poses inclus", "Matériel haut de gamme", "Accompagnement personnalisé"].map(
                (label) => (
                  <div className={styles.extrasRow} key={label}>
                    <div className={styles.ic}>✓</div>
                    <div>{label}</div>
                  </div>
                )
              )}
            </div>
          </div>
          <div className={`${styles.extrasCard} ${styles.options}`}>
            <div className={styles.extrasHead}>Options</div>
            <div className={styles.extrasBody}>
              <div className={styles.extrasRow}>
                <div className={styles.ic}>+</div>
                <div>Photo supplémentaire</div>
                <div className={styles.val}>2 000 FCFA</div>
              </div>
              <div className={styles.extrasRow}>
                <div className={styles.ic}>A</div>
                <div>Album photo</div>
                <div className={styles.val}>À partir de 50 000 FCFA</div>
              </div>
              <div className={styles.extrasRow}>
                <div className={styles.ic}>→</div>
                <div>Déplacement</div>
                <div className={styles.val}>Selon zone</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="section container reveal">
          <div className="section-head">
            <div className="eyebrow">Univers</div>
            <h2>Catégories</h2>
          </div>
          <div className={styles.galleryGrid}>
            {categories.map((cat) => (
              <Link href={`/galerie?cat=${cat.slug}`} key={cat.id} className={styles.galleryItem}>
                {cat.coverUrl && (
                  <img src={api.assetUrl(cat.coverUrl)} alt={cat.name} />
                )}
                <div className={styles.galleryCap}>
                  <div>{cat.name}</div>
                  <small>{cat.description}</small>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section container reveal" id="galerie">
        <div className="section-head">
          <div className="eyebrow">Portfolio</div>
          <h2>Nos réalisations</h2>
        </div>
        <div className={styles.galleryGrid}>
          {gallery.slice(0, 6).map((img) => (
            <div key={img.id} className={styles.galleryItem}>
              <img src={api.assetUrl(img.imageUrl)} alt={img.alt || img.title || "Photo Art Studio 242"} />
              {img.title && <div className={styles.galleryCap}>{img.title}</div>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28, textAlign: "center" }}>
          <Link href="/galerie" className="btn btn-outline">
            Voir toute la galerie
          </Link>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="section container reveal">
          <div className="section-head">
            <div className="eyebrow">Témoignages</div>
            <h2>Ils nous font confiance</h2>
          </div>
          <div className="grid-3">
            {reviews.slice(0, 3).map((r) => (
              <article key={r.id} className={styles.reviewCard}>
                <div className={styles.stars}>{"★".repeat(r.rating)}</div>
                <p style={{ margin: "12px 0" }}>&ldquo;{r.comment}&rdquo;</p>
                <strong>{r.authorName}</strong>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="section container reveal" id="contact">
        <div className={styles.contactBanner}>
          {settings.contactBanner || "Réservez maintenant, places limitées !"}
        </div>
        <div className={styles.contactGrid}>
          <div className={styles.ccard}>
            <h4>Adresse</h4>
            <p>{settings.address || "Brazzaville"}</p>
            <p className={styles.sm}>{settings.country || "République du Congo"}</p>
          </div>
          <div className={styles.ccard}>
            <h4>Téléphone</h4>
            <p>
              <a className={styles.linklike} href={`tel:${(settings.phone || "").replace(/\s/g, "")}`}>
                {settings.phone || "+242 06 916 75 15"}
              </a>
            </p>
            <p className={styles.sm}>WhatsApp disponible</p>
          </div>
          <div className={styles.ccard}>
            <h4>Réseaux</h4>
            <p>
              <a
                className={styles.linklike}
                href={settings.instagram || "https://instagram.com/artstudio242"}
                target="_blank"
                rel="noopener noreferrer"
              >
                @artstudio242
              </a>
            </p>
            <p className={styles.sm}>
              <a className={styles.linklike} href={`mailto:${settings.email || "artstudio242@gmail.com"}`}>
                {settings.email || "artstudio242@gmail.com"}
              </a>
            </p>
          </div>
        </div>
      </section>

      <SiteFooter settings={settings} />
    </>
  );
}
