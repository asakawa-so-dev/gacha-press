const SNS_LINKS = [
  {
    href: "https://x.com/marupacax?s=21&t=0xJHsWumpPSHymx8xOlPjQ",
    label: "X (Twitter)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    href: "https://www.instagram.com/marupaca?igsh=N2tjYmo1MnU1MDAy&utm_source=qr",
    label: "Instagram",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export default function SnsLinks({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      {SNS_LINKS.map((sns) => (
        <a
          key={sns.label}
          href={sns.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={sns.label}
          className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink-secondary)] transition-colors"
        >
          {sns.icon}
        </a>
      ))}
    </div>
  );
}
