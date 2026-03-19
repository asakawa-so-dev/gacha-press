import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-alt)] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#3daae0]">404</h1>
        <p className="mt-4 text-xl font-medium text-[var(--color-ink)]">
          ページが見つかりません
        </p>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-[#3daae0] px-6 py-3 font-medium text-white hover:bg-[#2888c0] transition"
        >
          トップに戻る
        </Link>
      </div>
    </div>
  );
}
