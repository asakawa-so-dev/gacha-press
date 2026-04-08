"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ScrollReveal from "@/components/ScrollReveal";
import SnsLinks from "@/components/SnsLinks";
import ProductImage from "@/components/ProductImage";
import type { Product, ProductStats } from "@/lib/types";
import { APPROVED_MAKERS } from "@/lib/constants";

type RankingItem = {
  product: Product;
  count: number;
  trend?: "up" | "down" | "same" | "new";
  trendDelta?: number;
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
  { value: "男性", label: "男性" },
  { value: "女性", label: "女性" },
  { value: "その他", label: "その他" },
] as const;

const AGE_FILTERS = [
  { value: null, label: "すべて" },
  { value: "10代", label: "10代" },
  { value: "20代", label: "20代" },
  { value: "30代", label: "30代" },
  { value: "40代", label: "40代" },
  { value: "50代", label: "50代" },
  { value: "60代以上", label: "60代以上" },
] as const;

function HeartIcon({ className, size = 14 }: { className?: string; size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function CheckIcon({ className, size = 14 }: { className?: string; size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M2.5 18.5l2-11 5.5 4 2-7 2 7 5.5-4 2 11z" />
      <rect x="4" y="19" width="16" height="2" rx="1" />
    </svg>
  );
}

function TrendBadge({ trend, delta, size = "sm" }: { trend?: string; delta?: number; size?: "sm" | "lg" }) {
  if (!trend || trend === "same") return null;

  if (trend === "new") {
    return (
      <span className={`inline-flex items-center rounded-full bg-gradient-to-r from-[#a78bfa] to-[#818cf8] font-black text-white ${size === "lg" ? "px-2 py-0.5 text-[10px]" : "px-1.5 py-0.5 text-[8px]"}`}>
        初登場
      </span>
    );
  }

  const isUp = trend === "up";
  const color = isUp ? "#34d399" : "#f87171";
  const bg = isUp ? "#34d39915" : "#f8717115";
  const arrow = isUp ? "↑" : "↓";

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full font-black ${size === "lg" ? "px-2 py-0.5 text-[10px]" : "px-1.5 py-0.5 text-[8px]"}`}
      style={{ color, backgroundColor: bg }}
    >
      {arrow}{delta ?? ""}
    </span>
  );
}

function CountUp({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!value) { setDisplay(0); return; }
    const steps = 25;
    const inc = value / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplay(Math.min(Math.round(inc * step), value));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, duration]);

  if (!value) return <span ref={ref}>-</span>;
  return <span ref={ref}>{display.toLocaleString()}</span>;
}

function HeatBar({ ratio, color, delay }: { ratio: number; color: string; delay: number }) {
  const pct = Math.max(Math.round(ratio * 100), 2);
  return (
    <div className="relative h-1.5 w-full rounded-full bg-[#f0f0f4] overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 rounded-full heat-bar-fill"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          animationDelay: `${delay}ms`,
        }}
      />
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <p className="mb-1.5 ml-1 text-[10px] font-bold text-[#7a7a90] uppercase tracking-wider">{label}</p>
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
          : "glass-subtle text-[#4a4a5c] hover:bg-white/20"
      }`}
    >
      {children}
    </button>
  );
}

const PODIUM_CONFIG = [
  {
    order: "order-1",
    size: "w-[30%]",
    imgSize: "h-20 w-20",
    mt: "mt-6",
    badge: "h-7 w-7 text-xs",
    gradient: "from-gray-200 via-gray-100 to-white",
    borderColor: "border-gray-300",
    label: "2nd",
    rank: 2,
  },
  {
    order: "order-0 -mx-1 z-10",
    size: "w-[40%]",
    imgSize: "h-28 w-28",
    mt: "mt-0",
    badge: "h-9 w-9 text-sm",
    gradient: "from-amber-100 via-amber-50 to-white",
    borderColor: "border-amber-300",
    label: "1st",
    rank: 1,
  },
  {
    order: "order-2",
    size: "w-[30%]",
    imgSize: "h-20 w-20",
    mt: "mt-8",
    badge: "h-7 w-7 text-xs",
    gradient: "from-orange-100 via-orange-50 to-white",
    borderColor: "border-orange-300",
    label: "3rd",
    rank: 3,
  },
];

const BADGE_COLORS: Record<number, string> = {
  1: "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-400/30",
  2: "bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-md",
  3: "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md shadow-orange-400/20",
};

