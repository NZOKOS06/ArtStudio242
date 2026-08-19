"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "./api";
import { publishLocalChange, subscribeLiveChanges } from "./liveSync";

const StudioContext = createContext(null);
export const STUDIO_CACHE_KEY = "as242_studio_cache_v1";
const CACHE_TTL = 5 * 60 * 1000;

function readCache() {
  try {
    const raw = sessionStorage.getItem(STUDIO_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    sessionStorage.setItem(STUDIO_CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    /* ignore */
  }
}

export function clearStudioStorage() {
  try {
    sessionStorage.removeItem(STUDIO_CACHE_KEY);
    sessionStorage.removeItem("as242_gallery_v1");
    sessionStorage.removeItem("as242_reviews_v1");
  } catch {
    /* ignore */
  }
  api.clearCache();
}

export function StudioProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [packs, setPacks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [revision, setRevision] = useState(0);
  const refreshRef = useRef(null);

  const refresh = useCallback(async (force = false) => {
    try {
      const opts = force ? { cache: "no-store" } : undefined;
      const [s, p, c] = await Promise.all([
        api.get("/api/settings", opts),
        api.get("/api/packs", opts),
        api.get("/api/categories", opts),
      ]);
      setSettings(s);
      setPacks(p);
      setCategories(c);
      writeCache({ settings: s, packs: p, categories: c });
      return { settings: s, packs: p, categories: c };
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  refreshRef.current = refresh;

  useEffect(() => {
    const hit = readCache();
    if (hit) {
      setSettings(hit.settings || {});
      setPacks(hit.packs || []);
      setCategories(hit.categories || []);
      setLoading(false);
    }
    setHydrated(true);
    refresh(true);
  }, [refresh]);

  useEffect(() => {
    let debounce;
    const unsub = subscribeLiveChanges((event) => {
      clearTimeout(debounce);
      debounce = setTimeout(async () => {
        clearStudioStorage();
        await refreshRef.current?.(true);
        setRevision((n) => n + 1);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("as242:live", { detail: event }));
        }
      }, 120);
    });
    return () => {
      clearTimeout(debounce);
      unsub();
    };
  }, []);

  const applySettings = useCallback((next) => {
    setSettings(next || {});
    const hit = readCache() || {};
    writeCache({
      settings: next || {},
      packs: hit.packs || packs,
      categories: hit.categories || categories,
    });
    publishLocalChange("settings", "update");
  }, [packs, categories]);

  const notifyChange = useCallback((entity, action = "update") => {
    publishLocalChange(entity, action);
    setRevision((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      packs,
      categories,
      loading,
      hydrated,
      revision,
      refresh,
      setSettings,
      applySettings,
      clearStudioStorage,
      notifyChange,
    }),
    [
      settings,
      packs,
      categories,
      loading,
      hydrated,
      revision,
      refresh,
      applySettings,
      notifyChange,
    ]
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) {
    return {
      settings: {},
      packs: [],
      categories: [],
      loading: false,
      hydrated: false,
      revision: 0,
      refresh: async () => null,
      setSettings: () => {},
      applySettings: () => {},
      clearStudioStorage,
      notifyChange: () => {},
    };
  }
  return ctx;
}

/** Reload admin lists when live sync fires for matching entities */
export function useLiveReload(entities, reloadFn) {
  const reloadRef = useRef(reloadFn);
  reloadRef.current = reloadFn;
  const key = Array.isArray(entities) ? entities.join("|") : String(entities);

  useEffect(() => {
    const list = key.split("|");
    const onLive = (e) => {
      const entity = e.detail?.entity;
      if (!entity || list.includes(entity) || list.includes("*")) {
        reloadRef.current?.();
      }
    };
    window.addEventListener("as242:live", onLive);
    return () => window.removeEventListener("as242:live", onLive);
  }, [key]);
}
