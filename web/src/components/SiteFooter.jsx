"use client";

import Link from "next/link";
import { useStudio } from "../lib/StudioContext";

export default function SiteFooter({ settings: settingsProp }) {
  const { settings: ctxSettings } = useStudio();
  const settings = { ...(settingsProp || {}), ...ctxSettings };
  const brand = settings?.brandName || "Art Studio 242";
  const tagline = settings?.tagline || "Capturer • Sublimer • Immortaliser";
  const mainWhatsApp = String(settings?.whatsapp || "242069167515").replace(/\D/g, "");
  const secondWhatsApp = String(settings?.phoneSecondary || "064223521").replace(/\D/g, "");
  const secondWhatsAppInternational = secondWhatsApp.startsWith("242") ? secondWhatsApp : `242${secondWhatsApp}`;
  const instagramDefault = "https://www.instagram.com/Art_studio_242/";
  const savedInstagram = String(settings?.instagram || "");
  const instagramHref = !savedInstagram || /instagram\.com\/(artstudio242)\/?$/i.test(savedInstagram)
    ? instagramDefault
    : savedInstagram;
  const socialLinks = [
    { name: "Instagram", account: "@Art_studio_242", href: instagramHref },
    { name: "Facebook", account: "Artstudio 242", href: settings?.facebook || "https://www.facebook.com/share/1DeVsdJUwg/" },
    { name: "TikTok", account: "@artstudio242", href: settings?.tiktok || "https://www.tiktok.com/@artstudio242" },
  ];

  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Brand col */}
          <div>
            <div className="font-display font-black text-2xl text-white tracking-tight mb-3">
              ART STUDIO <span className="text-primary">242</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              Studio photo & création visuelle - Brazzaville, République du Congo.
            </p>
          </div>

          {/* Links col */}
          <div>
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Navigation</p>
            <div className="flex flex-col gap-3">
              {[
                { href: "/reserver", label: "Réserver une séance" },
                { href: "/galerie", label: "Portfolio" },
                { href: "/avis", label: "Témoignages" },
                { href: "/#packs", label: "Packs & Tarifs" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact col */}
          <div>
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Contact</p>
            <div className="flex flex-col gap-3 text-sm text-white/60">
              <span>{settings?.address || "Brazzaville"}, {settings?.country || "République du Congo"}</span>
              {mainWhatsApp && (
                <a
                  href={`https://wa.me/${mainWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-200"
                >
                  WhatsApp · +{mainWhatsApp}
                </a>
              )}
              {secondWhatsApp && (
                <a
                  href={`https://wa.me/${secondWhatsAppInternational}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-200"
                >
                  WhatsApp · +{secondWhatsAppInternational}
                </a>
              )}
            </div>
          </div>

          {/* Social profiles */}
          <div>
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Réseaux sociaux</p>
            <div className="flex flex-col gap-3 text-sm text-white/60">
              {socialLinks.map((social) => social.href ? (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-200"
                >
                  {social.name} · {social.account}
                </a>
              ) : (
                <span key={social.name}>{social.name} · {social.account}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} {brand} - {tagline}
          </p>
          <Link href="/admin/login" className="text-xs text-white/20 hover:text-white/40 transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
