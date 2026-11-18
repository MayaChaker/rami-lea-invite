# Rami & Lea — Digital Wedding Invitation

A wedding invitation that opens like a real envelope. Each guest gets a private link that shows their own name, language, seats and the events they are invited to.

**Live demo**

- Invitation: https://rami-lea.vercel.app/
- Couple's dashboard: https://rami-lea.vercel.app/dashboard (password on request)

> This is a demo with sample names, and it is still in progress.

| Envelope | Opening | Letter | Details | Reply |
| --- | --- | --- | --- | --- |
| ![The sealed envelope](docs/screenshots/envelope.webp) | ![The opening scene with the couple's video](docs/screenshots/hero.webp) | ![The letter naming both families](docs/screenshots/letter.webp) | ![The event details card](docs/screenshots/details.webp) | ![The reply card](docs/screenshots/rsvp.webp) |

## Features

**For guests**

- A tap-to-open envelope, with a skip button.
- Their own name, language (English or Arabic), seats and events.
- The couple's video, a letter, a live countdown and the event details with a map link.
- A reply form, practical notes, gift details that copy with one tap, and a QR code to the shared photo album.

**For each new invitation**

- A new data file instead of new code.
- Optional sections, such as gifts and the album, disappear when left out.
- A WhatsApp link preview in the guest's language.
- Guest pages ask search engines not to list them.

**For the couple**

- A private dashboard behind a password: who is coming, who declined, who has not replied yet, and the notes guests left.

## How it works

- Next.js pre-builds one page per guest at `/i/[slug]/[token]`. The unguessable token in the link decides which guest's name, language and seats are shown, so guests need no sign-in.
- Everything about an invitation (names, dates, media, events and guests) lives in one file in `src/data/invitations/`. The components only read it.
- The home page is a shared link for a group chat: every event is listed, and guests write their own name when they reply.
- Replies are saved in Supabase by a Server Action, which checks everything again on the server. The database key never reaches the browser.
- The envelope and lace are drawn on canvas, and the animations respect the reduced-motion setting.

## Tech stack

Next.js (App Router) · React · TypeScript · CSS Modules · Canvas · Supabase · `qrcode` · Vitest · Playwright · Vercel

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run dev   # http://localhost:3001
```

Open `http://localhost:3001/` (the shared link) or a guest page such as `http://localhost:3001/i/rami-lea/haddad-7x2k`.

Replies and the dashboard need a `.env.local` file:

```bash
SUPABASE_URL=...
SUPABASE_SECRET_KEY=...
DASHBOARD_PASSWORD=...
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3001 |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests in a real browser (Playwright), with a fake database |

## What's next

- Run the tests and a speed budget on every pull request.
- Faster first opening on slow mobile networks.

## Author

Built by [Maya Chaker](https://maya-chaker-portfolio.vercel.app).
