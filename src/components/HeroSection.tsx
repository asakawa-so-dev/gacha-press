export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.18 0.01 250) 1px, transparent 1px), linear-gradient(90deg, oklch(0.18 0.01 250) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-[720px] px-6 text-center">
        {/* Issue label — magazine style */}
        <p
          className="animate-fade-in-up mb-6 text-[11px] font-medium tracking-[0.25em] text-muted-foreground"
        >
          FOR CITY BOYS &amp; GIRLS — 2026
        </p>

        {/* Tagline */}
        <h1
          className="animate-fade-in-up font-sans text-[clamp(2rem,6vw,3.5rem)] font-bold leading-[1.2] tracking-tight text-foreground"
          style={{ animationDelay: "0.1s", animationFillMode: "both" }}
        >
          ガチャって、
          <br />
          街のカルチャーだ。
        </h1>

        {/* Subtitle */}
        <p
          className="animate-fade-in-up mx-auto mt-6 max-w-[480px] text-[15px] leading-[1.9] text-muted-foreground"
          style={{ animationDelay: "0.25s", animationFillMode: "both" }}
        >
          渋谷の片隅で見つけた、あの一回。
          <br />
          大人になった今だからわかる、ガチャの奥深さ。
        </p>

        {/* CTA */}
        <div
          className="animate-fade-in-up mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6"
          style={{ animationDelay: "0.4s", animationFillMode: "both" }}
        >
          <a
            href="/"
            className="bg-foreground text-background inline-block rounded-full px-8 py-3 text-[13px] font-medium tracking-[0.05em] transition-opacity duration-200 hover:opacity-80"
          >
            ガチャを探す
          </a>
          <a
            href="#collection"
            className="text-muted-foreground hover:text-foreground border-b border-current pb-0.5 text-[13px] transition-colors duration-200"
          >
            コレクションを見る
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="text-[10px] tracking-[0.3em] text-muted-foreground/60">
          SCROLL
        </span>
        <div className="h-8 w-px bg-border" />
      </div>
    </section>
  );
}
