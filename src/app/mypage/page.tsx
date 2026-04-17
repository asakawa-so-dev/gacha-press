"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthForm from "@/components/AuthForm";
import OnboardingModal from "@/components/OnboardingModal";
import ScrollReveal from "@/components/ScrollReveal";
import SnsLinks from "@/components/SnsLinks";
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-accent)]">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function SearchNavIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-brand)]">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function TrophyNavIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#92C8AE]">
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)]">
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
  const [showOnboarding, setShowOnboarding] = useState(false);

  const checkOnboarding = useCallback(async (uid: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_done")
      .eq("id", uid)
      .single();
    const profile = data as { onboarding_done: boolean } | null;
    if (profile && !profile.onboarding_done) {
      setShowOnboarding(true);
    }
  }, []);

  const handleAuthChange = useCallback(async (newUser: User) => {
    setUser(newUser);
    const supabase = createClient();
    await mergeAnonInterests(supabase, newUser.id);
    await checkOnboarding(newUser.id);
  }, [checkOnboarding]);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
          <p className="text-sm text-[var(--color-ink-muted)]">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-md px-4 py-8">
          <ScrollReveal>
            <div className="flex items-center justify-between">
              <h1 className="section-header">MYPAGE</h1>
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
    },
    {
      href: "/",
      title: "さがす",
      desc: "新しいガチャを見つける",
      icon: <SearchNavIcon />,
    },
    {
      href: "/ranking",
      title: "ランキング",
      desc: "人気のガチャをチェック",
      icon: <TrophyNavIcon />,
    },
  ] as const;

  return (
    <div className="min-h-screen pb-8">
      {showOnboarding && (
        <OnboardingModal
          userId={user.id}
          onComplete={() => setShowOnboarding(false)}
        />
      )}
      <div className="mx-auto max-w-lg px-4 pt-4 pb-6">
        {/* Profile card */}
        <ScrollReveal variant="scale">
          <div className="rounded-lg border border-[var(--color-border)] bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-alt)] text-xl font-medium text-[var(--color-brand)]">
                {initial}
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">マイページ</p>
                <h1 className="mt-0.5 truncate text-lg font-medium leading-tight text-[var(--color-ink)]">{displayName}</h1>
                <p className="mt-1 truncate text-sm text-[var(--color-ink-muted)]">{email}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-[var(--color-surface-alt)] px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">気になる</p>
                <p className="mt-1 text-2xl font-medium tabular-nums text-[var(--color-ink)]">
                  {interestCount === null ? "—" : interestCount}
                  <span className="ml-0.5 text-sm text-[var(--color-ink-muted)]">件</span>
                </p>
              </div>
              <div className="rounded-lg bg-[var(--color-surface-alt)] px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">まわした</p>
                <p className="mt-1 text-2xl font-medium tabular-nums text-[var(--color-ink)]">
                  {playedCount === null ? "—" : playedCount}
                  <span className="ml-0.5 text-sm text-[var(--color-ink-muted)]">回</span>
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <p className="mt-5 px-1 text-xs font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">
            メニュー
          </p>
          <nav className="mt-2 space-y-2">
            {navItems.map((item, i) => (
              <div
                key={item.href}
                className="animate-[fade-up-in_0.4s_ease_forwards] opacity-0"
                style={{ animationDelay: `${300 + i * 80}ms` }}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-4 rounded-lg border border-[var(--color-border)] bg-white p-4 card-hover"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-alt)]">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--color-ink)]">{item.title}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">{item.desc}</p>
                  </div>
                  <ChevronRight />
                </Link>
              </div>
            ))}
          </nav>
        </ScrollReveal>

        <ScrollReveal delay={500}>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-white py-3.5 text-sm font-medium text-[var(--color-ink-secondary)] transition-all hover:bg-[var(--color-surface-alt)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            ログアウト
          </button>

          <p className="mt-8 text-center text-xs text-[var(--color-ink-muted)]">
            <Link href="/terms" className="text-[var(--color-brand)] link-underline">
              利用規約
            </Link>
            {" · "}
            <Link href="/privacy" className="text-[var(--color-brand)] link-underline">
              プライバシーポリシー
            </Link>
          </p>
        </ScrollReveal>
      </div>
    </div>
  );
}
