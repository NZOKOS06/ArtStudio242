"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { api } from "../lib/api";
import { useStudio } from "../lib/StudioContext";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function formatPrice(price) {
  return new Intl.NumberFormat("fr-FR").format(price);
}

const FEATURES = [
  { icon: "◎", label: "Équipement Pro" },
  { icon: "✦", label: "Direction Artistique" },
  { icon: "❋", label: "Retouche Pro" },
  { icon: "◈", label: "Livraison Rapide" },
];

const STEPS = [
  { num: "01", title: "CONCEPTION", desc: "On échange sur votre vision." },
  { num: "02", title: "PRÉPARATION", desc: "Choix des tenues & ambiance." },
  { num: "03", title: "SHOOTING", desc: "Direction artistique complète." },
  { num: "04", title: "RETOUCHE", desc: "Traitement professionnel." },
  { num: "05", title: "LIVRAISON", desc: "Vos images finales prêtes." },
];

export default function HomeClient({ initial }) {
  const { settings: liveSettings, packs: livePacks, categories: liveCategories } = useStudio();

  const settings = { ...(initial.settings || {}), ...liveSettings };
  const packs = livePacks?.length ? livePacks : initial.packs || [];
  const categories = liveCategories?.length ? liveCategories : initial.categories || [];
  const gallery = initial.gallery || [];
  const reviews = initial.reviews || [];
  const offline = initial.offline;

  const heroRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroActionsRef = useRef(null);

  // Hero entrance animation
  useEffect(() => {
    if (!heroTitleRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(".hero-eyebrow", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
      .fromTo(".hero-title-line", { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 0.8 }, "-=0.2")
      .fromTo(".hero-actions", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.3")
      .fromTo(".hero-img", { scale: 1.1, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" }, "<");
  }, []);

  // Scroll-triggered section reveals
  useEffect(() => {
    const elements = gsap.utils.toArray(".gsap-reveal");
    elements.forEach((el) => {
      gsap.fromTo(
        el,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <>
      <SiteHeader settings={settings} />

      {/* ═══════════════════════════════════════ HERO ═══════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden bg-black">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-28 pb-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="relative z-10">
            <p className="hero-eyebrow text-primary text-xs font-bold tracking-[0.25em] uppercase mb-6 opacity-0">
              Studio photo & création visuelle - Brazzaville
            </p>
            <h1 ref={heroTitleRef} className="font-display font-black leading-[1.05] text-white mb-8">
              <span className="hero-title-line block text-5xl md:text-7xl opacity-0">L'image n'est pas</span>
              <span className="hero-title-line block text-5xl md:text-7xl opacity-0">seulement prise.</span>
              <span className="hero-title-line block text-5xl md:text-7xl italic text-primary opacity-0">Elle est créée.</span>
            </h1>
            <div className="hero-actions flex flex-wrap gap-4 opacity-0">
              <Link
                href="/reserver"
                className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 tracking-wide text-sm"
              >
                RÉSERVER UNE SÉANCE
              </Link>
              <a
                href="#galerie"
                className="border border-white/25 hover:border-white/60 text-white font-semibold px-8 py-4 rounded-full transition-all duration-200 hover:bg-white/5 text-sm"
              >
                VOIR LE PORTFOLIO
              </a>
            </div>
            {offline && (
              <p className="mt-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                ⚠ API hors ligne : démarrez le backend pour charger les données.
              </p>
            )}
          </div>

          {/* Image */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="hero-img relative w-full max-w-lg opacity-0">
              <img
                src="/hero.jpg"
                alt="Art Studio 242 - Photographe professionnel à Brazzaville"
                className="w-full h-auto rounded-2xl object-cover shadow-2xl"
              />
              {/* Subtle red border glow */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/20 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-white/30 tracking-widest uppercase">Scroll</span>
          <span className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ═══════════════════════════════════════ FEATURES ═══════════════════════════════════════ */}
      {/* 
      <section className="py-20 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="gsap-reveal text-center mb-14">
            <p className="text-primary text-xs font-bold tracking-[0.25em] uppercase mb-4">Notre univers</p>
            <h2 className="font-display font-black text-4xl md:text-5xl text-white">
              Plus qu'un studio,<br />
              <span className="text-white/50">une expérience.</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="gsap-reveal group bg-white/3 hover:bg-white/6 border border-white/8 hover:border-primary/30 rounded-2xl p-8 text-center transition-all duration-300 cursor-default"
              >
                <div className="text-4xl text-primary mb-4 group-hover:scale-110 transition-transform duration-200">{f.icon}</div>
                <h3 className="text-sm font-bold text-white/80 tracking-wide">{f.label}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* ═══════════════════════════════════════ SPÉCIALITÉS ═══════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="py-20 bg-black" id="specialites">
          <div className="max-w-7xl mx-auto px-6">
            <div className="gsap-reveal mb-12">
              <p className="text-primary text-xs font-bold tracking-[0.25em] uppercase mb-3">Nos spécialités</p>
              <h2 className="font-display font-black text-4xl md:text-5xl text-white">Domaines d'expertise</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  href={`/galerie?cat=${cat.slug}`}
                  key={cat.id}
                  className="gsap-reveal group relative overflow-hidden rounded-2xl aspect-square bg-surface"
                >
                  {cat.coverUrl && (
                    <img
                      src={api.assetUrl(cat.coverUrl)}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-sm font-black text-white tracking-widest uppercase">{cat.name}</p>
                    {cat.description && <p className="text-xs text-primary mt-1">{cat.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════ PORTFOLIO ═══════════════════════════════════════ */}
      <section className="py-20 bg-black" id="galerie">
        <div className="max-w-7xl mx-auto px-6">
          <div className="gsap-reveal flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-primary text-xs font-bold tracking-[0.25em] uppercase mb-3">Portfolio</p>
              <h2 className="font-display font-black text-4xl md:text-5xl text-white">Nos réalisations</h2>
            </div>
            <Link
              href="/galerie"
              className="border border-white/20 hover:border-white/60 text-white/70 hover:text-white text-sm font-semibold px-6 py-3 rounded-full transition-all duration-200"
            >
              VOIR TOUT →
            </Link>
          </div>
          {gallery.length > 0 ? (
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
              {gallery.slice(0, 6).map((img) => (
                <div key={img.id} className="gsap-reveal break-inside-avoid rounded-xl overflow-hidden group">
                  <img
                    src={api.assetUrl(img.imageUrl)}
                    alt={img.alt || img.title || "Art Studio 242"}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="gsap-reveal aspect-[3/4] rounded-xl bg-white/3 border border-white/8 animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════ PACKS ═══════════════════════════════════════ */}
      <section className="py-20 bg-black border-t border-white/5" id="packs">
        <div className="max-w-7xl mx-auto px-6">
          <div className="gsap-reveal text-center mb-16">
            <p className="text-primary text-xs font-bold tracking-[0.25em] uppercase mb-4">Nos offres</p>
            <h2 className="font-display font-black text-4xl md:text-5xl text-white">
              Choisissez votre expérience
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {packs.map((pack) => (
              <article
                key={pack.id}
                className="gsap-reveal relative flex flex-col bg-white/3 border border-white/10 hover:border-primary/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
              >
                {pack.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full tracking-wide whitespace-nowrap">
                    {pack.badge}
                  </div>
                )}
                <h3 className="font-display font-black text-xl text-white text-center mt-2 mb-3">{pack.name}</h3>
                <div className="text-center mb-6">
                  <span className="font-display font-black text-3xl text-primary">{formatPrice(pack.price)}</span>
                  <span className="text-sm text-primary/70 ml-1">{pack.currency || "FCFA"}</span>
                </div>
                <div className="flex-1 flex flex-col gap-2.5 mb-6">
                  {(pack.features || []).map((f) => (
                    <p key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                      <span className="text-primary font-bold mt-0.5 shrink-0">✓</span>
                      {f}
                    </p>
                  ))}
                </div>
                <Link
                  href={`/reserver?pack=${pack.slug}`}
                  className="block text-center bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30 hover:border-primary font-bold py-3 px-4 rounded-xl text-sm transition-all duration-200 tracking-wide"
                >
                  CHOISIR CE PACK
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ PROCESSUS ═══════════════════════════════════════ */}
      <section className="py-20 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/3 border border-white/8 rounded-3xl p-10 md:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
              <div className="gsap-reveal">
                <p className="text-primary text-xs font-bold tracking-[0.25em] uppercase mb-4">L'expérience Art Studio 242</p>
                <h2 className="font-display font-black text-4xl md:text-5xl text-white leading-tight">
                  Un processus<br />pensé pour vous.
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:col-span-1">
                {STEPS.map((step) => (
                  <div key={step.num} className="gsap-reveal flex flex-col">
                    <span className="font-display font-black text-primary text-lg mb-2">{step.num}</span>
                    <span className="text-xs font-black text-white tracking-widest mb-2">{step.title}</span>
                    <span className="text-xs text-white/50 leading-relaxed">{step.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ TÉMOIGNAGES ═══════════════════════════════════════ */}
      {reviews.length > 0 && (
        <section className="py-20 bg-black border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="gsap-reveal text-center mb-14">
              <p className="text-primary text-xs font-bold tracking-[0.25em] uppercase mb-4">Témoignages</p>
              <h2 className="font-display font-black text-4xl md:text-5xl text-white">Ils ont vécu l'expérience</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.slice(0, 3).map((r) => (
                <article
                  key={r.id}
                  className="gsap-reveal bg-white/3 border border-white/8 rounded-2xl p-8 flex flex-col"
                >
                  <span className="text-5xl leading-none text-primary mb-4">"</span>
                  <p className="text-white/70 text-sm italic leading-relaxed flex-1 mb-6">{r.comment}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 ring-1 ring-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                      {r.authorName?.[0] || "?"}
                    </div>
                    <div>
                      <strong className="block text-sm text-white">{r.authorName}</strong>
                      <span className="text-primary text-xs">{"★".repeat(r.rating)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════ CTA BANNER ═══════════════════════════════════════ */}
      <section className="py-20 bg-black" id="contact">
        <div className="max-w-7xl mx-auto px-6">
          <div className="gsap-reveal relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-primary/60 p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('/hero.jpg')", backgroundSize: "cover", backgroundPosition: "center" }} />
            <div className="relative">
              <p className="text-white/70 text-xs font-bold tracking-[0.25em] uppercase mb-4">Prêt à créer votre histoire ?</p>
              <h2 className="font-display font-black text-4xl md:text-6xl text-white leading-tight">
                Votre prochaine image<br />commence ici.
              </h2>
            </div>
            <Link
              href="/reserver"
              className="relative shrink-0 bg-white text-primary hover:bg-white/90 font-black text-sm px-10 py-5 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-2xl tracking-widest"
            >
              RÉSERVER →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter settings={settings} />
    </>
  );
}
