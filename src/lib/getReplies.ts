import "server-only";
import { demoInvited, demoReplies } from "@/data/demo/rami-lea-replies";
import { db } from "./supabase";
import type { Invitation, RsvpReply } from "./types";

// Everything the couple's dashboard needs about the guests: who is invited
// and who replied. Replies come from the database (saved by the RSVP form).
//
// DEMO: for the pitch, made-up replies are added so the dashboard is never
// empty. A real reply from the database always wins over a demo one for the
// same guest. Remove the demo part for a real client.

export type InvitedGuest = { token: string; name: string; seats: number };

type Row = {
  guest_token: string | null;
  name: string;
  answer: "yes" | "no";
  count: number;
  message: string;
  updated_at: string;
};

export async function getReplies(inv: Invitation): Promise<{
  invited: InvitedGuest[];
  replies: RsvpReply[];
}> {
  const isDemo = inv.slug === "rami-lea";

  const invited: InvitedGuest[] = [
    ...inv.guests.map((g) => ({ token: g.token, name: g.name.en, seats: g.seats })),
    ...(isDemo ? demoInvited : []),
  ];

  // If the database cannot be reached (or has no keys), show what we have
  // rather than crash.
  let rows: Row[] = [];
  try {
    const { data, error } = await db()
      .from("rsvps")
      .select("guest_token, name, answer, count, message, updated_at")
      .eq("invitation_slug", inv.slug)
      .order("updated_at", { ascending: true })
      .returns<Row[]>();
    if (error) throw new Error(error.message);
    rows = data ?? [];
  } catch (e) {
    console.error("getReplies failed:", e instanceof Error ? e.message : e);
  }

  const real: RsvpReply[] = rows.map((r) => ({
    token: r.guest_token ?? undefined,
    name: r.name,
    answer: r.answer,
    count: r.count,
    message: r.message,
    repliedAt: r.updated_at,
  }));

  const answered = new Set(real.map((r) => r.token).filter(Boolean));
  const demo = isDemo ? demoReplies.filter((r) => !r.token || !answered.has(r.token)) : [];

  return { invited, replies: [...demo, ...real] };
}
