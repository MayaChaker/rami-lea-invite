import {ramiLea} from "@/data/invitations/rami-lea";
import type {Invitation, Guest} from "./types";
const invitations:Invitation[] = [ramiLea];
export function getInvitation(slug: string):Invitation | undefined{
    return invitations.find((i) => i.slug ===slug);
}
export function getGuest(inv: Invitation, token: string): Guest | undefined {
  return inv.guests.find((g) => g.token === token);
}

export function allGuestPaths() {
  return invitations.flatMap((i) =>
    i.guests.map((g) => ({ slug: i.slug, token: g.token }))
  );
}
