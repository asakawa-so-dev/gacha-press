import { createClient } from "@/lib/supabase/server";
import ProductList from "@/components/ProductList";
import type { Product } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: products = [] } = await supabase
    .from("products")
    .select("*")
    .order("id");

  const typedProducts = products as Product[];
  const thisMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-03"
  const thisMonthCount = typedProducts.filter(
    (p) => p.release_month === thisMonth
  ).length;
  const makerCount = new Set(typedProducts.map((p) => p.maker)).size;

  return (
    <div className="min-h-screen bg-surface">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">さがす</h1>
        <div className="mt-4 flex flex-wrap gap-4 rounded-lg bg-surface-alt px-4 py-3 text-sm text-ink-secondary">
          <span>全{typedProducts.length}件</span>
          <span>今月{thisMonthCount}件</span>
          <span>メーカー{makerCount}社</span>
        </div>
        <ProductList products={typedProducts} />
      </div>
    </div>
  );
}
