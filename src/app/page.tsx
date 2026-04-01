import { createClient } from "@/lib/supabase/server";
import ProductList from "@/components/ProductList";
import ScrollReveal from "@/components/ScrollReveal";
import type { Product } from "@/lib/types";

function TrustBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-emerald-800">
            メーカー公認の商品画像を掲載
          </p>
          <p className="mt-0.5 text-xs text-emerald-600/80 leading-relaxed">
            marupakaはメーカーから掲載許諾を得た商品のみを掲載しています。安心してガチャ情報をお楽しみください。
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
          <h1 className="section-header sm:text-4xl">
            /DISCOVER
          </h1>
          <p className="section-header-sub">ガチャを探す</p>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mt-5">
            <TrustBanner />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="mt-4 flex flex-wrap gap-4 rounded-xl bg-[#f5f5f7] border border-[#e4e4ea] px-4 py-3 text-sm text-[#5c5c6f]">
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
