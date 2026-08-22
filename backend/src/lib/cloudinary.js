const path = require("path");
const { v2: cloudinary } = require("cloudinary");

const FOLDER = "artstudio242";
const filenameIndex = new Map();
let indexLoaded = false;
let indexPromise = null;

function parseCloudinaryUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "cloudinary:") return null;
    return {
      cloud_name: u.hostname,
      api_key: decodeURIComponent(u.username || ""),
      api_secret: decodeURIComponent(u.password || ""),
    };
  } catch {
    return null;
  }
}

function configure() {
  const fromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
  const cloud_name =
    process.env.CLOUDINARY_CLOUD_NAME || fromUrl?.cloud_name || "";
  const api_key = process.env.CLOUDINARY_API_KEY || fromUrl?.api_key || "";
  const api_secret =
    process.env.CLOUDINARY_API_SECRET || fromUrl?.api_secret || "";

  if (cloud_name && api_key && api_secret) {
    cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
    return true;
  }

  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
    const cfg = cloudinary.config();
    return Boolean(cfg.cloud_name && cfg.api_key && cfg.api_secret);
  }

  return false;
}

const configured = configure();

function isConfigured() {
  const cfg = cloudinary.config();
  return Boolean(cfg.cloud_name && cfg.api_key && cfg.api_secret);
}

function getCloudName() {
  return cloudinary.config().cloud_name || process.env.CLOUDINARY_CLOUD_NAME || "";
}

function isProductionHost() {
  return Boolean(process.env.RENDER || process.env.NODE_ENV === "production");
}

function isLocalUploadUrl(url) {
  if (!url || typeof url !== "string") return false;
  if (url.startsWith("/uploads/")) return true;
  return /\/uploads\/[^/?#]+/.test(url) && !url.includes("res.cloudinary.com");
}

function filenameFromUploadUrl(url) {
  if (!url) return "";
  try {
    const raw = url.startsWith("/uploads/")
      ? url.slice("/uploads/".length)
      : new URL(url, "http://local").pathname.split("/uploads/").pop();
    return decodeURIComponent(String(raw || "").split("?")[0]);
  } catch {
    return "";
  }
}

function indexKeysFor(filename, publicId, originalFilename, format) {
  const keys = new Set();
  const add = (value) => {
    if (!value) return;
    keys.add(value);
    keys.add(value.toLowerCase());
  };

  add(filename);
  add(path.basename(filename));
  add(filename.replace(/^\d+-/, ""));
  add(path.parse(filename).name);
  add(path.parse(filename.replace(/^\d+-/, "")).name);

  if (publicId) {
    add(publicId);
    add(path.basename(publicId));
    if (format) add(`${path.basename(publicId)}.${format}`);
  }
  if (originalFilename) {
    add(originalFilename);
    add(`${originalFilename}.${format || "jpg"}`);
  }
  return keys;
}

function rememberResource(resource) {
  if (!resource?.secure_url) return;
  const url = resource.secure_url;
  const filename = path.basename(url.split("?")[0]);
  for (const key of indexKeysFor(
    filename,
    resource.public_id,
    resource.original_filename,
    resource.format
  )) {
    filenameIndex.set(key, url);
  }
}

async function loadCloudinaryIndex(force = false) {
  if (!isConfigured()) return filenameIndex;
  if (indexLoaded && !force) return filenameIndex;
  if (indexPromise && !force) return indexPromise;

  indexPromise = (async () => {
    if (force) filenameIndex.clear();
    try {
      let next_cursor;
      do {
        const page = await cloudinary.api.resources({
          type: "upload",
          prefix: `${FOLDER}/`,
          max_results: 500,
          next_cursor,
        });
        for (const resource of page.resources || []) {
          rememberResource(resource);
        }
        next_cursor = page.next_cursor;
      } while (next_cursor);

      indexLoaded = true;
      console.log(`Cloudinary index: ${filenameIndex.size} clés`);
    } catch (err) {
      console.error("Cloudinary index error:", err.message);
    }
    return filenameIndex;
  })();

  return indexPromise;
}

function lookupIndexedUrl(filename) {
  if (!filename) return null;
  return (
    filenameIndex.get(filename) ||
    filenameIndex.get(filename.toLowerCase()) ||
    filenameIndex.get(filename.replace(/^\d+-/, "")) ||
    filenameIndex.get(filename.replace(/^\d+-/, "").toLowerCase()) ||
    null
  );
}

function guessedCloudinaryUrls(filename) {
  const cloud = getCloudName();
  if (!cloud || !filename) return [];
  const encoded = encodeURIComponent(filename);
  const stripped = encodeURIComponent(filename.replace(/^\d+-/, ""));
  return [
    `https://res.cloudinary.com/${cloud}/image/upload/${FOLDER}/${encoded}`,
    `https://res.cloudinary.com/${cloud}/image/upload/${encoded}`,
    `https://res.cloudinary.com/${cloud}/image/upload/${FOLDER}/${stripped}`,
    `https://res.cloudinary.com/${cloud}/image/upload/${stripped}`,
  ];
}

async function urlExists(url) {
  try {
    const head = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (head.ok) return true;
    if (head.status === 405 || head.status === 400 || head.status === 501) {
      const get = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
      });
      return get.ok;
    }
    return false;
  } catch {
    return false;
  }
}

