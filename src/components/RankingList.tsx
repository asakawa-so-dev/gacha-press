"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product, ProductStats } from "@/lib/types";

export type ProductWithStats = Product & ProductStats;

type RankingListProps = {
  products: ProductWithStats[];
};

const RANK_STYLES: Record<number, string> = {
  1: "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md",
  2: "bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-md",
  3: "bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-md",
};

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      className={className}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function RankingList({ products }: RankingListProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const genres = useMemo(() => {
    const set = new Set(products.map((p) => p.genre).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!selectedGenre) return products;
    return products.filter((p) => p.genre === selectedGenre);
  }, [products, selectedGenre]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedGenre(null)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            selectedGenre === null
              ? "bg-[#3daae0] text-white"
              : "bg-[var(--color-surface-alt)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-border)]"
          }`}
        >
          すべて
        </button>
        {genres.map((genre) => (
          <button
            key={genre}
            type="button"
            onClick={() => setSelectedGenre(genre)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              selectedGenre === genre
                ? "bg-[#3daae0] text-white"
                : "bg-[var(--color-surface-alt)] text-[var(--color-ink-secondary)] hover:bg-[var(--color-border)]"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      <ol className="space-y-3">
        {filteredProducts.map((product, index) => {
          const rank = index + 1;
          const rankStyle =
            RANK_STYLES[rank] ??
            "bg-[var(--color-surface-alt)] text-[var(--color-ink-secondary)]";
          return (
            <li key={product.id}>
              <Link
                href={`/detail/${product.id}`}
                className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm border border-[var(--color-border)] hover:border-[#3daae0]/40 hover:shadow-md transition-all"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${rankStyle}`}
                >
                  {rank}
                </span>
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg product-image-placeholder">
                  {product.image_url ? (
                    <Image
                      src={
                        product.image_url.startsWith("http")
                          ? product.image_url
                          : `/${product.image_url}`
                      }
                      alt={product.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--color-ink-muted)] text-xs">
                      画像なし
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--color-ink)]">
                    {product.name}
                  </p>
                  <p className="text-xs text-[var(--color-ink-muted)]">
                    {product.maker}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1 text-[#ec4899]">
                      <HeartIcon />
                      {product.interest_count}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#3daae0]">
                      <CheckIcon />
                      {product.purchased_count}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
