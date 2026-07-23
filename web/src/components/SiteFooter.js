"use client";

import Link from "next/link";
import { useStudio } from "../lib/StudioContext";
import styles from "../app/site.module.css";

export default function SiteFooter({ settings: settingsProp }) {
  const { settings: ctxSettings } = useStudio();
  const settings = { ...(settingsProp || {}), ...ctxSettings };
  const brand = settings?.brandName || "Art Studio 242";
  const tagline = settings?.tagline || "Capturer • Sublimer • Immortaliser";

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footBrand}>
          <span className={styles.brandName}>{brand}</span>
        </div>
        <p className={styles.tagline}>{tagline}</p>
        <div className={styles.footLinks}>
          <Link href="/reserver">Réserver</Link>
          <Link href="/galerie">Galerie</Link>
          <Link href="/admin/login">Admin</Link>
        </div>
        <p className={styles.copy}>
          © {new Date().getFullYear()} {brand} — {settings?.address || "Brazzaville"},{" "}
          {settings?.country || "République du Congo"}
        </p>
      </div>
    </footer>
  );
}
