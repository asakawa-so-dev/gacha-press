"use client";

import { useState, useMemo } from "react";
import { GACHA_DATA, GENRES, MONTHS, MAKERS } from "@/lib/gacha-data";
import { GachaCard } from "@/components/GachaCard";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { cn } from "@/lib/utils";

type SortKey = "new" | "price-asc" | "price-desc" | "name";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "new", label: "新着順" },
  { value: "price-asc", label: "安い順" },
  { value: "price-desc", label: "高い順" },
  { value: "name", label: "名前順" },
];

const PRICE_RANGES = [
  { label: "すべて", min: 0, max: Infinity },
  { label: "〜300円", min: 0, max: 300 },
  { label: "301〜500円", min: 301, max: 500 },
  { label: "501円〜", min: 501, max: Infinity },
] as const;

export default function Home() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  const [priceIdx, setPriceIdx] = useState(0);
  const [maker, setMaker] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("new");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => {
    let items = [...GACHA_DATA];

    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.maker.toLowerCase().includes(q) ||
          i.genre.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }
    if (genre) items = items.filter((i) => i.genre === genre);
    if (month) items = items.filter((i) => i.releaseMonth === month);
    if (priceIdx > 0) {
      const range = PRICE_RANGES[priceIdx];
      items = items.filter((i) => i.price >= range.min && i.price <= range.max);
    }
    if (maker) items = items.filter((i) => i.maker === maker);

    switch (sort) {
      case "new":
        items.sort((a, b) => b.id - a.id);
        break;
      case "price-asc":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        items.sort((a, b) => b.price - a.price);
        break;
      case "name":
        items.sort((a, b) => a.name.localeCompare(b.name, "ja"));
        break;
    }

    return items;
  }, [query, genre, month, priceIdx, maker, sort]);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthCount = GACHA_DATA.filter((i) => i.releaseMonth === thisMonth).length;
  const makerCount = new Set(GACHA_DATA.map((i) => i.maker)).size;
  const activeFilterCount = [genre, month, priceIdx > 0 ? "p" : null, maker].filter(Boolean).length;

  return (
    <>
      <AppHeader />
      <main className="pt-14 pb-20">
        {/* Hero — editorial statement */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-4 md:px-10 py-10 md:py-14">
            <p className="text-[10px] font-medium tracking-[0.3em] text-primary uppercase mb-4">
              Capsule Toy Curation Media
            </p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground leading-[1.2] mb-5">
              好きに、胸を張れ。
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">
              カプセルトイと生活の融合。わたしたちは「ストライク」だと思った作品だけをキュレーションします。
            </p>

            {/* Brand stats */}
            <div className="mt-8 flex flex-wrap gap-6 text-sm">
              <div>
                <span className="font-heading text-2xl font-bold text-foreground">{GACHA_DATA.length}</span>
                <span className="ml-1.5 text-muted-foreground text-xs">キュレーション</span>
              </div>
              <div>
                <span className="font-heading text-2xl font-bold text-foreground">{thisMonthCount}</span>
                <span className="ml-1.5 text-muted-foreground text-xs">今月の新着</span>
              </div>
              <div>
                <span className="font-heading text-2xl font-bold text-foreground">{makerCount}</span>
                <span className="ml-1.5 text-muted-foreground text-xs">メーカー</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-10">
          {/* Section label */}
          <div className="mb-5 flex items-center gap-3">
            <div className="accent-line" />
            <span className="text-[11px] font-medium tracking-[0.25em] text-primary uppercase">Curation</span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="名前・メーカー・ジャンルで探す"
              className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Filter toggle + sort */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                filtersOpen || activeFilterCount > 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
              絞り込む{activeFilterCount > 0 && ` (${activeFilterCount})`}
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Expanded filters */}
          {filtersOpen && (
            <div className="mt-4 space-y-4 rounded-lg border border-border bg-card p-4">
              <div>
                <p className="mb-2 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">ジャンル</p>
                <div className="flex flex-wrap gap-2">
                  <FilterPill active={genre === null} onClick={() => setGenre(null)}>すべて</FilterPill>
                  {GENRES.map((g) => (
                    <FilterPill key={g} active={genre === g} onClick={() => setGenre(g)}>{g}</FilterPill>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">発売月</p>
                <div className="flex flex-wrap gap-2">
                  <FilterPill active={month === null} onClick={() => setMonth(null)}>すべて</FilterPill>
                  {MONTHS.map((m) => (
                    <FilterPill key={m} active={month === m} onClick={() => setMonth(m)}>
                      {m.replace("2026-", "")}月
                    </FilterPill>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">価格帯</p>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((r, i) => (
                    <FilterPill key={r.label} active={priceIdx === i} onClick={() => setPriceIdx(i)}>
                      {r.label}
                    </FilterPill>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">メーカー</p>
                <div className="flex flex-wrap gap-2">
                  <FilterPill active={maker === null} onClick={() => setMaker(null)}>すべて</FilterPill>
                  {MAKERS.map((m) => (
                    <FilterPill key={m} active={maker === m} onClick={() => setMaker(m)}>{m}</FilterPill>
                  ))}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setGenre(null); setMonth(null); setPriceIdx(0); setMaker(null); }}
                  className="text-xs text-primary font-medium"
                >
                  条件をリセット
                </button>
              )}
            </div>
          )}

          {/* Result count */}
          {(query || activeFilterCount > 0) && (
            <div className="mt-4 text-xs text-muted-foreground tracking-wide">
              {results.length}件のキュレーション
            </div>
          )}

          {/* Grid */}
          {results.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
              {results.map((item) => (
                <GachaCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="mt-16 flex flex-col items-center text-center">
              <p className="font-heading text-xl text-foreground mb-2">見つかりませんでした</p>
              <p className="text-sm text-muted-foreground">条件を変えて、もう一度探してみてください。</p>
              <button
                onClick={() => { setQuery(""); setGenre(null); setMonth(null); setPriceIdx(0); setMaker(null); }}
                className="mt-4 text-sm text-primary font-medium underline underline-offset-4"
              >
                条件をリセット
              </button>
            </div>
          )}

          {/* Brand footer note */}
          <div className="mt-16 border-t border-border pt-8 text-center">
            <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              marupaca — 選球眼で選んだ、カプセルトイだけ。
            </p>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-foreground text-background"
          : "bg-background text-muted-foreground border border-border hover:border-foreground/30"
      )}
    >
      {children}
    </button>
  );
}
