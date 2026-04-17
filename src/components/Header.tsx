import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 bg-white border-b border-[var(--color-border)]">
      <div className="h-full flex items-center justify-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.svg"
            alt="MARUPACA"
            width={120}
            height={32}
            priority
          />
        </Link>
      </div>
    </header>
  );
}
