"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { GACHA_DATA, GENRES, type Genre } from "@/lib/gacha-data";
import Image from "next/image";

export function CollectionSection() {
  const [activeGenre, setActiveGenre] = useState<Genre | "すべて">("すべて");

  const tabs = ["すべて" as const, ...GENRES];

  const items = useMemo(() => {
    const filtered =
      activeGenre === "すべて"
        ? GACHA_DATA
        : GACHA_DATA.filter((item) => item.genre === activeGenre);
    return filtered.slice(0, 12);
  }, [activeGenre]);

  return (
    <section className="border-t border-border py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        {/* Section header */}
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-[11px] font-medium tracking-[0.25em] text-primary">
              COLLECTION
            </span>
            <h2 className="mt-3 font-sans text-[clamp(1.5rem,3vw,2rem)] font-bold leading-[1.3] tracking-tight text-foreground">
              今月のピックアップ
            </h2>
          </div>
          <p className="max-w-[400px] text-[14px] leading-[1.8] text-muted-foreground">
            フィギュアからミニチュア、コラボ限定まで。
            <br className="hidden md:block" />
            街で見つけたい、今気になるガチャたち。
          </p>
        </div>

        {/* Genre tabs */}
        <div
          className="mb-10 overflow-x-auto border-b border-border"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex gap-0">
            {tabs.map((genre) => (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={cn(
                  "relative shrink-0 px-4 pb-3 pt-1 text-[13px] font-medium transition-colors duration-200",
                  activeGenre === genre
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {genre}
                {activeGenre === genre && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <article key={item.id} className="group cursor-pointer">
              {/* Image */}
              <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-muted">
                <Image
                  src={`/images/${item.image.replace("images/", "")}`}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
              </div>

              {/* Meta */}
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {item.genre}
                </span>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  ¥{item.price}
                </span>
              </div>
              <h3 className="mt-1.5 line-clamp-2 text-[14px] font-medium leading-snug text-foreground transition-colors duration-200 group-hover:text-primary">
                {item.name}
              </h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {item.maker}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
