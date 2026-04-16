"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import CardInterestButton from "@/components/CardInterestButton";
import ProductImage from "@/components/ProductImage";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/detail/${product.id}`}
      className="block rounded-lg overflow-hidden card-hover glass-card"
    >
      <div className="relative aspect-square bg-[#f7f7f5]">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain p-1.5"
          showSourceBadge={false}
        />
        {product.is_new && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#7EBEA5] text-white text-[9px] font-bold rounded tracking-widest uppercase">
            New
          </span>
        )}
        <CardInterestButton productId={product.id} />
      </div>
      <div className="p-3 border-t border-[rgba(18,38,33,0.07)]">
        <h3 className="text-[13px] font-medium text-[#122621] line-clamp-2 leading-snug" style={{ fontFamily: "var(--font-serif)" }}>
          {product.name}
        </h3>
        <p className="mt-1.5 text-xs font-bold text-[#7EBEA5] tabular-nums">
          ¥{product.price.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
