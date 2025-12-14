import axios from "axios";

const CACHE_TTL_MS = 4 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 300;

const cache = new Map();

function now() {
  return Date.now();
}

export function getFileKeyFromR2Path(r2Path) {
  if (!r2Path || typeof r2Path !== "string") return null;
  if (r2Path.startsWith("r2://")) {
    const rest = r2Path.slice(5);
    const idx = rest.indexOf("/");
    if (idx === -1) return null;
    const key = rest.slice(idx + 1);
    return key || null;
  }
  return r2Path;
}

function getEndpoint() {
  const env = process.env.REACT_APP_SIGNED_URL_ENDPOINT;
  if (env && env.trim()) return env.trim();
  const base = process.env.REACT_APP_API_URL || "";
  return `${base.replace(/\/$/, "")}/get-signed-url`;
}

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt > now()) return entry;
  cache.delete(key);
  return null;
}

function setCached(key, value, ttlMs = CACHE_TTL_MS) {
  cache.set(key, { value, expiresAt: now() + ttlMs });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getSignedUrl(fileKey) {
  if (!fileKey || typeof fileKey !== "string") throw new Error("invalid fileKey");
  const cached = getCached(fileKey);
  if (cached) return cached.value;
  const url = getEndpoint();
  let lastErr = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { data } = await axios.post(
        url,
        { fileKey },
        { withCredentials: true }
      );
      if (!data || !data.signedUrl) throw new Error("invalid response");
      setCached(fileKey, data);
      return data;
    } catch (err) {
      lastErr = err;
      const code = err?.response?.status;
      if (code === 401 || code === 400 || code === 404) break;
      if (attempt < MAX_ATTEMPTS) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }
  throw lastErr || new Error("request failed");
}

export function clearSignedUrlCache() {
  cache.clear();
}

