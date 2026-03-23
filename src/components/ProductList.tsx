"use client";

import { useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

const GENRES = [
  "キャラクター",
  "ミニチュア",
  "動物",
  "フィギュア",
  "おもしろ",
  "推し活",
];

const MONTHS = [
  "2026-01",
  "2026-02",
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
];

const PRICES = [200, 300, 400, 500, 600, 800, 1000, 1500];

const SORT_OPTIONS = [
  { value: "month-asc", label: "発売月（古い順）" },
  { value: "month-desc", label: "発売月（新しい順）" },
  { value: "price-asc", label: "価格（安い順）" },
  { value: "price-desc", label: "価格（高い順）" },
  { value: "name", label: "名前順" },
] as const;

type FilterKey = "genre" | "month" | "price" | "maker";

const FILTER_DEFS: { key: FilterKey; icon: string; label: string }[] = [
  { key: "genre", icon: "🏷", label: "ジャンル" },
  { key: "month", icon: "📅", label: "発売月" },
  { key: "price", icon: "💰", label: "価格" },
  { key: "maker", icon: "🏭", label: "メーカー" },
];

type ProductListProps = {
  products: Product[];
};

export default function ProductList({ products }: ProductListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedMaker, setSelectedMaker] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]["value"]>(
    "month-desc"
  );
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);

  const makers = useMemo(
    () => [...new Set(products.map((p) => p.maker))].sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.maker.toLowerCase().includes(q) ||
          p.genre?.toLowerCase().includes(q)
      );
    }
    if (selectedGenre) {
      result = result.filter((p) => p.genre === selectedGenre);
    }
    if (selectedMaker) {
      result = result.filter((p) => p.maker === selectedMaker);
    }
    if (selectedPrice != null) {
      result = result.filter((p) => p.price === selectedPrice);
    }
    if (selectedMonth) {
      result = result.filter((p) => p.release_month === selectedMonth);
    }

    switch (sortBy) {
      case "month-asc":
        result.sort((a, b) => a.release_month.localeCompare(b.release_month));
        break;
      case "month-desc":
        result.sort((a, b) => b.release_month.localeCompare(a.release_month));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [
    products,
    searchQuery,
    selectedGenre,
    selectedMaker,
    selectedPrice,
    selectedMonth,
    sortBy,
  ]);

  const toggleFilter = <T,>(
    current: T | null,
    value: T,
    setter: (v: T | null) => void
  ) => {
    setter(current === value ? null : value);
  };

  function getActiveLabel(key: FilterKey): string | null {
    switch (key) {
      case "genre": return selectedGenre;
      case "month": return selectedMonth?.replace("-", "/") ?? null;
      case "price": return selectedPrice != null ? `¥${selectedPrice}` : null;
      case "maker": return selectedMaker;
    }
  }

  function clearFilter(key: FilterKey) {
    switch (key) {
      case "genre": setSelectedGenre(null); break;
      case "month": setSelectedMonth(null); break;
      case "price": setSelectedPrice(null); break;
      case "maker": setSelectedMaker(null); break;
    }
  }

  const hasActiveFilters =
    selectedGenre || selectedMaker || selectedPrice != null || selectedMonth;

  return (
    <div className="mt-6">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#9b9bab]">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="商品名・メーカー・ジャンルで検索"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#e4e4ea] bg-white text-ink placeholder:text-[#9b9bab] focus:outline-none focus:ring-2 focus:ring-[#3daae0]/40 focus:border-[#3daae0] transition-shadow"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#e4e4ea] text-[#5c5c6f] hover:bg-[#9b9bab] hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {/* Filter chips row */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_DEFS.map((f) => {
          const active = getActiveLabel(f.key);
          const isOpen = openFilter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setOpenFilter(isOpen ? null : f.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold transition-all active:scale-95 ${
                active
                  ? "bg-[#3daae0] text-white shadow-sm"
                  : isOpen
                    ? "bg-[#3daae0]/10 text-[#3daae0] border border-[#3daae0]/30"
                    : "bg-white text-[var(--color-ink-secondary)] border border-[#e4e4ea]"
              }`}
            >
              <span className="text-base leading-none">{f.icon}</span>
              <span>{active || f.label}</span>
              {active && (
                <span
                  onClick={(e) => { e.stopPropagation(); clearFilter(f.key); setOpenFilter(null); }}
                  className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/30 text-[10px] leading-none"
                >
                  ×
                </span>
              )}
              {!active && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSelectedGenre(null);
              setSelectedMonth(null);
              setSelectedPrice(null);
              setSelectedMaker(null);
              setOpenFilter(null);
            }}
            className="flex-shrink-0 flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold text-[#ec4899] bg-[#ec4899]/10 border border-[#ec4899]/20 transition-all active:scale-95"
          >
            リセット
          </button>
        )}
      </div>

      {/* Expandable filter options */}
      {openFilter && (
        <div className="mt-2 rounded-xl border border-[#e4e4ea] bg-white p-3 shadow-sm animate-[fade-up-in_0.2s_ease]">
          <div className="flex flex-wrap gap-2">
            {openFilter === "genre" &&
              GENRES.map((g) => (
                <FilterChip
                  key={g}
                  label={g}
                  active={selectedGenre === g}
                  onClick={() => { toggleFilter(selectedGenre, g, setSelectedGenre); setOpenFilter(null); }}
                />
              ))}
            {openFilter === "month" &&
              MONTHS.map((m) => (
                <FilterChip
                  key={m}
                  label={m.replace("-", "/")}
                  active={selectedMonth === m}
                  onClick={() => { toggleFilter(selectedMonth, m, setSelectedMonth); setOpenFilter(null); }}
                />
              ))}
            {openFilter === "price" &&
              PRICES.map((p) => (
                <FilterChip
                  key={p}
                  label={`¥${p}`}
                  active={selectedPrice === p}
                  onClick={() => { toggleFilter(selectedPrice, p, setSelectedPrice); setOpenFilter(null); }}
                />
              ))}
            {openFilter === "maker" &&
              makers.map((m) => (
                <FilterChip
                  key={m}
                  label={m}
                  active={selectedMaker === m}
                  onClick={() => { toggleFilter(selectedMaker, m, setSelectedMaker); setOpenFilter(null); }}
                />
              ))}
          </div>
        </div>
      )}

      {/* Count */}
      <div className="mt-3">
        <p className="text-sm font-bold text-[#5c5c6f]">
          {filteredProducts.length}件
        </p>
      </div>

      {/* Product grid */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${
        active
          ? "bg-[#3daae0] text-white shadow-sm"
          : "bg-[#f5f5f7] text-[var(--color-ink-secondary)] hover:bg-[#e4e4ea]"
      }`}
    >
      {label}
    </button>
  );
}