async function resolveUploadFile(filename) {
  if (!filename) return null;
  await loadCloudinaryIndex();
  const indexed = lookupIndexedUrl(filename);
  if (indexed) return indexed;

  if (isConfigured()) {
    try {
      const stem = path.parse(filename.replace(/^\d+-/, "")).name;
      const result = await cloudinary.search
        .expression(`filename="${stem}"`)
        .max_results(5)
        .execute();
      const hit = result.resources?.[0];
      if (hit?.secure_url) {
        rememberResource(hit);
        return hit.secure_url;
      }
    } catch (err) {
      console.error("Cloudinary search error:", err.message);
    }
  }

  for (const url of guessedCloudinaryUrls(filename)) {
    if (await urlExists(url)) {
      filenameIndex.set(filename, url);
      filenameIndex.set(filename.toLowerCase(), url);
      return url;
    }
  }
  return null;
}

function rewriteAssetUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (!isLocalUploadUrl(url)) return url;
  const filename = filenameFromUploadUrl(url);
  return lookupIndexedUrl(filename) || url;
}

function rewriteGalleryImage(image) {
  if (!image) return image;
  return { ...image, imageUrl: rewriteAssetUrl(image.imageUrl) };
}

function rewriteCategory(category) {
  if (!category) return category;
  return { ...category, coverUrl: rewriteAssetUrl(category.coverUrl) };
}

function rewriteSettings(settings) {
  if (!settings || typeof settings !== "object") return settings;
  if (!settings.logoUrl) return settings;
  return { ...settings, logoUrl: rewriteAssetUrl(settings.logoUrl) };
}

function uploadBuffer(buffer, originalname) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
        filename_override: originalname,
      },
      (err, result) => {
        if (err) return reject(err);
        rememberResource(result);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

async function migrateLocalAssetUrls(prisma, { notify, invalidate } = {}) {
  if (!isConfigured()) {
    return { ok: false, reason: "cloudinary-not-configured", updated: 0 };
  }

  await loadCloudinaryIndex(true);

  let updated = 0;

  const images = await prisma.galleryImage.findMany({
    select: { id: true, imageUrl: true },
  });
  for (const image of images) {
    if (!isLocalUploadUrl(image.imageUrl)) continue;
    const remote = await resolveUploadFile(filenameFromUploadUrl(image.imageUrl));
    if (!remote || remote === image.imageUrl) continue;
    await prisma.galleryImage.update({
      where: { id: image.id },
      data: { imageUrl: remote },
    });
    updated += 1;
  }

  const categories = await prisma.category.findMany({
    select: { id: true, coverUrl: true },
  });
  for (const category of categories) {
    if (!isLocalUploadUrl(category.coverUrl)) continue;
    const remote = await resolveUploadFile(filenameFromUploadUrl(category.coverUrl));
    if (!remote || remote === category.coverUrl) continue;
    await prisma.category.update({
      where: { id: category.id },
      data: { coverUrl: remote },
    });
    updated += 1;
  }

  const logo = await prisma.setting.findUnique({ where: { key: "logoUrl" } });
  if (logo && isLocalUploadUrl(logo.value)) {
    const remote = await resolveUploadFile(filenameFromUploadUrl(logo.value));
    if (remote && remote !== logo.value) {
      await prisma.setting.update({
        where: { key: "logoUrl" },
        data: { value: remote },
      });
      updated += 1;
    }
  }

  if (updated > 0) {
    try {
      await invalidate?.("gallery:*");
      await invalidate?.("images:*");
      await invalidate?.("config:*");
    } catch {
      /* ignore */
    }
    notify?.("gallery", "update");
    notify?.("settings", "update");
    notify?.("categories", "update");
  }

  return { ok: true, updated, indexed: filenameIndex.size };
}

module.exports = {
  cloudinary,
  configured,
  isConfigured,
  isProductionHost,
  isLocalUploadUrl,
  filenameFromUploadUrl,
  loadCloudinaryIndex,
  resolveUploadFile,
  rewriteAssetUrl,
  rewriteGalleryImage,
  rewriteCategory,
  rewriteSettings,
  uploadBuffer,
  migrateLocalAssetUrls,
  FOLDER,
};
