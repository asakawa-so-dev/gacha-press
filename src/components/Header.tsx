"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MenuIcon, CloseIcon } from "@/components/icons";

const navLinks = [
  { label: "さがす", href: "/" },
  { label: "ランキング", href: "/ranking" },
  { label: "気になる", href: "/mylist" },
  { label: "COLLECTION", href: "#collection" },
  { label: "NEWS", href: "#news" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 md:h-[72px] md:px-10">
          {/* Logo */}
          <a href="/" className="flex items-baseline gap-2">
            <span className="text-foreground font-sans text-lg font-bold tracking-tight">
              ガチャ活
            </span>
            <span className="text-muted-foreground text-[10px] font-normal tracking-[0.15em]">
              GACHA KATSU
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-muted-foreground hover:text-foreground text-[11px] font-medium tracking-[0.12em] transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="text-foreground md:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="メニューを開く"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/98 backdrop-blur-sm">
          <button
            className="text-foreground absolute top-5 right-6"
            onClick={() => setMenuOpen(false)}
            aria-label="メニューを閉じる"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
          <nav className="flex flex-col items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-foreground hover:text-primary text-base font-medium tracking-[0.1em] transition-colors duration-200"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
