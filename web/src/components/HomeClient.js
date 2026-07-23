"use client";

import Link from "next/link";
import { api } from "../lib/api";
import { useStudio } from "../lib/StudioContext";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import styles from "../app/site.module.css";

function packClass(color) {
  if (color === "gold") return styles.pGold;
  if (color === "red") return styles.pRed;
  if (color === "black") return styles.pBlack;
  return styles.pGreen;
}

function formatPrice(price) {
  return new Intl.NumberFormat("fr-FR").format(price);
}

/** Parse "OFFRE DE LANCEMENT — -70% pour les 20 premiers clients" */
function parsePromo(banner) {
  const raw = String(banner || "").trim();
  if (!raw) return null;

  const parts = raw.split(/\s*[—–]\s*|\s+-\s+/).map((s) => s.trim()).filter(Boolean);
  const title = parts[0] || "OFFRE";
  const detail = parts.slice(1).join(" — ") || "";
  const pctMatch = detail.match(/-?\d+\s*%/);
  const pct = pctMatch ? pctMatch[0].replace(/\s+/g, "") : "";
  let txt = pctMatch ? detail.replace(pctMatch[0], "").trim() : detail;
  txt = txt.replace(/^[\s—–-]+/, "").trim();

  // Titre sur 2 lignes si possible (ex: OFFRE DE / LANCEMENT)
  const titleWords = title.split(/\s+/);
  const titleTop = titleWords.length > 2 ? titleWords.slice(0, 2).join(" ") : titleWords[0];
  const titleBottom = titleWords.length > 2 ? titleWords.slice(2).join(" ") : titleWords.slice(1).join(" ");

  return { titleTop, titleBottom, pct, txt };
}

export default function HomeClient({ initial }) {
  const { settings: liveSettings, packs: livePacks, categories: liveCategories } = useStudio();

  const settings = { ...(initial.settings || {}), ...liveSettings };
  const packs = livePacks?.length ? livePacks : initial.packs || [];
  const categories = liveCategories?.length ? liveCategories : initial.categories || [];
  const gallery = initial.gallery || [];
  const reviews = initial.reviews || [];
  const offline = initial.offline;

  const heroTitle = settings.heroTitle || "Capturez vos meilleurs Moments";
  const titleParts = heroTitle.split("vos meilleurs");
  const promo = settings.promoActive !== "false" ? parsePromo(settings.promoBanner) : null;

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
            <span className={styles.rule} />
          </p>

          {promo && (
            <div className={styles.offerRibbon}>
              <div className={styles.offerA}>
                {promo.titleTop}
                {promo.titleBottom ? (
                  <>
                    <br />
                    {promo.titleBottom}
                  </>
                ) : null}
              </div>
              <div className={styles.offerB}>
                {promo.pct ? <span className={styles.pct}>{promo.pct}</span> : null}
                {promo.txt ? (
                  <span className={styles.txt}>
                    {promo.txt.replace(/\s+(premiers?\s+clients?)/i, "\n$1").split("\n").map((line, i) => (
                      <span key={i}>
                        {i > 0 ? <br /> : null}
                        {line}
                      </span>
                    ))}
                  </span>
                ) : null}
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
              <Link
                href={`/reserver?pack=${pack.slug}`}
                className="btn btn-outline btn-sm"
                style={{ marginTop: 14 }}
              >
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
                {cat.coverUrl && <img src={api.assetUrl(cat.coverUrl)} alt={cat.name} />}
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
              <img
                src={api.assetUrl(img.imageUrl)}
                alt={img.alt || img.title || "Photo Art Studio 242"}
              />
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
