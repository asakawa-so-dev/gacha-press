import Link from "next/link";

const SNS_LINKS = [
  {
    href: "https://x.com/marupacax?s=21&t=0xJHsWumpPSHymx8xOlPjQ",
    label: "X (Twitter)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    href: "https://www.instagram.com/marupaca?igsh=N2tjYmo1MnU1MDAy&utm_source=qr",
    label: "Instagram",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-20 z-50 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/logo-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <span style={{ fontFamily: "var(--font-logo)" }} className="text-[35px] leading-none tracking-[0.08em] text-white translate-y-[8px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            MARUPACA
          </span>
        </Link>
        <div className="absolute right-4 flex items-center gap-3">
          {SNS_LINKS.map((sns) => (
            <a
              key={sns.label}
              href={sns.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={sns.label}
              className="text-white/70 hover:text-white transition-colors drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]"
            >
              {sns.icon}
            </a>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </header>
  );
}
