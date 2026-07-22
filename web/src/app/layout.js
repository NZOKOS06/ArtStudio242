import { Manrope, Anton, Caveat } from "next/font/google";
import Providers from "../components/Providers";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata = {
  title: "Art Studio 242 — Capturez vos meilleurs moments",
  description:
    "Studio photo professionnel à Brazzaville. Portraits, événements, packs photo. Réservez votre séance en ligne.",
  applicationName: "Art Studio 242",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Art Studio 242",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  themeColor: "#146b37",
};

export const viewport = {
  themeColor: "#146b37",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${manrope.variable} ${anton.variable} ${caveat.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
