const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const memoryCache = new Map();
const MEMORY_TTL = 60_000;

async function request(path, options = {}) {
  const method = options.method || "GET";
  const noStore = options.cache === "no-store";
  const useCache =
    method === "GET" && !noStore && typeof window !== "undefined";
  const cacheKey = path.split("?")[0];

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
    method,
    headers,
    body: options.body,
  };

  if (typeof window === "undefined") {
    if (noStore) {
      fetchOpts.cache = "no-store";
    } else {
      fetchOpts.next = options.next || { revalidate: 10 };
    }
  } else {
    fetchOpts.cache = noStore ? "no-store" : "default";
  }

  const url =
    noStore && method === "GET"
      ? `${API_URL}${path}${path.includes("?") ? "&" : "?"}_=${Date.now()}`
      : `${API_URL}${path}`;

  const res = await fetch(url, fetchOpts);
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
  clearCache: (path) => {
    if (path) memoryCache.delete(path.split("?")[0]);
    else memoryCache.clear();
  },
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
