export function AboutSection() {
  return (
    <section id="about" className="border-t border-border py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        <div className="grid gap-12 md:grid-cols-2 md:gap-20">
          {/* Left — editorial heading */}
          <div>
            <span className="text-[11px] font-medium tracking-[0.25em] text-primary">
              ABOUT
            </span>
            <h2 className="mt-4 font-sans text-[clamp(1.5rem,3vw,2rem)] font-bold leading-[1.3] tracking-tight text-foreground">
              コンビニの横、駅ナカ、
              <br />
              商業施設の一角——
              <br />
              街にはガチャが溢れてる。
            </h2>
            <div className="accent-line mt-6" />
          </div>

          {/* Right — body text */}
          <div className="space-y-5 text-[15px] leading-[1.9] text-muted-foreground">
            <p>
              「ガチャ活」は、シティカルチャーとしてのガチャポンを楽しむためのメディアです。
            </p>
            <p>
              300円で手に入る小さなプロダクトには、デザイナーの遊び心とメーカーの本気が詰まってる。ミニチュアの純喫茶、リアルすぎるフード系、推しのアクスタ——気づいたら棚がいっぱいになってた、なんて経験ない？
            </p>
            <p>
              ファッション、カフェ、レコード屋と同じように。
              ガチャは街を歩く理由になる。
            </p>
          </div>
        </div>

        {/* Stats — magazine pull-quote style */}
        <div className="mt-20 grid grid-cols-2 gap-6 border-t border-border pt-10 md:grid-cols-4">
          {[
            { value: "50,000+", label: "コレクター" },
            { value: "3,200+", label: "掲載アイテム" },
            { value: "120+", label: "連携メーカー" },
            { value: "47", label: "都道府県" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-[12px] text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
