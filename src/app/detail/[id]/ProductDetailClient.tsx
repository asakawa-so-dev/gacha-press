"use client";

import InterestButton from "@/components/InterestButton";
import PurchasedButton from "@/components/PurchasedButton";

type ProductDetailClientProps = {
  productId: number;
  initialLiked: boolean;
  initialCount: number;
  initialPurchased: boolean;
  initialPurchasedCount: number;
};

export default function ProductDetailClient({
  productId,
  initialLiked,
  initialCount,
  initialPurchased,
  initialPurchasedCount,
}: ProductDetailClientProps) {
  return (
    <>
      <InterestButton
        productId={productId}
        initialLiked={initialLiked}
        initialCount={initialCount}
      />
      <PurchasedButton
        productId={productId}
        initialPurchased={initialPurchased}
        initialCount={initialPurchasedCount}
      />
    </>
  );
}
