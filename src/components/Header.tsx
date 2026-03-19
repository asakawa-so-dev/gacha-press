import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white shadow-sm z-50">
      <div className="h-full flex items-center justify-center px-4">
        <Link href="/" className="flex flex-col items-center gap-0.5">
          <span className="text-lg font-bold text-[#1c1c28] tracking-tight">
            カプる<span className="text-[#3daae0]">。</span>
          </span>
          <span className="text-[10px] text-[#5c5c6f] leading-none">
            ガチャ活メディア
          </span>
        </Link>
      </div>
    </header>
  );
}
