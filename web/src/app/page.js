import { api } from "../lib/api";
import HomeClient from "../components/HomeClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadHome() {
  try {
    const [settings, packs, gallery, categories, reviews] = await Promise.all([
      api.get("/api/settings", { cache: "no-store" }),
      api.get("/api/packs", { cache: "no-store" }),
      api.get("/api/gallery?featured=1", { cache: "no-store" }),
      api.get("/api/categories", { cache: "no-store" }),
      api.get("/api/reviews", { cache: "no-store" }),
    ]);
    return { settings, packs, gallery, categories, reviews };
  } catch {
    return {
      settings: {},
      packs: [],
      gallery: [],
      categories: [],
      reviews: [],
      offline: true,
    };
  }
}

export default async function HomePage() {
  const data = await loadHome();
  return <HomeClient initial={data} />;
}
