import { createClient } from "@/lib/supabase/server";
import ProductList from "@/components/ProductList";
import ScrollReveal from "@/components/ScrollReveal";
import SnsLinks from "@/components/SnsLinks";
import type { Product } from "@/lib/types";
import { APPROVED_MAKERS } from "@/lib/constants";

function TrustBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl glass px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(126,190,165,0.12)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7EBEA5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#122621]">
            メーカー公認の商品画像を掲載
          </p>
          <p className="mt-0.5 text-xs text-[#7a8c88] leading-relaxed">
            marupacaはメーカーから掲載許諾を得た商品のみを掲載しています。
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: products = [] } = await supabase
    .from("products")
    .select("*")
    .in("maker", APPROVED_MAKERS as unknown as string[])
    .order("id");

  const typedProducts = products as Product[];
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthCount = typedProducts.filter(
    (p) => p.release_month === thisMonth
  ).length;
  const makerCount = new Set(typedProducts.map((p) => p.maker)).size;

  return (
    <div className="min-h-screen">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <h1 className="section-header">
              キュレーション
            </h1>
            <SnsLinks />
          </div>
          <p className="section-header-sub">Capsule Toy Curation</p>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mt-5">
            <TrustBanner />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="mt-4 flex flex-wrap gap-4 rounded-xl glass-subtle px-4 py-3 text-sm text-[#4a4a5c]">
            <span>全<strong className="text-[#1c1c28]">{typedProducts.length}</strong>件</span>
            <span>今月<strong className="text-[#1c1c28]">{thisMonthCount}</strong>件</span>
            <span>メーカー<strong className="text-[#1c1c28]">{makerCount}</strong>社</span>
          </div>
        </ScrollReveal>

        <ProductList products={typedProducts} />
      </div>
    </div>
  );
}
