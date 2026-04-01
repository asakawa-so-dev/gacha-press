import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-xl border-b border-[#e4e4ea] z-50">
      <div className="h-full flex items-center justify-center px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/images/logo.png"
            alt="marupaka"
            width={28}
            height={28}
            className="rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
          />
          <span className="text-base font-black text-[#1c1c28] tracking-wide uppercase">
            marupaka
          </span>
        </Link>
      </div>
    </header>
  );
}
