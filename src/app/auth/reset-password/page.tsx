"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ScrollReveal from "@/components/ScrollReveal";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
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
    <div className="min-h-screen">
      <div className="mx-auto max-w-md px-4 py-8">
        <ScrollReveal>
          <h1 className="section-header text-center">/RESET</h1>
          <p className="section-header-sub text-center">パスワードリセット</p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="mt-6">
            <div className="mx-auto max-w-md space-y-6">
              <div className="rounded-2xl glass-card p-6 border border-white/25">
                {sent ? (
                  <div className="text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2 11 13" />
                        <path d="m22 2-7 20-4-9-9-4 20-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-[#1c1c28]">リセットメールを送信しました</p>
                      <p className="mt-2 text-sm text-[#7a7a90]">
                        <span className="font-bold text-[#3daae0]">{email}</span> に届いたメールのリンクをタップしてパスワードを再設定してください
                      </p>
                    </div>
                    <div className="pt-2 space-y-2">
                      <p className="text-xs text-[#7a7a90]">
                        届かない場合はスパムフォルダを確認してください
                      </p>
                      <button
                        type="button"
                        onClick={() => { setSent(false); setError(null); }}
                        className="text-sm font-bold text-[#3daae0] link-underline"
                      >
                        メールアドレスを変更して再送信
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 flex flex-col items-center text-center">
                      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#3daae0]/15">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3daae0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-[#1c1c28]">パスワードをお忘れですか？</h2>
                      <p className="mt-1 text-sm text-[#7a7a90]">
                        登録メールアドレスにリセットリンクをお送りします
                      </p>
                    </div>

                    {error && (
                      <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                          className="mt-1 block w-full rounded-xl border border-white/25 px-4 py-3 text-[#1c1c28] placeholder:text-[#7a7a90] focus:border-[#3daae0] focus:ring-2 focus:ring-[#3daae0]/20 outline-none transition bg-white/10 backdrop-blur-md"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-[#3daae0] px-4 py-3.5 font-bold text-white hover:bg-[#2888c0] disabled:opacity-50 transition-all duration-300 active:scale-[0.98]"
                      >
                        {loading ? "送信中..." : "リセットメールを送信"}
                      </button>
                    </form>
                  </>
                )}
              </div>

              <p className="text-center text-sm">
                <Link href="/mypage" className="font-bold text-[#3daae0] link-underline">
                  ← ログインに戻る
                </Link>
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
