const sitemapLinks = [
  { label: "ABOUT", href: "#about" },
  { label: "COLLECTION", href: "#collection" },
  { label: "PEOPLE", href: "#people" },
  { label: "NEWS", href: "#news" },
  { label: "CONTACT", href: "#contact" },
];

const utilityLinks = [
  { label: "ガチャを探す", href: "/" },
  { label: "ランキング", href: "/ranking" },
  { label: "気になるリスト", href: "/mylist" },
  { label: "マイページ", href: "/mypage" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-[1200px] px-6 pb-8 pt-14 md:px-10 md:pb-10 md:pt-20">
        {/* Footer top */}
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          {/* Logo area */}
          <div>
            <a href="/" className="flex items-baseline gap-2">
              <span className="font-sans text-lg font-bold tracking-tight text-foreground">
                ガチャ活
              </span>
              <span className="text-[10px] tracking-[0.15em] text-muted-foreground">
                GACHA KATSU
              </span>
            </a>
            <p className="mt-3 max-w-[240px] text-[13px] leading-[1.7] text-muted-foreground">
              シティボーイ&amp;ガールのための
              <br />
              ガチャカルチャーメディア
            </p>
          </div>

          {/* Navigation columns */}
          <div className="grid grid-cols-2 gap-10">
            <div>
              <p className="mb-3 text-[11px] font-medium tracking-[0.1em] text-foreground">
                SITEMAP
              </p>
              <ul className="list-none space-y-2">
                {sitemapLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13px] text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-3 text-[11px] font-medium tracking-[0.1em] text-foreground">
                FEATURES
              </p>
              <ul className="list-none space-y-2">
                {utilityLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13px] text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-14 border-t border-border" />

        {/* Footer bottom */}
        <div className="flex flex-col items-center justify-between gap-3 pt-6 md:flex-row">
          <p className="text-[11px] text-muted-foreground">
            &copy; 2026 ガチャ活 All rights reserved.
          </p>
          <div className="flex gap-5">
            <a href="#" className="text-[11px] text-muted-foreground transition-colors duration-200 hover:text-foreground">
              Privacy Policy
            </a>
            <a href="#" className="text-[11px] text-muted-foreground transition-colors duration-200 hover:text-foreground">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
