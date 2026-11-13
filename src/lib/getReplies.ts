import { demoInvited, demoReplies } from "@/data/demo/rami-lea-replies";
import type { Invitation, RsvpReply } from "./types";

// Everything the couple's dashboard needs about the guests.
// Today it reads demo data. Step 5 (Supabase) changes only this file: the
// replies and the guest list will come from the database instead.

export type InvitedGuest = { token: string; name: string; seats: number };

export async function getReplies(inv: Invitation): Promise<{
  invited: InvitedGuest[];
  replies: RsvpReply[];
}> {
  const invited: InvitedGuest[] = [
    ...inv.guests.map((g) => ({ token: g.token, name: g.name.en, seats: g.seats })),
    ...(inv.slug === "rami-lea" ? demoInvited : []),
  ];
  const replies = inv.slug === "rami-lea" ? demoReplies : [];
  return { invited, replies };
}
