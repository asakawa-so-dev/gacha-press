"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthForm from "@/components/AuthForm";
import OnboardingModal from "@/components/OnboardingModal";
import ScrollReveal from "@/components/ScrollReveal";
import SnsLinks from "@/components/SnsLinks";
import type { User } from "@supabase/supabase-js";
import type { Product } from "@/lib/types";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

const ANON_KEY = "anon_interests";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function mergeAnonInterests(supabase: any, userId: string) {
  let anonIds: number[] = [];
  try {
    anonIds = JSON.parse(localStorage.getItem(ANON_KEY) || "[]");
  } catch {
    return;
  }
  if (anonIds.length === 0) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = anonIds.map((pid) => ({ user_id: userId, product_id: pid })) as any[];
  await supabase.from("user_interests").upsert(rows, {
    onConflict: "user_id,product_id",
  });
  localStorage.removeItem(ANON_KEY);
}

/* ═══════════════════════════════════════
   Gacha Rank System
   ═══════════════════════════════════════ */

const RANKS = [
  { min: 0, label: "カプセルルーキー", emoji: "🥚", color: "#9b9bab" },
  { min: 1, label: "ガチャビギナー", emoji: "🎰", color: "#3daae0" },
  { min: 5, label: "ガチャファン", emoji: "⭐", color: "#f5c800" },
  { min: 15, label: "ガチャマスター", emoji: "🏆", color: "#f58520" },
  { min: 30, label: "ガチャキング", emoji: "👑", color: "#ec4899" },
  { min: 50, label: "ガチャレジェンド", emoji: "🌟", color: "#a78bfa" },
];

const RANK_CARD_STYLES = [
  { bg: "from-[#9b9bab] via-[#b0b0bc] to-[#a0a0b2]", shadow: "shadow-lg shadow-gray-400/15", border: "border-white/40", avatarText: "text-[#9b9bab]" },
  { bg: "from-[#3daae0] via-[#5bc0eb] to-[#60a5fa]", shadow: "shadow-lg shadow-[#3daae0]/20", border: "border-white/50", avatarText: "text-[#3daae0]" },
  { bg: "from-[#f59e0b] via-[#fbbf24] to-[#eab308]", shadow: "shadow-xl shadow-amber-400/25", border: "border-amber-200/60", avatarText: "text-[#f59e0b]" },
  { bg: "from-[#ef4444] via-[#f97316] to-[#f59e0b]", shadow: "shadow-xl shadow-orange-400/25", border: "border-orange-200/60", avatarText: "text-[#f97316]" },
  { bg: "from-[#a855f7] via-[#ec4899] to-[#f472b6]", shadow: "shadow-2xl shadow-pink-400/30", border: "border-pink-200/60", avatarText: "text-[#ec4899]" },
  { bg: "from-[#7c3aed] via-[#a78bfa] to-[#ec4899]", shadow: "shadow-2xl shadow-purple-500/35", border: "border-purple-200/70", avatarText: "text-[#7c3aed]" },
];

function getRankIndex(playedCount: number): number {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (playedCount >= RANKS[i].min) return i;
  }
  return 0;
}

function getNextRank(playedCount: number) {
  for (const r of RANKS) {
    if (playedCount < r.min) return r;
  }
  return null;
}

/* ═══════════════════════════════════════
   Rank Decorations
   ═══════════════════════════════════════ */

