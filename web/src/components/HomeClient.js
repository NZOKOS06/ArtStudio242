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

export default function HomeClient({ initial }) {
  const { settings: liveSettings, packs: livePacks, categories: liveCategories } = useStudio();

  const settings = { ...(initial.settings || {}), ...liveSettings };
  const packs = livePacks?.length ? livePacks : initial.packs || [];
  const categories = liveCategories?.length ? liveCategories : initial.categories || [];
  const gallery = initial.gallery || [];
  const reviews = initial.reviews || [];
  const offline = initial.offline;

  return (
    <>
      <SiteHeader settings={settings} />

      {/* HERO SECTION */}
      <section className={styles.hero} style={{ padding: '80px 0', minHeight: '85vh', background: 'var(--paper)' }}>
        <div className={`container`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px' }}>
            <div className="eyebrow" style={{ color: 'var(--primary)' }}>Studio photo & création visuelle à Brazzaville</div>
            <h1 style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', lineHeight: 1.1, textTransform: 'none', margin: '20px 0' }}>
              L'image n'est pas <br/>
              seulement prise.<br/>
              <span className="script" style={{ color: 'var(--primary)', fontSize: '1.2em' }}>Elle est créée.</span>
            </h1>
            <div className={styles.heroActions} style={{ marginTop: '40px' }}>
              <Link href="/reserver" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.1rem' }}>
                RÉSERVER UNE SÉANCE
              </Link>
              <a href="#galerie" className="btn btn-outline" style={{ padding: '14px 28px', fontSize: '1.1rem' }}>
                VOIR LE PORTFOLIO
              </a>
            </div>
            {offline && (
              <p className={styles.error} style={{ marginTop: 20 }}>
                API hors ligne — démarrez le backend pour charger les données.
              </p>
            )}
          </div>
          <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
             <img src="/hero.jpg" alt="Photographer" style={{ width: '100%', maxWidth: '600px', borderRadius: '20px', boxShadow: '0 20px 50px rgba(192,57,43,0.15)' }} />
          </div>
        </div>
      </section>

      {/* NOTRE UNIVERS */}
      <section className="section container reveal">
         <div className="section-head" style={{ textAlign: 'center' }}>
            <div className="eyebrow">Notre univers</div>
            <h2>Plus qu'un studio,<br/>une expérience.</h2>
            <p style={{ color: 'var(--ink-soft)', maxWidth: 600, margin: '20px auto' }}>
              Art Studio 242, c'est la rencontre entre créativité, technique et émotion. 
              Nous créons des images fortes, authentiques et intemporelles qui racontent votre histoire.
            </p>
         </div>
         <div className="grid-4" style={{ marginTop: '40px' }}>
            {['Équipement professionnel', 'Direction artistique', 'Retouche professionnelle', 'Livraison rapide'].map((feature, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '30px 20px', background: 'var(--paper-deep)', borderRadius: '16px', border: '1px solid var(--line)' }}>
                 <div style={{ color: 'var(--primary)', fontSize: '2.5rem', marginBottom: '16px' }}>❂</div>
                 <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{feature}</h4>
              </div>
            ))}
         </div>
      </section>

      {/* SPÉCIALITÉS */}
      {categories.length > 0 && (
        <section className="section container reveal" id="specialites">
          <div className="section-head" style={{ textAlign: 'center' }}>
            <div className="eyebrow">Nos spécialités</div>
            <h2>Domaines d'expertise</h2>
          </div>
          <div className={styles.galleryGrid}>
            {categories.map((cat) => (
              <Link href={`/galerie?cat=${cat.slug}`} key={cat.id} className={styles.galleryItem}>
                {cat.coverUrl && <img src={api.assetUrl(cat.coverUrl)} alt={cat.name} />}
                <div className={styles.galleryCap} style={{ textAlign: 'center', bottom: '10px' }}>
                  <div style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{cat.name}</div>
                  <small style={{ color: 'var(--primary)', fontWeight: 600 }}>{cat.description}</small>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* PORTFOLIO (Realizations) */}
      <section className="section container reveal" id="galerie">
        <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div className="eyebrow">Portfolio</div>
            <h2>Découvrez nos<br/>réalisations</h2>
          </div>
          <Link href="/galerie" className="btn btn-outline btn-sm" style={{ padding: '10px 20px' }}>VOIR TOUT LE PORTFOLIO</Link>
        </div>
        <div className={styles.galleryGrid}>
          {gallery.slice(0, 6).map((img) => (
            <div key={img.id} className={styles.galleryItem}>
              <img
                src={api.assetUrl(img.imageUrl)}
                alt={img.alt || img.title || "Photo Art Studio 242"}
              />
            </div>
          ))}
        </div>
      </section>

      {/* OFFRES / PACKS */}
      <section className="section container reveal" id="packs">
        <div className="section-head" style={{ textAlign: 'center' }}>
          <div className="eyebrow">Nos offres</div>
          <h2>Choisissez votre expérience</h2>
        </div>
        <div className={styles.packsGrid}>
          {packs.map((pack) => (
            <article key={pack.id} className={`${styles.pack} ${packClass(pack.color)}`} style={{ background: 'var(--paper-deep)', position: 'relative', overflow: 'visible' }}>
              {pack.badge && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: '#fff', padding: '6px 16px', fontSize: '0.75rem', fontWeight: 800, borderRadius: '20px', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{pack.badge}</div>}
              
              <h3 style={{ textAlign: 'center', margin: '24px 0 10px', fontSize: '1.5rem' }}>{pack.name}</h3>
              <div className={styles.price} style={{ textAlign: 'center', color: 'var(--primary)', padding: '10px 0 20px' }}>
                {formatPrice(pack.price)} <small style={{ color: 'var(--primary)' }}>{pack.currency || "FCFA"}</small>
              </div>
              
              <div className={styles.details} style={{ flex: 1 }}>
                {(pack.features || []).map((f) => (
                  <p key={f} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.9rem', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓</span> {f}
                  </p>
                ))}
              </div>
              
              <Link
                href={`/reserver?pack=${pack.slug}`}
                className="btn btn-outline"
                style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}
              >
                CHOISIR CE PACK
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* PROCESSUS */}
      <section className="section container reveal">
         <div style={{ background: 'var(--paper-deep)', borderRadius: '24px', padding: '60px 40px', border: '1px solid var(--line)' }}>
           <div className="grid-2" style={{ alignItems: 'center' }}>
              <div>
                 <div className="eyebrow">L'expérience Art Studio 242</div>
                 <h2>Un processus<br/>pensé pour vous</h2>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                 {[
                   {num: '01', title: 'CONCEPTION', desc: 'Nous échangeons sur votre idée.'},
                   {num: '02', title: 'PRÉPARATION', desc: 'Choix des tenues et de l\'ambiance.'},
                   {num: '03', title: 'SHOOTING', desc: 'Direction artistique et accompagnement.'},
                   {num: '04', title: 'RETOUCHE', desc: 'Sélection et traitement pro.'},
                   {num: '05', title: 'LIVRAISON', desc: 'Vos images finales prêtes.'}
                 ].map(step => (
                   <div key={step.num} style={{ flex: '1 1 120px' }}>
                      <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.2rem', marginBottom: '8px' }}>{step.num}</div>
                      <div style={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.05em', marginBottom: '8px', color: '#fff' }}>{step.title}</div>
                      <div style={{ color: 'var(--ink-soft)', fontSize: '0.8rem', lineHeight: 1.4 }}>{step.desc}</div>
                   </div>
                 ))}
              </div>
           </div>
         </div>
      </section>

      {/* TÉMOIGNAGES */}
      {reviews.length > 0 && (
        <section className="section container reveal">
          <div className="section-head" style={{ textAlign: 'center' }}>
            <div className="eyebrow">Témoignages</div>
            <h2>Ils ont vécu l'expérience</h2>
          </div>
          <div className="grid-3">
            {reviews.slice(0, 3).map((r) => (
              <article key={r.id} className={styles.reviewCard} style={{ background: 'transparent', border: 'none', padding: 0 }}>
                <div style={{ color: 'var(--primary)', fontSize: '3rem', lineHeight: 0.5, marginTop: '20px' }}>"</div>
                <p style={{ margin: "20px 0", fontSize: '1rem', fontStyle: 'italic', color: 'var(--ink-soft)' }}>{r.comment}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                   <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--paper-deep)' }}></div>
                   <div>
                     <strong style={{ display: 'block', fontSize: '1rem', color: '#fff' }}>{r.authorName}</strong>
                     <div style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>{"★".repeat(r.rating)}</div>
                   </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* CTA BANNER */}
      <section className="section container reveal" style={{ paddingBottom: '80px' }}>
         <div style={{ background: 'linear-gradient(90deg, #1a0503 0%, var(--primary-deep) 100%)', borderRadius: '24px', padding: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '30px' }}>
            <div>
               <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.8)' }}>Prêt à créer votre histoire ?</div>
               <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '10px 0 0', color: '#fff' }}>Votre prochaine image<br/>commence ici.</h2>
            </div>
            <Link href="/reserver" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem', background: '#fff', color: 'var(--primary-deep)' }}>
               RÉSERVER MAINTENANT
            </Link>
         </div>
      </section>

      <SiteFooter settings={settings} />
    </>
  );
}
