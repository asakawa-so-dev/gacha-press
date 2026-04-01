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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-md mx-4 mb-0 sm:mb-0 rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden animate-slide-up-modal">
        {/* Progress bar */}
        <div className="flex gap-2 px-6 pt-5">
          <div className="h-1 flex-1 rounded-full bg-[#3daae0]" />
          <div className={`h-1 flex-1 rounded-full transition-colors duration-500 ${step === 2 ? "bg-[#3daae0]" : "bg-[#e4e4ea]"}`} />
        </div>

        <div className="px-6 pt-5 pb-8">
          {step === 1 ? (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#3daae0]/10">
                  <span className="text-2xl">🎯</span>
                </div>
                <h2 className="text-lg font-bold text-[#1c1c28]">性別を教えてください</h2>
                <p className="mt-1 text-sm text-[#9b9bab]">あなたにピッタリのガチャをおすすめします</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {GENDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGender(opt.value)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all duration-300 active:scale-[0.97] ${
                      gender === opt.value
                        ? "border-[#3daae0] bg-[#3daae0]/5 shadow-sm"
                        : "border-[#e4e4ea] hover:border-[#9b9bab]"
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className={`text-sm font-bold transition-colors duration-300 ${gender === opt.value ? "text-[#3daae0]" : "text-[#1c1c28]"}`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={!gender}
                onClick={() => setStep(2)}
                className="mt-6 w-full rounded-xl bg-[#3daae0] px-4 py-3.5 font-bold text-white hover:bg-[#2888c0] disabled:opacity-40 transition-all duration-300 active:scale-[0.98]"
              >
                つぎへ
              </button>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#ec4899]/10">
                  <span className="text-2xl">🎂</span>
                </div>
                <h2 className="text-lg font-bold text-[#1c1c28]">年代を教えてください</h2>
                <p className="mt-1 text-sm text-[#9b9bab]">同年代のトレンドがわかります</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {AGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAgeGroup(opt.value)}
                    className={`rounded-2xl border-2 px-3 py-3.5 text-center transition-all duration-300 active:scale-[0.97] ${
                      ageGroup === opt.value
                        ? "border-[#ec4899] bg-[#ec4899]/5 shadow-sm"
                        : "border-[#e4e4ea] hover:border-[#9b9bab]"
                    }`}
                  >
                    <span className={`text-sm font-bold transition-colors duration-300 ${ageGroup === opt.value ? "text-[#ec4899]" : "text-[#1c1c28]"}`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border-2 border-[#e4e4ea] px-5 py-3.5 font-bold text-[#5c5c6f] transition-all duration-300 hover:bg-[#f5f5f7]"
                >
                  もどる
                </button>
                <button
                  type="button"
                  disabled={!ageGroup || saving}
                  onClick={handleSave}
                  className="flex-1 rounded-xl bg-[#3daae0] px-4 py-3.5 font-bold text-white hover:bg-[#2888c0] disabled:opacity-40 transition-all duration-300 active:scale-[0.98]"
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
