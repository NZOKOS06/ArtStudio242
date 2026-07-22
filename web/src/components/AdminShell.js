"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "../app/admin/admin.module.css";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/bookings", label: "Réservations" },
  { href: "/admin/packs", label: "Packs" },
  { href: "/admin/gallery", label: "Galerie" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/reviews", label: "Avis" },
  { href: "/admin/settings", label: "Paramètres" },
];

export default function AdminShell({ children, title }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    localStorage.removeItem("as242_token");
    router.push("/admin/login");
  }

  return (
    <div className={styles.adminShell}>
      <aside className={styles.sidebar}>
        <div className={styles.sideBrand}>Art Studio 242</div>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.sideLink} ${pathname === link.href ? styles.sideLinkActive : ""}`}
          >
            {link.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={logout}
          className={styles.sideLink}
          style={{ marginTop: "auto", background: "transparent", border: 0, textAlign: "left", cursor: "pointer" }}
        >
          Déconnexion
        </button>
      </aside>
      <main className={styles.main}>
        <div className={styles.topbar}>
          <h1 style={{ fontFamily: "var(--font-anton), Anton, sans-serif", textTransform: "uppercase" }}>
            {title}
          </h1>
          <Link href="/" className="btn btn-outline">
            Voir le site
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}
