"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import ProductImage from "@/components/ProductImage";
import type { ProductDemographics as DemoData, RelatedProduct, ProductTrendDay } from "@/lib/types";

const GENDER_COLORS: Record<string, string> = {
  "男": "#7cb9e8",
  "男性": "#7cb9e8",
  "女": "#B46075",
  "女性": "#B46075",
  "その他": "#92C8AE",
  "未設定": "#D5E8DE",
};

function MalePictogram({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" />
    </svg>
  );
}

function FemalePictogram({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" />
      <path d="M9 11.5l3 3 3-3" />
    </svg>
  );
}

function OtherPictogram({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2" />
      <circle cx="12" cy="7" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}

function GenderIcon({ gender, size = 16, color }: { gender: string; size?: number; color?: string }) {
  const c = color ?? GENDER_COLORS[gender] ?? "#8BA89B";
  switch (gender) {
    case "男": case "男性": return <MalePictogram size={size} color={c} />;
    case "女": case "女性": return <FemalePictogram size={size} color={c} />;
    default: return <OtherPictogram size={size} color={c} />;
  }
}

const AGE_COLORS: Record<string, string> = {
  "10代": "#A8D5C2",
  "20代": "#7EBEA5",
  "30代": "#5A9A82",
  "40代": "#B46075",
  "50代": "#D48A9A",
  "60代〜": "#92C8AE",
  "未設定": "#D5E8DE",
};

const AGE_ORDER = ["10代", "20代", "30代", "40代", "50代", "60代〜", "未設定"];

type Props = {
  productId: number;
  initialPurchasedCount: number;
};

function CountUpNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplay(Math.min(Math.round(increment * step), value));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md bg-white px-3 py-2 text-xs border border-[var(--color-border)] shadow-sm">
      <span className="font-medium text-[var(--color-ink)]">{d.name}</span>
      <span className="ml-2 text-[var(--color-ink-muted)]">{d.count}人</span>
    </div>
  );
}

