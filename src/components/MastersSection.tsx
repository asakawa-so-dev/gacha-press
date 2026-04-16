import { cn } from "@/lib/utils";
import Image from "next/image";

const picks = [
  {
    id: 5,
    image: "/images/005.jpg",
    name: "くら寿司 ミニチュア陶器コレクション",
    comment: "精度がエグい。回転寿司に行くたびにガチャコーナーを探す自分がいる。",
    person: "佐藤 雅人",
    area: "渋谷",
  },
  {
    id: 37,
    image: "/images/037.jpg",
    name: "ことりの葛まんじゅう うつろい",
    comment: "200円でこの透明感。デスクに置くと光が透けてきれい。",
    person: "田中 美咲",
    area: "下北沢",
  },
  {
    id: 14,
    image: "/images/014.jpg",
    name: "ねこあし おちょこ",
    comment: "実際に使えるクオリティ。晩酌のお供に。",
    person: "山本 健一",
    area: "中野",
  },
  {
    id: 6,
    image: "/images/006.jpg",
    name: "フロマージュ研究会",
    comment: "チーズの断面のリアルさに一目惚れ。食品サンプル文化の延長線上にある。",
    person: "鈴木 彩花",
    area: "吉祥寺",
  },
  {
    id: 29,
    image: "/images/029.jpg",
    name: "懐かしレトロ看板アクリルチャーム",
    comment: "昭和の商店街を持ち歩ける。ノスタルジーをポケットに。",
    person: "伊藤 龍太",
    area: "秋葉原",
  },
  {
    id: 46,
    image: "/images/046.jpg",
    name: "ヴィセ ミニチュアコレクション",
    comment: "コスメ×ミニチュア。女子へのプレゼントに最高。",
    person: "渡辺 結衣",
    area: "原宿",
  },
];

export function MastersSection() {
  return (
    <section id="people" className="border-t border-border bg-muted/50 py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-[11px] font-medium tracking-[0.25em] text-primary">
              PEOPLE
            </span>
            <h2 className="mt-3 font-sans text-[clamp(1.5rem,3vw,2rem)] font-bold leading-[1.3] tracking-tight text-foreground">
              街のガチャ好きたち
            </h2>
          </div>
          <p className="max-w-[360px] text-[14px] leading-[1.8] text-muted-foreground">
            それぞれの街で、それぞれの推しガチャがある。
          </p>
        </div>
      </div>

      {/* Carousel */}
      <div
        className="flex gap-5 overflow-x-auto px-6 pb-4 md:px-10"
        style={{ scrollbarWidth: "none" }}
      >
        {picks.map((pick) => (
          <article
            key={pick.id}
            className={cn(
              "min-w-[300px] shrink-0 overflow-hidden rounded-xl border border-border bg-card",
              "transition-shadow duration-200 hover:shadow-md"
            )}
          >
            {/* Image */}
            <div className="relative h-[200px] bg-muted">
              <Image
                src={pick.image}
                alt={pick.name}
                fill
                className="object-cover"
                sizes="300px"
              />
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-foreground">
                  {pick.person}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {pick.area}
                </span>
              </div>
              <p className="mt-1 text-[12px] font-medium text-primary">
                {pick.name}
              </p>
              <p className="mt-2 border-l-2 border-border pl-3 text-[13px] leading-[1.7] text-muted-foreground">
                &ldquo;{pick.comment}&rdquo;
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 text-center">
        <a
          href="#"
          className="inline-block border-b border-foreground pb-0.5 text-[12px] font-medium tracking-[0.1em] text-foreground transition-opacity duration-200 hover:opacity-60"
        >
          VIEW ALL PEOPLE →
        </a>
      </div>
    </section>
  );
}
