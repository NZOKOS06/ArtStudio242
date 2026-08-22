const path = require("path");
const { v2: cloudinary } = require("cloudinary");

const FOLDER = "artstudio242";
const filenameIndex = new Map();
let indexLoaded = false;
let indexPromise = null;

function cleanEnv(value) {
  if (value == null) return "";
  return String(value).trim().replace(/^["']|["']$/g, "");
}

function parseCloudinaryUrl(url) {
  const raw = cleanEnv(url);
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "cloudinary:") return null;
    const cloud_name = u.hostname;
    const api_key = decodeURIComponent(u.username || "");
    const api_secret = decodeURIComponent(u.password || "");
    if (!cloud_name || !api_key || !api_secret) return null;
    return { cloud_name, api_key, api_secret };
  } catch {
    return null;
  }
}

function configure() {
  const fromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
  const cloud_name = cleanEnv(process.env.CLOUDINARY_CLOUD_NAME) || fromUrl?.cloud_name || "";
  const api_key = cleanEnv(process.env.CLOUDINARY_API_KEY) || fromUrl?.api_key || "";
  const api_secret = cleanEnv(process.env.CLOUDINARY_API_SECRET) || fromUrl?.api_secret || "";

  if (cloud_name && api_key && api_secret) {
    cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
    return true;
  }

  return false;
}

const configured = configure();

function isConfigured() {
  const cfg = cloudinary.config();
  return Boolean(cfg.cloud_name && cfg.api_key && cfg.api_secret);
}

function envStatus() {
  const url = cleanEnv(process.env.CLOUDINARY_URL);
  return {
    CLOUDINARY_URL: Boolean(url),
    CLOUDINARY_CLOUD_NAME: Boolean(cleanEnv(process.env.CLOUDINARY_CLOUD_NAME)),
    CLOUDINARY_API_KEY: Boolean(cleanEnv(process.env.CLOUDINARY_API_KEY)),
    CLOUDINARY_API_SECRET: Boolean(cleanEnv(process.env.CLOUDINARY_API_SECRET)),
    parsedFromUrl: Boolean(parseCloudinaryUrl(url)),
  };
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

async function fetchAllResources(prefix) {
  const resources = [];
  let next_cursor;
  do {
    const page = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      ...(prefix ? { prefix } : {}),
      max_results: 500,
      next_cursor,
    });
    resources.push(...(page.resources || []));
    next_cursor = page.next_cursor;
  } while (next_cursor);
  return resources;
}

