"use client";

import { useInterests } from "@/components/InterestProvider";

export default function CardInterestButton({
  productId,
}: {
  productId: number;
}) {
  const { isLiked, toggle, ready } = useInterests();
  if (!ready) return null;

  const liked = isLiked(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      className={`absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-90 ${
        liked
          ? "bg-[var(--color-accent)] text-white"
          : "bg-white/90 text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] border border-[var(--color-border)]"
      }`}
      aria-label={liked ? "気になるを取り消す" : "気になる"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    </button>
  );
}
