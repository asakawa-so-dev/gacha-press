"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useInterests } from "@/components/InterestProvider";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

/* ─── Carousel Illustrations ─── */

function FrustratedPersonIllustration() {
  return (
    <svg
      viewBox="0 0 140 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-32 h-24"
    >
      {/* Gacha machines in background */}
      <rect x="8" y="40" width="28" height="36" rx="4" fill="#f5f5f7" stroke="#e4e4ea" strokeWidth="1.5" />
      <ellipse cx="22" cy="40" rx="13" ry="11" fill="white" stroke="#e4e4ea" strokeWidth="1.5" />
      <circle cx="18" cy="37" r="3" fill="#ec4899" opacity="0.5" />
      <circle cx="26" cy="36" r="2.5" fill="#3daae0" opacity="0.5" />

      <rect x="104" y="40" width="28" height="36" rx="4" fill="#f5f5f7" stroke="#e4e4ea" strokeWidth="1.5" />
      <ellipse cx="118" cy="40" rx="13" ry="11" fill="white" stroke="#e4e4ea" strokeWidth="1.5" />
      <circle cx="114" cy="37" r="3" fill="#f5c800" opacity="0.5" />
      <circle cx="122" cy="36" r="2.5" fill="#a78bfa" opacity="0.5" />

      {/* Person */}
      <circle cx="70" cy="52" r="10" fill="#fce7f3" stroke="#ec4899" strokeWidth="1.5" />
      {/* Eyes (confused) */}
      <circle cx="66" cy="51" r="1.5" fill="#5c5c6f" />
      <circle cx="74" cy="51" r="1.5" fill="#5c5c6f" />
      {/* Mouth (concerned) */}
      <path d="M66 56 Q70 54 74 56" stroke="#5c5c6f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Body */}
      <path d="M60 62 Q70 70 80 62" fill="#fce7f3" stroke="#ec4899" strokeWidth="1.5" />

      {/* Question marks floating */}
      <g className="animate-float">
        <text x="50" y="38" fontSize="16" fill="#ec4899" fontWeight="bold" opacity="0.8">?</text>
      </g>
      <g className="animate-float-delay-1">
        <text x="82" y="34" fontSize="14" fill="#ec4899" fontWeight="bold" opacity="0.6">?</text>
      </g>
      <g className="animate-float-delay-2">
        <text x="62" y="28" fontSize="12" fill="#ec4899" fontWeight="bold" opacity="0.4">?</text>
      </g>

      {/* Thought bubble */}
      <g transform="translate(88, 20)">
        <rect x="0" y="0" width="40" height="22" rx="11" fill="white" stroke="#e4e4ea" strokeWidth="1.5" />
        <circle cx="0" cy="24" r="3" fill="white" stroke="#e4e4ea" strokeWidth="1" />
        <circle cx="-4" cy="28" r="1.5" fill="white" stroke="#e4e4ea" strokeWidth="1" />
        <text x="6" y="15" fontSize="10" fill="#9b9bab" fontFamily="sans-serif">どれ…?</text>
      </g>
    </svg>
  );
}

function ChecklistIllustration() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-24 h-24"
    >
      {/* Phone */}
      <rect x="32" y="14" width="56" height="92" rx="10" fill="white" stroke="#e4e4ea" strokeWidth="2" />
      <rect x="36" y="22" width="48" height="76" rx="2" fill="#f5f5f7" />
      {/* Notch */}
      <rect x="50" y="16" width="20" height="4" rx="2" fill="#e4e4ea" />
      {/* List items */}
      <g>
        <rect x="42" y="32" width="36" height="16" rx="4" fill="white" />
        <circle cx="50" cy="40" r="4" fill="#ec4899" />
        <polyline points="48,40 50,42 53,38" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="58" y="37" width="16" height="3" rx="1.5" fill="#e4e4ea" />
      </g>
      <g>
        <rect x="42" y="52" width="36" height="16" rx="4" fill="white" />
        <circle cx="50" cy="60" r="4" fill="#ec4899" />
        <polyline points="48,60 50,62 53,58" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="58" y="57" width="16" height="3" rx="1.5" fill="#e4e4ea" />
      </g>
      <g>
        <rect x="42" y="72" width="36" height="16" rx="4" fill="white" />
        <circle cx="50" cy="80" r="4" fill="#3daae0" opacity="0.3" />
        <rect x="58" y="77" width="16" height="3" rx="1.5" fill="#e4e4ea" />
      </g>
    </svg>
  );
}

