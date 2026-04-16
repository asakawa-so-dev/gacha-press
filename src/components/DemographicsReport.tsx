"use client";

import { useMemo } from "react";
import type { GachaItem } from "@/lib/gacha-data";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateDemographics(item: GachaItem) {
  const rng = seededRandom(item.id * 137 + item.price);

  const genreWeights: Record<string, { male: number; female: number; peakAge: string }> = {
    "キャラクター": { male: 30, female: 65, peakAge: "20代" },
    "ミニチュア": { male: 35, female: 55, peakAge: "30代" },
    "動物": { male: 25, female: 65, peakAge: "20代" },
    "フィギュア": { male: 60, female: 30, peakAge: "30代" },
    "おもしろ": { male: 55, female: 35, peakAge: "20代" },
    "推し活": { male: 20, female: 70, peakAge: "20代" },
  };

  const w = genreWeights[item.genre] ?? { male: 45, female: 45, peakAge: "20代" };
  const jitter = (v: number) => Math.max(5, Math.min(90, v + Math.round((rng() - 0.5) * 20)));
  const male = jitter(w.male);
  const female = jitter(w.female);
  const other = Math.max(0, 100 - male - female);
  const gender = { male, female, other };

  const ageLabels = ["10代", "20代", "30代", "40代", "50代〜"];
  const peakIdx = ageLabels.indexOf(w.peakAge.replace("50代〜", "50代〜")) ?? 1;
  const ageRaw = ageLabels.map((_, i) => {
    const dist = Math.abs(i - peakIdx);
    return Math.max(3, Math.round(40 * Math.exp(-0.5 * dist * dist) + rng() * 15));
  });
  const ageTotal = ageRaw.reduce((a, b) => a + b, 0);
  const age = ageLabels.map((label, i) => ({
    label,
    value: Math.round((ageRaw[i] / ageTotal) * 100),
  }));

  const totalSpins = Math.round(50 + rng() * 500);

  return { gender, age, totalSpins };
}

export function DemographicsReport({ item }: { item: GachaItem }) {
  const data = useMemo(() => generateDemographics(item), [item]);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-muted/30 px-5 py-4">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-primary">
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
          <h2 className="text-base font-bold text-foreground">まるわかりレポート</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">この商品に興味があるユーザーの属性分析</p>
      </div>

      <div className="p-5 space-y-6">
        {/* Total spins */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">累計チェック数</p>
          <p className="text-3xl font-bold text-foreground mt-1">{data.totalSpins.toLocaleString()}<span className="text-sm font-normal text-muted-foreground ml-1">人</span></p>
        </div>

        {/* Gender breakdown */}
        <div>
          <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-3">性別分布</p>
          <div className="flex h-6 overflow-hidden rounded-full bg-muted">
            <div
              className="flex items-center justify-center text-[10px] font-bold text-white transition-all"
              style={{ width: `${data.gender.male}%`, backgroundColor: "oklch(0.55 0.15 250)" }}
            >
              {data.gender.male > 15 && `${data.gender.male}%`}
            </div>
            <div
              className="flex items-center justify-center text-[10px] font-bold text-white transition-all"
              style={{ width: `${data.gender.female}%`, backgroundColor: "oklch(0.65 0.18 350)" }}
            >
              {data.gender.female > 15 && `${data.gender.female}%`}
            </div>
            {data.gender.other > 0 && (
              <div
                className="flex items-center justify-center text-[10px] font-bold text-white transition-all"
                style={{ width: `${data.gender.other}%`, backgroundColor: "oklch(0.70 0.05 150)" }}
              >
                {data.gender.other > 10 && `${data.gender.other}%`}
              </div>
            )}
          </div>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "oklch(0.55 0.15 250)" }} />
              男性 {data.gender.male}%
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "oklch(0.65 0.18 350)" }} />
              女性 {data.gender.female}%
            </span>
            {data.gender.other > 0 && (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "oklch(0.70 0.05 150)" }} />
                その他 {data.gender.other}%
              </span>
            )}
          </div>
        </div>

        {/* Age breakdown */}
        <div>
          <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase mb-3">年代分布</p>
          <div className="space-y-2">
            {data.age.map((a) => (
              <div key={a.label} className="flex items-center gap-3">
                <span className="w-10 text-right text-xs text-muted-foreground">{a.label}</span>
                <div className="flex-1 h-5 rounded bg-muted overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      width: `${a.value}%`,
                      backgroundColor: "oklch(0.55 0.15 250)",
                      opacity: 0.4 + (a.value / 100) * 0.6,
                    }}
                  />
                </div>
                <span className="w-8 text-xs font-medium text-foreground">{a.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
