"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import CardInterestButton from "@/components/CardInterestButton";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/detail/${product.id}`}
      className="block bg-white rounded-xl shadow-sm border border-[#e4e4ea] overflow-hidden hover:shadow-md hover:border-[#3daae0]/30 transition-all duration-200 active:scale-[0.98]"
    >
      <div className="relative aspect-square bg-[#f5f5f7]">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-1"
          />
        ) : (
          <div className="absolute inset-0 product-image-placeholder flex items-center justify-center">
            <span className="text-[#9b9bab] text-sm">No Image</span>
          </div>
        )}
        {product.is_new && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#3daae0] text-white text-[10px] font-bold rounded-md">
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
