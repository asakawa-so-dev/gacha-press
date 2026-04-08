import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = requestUrl.searchParams.get("next") ?? "/mypage";

  const redirectTo = new URL(next, requestUrl.origin);

  if (!token_hash || !type) {
    redirectTo.searchParams.set("error", "missing_params");
    return NextResponse.redirect(redirectTo);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash, type });

  if (error) {
    redirectTo.searchParams.set("error", "auth");
    return NextResponse.redirect(redirectTo);
  }

  return NextResponse.redirect(redirectTo);
}
