"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLikes } from "@/lib/likes-store";
import { GACHA_DATA, GENRES } from "@/lib/gacha-data";
import { LikeButton } from "@/components/LikeButton";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { cn } from "@/lib/utils";

const getPopularity = (id: number) => ((id * 7 + 13) % 50) + 1;

const allGenres = ["すべて", ...GENRES] as const;

export default function RankingPage() {
  const [activeGenre, setActiveGenre] = useState<string>("すべて");
  const { likes } = useLikes();

  const rankedItems = useMemo(() => {
    const filtered =
      activeGenre === "すべて"
        ? GACHA_DATA
        : GACHA_DATA.filter((item) => item.genre === activeGenre);

    return [...filtered]
      .sort((a, b) => {
        const aLiked = likes.has(a.id) ? 1 : 0;
        const bLiked = likes.has(b.id) ? 1 : 0;
        if (bLiked !== aLiked) return bLiked - aLiked;
        const popDiff = getPopularity(b.id) - getPopularity(a.id);
        if (popDiff !== 0) return popDiff;
        return a.id - b.id;
      })
      .slice(0, 50);
  }, [activeGenre, likes]);

  return (
    <>
      <AppHeader />
      <main className="pt-14 pb-20">
        <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-10">
          <div className="mb-5">
            <span className="text-[11px] font-medium tracking-[0.25em] text-primary">RANKING</span>
            <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-foreground">ランキング</h1>
          </div>

          {/* Genre pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-5" style={{ scrollbarWidth: "none" }}>
            {allGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  activeGenre === genre
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-2">
            {rankedItems.map((item, index) => {
              const rank = index + 1;
              const popularity = getPopularity(item.id);
              const imageSrc = `/images/${item.image.replace("images/", "")}`;

              return (
                <Link
                  key={item.id}
                  href={`/detail/${item.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:shadow-sm hover:border-foreground/20"
                >
                  {rank <= 3 ? (
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{
                        backgroundColor:
                          rank === 1
                            ? "oklch(0.80 0.12 80)"
                            : rank === 2
                              ? "oklch(0.75 0.01 250)"
                              : "oklch(0.65 0.10 50)",
                      }}
                    >
                      {rank}
                    </div>
                  ) : (
                    <div className="w-8 shrink-0 text-center text-sm font-medium text-muted-foreground">
                      {rank}
                    </div>
                  )}

                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image src={imageSrc} alt={item.name} fill className="object-cover" sizes="56px" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.maker} · ¥{item.price}</p>
                  </div>

                  <div className="flex shrink-0 flex-col items-center gap-0.5">
                    <LikeButton itemId={item.id} size="sm" />
                    <span className="text-[10px] text-pink-400">{popularity}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
