"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type PurchasedButtonProps = {
  productId: number;
  initialPurchased: boolean;
  initialCount: number;
};

export default function PurchasedButton({
  productId,
  initialPurchased,
  initialCount,
}: PurchasedButtonProps) {
  const router = useRouter();
  const [purchased, setPurchased] = useState(initialPurchased);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/mypage");
      return;
    }

    if (purchased || isLoading) return;

    setIsLoading(true);
    const newCount = count + 1;

    try {
      const { error } = await supabase
        .from("user_purchases")
        .insert({ user_id: user.id, product_id: productId } as any);
      if (error) throw error;
      (supabase.from("product_stats") as any)
        .update({ purchased_count: newCount })
        .eq("product_id", productId);
      setPurchased(true);
      setCount(newCount);
    } catch {
      // Keep state on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={purchased || isLoading}
      className={`flex items-center gap-2 rounded-full px-4 py-2.5 font-medium transition-all border ${
        purchased
          ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)] border-[var(--color-brand)]/20 cursor-default"
          : "bg-[var(--color-brand)] text-white border-[var(--color-brand)] hover:opacity-90 disabled:opacity-50"
      }`}
      aria-label={purchased ? "買った済み" : "買った"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>✓ 買った</span>
      <span className="text-sm opacity-70">({count})</span>
    </button>
  );
}
