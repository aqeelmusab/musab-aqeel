# Musab Aqeel

Personal portfolio and case-study site. Next.js 16 App Router: the home and work surfaces prerender like you'd expect on Vercel, but this is not `output: 'export'`; production is still `next start` on Node. GSAP, Motion (formerly Framer Motion), and Lenis handle the motion layer.

## Stack

- **Next.js 16** App Router, Turbopack build, React 19
- **TypeScript** strict mode, `@/` path alias → `src/`
- **GSAP** scroll-triggered reveals, intro choreography, cursor/logo micro-animations
- **Motion** layout transitions, magnetic buttons, mobile menu clip-path, cursor springs
- **Lenis** smooth wheel scroll on desktop (native touch on mobile)
- **Tailwind CSS 4** plus a small hand-written layer in `src/app/globals.css`
- **Vitest** for domain specs under `tests/` (layout mirrors `src/` where helpful)
- **Proxy** (Next 16's renamed middleware): sets CSP on matched requests. Script-src skips nonces so static routes still hydrate; the comment at the top of `src/proxy.ts` explains the tradeoff.
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
- **`NEXT_PUBLIC_SITE_URL`** Defaults to `https://musabaqeel.com` in `src/lib/config.ts`. Change only if your deploy origin differs.

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
| `pnpm run verify`       | format check + lint + typecheck + test + build (what CI runs)       |
| `pnpm run format`       | Biome format write                                                  |
| `pnpm run format:check` | Biome format check                                                  |

## Project structure

### Naming conventions

| Kind                     | Filename                   | Example                |
| ------------------------ | -------------------------- | ---------------------- |
| React component (`.tsx`) | `PascalCase.tsx`           | `MagneticButton.tsx`   |
| Hook (`.ts`)             | `useFoo.ts`                | `useCustomCursor.ts`   |
| Plain utility / module   | `kebab-case.ts`            | `scroll-navigation.ts` |
| Folder                   | `lowercase` / `kebab-case` | `main-wrapper/`        |

**Feature folders** group an entry component with its internals (helpers, hooks, constants). Flat primitives with no internals sit at the parent level. The cursor folder is a typical example:

```text
src/components/ui/cursor/
├── CustomCursor.tsx      entry, imported by app/layout.tsx
├── CursorVisual.tsx      dot + ring follower
├── useCustomCursor.ts    mouse state + ripple lifecycle
└── constants.ts          sizes, states
```

### Top-level layout

```text
src/
├── app/                  Routes, layouts, OG/Twitter, sitemap, contact API
├── components/
│   ├── layout/           Site chrome — nav/, main-wrapper/, Footer.tsx
│   ├── sections/         Home page sections (Hero, Work, About, Contact, …)
│   ├── ui/               Flat primitives + feature folders (cursor/, intro/, reveal/)
│   └── work/             Case-study layout, ProjectCard, WorkSection, ProjectCoverImage
├── lib/
│   ├── contexts/         Intro + Lenis providers, SmoothScroll shell
│   ├── contact/          Validation, abuse checks, webhook
│   ├── hooks/            Cross-cutting hooks (coarse pointer, reduced motion)
│   ├── project-data/     One module per project
│   ├── SocialImage.tsx   next/og template for OG/Twitter routes
│   └── *.ts              Config, motion tokens, scroll helpers, structured data, …
├── types/                Shared TS types + re-exports
└── proxy.ts              CSP + security headers (was middleware.ts before Next 16)

tests/                    Vitest specs mirroring src/
public/                   Favicons, fonts (Clash Display / Satoshi / Fragment Mono), project images
.githooks/pre-push        Lockfile check; enabled by postinstall
.github/workflows/ci.yml  format + lint + typecheck + test + build on PR/push
```

## Notable systems

- **Intro** (`src/components/ui/intro/Intro.tsx`, `src/lib/contexts/IntroContext.tsx`): ~3s splash on first load. Role words morph (Developer / Architect / Operator) through an SVG alpha filter mounted at the body (`IntroFilterDefs`) so Safari behaves. Counter animates in with per-character stagger. Exit moves the panel with `yPercent: -105` and lifts the wrapper in parallel; no clip-path, fewer browser headaches.

- **Custom cursor** (`src/components/ui/cursor/`): dot + ring follower with loose springs, `mix-blend-difference`, state from `data-cursor` and DOM walks. Click ripples use captured coords and fixed size/color; timers clean them up.

- **Text reveal** (`src/components/ui/reveal/`): `SplitText` word slides, `RevealText` fade/slide, shared scroll wiring in `text-animation.ts`. Optional `DustFilterSvg` distortion turns off on coarse pointers to spare mobile GPUs.

- **Smooth scroll** (`src/lib/contexts/SmoothScroll.tsx`, `src/lib/smooth-scroll-helpers.ts`): Lenis on desktop wheel, native touch (`syncTouch: false`). `src/lib/scroll-navigation.ts` defaults programmatic scrolls to a bouncy `scrollEaseOut`. Nested scroll areas opt out with `data-lenis-prevent`.

- **Contact** (`src/lib/contact/`): honeypot, timing guard, Upstash-backed rate limit when configured (in-memory fallback otherwise), strict validation, then webhook. `tests/lib/contact/contact.test.ts` exercises the path end to end.

- **Social images** (`src/lib/SocialImage.tsx`): `next/og` for `/opengraph-image`, `/twitter-image`, and per-project OG routes.

- **Structured data** (`src/lib/structured-data.ts`): Person + WebSite + CreativeWork JSON-LD at the layout root.

## Lockfile hygiene

- Default to `pnpm install`. If it changes `pnpm-lock.yaml`, commit that with the `package.json` change that caused it.

- CI and pre-push run `pnpm install --frozen-lockfile`. If the lockfile doesn’t match `package.json`, run `pnpm install`, commit `pnpm-lock.yaml`, push again.

## Deployment

No vendor-specific config: plain Next.js 16. Anything that can run `next start` on Node 24 is fine. `src/proxy.ts` runs as expected on Vercel-style setups.
