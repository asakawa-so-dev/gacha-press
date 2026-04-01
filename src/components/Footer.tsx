import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#e4e4ea] bg-white py-10 pb-24">
      <div className="mx-auto max-w-2xl px-4">
        <div className="flex items-center justify-center gap-2.5">
          <Image
            src="/images/logo.png"
            alt="marupaka"
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="text-sm font-black text-[#1c1c28] uppercase tracking-wide">
            marupaka
          </span>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-[#9b9bab]">
          <Link href="/terms" className="link-underline hover:text-[#1c1c28] transition-colors">利用規約</Link>
          <Link href="/privacy" className="link-underline hover:text-[#1c1c28] transition-colors">プライバシー</Link>
        </div>
        <p className="mt-4 text-center text-[11px] text-[#9b9bab]">
          © 2026 marupaka
        </p>
      </div>
    </footer>
  );
}
