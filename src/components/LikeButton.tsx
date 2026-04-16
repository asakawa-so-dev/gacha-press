"use client";

import { cn } from "@/lib/utils";
import { useLikes } from "@/lib/likes-store";

export function LikeButton({
  itemId,
  size = "sm",
}: {
  itemId: number;
  size?: "sm" | "md";
}) {
  const { toggle, isLiked } = useLikes();
  const liked = isLiked(itemId);

  if (size === "md") {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle(itemId);
        }}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all",
          liked
            ? "bg-pink-50 text-pink-500 border border-pink-200"
            : "bg-muted text-muted-foreground hover:bg-pink-50 hover:text-pink-400 border border-border"
        )}
        aria-label={liked ? "気になるから削除" : "気になるに追加"}
      >
        <svg viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
        {liked ? "気になる！" : "気になる"}
      </button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(itemId);
      }}
      className={cn(
        "flex items-center justify-center rounded-full transition-all duration-200 h-8 w-8",
        liked
          ? "bg-pink-50 text-pink-500"
          : "bg-background/80 text-muted-foreground hover:text-pink-400 backdrop-blur-sm"
      )}
      aria-label={liked ? "気になるから削除" : "気になるに追加"}
    >
      <svg
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    </button>
  );
}
