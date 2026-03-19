"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleOAuth = async (provider: "google" | "apple" | "x" | "line") => {
    setError(null);
    setSuccess(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: provider as "google",
      options: {
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
      },
    });
    if (err) setError(err.message);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (err) throw err;

        if (data.session) {
          window.location.href = "/mypage";
          return;
        }

        if (data.user && !data.session) {
          if (data.user.identities && data.user.identities.length === 0) {
            setError("このメールアドレスは既に登録されています。ログインしてください。");
            setIsSignUp(false);
          } else {
            setPassword("");
            setSuccess(
              "確認メールを送信しました。届かない場合はスパムフォルダを確認するか、数分後にもう一度お試しください。"
            );
          }
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) {
          if (err.message === "Invalid login credentials") {
            throw new Error("メールアドレスまたはパスワードが正しくありません");
          }
          if (err.message === "Email not confirmed") {
            throw new Error(
              "メールアドレスが確認されていません。確認メールのリンクをクリックしてください。"
            );
          }
          throw err;
        }
        window.location.href = "/mypage";
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError("メールアドレスを入力してください");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (err) {
      setError("再送に失敗しました。しばらく経ってからお試しください。");
    } else {
      setSuccess("確認メールを再送しました。");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-[var(--color-border)]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#3daae0]/15">
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
          <h2 className="text-xl font-bold text-[var(--color-ink)]">マイページ</h2>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            ログインして気になるリストやランキングを活用しよう
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 border border-emerald-200">
            <p>{success}</p>
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={loading}
              className="mt-2 text-xs font-medium text-emerald-600 underline hover:text-emerald-800"
            >
              確認メールを再送する
            </button>
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[var(--color-ink)]"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 block w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-[var(--color-ink)] focus:border-[#3daae0] focus:ring-2 focus:ring-[#3daae0]/20 outline-none transition"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--color-ink)]"
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              className="mt-1 block w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-[var(--color-ink)] focus:border-[#3daae0] focus:ring-2 focus:ring-[#3daae0]/20 outline-none transition"
            />
            {isSignUp && (
              <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                6文字以上
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#3daae0] px-4 py-3 font-medium text-white hover:bg-[#2888c0] disabled:opacity-50 transition"
          >
            {loading ? "処理中..." : isSignUp ? "アカウント作成" : "ログイン"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccess(null);
            }}
            className="w-full text-sm text-[var(--color-ink-muted)] hover:text-[#3daae0] transition"
          >
            {isSignUp
              ? "すでにアカウントをお持ちの方はログイン"
              : "アカウントを作成"}
          </button>
        </form>

        <div className="mt-6">
          <p className="mb-3 text-center text-sm text-[var(--color-ink-muted)]">
            または
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              className="flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm font-medium hover:bg-[var(--color-surface-alt)] transition"
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("apple")}
              className="flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm font-medium hover:bg-[var(--color-surface-alt)] transition"
            >
              Apple
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("x")}
              className="flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm font-medium hover:bg-[var(--color-surface-alt)] transition"
            >
              X
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("line")}
              className="flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm font-medium hover:bg-[var(--color-surface-alt)] transition"
            >
              LINE
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-[var(--color-ink-muted)]">
        <Link href="/terms" className="text-[#3daae0] hover:underline">
          利用規約
        </Link>
        {" · "}
        <Link href="/privacy" className="text-[#3daae0] hover:underline">
          プライバシーポリシー
        </Link>
      </p>
    </div>
  );
}
