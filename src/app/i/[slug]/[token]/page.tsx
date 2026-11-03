import { notFound } from "next/navigation";
import { getInvitation, getGuest, allGuestPaths } from "@/lib/getInvitation";

export function generateStaticParams() {
  return allGuestPaths();
}

export default async function GuestInvitation({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const inv = getInvitation(slug);
  const guest = inv && getGuest(inv, token);
  if (!inv || !guest) notFound();

  const L = guest.lang;
  const myEvents = inv.events.filter((e) => guest.events.includes(e.id));

  return (
    <main dir={L === "ar" ? "rtl" : "ltr"} style={{ padding: 32 }}>
      <p>{guest.name[L]}</p>
      <h1>
        {inv.couple.groom[L]} & {inv.couple.bride[L]}
      </h1>
      <p>{guest.seats} seats</p>
      <ul>
        {myEvents.map((e) => (
          <li key={e.id}>
            {e.label[L]} · {e.time[L]} · {e.place[L]}
          </li>
        ))}
      </ul>
    </main>
  );
}