"use client";

import Link from "next/link";
import { useLikes } from "@/lib/likes-store";
import { usePlayed } from "@/lib/played-store";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";

export default function MyPage() {
  const { count: likeCount } = useLikes();
  const { count: playedCount } = usePlayed();

  return (
    <>
      <AppHeader />
      <main className="pt-14 pb-20">
        <div className="mx-auto max-w-[600px] px-4 py-6 md:px-10">
          <div className="mb-6">
            <span className="text-[11px] font-medium tracking-[0.25em] text-primary">MY PAGE</span>
            <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-foreground">マイページ</h1>
          </div>

          {/* Profile card */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-primary">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">ガチャ活ユーザー</p>
                <p className="text-xs text-muted-foreground">ゲストモード</p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-muted/50 p-4 text-center">
                <p className="text-3xl font-bold text-primary">{likeCount}</p>
                <p className="mt-1 text-xs text-muted-foreground">気になる</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4 text-center">
                <p className="text-3xl font-bold text-foreground">{playedCount}</p>
                <p className="mt-1 text-xs text-muted-foreground">まわした</p>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="mt-6 space-y-2">
            <MenuItem href="/mylist" label="気になるリスト" sublabel={`${likeCount}件`} icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            } />
            <MenuItem href="/" label="ガチャを探す" icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            } />
            <MenuItem href="/ranking" label="ランキング" icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M8 21v-8" /><path d="M12 21V3" /><path d="M16 21v-5" />
              </svg>
            } />
          </div>

          {/* Links */}
          <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              トップに戻る
            </Link>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}

function MenuItem({ href, label, sublabel, icon }: { href: string; label: string; sublabel?: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm hover:border-foreground/20"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Link>
  );
}
