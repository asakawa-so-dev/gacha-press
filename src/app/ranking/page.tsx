"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { Product, ProductStats } from "@/lib/types";

type RankingItem = {
  product: Product;
  count: number;
};

type RankingTab = "interest" | "purchased";
type TimePeriod = "all" | "today" | "week" | "month" | "year";

const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
  { value: "all", label: "全期間" },
  { value: "today", label: "今日" },
  { value: "week", label: "今週" },
  { value: "month", label: "今月" },
  { value: "year", label: "今年" },
];

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

function getSinceISO(period: TimePeriod): string | null {
  if (period === "all") return null;

  const now = new Date();
  let since: Date;

  switch (period) {
    case "today":
      since = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week": {
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;
      since = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
      break;
    }
    case "month":
      since = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "year":
      since = new Date(now.getFullYear(), 0, 1);
      break;
  }

  return since.toISOString();
}

export default function RankingPage() {
  const [tab, setTab] = useState<RankingTab>("interest");
  const [period, setPeriod] = useState<TimePeriod>("all");
  const [genre, setGenre] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [items, setItems] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("products")
      .select("genre")
      .then(({ data }) => {
        if (data) {
          const set = new Set(
            data.map((d: { genre: string }) => d.genre).filter(Boolean)
          );
          setGenres(Array.from(set).sort());
        }
      });
  }, []);

  const fetchRanking = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    if (period === "all") {
      const countCol =
        tab === "interest" ? "interest_count" : "purchased_count";
      const { data: statsData = [] } = await supabase
        .from("product_stats")
        .select("*")
        .order(countCol, { ascending: false })
        .limit(50);

      if (!statsData || statsData.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const productIds = (statsData as ProductStats[]).map(
        (s) => s.product_id
      );
      let productsQuery = supabase
        .from("products")
        .select("*")
        .in("id", productIds);
      if (genre) {
        productsQuery = productsQuery.eq("genre", genre);
      }
      const { data: productsData } = await productsQuery;

      if (!productsData) {
        setItems([]);
        setLoading(false);
        return;
      }

      const productMap = new Map(
        (productsData as Product[]).map((p) => [p.id, p])
      );
      const result: RankingItem[] = [];
      for (const s of statsData as ProductStats[]) {
        const product = productMap.get(s.product_id);
        if (product) {
          result.push({
            product,
            count:
              tab === "interest" ? s.interest_count : s.purchased_count,
          });
        }
      }
      result.sort((a, b) => b.count - a.count);
      setItems(result);
    } else {
      const since = getSinceISO(period);
      const rpcName =
        tab === "interest" ? "ranking_interests" : "ranking_purchases";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: rpcData } = await (supabase.rpc as any)(rpcName, {
        p_genre: genre,
        p_since: since,
      });

      if (!rpcData || rpcData.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const productIds = rpcData.map((r: any) => r.product_id);
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds);

      if (!productsData) {
        setItems([]);
        setLoading(false);
        return;
      }

      const productMap = new Map(
        (productsData as Product[]).map((p) => [p.id, p])
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const countMap = new Map<number, number>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rpcData.map((r: any) => [Number(r.product_id), Number(r.cnt)] as [number, number])
      );

      const result: RankingItem[] = [];
      for (const [pid, count] of countMap) {
        const product = productMap.get(pid);
        if (product) {
          result.push({ product, count });
        }
      }
      result.sort((a, b) => b.count - a.count);
      setItems(result);
    }

    setLoading(false);
  }, [tab, period, genre]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  return (
    <div className="min-h-screen bg-[var(--color-surface-alt)]">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold text-[var(--color-ink)]">
          ランキング
        </h1>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-white border border-[var(--color-border)] p-1">
          <button
            type="button"
            onClick={() => setTab("interest")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all ${
              tab === "interest"
                ? "bg-[#ec4899]/10 text-[#ec4899] shadow-sm"
                : "text-[var(--color-ink-muted)]"
            }`}
          >
            <HeartIcon />
            気になる
          </button>
          <button
            type="button"
            onClick={() => setTab("purchased")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all ${
              tab === "purchased"
                ? "bg-[#3daae0]/10 text-[#3daae0] shadow-sm"
                : "text-[var(--color-ink-muted)]"
            }`}
          >
            <CheckIcon />
            買った
          </button>
        </div>

        {/* Time period */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {TIME_PERIODS.map((tp) => (
            <button
              key={tp.value}
              type="button"
              onClick={() => setPeriod(tp.value)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                period === tp.value
                  ? "bg-[var(--color-ink)] text-white"
                  : "bg-white text-[var(--color-ink-secondary)] border border-[var(--color-border)]"
              }`}
            >
              {tp.label}
            </button>
          ))}
        </div>

        {/* Genre */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <button
            type="button"
            onClick={() => setGenre(null)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              genre === null
                ? "bg-[#3daae0] text-white"
                : "bg-white text-[var(--color-ink-secondary)] border border-[var(--color-border)]"
            }`}
          >
            すべて
          </button>
          {genres.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenre(g)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                genre === g
                  ? "bg-[#3daae0] text-white"
                  : "bg-white text-[var(--color-ink-secondary)] border border-[var(--color-border)]"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="mt-5">
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3daae0] border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl bg-white border border-[var(--color-border)] p-8 text-center">
              <span className="mb-3 text-4xl">
                {tab === "interest" ? "💗" : "🏆"}
              </span>
              <p className="text-[var(--color-ink-secondary)]">
                {period === "all"
                  ? "まだランキングデータがありません"
                  : "この期間のデータはまだありません"}
              </p>
              {period !== "all" && (
                <button
                  type="button"
                  onClick={() => setPeriod("all")}
                  className="mt-3 text-sm text-[#3daae0] font-medium"
                >
                  全期間で見る
                </button>
              )}
            </div>
          ) : (
            <ol className="space-y-3">
              {items.map((item, index) => {
                const rank = index + 1;
                const rankStyle =
                  RANK_STYLES[rank] ??
                  "bg-[var(--color-surface-alt)] text-[var(--color-ink-secondary)]";
                const accentColor =
                  tab === "interest" ? "#ec4899" : "#3daae0";

                return (
                  <li key={item.product.id}>
                    <Link
                      href={`/detail/${item.product.id}`}
                      className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm border border-[var(--color-border)] hover:border-[#3daae0]/40 hover:shadow-md transition-all"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${rankStyle}`}
                      >
                        {rank}
                      </span>
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg product-image-placeholder">
                        {item.product.image_url ? (
                          <Image
                            src={
                              item.product.image_url.startsWith("http")
                                ? item.product.image_url
                                : `/${item.product.image_url}`
                            }
                            alt={item.product.name}
                            fill
                            sizes="56px"
                            className="object-contain p-0.5"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[var(--color-ink-muted)] text-xs">
                            画像なし
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-[var(--color-ink)]">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-[var(--color-ink-muted)]">
                          {item.product.maker} · ¥
                          {item.product.price.toLocaleString()}
                        </p>
                      </div>
                      <div
                        className="shrink-0 flex items-center gap-1 text-sm font-bold"
                        style={{ color: accentColor }}
                      >
                        {tab === "interest" ? (
                          <HeartIcon />
                        ) : (
                          <CheckIcon />
                        )}
                        {item.count}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
