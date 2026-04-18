# Musab Aqeel

Personal portfolio and case-study site built with Next.js App Router, React 19, TypeScript, GSAP, Motion (formerly Framer Motion), Lenis, and Tailwind CSS.

## Stack

- `Next.js 16` with the App Router
- `React 19` and `TypeScript`
- `GSAP` for reveal, loader, and transition choreography
- `Motion (formerly Framer Motion)` for layout transitions, cursor interactions, and UI animation state
- `Lenis` for smooth scrolling
- `Tailwind CSS 4` with a small set of shared UI primitives
- `Vitest` for focused domain-level tests

## Getting Started

### Requirements

- `Node.js 24`
- `npm`

This repo is pinned to Node 24 via `.nvmrc`, `.node-version`, and CI.

### Install

```bash
nvm use
npm install
```

### Environment

Copy the values from `.env.example` into your local env file:

```bash
CONTACT_WEBHOOK_URL=
NEXT_PUBLIC_SITE_URL=https://musabaqeel.com
```

`CONTACT_WEBHOOK_URL` is optional for local development. If it is not set, the contact route will return success without forwarding to a webhook.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` starts the local dev server
- `npm run build` creates a production build
- `npm run start` runs the production build
- `npm run lint` runs ESLint
- `npm run typecheck` runs TypeScript without emitting files
- `npm run test` runs the focused Vitest suite
- `npm run verify` runs lint, typecheck, tests, and a production build

## Project Structure

- `app/` route segments, metadata, OG images, and the contact route handler
- `components/` layout, sections, UI primitives, and work/case-study components
- `lib/` shared client/server helpers, loader and scroll orchestration, config, and content access
- `lib/project-data/` per-project content modules
- `public/` fonts, favicons, and project imagery
- `types/` shared TypeScript interfaces and public type re-exports

## Notes

- The loader, cursor, smooth scroll, and reveal systems are split into smaller helpers/hooks to keep the app shell maintainable.
- Project content lives in `lib/project-data/`, while `lib/projects.ts` exposes the access helpers used by pages and components.
- Social preview generation is centralized in `lib/social-image.tsx`.
