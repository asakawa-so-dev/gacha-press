"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthForm from "@/components/AuthForm";
import type { User } from "@supabase/supabase-js";

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

function HeartNavIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ec4899]">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function SearchNavIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3daae0]">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function TrophyNavIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#f5c800]">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)]">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function MypagePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [interestCount, setInterestCount] = useState<number | null>(null);
  const [playedCount, setPlayedCount] = useState<number | null>(null);

  const handleAuthChange = useCallback(async (newUser: User) => {
    setUser(newUser);
    const supabase = createClient();
    await mergeAnonInterests(supabase, newUser.id);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) handleAuthChange(u);
      else setUser(null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          handleAuthChange(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [handleAuthChange]);

  useEffect(() => {
    if (!user) {
      setInterestCount(null);
      setPlayedCount(null);
      return;
    }
    const supabase = createClient();
    (async () => {
      const [i, p] = await Promise.all([
        supabase.from("user_interests").select("product_id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("user_purchases").select("product_id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      setInterestCount(i.count ?? 0);
      setPlayedCount(p.count ?? 0);
    })();
  }, [user]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#e8f4fc] to-[var(--color-surface-alt)] flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#3daae0] border-t-transparent" />
          <p className="text-sm font-bold text-[var(--color-ink-muted)]">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fce7f3]/40 via-[var(--color-surface-alt)] to-[#e8f4fc]/30">
        <div className="mx-auto max-w-md px-4 py-8">
          <AuthForm />
        </div>
      </div>
    );
  }

  const displayName =
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "ユーザー";
  const initial = (displayName[0] ?? "?").toUpperCase();
  const email = user.email ?? "";

  const navItems = [
    {
      href: "/mylist",
      title: "気になるリスト",
      desc: "まわした記録・ランクをチェック",
      icon: <HeartNavIcon />,
      bg: "from-[#fce7f3] to-white",
      border: "border-[#ec4899]/15",
    },
    {
      href: "/",
      title: "さがす",
      desc: "新しいガチャを見つける",
      icon: <SearchNavIcon />,
      bg: "from-[#e8f4fc] to-white",
      border: "border-[#3daae0]/15",
    },
    {
      href: "/ranking",
      title: "ランキング",
      desc: "人気のガチャをチェック",
      icon: <TrophyNavIcon />,
      bg: "from-[#fffbe6] to-white",
      border: "border-[#f5c800]/25",
    },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f4fc]/80 via-[var(--color-surface-alt)] to-[#fce7f3]/20 pb-8">
      <div className="mx-auto max-w-lg px-4 pt-4 pb-6">
        {/* Profile hero */}
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-[#3daae0] via-[#5bc0eb] to-[#a78bfa] p-6 text-white shadow-lg shadow-[#3daae0]/20">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-6 left-1/4 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/95 text-2xl font-black text-[#3daae0] shadow-md">
              {initial}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-xs font-bold uppercase tracking-wider text-white/80">マイページ</p>
              <h1 className="mt-0.5 truncate text-xl font-black leading-tight">{displayName}</h1>
              <p className="mt-1 truncate text-sm text-white/90">{email}</p>
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-sm">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
                ログイン中
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="relative mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-wide text-white/75">気になる</p>
              <p className="mt-1 text-2xl font-black tabular-nums">
                {interestCount === null ? "—" : interestCount}
                <span className="ml-0.5 text-sm font-bold text-white/80">件</span>
              </p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-wide text-white/75">まわした</p>
              <p className="mt-1 text-2xl font-black tabular-nums">
                {playedCount === null ? "—" : playedCount}
                <span className="ml-0.5 text-sm font-bold text-white/80">回</span>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-5 px-1 text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
          メニュー
        </p>
        <nav className="mt-2 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-2xl border bg-gradient-to-br ${item.bg} ${item.border} p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-[var(--color-ink)]">{item.title}</p>
                <p className="mt-0.5 text-xs font-bold text-[var(--color-ink-muted)]">{item.desc}</p>
              </div>
              <ChevronRight />
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-white/60 py-3.5 text-sm font-bold text-[var(--color-ink-secondary)] transition hover:border-[#9b9bab] hover:bg-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
          ログアウト
        </button>

        <p className="mt-8 text-center text-xs font-bold text-[var(--color-ink-muted)]">
          <Link href="/terms" className="text-[#3daae0] hover:underline">
            利用規約
          </Link>
          {" · "}
          <Link href="/privacy" className="text-[#3daae0] hover:underline">
            プライバシーポリシー
          </Link>
        </p>
      </div>
    </div>
  );
}
