"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "../app/admin/admin.module.css";

const ALL_LINKS = [
  {
    href: "/admin",
    label: "Accueil",
    short: "Accueil",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" />
      </svg>
    ),
  },
  {
    href: "/admin/bookings",
    label: "Réservations",
    short: "RDV",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 11h18" />
      </svg>
    ),
  },
  {
    href: "/admin/packs",
    label: "Packs",
    short: "Packs",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3z" />
        <path d="M12 12 4 7.5M12 12l8-4.5M12 12v9" />
      </svg>
    ),
  },
  {
    href: "/admin/gallery",
    label: "Galerie",
    short: "Photos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="m21 16-4.5-4.5L7 21" />
      </svg>
    ),
  },
  {
    href: "/admin/categories",
    label: "Catégories",
    short: "Catégories",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16M4 12h10M4 18h14" />
      </svg>
    ),
  },
  {
    href: "/admin/reviews",
    label: "Avis",
    short: "Avis",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m12 3 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.8 7.2 18l.9-5.4L4.2 8.7l5.4-.8L12 3z" />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "Paramètres",
    short: "Réglages",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </svg>
    ),
  },
];

const BOTTOM_HREFS = ["/admin", "/admin/bookings", "/admin/packs", "/admin/gallery"];
const BOTTOM_LINKS = ALL_LINKS.filter((l) => BOTTOM_HREFS.includes(l.href));
const DRAWER_EXTRA = ALL_LINKS.filter((l) => !BOTTOM_HREFS.includes(l.href));

function isActive(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ children, title, subtitle, loading = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const apply = () => {
      document.body.style.overflow = mq.matches ? "hidden" : "";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  function logout() {
    localStorage.removeItem("as242_token");
    router.push("/admin/login");
  }

  const moreActive = DRAWER_EXTRA.some((l) => isActive(pathname, l.href));

  return (
    <div className={styles.adminShell}>
      {/* Desktop sidebar */}
      <aside className={`${styles.sidebar} ${styles.sidebarDesktop}`}>
        <div className={styles.sideBrand}>
          <span className={styles.sideBrandMark} aria-hidden />
          Art Studio 242
        </div>

        <nav className={styles.sideNav} aria-label="Navigation admin">
          {ALL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.sideLink} ${
                isActive(pathname, link.href) ? styles.sideLinkActive : ""
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.sideFooter}>
          <Link href="/" className={styles.sideLink}>
            Voir le site
          </Link>
          <button type="button" onClick={logout} className={`${styles.sideLink} ${styles.logoutBtn}`}>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      <div
        className={`${styles.drawerOverlay} ${drawerOpen ? styles.drawerOverlayOpen : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />

      <aside
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`}
        aria-hidden={!drawerOpen}
      >
        <div className={styles.drawerHead}>
          <div className={styles.sideBrand}>
            <span className={styles.sideBrandMark} aria-hidden />
            Art Studio 242
          </div>
          <button
            type="button"
            className={styles.drawerClose}
            onClick={() => setDrawerOpen(false)}
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        </div>
        <nav className={styles.sideNav}>
          {ALL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.sideLink} ${
                isActive(pathname, link.href) ? styles.sideLinkActive : ""
              }`}
              onClick={() => setDrawerOpen(false)}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
        <div className={styles.sideFooter}>
          <Link href="/" className={styles.sideLink} onClick={() => setDrawerOpen(false)}>
            Voir le site
          </Link>
          <button type="button" onClick={logout} className={`${styles.sideLink} ${styles.logoutBtn}`}>
            Déconnexion
          </button>
        </div>
      </aside>

      <div className={styles.mainColumn}>
        <div className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              type="button"
              className={styles.menuBtn}
              aria-label="Ouvrir le menu"
              onClick={() => setDrawerOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>
            <div>
              <h1>{title}</h1>
              {subtitle ? <p className={styles.topbarSub}>{subtitle}</p> : null}
            </div>
          </div>
        </div>

        <main className={styles.main}>
          {loading ? (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} aria-hidden />
              <p>Chargement…</p>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* WhatsApp-style bottom navigation */}
      <nav className={styles.bottomNav} aria-label="Navigation mobile">
        {BOTTOM_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.bottomItem} ${
              isActive(pathname, link.href) ? styles.bottomItemActive : ""
            }`}
          >
            {link.icon}
            <span>{link.short}</span>
          </Link>
        ))}
        <button
          type="button"
          className={`${styles.bottomItem} ${moreActive || drawerOpen ? styles.bottomItemActive : ""}`}
          onClick={() => setDrawerOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="5" cy="12" r="1.6" fill="currentColor" />
            <circle cx="12" cy="12" r="1.6" fill="currentColor" />
            <circle cx="19" cy="12" r="1.6" fill="currentColor" />
          </svg>
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
}
