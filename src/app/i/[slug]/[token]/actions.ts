"use server";

import { getGuest, getInvitation } from "@/lib/getInvitation";
import { db } from "@/lib/supabase";

// Saves a guest's RSVP in the database. A Server Action: the RSVP form calls
// it like a normal function, but it runs on the server, so the secret key
// never reaches the phone.
//
// Never trust what the browser sends: everything is checked again here,
// and the guest's name comes from our own data, not from the form.

export type SaveResult = { ok: true } | { ok: false; error: "invalid" | "server" };

export async function saveRsvp(input: {
  slug: string;
  token: string;
  answer: string;
  count: number;
  message: string;
}): Promise<SaveResult> {
  const inv = getInvitation(input.slug);
  const guest = inv && getGuest(inv, input.token);
  if (!inv || !guest) return { ok: false, error: "invalid" };

  const answer = input.answer === "yes" || input.answer === "no" ? input.answer : null;
  const count = answer === "yes" ? Math.trunc(Number(input.count)) : 0;
  const message = String(input.message ?? "").trim().slice(0, 1000);
  if (!answer || (answer === "yes" && !(count >= 1 && count <= inv.rsvpMax))) {
    return { ok: false, error: "invalid" };
  }

  // One reply per personal link: a second reply updates the same row.
  const { error } = await db().from("rsvps").upsert(
    {
      invitation_slug: inv.slug,
      guest_token: guest.token,
      name: guest.name.en,
      answer,
      count,
      message,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "invitation_slug,guest_token" },
  );

  if (error) {
    console.error("saveRsvp failed:", error.message);
    return { ok: false, error: "server" };
  }
  return { ok: true };
}
