"use client";

import Image from "next/image";
import Link from "next/link";
import { type GachaItem } from "@/lib/gacha-data";
import { LikeButton } from "@/components/LikeButton";

export function GachaCard({ item }: { item: GachaItem }) {
  return (
    <Link href={`/detail/${item.id}`} className="group block">
      {/* Image */}
      <div className="relative mb-3 aspect-square overflow-hidden rounded-sm bg-muted">
        <Image
          src={`/images/${item.image.replace("images/", "")}`}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-103"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
        />
        {/* Like button */}
        <div className="absolute top-2 right-2">
          <LikeButton itemId={item.id} />
        </div>
        {/* NEW badge */}
        {item.isNew && (
          <span className="absolute top-2 left-2 rounded-sm bg-primary px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-primary-foreground uppercase">
            New
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[9px] font-medium tracking-[0.18em] uppercase text-primary">
          {item.genre}
        </span>
        <span className="text-[10px] tabular-nums text-muted-foreground">
          ¥{item.price}
        </span>
      </div>
      <h3 className="font-heading line-clamp-2 text-[13px] font-medium leading-snug text-foreground transition-colors duration-200 group-hover:text-primary">
        {item.name}
      </h3>
      <p className="mt-0.5 text-[10px] text-muted-foreground tracking-wide">{item.maker}</p>
    </Link>
  );
}