function SyncIllustration() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-24 h-24"
    >
      {/* Cloud */}
      <path
        d="M30 68a18 18 0 0 1 2-35.5A24 24 0 0 1 78 36a14 14 0 0 1 8 25.5"
        fill="white"
        stroke="#e4e4ea"
        strokeWidth="2"
      />
      {/* Heart in cloud */}
      <g transform="translate(48, 38) scale(0.7)">
        <path
          d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
          fill="#ec4899"
        />
      </g>
      {/* Sync arrows */}
      <g stroke="#3daae0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M40 80 a20 20 0 0 1 40 0">
          <animate attributeName="stroke-dashoffset" values="40;0" dur="2s" repeatCount="indefinite" />
        </path>
        <polygon points="80,76 82,82 76,82" fill="#3daae0" />
        <path d="M80 92 a20 20 0 0 1 -40 0">
          <animate attributeName="stroke-dashoffset" values="40;0" dur="2s" repeatCount="indefinite" />
        </path>
        <polygon points="40,96 38,90 44,90" fill="#3daae0" />
      </g>
      {/* Devices */}
      <rect x="22" y="82" width="14" height="20" rx="2" fill="white" stroke="#e4e4ea" strokeWidth="1.5" />
      <rect x="84" y="78" width="18" height="12" rx="2" fill="white" stroke="#e4e4ea" strokeWidth="1.5" />
    </svg>
  );
}

/* ─── Carousel Component ─── */

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
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

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
    <div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#fce7f3] to-white p-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div key={current} className="flex flex-col items-center text-center carousel-fade-in">
        <div className="mb-4">{slide.illustration}</div>
        <h3 className="text-base font-bold text-[var(--color-ink)] whitespace-pre-line leading-relaxed">
          {slide.title}
        </h3>
        <p className="mt-2 text-sm text-[var(--color-ink-secondary)]">
          {slide.desc}
        </p>
      </div>

      {/* Dots */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 bg-[#ec4899]"
                : "w-2 bg-[#e4e4ea] hover:bg-[#9b9bab]"
            }`}
            aria-label={`スライド ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Page ─── */

export default function MylistPage() {
  const { isLoggedIn, ready } = useInterests();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;

    async function fetchInterests() {
      const supabase = createClient();

      if (isLoggedIn) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: interests } = await supabase
          .from("user_interests")
          .select("product_id")
          .eq("user_id", user.id);

        const productIds = (interests ?? []).map(
          (i: { product_id: number }) => i.product_id
        );
        if (productIds.length > 0) {
          const { data: productsData = [] } = await supabase
            .from("products")
            .select("*")
            .in("id", productIds);
          setProducts(productsData as Product[]);
        }
      } else {
        let anonIds: number[] = [];
        try {
          anonIds = JSON.parse(
            localStorage.getItem("anon_interests") || "[]"
          );
        } catch {
          /* empty */
        }

        if (anonIds.length > 0) {
          const { data: productsData = [] } = await supabase
            .from("products")
            .select("*")
            .in("id", anonIds);
          setProducts(productsData as Product[]);
        }
      }

      setLoading(false);
    }

    fetchInterests();
  }, [ready, isLoggedIn]);

  if (!ready || loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-[var(--color-ink)]">
          気になるリスト
        </h1>
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3daae0] border-t-transparent" />
        </div>
      </div>
    );
  }

  /* ── Not logged in: blur + carousel CTA ── */
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-alt)]">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="mb-6 text-2xl font-bold text-[var(--color-ink)]">
            気になるリスト
          </h1>

          {/* Carousel */}
          <OnboardingCarousel />

          {/* CTA */}
          <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-[var(--color-ink)]">
              「あれ回したかったのに…」をゼロにしよう
            </p>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
              気になるガチャをリストに保存。お店でサッと確認できます
            </p>
            <Link
              href="/mypage"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-[#ec4899] px-8 py-3 font-medium text-white shadow-sm transition-colors hover:bg-[#db2777]"
            >
              無料で気になるリストを使う
            </Link>
            <p className="mt-3 text-xs text-[var(--color-ink-muted)]">
              30秒で登録完了。メールアドレスだけでOK
            </p>
          </div>

          {/* Blurred preview */}
          <div className="relative mt-8">
            <div
              className="pointer-events-none select-none"
              style={{ filter: "blur(8px)" }}
              aria-hidden="true"
            >
              {products.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {products.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-[#e4e4ea] bg-white overflow-hidden"
                    >
                      <div className="aspect-square bg-[#f5f5f7]" />
                      <div className="p-3 space-y-2">
                        <div className="h-4 rounded bg-[#e4e4ea] w-3/4" />
                        <div className="h-3 rounded bg-[#f0f0f4] w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Gradient fade over blurred content */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--color-surface-alt)] to-transparent" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Logged in ── */
  return (
    <div className="min-h-screen bg-[var(--color-surface-alt)]">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-[var(--color-ink)]">
          気になるリスト
        </h1>

        {products.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white p-8 text-center shadow-sm">
            <svg
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-4 w-16 h-16"
            >
              <circle cx="40" cy="40" r="36" fill="#fce7f3" />
              <path
                d="M47 38c.75-.73 1.5-1.6 1.5-2.75A2.75 2.75 0 0 0 45.75 32.5c-.88 0-1.5.25-2.25 1-.75-.75-1.37-1-2.25-1A2.75 2.75 0 0 0 38.5 35.25c0 1.15.75 2.02 1.5 2.75l3.5 3.5Z"
                fill="#ec4899"
                transform="translate(-3, -2) scale(1.2)"
              />
            </svg>
            <p className="font-medium text-[var(--color-ink)]">
              まだ気になるガチャがありません
            </p>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              さがすやランキングでハートをタップして追加しよう
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-[#3daae0] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2888c0]"
            >
              ガチャをさがす
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