async function loadCloudinaryIndex(force = false) {
  if (!isConfigured()) return filenameIndex;
  if (indexLoaded && !force) return filenameIndex;
  if (indexPromise && !force) return indexPromise;

  indexPromise = (async () => {
    if (force) filenameIndex.clear();
    try {
      const folderResources = await fetchAllResources(`${FOLDER}/`);
      for (const resource of folderResources) {
        rememberResource(resource);
      }

      // Images uploadées avant l'introduction du dossier artstudio242/
      const rootResources = await fetchAllResources("");
      for (const resource of rootResources) {
        if (!resource.public_id?.startsWith(`${FOLDER}/`)) {
          rememberResource(resource);
        }
      }

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

async function searchCloudinaryByFilename(filename) {
  const stripped = filename.replace(/^\d+-/, "");
  const stem = path.parse(stripped).name;
  const base = path.parse(filename).name;
  const terms = [
    filename,
    stripped,
    stem,
    base,
    `${stem}.jpg`,
    `${stem}.jpeg`,
    `${stem}.png`,
    `${stem}.webp`,
  ];

  for (const term of terms) {
    if (!term) continue;
    try {
      const result = await cloudinary.search
        .expression(`filename:"${term}"`)
        .max_results(5)
        .execute();
      const hit = result.resources?.[0];
      if (hit?.secure_url) {
        rememberResource(hit);
        return hit.secure_url;
      }
    } catch {
      /* essayer le terme suivant */
    }
  }

  const core = stem.replace(/^_+/, "");
  if (core.length >= 4) {
    try {
      const result = await cloudinary.search
        .expression(`filename:*${core}*`)
        .max_results(10)
        .execute();
      for (const hit of result.resources || []) {
        if (hit?.secure_url) {
          rememberResource(hit);
          return hit.secure_url;
        }
      }
    } catch (err) {
      console.error("Cloudinary wildcard search error:", err.message);
    }
  }

  return null;
}

async function resolveUploadFile(filename) {
  if (!filename) return null;
  await loadCloudinaryIndex();
  const indexed = lookupIndexedUrl(filename);
  if (indexed) return indexed;

  if (isConfigured()) {
    const found = await searchCloudinaryByFilename(filename);
    if (found) return found;
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

async function rewriteAssetUrlAsync(url) {
  if (!url || typeof url !== "string") return url;
  if (!isLocalUploadUrl(url)) return url;
  const filename = filenameFromUploadUrl(url);
  const sync = lookupIndexedUrl(filename);
  if (sync) return sync;
  const remote = await resolveUploadFile(filename);
  return remote || url;
}

function rewriteGalleryImage(image) {
  if (!image) return image;
  return { ...image, imageUrl: rewriteAssetUrl(image.imageUrl) };
}

async function rewriteGalleryImagesAsync(images, prisma) {
  if (!Array.isArray(images)) return images;
  return Promise.all(
    images.map(async (image) => {
      if (!image?.imageUrl || !isLocalUploadUrl(image.imageUrl)) {
        return rewriteGalleryImage(image);
      }
      const remote = await rewriteAssetUrlAsync(image.imageUrl);
      if (remote !== image.imageUrl && prisma) {
        prisma.galleryImage
          .update({ where: { id: image.id }, data: { imageUrl: remote } })
          .catch(() => {});
      }
      return { ...image, imageUrl: remote };
    })
  );
}

function rewriteCategory(category) {
  if (!category) return category;
  return { ...category, coverUrl: rewriteAssetUrl(category.coverUrl) };
}

async function rewriteCategoriesAsync(categories, prisma) {
  if (!Array.isArray(categories)) return categories;
  return Promise.all(
    categories.map(async (category) => {
      if (!category?.coverUrl || !isLocalUploadUrl(category.coverUrl)) {
        return rewriteCategory(category);
      }
      const remote = await rewriteAssetUrlAsync(category.coverUrl);
      if (remote !== category.coverUrl && prisma) {
        prisma.category
          .update({ where: { id: category.id }, data: { coverUrl: remote } })
          .catch(() => {});
      }
      return { ...category, coverUrl: remote };
    })
  );
}

function rewriteSettings(settings) {
  if (!settings || typeof settings !== "object") return settings;
  if (!settings.logoUrl) return settings;
  return { ...settings, logoUrl: rewriteAssetUrl(settings.logoUrl) };
}

async function rewriteSettingsAsync(settings, prisma) {
  if (!settings || typeof settings !== "object") return settings;
  if (!settings.logoUrl || !isLocalUploadUrl(settings.logoUrl)) {
    return rewriteSettings(settings);
  }
  const remote = await rewriteAssetUrlAsync(settings.logoUrl);
  if (remote !== settings.logoUrl && prisma) {
    prisma.setting
      .update({ where: { key: "logoUrl" }, data: { value: remote } })
      .catch(() => {});
  }
  return { ...settings, logoUrl: remote };
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
  envStatus,
  isProductionHost,
  isLocalUploadUrl,
  filenameFromUploadUrl,
  loadCloudinaryIndex,
  resolveUploadFile,
  rewriteAssetUrl,
  rewriteAssetUrlAsync,
  rewriteGalleryImage,
  rewriteGalleryImagesAsync,
  rewriteCategory,
  rewriteCategoriesAsync,
  rewriteSettings,
  rewriteSettingsAsync,
  uploadBuffer,
  migrateLocalAssetUrls,
  FOLDER,
};
