import Link from "next/link";

const SNS_LINKS = [
  {
    href: "https://x.com/marupacax?s=21&t=0xJHsWumpPSHymx8xOlPjQ",
    label: "X (Twitter)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    href: "https://www.instagram.com/marupaca?igsh=N2tjYmo1MnU1MDAy&utm_source=qr",
    label: "Instagram",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="glass-subtle py-10 pb-24" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
      <div className="mx-auto max-w-2xl px-4">
        <p className="text-center text-sm font-bold text-[#4a4a5c]" style={{ fontFamily: "var(--font-logo)" }}>
          MARUPACA
        </p>
        <div className="mt-3 flex items-center justify-center gap-4">
          {SNS_LINKS.map((sns) => (
            <a
              key={sns.label}
              href={sns.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={sns.label}
              className="text-[#7a7a90] hover:text-[#4a4a5c] transition-colors"
            >
              {sns.icon}
            </a>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-[#7a7a90]">
          <Link href="/terms" className="link-underline hover:text-[#1c1c28] transition-colors">利用規約</Link>
          <Link href="/privacy" className="link-underline hover:text-[#1c1c28] transition-colors">プライバシー</Link>
        </div>
        <p className="mt-4 text-center text-[11px] text-[#7a7a90]">
          © 2026 marupaca
        </p>
      </div>
    </footer>
  );
}
