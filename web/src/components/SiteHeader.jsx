"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "../lib/api";
import { useStudio } from "../lib/StudioContext";
import gsap from "gsap";

const NAV_LINKS = [
  { href: "/#packs", label: "Packs" },
  { href: "/galerie", label: "Galerie" },
  { href: "/avis", label: "Avis" },
  { href: "/#contact", label: "Contact" },
];

export default function SiteHeader({ settings: settingsProp }) {
  const pathname = usePathname();
  const { settings: ctxSettings } = useStudio();
  const settings = { ...(settingsProp || {}), ...ctxSettings };
  const brand = settings?.brandName || "Art Studio 242";
  const whatsapp = settings?.whatsapp || "242069167515";
  const logoUrl = settings?.logoUrl ? api.assetUrl(settings.logoUrl) : null;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);
  const drawerRef = useRef(null);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Animate header in on mount
  useEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(headerRef.current, { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
  }, []);

  // Animate drawer open/close
  useEffect(() => {
    if (!drawerRef.current) return;
    if (open) {
      gsap.fromTo(drawerRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
    }
  }, [open]);

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/40"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
        {/* Brand */}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 group"
        >
          {logoUrl ? (
            <img src={logoUrl} alt={brand} className="h-10 w-auto" />
          ) : (
            <span className="flex items-center gap-2">
              <span className="inline-block w-8 h-8 rounded-full bg-primary/20 ring-1 ring-primary flex items-center justify-center text-primary font-display font-black text-sm">A</span>
            </span>
          )}
          <span className="font-display font-black text-white text-lg tracking-tight group-hover:text-primary transition-colors duration-200">
            ART STUDIO <span className="text-primary">242</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-200 tracking-wide uppercase"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
            WhatsApp
          </a>
          <Link
            href="/reserver"
            className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 tracking-wide"
          >
            RÉSERVER
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          type="button"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden flex flex-col gap-1.5 w-8 h-8 items-center justify-center group"
        >
          <span className={`block h-0.5 w-6 bg-white rounded-full transition-all duration-300 ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block h-0.5 w-6 bg-white rounded-full transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-white rounded-full transition-all duration-300 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          ref={drawerRef}
          className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-white/10"
        >
          <nav className="flex flex-col px-6 py-8 gap-6" onClick={() => setOpen(false)}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-semibold text-white/80 hover:text-white transition-colors tracking-wide"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              <Link
                href="/reserver"
                className="bg-primary text-white text-center font-bold py-3 px-6 rounded-full tracking-wide"
              >
                RÉSERVER UNE SÉANCE
              </Link>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/20 text-white text-center font-semibold py-3 px-6 rounded-full"
              >
                WhatsApp
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
