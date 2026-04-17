"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const GENDER_OPTIONS = [
  { value: "男", label: "男", icon: "👨" },
  { value: "女", label: "女", icon: "👩" },
  { value: "その他", label: "その他", icon: "🧑" },
] as const;

const AGE_OPTIONS = [
  { value: "10代", label: "10代" },
  { value: "20代", label: "20代" },
  { value: "30代", label: "30代" },
  { value: "40代", label: "40代" },
  { value: "50代", label: "50代" },
  { value: "60代〜", label: "60代〜" },
] as const;

type Props = {
  userId: string;
  onComplete: () => void;
};

export default function OnboardingModal({ userId, onComplete }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [gender, setGender] = useState<string | null>(null);
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("profiles") as any)
      .update({
        gender,
        age_group: ageGroup,
        onboarding_done: true,
      })
      .eq("id", userId);
    setSaving(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-md mx-4 mb-0 sm:mb-0 rounded-t-2xl sm:rounded-2xl bg-white border border-[var(--color-border)] shadow-lg overflow-hidden animate-slide-up-modal">
        {/* Progress bar */}
        <div className="flex gap-2 px-6 pt-5">
          <div className="h-1 flex-1 rounded-full bg-[var(--color-brand)]" />
          <div className={`h-1 flex-1 rounded-full transition-colors duration-500 ${step === 2 ? "bg-[var(--color-brand)]" : "bg-[var(--color-border)]"}`} />
        </div>

        <div className="px-6 pt-5 pb-8">
          {step === 1 ? (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-alt)]">
                  <span className="text-2xl">🎯</span>
                </div>
                <h2 className="text-lg font-medium text-[var(--color-ink)]">性別を教えてください</h2>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">あなたにピッタリのガチャをおすすめします</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {GENDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGender(opt.value)}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                      gender === opt.value
                        ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5"
                        : "border-[var(--color-border)] hover:border-[#BDD8CA]"
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className={`text-sm font-medium transition-colors ${gender === opt.value ? "text-[var(--color-brand)]" : "text-[var(--color-ink)]"}`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={!gender}
                onClick={() => setStep(2)}
                className="mt-6 w-full rounded-lg bg-[var(--color-brand)] px-4 py-3.5 font-medium text-white hover:opacity-90 disabled:opacity-40 transition-all"
              >
                つぎへ
              </button>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-alt)]">
                  <span className="text-2xl">🎂</span>
                </div>
                <h2 className="text-lg font-medium text-[var(--color-ink)]">年代を教えてください</h2>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">同年代のトレンドがわかります</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {AGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAgeGroup(opt.value)}
                    className={`rounded-lg border px-3 py-3.5 text-center transition-all ${
                      ageGroup === opt.value
                        ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5"
                        : "border-[var(--color-border)] hover:border-[#BDD8CA]"
                    }`}
                  >
                    <span className={`text-sm font-medium transition-colors ${ageGroup === opt.value ? "text-[var(--color-brand)]" : "text-[var(--color-ink)]"}`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-[var(--color-border)] px-5 py-3.5 font-medium text-[var(--color-ink-secondary)] transition-all hover:bg-[var(--color-surface-alt)]"
                >
                  もどる
                </button>
                <button
                  type="button"
                  disabled={!ageGroup || saving}
                  onClick={handleSave}
                  className="flex-1 rounded-lg bg-[var(--color-brand)] px-4 py-3.5 font-medium text-white hover:opacity-90 disabled:opacity-40 transition-all"
                >
                  {saving ? "保存中..." : "はじめる"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
