import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import type { Product, ProductStats } from "@/lib/types";
import { APPROVED_MAKERS } from "@/lib/constants";
import ProductDetailClient from "./ProductDetailClient";
import ProductImage from "@/components/ProductImage";
import ProductDemographics from "@/components/ProductDemographics";
import ScrollReveal from "@/components/ScrollReveal";

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

  const typedProduct = product as Product;
  if (!(APPROVED_MAKERS as readonly string[]).includes(typedProduct.maker)) return null;

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
    title: `${product.name} | marupaca`,
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
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-4">
        <nav className="mb-4 flex items-center gap-2 text-sm text-[#7a7a90]">
          <Link href="/" className="link-underline hover:text-[#3daae0] transition-colors">
            さがす
          </Link>
          <span>/</span>
          <span className="text-[#1c1c28]">商品詳細</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:gap-6 lg:items-start">
          {/* Left: Product */}
          <div className="w-full lg:w-[55%] lg:shrink-0">
            <ScrollReveal variant="scale">
              <article className="rounded-2xl overflow-hidden glass-card">
                <div className="relative aspect-square bg-white/10">
                  <ProductImage
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 550px"
                    className="object-contain p-2"
                    priority
                  />
                  {product.is_new && (
                    <span className="absolute left-3 top-3 rounded-md bg-[#3daae0]/80 backdrop-blur-sm px-2 py-1 text-xs font-bold text-white">
                      NEW
                    </span>
                  )}
                </div>
                {product.image_url?.startsWith("http") && (
                  <div className="flex items-center gap-1.5 border-t border-white/15 bg-white/5 px-4 py-2 text-xs text-[#7a7a90]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 shrink-0">
                      <path d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 3.085 2.514l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z" />
                      <path d="M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-3.085-2.514l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z" />
                    </svg>
                    <span>画像出典：</span>
                    <a
                      href={product.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-[#3daae0] hover:underline"
                    >
                      {(() => { try { return new URL(product.image_url).hostname.replace(/^www\./, ""); } catch { return product.image_url; } })()}
                    </a>
                  </div>
                )}

                <div className="p-4">
                  <h1 className="text-xl font-bold text-[#1c1c28]">{product.name}</h1>
                  <p className="mt-2 text-2xl font-bold text-[#3daae0]">
                    ¥{product.price.toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-[#7a7a90]">
                    {formatMonth(product.release_month)}発売
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full glass-subtle px-3 py-1 text-xs font-medium text-[#4a4a5c]">
                      {product.genre}
                    </span>
                    <span className="rounded-full glass-subtle px-3 py-1 text-xs font-medium text-[#4a4a5c]">
                      {product.maker}
                    </span>
                    <span className="rounded-full glass-subtle px-3 py-1 text-xs font-medium text-[#4a4a5c]">
                      ラインナップ {product.lineup}種
                    </span>
                  </div>

                  {product.description && (
                    <p className="mt-4 text-sm text-[#4a4a5c] leading-relaxed whitespace-pre-wrap">
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
            </ScrollReveal>
          </div>

          {/* Right: Demographics Report */}
          <div className="w-full lg:w-[45%] lg:sticky lg:top-18">
            <ScrollReveal delay={200}>
              <ProductDemographics
                productId={product.id}
                initialPurchasedCount={stats.purchased_count}
              />
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
