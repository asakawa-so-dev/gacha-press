"use client";

import { use, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { GACHA_DATA } from "@/lib/gacha-data";
import { LikeButton } from "@/components/LikeButton";
import { PlayedButton } from "@/components/PlayedButton";
import { DemographicsReport } from "@/components/DemographicsReport";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";

export default function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const itemId = Number(id);
  const item = GACHA_DATA.find((g) => g.id === itemId);

  if (!item) {
    return (
      <>
        <AppHeader showBack />
        <main className="pt-14 pb-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="text-4xl mb-3 block">🔍</span>
            <p className="text-muted-foreground">商品が見つかりません</p>
              <Link href="/" className="mt-3 inline-block text-sm text-primary font-medium">
              ガチャを探す
            </Link>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  const imageSrc = `/images/${item.image.replace("images/", "")}`;

  return (
    <>
      <AppHeader showBack />
      <main className="pt-14 pb-20">
        <div className="mx-auto max-w-[800px]">
          {/* Breadcrumb */}
          <div className="px-4 py-3 md:px-10">
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">さがす</Link>
              <span>/</span>
              <span className="text-foreground truncate">{item.name}</span>
            </nav>
          </div>

          {/* Hero image */}
          <div className="relative aspect-square w-full bg-muted md:aspect-[4/3] md:rounded-xl md:mx-4 md:w-auto overflow-hidden">
            <Image
              src={imageSrc}
              alt={item.name}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>

          {/* Content */}
          <div className="px-4 md:px-10">
            {/* Meta badges */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {item.isNew && (
                <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">NEW</span>
              )}
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">{item.genre}</span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {item.releaseMonth.replace("2026-", "")}月発売
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-3 text-xl font-bold leading-tight text-foreground md:text-2xl">{item.name}</h1>

            {/* Info grid */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="メーカー" value={item.maker} />
              <InfoRow label="価格" value={`¥${item.price}`} />
              <InfoRow label="ラインナップ" value={`全${item.lineup}種`} />
              <InfoRow label="発売月" value={item.releaseMonth} />
            </div>

            {/* Description */}
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.description}</p>

            {/* Action buttons */}
            <div className="mt-6 flex gap-3">
              <div className="flex-1">
                <LikeButton itemId={item.id} size="md" />
              </div>
              <div className="flex-1">
                <PlayedButton itemId={item.id} />
              </div>
            </div>

            {/* Demographics report */}
            <div className="mt-8">
              <DemographicsReport item={item} />
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}
