"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLikes } from "@/lib/likes-store";
import { usePlayed } from "@/lib/played-store";
import { GACHA_DATA } from "@/lib/gacha-data";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { cn } from "@/lib/utils";

type FilterMode = "all" | "not-played" | "played";

export default function MylistPage() {
  const { likes, toggle: toggleLike, isLiked } = useLikes();
  const { toggle: togglePlayed, isPlayed } = usePlayed();
  const [filter, setFilter] = useState<FilterMode>("all");

  const likedItems = useMemo(() => {
    return GACHA_DATA.filter((item) => likes.has(item.id));
  }, [likes]);

  const filteredItems = useMemo(() => {
    switch (filter) {
      case "played":
        return likedItems.filter((i) => isPlayed(i.id));
      case "not-played":
        return likedItems.filter((i) => !isPlayed(i.id));
      default:
        return likedItems;
    }
  }, [likedItems, filter, isPlayed]);

  const playedCount = likedItems.filter((i) => isPlayed(i.id)).length;
  const progress = likedItems.length > 0 ? Math.round((playedCount / likedItems.length) * 100) : 0;

  if (likedItems.length === 0) {
    return (
      <>
        <AppHeader />
        <main className="pt-14 pb-20">
          <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-10">
            <div className="mb-5">
              <span className="text-[11px] font-medium tracking-[0.25em] text-primary">MY LIST</span>
              <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-foreground">気になるリスト</h1>
            </div>

            <div className="mt-16 flex flex-col items-center text-center">
              <span className="text-5xl mb-4">💝</span>
              <h2 className="text-lg font-bold text-foreground">まだ気になるガチャがありません</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                ガチャをさがして、ハートをタップすると<br />ここにリストが作られます
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80"
              >
                ガチャを探しに行く
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            </div>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="pt-14 pb-20">
        <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-10">
          <div className="mb-5">
            <span className="text-[11px] font-medium tracking-[0.25em] text-primary">MY LIST</span>
            <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-foreground">気になるリスト</h1>
          </div>

          {/* Progress bar */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">まわした進捗</span>
              <span className="font-bold text-foreground">{playedCount}/{likedItems.length}（{progress}%）</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="mt-4 flex gap-2">
            {([
              { key: "all", label: `すべて (${likedItems.length})` },
              { key: "not-played", label: `未回し (${likedItems.length - playedCount})` },
              { key: "played", label: `回した (${playedCount})` },
            ] as const).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  filter === f.key
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Item list */}
          <div className="mt-5 space-y-3">
            {filteredItems.map((item) => {
              const played = isPlayed(item.id);
              const imageSrc = `/images/${item.image.replace("images/", "")}`;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-sm"
                >
                  <Link href={`/detail/${item.id}`} className="flex flex-1 items-center gap-3 min-w-0">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image src={imageSrc} alt={item.name} fill className="object-cover" sizes="64px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.maker} · ¥{item.price}</p>
                      <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{item.genre}</span>
                    </div>
                  </Link>

                  <div className="flex shrink-0 flex-col items-center gap-1.5">
                    {/* Played toggle */}
                    <button
                      onClick={() => togglePlayed(item.id)}
                      className={cn(
                        "flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all",
                        played
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {played ? "回した" : "まわす"}
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => toggleLike(item.id)}
                      className="text-[10px] text-muted-foreground/60 hover:text-destructive transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="mt-12 text-center text-muted-foreground">
              <p>この条件に該当するアイテムがありません</p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
