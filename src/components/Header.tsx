import Link from "next/link";

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
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </header>
  );
}
