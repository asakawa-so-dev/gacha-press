"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useInterests } from "@/components/InterestProvider";
import ProductCard from "@/components/ProductCard";
import { getAnonPlayedMap, persistAnonPlayedMap } from "@/lib/interests";
import type { Product } from "@/lib/types";
import { APPROVED_MAKERS } from "@/lib/constants";

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

function getRank(playedCount: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (playedCount >= RANKS[i].min) return RANKS[i];
  }
  return RANKS[0];
}

function getNextRank(playedCount: number) {
  for (const r of RANKS) {
    if (playedCount < r.min) return r;
  }
  return null;
}

/* ═══════════════════════════════════════
   Animated Onboarding (shown once)
   ═══════════════════════════════════════ */

const ONBOARDING_KEY = "mylist_onboarding_done";

function TapAnimation() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 2400),
    ];
    const loop = setInterval(() => {
      setPhase(0);
      setTimeout(() => setPhase(1), 800);
      setTimeout(() => setPhase(2), 1600);
      setTimeout(() => setPhase(3), 2400);
    }, 4000);
    return () => { timers.forEach(clearTimeout); clearInterval(loop); };
  }, []);

  const today = `${new Date().getMonth() + 1}/${new Date().getDate()}`;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Mock card */}
      <div className="w-48 rounded-xl border border-white/25 glass-card overflow-hidden transition-all duration-500" style={{ borderColor: phase >= 3 ? "#34d399" : "rgba(255,255,255,0.25)" }}>
        <div className="h-20 bg-white/10 flex items-center justify-center relative">
          <span className="text-3xl">🎰</span>
          {phase >= 3 && (
            <div className="absolute inset-0 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#34d399] shadow-md">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          )}
        </div>
        <div className="p-2">
          <div className="h-2.5 w-3/4 rounded bg-white/25" />
          <div className="mt-1 h-2 w-1/2 rounded bg-[#f0f0f4]" />
        </div>
        {/* Animated button */}
        <div className="px-2 pb-2">
          <div
            className={`flex items-center justify-center rounded-lg py-2 text-xs font-medium transition-all duration-500 ${
              phase >= 2
                ? "bg-[#34d399]/15 text-[#059669]"
                : "bg-white/15 backdrop-blur-md text-[#6b6b7b]"
            } ${phase === 1 ? "scale-95 bg-white/25" : ""}`}
          >
            {phase >= 2 ? (
              <span className="flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {today} にまわした
              </span>
            ) : (
              "🎯 まわした！"
            )}
          </div>
        </div>
      </div>
      {/* Finger tap indicator */}
      <div className={`transition-all duration-300 ${phase === 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
        <span className="text-lg">👆</span>
      </div>
    </div>
  );
}

function RankUpAnimation() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % RANKS.length);
    }, 1200);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Rank badge - animated */}
      <div className="relative h-20 flex items-center justify-center">
        {RANKS.map((r, i) => (
          <div
            key={r.label}
            className="absolute flex flex-col items-center transition-all duration-500"
            style={{
              opacity: i === activeIdx ? 1 : 0,
              transform: i === activeIdx ? "scale(1) translateY(0)" : i < activeIdx ? "scale(0.8) translateY(-20px)" : "scale(0.8) translateY(20px)",
            }}
          >
            <span className="text-4xl">{r.emoji}</span>
          </div>
        ))}
      </div>

      {/* Rank label */}
      <div className="h-8 flex items-center">
        {RANKS.map((r, i) => (
          <span
            key={r.label}
            className="absolute left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-bold text-white whitespace-nowrap transition-all duration-500"
            style={{
              backgroundColor: r.color,
              opacity: i === activeIdx ? 1 : 0,
              transform: i === activeIdx ? "scale(1)" : "scale(0.7)",
            }}
          >
            {r.emoji} {r.label}
          </span>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-40 h-2 rounded-full bg-white/25 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${((activeIdx + 1) / RANKS.length) * 100}%`,
            backgroundColor: RANKS[activeIdx].color,
          }}
        />
      </div>
    </div>
  );
}

