"use server";

import { getGuest, getInvitation } from "@/lib/getInvitation";
import { allow } from "@/lib/rateLimit";
import { db } from "@/lib/supabase";

// Saves an RSVP in the database. A Server Action: the RSVP form calls it like
// a normal function, but it runs on the server, so the secret key never
// reaches the phone. Never trust what the browser sends: everything is
// checked again here.
//
// Two kinds of reply:
// - personal link (`token`): the guest and their name come from our data;
//   one reply per guest, a second one updates the same row.
// - shared link (no token): the guest typed their name; a new row, or the
//   same row again (`id`) when they change their reply.

// "limit": too many new replies from this visitor (see src/lib/rateLimit.ts)
export type SaveResult = { ok: true; id?: string } | { ok: false; error: "invalid" | "server" | "limit" };

const UUID = /^[0-9a-f-]{36}$/i;

export async function saveRsvp(input: {
  slug: string;
  token?: string;
  name?: string;
  id?: string;
  answer: string;
  count: number;
  message: string;
  trap?: string; // the hidden honeypot field: only a bot fills it
}): Promise<SaveResult> {
  const inv = getInvitation(input.slug);
  if (!inv) return { ok: false, error: "invalid" };

  // A bot filled the field no person can see: tell it all went well, save nothing.
  if (input.trap) return { ok: true };

  const answer = input.answer === "yes" || input.answer === "no" ? input.answer : null;
  const count = answer === "yes" ? Math.trunc(Number(input.count)) : 0;
  const message = String(input.message ?? "").trim().slice(0, 1000);
  if (!answer || (answer === "yes" && !(count >= 1 && count <= inv.rsvpMax))) {
    return { ok: false, error: "invalid" };
  }
  const reply = { invitation_slug: inv.slug, answer, count, message, updated_at: new Date().toISOString() };

  try {
    // Personal link
    if (input.token) {
      const guest = getGuest(inv, input.token);
      if (!guest) return { ok: false, error: "invalid" };
      const { error } = await db()
        .from("rsvps")
        .upsert({ ...reply, guest_token: guest.token, name: guest.name.en }, { onConflict: "invitation_slug,guest_token" });
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    // Shared link
    const name = String(input.name ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
    if (name.length < 2) return { ok: false, error: "invalid" };

    if (input.id && UUID.test(input.id)) {
      // Changing a reply: only a shared-link row of this invitation
      const { data, error } = await db()
        .from("rsvps")
        .update({ ...reply, name })
        .eq("id", input.id)
        .eq("invitation_slug", inv.slug)
        .is("guest_token", null)
        .select("id");
      if (error) throw new Error(error.message);
      if (data?.length) return { ok: true, id: input.id };
      // Not found (deleted meanwhile): save it as a new reply below.
    }

    // A new row: the only place one visitor could fill the guest list, so it
    // is limited. Changing a reply, or a personal link, never adds rows.
    if (!(await allow("rsvp"))) return { ok: false, error: "limit" };

    const { data, error } = await db()
      .from("rsvps")
      .insert({ ...reply, name, guest_token: null })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: data.id as string };
  } catch (e) {
    console.error("saveRsvp failed:", e instanceof Error ? e.message : e);
    return { ok: false, error: "server" };
  }
}
