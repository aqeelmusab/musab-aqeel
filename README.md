# Musab Aqeel

Personal portfolio and case-study site — Next.js 16 App Router on Vercel-style static output, with a motion layer built on GSAP, Motion (formerly Framer Motion), and Lenis.

## Stack

- **Next.js 16** App Router, Turbopack build, React 19
- **TypeScript** strict mode, `@/` path alias at repo root
- **GSAP** for scroll-triggered reveals, the intro choreography, and the cursor/logo micro-animations
- **Motion** for layout transitions, magnetic buttons, the mobile menu clip-path, and the cursor springs
- **Lenis** for smooth wheel scroll on desktop (native touch on mobile)
- **Tailwind CSS 4** with a small set of hand-written primitives in `globals.css`
- **Vitest** for focused domain-level tests (contact pipeline today)
- **Proxy** (Next.js 16's renamed middleware) for a per-request nonced CSP
- **CI + Git hooks** enforce lockfile hygiene and the full verify pipeline

## Getting started

### Requirements

- **Node.js 24.15.0** (pinned via `.nvmrc`, `.node-version`, `package.json`, and CI)
- **pnpm** (exact version pinned via `packageManager`, enforced by [Corepack](https://nodejs.org/api/corepack.html))

The pnpm pin avoids lockfile drift caused by different local package managers resolving the dependency graph differently. As long as Corepack is enabled (once per machine), every `pnpm` invocation inside this repo uses the pinned version.

### Install

```bash
nvm use            # or: fnm use, asdf shell nodejs 24.15.0, etc.
corepack enable    # one-time, honours the packageManager pin
pnpm install       # runs the postinstall that wires the pre-push hook
```

### Environment

Copy `.env.example` → `.env.local` and fill in as needed:

```bash
CONTACT_WEBHOOK_URL=         # Make.com / Zapier / Discord webhook for the contact form
NEXT_PUBLIC_SITE_URL=https://musabaqeel.com
```

Both variables are optional:

- `CONTACT_WEBHOOK_URL` — when unset in development the contact route returns success without forwarding. In production it returns `503 service_unavailable` so the submission isn't silently dropped.
- `NEXT_PUBLIC_SITE_URL` — defaults to `https://musabaqeel.com` via `lib/config.ts`. Override only when deploying to a different origin.

### Run locally

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                  | Purpose                                                             |
| ----------------------- | ------------------------------------------------------------------- |
| `pnpm run dev`          | Dev server with HMR (Turbopack)                                     |
| `pnpm run build`        | Production build                                                    |
| `pnpm run start`        | Serve the production build                                          |
| `pnpm run lint`         | ESLint (flat config)                                                |
| `pnpm run typecheck`    | `tsc --noEmit`                                                      |
| `pnpm run test`         | Vitest run                                                          |
| `pnpm run verify`       | format check + lint + typecheck + test + build — same thing CI runs |
| `pnpm run format`       | Prettier write                                                      |
| `pnpm run format:check` | Prettier check                                                      |

## Project structure

```text
app/                     Route segments, layouts, metadata, OG/Twitter images,
                         robots + sitemap, contact route handler
components/
  layout/                Nav shell, hamburger, main-wrapper reveal choreography
    nav/                 Desktop + mobile nav internals (state hooks, pieces)
  sections/              Home-page sections: Hero, Work, Process, About, Contact…
  ui/
    cursor/              Custom cursor system (hook, visual, constants)
    intro/               3 s cosmetic intro — morph text, animated counter, SVG defs
    reveal/              Scroll-triggered text reveals — SplitText, RevealText,
                         DustFilterSvg, shared text-animation hook,
                         ScrollTrigger cleanup hook
    …                    Leaf primitives: BackButton, HamburgerIcon, Logo,
                         MagneticButton, Tag, CustomCursor, Intro
  work/                  Case-study layout primitives and the ProjectCard
lib/
  contact/               Contact pipeline: validation, abuse, webhook, tests
  project-data/          Per-project content modules (one file per project)
  …                      Config, motion tokens, smooth-scroll helpers,
                         social-image generator, structured-data, intro/lenis
                         context providers, scroll-navigation, media-query hooks
public/                  Favicons, fonts (local Clash Display / Satoshi /
                         Fragment Mono), project cover imagery
types/                   Shared TypeScript interfaces + re-exports
proxy.ts                 Per-request nonced CSP + security headers (formerly
                         middleware.ts under Next.js < 16)
.githooks/pre-push       Lockfile-sync gate, auto-enabled by the postinstall
.github/workflows/ci.yml Lint + typecheck + test + build on every PR/push
```

## Notable systems

- **Intro** (`components/ui/Intro.tsx` + `lib/IntroContext.tsx`) — 3 s cosmetic screen on first visit. Three-word role morph (Developer → Architect → Operator) via an SVG alpha-threshold filter kept at the body root (`IntroFilterDefs`) so iOS Safari resolves it reliably. Counter enters SplitText-style with per-character stagger. Exit animation lifts the intro via `yPercent: -105` transform + parallel wrapper rise — no clip-path, safe on every browser.
- **Custom cursor** (`components/ui/cursor/`) — dot + ring loose-spring follower, mix-blend-difference, state detection via `data-cursor` + DOM walking. Ripples spawn at captured click coordinates with frozen size/accent, auto-cleaned via timer.
- **Text reveal** (`components/ui/reveal/`) — `SplitText` word-slide, `RevealText` fade-and-slide, shared scroll-trigger setup in `text-animation.ts`. Optional SVG dust distortion (`DustFilterSvg`) auto-disables on coarse-pointer devices for mobile GPU reasons.
- **Smooth scroll** (`lib/SmoothScroll.tsx` + `lib/smooth-scroll-helpers.ts`) — Lenis on desktop wheel, native on touch (`syncTouch: false`). Scroll-navigation helpers in `lib/scroll-navigation.ts` default to a bouncy `scrollEaseOut` for programmatic scrolls. Nested scrollables opt out via `data-lenis-prevent`.
- **Contact pipeline** (`lib/contact/`) — honeypot + timing guard + IP rate limiter + strict validation, normalized before being shipped to the configured webhook. Unit tests in `contact.test.ts` cover the full pipeline.
- **Social images** (`lib/social-image.tsx`) — `next/og` edge-runtime generation for `/opengraph-image`, `/twitter-image`, and per-project OG pages.
- **Structured data** (`lib/structured-data.ts`) — Person + WebSite + CreativeWork JSON-LD injected at the layout root.

## Lockfile hygiene

- Use `pnpm install` as your default. When it touches `pnpm-lock.yaml`, commit the lockfile change alongside the `package.json` change that caused it.
- CI and the pre-push hook run `pnpm install --frozen-lockfile`, which fails if `pnpm-lock.yaml` does not match `package.json`. Fix with `pnpm install`, then commit `pnpm-lock.yaml`.

## Deployment

The repo has no platform-specific config — it's a vanilla Next.js 16 output. Any Node-hosting target that can run `next start` works. `proxy.ts` runs automatically on Vercel-compatible platforms.
