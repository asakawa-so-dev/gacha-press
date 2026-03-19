const ANON_KEY = "anon_interests";

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
