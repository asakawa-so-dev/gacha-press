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

export default function MypagePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3daae0] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-alt)]">
        <div className="mx-auto max-w-md px-4 py-8">
          <AuthForm />
        </div>
      </div>
    );
  }

  const provider = user.app_metadata?.provider ?? "email";

  return (
    <div className="min-h-screen bg-[var(--color-surface-alt)]">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#3daae0]/15">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3daae0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="7" r="4" />
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--color-ink)]">
                {user.user_metadata?.full_name ?? user.email ?? "マイページ"}
              </h1>
              <p className="text-sm text-[var(--color-ink-muted)]">
                {provider === "google" && "Google"}
                {provider === "apple" && "Apple"}
                {provider === "twitter" && "X"}
                {provider === "line" && "LINE"}
                {provider === "email" && "メール"}
                でログイン中
              </p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            <Link
              href="/mylist"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-alt)] transition"
            >
              <span className="text-xl">❤️</span>
              リスト
            </Link>
            <Link
              href="/ranking"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-alt)] transition"
            >
              <span className="text-xl">📊</span>
              ランキング
            </Link>
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 w-full rounded-xl border border-[var(--color-border)] px-4 py-3 font-medium text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-alt)] transition"
          >
            ログアウト
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-ink-muted)]">
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
