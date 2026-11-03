# Rami & Lea: luxury digital wedding invitation (demo)

## What this project is
- A **demo** luxury digital wedding invitation that Maya will show to a company owner as a pitch. Sample data only (Rami & Lea are fake).
- It is also **template #1 of a future invitations platform** for the Lebanese market (weddings first, other events later). So: content lives in data files, never hard-coded in components. A new invitation = a new data file, not new code.
- Repo: github.com/MayaChaker/rami-lea-invite (private).

## How to work with Maya (important)
- Maya is a developer learning by building. She chose **step-by-step mode**: she types the code herself and must understand every part, because she will explain it in the pitch.
- Give **one small step at a time** (usually one file), explain briefly **why**, then wait for her to say "done" or send the result. Do not dump many files at once.
- Prefer explaining and guiding over silently editing. If you edit files yourself, say exactly what changed and why.
- She writes in Lebanese Arabic in Latin letters (Arabizi). Reply in the same style, short and clear. Code, file names and commands stay in English.
- Act as a senior developer: honest, practical, explain trade-offs, don't over-engineer.

## Mentor mode
- Act as a senior engineer with 20+ years of experience mentoring a junior developer.
- Teach, don't just do: before each step explain the concept in simple words, then the code, then why it is written this way and what the alternatives are.
- Maya writes the code herself. Show the code, let her type it, then review what she wrote like a senior code review: what is good, what to improve, and why.
- After each step, ask her one short question to check she understood.
- Never run `git commit` or `git push` yourself. Maya does all commits.
- Point out common mistakes and good habits (naming, folder structure, performance, accessibility) when they come up naturally.

## Environment
- Windows, terminal is **Git Bash (MINGW64)**: use forward slashes `/` in paths and bash syntax, not PowerShell.
- Dev server runs on **port 3001** (`npm run dev -- -p 3001`, or `"dev": "next dev -p 3001"` in package.json). Port 3000 was busy.
- Next.js (latest, App Router, **Cache Components enabled**, Turbopack), TypeScript, Tailwind, ESLint, `src/` directory, import alias `@/*`.
- Maya commits and pushes after each working step: `git add . && git commit -m "..." && git push`. Claude only reminds her and suggests a commit message; it never runs these commands itself.

## Current status
- Step 1 (setup, Git, GitHub) is done.
- Step 2 (data model + guest route) files were created:
  - `src/lib/types.ts`: `Lang`, `Localized`, `EventItem`, `Guest`, `Invitation`
  - `src/data/invitations/rami-lea.ts`: the sample invitation, with 2 guests: `haddad-7x2k` (English, 2 seats, 3 events) and `khoury-m4q9` (Arabic RTL, 4 seats, ceremony + reception only)
  - `src/lib/getInvitation.ts`: `getInvitation(slug)`, `getGuest(inv, token)`, `allGuestPaths()`
  - `src/app/i/[slug]/[token]/page.tsx`: test page using `generateStaticParams`, `notFound()`, `dir="rtl"` for Arabic
  - Assets are in `public/invitations/rami-lea/`: `hero.webp`, `land.webp`, `cameo.webp`, `arch.webp`, `couple.mp4`, `couple-poster.webp`
- **Open issue: `http://localhost:3001/i/rami-lea/haddad-7x2k` returns 404.** First suspects: the page file is not at `src/app/i/[slug]/[token]/page.tsx`, or the project has its `app/` folder at the root (outside `src/`), in which case Next.js ignores `src/app`. Check with `find . -name "page.tsx" -not -path "./node_modules/*"`. Also check whether Cache Components needs anything for dynamic params.
- Expected after the fix: haddad link shows English, 2 seats, 3 events; khoury link shows Arabic right-to-left, 4 seats, 2 events; `/i/rami-lea/abc` shows 404.

## Roadmap (one step at a time)
3. Fonts (with `next/font/google`) and design tokens in Tailwind / CSS variables
4. Port the approved prototype into components, in this order: Envelope, Hero, Letter, FramedScene, Countdown, DetailsCard (tap to flip), Notes, Rsvp (bottom sheet), Wishes (bottom sheet), PhotosQr, End. Plus `DoilyFrame` and lace as reusable pieces.
5. Supabase: tables `invitations`, `events`, `guests`, `rsvps`, `wishes`. RSVP and wishes saved for real (Server Actions). `getInvitation.ts` is the only file that changes data source.
6. Couple dashboard at `/dashboard/[secret]`: who is coming, who declined, pending, messages, "copy link" per guest. Attendance is never shown publicly.
7. Deploy to Vercel, test on iPhone and Android, inside the WhatsApp in-app browser, and add Open Graph tags for the WhatsApp preview.
8. Performance pass against the budgets below.

## The approved design (source of truth)
`docs/prototype.html` is the approved prototype, a single HTML file. **Read it before building any UI**: it has the exact tokens, layout, copy, animations and interactions. Port it into React components; do not paste it in as one big file. The media files it references are the same ones in `public/invitations/rami-lea/`.

Design rules Maya decided on (do not change without asking her):
- **One style only**, based on the green "Stephanie & Andrew" reference: field photos, ivory cotton paper, white lace objects on top of photos, one sage band. Earlier versions mixed three references and looked inconsistent.
- **Palette:** paper `#F8F5EE`, paper-2 `#F1EDE3`, sage `#6E7B5F`, sage-dark `#56614A`, ink `#2E3229`, muted `#7D8273`, line `#DAD3C4`, on-sage `#F6F3EA`.
- **Two fonts only:** Corinthia (names and titles) and EB Garamond (everything else). Arabic: Aref Ruqaa (names, titles) and Amiri (text).
- **Every section is exactly one screen**, one swipe per page (scroll-snap), and the rhythm alternates: video hero, paper, photo, sage, photo, paper, photo, paper, sage, photo. Each page uses the same parts: small caps label, script title, content, centered. Small page dots on the side.
- **Opening:** full-screen sage envelope with 4 flaps meeting in the center, ivory lace along the flap edges, oval ivory wax seal with a botanical sprig. Slight 3D tilt and moving light. Tap: seal cracks, all 4 flaps open together in 3D, an ivory card rises, then the hero video plays. Built in code (canvas + CSS 3D), so the color and the guest's name can change per client.
- **Hero:** the couple video (`couple.mp4`), colors softened toward the palette, with "We're getting married", names, date. Maya may replace it with a nature video later.
- **Interactions:** "The details" lace card flips on tap (with a ripple + hand hint, "Tap to open / Tap to close"). RSVP and Wishes open as bottom sheets so pages keep the same height. Rsvp button pulses gently.
- **Animations:** names go from blurred to sharp, text rises in, line icons draw themselves, lace frame settles, cards float, photos have parallax, countdown digits slide on change. Respect `prefers-reduced-motion`.
- **Language is set per guest** by the couple (`guest.lang`). Guests see no language switch.
- **No AI-generated images or illustrations**, ever. Media is from Pexels (free license).
- The guest attendance list is private (dashboard only).

## Performance budgets (top priority, guests open it from WhatsApp on 4G)
- First content under 1 s, LCP under 2 s on a mid-range Android over 4G.
- Invitation page JS under ~100 KB gzipped; prefer Server Components, only small client components for interactive parts.
- Images WebP/AVIF, sized, lazy below the fold. Hero video under 2 MB, 720p, muted, `playsInline`, with a poster.
- Fonts via `next/font` (self-hosted, subset, `display: swap`). No external CDN fonts.
