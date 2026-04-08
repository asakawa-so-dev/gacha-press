"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ScrollReveal from "@/components/ScrollReveal";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setSessionReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setSuccess(true);
      setTimeout(() => router.push("/mypage"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#3daae0] border-t-transparent" />
          <p className="text-sm font-bold text-[#7a7a90]">認証確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-md px-4 py-8">
        <ScrollReveal>
          <h1 className="section-header text-center">/NEW PASSWORD</h1>
          <p className="section-header-sub text-center">新しいパスワード設定</p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="mt-6">
            <div className="mx-auto max-w-md space-y-6">
              <div className="rounded-2xl glass-card p-6 border border-white/25">
                {success ? (
                  <div className="text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-[#1c1c28]">パスワードを更新しました</p>
                      <p className="mt-2 text-sm text-[#7a7a90]">
                        マイページに移動します...
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 flex flex-col items-center text-center">
                      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#3daae0]/15">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3daae0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-[#1c1c28]">新しいパスワードを設定</h2>
                      <p className="mt-1 text-sm text-[#7a7a90]">
                        6文字以上の新しいパスワードを入力してください
                      </p>
                    </div>

                    {error && (
                      <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="password" className="block text-sm font-bold text-[#1c1c28]">
                          新しいパスワード
                        </label>
                        <input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                          placeholder="6文字以上で入力"
                          minLength={6}
                          className="mt-1 block w-full rounded-xl border border-white/25 px-4 py-3 text-[#1c1c28] placeholder:text-[#7a7a90] focus:border-[#3daae0] focus:ring-2 focus:ring-[#3daae0]/20 outline-none transition bg-white/10 backdrop-blur-md"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-bold text-[#1c1c28]">
                          パスワード（確認）
                        </label>
                        <input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                          placeholder="もう一度入力"
                          minLength={6}
                          className="mt-1 block w-full rounded-xl border border-white/25 px-4 py-3 text-[#1c1c28] placeholder:text-[#7a7a90] focus:border-[#3daae0] focus:ring-2 focus:ring-[#3daae0]/20 outline-none transition bg-white/10 backdrop-blur-md"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-[#3daae0] px-4 py-3.5 font-bold text-white hover:bg-[#2888c0] disabled:opacity-50 transition-all duration-300 active:scale-[0.98]"
                      >
                        {loading ? "更新中..." : "パスワードを更新"}
                      </button>
                    </form>
                  </>
                )}
              </div>

              {!success && (
                <p className="text-center text-sm">
                  <Link href="/mypage" className="font-bold text-[#3daae0] link-underline">
                    ← マイページに戻る
                  </Link>
                </p>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
