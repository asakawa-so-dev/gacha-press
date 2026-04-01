import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約 | marupaka",
  description: "marupakaの利用規約",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-alt)]">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-[#3daae0] hover:underline"
        >
          ← トップに戻る
        </Link>
        <article className="rounded-2xl bg-white p-6 shadow-sm border border-[var(--color-border)] prose prose-sm max-w-none">
          <h1 className="text-2xl font-bold text-[var(--color-ink)] mb-6">
            利用規約
          </h1>
          <p className="text-sm text-[var(--color-ink-secondary)] mb-4">
            この利用規約（以下「本規約」）は、marupaka（以下「本サービス」）の利用条件を定めるものです。本サービスをご利用いただく前に、本規約をご一読ください。
          </p>

          <h2 className="text-lg font-bold text-[var(--color-ink)] mt-6 mb-2">
            第1条 適用
          </h2>
          <p className="text-sm text-[var(--color-ink-secondary)] mb-4">
            本規約は、本サービス（ガチャガチャ情報メディアとしての情報提供サービス）の利用に関する条件を定めるものです。利用者は、本サービスの利用をもって本規約に同意したものとみなします。
          </p>

          <h2 className="text-lg font-bold text-[var(--color-ink)] mt-6 mb-2">
            第2条 サービス内容
          </h2>
          <p className="text-sm text-[var(--color-ink-secondary)] mb-4">
            本サービスは、ガチャガチャ関連商品の発売情報、価格、メーカー情報等を提供する情報メディアです。掲載情報は参考情報であり、実際の商品内容・価格・発売日等はメーカー・販売元にご確認ください。
          </p>

          <h2 className="text-lg font-bold text-[var(--color-ink)] mt-6 mb-2">
            第3条 禁止事項
          </h2>
          <p className="text-sm text-[var(--color-ink-secondary)] mb-4">
            利用者は、以下の行為を行ってはなりません。<br />
            （1）法令または公序良俗に違反する行為<br />
            （2）本サービスの運営を妨害する行為<br />
            （3）他の利用者または第三者の権利を侵害する行為<br />
            （4）虚偽の情報を登録または送信する行為
          </p>

          <h2 className="text-lg font-bold text-[var(--color-ink)] mt-6 mb-2">
            第4条 免責事項
          </h2>
          <p className="text-sm text-[var(--color-ink-secondary)] mb-4">
            本サービスに掲載される情報の正確性、完全性について保証するものではありません。利用者が本サービスを通じて得た情報に基づき行動したことにより生じた損害について、運営者は一切の責任を負いません。
          </p>

          <h2 className="text-lg font-bold text-[var(--color-ink)] mt-6 mb-2">
            第5条 規約の変更
          </h2>
          <p className="text-sm text-[var(--color-ink-secondary)] mb-4">
            運営者は、必要に応じて本規約を変更することがあります。変更後の規約は、本サービス上での掲載をもって効力が生じるものとします。
          </p>

          <p className="text-sm text-[var(--color-ink-muted)] mt-8">
            制定日：2026年3月
          </p>
        </article>
      </div>
    </div>
  );
}
