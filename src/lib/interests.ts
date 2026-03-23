const ANON_KEY = "anon_interests";
const ANON_PLAYED_KEY = "anon_played";

export function getAnonInterests(): number[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ANON_KEY) || "[]");
  } catch {
    return [];
  }
}

export function persistAnonInterests(ids: number[]) {
  localStorage.setItem(ANON_KEY, JSON.stringify(ids));
}

export function clearAnonInterests() {
  localStorage.removeItem(ANON_KEY);
}

/** Returns { productId: "YYYY-MM-DD" } map */
export function getAnonPlayedMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ANON_PLAYED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const migrated: Record<string, string> = {};
      const today = new Date().toISOString().slice(0, 10);
      for (const id of parsed) migrated[String(id)] = today;
      localStorage.setItem(ANON_PLAYED_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return parsed;
  } catch {
    return {};
  }
}

export function persistAnonPlayedMap(map: Record<string, string>) {
  localStorage.setItem(ANON_PLAYED_KEY, JSON.stringify(map));
}
