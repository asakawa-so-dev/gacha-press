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
    `flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
      tab === t
        ? "bg-white text-[#1c1c28] shadow-sm"
        : "text-[#9b9bab] hover:text-[#5c5c6f]"
    }`;

  if (signupDone) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-[#e4e4ea]">
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13" />
                <path d="m22 2-7 20-4-9-9-4 20-7z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-[#1c1c28]">確認メールを送信しました</p>
              <p className="mt-2 text-sm text-[#9b9bab]">
                <span className="font-bold text-[#3daae0]">{email}</span> に届いたメールのリンクをタップして登録を完了してください
              </p>
            </div>
            <div className="pt-2 space-y-2">
              <p className="text-xs text-[#9b9bab]">
                届かない場合はスパムフォルダを確認してください
              </p>
              <button
                type="button"
                onClick={() => { setSignupDone(false); setError(null); }}
                className="text-sm font-bold text-[#3daae0] link-underline"
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
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-[#e4e4ea]">
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
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#1c1c28]">
            {tab === "login" ? "おかえりなさい" : "はじめまして"}
          </h2>
          <p className="mt-1 text-sm text-[#9b9bab]">
            {tab === "login"
              ? "メールアドレスとパスワードでログイン"
              : "メールアドレスで簡単に登録できます"}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-xl bg-[#f5f5f7] p-1">
          <button type="button" className={tabClass("login")} onClick={() => { setTab("login"); setError(null); }}>
            ログイン
          </button>
          <button type="button" className={tabClass("signup")} onClick={() => { setTab("signup"); setError(null); }}>
            新規登録
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={tab === "login" ? handleLogin : handleSignup} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-[#1c1c28]">
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
              className="mt-1 block w-full rounded-xl border border-[#e4e4ea] px-4 py-3 text-[#1c1c28] placeholder:text-[#9b9bab] focus:border-[#3daae0] focus:ring-2 focus:ring-[#3daae0]/20 outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-[#1c1c28]">
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
              className="mt-1 block w-full rounded-xl border border-[#e4e4ea] px-4 py-3 text-[#1c1c28] placeholder:text-[#9b9bab] focus:border-[#3daae0] focus:ring-2 focus:ring-[#3daae0]/20 outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#3daae0] px-4 py-3.5 font-bold text-white hover:bg-[#2888c0] disabled:opacity-50 transition-all duration-300 active:scale-[0.98]"
          >
            {loading
              ? "処理中..."
              : tab === "login"
              ? "ログイン"
              : "アカウントを作成"}
          </button>
          <p className="text-center text-xs text-[#9b9bab]">
            {tab === "login"
              ? "アカウントがない場合は「新規登録」タブから作成してください"
              : "登録すると確認メールが届きます"}
          </p>
        </form>
      </div>

      <p className="text-center text-xs text-[#9b9bab]">
        <Link href="/terms" className="text-[#3daae0] link-underline">
          利用規約
        </Link>
        {" · "}
        <Link href="/privacy" className="text-[#3daae0] link-underline">
          プライバシーポリシー
        </Link>
      </p>
    </div>
  );
}
