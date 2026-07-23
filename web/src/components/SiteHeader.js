"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "../lib/api";
import { useStudio } from "../lib/StudioContext";
import styles from "../app/site.module.css";

export default function SiteHeader({ settings: settingsProp }) {
  const pathname = usePathname();
  const { settings: ctxSettings } = useStudio();
  const settings = {
    ...(settingsProp || {}),
    ...ctxSettings,
  };
  const brand = settings?.brandName || "Art Studio 242";
  const whatsapp = settings?.whatsapp || "242069167515";
  const logoUrl = settings?.logoUrl ? api.assetUrl(settings.logoUrl) : null;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal:not(.in)");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.navRow}`}>
        <Link href="/" className={styles.brand} onClick={close}>
          {logoUrl ? (
            <img src={logoUrl} alt={brand} className={styles.logoImg} />
          ) : (
            <span className={styles.logoMark} aria-hidden>
              <svg viewBox="0 0 48 48" fill="none">
                <rect x="4" y="14" width="40" height="26" rx="4" fill="#161310" />
                <rect x="14" y="8" width="14" height="8" rx="2" fill="#161310" />
                <circle cx="24" cy="27" r="11" fill="#f5efe1" />
                <path d="M24 27 L24 17 A10 10 0 0 1 32.6 22 Z" fill="#146b37" />
                <path d="M24 27 L32.6 22 A10 10 0 0 1 32.6 32 Z" fill="#e2a83a" />
                <path d="M24 27 L32.6 32 A10 10 0 0 1 15.4 32 Z" fill="#c0392b" />
                <path d="M24 27 L15.4 32 A10 10 0 0 1 15.4 22 Z" fill="#161310" />
                <path d="M24 27 L15.4 22 A10 10 0 0 1 24 17 Z" fill="#161310" />
                <circle cx="24" cy="27" r="4" fill="#f5efe1" />
              </svg>
            </span>
          )}
          <span className={styles.brandName}>{brand}</span>
        </Link>

        <nav className={styles.navDesktop}>
          <Link href="/#packs">Packs</Link>
          <Link href="/galerie">Galerie</Link>
          <Link href="/avis">Avis</Link>
          <Link href="/#contact">Contact</Link>
        </nav>

        <div className={styles.navActions}>
          <Link href="/reserver" className={`btn btn-primary ${styles.navCta}`}>
            Réserver
          </Link>
          <a
            className={styles.waLink}
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          <button
            type="button"
            className={styles.burger}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`${styles.mobileDrawer} ${open ? styles.mobileOpen : ""}`}>
        <nav className={styles.mobileNav} onClick={close}>
          <Link href="/#packs">Packs</Link>
          <Link href="/galerie">Galerie</Link>
          <Link href="/avis">Avis</Link>
          <Link href="/#contact">Contact</Link>
          <Link href="/reserver" className="btn btn-primary">
            Réserver une séance
          </Link>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}
