# Shortly

A Bitly-style URL shortener with click analytics. Paste a long URL, get a short code, share it. Every visit is logged (time, country, device, browser, OS). A private dashboard shows stats per link.

Built as a single **Next.js** app: UI, APIs, and redirects in one project.

---

## What it does

1. You sign in (Clerk).
2. You paste a long URL on the dashboard.
3. The server creates a unique short code, stores the link in **Neon (Postgres)**, and caches `code → URL` in **Upstash Redis**.
4. Anyone who opens `https://your-domain/<code>` is **302-redirected** to the original URL. No login required.
5. After the redirect, a click row is written (does not delay the redirect).
6. You open **Analytics** for that link: totals, charts (time / country / device / browser), and a recent-clicks table.

Country on **localhost** is usually **Unknown**. Vercel sends `x-vercel-ip-country` only in production.

---

## How a click works

```
Visitor → GET /abc123
       → Redis lookup (fallback: Neon, then refill Redis)
       → 302 to original URL
       → after() logs click: time, country, UA (device/browser/OS), referrer
```

Redis keys use the prefix `urlshortener:` so this app can share an Upstash database with another project without colliding.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| App | Next.js 16 (App Router) + TypeScript | UI + APIs + redirects, one deploy |
| UI | Tailwind CSS, neo-brutalist design | Thick borders, lime / cream / hot red |
| Fonts | Archivo Black (headlines), Space Grotesk (UI), IBM Plex Mono (URLs) | |
| Auth | Clerk | Sign in / sign up, sessions, password hashing |
| Database | Neon Postgres + Drizzle ORM | Links + click history + dashboard queries |
| Cache | Upstash Redis | Fast short-code lookup on serverless |
| Rate limits | `@upstash/ratelimit` | 10 creates / min / IP, 120 redirects / min / IP |
| Charts | Recharts | Clicks over time, country, device, browser |
| Hosting (intended) | Vercel | Free HTTPS; geo headers for country |

**Not in the browser:** `DATABASE_URL`, Upstash token, `CLERK_SECRET_KEY`. Those live in `.env.local` / Vercel env. Only Clerk’s **publishable** key is public (`NEXT_PUBLIC_…`).

---

## Features

- Unique 7-character codes (`nanoid`, alphanumeric)
- URL validation: `http`/`https` only; blocks `javascript:`, `data:`, private/localhost hosts
- Ownership: each link stores Clerk `user_id`; list/stats are yours only
- Public redirects (Bitly-style)
- Analytics: country, device, browser, OS, time
- Rate limiting on create and redirect
- CSS 3D hero on the landing page (no WebGL — works in Brave)

---

## Project structure

```
app/
  page.tsx                 Landing
  layout.tsx               Clerk + fonts
  icon.png                 Favicon (lime S)
  [code]/route.ts          Redirect + click log
  dashboard/page.tsx       Shorten + your links
  dashboard/[id]/page.tsx  Per-link analytics
  api/links/route.ts       GET list, POST create (auth)
  api/links/[id]/route.ts  GET stats (auth)
  sign-in/  sign-up/       Clerk pages
components/                Header, forms, charts, 3D hero
lib/
  db/                      Drizzle schema + Neon client
  links.ts                 Create, resolve, stats
  redis.ts                 Upstash client + key prefix
  auth.ts                  requireUserId()
  url.ts                   URL validation
  rate-limit.ts
  request-meta.ts          IP, country, User-Agent
middleware.ts              Clerk session on pages + APIs
```

### Data model (Neon)

**`links`:** `id`, `code` (unique), `original_url`, `user_id`, `created_at`

**`clicks`:** `id`, `link_id`, `clicked_at`, `country`, `device`, `browser`, `os`, `referrer`

---

## How it was built (phases)

| Phase | What |
|---|---|
| **0** | Accounts: Node.js, Neon (Singapore), Upstash Redis, Clerk |
| **1** | Next.js foundation, Drizzle schema, Redis ping, secrets gitignored |
| **2** | Create API, redirect, click logging, validation, rate limits |
| **3** | Clerk login; links owned by user; dashboard + analytics pages |
| **4** | Brutalist UI, landing 3D, Recharts, Space Grotesk, custom favicon |
| **5** | Deploy to Vercel (not done until you ship) |

---

## Local setup

**Need:** Node.js 20+, Neon pooled `DATABASE_URL`, Upstash REST URL + token, Clerk test keys.

```bash
npm install
copy .env.example .env.local
```

Fill `.env.local` (never commit it):

```
DATABASE_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

In Clerk, allow `http://localhost:3000`.

```bash
npm run db:push        # create links + clicks tables
npm run verify:infra   # Neon + Redis check
npm run dev            # http://localhost:3000
```

Redis keys are prefixed `urlshortener:`. Sharing one Upstash DB with another app is OK if that app never runs `FLUSHALL`.

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server (port 3000) |
| `npm run build` | Production build |
| `npm run db:push` | Push Drizzle schema to Neon |
| `npm run verify:infra` | Test Neon tables + Redis SET/GET |
| `npm run lint` | ESLint |

---

## Security (what’s already in the app)

- Secrets only on the server; `lib/db` and `lib/redis` use `server-only`
- Dashboard APIs require Clerk; `userId` is never taken from the request body
- Stats queries filter `links.user_id = current user`
- Zod + URL sanitization
- Parameterized queries (Drizzle)
- React escapes user text (no `dangerouslySetInnerHTML`)
- Generic API error messages (no stack traces to the client)
- Clerk: hashed passwords, httpOnly session cookies, login protections

**Before production:** keep `.env.local` out of git, set Vercel env vars, use Clerk **live** keys on the live domain, set function region to **Singapore**, add security headers, `npm audit`. Optional: Postgres RLS, extra bot/CAPTCHA.

There is **no public database key**. Neon is server-only (not a Supabase anon-key setup).

---

## Deploy (Vercel)

1. Push to GitHub **without** `.env.local`.
2. Import the repo in Vercel.
3. Add the same env vars. Set `NEXT_PUBLIC_APP_URL` to `https://your-app.vercel.app`.
4. Functions region: **Singapore (`sin1`)** to sit next to Neon.
5. Clerk: add the Vercel URL; use `pk_live_` / `sk_live_` for production.
6. HTTPS is automatic. Country codes work after this deploy.

---

## Notes

- Short codes that collide with `api`, `dashboard`, etc. are reserved.
- Old links created **before** login have `user_id` null and will not appear in the dashboard; they still redirect.
- The landing “3D” panel is CSS 3D (tilt on hover), not WebGL, so it works when Brave blocks canvas WebGL.
