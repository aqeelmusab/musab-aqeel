# Musab Aqeel

Personal portfolio and case-study site. Next.js 16 App Router with Vercel-style static output, plus motion via GSAP, Motion (formerly Framer Motion), and Lenis.

## Stack

- **Next.js 16** App Router, Turbopack build, React 19
- **TypeScript** strict mode, `@/` path alias at repo root
- **GSAP** scroll-triggered reveals, intro choreography, cursor/logo micro-animations
- **Motion** layout transitions, magnetic buttons, mobile menu clip-path, cursor springs
- **Lenis** smooth wheel scroll on desktop (native touch on mobile)
- **Tailwind CSS 4** plus a small hand-written layer in `globals.css`
- **Vitest** for domain tests (contact pipeline for now)
- **Proxy** (Next 16’s renamed middleware) for per-request CSP nonces
- **CI and git hooks** keep the lockfile honest and run the full verify pipeline

## Getting started

### Requirements

- **Node.js 24.x** everywhere: deploy, local dev, and CI (`package.json#engines`, `.nvmrc`, `.node-version`)
- **pnpm** version pinned in `packageManager`, enforced with [Corepack](https://nodejs.org/api/corepack.html)

Pinning pnpm stops “works on my machine” lockfile churn from different package managers resolving deps differently. Enable Corepack once per machine; after that `pnpm` in this repo uses that pin.

Node is pinned at the major so local matches hosts like Vercel (`24.x`) without chasing patch drift.

### Install

```bash
fnm use            # or nvm use, asdf shell nodejs 24, etc.
corepack enable    # one-time; picks up packageManager
pnpm install       # postinstall wires the pre-push hook
```

### Environment

Copy `.env.example` to `.env.local` and fill what you need:

```bash
CONTACT_WEBHOOK_URL=         # Make.com / Zapier / Discord webhook for contact
UPSTASH_REDIS_REST_URL=      # Optional: shared rate limit for contact
UPSTASH_REDIS_REST_TOKEN=    # Optional: shared rate limit for contact
NEXT_PUBLIC_SITE_URL=https://musabaqeel.com
```

Optional vars:

- **`CONTACT_WEBHOOK_URL`** In dev, unset means the route still returns success but doesn’t forward. In production, unset returns `503 service_unavailable` so nothing gets dropped quietly.
- **`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`** Nice to have in prod. With them, rate limiting hits Upstash Redis across serverless instances. Without, it falls back to in-memory per instance.
- **`NEXT_PUBLIC_SITE_URL`** Defaults to `https://musabaqeel.com` in `lib/config.ts`. Change only if your deploy origin differs.

### Run locally

```bash
pnpm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                  | Purpose                                                             |
| ----------------------- | ------------------------------------------------------------------- |
| `pnpm run dev`          | Dev server with HMR (Turbopack)                                     |
| `pnpm run build`        | Production build                                                    |
| `pnpm run start`        | Serve the production build                                          |
| `pnpm run lint`         | ESLint (flat config)                                                |
| `pnpm run typecheck`    | `tsc --noEmit`                                                      |
| `pnpm run test`         | Vitest run                                                          |
| `pnpm run verify`       | format check + lint + typecheck + test + build (what CI runs)      |
| `pnpm run format`       | Biome format write                                                  |
| `pnpm run format:check` | Biome format check                                                  |

## Project structure

```text
app/                     Routes, layouts, metadata, OG/Twitter images,
                         robots + sitemap, contact handler
components/
  layout/                Nav shell, hamburger, main-wrapper reveal (intro handoff)
    nav/                 Desktop + mobile nav (hooks, pieces)
  sections/              Home: Hero, Work, Process, About, Contact, …
  ui/
    cursor/              Custom cursor (hook, visuals, constants)
    intro/               Short splash: morph text, counter, SVG defs
    reveal/              Scroll reveals: SplitText, RevealText,
                         DustFilterSvg, shared text-animation hook,
                         ScrollTrigger cleanup hook
    …                    Primitives: BackButton, HamburgerIcon, Logo,
                         MagneticButton, Tag, CustomCursor, Intro
  work/                  Case-study layout + ProjectCard
lib/
  contact/               Validation, abuse checks, webhook, tests
  project-data/          One module per project
  …                      Config, motion tokens, smooth-scroll helpers,
                         social images, structured data, intro/lenis
                         providers, scroll helpers, media-query hooks
public/                  Favicons, fonts (Clash Display / Satoshi /
                         Fragment Mono), project images
types/                   Shared TS types + re-exports
proxy.ts                 Nonced CSP + security headers (used to be
                         middleware.ts before Next 16)
.githooks/pre-push       Lockfile check; enabled by postinstall
.github/workflows/ci.yml Lint + typecheck + test + build on PR/push
```

## Notable systems

- **Intro** (`components/ui/Intro.tsx`, `lib/IntroContext.tsx`): ~3s splash on first load. Role words morph (Developer / Architect / Operator) through an SVG alpha filter mounted at the body (`IntroFilterDefs`) so Safari behaves. Counter animates in with per-character stagger. Exit moves the panel with `yPercent: -105` and lifts the wrapper in parallel; no clip-path, fewer browser headaches.

- **Custom cursor** (`components/ui/cursor/`): dot + ring follower with loose springs, `mix-blend-difference`, state from `data-cursor` and DOM walks. Click ripples use captured coords and fixed size/color; timers clean them up.

- **Text reveal** (`components/ui/reveal/`): `SplitText` word slides, `RevealText` fade/slide, shared scroll wiring in `text-animation.ts`. Optional `DustFilterSvg` distortion turns off on coarse pointers to spare mobile GPUs.

- **Smooth scroll** (`lib/SmoothScroll.tsx`, `lib/smooth-scroll-helpers.ts`): Lenis on desktop wheel, native touch (`syncTouch: false`). `lib/scroll-navigation.ts` defaults programmatic scrolls to a bouncy `scrollEaseOut`. Nested scroll areas opt out with `data-lenis-prevent`.

- **Contact** (`lib/contact/`): honeypot, timing guard, Upstash-backed rate limit when configured (in-memory fallback otherwise), strict validation, then webhook. `contact.test.ts` exercises the path end to end.

- **Social images** (`lib/social-image.tsx`): `next/og` for `/opengraph-image`, `/twitter-image`, and per-project OG routes.

- **Structured data** (`lib/structured-data.ts`): Person + WebSite + CreativeWork JSON-LD at the layout root.

## Lockfile hygiene

- Default to `pnpm install`. If it changes `pnpm-lock.yaml`, commit that with the `package.json` change that caused it.

- CI and pre-push run `pnpm install --frozen-lockfile`. If the lockfile doesn’t match `package.json`, run `pnpm install`, commit `pnpm-lock.yaml`, push again.

## Deployment

No vendor-specific config: plain Next.js 16. Anything that can run `next start` on Node 24 is fine. `proxy.ts` runs as expected on Vercel-style setups.
