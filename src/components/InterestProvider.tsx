"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getAnonInterests,
  persistAnonInterests,
} from "@/lib/interests";

type InterestContextType = {
  isLiked: (productId: number) => boolean;
  toggle: (productId: number) => void;
  ready: boolean;
  isLoggedIn: boolean | null;
};

const InterestContext = createContext<InterestContextType>({
  isLiked: () => false,
  toggle: () => {},
  ready: false,
  isLoggedIn: null,
});

export const useInterests = () => useContext(InterestContext);

export function InterestProvider({ children }: { children: React.ReactNode }) {
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const userIdRef = useRef<string | null>(null);
  const pendingRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        userIdRef.current = user.id;
        setLoggedIn(true);
        supabase
          .from("user_interests")
          .select("product_id")
          .eq("user_id", user.id)
          .then(({ data }) => {
            setLikedIds(
              new Set(
                (data ?? []).map(
                  (d: { product_id: number }) => d.product_id
                )
              )
            );
            setReady(true);
          });
      } else {
        setLoggedIn(false);
        setLikedIds(new Set(getAnonInterests()));
        setReady(true);
      }
    });
  }, []);

  const toggle = useCallback((productId: number) => {
    if (pendingRef.current.has(productId)) return;

    setLikedIds((prev) => {
      const newLiked = !prev.has(productId);
      const next = new Set(prev);
      if (newLiked) next.add(productId);
      else next.delete(productId);

      if (!userIdRef.current) {
        persistAnonInterests([...next]);
      } else {
        pendingRef.current.add(productId);
        const supabase = createClient();
        const userId = userIdRef.current;
        (async () => {
          try {
            if (newLiked) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await supabase
                .from("user_interests")
                .insert({ user_id: userId, product_id: productId } as any);
            } else {
              await supabase
                .from("user_interests")
                .delete()
                .eq("user_id", userId)
                .eq("product_id", productId);
            }
          } catch {
            setLikedIds((p) => {
              const revert = new Set(p);
              if (newLiked) revert.delete(productId);
              else revert.add(productId);
              return revert;
            });
          } finally {
            pendingRef.current.delete(productId);
          }
        })();
      }

      return next;
    });
  }, []);

  const isLiked = useCallback(
    (productId: number) => likedIds.has(productId),
    [likedIds]
  );

  return (
    <InterestContext.Provider
      value={{ isLiked, toggle, ready, isLoggedIn: loggedIn }}
    >
      {children}
    </InterestContext.Provider>
  );
}
