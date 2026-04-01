import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー | marupaka",
  description: "marupakaのプライバシーポリシー",
};

export default function PrivacyPage() {
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
            プライバシーポリシー
          </h1>
          <p className="text-sm text-[var(--color-ink-secondary)] mb-4">
            marupaka（以下「本サービス」）は、利用者のプライバシーを尊重し、個人情報の取り扱いについて以下の方針に基づき運営します。
          </p>

          <h2 className="text-lg font-bold text-[var(--color-ink)] mt-6 mb-2">
            1. 収集する情報
          </h2>
          <p className="text-sm text-[var(--color-ink-secondary)] mb-4">
            本サービスでは、以下の情報を収集する場合があります。<br />
            ・メールアドレス・パスワード（アカウント登録時）<br />
            ・OAuthプロバイダー（Google、Apple、X、LINE等）による認証情報<br />
            ・気になるリスト・買った記録等の利用データ
          </p>

          <h2 className="text-lg font-bold text-[var(--color-ink)] mt-6 mb-2">
            2. localStorageの利用
          </h2>
          <p className="text-sm text-[var(--color-ink-secondary)] mb-4">
            本サービスは、認証セッションの維持やユーザー設定の保存のため、ブラウザのlocalStorageを利用します。localStorageに保存されるデータは、お使いのデバイス内にのみ保存され、当該データのみから個人を特定することはできません。
          </p>

          <h2 className="text-lg font-bold text-[var(--color-ink)] mt-6 mb-2">
            3. Google Analytics
          </h2>
          <p className="text-sm text-[var(--color-ink-secondary)] mb-4">
            本サービスでは、利用状況の分析やサービス改善の目的で、Google Analyticsを使用する場合があります。Google Analyticsはクッキーや類似のテクノロジーを用いてデータを収集します。収集されたデータはGoogleのプライバシーポリシーに従って取り扱われます。
          </p>

          <h2 className="text-lg font-bold text-[var(--color-ink)] mt-6 mb-2">
            4. Supabase Auth
          </h2>
          <p className="text-sm text-[var(--color-ink-secondary)] mb-4">
            本サービスの認証機能はSupabase Authを利用しています。メールアドレス、パスワード、OAuth認証情報等はSupabaseのセキュアなインフラストラクチャで管理され、暗号化されて取り扱われます。
          </p>

          <h2 className="text-lg font-bold text-[var(--color-ink)] mt-6 mb-2">
            5. 情報の第三者提供
          </h2>
          <p className="text-sm text-[var(--color-ink-secondary)] mb-4">
            法令に基づく場合を除き、利用者の同意なく個人情報を第三者に提供することはありません。
          </p>

          <h2 className="text-lg font-bold text-[var(--color-ink)] mt-6 mb-2">
            6. お問い合わせ
          </h2>
          <p className="text-sm text-[var(--color-ink-secondary)] mb-4">
            本ポリシーに関するお問い合わせは、本サービスのお問い合わせ窓口までご連絡ください。
          </p>

          <p className="text-sm text-[var(--color-ink-muted)] mt-8">
            制定日：2026年3月
          </p>
        </article>
      </div>
    </div>
  );
}
