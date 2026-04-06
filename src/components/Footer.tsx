import Link from "next/link";

export default function Footer() {
  return (
    <footer className="glass-subtle py-10 pb-24" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
      <div className="mx-auto max-w-2xl px-4">
        <p className="text-center text-sm font-bold text-[#4a4a5c]" style={{ fontFamily: "var(--font-logo)" }}>
          MARUPACA
        </p>
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
