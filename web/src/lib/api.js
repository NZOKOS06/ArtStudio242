const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const memoryCache = new Map();
const MEMORY_TTL = 60_000;

async function request(path, options = {}) {
  const method = options.method || "GET";
  const useCache = method === "GET" && options.cache !== "no-store" && typeof window !== "undefined";
  const cacheKey = path;

  if (useCache && memoryCache.has(cacheKey)) {
    const hit = memoryCache.get(cacheKey);
    if (Date.now() - hit.ts < MEMORY_TTL) return hit.data;
  }

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("as242_token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const fetchOpts = {
    ...options,
    headers,
  };

  if (typeof window === "undefined") {
    fetchOpts.next = options.next || { revalidate: 30 };
  } else if (!options.cache) {
    fetchOpts.cache = "default";
  }

  const res = await fetch(`${API_URL}${path}`, fetchOpts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Erreur ${res.status}`);
  }

  if (useCache) {
    memoryCache.set(cacheKey, { ts: Date.now(), data });
  }

  return data;
}

export const api = {
  get: (path, options) => request(path, options),
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body), cache: "no-store" }),
  put: (path, body) =>
    request(path, { method: "PUT", body: JSON.stringify(body), cache: "no-store" }),
  patch: (path, body) =>
    request(path, { method: "PATCH", body: JSON.stringify(body), cache: "no-store" }),
  delete: (path) => request(path, { method: "DELETE", cache: "no-store" }),
  clearCache: () => memoryCache.clear(),
  upload: async (file) => {
    const form = new FormData();
    form.append("file", file);
    const token = typeof window !== "undefined" ? localStorage.getItem("as242_token") : null;
    const res = await fetch(`${API_URL}/api/uploads`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload échoué");
    return { ...data, fullUrl: `${API_URL}${data.url}` };
  },
  assetUrl: (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  },
};

export { API_URL };
