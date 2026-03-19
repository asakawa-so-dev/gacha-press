"use client";

import { useState, useRef } from "react";
import { useInterests } from "@/components/InterestProvider";

type InterestButtonProps = {
  productId: number;
  initialLiked: boolean;
  initialCount: number;
};

export default function InterestButton({
  productId,
  initialLiked,
  initialCount,
}: InterestButtonProps) {
  const { isLiked, toggle, ready } = useInterests();
  const [isAnimating, setIsAnimating] = useState(false);
  const serverLikedRef = useRef(initialLiked);

  const liked = ready ? isLiked(productId) : initialLiked;
  const count =
    initialCount + (Number(liked) - Number(serverLikedRef.current));

  const handleClick = () => {
    if (!ready) return;
    if (!liked) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 350);
    }
    toggle(productId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center gap-2 rounded-full px-4 py-2.5 font-medium transition-all ${
        liked
          ? "bg-[#ec4899]/15 text-[#ec4899]"
          : "bg-[#f5f5f7] text-[#5c5c6f] hover:bg-[#e4e4ea]"
      } ${isAnimating ? "heart-active" : ""}`}
      aria-label={liked ? "気になるを取り消す" : "気になる"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
      <span>気になる</span>
      <span className="text-sm opacity-80">({count})</span>
    </button>
  );
}
