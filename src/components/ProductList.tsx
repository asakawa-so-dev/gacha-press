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

type ProductListProps = {
  products: Product[];
};

function MagnifierIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 text-[#9b9bab]"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 transition-transform"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function ProductList({ products }: ProductListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedMaker, setSelectedMaker] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]["value"]>(
    "month-desc"
  );
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

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

  const hasActiveFilters =
    selectedGenre || selectedMaker || selectedPrice != null || selectedMonth;

  return (
    <div className="mt-6">
      {/* SearchBar */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">
          <MagnifierIcon />
        </span>
        <input
          type="text"
          placeholder="商品名・メーカー・ジャンルで検索"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-[10px] border border-[#e4e4ea] bg-white text-ink placeholder:text-[#9b9bab] focus:outline-none focus:ring-2 focus:ring-[#3daae0]/40 focus:border-[#3daae0] transition-shadow"
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

      {/* Filter toggle (mobile) */}
      <button
        type="button"
        onClick={() => setFilterPanelOpen((o) => !o)}
        className="mt-4 sm:hidden w-full flex items-center justify-between gap-2 py-3 px-4 rounded-[10px] border border-[#e4e4ea] bg-white text-ink font-medium"
      >
        <span>絞り込み</span>
        <span
          className={
            filterPanelOpen ? "rotate-180" : ""
          }
        >
          <ChevronDownIcon />
        </span>
      </button>

      {/* Filter panel (collapsible on mobile) */}
      <div
        className={
          filterPanelOpen
            ? "mt-4 sm:mt-4 block"
            : "hidden sm:block sm:mt-4"
        }
      >
        <div className="rounded-lg border border-[#e4e4ea] bg-white p-4 space-y-5">
          {/* Genre */}
          <div>
            <p className="text-xs font-medium text-[#5c5c6f] mb-2">ジャンル</p>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => {
                const active = selectedGenre === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleFilter(selectedGenre, g, setSelectedGenre)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#3daae0] text-white border-[#3daae0]"
                        : "bg-white text-ink border-[#e4e4ea] hover:border-[#3daae0]/50"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Month */}
          <div>
            <p className="text-xs font-medium text-[#5c5c6f] mb-2">発売月</p>
            <div className="flex flex-wrap gap-2">
              {MONTHS.map((m) => {
                const active = selectedMonth === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() =>
                      toggleFilter(selectedMonth, m, setSelectedMonth)
                    }
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#3daae0] text-white border-[#3daae0]"
                        : "bg-white text-ink border-[#e4e4ea] hover:border-[#3daae0]/50"
                    }`}
                  >
                    {m.replace("-", "/")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price */}
          <div>
            <p className="text-xs font-medium text-[#5c5c6f] mb-2">価格（¥）</p>
            <div className="flex flex-wrap gap-2">
              {PRICES.map((p) => {
                const active = selectedPrice === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      toggleFilter(selectedPrice, p, setSelectedPrice)
                    }
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#3daae0] text-white border-[#3daae0]"
                        : "bg-white text-ink border-[#e4e4ea] hover:border-[#3daae0]/50"
                    }`}
                  >
                    ¥{p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Maker */}
          <div>
            <p className="text-xs font-medium text-[#5c5c6f] mb-2">メーカー</p>
            <div className="flex flex-wrap gap-2">
              {makers.map((m) => {
                const active = selectedMaker === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() =>
                      toggleFilter(selectedMaker, m, setSelectedMaker)
                    }
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#3daae0] text-white border-[#3daae0]"
                        : "bg-white text-ink border-[#e4e4ea] hover:border-[#3daae0]/50"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sort + count */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-[#5c5c6f]">
          {filteredProducts.length}件
        </p>
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as (typeof SORT_OPTIONS)[number]["value"])
          }
          className="py-2 pl-3 pr-8 rounded-[10px] border border-[#e4e4ea] bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-[#3daae0]/40 focus:border-[#3daae0]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Product grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
