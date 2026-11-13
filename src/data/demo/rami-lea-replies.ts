import type { RsvpReply } from "@/lib/types";

// DEMO ONLY: made-up replies, so the couple's dashboard has something to show
// in the pitch. Step 5 replaces this file with real replies from Supabase,
// read in src/lib/getReplies.ts (the only file that changes).

// More invited guests than the two with a sample invitation page, so the
// dashboard looks like a real wedding. Same shape as Guest, English names only.
export const demoInvited = [
  { token: "saad-p2v8", name: "The Saad Family", seats: 5 },
  { token: "azar-k7n3", name: "Mr & Mrs Azar", seats: 2 },
  { token: "fares-w4d1", name: "Nadine Fares", seats: 1 },
  { token: "mansour-j9t6", name: "The Mansour Family", seats: 4 },
  { token: "rizk-c3h5", name: "Karim & Maya Rizk", seats: 2 },
  { token: "chidiac-x8m2", name: "The Chidiac Family", seats: 3 },
  { token: "nader-q5r7", name: "Rita Nader", seats: 1 },
  { token: "hanna-b1z4", name: "The Hanna Family", seats: 6 },
];

export const demoReplies: RsvpReply[] = [
  {
    token: "haddad-7x2k",
    name: "The Haddad Family",
    answer: "yes",
    count: 2,
    message: "We wouldn’t miss it for the world. Mabrouk!",
    repliedAt: "2027-03-02T19:14:00+02:00",
  },
  {
    token: "saad-p2v8",
    name: "The Saad Family",
    answer: "yes",
    count: 5,
    message: "",
    repliedAt: "2027-03-04T10:02:00+02:00",
  },
  {
    token: "azar-k7n3",
    name: "Mr & Mrs Azar",
    answer: "no",
    count: 0,
    message: "We’ll be abroad that week, so sorry. Wishing you a lifetime of happiness.",
    repliedAt: "2027-03-05T21:40:00+02:00",
  },
  {
    token: "fares-w4d1",
    name: "Nadine Fares",
    answer: "yes",
    count: 1,
    message: "Can’t wait to dance at the zaffé!",
    repliedAt: "2027-03-07T13:25:00+02:00",
  },
  {
    token: "rizk-c3h5",
    name: "Karim & Maya Rizk",
    answer: "yes",
    count: 2,
    message: "",
    repliedAt: "2027-03-09T08:51:00+02:00",
  },
  {
    // From the shared link: no token, the guest typed their name
    name: "Joe & Lara Haddad",
    answer: "yes",
    count: 3,
    message: "Thank you for having us, we’re so happy for you both.",
    repliedAt: "2027-03-10T18:07:00+02:00",
  },
];
