"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";

const StudioContext = createContext(null);
const CACHE_KEY = "as242_studio_cache_v1";
const CACHE_TTL = 5 * 60 * 1000;

function readCache() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
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
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    /* ignore */
  }
}

export function StudioProvider({ children, initial = null }) {
  const cached = typeof window !== "undefined" ? readCache() : null;
  const [settings, setSettings] = useState(initial?.settings || cached?.settings || {});
  const [packs, setPacks] = useState(initial?.packs || cached?.packs || []);
  const [categories, setCategories] = useState(
    initial?.categories || cached?.categories || []
  );
  const [loading, setLoading] = useState(!initial && !cached);

  const refresh = useCallback(async (force = false) => {
    if (!force) {
      const hit = readCache();
      if (hit) {
        setSettings(hit.settings || {});
        setPacks(hit.packs || []);
        setCategories(hit.categories || []);
        setLoading(false);
      }
    }

    try {
      const [s, p, c] = await Promise.all([
        api.get("/api/settings"),
        api.get("/api/packs"),
        api.get("/api/categories"),
      ]);
      setSettings(s);
      setPacks(p);
      setCategories(c);
      writeCache({ settings: s, packs: p, categories: c });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh(false);
  }, [refresh]);

  const value = useMemo(
    () => ({
      settings,
      packs,
      categories,
      loading,
      refresh,
      setSettings,
    }),
    [settings, packs, categories, loading, refresh]
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
      refresh: async () => {},
      setSettings: () => {},
    };
  }
  return ctx;
}
