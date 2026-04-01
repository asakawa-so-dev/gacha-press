"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import ScrollReveal from "@/components/ScrollReveal";
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

const GENDER_FILTERS = [
  { value: null, label: "すべて" },
  { value: "男", label: "男" },
  { value: "女", label: "女" },
  { value: "その他", label: "その他" },
] as const;

const AGE_FILTERS = [
  { value: null, label: "すべて" },
  { value: "10代", label: "10代" },
  { value: "20代", label: "20代" },
  { value: "30代", label: "30代" },
  { value: "40代", label: "40代" },
  { value: "50代", label: "50代" },
  { value: "60代〜", label: "60代〜" },
] as const;

const RANK_STYLES: Record<number, string> = {
  1: "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md",
  2: "bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-md",
  3: "bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-md",
};

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <p className="mb-1.5 ml-1 text-[10px] font-bold text-[#9b9bab] uppercase tracking-wider">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {children}
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
        active
          ? "bg-[#3daae0] text-white shadow-sm"
          : "bg-white text-[#5c5c6f] border border-[#e4e4ea] hover:border-[#9b9bab]"
      }`}
    >
      {children}
    </button>
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
  const [genderFilter, setGenderFilter] = useState<string | null>(null);
  const [ageFilter, setAgeFilter] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [items, setItems] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const hasDemographicFilter = genderFilter !== null || ageFilter !== null;

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

    if (period === "all" && !hasDemographicFilter) {
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
        p_gender: genderFilter,
        p_age_group: ageFilter,
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
  }, [tab, period, genre, genderFilter, ageFilter, hasDemographicFilter]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <ScrollReveal>
          <h1 className="section-header">/RANKING</h1>
          <p className="section-header-sub">ランキング</p>
        </ScrollReveal>

        {/* Tab switcher */}
        <ScrollReveal delay={100}>
          <div className="mt-5 flex rounded-xl bg-white border border-[#e4e4ea] p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setTab("interest")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all duration-300 ${
                tab === "interest"
                  ? "bg-[#ec4899]/10 text-[#ec4899] shadow-sm"
                  : "text-[#9b9bab] hover:text-[#5c5c6f]"
              }`}
            >
              <HeartIcon />
              気になる
            </button>
            <button
              type="button"
              onClick={() => setTab("purchased")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all duration-300 ${
                tab === "purchased"
                  ? "bg-[#3daae0]/10 text-[#3daae0] shadow-sm"
                  : "text-[#9b9bab] hover:text-[#5c5c6f]"
              }`}
            >
              <CheckIcon />
              買った
            </button>
          </div>
        </ScrollReveal>

        {/* Time period */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {TIME_PERIODS.map((tp) => (
            <button
              key={tp.value}
              type="button"
              onClick={() => setPeriod(tp.value)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                period === tp.value
                  ? "bg-[#1c1c28] text-white"
                  : "bg-white text-[#5c5c6f] border border-[#e4e4ea] hover:border-[#9b9bab]"
              }`}
            >
              {tp.label}
            </button>
          ))}
        </div>

        {/* Genre */}
        <FilterSection label="ジャンル">
          <FilterPill active={genre === null} onClick={() => setGenre(null)} color="#3daae0">
            すべて
          </FilterPill>
          {genres.map((g) => (
            <FilterPill key={g} active={genre === g} onClick={() => setGenre(g)} color="#3daae0">
              {g}
            </FilterPill>
          ))}
        </FilterSection>

        {/* Gender */}
        <FilterSection label="性別">
          {GENDER_FILTERS.map((f) => (
            <FilterPill
              key={f.value ?? "all"}
              active={genderFilter === f.value}
              onClick={() => setGenderFilter(f.value)}
              color="#ec4899"
            >
              {f.label}
            </FilterPill>
          ))}
        </FilterSection>

        {/* Age group */}
        <FilterSection label="年代">
          {AGE_FILTERS.map((f) => (
            <FilterPill
              key={f.value ?? "all"}
              active={ageFilter === f.value}
              onClick={() => setAgeFilter(f.value)}
              color="#a78bfa"
            >
              {f.label}
            </FilterPill>
          ))}
        </FilterSection>

        {/* Results */}
        <div className="mt-5">
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3daae0] border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl bg-white border border-[#e4e4ea] p-8 text-center">
              <span className="mb-3 text-4xl">
                {tab === "interest" ? "💗" : "🏆"}
              </span>
              <p className="text-[#5c5c6f]">
                {hasDemographicFilter
                  ? "この条件に一致するデータがありません"
                  : period === "all"
                  ? "まだランキングデータがありません"
                  : "この期間のデータはまだありません"}
              </p>
              {(period !== "all" || hasDemographicFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setPeriod("all");
                    setGenderFilter(null);
                    setAgeFilter(null);
                  }}
                  className="mt-3 text-sm text-[#3daae0] font-medium link-underline"
                >
                  フィルターをリセット
                </button>
              )}
            </div>
          ) : (
            <ol className="space-y-3">
              {items.map((item, index) => {
                const rank = index + 1;
                const rankStyle =
                  RANK_STYLES[rank] ?? "bg-[#f5f5f7] text-[#5c5c6f]";
                const accentColor =
                  tab === "interest" ? "#ec4899" : "#3daae0";

                return (
                  <li
                    key={item.product.id}
                    className="animate-[fade-up-in_0.4s_ease_forwards] opacity-0"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <Link
                      href={`/detail/${item.product.id}`}
                      className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm border border-[#e4e4ea] card-hover"
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
                          <div className="flex h-full w-full items-center justify-center text-[#9b9bab] text-xs">
                            画像なし
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-[#1c1c28]">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-[#9b9bab]">
                          {item.product.maker} · ¥
                          {item.product.price.toLocaleString()}
                        </p>
                      </div>
                      <div
                        className="shrink-0 flex items-center gap-1 text-sm font-bold"
                        style={{ color: accentColor }}
                      >
                        {tab === "interest" ? <HeartIcon /> : <CheckIcon />}
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

