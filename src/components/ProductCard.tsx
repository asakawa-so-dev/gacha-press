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
      className="block rounded-2xl overflow-hidden card-hover glass-card"
    >
      <div className="relative aspect-square bg-white/10">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain p-1"
          showSourceBadge={false}
        />
        {product.is_new && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#3daae0]/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-md">
            NEW
          </span>
        )}
        <CardInterestButton productId={product.id} />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold text-[#1c1c28] line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <p className="mt-1.5 text-sm font-bold text-[#1c1c28]">
          ¥{product.price.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
