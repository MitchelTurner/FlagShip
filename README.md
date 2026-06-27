# Fathomline — Deep Learning, Fathomed

An ultra-modern, deep-ocean-themed portfolio for **deep-learning & AI** work — showcasing
your **models, hardware & software ideas** in a clear, easy-to-understand way, and letting
visitors **vote** on which project should surface next. Some ideas are production-ready,
others are research mockups; every one is labelled with its stage so people know exactly
what they're looking at.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Framer
Motion** and **Prisma + SQLite**.

## Features

- **Showcase gallery** — animated, glassmorphic cards for every project with a cover
  image, category (hardware / software), stage badge and tags.
- **Clear status for every idea** — `Idea → Mockup → Prototype → In Progress →
  Completed`, so mockups are never mistaken for shipped products.
- **Community voting** — one tap to upvote (and tap again to remove). Votes are stored
  in the database and attributed to an anonymous per-browser key, so the same person
  can't stuff the ballot. Sort the showcase by **Top voted** or **Newest**.
- **Search & filters** — filter by category and stage, or search across titles, summaries
  and tags.
- **Admin upload area** (`/admin`) — password-protected dashboard to publish new
  projects, upload cover images (or paste an image URL), feature standouts, and delete
  projects.
- **Auto-synced GitHub portfolio** (`/github`) — point it at a GitHub username and the
  "Live Work" page builds itself from your public repositories:
  - **Generated cover art** — a unique 1200×630 graphic is rendered on the fly for every
    repo (via `next/og`) using its name, description, primary language, topics and stats.
  - **Deployment status** — surfaces live links from each repo's homepage, GitHub Pages,
    or the GitHub Deployments API (with environment + status badges when a token is set).
  - **Language breakdowns**, stars, forks and last-activity, all cached for an hour to
    respect API rate limits.
  - Set the username straight from the admin dashboard (stored in the DB) — no redeploy.
- **Ultra-modern, deep-ocean design** — animated deep-ocean current background, latent-space
  grid, ocean-depth gradient accents (blue → cyan → seafoam), frosted glass
  surfaces, smooth motion, fully responsive.

## Quick start

```bash
# 1. Install dependencies (also generates the Prisma client)
npm install

# 2. Configure environment
cp .env.example .env
#   then edit ADMIN_PASSWORD in .env

# 3. Create the database and apply migrations
npx prisma migrate dev

# 4. (Optional) load sample projects
npm run db:seed

# 5. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The admin area lives at
[http://localhost:3000/admin](http://localhost:3000/admin).

## Environment variables

| Variable          | Description                                                              | Default         |
| ----------------- | ------------------------------------------------------------------------ | --------------- |
| `DATABASE_URL`    | SQLite connection string (relative to `prisma/`).                        | `file:./dev.db` |
| `ADMIN_PASSWORD`  | Password required to access the `/admin` upload area.                    | `changeme`      |
| `GITHUB_USERNAME` | GitHub account for Live Work. Also configurable in `/admin` or `github.config.json`. | _(see config file)_ |
| `GITHUB_TOKEN`    | Optional read-only token. Raises the API limit (60 → 5000 req/hr) and enables richer deployment status. | _(unset)_ |

> **Change `ADMIN_PASSWORD` before deploying.** The login sets an HTTP-only cookie
> containing an HMAC of the password — the raw password is never stored client-side.

> **GitHub username resolution** (first match wins): admin dashboard (SQLite) →
> `GITHUB_USERNAME` env var → `github.config.json` in the repo root. On serverless
> hosts (Vercel, etc.) the SQLite database is usually **not persistent**, so admin
> saves may not stick — set `GITHUB_USERNAME` on your host or edit `github.config.json`
> and redeploy. Repo data refreshes every ~2 minutes (or use **Force refresh** in admin).

## Project structure

```
prisma/
  schema.prisma        # Project + Vote + Setting models (SQLite)
  seed.mjs             # Sample hardware/software projects
src/
  app/
    page.tsx           # Landing hero + GitHub highlights + showcase
    github/page.tsx    # Auto-generated "Live Work" portfolio from GitHub
    admin/page.tsx     # Admin dashboard (login, GitHub sync, upload, manage)
    api/
      projects/        # List / create / get / delete + vote
      admin/           # login / logout / session
      upload/          # image upload (admin only)
      github/repos/    # Normalized portfolio repositories
      og/repo/         # On-the-fly repo cover graphics (next/og)
      settings/github/ # Get / set the configured GitHub username
  components/          # Navbar, gallery, cards, modal, forms, RepoCard, GitHub settings
  lib/                 # prisma client, auth, types, github client, settings, voter key
```

## Useful scripts

| Script             | What it does                                    |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | Start the development server                    |
| `npm run build`    | Generate the Prisma client and build for prod   |
| `npm run start`    | Run the production build                        |
| `npm run lint`     | Lint with ESLint                                |
| `npm run db:seed`  | Seed sample projects                            |
| `npm run db:reset` | Drop, re-migrate and re-seed the database       |

## Notes on deployment

This app uses a local SQLite database and stores uploaded images on the local
filesystem (`public/uploads`). That works great for self-hosting / a long-running
Node server (e.g. a VPS, Fly.io, Railway, Render). For ephemeral/serverless platforms
where the filesystem isn't persistent, point `DATABASE_URL` at a hosted database and
swap image uploads for an object store (S3, R2, etc.).
