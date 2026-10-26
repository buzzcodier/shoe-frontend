export const CACHE_KEYS = {
  shoes: "cache_shoes",
  categories: "cache_categories",
  companies: "cache_companies",
  user: "cache_user",
  lastSync: "cache_last_sync",
} as const;

export function setCache<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(CACHE_KEYS.lastSync, new Date().toISOString());
  } catch (err) {
    console.warn("Cache write failed", err);
  }
}

export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function getLastSync(): Date | null {
  const raw = localStorage.getItem(CACHE_KEYS.lastSync);
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

export function formatLastSync(): string {
  const d = getLastSync();
  if (!d) return "never";
  return d.toLocaleString("en-KE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}