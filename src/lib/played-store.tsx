"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface PlayedContextValue {
  played: Set<number>;
  toggle: (id: number) => void;
  isPlayed: (id: number) => boolean;
  count: number;
}

const PlayedContext = createContext<PlayedContextValue | null>(null);

const STORAGE_KEY = "gacha-katsu-played";

function loadPlayed(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw) as number[]);
  } catch {
    // ignore
  }
  return new Set();
}

function savePlayed(played: Set<number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...played]));
  } catch {
    // ignore
  }
}

export function PlayedProvider({ children }: { children: ReactNode }) {
  const [played, setPlayed] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPlayed(loadPlayed());
    setMounted(true);
  }, []);

  const toggle = useCallback((id: number) => {
    setPlayed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      savePlayed(next);
      return next;
    });
  }, []);

  const isPlayed = useCallback(
    (id: number) => mounted && played.has(id),
    [played, mounted]
  );

  return (
    <PlayedContext.Provider
      value={{ played, toggle, isPlayed, count: mounted ? played.size : 0 }}
    >
      {children}
    </PlayedContext.Provider>
  );
}

export function usePlayed() {
  const ctx = useContext(PlayedContext);
  if (!ctx) throw new Error("usePlayed must be used within PlayedProvider");
  return ctx;
}
