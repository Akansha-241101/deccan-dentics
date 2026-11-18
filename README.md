# Deccan Dentics

Portfolio rebuild of the Deccan Dentics dental clinic site ([dddental.in](https://dddental.in/)): a public marketing site plus an admin operations dashboard for patients, appointments, and clinic schedule.

Built as a resume project to show end-to-end product work — UI, booking flow, auth, and Neon-backed admin data.

## What you can try

**Public site**

- Clinic marketing pages (home, about, services, reviews, FAQ, contact)
- Appointment booking with live slot availability
- Light / dark themes

**Admin** (`/admin`)

- Patients, appointments, calendar, and schedule
- Dashboard overview and settings
- Neon Auth sign-in (allowlisted admin emails only)

## Demo admin login

Recruiters can open the admin without creating an account:

| Field | Value |
|---|---|
| URL | [/admin/login](http://localhost:3000/admin/login) |
| Email | `adeakansha24th@gmail.com` |
| Password | `deccan-dentics@1234` |

The login page also shows these credentials in a demo notice, with a **Continue with demo account** button.

This is a shared portfolio demo account — not a personal secret.

## Tech stack

| Tool | Version |
|---|---|
| Bun | 1.4.4 |
| Next.js | 16.4.6 |
| React | 19.3 |
| Tailwind CSS | 4 |
| Neon (Postgres + Auth) | `@neondatabase/serverless`, `@neon/auth` |
| shadcn/ui | Base UI (`base-nova`) |
| TypeScript | 5 (strict) |

## Setup

```bash
bun install
cp .env.example .env.local   # fill Neon, auth, and mail values
bun run db:migrate           # applies SQL in db/migrations/
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

Required env names are listed in [`.env.example`](.env.example). Never commit `.env.local`.

## Scripts

| Command | Purpose |
|---|---|
| `bun run dev` | Dev server (Webpack) |
| `bun run build` | Production build |
| `bun run start` | Serve production build |
| `bun run lint` | ESLint |
| `bun run db:migrate` | Run SQL migrations against Neon |

## Project layout

```text
brand-manifest.json   Clinic brand facts (voice, branches, services)
db/migrations/        Postgres schema + optional seed
docs/                 PRD, architecture, design, memory, rules, tasks, security
src/app/              Routes (public + /admin) and API handlers
src/components/       UI by area (home, admin, layout, ui)
src/features/         Appointment booking and auth flows
src/constants/        Shared config and admin tokens
```

## Documentation

| Doc | Purpose |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Product scope |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the app is structured |
| [docs/DESIGN.md](docs/DESIGN.md) | Visual system and motion |
| [docs/MEMORY.md](docs/MEMORY.md) | Decisions and verified facts |
| [docs/RULES.md](docs/RULES.md) | Coding conventions |
| [docs/TASKS.md](docs/TASKS.md) | Shipped vs next |
| [docs/SECURITY.md](docs/SECURITY.md) | Data and secrets |
| [docs/database.md](docs/database.md) | Database notes |

## Clinic facts

From the live site (verified 30 Oct 2026):

- Branches: Kondapur, Manikonda, Rajendranagar, Toli Chowki
- Phone: `079956 86661` · Email: `drsadiqali2000@gmail.com`
- Hours: Mon–Sat 09:00–20:00, Sun 14:00–18:00
