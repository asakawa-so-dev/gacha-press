"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface LikesContextValue {
  likes: Set<number>;
  toggle: (id: number) => void;
  isLiked: (id: number) => boolean;
  count: number;
}

const LikesContext = createContext<LikesContextValue | null>(null);

const STORAGE_KEY = "gacha-katsu-likes";

function loadLikes(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw) as number[]);
  } catch {
    // ignore
  }
  return new Set();
}

function saveLikes(likes: Set<number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...likes]));
  } catch {
    // ignore
  }
}

export function LikesProvider({ children }: { children: ReactNode }) {
  const [likes, setLikes] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLikes(loadLikes());
    setMounted(true);
  }, []);

  const toggle = useCallback((id: number) => {
    setLikes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveLikes(next);
      return next;
    });
  }, []);

  const isLiked = useCallback(
    (id: number) => mounted && likes.has(id),
    [likes, mounted]
  );

  return (
    <LikesContext.Provider
      value={{ likes, toggle, isLiked, count: mounted ? likes.size : 0 }}
    >
      {children}
    </LikesContext.Provider>
  );
}

export function useLikes() {
  const ctx = useContext(LikesContext);
  if (!ctx) throw new Error("useLikes must be used within LikesProvider");
  return ctx;
}
