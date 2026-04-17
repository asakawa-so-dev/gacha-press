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

function TrendBadge({ trend, delta, size = "sm" }: { trend?: string; delta?: number; size?: "sm" | "lg" }) {
  if (!trend || trend === "same") return null;

  if (trend === "new") {
    return (
      <span className={`inline-flex items-center rounded-full bg-[var(--color-brand)] font-medium text-white ${size === "lg" ? "px-2 py-0.5 text-[10px]" : "px-1.5 py-0.5 text-[8px]"}`}>
        初登場
      </span>
    );
  }

  const isUp = trend === "up";
  const color = isUp ? "#059669" : "#8BA89B";
  const bg = isUp ? "#05966910" : "#8BA89B10";
  const arrow = isUp ? "↑" : "↓";

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full font-medium ${size === "lg" ? "px-2 py-0.5 text-[10px]" : "px-1.5 py-0.5 text-[8px]"}`}
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
    <div className="relative h-1.5 w-full rounded-full bg-[var(--color-surface-alt)] overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 rounded-full heat-bar-fill"
        style={{
          width: `${pct}%`,
          background: color,
          animationDelay: `${delay}ms`,
        }}
      />
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <p className="mb-1.5 ml-1 text-[10px] font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">{label}</p>
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
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? "bg-[var(--color-brand)] text-white"
          : "bg-white border border-[var(--color-border)] text-[var(--color-ink-secondary)] hover:border-[#BDD8CA]"
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
    borderColor: "border-[var(--color-border)]",
    label: "2nd",
    rank: 2,
  },
  {
    order: "order-0 -mx-1 z-10",
    size: "w-[40%]",
    imgSize: "h-28 w-28",
    mt: "mt-0",
    badge: "h-9 w-9 text-sm",
    borderColor: "border-[var(--color-brand)]",
    label: "1st",
    rank: 1,
  },
  {
    order: "order-2",
    size: "w-[30%]",
    imgSize: "h-20 w-20",
    mt: "mt-8",
    badge: "h-7 w-7 text-xs",
    borderColor: "border-[var(--color-border)]",
    label: "3rd",
    rank: 3,
  },
];

const BADGE_COLORS: Record<number, string> = {
  1: "bg-[var(--color-brand)] text-white",
  2: "bg-[var(--color-ink-muted)] text-white",
  3: "bg-[var(--color-accent)] text-white",
};

function Podium({ items, tab }: { items: RankingItem[]; tab: RankingTab }) {
  const top3 = items.slice(0, 3);
  if (top3.length === 0) return null;

  const accentColor = tab === "interest" ? "var(--color-accent)" : "var(--color-brand)";
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
            <div className={`relative rounded-lg border ${cfg.borderColor} bg-white p-3 pb-4 text-center transition-all duration-200 group-hover:border-[var(--color-brand)]`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className={`flex items-center justify-center rounded-full font-medium ${cfg.badge} ${BADGE_COLORS[rank]}`}>
                  {rank}
                </span>
              </div>

              <div className={`mx-auto ${cfg.imgSize} relative mt-3 overflow-hidden rounded-lg bg-[var(--color-surface-alt)]`}>
                <ProductImage
                  src={item.product.image_url}
                  alt={item.product.name}
                  fill
                  sizes={isFirst ? "112px" : "80px"}
                  className="object-contain p-1"
                  showSourceBadge={false}
                />
              </div>

              <p className={`mt-2 font-medium text-[var(--color-ink)] line-clamp-2 leading-tight ${isFirst ? "text-sm" : "text-xs"}`}>
                {item.product.name}
              </p>
              <p className="mt-0.5 text-[10px] text-[var(--color-ink-muted)]">
                ¥{item.product.price.toLocaleString()}
              </p>

              <div className="mt-2 flex items-center justify-center gap-1.5">
                <div
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${isFirst ? "text-sm" : "text-xs"} font-medium`}
                  style={{ color: accentColor, backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)` }}
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
  const accentColor = tab === "interest" ? "#B46075" : "#7EBEA5";

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
              className="flex items-center gap-3 rounded-lg bg-white border border-[var(--color-border)] p-3 transition-all duration-200 hover:border-[var(--color-brand)] group"
            >
              <div className="flex flex-col items-center gap-0.5 shrink-0">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-surface-alt)] text-xs font-medium text-[var(--color-ink-secondary)]">
                  {rank}
                </span>
                <TrendBadge trend={item.trend} delta={item.trendDelta} />
              </div>

              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--color-surface-alt)]">
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
                  <p className="truncate text-sm font-medium text-[var(--color-ink)] group-hover:text-[var(--color-brand)] transition-colors">
                    {item.product.name}
                  </p>
                  {isNew && (
                    <span className="shrink-0 rounded bg-[var(--color-brand)] px-1.5 py-0.5 text-[9px] font-medium text-white leading-none">
                      NEW
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--color-ink-muted)] mt-0.5">
                  {item.product.maker} · ¥{item.product.price.toLocaleString()}
                </p>
                <div className="mt-1.5">
                  <HeatBar ratio={ratio} color={accentColor} delay={index * 50 + 600} />
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div
                  className="flex items-center gap-1 text-sm font-medium tabular-nums"
                  style={{ color: accentColor }}
                >
                  {tab === "interest" ? <HeartIcon size={12} /> : <CheckIcon size={12} />}
                  <CountUp value={item.count} duration={600} />
                </div>
                <p className="text-[9px] text-[var(--color-ink-muted)] mt-0.5">
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
            <h1 className="section-header">RANKING</h1>
            <SnsLinks />
          </div>
          <p className="section-header-sub">ランキング</p>
        </ScrollReveal>

        {/* Tab switcher */}
        <ScrollReveal delay={100}>
          <div className="mt-5 flex rounded-lg bg-[var(--color-surface-alt)] p-1">
            <button
              type="button"
              onClick={() => setTab("interest")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2.5 text-sm font-medium transition-all ${
                tab === "interest"
                  ? "bg-white text-[var(--color-accent)] shadow-sm"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink-secondary)]"
              }`}
            >
              <HeartIcon />
              気になる
            </button>
            <button
              type="button"
              onClick={() => setTab("purchased")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2.5 text-sm font-medium transition-all ${
                tab === "purchased"
                  ? "bg-white text-[var(--color-brand)] shadow-sm"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink-secondary)]"
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
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                period === tp.value
                  ? "bg-[var(--color-ink)] text-white"
                  : "bg-white border border-[var(--color-border)] text-[var(--color-ink-secondary)] hover:border-[#BDD8CA]"
              }`}
            >
              {tp.label}
            </button>
          ))}
        </div>

        {/* Genre */}
        <FilterSection label="ジャンル">
          <FilterPill active={genre === null} onClick={() => setGenre(null)}>
            すべて
          </FilterPill>
          {genres.map((g) => (
            <FilterPill key={g} active={genre === g} onClick={() => setGenre(g)}>
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
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
                <p className="text-xs text-[var(--color-ink-muted)]">ランキング集計中...</p>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center rounded-lg bg-white border border-[var(--color-border)] p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-alt)]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="font-medium text-[var(--color-ink)]">データがありません</p>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
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
                  className="mt-4 rounded-full bg-[var(--color-brand)] px-5 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
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
                  <div className="h-px flex-1 bg-[var(--color-border)]" />
                  <span className="text-[10px] font-medium text-[var(--color-ink-muted)] uppercase tracking-widest">4位以下</span>
                  <div className="h-px flex-1 bg-[var(--color-border)]" />
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
