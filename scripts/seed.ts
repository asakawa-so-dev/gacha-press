/**
 * Seed script: reads web/js/data.js and generates SQL INSERT for Supabase.
 * Run: npx tsx scripts/seed.ts > supabase/seed.sql
 */
import { readFileSync } from "fs";

const raw = readFileSync("web/js/data.js", "utf-8");

// Extract GACHA_DATA array via eval-like approach
const dataMatch = raw.match(/const GACHA_DATA = \[([\s\S]*?)\];/);
if (!dataMatch) {
  console.error("Could not find GACHA_DATA");
  process.exit(1);
}

// Parse JS objects (they use double quotes already mostly, but have JS keys)
const cleaned = "[" + dataMatch[1] + "]";
// Convert JS object notation to JSON
const json = cleaned
  .replace(/(\w+):/g, '"$1":')       // unquoted keys -> quoted
  .replace(/'/g, '"')                 // single quotes -> double
  .replace(/,\s*([}\]])/g, "$1")     // trailing commas
  .replace(/"isNew"/g, '"is_new"')
  .replace(/"releaseMonth"/g, '"release_month"')
  .replace(/"image"/g, '"image_url"');

type RawProduct = {
  id: number;
  name: string;
  price: number;
  release_month: string;
  genre: string;
  maker: string;
  lineup: number;
  description: string;
  is_new: boolean;
  image_url: string;
};

let products: RawProduct[];
try {
  products = JSON.parse(json);
} catch (e) {
  console.error("JSON parse error:", e);
  process.exit(1);
}

const esc = (s: string) => s.replace(/'/g, "''");

let sql = "-- Auto-generated seed data\n";
sql += "-- Products\n";
sql += "INSERT INTO public.products (id, name, price, release_month, genre, maker, lineup, description, is_new, image_url) VALUES\n";

const rows = products.map((p) =>
  `  (${p.id}, '${esc(p.name)}', ${p.price}, '${p.release_month}', '${esc(p.genre)}', '${esc(p.maker)}', ${p.lineup}, '${esc(p.description)}', ${p.is_new}, '${esc(p.image_url)}')`
);
sql += rows.join(",\n");
sql += "\nON CONFLICT (id) DO NOTHING;\n\n";

// Initialize product_stats for all products
sql += "-- Product stats (initial)\n";
sql += "INSERT INTO public.product_stats (product_id, interest_count, purchased_count)\n";
sql += "SELECT id, 0, 0 FROM public.products\nON CONFLICT (product_id) DO NOTHING;\n";

console.log(sql);
