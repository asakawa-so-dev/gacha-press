"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLikes } from "@/lib/likes-store";

const navItems = [
  { label: "探す", href: "/" },
  { label: "ランキング", href: "/ranking" },
  { label: "気になる", href: "/mylist", showBadge: true },
  { label: "マイページ", href: "/mypage" },
];

export function AppHeader({ showBack = false }: { showBack?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { count } = useLikes();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 md:px-10">
        <div className="flex items-center">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="mr-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="戻る"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}

          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-heading text-[18px] font-bold tracking-tight text-foreground">
              marupaca
            </span>
            <span className="text-muted-foreground text-[9px] font-normal tracking-[0.15em] hidden sm:inline uppercase">
              Capsule Toy Curation
            </span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-200",
                  isActive
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {item.label}
                {item.showBadge && count > 0 && (
                  <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
