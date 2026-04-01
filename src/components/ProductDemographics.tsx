"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import type { ProductDemographics as DemoData } from "@/lib/types";

const GENDER_COLORS: Record<string, string> = {
  "男": "#7cb9e8",
  "男性": "#7cb9e8",
  "女": "#f4a7b9",
  "女性": "#f4a7b9",
  "その他": "#a8d8b9",
  "未設定": "#e4e4ea",
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
  const c = color ?? GENDER_COLORS[gender] ?? "#9b9bab";
  switch (gender) {
    case "男": case "男性": return <MalePictogram size={size} color={c} />;
    case "女": case "女性": return <FemalePictogram size={size} color={c} />;
    default: return <OtherPictogram size={size} color={c} />;
  }
}

const AGE_COLORS: Record<string, string> = {
  "10代": "#34d399",
  "20代": "#3daae0",
  "30代": "#5bc0eb",
  "40代": "#a78bfa",
  "50代": "#f5c800",
  "60代〜": "#f58520",
  "未設定": "#e4e4ea",
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
    <div className="rounded-lg bg-white/95 px-3 py-2 text-xs shadow-lg border border-[#e4e4ea] backdrop-blur-sm">
      <span className="font-bold text-[var(--color-ink)]">{d.name}</span>
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
    color: GENDER_COLORS[g.gender] ?? "#9b9bab",
  }));

  return (
    <div className="space-y-3">
      {/* Stacked horizontal bar */}
      <div className="relative h-10 w-full overflow-hidden rounded-xl flex">
        {segments.map((s) => (
          <div
            key={s.gender}
            className="relative h-full flex items-center justify-center overflow-hidden transition-all duration-700 ease-out first:rounded-l-xl last:rounded-r-xl"
            style={{
              width: `${Math.max(s.pct, 8)}%`,
              backgroundColor: s.color,
            }}
          >
            {s.pct >= 15 && (
              <div className="flex items-center gap-1">
                <GenderIcon gender={s.gender} size={14} color="#fff" />
                <span className="text-white text-xs font-black drop-shadow-sm">
                  {s.pct}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((s) => (
          <div key={s.gender} className="flex items-center gap-1.5">
            <GenderIcon gender={s.gender} size={14} color={s.color} />
            <span className="text-xs font-bold" style={{ color: s.color }}>{s.gender}</span>
            <span className="text-xs text-[var(--color-ink-muted)]">{s.pct}%</span>
            <span className="text-[10px] text-[var(--color-ink-muted)]">({s.count}人)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductDemographics({ productId, initialPurchasedCount }: Props) {
  const [data, setData] = useState<DemoData | null>(null);

  useEffect(() => {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.rpc as any)("get_product_demographics", { p_product_id: productId }).then(({ data: d }: { data: DemoData | null }) => {
      if (d) setData(d);
    });
  }, [productId]);

  const totalSpins = data?.total_spins ?? initialPurchasedCount;
  const genderData = (data?.gender_breakdown ?? []).filter((g) => g.gender !== "未設定");
  const ageData = (data?.age_breakdown ?? [])
    .filter((a) => a.age_group !== "未設定")
    .sort((a, b) => AGE_ORDER.indexOf(a.age_group) - AGE_ORDER.indexOf(b.age_group));

  const hasGenderData = genderData.length > 0;
  const hasAgeData = ageData.length > 0;

  const ageBarData = ageData.map((a) => ({
    name: a.age_group,
    count: a.count,
    fill: AGE_COLORS[a.age_group] ?? "#9b9bab",
  }));

  return (
    <div className="mt-6 space-y-4">
      {/* Section title */}
      <div className="flex items-center gap-2">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3daae0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
          <path d="M10 9H8" />
        </svg>
        <span className="text-lg font-black text-[var(--color-ink)]">まるわかりレポート</span>
      </div>

      {/* Total spins */}
      <div className="rounded-2xl border border-[#e4e4ea] bg-gradient-to-br from-[#e8f4fc] to-white p-5 text-center">
        <p className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">みんなが回した数</p>
        <p className="mt-2 text-4xl font-black text-[#3daae0] tabular-nums">
          <CountUpNumber value={totalSpins} />
          <span className="ml-1 text-base font-bold text-[var(--color-ink-muted)]">回</span>
        </p>
      </div>

      {/* Gender bar */}
      <div className="rounded-2xl border border-[#e4e4ea] bg-white p-4">
        <p className="text-xs font-bold text-[#9b9bab] uppercase tracking-wider mb-3">男女比</p>
        {hasGenderData ? (
          <GenderBar genderData={genderData} />
        ) : (
          <div className="flex h-20 items-center justify-center">
            <p className="text-sm text-[var(--color-ink-muted)]">データ収集中...</p>
          </div>
        )}
      </div>

      {/* Age distribution */}
      <div className="rounded-2xl border border-[#e4e4ea] bg-white p-4">
        <p className="text-xs font-bold text-[#9b9bab] uppercase tracking-wider mb-3">年代分布</p>
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
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={32}>
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
    </div>
  );
}
