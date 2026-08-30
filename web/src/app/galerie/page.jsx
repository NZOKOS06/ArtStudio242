import { Suspense } from "react";
import { api } from "../../lib/api";
import GalleryClient from "./GalleryClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadGallery() {
  try {
    const [settings, categories, gallery] = await Promise.all([
      api.get("/api/settings", { cache: "no-store" }),
      api.get("/api/categories", { cache: "no-store" }),
      api.get("/api/gallery", { cache: "no-store" }),
    ]);
    return { settings, categories, gallery };
  } catch {
    return {
      settings: {},
      categories: [],
      gallery: [],
      offline: true,
    };
  }
}

export default async function GaleriePage() {
  const data = await loadGallery();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <GalleryClient initial={data} />
    </Suspense>
  );
}
