# PAL-ONE

**All Palestinian Digital Services. One Place.** — a bilingual (Arabic / English) directory of Palestinian websites, apps and organizations.

React + Vite frontend · Express + TypeScript REST API · SQLite via Prisma ORM, organized as an npm-workspaces monorepo.

> The listings in the database are **demonstration content**. Descriptions are sample copy, entries ending in "(demo)" are fictional, no official links or contacts are filled in, and nothing is marked verified.

## Folders

| Folder | Contents |
|---|---|
| [`frontend/`](frontend) | React SPA (pages, components, hooks, API services, i18n) |
| [`backend/`](backend) | Express API: routes → controllers → services → Prisma |
| [`database/`](database) | Prisma schema, migrations, seed, `dev.db` · [database guide](database/README.md) |
| [`shared/`](shared) | API types, constants and search normalization used by both sides |
| [`docs/`](docs) | [Audit](docs/PROJECT_AUDIT.md) · [System design](docs/SYSTEM_DESIGN.md) · [Database design](docs/DATABASE_DESIGN.md) · [API](docs/API_DOCUMENTATION.md) · [Structure](docs/PROJECT_STRUCTURE.md) |

## Requirements

Node.js **22.9 or newer** and npm 10+. Check with `node -v`.

## Setup

Run everything from the project root.

```bash
npm install
```

```bash
cp .env.example .env
```

```bash
npm run db:setup
```

`npm install` also generates Prisma Client. `db:setup` applies the migrations and seeds the demo data.

**If `database/dev.db` already exists**, skip `db:setup` and run `npm run db:status` instead. Your data is kept, and the seed never deletes anything.

## Run (development)

```bash
npm run dev
```

Open **<http://localhost:5173>**. The API runs on <http://localhost:4000/api>, and Vite proxies `/api` to it.

## Run (production build)

```bash
npm run build
```

```bash
npm start
```

Open **<http://localhost:4000>**. A single Express process serves the API and the built frontend.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Backend (tsx watch) and frontend (Vite) together |
| `npm run dev:backend` · `npm run dev:frontend` | One side only |
| `npm run build` | Type-check and build `frontend/dist`, then compile `backend/dist` |
| `npm start` | Production server (API + frontend) |
| `npm test` | Backend integration and unit tests against a throwaway database |
| `npm run typecheck` | Type-check both workspaces |
| `npm run db:migrate` | Create and apply migrations (development) |
| `npm run db:deploy` | Apply existing migrations only |
| `npm run db:status` | Migration status |
| `npm run db:seed` | Insert or refresh demo data (non-destructive) |
| `npm run db:setup` | `db:deploy` + `db:seed` |
| `npm run db:studio` | Prisma Studio |
| `npm run db:reset` | ⚠️ Wipe and rebuild the development database (asks for confirmation) |
| `npm run admin:create` | Create an administrator (see [database guide](database/README.md#administrators)) |

## Configuration (`.env` at the project root)

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `file:../dev.db` | SQLite file, relative to `database/prisma/schema.prisma` → `database/dev.db` |
| `PORT` | `4000` | API port (the Vite proxy reads it too) |
| `CORS_ORIGIN` | `http://localhost:5173` | Comma-separated origins allowed to call the API |
| `RATE_LIMIT_PER_MINUTE` | `120` | Requests per IP per minute on `/api` |
| `TRUST_PROXY` | `0` | Number of reverse proxies in front of the app |
| `VITE_API_BASE_URL` | `/api` | API base URL used by the browser bundle |

Only `VITE_*` variables reach the browser. The database path and other settings stay on the server.

## API at a glance

`GET /api/categories` · `/api/categories/:slug` · `/api/services` (filters `q`, `category`, `subcategory`, `type`, `location`, `featured`, `sort`, `lang`, `page`, `pageSize`) · `/api/services/featured` · `/api/services/recent` · `/api/services/:slug` · `/api/search?q=` · `/api/statistics` · `/api/health`

Full reference: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md).
