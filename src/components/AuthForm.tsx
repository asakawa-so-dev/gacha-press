"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type AuthTab = "login" | "signup";

export default function AuthForm() {
  const [tab, setTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) {
        if (err.message === "Invalid login credentials") {
          throw new Error("メールアドレスまたはパスワードが正しくありません");
        }
        throw err;
      }
      window.location.href = "/mypage";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }

    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (err) throw err;
      setSignupDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const tabClass = (t: AuthTab) =>
    `flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
      tab === t
        ? "bg-white text-[var(--color-ink)] shadow-sm"
        : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink-secondary)]"
    }`;

  if (signupDone) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <div className="rounded-lg bg-white border border-[var(--color-border)] p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#059669]/10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13" />
                <path d="m22 2-7 20-4-9-9-4 20-7z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-[var(--color-ink)]">確認メールを送信しました</p>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                <span className="font-medium text-[var(--color-brand)]">{email}</span> に届いたメールのリンクをタップして登録を完了してください
              </p>
            </div>
            <div className="pt-2 space-y-2">
              <p className="text-xs text-[var(--color-ink-muted)]">
                届かない場合はスパムフォルダを確認してください
              </p>
              <button
                type="button"
                onClick={() => { setSignupDone(false); setError(null); }}
                className="text-sm font-medium text-[var(--color-brand)] link-underline"
              >
                メールアドレスを変更する
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="rounded-lg bg-white border border-[var(--color-border)] p-6">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-alt)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-brand)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-[var(--color-ink)]">
            {tab === "login" ? "おかえりなさい" : "はじめまして"}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            {tab === "login"
              ? "メールアドレスとパスワードでログイン"
              : "メールアドレスで簡単に登録できます"}
          </p>
        </div>

        <div className="mb-5 flex gap-1 rounded-lg bg-[var(--color-surface-alt)] p-1">
          <button type="button" className={tabClass("login")} onClick={() => { setTab("login"); setError(null); }}>
            ログイン
          </button>
          <button type="button" className={tabClass("signup")} onClick={() => { setTab("signup"); setError(null); }}>
            新規登録
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={tab === "login" ? handleLogin : handleSignup} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--color-ink)]">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="example@email.com"
              className="mt-1 block w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-brand)] focus:outline-none transition bg-white"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--color-ink)]">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={tab === "login" ? "current-password" : "new-password"}
              placeholder={tab === "login" ? "パスワードを入力" : "6文字以上で入力"}
              minLength={6}
              className="mt-1 block w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-brand)] focus:outline-none transition bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--color-brand)] px-4 py-3.5 font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading
              ? "処理中..."
              : tab === "login"
              ? "ログイン"
              : "アカウントを作成"}
          </button>
          <p className="text-center text-xs text-[var(--color-ink-muted)]">
            {tab === "login"
              ? "アカウントがない場合は「新規登録」タブから作成してください"
              : "登録すると確認メールが届きます"}
          </p>
        </form>
      </div>

      <p className="text-center text-xs text-[var(--color-ink-muted)]">
        <Link href="/terms" className="text-[var(--color-brand)] link-underline">
          利用規約
        </Link>
        {" · "}
        <Link href="/privacy" className="text-[var(--color-brand)] link-underline">
          プライバシーポリシー
        </Link>
      </p>
    </div>
  );
}
