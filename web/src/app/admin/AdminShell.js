"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./admin.module.css";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/bookings", label: "Réservations" },
  { href: "/admin/packs", label: "Packs" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/gallery", label: "Galerie" },
  { href: "/admin/reviews", label: "Avis" },
  { href: "/admin/settings", label: "Paramètres" },
];

export default function AdminShell({ title, children }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    localStorage.removeItem("as242_token");
    router.push("/admin/login");
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Art Studio 242</div>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.navLink} ${pathname === link.href ? styles.navActive : ""}`}
          >
            {link.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={logout}
          className={styles.navLink}
          style={{ marginTop: "auto", background: "transparent", border: 0, textAlign: "left", cursor: "pointer" }}
        >
          Déconnexion
        </button>
      </aside>
      <main className={styles.main}>
        <div className={styles.topbar}>
          <h1>{title}</h1>
          <Link href="/" className="btn btn-outline">
            Voir le site
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}
