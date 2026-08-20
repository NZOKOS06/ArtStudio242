"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const ALL_LINKS = [
  {
    href: "/admin",
    label: "Accueil",
    short: "Accueil",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" />
      </svg>
    ),
  },
  {
    href: "/admin/bookings",
    label: "Réservations",
    short: "RDV",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16M4 12h10M4 18h14" />
      </svg>
    ),
  },
  {
    href: "/admin/reviews",
    label: "Avis",
    short: "Avis",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m12 3 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.8 7.2 18l.9-5.4L4.2 8.7l5.4-.8L12 3z" />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "Paramètres",
    short: "Réglages",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const apply = () => { document.body.style.overflow = mq.matches ? "hidden" : ""; };
    apply();
    mq.addEventListener("change", apply);
    return () => { mq.removeEventListener("change", apply); document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen]);

  function logout() {
    localStorage.removeItem("as242_token");
    router.push("/admin/login");
  }

  const moreActive = DRAWER_EXTRA.some((l) => isActive(pathname, l.href));

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0A] text-white">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/5 border-r border-white/10 p-6 shrink-0 z-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/50 shadow-lg shadow-primary/20 shrink-0" />
          <span className="font-display font-black text-xl tracking-tight">Art Studio 242</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5">
          {ALL_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-1.5">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/50 hover:bg-white/10 hover:text-white transition-all">
            Voir le site
          </Link>
          <button type="button" onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left">
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-[#111] border-r border-white/10 p-6 z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!drawerOpen}
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/50 shrink-0" />
            <span className="font-display font-black text-xl tracking-tight">Art Studio</span>
          </div>
          <button type="button" className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white bg-white/5 rounded-full" onClick={() => setDrawerOpen(false)}>✕</button>
        </div>
        <nav className="flex-1 flex flex-col gap-1.5">
          {ALL_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active ? "bg-primary text-white" : "text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-1.5">
          <Link href="/" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/50 hover:bg-white/10 hover:text-white">
            Voir le site
          </Link>
          <button type="button" onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 text-left">
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-black/40">
        <header className="flex items-center px-6 py-6 md:py-8 border-b border-white/5 shrink-0 z-10 sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="md:hidden flex flex-col justify-center gap-1.5 w-10 h-10 rounded-full bg-white/5 items-center shrink-0 hover:bg-white/10 transition-colors"
              onClick={() => setDrawerOpen(true)}
            >
              <span className="w-4 h-0.5 bg-white rounded-full" />
              <span className="w-4 h-0.5 bg-white rounded-full" />
              <span className="w-4 h-0.5 bg-white rounded-full" />
            </button>
            <div>
              <h1 className="font-display font-black text-2xl text-white">{title}</h1>
              {subtitle && <p className="text-sm text-white/50 mt-0.5">{subtitle}</p>}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative z-0 pb-24 md:pb-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center px-2 py-3 z-30 pb-safe">
        {BOTTOM_LINKS.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1.5 w-16 ${active ? "text-primary" : "text-white/40 hover:text-white"}`}
            >
              {link.icon}
              <span className="text-[10px] font-bold uppercase tracking-wider">{link.short}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className={`flex flex-col items-center gap-1.5 w-16 ${moreActive || drawerOpen ? "text-primary" : "text-white/40 hover:text-white"}`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="5" cy="12" r="1.6" fill="currentColor" />
            <circle cx="12" cy="12" r="1.6" fill="currentColor" />
            <circle cx="19" cy="12" r="1.6" fill="currentColor" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">Menu</span>
        </button>
      </nav>
    </div>
  );
}
