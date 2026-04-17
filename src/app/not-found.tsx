import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl font-light text-[var(--color-brand)]">404</h1>
        <p className="mt-4 text-lg font-medium text-[var(--color-ink)]">
          ページが見つかりません
        </p>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-[var(--color-brand)] px-6 py-3 font-medium text-white hover:opacity-90 transition"
        >
          トップに戻る
        </Link>
      </div>
    </div>
  );
}
