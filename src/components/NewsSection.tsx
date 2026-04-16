import { cn } from "@/lib/utils";

const newsItems = [
  { date: "2026.03.28", title: "春の新作ガチャ特集 — 桜モチーフのコレクションが続々登場", tag: "FEATURE" },
  { date: "2026.03.15", title: "大人のガチャ活フェス 2026 Spring @ 渋谷ヒカリエ", tag: "EVENT" },
  { date: "2026.02.20", title: "ガチャ活マスター座談会 — こだわりのコレクション哲学を聞く", tag: "INTERVIEW" },
  { date: "2026.01.30", title: "スターバックス × ガチャ活 第2弾コラボ販売スタート", tag: "COLLAB" },
  { date: "2025.12.18", title: "2025年ベストガチャアワード — 今年の名作を振り返る", tag: "AWARD" },
];

export function NewsSection() {
  return (
    <section className="border-t border-border py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        {/* Section header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="text-[11px] font-medium tracking-[0.25em] text-primary">
              NEWS
            </span>
            <h2 className="mt-3 font-sans text-[clamp(1.5rem,3vw,2rem)] font-bold leading-[1.3] tracking-tight text-foreground">
              ニュース
            </h2>
          </div>
          <a
            href="#"
            className="hidden text-[12px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground md:block"
          >
            VIEW ALL →
          </a>
        </div>

        {/* News list */}
        <ul className="list-none">
          {newsItems.map((item, index) => (
            <li key={index}>
              <a
                href="#"
                className={cn(
                  "group flex flex-col gap-2 border-b border-border py-5 transition-colors duration-200 md:flex-row md:items-center md:gap-6",
                  index === 0 && "border-t"
                )}
              >
                <div className="flex items-center gap-3 md:min-w-[200px]">
                  <time className="text-[13px] tabular-nums text-muted-foreground">
                    {item.date}
                  </time>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {item.tag}
                  </span>
                </div>
                <span className="text-[15px] text-foreground transition-colors duration-200 group-hover:text-primary">
                  {item.title}
                </span>
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile CTA */}
        <div className="mt-8 text-center md:hidden">
          <a
            href="#"
            className="text-[12px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            VIEW ALL NEWS →
          </a>
        </div>
      </div>
    </section>
  );
}