const ONBOARDING_SLIDES = [
  {
    animation: "tap" as const,
    title: "「まわした！」をタップ",
    desc: "お店でガチャを回したらボタンをタップ。\nまわした日付が自動で記録されます📅",
  },
  {
    animation: "rankup" as const,
    title: "ガチャマニアランクが上昇！",
    desc: "回した数に応じてランクがアップ。\n目指せ最高ランク 🌟 ガチャレジェンド",
  },
];

function MylistOnboarding() {
  const [visible, setVisible] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(ONBOARDING_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(ONBOARDING_KEY, "1");
  };

  const next = () => {
    if (slide < ONBOARDING_SLIDES.length - 1) setSlide(slide + 1);
    else dismiss();
  };

  if (!visible) return null;

  const s = ONBOARDING_SLIDES[slide];
  const isLast = slide === ONBOARDING_SLIDES.length - 1;

  return (
    <div className="mb-5 rounded-2xl border border-[#ec4899]/20 glass-card relative overflow-hidden bg-gradient-to-br from-[#fce7f3]/35 via-white/15 to-[#ecfdf5]/35">
      {/* Close button */}
      <button
        type="button"
        onClick={dismiss}
        className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/15 backdrop-blur-md text-[var(--color-ink-muted)] hover:bg-white/25 hover:text-[var(--color-ink)] transition-colors"
        aria-label="スキップ"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Animation area */}
      <div className="pt-6 pb-2 flex justify-center min-h-[180px] items-center">
        <div key={slide} className="carousel-fade-in">
          {s.animation === "tap" ? <TapAnimation /> : <RankUpAnimation />}
        </div>
      </div>

      {/* Text */}
      <div key={`text-${slide}`} className="px-5 text-center carousel-fade-in">
        <h3 className="text-base font-bold text-[var(--color-ink)]">{s.title}</h3>
        <p className="mt-1.5 text-sm text-[var(--color-ink-secondary)] whitespace-pre-line leading-relaxed">{s.desc}</p>
      </div>

      {/* Dots + CTA */}
      <div className="px-5 pb-5 pt-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          {ONBOARDING_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === slide ? "w-6 bg-[#ec4899]" : "w-2 bg-white/25"
              }`}
              aria-label={`スライド ${i + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          className="w-full rounded-xl bg-[#ec4899] py-3 text-sm font-medium text-white transition-colors hover:bg-[#db2777] active:scale-[0.98]"
        >
          {isLast ? "OK、使ってみる！" : "次へ →"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Confetti Component
   ═══════════════════════════════════════ */

function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="confetti-wrap">
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className="confetti-piece" />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   Progress Ring
   ═══════════════════════════════════════ */

function ProgressRing({
  played,
  total,
}: {
  played: number;
  total: number;
}) {
  const size = 72;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? played / total : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progress >= 1 ? "#34d399" : "#ec4899"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="progress-ring-circle"
          style={
            {
              "--circumference": circumference,
              "--dash-offset": dashOffset,
            } as React.CSSProperties
          }
        />
      </svg>
      <span className="absolute text-sm font-bold text-[var(--color-ink)]">
        {played}/{total}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════
   Mylist Card with played toggle + date
   ═══════════════════════════════════════ */

function formatPlayedDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function MylistCard({
  product,
  playedDate,
  onTogglePlayed,
}: {
  product: Product;
  playedDate: string | null;
  onTogglePlayed: (id: number) => void;
}) {
  const [confetti, setConfetti] = useState(false);
  const isPlayed = !!playedDate;

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isPlayed) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 800);
    }
    onTogglePlayed(product.id);
  };

  return (
    <div
      className={`relative rounded-xl border glass-card overflow-hidden transition-all duration-300 ${
        isPlayed
          ? "border-[#34d399]/50 bg-gradient-to-b from-[#ecfdf5]/40 to-transparent"
          : "border-white/25"
      }`}
    >
      <Link href={`/detail/${product.id}`}>
        <div className="relative aspect-square bg-white/10">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-contain p-1 transition-all duration-300 ${
                isPlayed ? "opacity-60" : ""
              }`}
            />
          ) : (
            <div className="absolute inset-0 product-image-placeholder flex items-center justify-center">
              <span className="text-[#7a7a90] text-sm">No Image</span>
            </div>
          )}
          {isPlayed && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#34d399] shadow-lg">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3
            className={`text-sm font-medium line-clamp-2 leading-snug ${
              isPlayed
                ? "text-[var(--color-ink-muted)] line-through decoration-1"
                : "text-[#1c1c28]"
            }`}
          >
            {product.name}
          </h3>
          <p className="mt-1 text-sm font-bold text-[#1c1c28]">
            ¥{product.price.toLocaleString()}
          </p>
        </div>
      </Link>

      {/* Toggle button */}
      <div className="relative px-3 pb-3">
        <button
          type="button"
          onClick={handlePlay}
          className={`relative w-full rounded-lg py-2.5 text-sm font-medium transition-all active:scale-95 ${
            isPlayed
              ? "bg-[#34d399]/15 text-[#059669]"
              : "bg-white/15 backdrop-blur-md text-[var(--color-ink-secondary)] hover:bg-white/25"
          }`}
        >
          <ConfettiBurst active={confetti} />
          {isPlayed ? (
            <span className="flex items-center justify-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {formatPlayedDate(playedDate)} にまわした
            </span>
          ) : (
            "🎯 まわした！"
          )}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Onboarding Carousel (not-logged-in)
   ═══════════════════════════════════════ */

function FrustratedPersonIllustration() {
  return (
    <svg viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-24">
      <rect x="8" y="40" width="28" height="36" rx="4" fill="#f5f5f7" stroke="#e4e4ea" strokeWidth="1.5" />
      <ellipse cx="22" cy="40" rx="13" ry="11" fill="white" stroke="#e4e4ea" strokeWidth="1.5" />
      <circle cx="18" cy="37" r="3" fill="#ec4899" opacity="0.5" />
      <circle cx="26" cy="36" r="2.5" fill="#3daae0" opacity="0.5" />
      <rect x="104" y="40" width="28" height="36" rx="4" fill="#f5f5f7" stroke="#e4e4ea" strokeWidth="1.5" />
      <ellipse cx="118" cy="40" rx="13" ry="11" fill="white" stroke="#e4e4ea" strokeWidth="1.5" />
      <circle cx="114" cy="37" r="3" fill="#f5c800" opacity="0.5" />
      <circle cx="122" cy="36" r="2.5" fill="#a78bfa" opacity="0.5" />
      <circle cx="70" cy="52" r="10" fill="#fce7f3" stroke="#ec4899" strokeWidth="1.5" />
      <circle cx="66" cy="51" r="1.5" fill="#5c5c6f" />
      <circle cx="74" cy="51" r="1.5" fill="#5c5c6f" />
      <path d="M66 56 Q70 54 74 56" stroke="#5c5c6f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M60 62 Q70 70 80 62" fill="#fce7f3" stroke="#ec4899" strokeWidth="1.5" />
      <g className="animate-float"><text x="50" y="38" fontSize="16" fill="#ec4899" fontWeight="bold" opacity="0.8">?</text></g>
      <g className="animate-float-delay-1"><text x="82" y="34" fontSize="14" fill="#ec4899" fontWeight="bold" opacity="0.6">?</text></g>
      <g className="animate-float-delay-2"><text x="62" y="28" fontSize="12" fill="#ec4899" fontWeight="bold" opacity="0.4">?</text></g>
      <g transform="translate(88, 20)">
        <rect x="0" y="0" width="40" height="22" rx="11" fill="white" stroke="#e4e4ea" strokeWidth="1.5" />
        <circle cx="0" cy="24" r="3" fill="white" stroke="#e4e4ea" strokeWidth="1" />
        <circle cx="-4" cy="28" r="1.5" fill="white" stroke="#e4e4ea" strokeWidth="1" />
        <text x="6" y="15" fontSize="10" fill="#7a7a90" fontFamily="sans-serif">どれ…?</text>
      </g>
    </svg>
  );
}

function ChecklistIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-24">
      <rect x="32" y="14" width="56" height="92" rx="10" fill="white" stroke="#e4e4ea" strokeWidth="2" />
      <rect x="36" y="22" width="48" height="76" rx="2" fill="#f5f5f7" />
      <rect x="50" y="16" width="20" height="4" rx="2" fill="#e4e4ea" />
      <g><rect x="42" y="32" width="36" height="16" rx="4" fill="white" /><circle cx="50" cy="40" r="4" fill="#ec4899" /><polyline points="48,40 50,42 53,38" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" /><rect x="58" y="37" width="16" height="3" rx="1.5" fill="#e4e4ea" /></g>
      <g><rect x="42" y="52" width="36" height="16" rx="4" fill="white" /><circle cx="50" cy="60" r="4" fill="#ec4899" /><polyline points="48,60 50,62 53,58" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" /><rect x="58" y="57" width="16" height="3" rx="1.5" fill="#e4e4ea" /></g>
      <g><rect x="42" y="72" width="36" height="16" rx="4" fill="white" /><circle cx="50" cy="80" r="4" fill="#3daae0" opacity="0.3" /><rect x="58" y="77" width="16" height="3" rx="1.5" fill="#e4e4ea" /></g>
    </svg>
  );
}

function SyncIllustration() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-24">
      <path d="M30 68a18 18 0 0 1 2-35.5A24 24 0 0 1 78 36a14 14 0 0 1 8 25.5" fill="white" stroke="#e4e4ea" strokeWidth="2" />
      <g transform="translate(48, 38) scale(0.7)"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="#ec4899" /></g>
      <g stroke="#3daae0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M40 80 a20 20 0 0 1 40 0"><animate attributeName="stroke-dashoffset" values="40;0" dur="2s" repeatCount="indefinite" /></path>
        <polygon points="80,76 82,82 76,82" fill="#3daae0" />
        <path d="M80 92 a20 20 0 0 1 -40 0"><animate attributeName="stroke-dashoffset" values="40;0" dur="2s" repeatCount="indefinite" /></path>
        <polygon points="40,96 38,90 44,90" fill="#3daae0" />
      </g>
      <rect x="22" y="82" width="14" height="20" rx="2" fill="white" stroke="#e4e4ea" strokeWidth="1.5" />
      <rect x="84" y="78" width="18" height="12" rx="2" fill="white" stroke="#e4e4ea" strokeWidth="1.5" />
    </svg>
  );
}

const SLIDES = [
  {
    illustration: <FrustratedPersonIllustration />,
    title: "お店に着いて\n「何回したかったっけ…？」\nってなったこと、ありませんか？",
    desc: "せっかくガチャ専門店に来たのに、気になってたガチャが思い出せない…",
  },
  {
    illustration: <ChecklistIllustration />,
    title: "ハートをタップするだけ。\nもう忘れない。",
    desc: "気になるガチャを見つけたらワンタップ。お店ではリストを開くだけ",
  },
  {
    illustration: <SyncIllustration />,
    title: "無料登録で、リストがずっと残る",
    desc: "機種変しても安心。どの端末からでもアクセス",
  },
];

function OnboardingCarousel() {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setCurrent((c) => (c + 1) % SLIDES.length);
      else setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
    }
    setTouchStart(null);
  };

  const slide = SLIDES[current];
  return (
    <div className="relative overflow-hidden rounded-2xl glass-card border border-white/25 p-6 bg-gradient-to-b from-[#fce7f3]/35 to-transparent" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div key={current} className="flex flex-col items-center text-center carousel-fade-in">
        <div className="mb-4">{slide.illustration}</div>
        <h3 className="text-base font-bold text-[var(--color-ink)] whitespace-pre-line leading-relaxed">{slide.title}</h3>
        <p className="mt-2 text-sm text-[var(--color-ink-secondary)]">{slide.desc}</p>
      </div>
      <div className="mt-5 flex items-center justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button key={i} type="button" onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-[#ec4899]" : "w-2 bg-white/25"}`} aria-label={`スライド ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Filter tabs type
   ═══════════════════════════════════════ */

type FilterTab = "all" | "not_played" | "played";

/* ═══════════════════════════════════════
   Page
   ═══════════════════════════════════════ */

export default function MylistPage() {
  const { isLoggedIn, ready } = useInterests();
  const [products, setProducts] = useState<Product[]>([]);
  const [playedMap, setPlayedMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (!ready) return;

    async function fetchData() {
      try {
        const supabase = createClient();

        if (isLoggedIn) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data: interests } = await supabase
            .from("user_interests")
            .select("product_id")
            .eq("user_id", user.id);

          const productIds = (interests ?? []).map((i: { product_id: number }) => i.product_id);

          if (productIds.length > 0) {
            const { data: productsData = [] } = await supabase
              .from("products")
              .select("*")
              .in("id", productIds)
              .in("maker", APPROVED_MAKERS as unknown as string[]);
            setProducts(productsData as Product[]);

            const { data: purchases } = await supabase
              .from("user_purchases")
              .select("product_id, created_at")
              .eq("user_id", user.id)
              .in("product_id", productIds);
            const pm = new Map<number, string>();
            for (const p of (purchases ?? []) as { product_id: number; created_at: string }[]) {
              pm.set(p.product_id, p.created_at.slice(0, 10));
            }
            setPlayedMap(pm);
          }
        } else {
          let anonIds: number[] = [];
          try { anonIds = JSON.parse(localStorage.getItem("anon_interests") || "[]"); } catch { /* empty */ }

          if (anonIds.length > 0) {
            const { data: productsData = [] } = await supabase
              .from("products")
              .select("*")
              .in("id", anonIds)
              .in("maker", APPROVED_MAKERS as unknown as string[]);
            setProducts(productsData as Product[]);
          }
          const anonMap = getAnonPlayedMap();
          const pm = new Map<number, string>();
          for (const [k, v] of Object.entries(anonMap)) pm.set(Number(k), v);
          setPlayedMap(pm);
        }
      } catch {
        /* Supabase fetch failed — show empty state */
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [ready, isLoggedIn]);

  const togglePlayed = useCallback(
    async (productId: number) => {
      const wasPlayed = playedMap.has(productId);
      const next = new Map(playedMap);
      const today = new Date().toISOString().slice(0, 10);
      if (wasPlayed) next.delete(productId);
      else next.set(productId, today);
      setPlayedMap(next);

      if (!wasPlayed && next.size === products.length && products.length > 0) {
        setTimeout(() => setShowComplete(true), 600);
      }

      if (isLoggedIn) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        if (!wasPlayed) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await supabase.from("user_purchases").insert({ user_id: user.id, product_id: productId } as any).select();
        } else {
          await supabase.from("user_purchases").delete().eq("user_id", user.id).eq("product_id", productId);
        }
      } else {
        const obj: Record<string, string> = {};
        next.forEach((v, k) => { obj[String(k)] = v; });
        persistAnonPlayedMap(obj);
      }
    },
    [playedMap, isLoggedIn, products.length]
  );

  const playedCount = playedMap.size;
  const totalCount = products.length;
  const rank = getRank(playedCount);
  const nextRank = getNextRank(playedCount);

  const filtered = products.filter((p) => {
    if (filter === "played") return playedMap.has(p.id);
    if (filter === "not_played") return !playedMap.has(p.id);
    return true;
  });

  if (!ready || loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-[var(--color-ink)]">気になるリスト</h1>
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3daae0] border-t-transparent" />
        </div>
      </div>
    );
  }

  /* ── Not logged in ── */
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="mb-6 text-2xl font-bold text-[var(--color-ink)]">気になるリスト</h1>
          <OnboardingCarousel />
          <div className="mt-6 rounded-2xl border border-white/25 glass-card p-6 text-center">
            <p className="text-sm font-medium text-[var(--color-ink)]">「あれ回したかったのに…」をゼロにしよう</p>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">気になるガチャをリストに保存。お店でサッと確認できます</p>
            <Link href="/mypage" className="mt-4 inline-flex items-center justify-center rounded-full bg-[#ec4899] px-8 py-3 font-medium text-white shadow-sm transition-colors hover:bg-[#db2777]">無料で気になるリストを使う</Link>
            <p className="mt-3 text-xs text-[var(--color-ink-muted)]">30秒で登録完了。メールアドレスだけでOK</p>
          </div>
          <div className="relative mt-8">
            <div className="pointer-events-none select-none" style={{ filter: "blur(8px)" }} aria-hidden="true">
              {products.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {products.slice(0, 4).map((product) => (<ProductCard key={product.id} product={product} />))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="rounded-xl border border-white/25 glass-card overflow-hidden"><div className="aspect-square bg-white/10" /><div className="p-3 space-y-2"><div className="h-4 rounded bg-white/25 w-3/4" /><div className="h-3 rounded bg-white/15 w-1/2" /></div></div>))}
                </div>
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Logged in: Empty ── */
  if (products.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="mb-6 text-2xl font-bold text-[var(--color-ink)]">気になるリスト</h1>
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-white/25 glass-card p-8 text-center">
            <span className="mb-4 text-5xl">🎯</span>
            <p className="font-medium text-[var(--color-ink)]">まだ気になるガチャがありません</p>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">さがすやランキングでハートをタップして追加しよう</p>
            <Link href="/" className="mt-5 inline-flex items-center justify-center rounded-full bg-[#3daae0] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2888c0]">ガチャをさがす</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Logged in: With items ── */
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold text-[var(--color-ink)]">気になるリスト</h1>

        {/* ── Onboarding guide (shown once) ── */}
        <MylistOnboarding />

        {/* ── Stats / Progress card ── */}
        <div className="mb-5 rounded-2xl border border-white/25 glass-card p-4">
          <div className="flex items-center gap-4">
            <ProgressRing played={playedCount} total={totalCount} />
            <div className="flex-1 min-w-0">
              {/* Rank badge */}
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: rank.color }}
                >
                  <span>{rank.emoji}</span>
                  {rank.label}
                </span>
              </div>
              {/* Progress text */}
              <p className="mt-1.5 text-sm font-medium text-[var(--color-ink)]">
                {playedCount === totalCount ? (
                  <span className="text-[#059669]">全制覇おめでとう！🎉</span>
                ) : (
                  <>
                    <span className="text-[#ec4899] font-bold">{playedCount}</span>
                    <span className="text-[var(--color-ink-muted)]"> / {totalCount} 回した</span>
                  </>
                )}
              </p>
              {/* Next rank hint */}
              {nextRank && (
                <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                  あと{nextRank.min - playedCount}回で {nextRank.emoji} {nextRank.label}
                </p>
              )}
              {/* Progress bar */}
              <div className="mt-2 h-2 rounded-full bg-white/25 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${totalCount > 0 ? (playedCount / totalCount) * 100 : 0}%`,
                    backgroundColor: playedCount === totalCount ? "#34d399" : "#ec4899",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter tabs ── */}
        <div className="mb-4 flex rounded-xl glass-card border border-white/25 p-1">
          {(
            [
              { key: "all" as FilterTab, label: `すべて (${totalCount})` },
              { key: "not_played" as FilterTab, label: `まだ (${totalCount - playedCount})` },
              { key: "played" as FilterTab, label: `回した (${playedCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`flex-1 rounded-lg py-2 text-xs sm:text-sm font-medium transition-all ${
                filter === tab.key
                  ? tab.key === "played"
                    ? "bg-[#34d399]/10 text-[#059669] shadow-sm"
                    : tab.key === "not_played"
                      ? "bg-[#ec4899]/10 text-[#ec4899] shadow-sm"
                      : "bg-[#3daae0]/10 text-[#3daae0] shadow-sm"
                  : "text-[var(--color-ink-muted)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Product grid ── */}
        {filtered.length === 0 ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl glass-card border border-white/25 p-6 text-center">
            <p className="text-sm text-[var(--color-ink-muted)]">
              {filter === "played"
                ? "まだ回したガチャがありません。回したら「まわした！」をタップ！"
                : "全部回した！すごい！🎉"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <MylistCard
                key={product.id}
                product={product}
                playedDate={playedMap.get(product.id) ?? null}
                onTogglePlayed={togglePlayed}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Completion celebration modal ── */}
      {showComplete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowComplete(false)}
        >
          <div
            className="mx-4 max-w-sm rounded-2xl glass-strong border border-white/25 p-8 text-center celebrate-pulse"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl mb-4">🎊</div>
            <h2 className="text-xl font-bold text-[var(--color-ink)]">
              全制覇おめでとう！
            </h2>
            <p className="mt-2 text-sm text-[var(--color-ink-secondary)]">
              リストのガチャを全部回しました！
              <br />
              さあ、次のお気に入りを見つけに行こう
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowComplete(false)}
                className="flex-1 rounded-full bg-white/15 backdrop-blur-md py-2.5 text-sm font-medium text-[var(--color-ink-secondary)]"
              >
                閉じる
              </button>
              <Link
                href="/"
                className="flex-1 rounded-full bg-[#3daae0] py-2.5 text-sm font-medium text-white text-center"
                onClick={() => setShowComplete(false)}
              >
                ガチャをさがす
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
