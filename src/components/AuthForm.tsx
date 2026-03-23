"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (err) throw err;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
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
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--color-ink)]">ログイン / 新規登録</h2>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            メールアドレスだけでOK。パスワード不要です
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {sent ? (
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13" />
                <path d="m22 2-7 20-4-9-9-4 20-7z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-[var(--color-ink)]">ログインリンクを送信しました</p>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                <span className="font-bold text-[#3daae0]">{email}</span> に届いたメールのリンクをタップしてください
              </p>
            </div>
            <div className="pt-2 space-y-2">
              <p className="text-xs text-[var(--color-ink-muted)]">
                届かない場合はスパムフォルダを確認してください
              </p>
              <button
                type="button"
                onClick={() => { setSent(false); setError(null); }}
                className="text-sm font-bold text-[#3daae0] hover:underline"
              >
                メールアドレスを変更する
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-[var(--color-ink)]"
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
                placeholder="example@email.com"
                className="mt-1 block w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:border-[#3daae0] focus:ring-2 focus:ring-[#3daae0]/20 outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#3daae0] px-4 py-3.5 font-bold text-white hover:bg-[#2888c0] disabled:opacity-50 transition active:scale-[0.98]"
            >
              {loading ? "送信中..." : "ログインリンクを送信"}
            </button>
            <p className="text-center text-xs text-[var(--color-ink-muted)]">
              アカウントがない場合は自動で作成されます
            </p>
          </form>
        )}
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