function Podium({ items, tab }: { items: RankingItem[]; tab: RankingTab }) {
  const top3 = items.slice(0, 3);
  if (top3.length === 0) return null;

  const accentColor = tab === "interest" ? "#ec4899" : "#3daae0";
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const configs = top3.length === 1
    ? [PODIUM_CONFIG[1]]
    : top3.length === 2
    ? [PODIUM_CONFIG[0], PODIUM_CONFIG[1]]
    : PODIUM_CONFIG;

  return (
    <div className="mt-5 flex items-end justify-center gap-2">
      {podiumOrder.map((item, i) => {
        if (!item) return null;
        const cfg = configs[i];
        const rank = cfg.rank;
        const isFirst = rank === 1;

        return (
          <Link
            key={item.product.id}
            href={`/detail/${item.product.id}`}
            className={`${cfg.size} ${cfg.order} ${cfg.mt} podium-card group`}
            style={{ animationDelay: `${rank === 1 ? 0 : rank === 2 ? 150 : 300}ms` }}
          >
            <div className={`relative rounded-2xl border-2 ${cfg.borderColor} bg-gradient-to-b ${cfg.gradient} p-3 pb-4 text-center transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-lg`}>
              {isFirst && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <CrownIcon className="text-amber-400 drop-shadow-md" />
                </div>
              )}

              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10" style={{ marginTop: isFirst ? "12px" : "0" }}>
                <span className={`flex items-center justify-center rounded-full font-black ${cfg.badge} ${BADGE_COLORS[rank]}`}>
                  {rank}
                </span>
              </div>

              <div className={`mx-auto ${cfg.imgSize} relative mt-3 overflow-hidden rounded-xl bg-white/15 backdrop-blur-md shadow-sm`}>
                <ProductImage
                  src={item.product.image_url}
                  alt={item.product.name}
                  fill
                  sizes={isFirst ? "112px" : "80px"}
                  className="object-contain p-1"
                  showSourceBadge={false}
                />
              </div>

              <p className={`mt-2 font-bold text-[#1c1c28] line-clamp-2 leading-tight ${isFirst ? "text-sm" : "text-xs"}`}>
                {item.product.name}
              </p>
              <p className="mt-0.5 text-[10px] text-[#7a7a90]">
                ¥{item.product.price.toLocaleString()}
              </p>

              <div className="mt-2 flex items-center justify-center gap-1.5">
                <div
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${isFirst ? "text-sm" : "text-xs"} font-black`}
                  style={{ color: accentColor, backgroundColor: `${accentColor}15` }}
                >
                  {tab === "interest" ? <HeartIcon size={isFirst ? 14 : 11} /> : <CheckIcon size={isFirst ? 14 : 11} />}
                  <CountUp value={item.count} />
                </div>
                <TrendBadge trend={item.trend} delta={item.trendDelta} size={isFirst ? "lg" : "sm"} />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function RankingList({ items, tab, maxCount }: { items: RankingItem[]; tab: RankingTab; maxCount: number }) {
  const accentColor = tab === "interest" ? "#ec4899" : "#3daae0";

  return (
    <ol className="mt-4 space-y-2">
      {items.map((item, index) => {
        const rank = index + 4;
        const ratio = maxCount > 0 ? item.count / maxCount : 0;
        const isNew = item.product.is_new;

        return (
          <li
            key={item.product.id}
            className="ranking-list-item opacity-0"
            style={{ animationDelay: `${index * 50 + 400}ms` }}
          >
            <Link
              href={`/detail/${item.product.id}`}
              className="flex items-center gap-3 rounded-xl glass-card p-3 transition-all duration-300 hover:bg-white/30 hover:shadow-md hover:-translate-y-0.5 group"
            >
              <div className="flex flex-col items-center gap-0.5 shrink-0">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-[#4a4a5c]">
                  {rank}
                </span>
                <TrendBadge trend={item.trend} delta={item.trendDelta} />
              </div>

              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/10">
                <ProductImage
                  src={item.product.image_url}
                  alt={item.product.name}
                  fill
                  sizes="48px"
                  className="object-contain p-0.5"
                  showSourceBadge={false}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-bold text-[#1c1c28] group-hover:text-[#3daae0] transition-colors">
                    {item.product.name}
                  </p>
                  {isNew && (
                    <span className="shrink-0 rounded bg-[#3daae0] px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
                      NEW
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#7a7a90] mt-0.5">
                  {item.product.maker} · ¥{item.product.price.toLocaleString()}
                </p>
                <div className="mt-1.5">
                  <HeatBar ratio={ratio} color={accentColor} delay={index * 50 + 600} />
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div
                  className="flex items-center gap-1 text-sm font-black tabular-nums"
                  style={{ color: accentColor }}
                >
                  {tab === "interest" ? <HeartIcon size={12} /> : <CheckIcon size={12} />}
                  <CountUp value={item.count} duration={600} />
                </div>
                <p className="text-[9px] text-[#7a7a90] mt-0.5">
                  {item.count ? `${Math.round(ratio * 100)}%` : "-"}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
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
      .in("maker", APPROVED_MAKERS as unknown as string[])
      .then(({ data }) => {
        if (data) {
          const set = new Set(
            data.map((d: { genre: string }) => d.genre).filter(Boolean)
          );
          setGenres(Array.from(set).sort());
        }
      });
  }, []);

  const applyTrend = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (supabase: any, result: RankingItem[]) => {
      const tabType = tab === "interest" ? "interest" : "purchased";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: snapData } = await (supabase.rpc as any)(
        "get_previous_ranking",
        { p_tab_type: tabType }
      );

      const prevRankMap = new Map<number, number>();
      if (snapData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const row of snapData as any[]) {
          prevRankMap.set(Number(row.product_id), Number(row.prev_rank));
        }
      }

      const enriched = result.map((item, idx) => {
        const currentRank = idx + 1;
        const prevRank = prevRankMap.get(item.product.id);

        let trend: RankingItem["trend"];
        let trendDelta: number | undefined;

        if (prevRank === undefined) {
          trend = "new";
        } else if (prevRank > currentRank) {
          trend = "up";
          trendDelta = prevRank - currentRank;
        } else if (prevRank < currentRank) {
          trend = "down";
          trendDelta = currentRank - prevRank;
        } else {
          trend = "same";
        }

        return { ...item, trend, trendDelta };
      });

      setItems(enriched);
    },
    [tab]
  );

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
        .in("id", productIds)
        .in("maker", APPROVED_MAKERS as unknown as string[]);
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
      await applyTrend(supabase, result);
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
        .in("id", productIds)
        .in("maker", APPROVED_MAKERS as unknown as string[]);

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
      await applyTrend(supabase, result);
    }

    setLoading(false);
  }, [tab, period, genre, genderFilter, ageFilter, hasDemographicFilter, applyTrend]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  const top3 = items.slice(0, 3);
  const rest = items.slice(3);
  const maxCount = items[0]?.count ?? 0;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <h1 className="section-header">/RANKING</h1>
            <SnsLinks />
          </div>
          <p className="section-header-sub">ランキング</p>
        </ScrollReveal>

        {/* Tab switcher */}
        <ScrollReveal delay={100}>
          <div className="mt-5 flex rounded-xl glass p-1">
            <button
              type="button"
              onClick={() => setTab("interest")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all duration-300 ${
                tab === "interest"
                  ? "bg-[#ec4899]/10 text-[#ec4899] shadow-sm"
                  : "text-[#7a7a90] hover:text-[#4a4a5c]"
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
                  : "text-[#7a7a90] hover:text-[#4a4a5c]"
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
                  : "glass-subtle text-[#4a4a5c] hover:bg-white/20"
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
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#3daae0] border-t-transparent" />
                <p className="text-xs text-[#7a7a90] font-medium">ランキング集計中...</p>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl glass-card p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7a7a90" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="font-bold text-[#1c1c28]">データがありません</p>
              <p className="mt-1 text-sm text-[#7a7a90]">
                {hasDemographicFilter
                  ? "この条件に一致するデータがまだありません"
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
                  className="mt-4 rounded-full bg-[#3daae0] px-5 py-2 text-sm font-bold text-white transition-all hover:bg-[#2888c0]"
                >
                  フィルターをリセット
                </button>
              )}
            </div>
          ) : (
            <>
              {/* TOP 3 Podium */}
              <Podium items={items} tab={tab} />

              {/* Separator */}
              {rest.length > 0 && (
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#e4e4ea]" />
                  <span className="text-[10px] font-bold text-[#7a7a90] uppercase tracking-widest">4位以下</span>
                  <div className="h-px flex-1 bg-[#e4e4ea]" />
                </div>
              )}

              {/* 4th and below with heat bars */}
              <RankingList items={rest} tab={tab} maxCount={maxCount} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