function SparkleOverlay({ count = 6, intense = false }: { count?: number; intense?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute animate-pulse"
          style={{
            fontSize: intense ? "14px" : "10px",
            color: "rgba(255,255,255,0.5)",
            left: `${10 + (i * 80) / count}%`,
            top: `${15 + ((i * 37) % 70)}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${1.5 + i * 0.3}s`,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   Tendency Charts
   ═══════════════════════════════════════ */

const CHART_COLORS = [
  "#3daae0", "#ec4899", "#f5c800", "#a78bfa", "#34d399",
  "#f97316", "#6366f1", "#14b8a6", "#ef4444", "#84cc16",
];

type GenreDatum = { genre: string; score: number; fullMark: number };
type MakerDatum = { maker: string; count: number; color: string };

function GenreRadarChart({ data }: { data: GenreDatum[] }) {
  const padded = [...data];
  while (padded.length < 3) {
    padded.push({ genre: " ", score: 0, fullMark: data[0]?.fullMark || 1 });
  }
  return (
    <ResponsiveContainer width="100%" height={230}>
      <RadarChart data={padded} cx="50%" cy="50%" outerRadius="68%">
        <PolarGrid stroke="rgba(0,0,0,0.08)" />
        <PolarAngleAxis
          dataKey="genre"
          tick={{ fontSize: 11, fill: "#4a4a5c", fontWeight: 700 }}
        />
        <Radar
          name="傾向"
          dataKey="score"
          stroke="#ec4899"
          fill="#ec4899"
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ r: 4, fill: "#ec4899", strokeWidth: 0 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function HorizontalBars({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[var(--color-ink)]">{d.label}</span>
            <span className="text-xs font-bold text-[var(--color-ink-muted)]">{d.value}pt</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${(d.value / max) * 100}%`,
                backgroundColor: d.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   Profile Edit Options
   ═══════════════════════════════════════ */

const GENDER_OPTIONS = [
  { value: "男性", label: "男性", icon: "👨" },
  { value: "女性", label: "女性", icon: "👩" },
  { value: "その他", label: "その他", icon: "🧑" },
] as const;

const AGE_OPTIONS = [
  { value: "10代", label: "10代" },
  { value: "20代", label: "20代" },
  { value: "30代", label: "30代" },
  { value: "40代", label: "40代" },
  { value: "50代", label: "50代" },
  { value: "60代以上", label: "60代以上" },
] as const;

/* ═══════════════════════════════════════
   Page Component
   ═══════════════════════════════════════ */

export default function MypagePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [interestCount, setInterestCount] = useState(0);
  const [playedCount, setPlayedCount] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [profileName, setProfileName] = useState("");
  const [profileGender, setProfileGender] = useState<string | null>(null);
  const [profileAge, setProfileAge] = useState<string | null>(null);

  const [interestProducts, setInterestProducts] = useState<Product[]>([]);
  const [purchaseProducts, setPurchaseProducts] = useState<Product[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editGender, setEditGender] = useState<string | null>(null);
  const [editAge, setEditAge] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const checkOnboarding = useCallback(async (uid: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_done, display_name, gender, age_group")
      .eq("id", uid)
      .single();
    const profile = data as {
      onboarding_done: boolean;
      display_name: string | null;
      gender: string | null;
      age_group: string | null;
    } | null;
    if (profile) {
      if (!profile.onboarding_done) setShowOnboarding(true);
      if (profile.display_name) setProfileName(profile.display_name);
      setProfileGender(profile.gender);
      setProfileAge(profile.age_group);
    }
  }, []);

  const handleAuthChange = useCallback(
    async (newUser: User) => {
      setUser(newUser);
      const supabase = createClient();
      await mergeAnonInterests(supabase, newUser.id);
      await checkOnboarding(newUser.id);
    },
    [checkOnboarding],
  );

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) handleAuthChange(u);
      else setUser(null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) handleAuthChange(session.user);
      else setUser(null);
    });

    return () => subscription.unsubscribe();
  }, [handleAuthChange]);

  useEffect(() => {
    if (!user) {
      setInterestCount(0);
      setPlayedCount(0);
      setInterestProducts([]);
      setPurchaseProducts([]);
      return;
    }
    const supabase = createClient();
    (async () => {
      const [iRes, pRes] = await Promise.all([
        supabase
          .from("user_interests")
          .select("product_id")
          .eq("user_id", user.id),
        supabase
          .from("user_purchases")
          .select("product_id")
          .eq("user_id", user.id),
      ]);

      const interestIds = (iRes.data ?? []).map(
        (i: { product_id: number }) => i.product_id,
      );
      const purchaseIds = (pRes.data ?? []).map(
        (p: { product_id: number }) => p.product_id,
      );

      setInterestCount(interestIds.length);
      setPlayedCount(purchaseIds.length);

      const allIds = [...new Set([...interestIds, ...purchaseIds])];
      if (allIds.length > 0) {
        const { data: products } = await supabase
          .from("products")
          .select("*")
          .in("id", allIds);

        const productMap = new Map<number, Product>();
        for (const p of (products ?? []) as Product[]) {
          productMap.set(p.id, p);
        }

        setInterestProducts(
          interestIds
            .map((id: number) => productMap.get(id))
            .filter(Boolean) as Product[],
        );
        setPurchaseProducts(
          purchaseIds
            .map((id: number) => productMap.get(id))
            .filter(Boolean) as Product[],
        );
      }
    })();
  }, [user]);

  const { genreData, makerData, topGenre } = useMemo(() => {
    const genreScores: Record<string, number> = {};
    const makerScores: Record<string, number> = {};

    for (const p of interestProducts) {
      genreScores[p.genre] = (genreScores[p.genre] || 0) + 1;
      makerScores[p.maker] = (makerScores[p.maker] || 0) + 1;
    }
    for (const p of purchaseProducts) {
      genreScores[p.genre] = (genreScores[p.genre] || 0) + 2;
      makerScores[p.maker] = (makerScores[p.maker] || 0) + 2;
    }

    const maxScore = Math.max(...Object.values(genreScores), 1);
    const genreEntries = Object.entries(genreScores).sort(
      (a, b) => b[1] - a[1],
    );

    const genreData: GenreDatum[] = genreEntries.slice(0, 8).map(([genre, score]) => ({
      genre,
      score,
      fullMark: maxScore,
    }));

    const makerEntries = Object.entries(makerScores).sort(
      (a, b) => b[1] - a[1],
    );
    const makerData: MakerDatum[] = makerEntries.slice(0, 6).map(([maker, count], i) => ({
      maker,
      count,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

    const topGenre = genreEntries.length > 0 ? genreEntries[0][0] : null;

    return { genreData, makerData, topGenre };
  }, [interestProducts, purchaseProducts]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  const openEdit = () => {
    setEditName(
      profileName ||
        user?.user_metadata?.full_name ||
        user?.email?.split("@")[0] ||
        "",
    );
    setEditGender(profileGender);
    setEditAge(profileAge);
    setEditOpen(true);
  };

  const handleProfileSave = async () => {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("profiles") as any)
      .update({
        display_name: editName,
        gender: editGender,
        age_group: editAge,
      })
      .eq("id", user.id);

    await supabase.auth.updateUser({ data: { full_name: editName } });

    setProfileName(editName);
    setProfileGender(editGender);
    setProfileAge(editAge);
    setSaving(false);
    setEditOpen(false);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#3daae0] border-t-transparent" />
          <p className="text-sm font-bold text-[#7a7a90]">読み込み中...</p>
        </div>
      </div>
    );
  }

  /* ── Not logged in ── */
  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-md px-4 py-8">
          <ScrollReveal>
            <div className="flex items-center justify-between">
              <h1 className="section-header">/MYPAGE</h1>
              <SnsLinks />
            </div>
            <p className="section-header-sub">マイページ</p>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <div className="mt-6">
              <AuthForm />
            </div>
          </ScrollReveal>
        </div>
      </div>
    );
  }

  /* ── Logged in: derived data ── */
  const displayName =
    profileName ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "ユーザー";
  const initial = (displayName[0] ?? "?").toUpperCase();
  const email = user.email ?? "";

  const rankIdx = getRankIndex(playedCount);
  const rank = RANKS[rankIdx];
  const nextRank = getNextRank(playedCount);
  const cardStyle = RANK_CARD_STYLES[rankIdx];

  const hasTendencyData = genreData.length > 0 || makerData.length > 0;

  const nextRankProgress = (() => {
    if (!nextRank) return 100;
    if (rankIdx === 0 && playedCount === 0) return 0;
    const prevMin = RANKS[rankIdx].min;
    return ((playedCount - prevMin) / (nextRank.min - prevMin)) * 100;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f4fc]/50 via-transparent to-[#fce7f3]/25 pb-8">
      {showOnboarding && (
        <OnboardingModal
          userId={user.id}
          onComplete={() => setShowOnboarding(false)}
        />
      )}
      <div className="mx-auto max-w-lg px-4 pt-4 pb-6">
        {/* ═══════════════════════════════════════
           Profile Hero Card — rank-decorated
           ═══════════════════════════════════════ */}
        <ScrollReveal variant="scale">
          <div
            className={`relative overflow-hidden rounded-3xl ${cardStyle.border} border bg-gradient-to-br ${cardStyle.bg} p-6 text-white ${cardStyle.shadow} ${rankIdx >= 5 ? "rank-legendary" : ""}`}
          >
            {/* Background orbs */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-6 left-1/4 h-24 w-24 rounded-full bg-white/10" />

            {/* Shine sweep for Fan+ */}
            {rankIdx >= 2 && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                <div className="rank-shine-sweep absolute inset-0" />
              </div>
            )}

            {/* Sparkles for King+ */}
            {rankIdx >= 4 && (
              <SparkleOverlay
                count={rankIdx >= 5 ? 8 : 5}
                intense={rankIdx >= 5}
              />
            )}

            {/* Extra glow orbs for Legend */}
            {rankIdx >= 5 && (
              <>
                <div
                  className="pointer-events-none absolute -left-4 top-1/3 h-20 w-20 rounded-full bg-white/10 animate-pulse"
                  style={{ animationDuration: "3s" }}
                />
                <div
                  className="pointer-events-none absolute right-1/4 -bottom-4 h-16 w-16 rounded-full bg-white/10 animate-pulse"
                  style={{ animationDuration: "2.5s", animationDelay: "1s" }}
                />
              </>
            )}

            {/* Avatar + Info */}
            <div className="relative flex items-start gap-4">
              <div className="relative">
                {rankIdx >= 3 && (
                  <div
                    className="absolute -inset-1 rounded-2xl opacity-50 blur-sm"
                    style={{ backgroundColor: rank.color }}
                  />
                )}
                <div
                  className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/95 text-2xl font-black shadow-md ${cardStyle.avatarText}`}
                >
                  {initial}
                </div>
                <span className="absolute -bottom-1.5 -right-1.5 text-lg drop-shadow-md">
                  {rank.emoji}
                </span>
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-sm">
                  {rank.emoji} {rank.label}
                </span>
                <h1 className="mt-1 truncate text-xl font-black leading-tight">
                  {displayName}
                </h1>
                <p className="mt-0.5 truncate text-sm text-white/80">
                  {email}
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {profileGender && (
                    <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm">
                      {profileGender}
                    </span>
                  )}
                  {profileAge && (
                    <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm">
                      {profileAge}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={openEdit}
                    className="inline-flex items-center gap-0.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm transition-colors hover:bg-white/30"
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                    編集
                  </button>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="relative mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-[11px] font-bold uppercase tracking-wide text-white/75">
                  気になる
                </p>
                <p className="mt-1 text-2xl font-black tabular-nums">
                  {interestCount}
                  <span className="ml-0.5 text-sm font-bold text-white/80">
                    件
                  </span>
                </p>
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-[11px] font-bold uppercase tracking-wide text-white/75">
                  まわした
                </p>
                <p className="mt-1 text-2xl font-black tabular-nums">
                  {playedCount}
                  <span className="ml-0.5 text-sm font-bold text-white/80">
                    回
                  </span>
                </p>
              </div>
            </div>

            {/* Next rank progress */}
            {nextRank && (
              <div className="relative mt-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold text-white/60">
                    次: {nextRank.emoji} {nextRank.label}
                  </p>
                  <p className="text-[10px] font-bold text-white/60">
                    あと{nextRank.min - playedCount}回
                  </p>
                </div>
                <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white/60 transition-all duration-500"
                    style={{ width: `${nextRankProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════════
           Tendency Section
           ═══════════════════════════════════════ */}
        <ScrollReveal delay={200}>
          <div className="mt-6">
            <div className="flex items-center gap-2 px-1 mb-3">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ec4899"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
              <p className="text-sm font-black text-[var(--color-ink)]">
                あなたの傾向
              </p>
            </div>

            {hasTendencyData ? (
              <div className="space-y-4">
                {/* Top genre insight card */}
                {topGenre && (
                  <div className="rounded-2xl border border-[#ec4899]/20 glass-card p-4 bg-gradient-to-br from-[#fce7f3]/30 to-transparent text-center">
                    <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
                      いちばん好きなジャンル
                    </p>
                    <p className="mt-1 text-xl font-black text-[#ec4899]">
                      {topGenre}
                    </p>
                  </div>
                )}

                {/* Genre radar chart (3+ genres) */}
                {genreData.length >= 3 && (
                  <div className="rounded-2xl border border-white/25 glass-card p-4">
                    <p className="text-xs font-bold text-[#7a7a90] uppercase tracking-wider mb-1">
                      ジャンル傾向
                    </p>
                    <p className="text-[10px] text-[var(--color-ink-muted)] mb-2">
                      気になる・まわしたガチャのジャンル分布
                    </p>
                    <GenreRadarChart data={genreData} />
                  </div>
                )}

                {/* Genre bars (1-2 genres) */}
                {genreData.length > 0 && genreData.length < 3 && (
                  <div className="rounded-2xl border border-white/25 glass-card p-4">
                    <p className="text-xs font-bold text-[#7a7a90] uppercase tracking-wider mb-3">
                      ジャンル傾向
                    </p>
                    <HorizontalBars
                      data={genreData.map((d, i) => ({
                        label: d.genre,
                        value: d.score,
                        color: CHART_COLORS[i % CHART_COLORS.length],
                      }))}
                    />
                  </div>
                )}

                {/* Maker distribution */}
                {makerData.length > 0 && (
                  <div className="rounded-2xl border border-white/25 glass-card p-4">
                    <p className="text-xs font-bold text-[#7a7a90] uppercase tracking-wider mb-3">
                      メーカー傾向
                    </p>
                    <HorizontalBars
                      data={makerData.map((d) => ({
                        label: d.maker,
                        value: d.count,
                        color: d.color,
                      }))}
                    />
                  </div>
                )}

                {/* Activity summary */}
                <div className="rounded-2xl border border-white/25 glass-card p-4">
                  <p className="text-xs font-bold text-[#7a7a90] uppercase tracking-wider mb-3">
                    アクティビティ
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xl font-black text-[#3daae0]">
                        {interestCount}
                      </p>
                      <p className="text-[10px] font-bold text-[var(--color-ink-muted)]">
                        気になる
                      </p>
                    </div>
                    <div>
                      <p className="text-xl font-black text-[#34d399]">
                        {playedCount}
                      </p>
                      <p className="text-[10px] font-bold text-[var(--color-ink-muted)]">
                        まわした
                      </p>
                    </div>
                    <div>
                      <p className="text-xl font-black text-[#a78bfa]">
                        {genreData.length}
                      </p>
                      <p className="text-[10px] font-bold text-[var(--color-ink-muted)]">
                        ジャンル
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/25 glass-card p-6 text-center">
                <span className="text-3xl">📊</span>
                <p className="mt-2 text-sm font-bold text-[var(--color-ink)]">
                  まだデータがありません
                </p>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                  ガチャを「気になる」「まわした」すると
                  <br />
                  あなたの傾向が見えてきます
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-[#3daae0] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2888c0]"
                >
                  ガチャをさがす
                </Link>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════════
           Profile Settings Section
           ═══════════════════════════════════════ */}
        <ScrollReveal delay={350}>
          <div className="mt-6">
            <div className="flex items-center gap-2 px-1 mb-3">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3daae0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <p className="text-sm font-black text-[var(--color-ink)]">
                プロフィール設定
              </p>
            </div>

            <div className="rounded-2xl border border-white/25 glass-card divide-y divide-white/15">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
                    表示名
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-[var(--color-ink)]">
                    {displayName}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
                    性別
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-[var(--color-ink)]">
                    {profileGender || "未設定"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
                    年代
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-[var(--color-ink)]">
                    {profileAge || "未設定"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
                    メールアドレス
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-[var(--color-ink)]">
                    {email}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <button
                  type="button"
                  onClick={openEdit}
                  className="w-full rounded-xl bg-[#3daae0]/10 py-3 text-sm font-bold text-[#3daae0] transition-all hover:bg-[#3daae0]/15 active:scale-[0.98]"
                >
                  プロフィールを編集
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════════
           Logout + Footer
           ═══════════════════════════════════════ */}
        <ScrollReveal delay={500}>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/25 bg-white/15 py-3.5 text-sm font-bold text-[#4a4a5c] backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/25"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            ログアウト
          </button>

          <p className="mt-8 text-center text-xs font-bold text-[#7a7a90]">
            <Link href="/terms" className="text-[#3daae0] link-underline">
              利用規約
            </Link>
            {" · "}
            <Link href="/privacy" className="text-[#3daae0] link-underline">
              プライバシーポリシー
            </Link>
          </p>
        </ScrollReveal>
      </div>

      {/* ═══════════════════════════════════════
         Profile Edit Modal
         ═══════════════════════════════════════ */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setEditOpen(false)}
          />
          <div className="animate-slide-up-modal relative mx-4 mb-0 w-full max-w-md overflow-hidden rounded-t-3xl border border-white/25 glass-strong shadow-2xl sm:rounded-3xl">
            <div className="px-6 pt-5 pb-8">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#3daae0]/10">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3daae0"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-[#1c1c28]">
                  プロフィールを編集
                </h2>
                <p className="mt-1 text-sm text-[#7a7a90]">
                  表示名や属性を変更できます
                </p>
              </div>

              {/* Display Name */}
              <div className="mb-5">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#7a7a90]">
                  表示名
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border-2 border-white/25 bg-white/10 px-4 py-3 text-sm font-bold text-[#1c1c28] outline-none backdrop-blur-md transition-colors focus:border-[#3daae0] focus:bg-white/20"
                  placeholder="表示名を入力"
                />
              </div>

              {/* Gender */}
              <div className="mb-5">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#7a7a90]">
                  性別
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {GENDER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEditGender(opt.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all duration-300 active:scale-[0.97] ${
                        editGender === opt.value
                          ? "border-[#3daae0] bg-[#3daae0]/5 shadow-sm"
                          : "border-white/25 hover:border-white/40"
                      }`}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <span
                        className={`text-xs font-bold ${editGender === opt.value ? "text-[#3daae0]" : "text-[#1c1c28]"}`}
                      >
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div className="mb-6">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#7a7a90]">
                  年代
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {AGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEditAge(opt.value)}
                      className={`rounded-xl border-2 px-3 py-2.5 text-center transition-all duration-300 active:scale-[0.97] ${
                        editAge === opt.value
                          ? "border-[#ec4899] bg-[#ec4899]/5 shadow-sm"
                          : "border-white/25 hover:border-white/40"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold ${editAge === opt.value ? "text-[#ec4899]" : "text-[#1c1c28]"}`}
                      >
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="rounded-xl border-2 border-white/25 px-5 py-3 font-bold text-[#4a4a5c] backdrop-blur-md transition-all hover:bg-white/15"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  disabled={!editName.trim() || saving}
                  onClick={handleProfileSave}
                  className="flex-1 rounded-xl bg-[#3daae0] px-4 py-3 font-bold text-white transition-all hover:bg-[#2888c0] disabled:opacity-40 active:scale-[0.98]"
                >
                  {saving ? "保存中..." : "保存する"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