function GenderBar({ genderData }: { genderData: { gender: string; count: number }[] }) {
  const total = genderData.reduce((s, g) => s + g.count, 0);
  if (total === 0) return null;

  const segments = genderData.map((g) => ({
    gender: g.gender,
    count: g.count,
    pct: Math.round((g.count / total) * 100),
    color: GENDER_COLORS[g.gender] ?? "#8BA89B",
  }));

  return (
    <div className="space-y-3">
      <div className="relative h-8 w-full overflow-hidden rounded-md flex">
        {segments.map((s) => (
          <div
            key={s.gender}
            className="relative h-full flex items-center justify-center overflow-hidden transition-all duration-700 ease-out first:rounded-l-md last:rounded-r-md"
            style={{
              width: `${Math.max(s.pct, 8)}%`,
              backgroundColor: s.color,
            }}
          >
            {s.pct >= 15 && (
              <div className="flex items-center gap-1">
                <GenderIcon gender={s.gender} size={14} color="#fff" />
                <span className="text-white text-xs font-medium">
                  {s.pct}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((s) => (
          <div key={s.gender} className="flex items-center gap-1.5">
            <GenderIcon gender={s.gender} size={14} color={s.color} />
            <span className="text-xs font-medium" style={{ color: s.color }}>{s.gender}</span>
            <span className="text-xs text-[var(--color-ink-muted)]">{s.pct}%</span>
            <span className="text-[10px] text-[var(--color-ink-muted)]">({s.count}人)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = new Date(label);
  const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
  return (
    <div className="rounded-md bg-white px-3 py-2 text-xs border border-[var(--color-border)] shadow-sm">
      <p className="font-medium text-[var(--color-ink)]">{dateStr}</p>
      {payload.map((p: { dataKey: string; value: number; color: string }) => (
        <p key={p.dataKey} className="flex items-center gap-1.5 mt-0.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-[var(--color-ink-muted)]">
            {p.dataKey === "purchase_count" ? "回した" : "気になる"}: {p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function ProductDemographics({ productId, initialPurchasedCount }: Props) {
  const [data, setData] = useState<DemoData | null>(null);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [trend, setTrend] = useState<ProductTrendDay[]>([]);

  useEffect(() => {
    const supabase = createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.rpc as any)("get_product_demographics", { p_product_id: productId })
      .then(({ data: d }: { data: DemoData | null }) => { if (d) setData(d); });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.rpc as any)("get_related_products", { p_product_id: productId })
      .then(({ data: d }: { data: RelatedProduct[] | null }) => { if (d) setRelated(d); });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.rpc as any)("get_product_trend", { p_product_id: productId })
      .then(({ data: d }: { data: ProductTrendDay[] | null }) => { if (d) setTrend(d); });
  }, [productId]);

  const totalSpins = data?.total_spins ?? initialPurchasedCount;
  const genderData = (data?.gender_breakdown ?? []).filter((g) => g.gender !== "未設定");
  const ageData = (data?.age_breakdown ?? [])
    .filter((a) => a.age_group !== "未設定")
    .sort((a, b) => AGE_ORDER.indexOf(a.age_group) - AGE_ORDER.indexOf(b.age_group));

  const hasGenderData = genderData.length > 0;
  const hasAgeData = ageData.length > 0;
  const hasTrend = trend.length > 1;
  const hasRelated = related.length > 0;

  const ageBarData = ageData.map((a) => ({
    name: a.age_group,
    count: a.count,
    fill: AGE_COLORS[a.age_group] ?? "#8BA89B",
  }));

  const trendData = trend.map((t) => ({
    ...t,
    label: `${new Date(t.day).getMonth() + 1}/${new Date(t.day).getDate()}`,
  }));

  return (
    <div className="mt-6 lg:mt-0 space-y-4">
      <div className="flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
          <path d="M10 9H8" />
        </svg>
        <span className="text-base font-medium text-[var(--color-ink)]">まるわかりレポート</span>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-white p-5 text-center">
        <p className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">みんなが回した数</p>
        <p className="mt-2 text-3xl font-medium text-[var(--color-brand)] tabular-nums">
          <CountUpNumber value={totalSpins} />
          <span className="ml-1 text-base text-[var(--color-ink-muted)]">回</span>
        </p>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-white p-4">
        <p className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">盛り上がりトレンド</p>
        <p className="text-[10px] text-[var(--color-ink-muted)] mb-3">直近30日間の推移</p>
        {hasTrend ? (
          <div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradPurchase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7EBEA5" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#7EBEA5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradInterest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B46075" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#B46075" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF4F0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: "var(--color-ink-muted)" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "var(--color-ink-muted)" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<TrendTooltip />} />
                <Area
                  type="monotone"
                  dataKey="purchase_count"
                  stroke="#7EBEA5"
                  strokeWidth={1.5}
                  fill="url(#gradPurchase)"
                />
                <Area
                  type="monotone"
                  dataKey="interest_count"
                  stroke="#B46075"
                  strokeWidth={1.5}
                  fill="url(#gradInterest)"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-2 flex justify-center gap-4 text-[10px] text-[var(--color-ink-muted)]">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-[#7EBEA5]" />回した
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-[#B46075]" />気になる
              </span>
            </div>
          </div>
        ) : (
          <div className="flex h-[140px] items-center justify-center">
            <p className="text-sm text-[var(--color-ink-muted)]">データ収集中...</p>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-white p-4">
        <p className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">男女比</p>
        {hasGenderData ? (
          <GenderBar genderData={genderData} />
        ) : (
          <div className="flex h-20 items-center justify-center">
            <p className="text-sm text-[var(--color-ink-muted)]">データ収集中...</p>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-white p-4">
        <p className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider mb-3">年代分布</p>
        {hasAgeData ? (
          <div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={ageBarData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "var(--color-ink-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--color-ink-muted)" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  {ageBarData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[160px] items-center justify-center">
            <p className="text-sm text-[var(--color-ink-muted)]">データ収集中...</p>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">沼つながり</p>
        </div>
        <p className="text-[10px] text-[var(--color-ink-muted)] -mt-1 mb-3">これを回した人はこんなガチャも回してる</p>
        {hasRelated ? (
          <div className="space-y-2">
            {related.map((item, i) => (
              <Link
                key={item.product_id}
                href={`/detail/${item.product_id}`}
                className="flex items-center gap-3 rounded-md bg-[var(--color-surface-alt)] p-2.5 transition-all hover:bg-[var(--color-border)] group"
              >
                <div className="relative flex items-center justify-center">
                  <span className="absolute -left-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-medium text-white">
                    {i + 1}
                  </span>
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-white border border-[var(--color-border)]">
                    <ProductImage
                      src={item.image_url}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-contain p-0.5"
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[var(--color-ink)] line-clamp-2 leading-snug group-hover:text-[var(--color-brand)] transition-colors">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[var(--color-ink-muted)]">
                    ¥{item.price.toLocaleString()} · {item.overlap_count}人が両方回してる
                  </p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[var(--color-ink-muted)] group-hover:text-[var(--color-brand)] transition-colors">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex h-20 items-center justify-center">
            <p className="text-sm text-[var(--color-ink-muted)]">データ収集中...</p>
          </div>
        )}
      </div>
    </div>
  );
}
