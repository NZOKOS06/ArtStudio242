"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "◈" },
  { href: "/admin/bookings", label: "Réservations", icon: "📅" },
  { href: "/admin/packs", label: "Packs", icon: "◉" },
  { href: "/admin/categories", label: "Catégories", icon: "◧" },
  { href: "/admin/gallery", label: "Galerie", icon: "◻" },
  { href: "/admin/reviews", label: "Avis", icon: "★" },
  { href: "/admin/settings", label: "Paramètres", icon: "◎" },
];

export default function AdminShell({ title, children }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    localStorage.removeItem("as242_token");
    router.push("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col bg-[#0a0a0a] border-r border-white/8 py-8 px-4">
        {/* Logo */}
        <div className="px-3 mb-10">
          <div className="font-display font-black text-base text-white tracking-tight">
            ART STUDIO <span className="text-primary">242</span>
          </div>
          <div className="text-xs text-white/30 mt-0.5 tracking-wide">Administration</div>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-1">
          {LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/15 text-white border border-primary/25"
                    : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <span className="text-base w-5 text-center">{link.icon}</span>
                {link.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="pt-4 border-t border-white/8 flex flex-col gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-white/30 hover:text-white/60 transition-colors rounded-lg hover:bg-white/5"
          >
            ← Voir le site
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-xs text-white/30 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/5 text-left"
          >
            ↩ Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="h-16 flex items-center justify-between px-8 border-b border-white/8 bg-black/80 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="font-display font-black text-lg text-white">{title}</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-4 py-2 rounded-full transition-all duration-200"
            >
              Voir le site →
            </Link>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
