import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Product, ProductStats } from "@/lib/types";
import ProductDetailClient from "./ProductDetailClient";

type Props = { params: Promise<{ id: string }> };

function formatMonth(ym: string) {
  const [y, m] = ym.split("-");
  return `${y}年${parseInt(m, 10)}月`;
}

async function getProductAndStats(id: number) {
  const supabase = await createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (productError || !product) return null;

  const { data: stats } = await supabase
    .from("product_stats")
    .select("*")
    .eq("product_id", id)
    .single();

  const { data: { user } } = await supabase.auth.getUser();
  let isLiked = false;
  let isPurchased = false;
  if (user) {
    const { data: interest } = await supabase
      .from("user_interests")
      .select("product_id")
      .eq("user_id", user.id)
      .eq("product_id", id)
      .maybeSingle();
    isLiked = !!interest;

    const { data: purchase } = await supabase
      .from("user_purchases")
      .select("product_id")
      .eq("user_id", user.id)
      .eq("product_id", id)
      .maybeSingle();
    isPurchased = !!purchase;
  }

  return {
    product: product as Product,
    stats: (stats as ProductStats | null) ?? { product_id: id, interest_count: 0, purchased_count: 0 },
    isLiked,
    isPurchased,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return { title: "商品詳細" };

  const result = await getProductAndStats(numId);
  if (!result) return { title: "商品詳細" };

  const { product } = result;
  return {
    title: `${product.name} | カプる。`,
    description: product.description || `${product.maker}のガチャ ${product.name}。¥${product.price.toLocaleString()}、${formatMonth(product.release_month)}発売`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) notFound();

  const result = await getProductAndStats(numId);
  if (!result) notFound();

  const { product, stats, isLiked, isPurchased } = result;

  return (
    <div className="min-h-screen bg-[var(--color-surface-alt)]">
      <div className="mx-auto max-w-2xl px-4 py-4">
        <nav className="mb-4 flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
          <Link href="/" className="hover:text-[var(--color-brand-blue)] transition-colors">
            さがす
          </Link>
          <span>/</span>
          <span className="text-[var(--color-ink)]">商品詳細</span>
        </nav>

        <article className="rounded-2xl bg-white shadow-sm overflow-hidden border border-[var(--color-border)]">
          <div className="relative aspect-square bg-[var(--color-surface-alt)]">
            {product.image_url ? (
              <Image
                src={product.image_url.startsWith("http") ? product.image_url : `/${product.image_url}`}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 672px"
                className="object-contain p-2"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[var(--color-ink-muted)]">
                画像なし
              </div>
            )}
            {product.is_new && (
              <span className="absolute left-3 top-3 rounded-md bg-[#3daae0] px-2 py-1 text-xs font-medium text-white">
                NEW
              </span>
            )}
          </div>

          <div className="p-4">
            <h1 className="text-xl font-bold text-[var(--color-ink)]">{product.name}</h1>
            <p className="mt-2 text-2xl font-bold text-[#3daae0]">
              ¥{product.price.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              {formatMonth(product.release_month)}発売
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--color-surface-alt)] px-3 py-1 text-xs font-medium text-[var(--color-ink-secondary)]">
                {product.genre}
              </span>
              <span className="rounded-full bg-[var(--color-surface-alt)] px-3 py-1 text-xs font-medium text-[var(--color-ink-secondary)]">
                {product.maker}
              </span>
              <span className="rounded-full bg-[var(--color-surface-alt)] px-3 py-1 text-xs font-medium text-[var(--color-ink-secondary)]">
                ラインナップ {product.lineup}種
              </span>
            </div>

            {product.description && (
              <p className="mt-4 text-sm text-[var(--color-ink-secondary)] leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <ProductDetailClient
                productId={product.id}
                initialLiked={isLiked}
                initialCount={stats.interest_count}
                initialPurchased={isPurchased}
                initialPurchasedCount={stats.purchased_count}
              />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
