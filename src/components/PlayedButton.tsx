"use client";

import { usePlayed } from "@/lib/played-store";
import { cn } from "@/lib/utils";

export function PlayedButton({ itemId }: { itemId: number }) {
  const { toggle, isPlayed } = usePlayed();
  const played = isPlayed(itemId);

  return (
    <button
      onClick={() => toggle(itemId)}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all",
        played
          ? "bg-primary/10 text-primary border border-primary/20"
          : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border"
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {played ? "まわした！" : "まわす"}
    </button>
  );
}
