"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, COOKIE_DAYS, checkPassword, sessionValue } from "@/lib/dashboardAuth";
import { allow } from "@/lib/rateLimit";

export type SignInState = { error: boolean; tooMany?: boolean };

// Sign in to the dashboard: check the password, keep the couple signed in
// with a cookie the page's JavaScript cannot read (httpOnly).
export async function signIn(_: SignInState, form: FormData): Promise<SignInState> {
  // At most 10 attempts per 15 minutes from one visitor (src/lib/rateLimit.ts):
  // guessing the password would take years.
  if (!(await allow("login"))) return { error: true, tooMany: true };

  const typed = String(form.get("password") ?? "");
  if (!checkPassword(typed)) {
    // A short pause makes guessing many passwords slow.
    await new Promise((r) => setTimeout(r, 800));
    return { error: true };
  }

  (await cookies()).set(COOKIE, sessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/dashboard",
    maxAge: COOKIE_DAYS * 24 * 60 * 60,
  });
  redirect("/dashboard");
}
