/**
 * Create / update Art Studio 242 API on Render.
 * Usage: set RENDER_API_KEY then: node scripts/deploy-render.mjs
 *
 * Optional env:
 *   DATABASE_URL, ADMIN_PASSWORD, CORS_ORIGIN, GITHUB_REPO
 */
const API = "https://api.render.com/v1";
const key = process.env.RENDER_API_KEY;
if (!key) {
  console.error("Missing RENDER_API_KEY. Create one at https://dashboard.render.com/u/settings#api-keys");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${key}`,
  Accept: "application/json",
  "Content-Type": "application/json",
};

const repo = process.env.GITHUB_REPO || "https://github.com/NZOKOS06/ArtStudio242";
const databaseUrl = process.env.DATABASE_URL;
const adminPassword = process.env.ADMIN_PASSWORD || "ArtStudio242!";
const corsOrigin = process.env.CORS_ORIGIN || "https://artstudio242.vercel.app";
const jwtSecret =
  process.env.JWT_SECRET ||
  require("crypto").randomBytes(32).toString("hex");

async function req(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(`Render ${method} ${path} → ${res.status}`);
    err.data = data;
    throw err;
  }
  return data;
}

async function main() {
  if (!databaseUrl) {
    console.error("Missing DATABASE_URL");
    process.exit(1);
  }

  const owners = await req("GET", "/owners?limit=20");
  const owner =
    (owners || []).find((o) => o.owner?.email || o.owner?.name)?.owner ||
    owners?.[0]?.owner;
  if (!owner?.id) {
    console.error("No Render owner found", owners);
    process.exit(1);
  }
  console.log("Owner:", owner.id, owner.email || owner.name);

  const services = await req("GET", "/services?limit=50");
  const existing = (services || [])
    .map((s) => s.service || s)
    .find((s) => s.name === "artstudio242-api");

  if (existing) {
    console.log("Service already exists:", existing.serviceDetails?.url || existing.id);
    console.log("Service ID:", existing.id);
    process.exit(0);
  }

  const payload = {
    type: "web_service",
    name: "artstudio242-api",
    ownerId: owner.id,
    repo,
    branch: "master",
    rootDir: "backend",
    autoDeploy: "yes",
    serviceDetails: {
      runtime: "node",
      plan: "free",
      region: "frankfurt",
      buildCommand: "npm install && npx prisma generate",
      startCommand: "npx prisma db push && node prisma/seed.js && npm start",
      healthCheckPath: "/health",
      envVars: [
        { key: "DATABASE_URL", value: databaseUrl },
        { key: "JWT_SECRET", value: jwtSecret },
        { key: "CORS_ORIGIN", value: corsOrigin },
        { key: "ADMIN_EMAIL", value: "admin@artstudio242.com" },
        { key: "ADMIN_PASSWORD", value: adminPassword },
        { key: "ADMIN_NAME", value: "Art Studio Admin" },
        { key: "NODE_VERSION", value: "20" },
      ],
    },
  };

  const created = await req("POST", "/services", payload);
  const svc = created.service || created;
  console.log("Created:", JSON.stringify(svc, null, 2));
  const url = svc.serviceDetails?.url || svc.url;
  if (url) console.log("API URL:", url);
}

main().catch((e) => {
  console.error(e.message);
  if (e.data) console.error(JSON.stringify(e.data, null, 2));
  process.exit(1);
});
