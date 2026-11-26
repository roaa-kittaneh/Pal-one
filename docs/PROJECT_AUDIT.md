# PAL-ONE — Project Audit

**Date:** 2026-11-26  
**Scope:** frontend, backend, database, configuration, security, tooling  
**Method:** every result below comes from commands that were run in this audit: the automated test suite, direct SQLite queries, live HTTP requests against the running API, scripted browser runs (Playwright/Chromium), and pixel comparison of screenshots. Nothing is inferred from the homepage alone.

The audit was done in two passes:

1. **Before refactoring:** the original layout (`src/`, `server/`, `shared/`).
2. **After refactoring:** the new layout (`frontend/`, `backend/`, `database/`, `docs/`). The same checks were re-run to prove nothing regressed.

---

## 1. Summary

| Area | Result before | Result after |
|---|---|---|
| Express starts | ✅ | ✅ (dev via `npm run dev`, production via `npm start`) |
| Prisma ↔ SQLite connection | ✅ | ✅ (`/api/health` now verifies it) |
| Migrations applied | ✅ 1/1 | ✅ 1/1, “Database schema is up to date” |
| Tables present | ✅ 6 + `_prisma_migrations` | ✅ unchanged |
| Seed data present | ✅ 10 categories / 21 subcategories / 26 services | ✅ identical rows (snapshot match) |
| API endpoints | ✅ 33/33 requests as expected | ✅ identical responses (`/health` extended) |
| Backend tests | ✅ 26/26 | ✅ 36/36 (10 new) |
| Frontend uses backend data | ✅ | ✅ |
| Search / filters / sorting / pagination | ✅ | ✅ |
| Arabic & English | ✅ | ✅ |
| UI vs. previous build | — | ✅ 10/10 screenshots pixel-identical |
| Known vulnerabilities (`npm audit`) | ⚠️ 7 (5 high, 2 moderate) | ⚠️ 4 high, dev-only Prisma CLI (see §6) |

---

## 2. Project structure (before)

```
src/            React frontend (pages, components, hooks, api/, i18n/)
server/src/     Express API: routes/, repositories/, schemas/, lib/, middleware/
server/prisma/  schema.prisma, migrations/, seed.ts, seed-data.ts, dev.db
shared/         API types, constants, text normalization (used by both sides)
```

Observations:

- The frontend, backend and database were mixed at the repository root. One `package.json` held all dependencies.
- The backend had **no controller layer**: route handlers called the data-access functions directly.
- Database files (schema, migrations, seed, `dev.db`) lived inside the server folder.
- Prisma was configured through `package.json#prisma`. Prisma prints a deprecation warning for this on every command, and the option is removed in Prisma 7.
- Build artefacts (`dist/`, `build/`, `tsconfig.tsbuildinfo`) and a source archive sat in the project root.

---

## 3. Database verification

Queries were run directly against `dev.db` (via Prisma `$queryRaw`) before and after the move to `database/dev.db`.

| Check | Result |
|---|---|
| `PRAGMA integrity_check` | `ok` |
| `PRAGMA foreign_key_check` | no violations |
| `_prisma_migrations` | `20261126133944_init`, finished, not rolled back |
| `prisma migrate status` | “1 migration found … Database schema is up to date!” |
| Tables | `AdminUser`, `Category`, `Service`, `ServiceHighlight`, `ServiceLanguage`, `Subcategory` (+ `_prisma_migrations`, `sqlite_sequence`) |
| Indexes | 12 (3 unique slug/email keys + 9 query indexes) |
| Row counts | Category 10 · Subcategory 21 · Service 26 (25 published, 1 draft) · ServiceLanguage 46 · ServiceHighlight 3 · AdminUser 0 |
| Service in a subcategory of another category | 0 |
| Services with empty `searchText` | 0 |
| Invalid `serviceType` / `status` values | 0 |
| Services with a website, e-mail, phone or `isVerified=1` | 0 (as intended for demo data) |
| Arabic text round-trip | `بنك فلسطين`, `جوّال` stored and returned intact (UTF-8, diacritics preserved) |

**Data preservation during refactoring:**

- **Moved, not recreated:** `server/prisma/dev.db` was moved with `mv` to `database/dev.db`.
- **Checksum:** the SHA-256 is identical before and after (`a9dd7ce0…8790f11`).
- **Rows:** a full JSON snapshot of every row in every table was taken before and after the move, and the two are byte-for-byte identical.
- **Backup:** a full project archive was taken before any change.

**Seed behaviour.** The seed was tested on a *copy* of the real database so the original stayed untouched:

- It still reports 10 categories, 21 subcategories, 0 services created and 26 updated.
- Row counts are unchanged and service IDs are stable.
- Category, subcategory, service and language rows are unchanged apart from `updatedAt`.
- The 3 highlight rows are recreated: same content, new IDs.

---

## 4. API testing results

Live requests were made against the running server through the Vite proxy (`http://localhost:5173/api`). Results were identical before and after the refactor; the only change is the new `database` field in `/health`.

| Request | Status | Result |
|---|---|---|
| `GET /health` | 200 | `{"status":"ok","database":"up"}` (after) |
| `GET /statistics` | 200 | 25 services, 10 categories, 21 subcategories, 0 verified |
| `GET /categories` | 200 | 10 items, first `banking-finance` |
| `GET /categories/education` | 200 | 6 services embedded (draft excluded) |
| `GET /categories/does-not-exist` | 404 | `NOT_FOUND` |
| `GET /categories/Bad_Slug!` | 400 | `VALIDATION_ERROR` |
| `GET /services` | 200 | 12 items, total 25, 3 pages, featured first |
| `GET /services?pageSize=10&page=3` | 200 | 5 items |
| `GET /services?category=communication` | 200 | total 3 |
| `GET /services?subcategory=universities` | 200 | total 4 |
| `GET /services?type=mobile-app` | 200 | total 10 (includes website-and-app) |
| `GET /services?location=nablus` | 200 | total 3 |
| `GET /services?featured=true` | 200 | total 3 |
| `GET /services?sort=recent` | 200 | first `tatreez-learning-demo` (newest published) |
| `GET /services?sort=alphabetical&lang=en` | 200 | first `al-quds-university` |
| `GET /services?sort=alphabetical&lang=ar` | 200 | first `ooredoo-palestine` (أوريدو) |
| `GET /services?page=0` · `pageSize=51` · `type=fax` | 400 | `VALIDATION_ERROR` with field details |
| `GET /services/featured` · `/services/recent?limit=3` | 200 | 3 items each |
| `GET /services/bank-of-palestine` | 200 | full detail + 3 related |
| `GET /services/unpublished-listing-demo` | 404 | drafts are not public |
| `GET /search?q=bank` | 200 | 2 results, Bank of Palestine first |
| `GET /search?q=الجامعه` | 200 | 5 results (ة/ه folding + definite article) |
| `GET /search?q=جَوّال` | 200 | Jawwal (diacritics ignored) |
| `GET /search?q=healthcare` | 200 | 2 results (category-name match) |
| `GET /search?q=university&location=nablus` | 200 | An-Najah only |
| `GET /search?q=%` | 200 | 0 results (wildcard neutralized) |
| `GET /search` | 400 | `q` required |
| `GET /admin/users` | 403 | `FORBIDDEN` (admin API closed) |
| `GET /nope` | 404 | JSON `NOT_FOUND` |

**Automated tests** (`npm test`) create a fresh database on every run, apply migrations from scratch, seed it, and delete it afterwards.

- Before: **26 tests, 26 passed**.
- After: **36 tests, 36 passed**.
- New coverage: seed idempotency and non-destructiveness, the DB-backed health check, the `servicesLimit` parameter, `Cache-Control` on errors, oversized-parameter rejection, and 5 unit tests for the shared Arabic/English normalization.

---

## 5. Frontend verification

These are scripted Chromium runs against the live dev stack. Every step's output was identical before and after the refactor.

| Flow | Observed |
|---|---|
| Default language | `lang="ar"`, `dir="rtl"` |
| Homepage | 6 service cards (featured + recent), 8 category cards, stats line “25 خدمة ضمن 10 فئات” |
| Language switch | English persists after reload (`localStorage`) |
| Homepage search “bank” | `/search?q=bank` → “2 services found”, Bank of Palestine first |
| Arabic search “الجامعه” | 5 services found |
| No results “zzzz” | Empty state → **Clear search** returns to `/search` |
| Categories page | 10 tiles with live counts |
| Category page (Education) | hero from DB, “6 services”; subcategory chip → 1; in-category search “najah” → An-Najah |
| Explore | 25 → category Communication 3 → + Mobile app 2 → Reset 25 |
| Pagination / sorting | page 2 “Showing 7–12 of 25”; alphabetical → Al-Quds University first |
| Service detail | opens from a card; unknown slug and unknown category show not-found pages |
| API failure (500 injected) | error state shown; **Try again** recovers |
| Console errors | none |

**Visual regression.** I took 10 full-page screenshots before the refactor and 10 after: English at 1440 px, plus Arabic at 1440 px and 390 px. Each pair was compared pixel by pixel, and every one had **0 differing pixels**.

**Production build.** `npm start` serves the API and the built frontend from one port. Client routes work, and requests for `/database/dev.db` return the SPA's `index.html`, never the database file.

---

## 6. Issues found

| # | Severity | Issue | Status |
|---|---|---|---|
| 1 | High (security) | `zod@3` advisory: memory exhaustion validating oversized collections | **Fixed**: upgraded to `zod@4.6.7`; raw `type` input capped at 100 chars before splitting |
| 2 | Moderate (security) | `react-router-dom@6` advisory: open redirect via backslash in `<Link>`/`useNavigate` | **Fixed**: upgraded to `react-router-dom@7.18.7` (v7 future flags were already enabled; no code changes beyond removing them) |
| 3 | Medium (bug) | Error responses (404/403/429/400) were sent with `Cache-Control: public, max-age=30`, so a proxy or browser could cache “not found” or “rate limited” | **Fixed**: errors now send `no-store`; covered by a test |
| 4 | Medium (data safety) | `db:seed` deleted **all** catalog rows before inserting, so it would wipe any non-demo listing added later | **Fixed**: seed now upserts by slug and never touches other rows; covered by a test |
| 5 | Low (performance) | The category page fetched `/categories/:slug`, which embedded up to 100 services, then made a second paged request for the same services | **Fixed**: new `servicesLimit` parameter; the page now requests `servicesLimit=0` |
| 6 | Low (ops) | `/api/health` returned `ok` without checking the database | **Fixed**: runs `SELECT 1`; returns `503` + `database: "down"` on failure |
| 7 | Low (frontend) | The response cache in `useApi` was unbounded | **Fixed**: capped at 100 entries (LRU) |
| 8 | Low (maintainability) | No controller layer; Prisma config via deprecated `package.json#prisma`; mixed root layout | **Fixed**: layered backend, `backend/prisma.config.ts`, workspaces (see `PROJECT_STRUCTURE.md`) |
| 9 | Accepted (dev-only) | `npm audit`: 4 high advisories in the **Prisma CLI's** own dependencies (`@prisma/config` → `effect`, `deepmerge-ts`) | **Open**: runs only as a dev/CLI tool, not in the API runtime (`@prisma/client` is not affected). The fix requires Prisma 7 (breaking: driver adapters and new client generator). Recommended as a planned upgrade |

---

## 7. Missing features / known limitations

- **Admin area:** the `AdminUser` model, scrypt password hashing and the CLI (`npm run admin:create`) exist. There is no authentication, session handling or admin UI yet, and `/api/admin/*` returns 403.
- **Search index maintenance:** `Service.searchText` is rebuilt by the seed. Future admin write paths must call `rebuildSearchIndex()` after changing service, category or subcategory names.
- **Arabic alphabetical sort** uses SQLite's binary order. It's correct for the current data, but it isn't full Unicode collation. Locale-aware sorting would need an ICU-enabled database or sorting in the application layer.
- **Rate limiting** uses an in-memory store, which is fine for one server instance. Multiple instances would need a shared store such as Redis.
- **No frontend automated tests in the repository.** The browser checks above were run with Playwright scripts outside the repo.
- **Demo content only.** No official links, contacts or verification claims are filled in.

## 8. Recommendations

1. Add Playwright end-to-end tests to the repository: the flows in §5, in both languages and at the three breakpoints.
2. Plan the Prisma 7 upgrade, which clears the remaining advisories.
3. When building the admin area, add authentication (session or JWT against `AdminUser`) and role checks in `requireAdmin`. Rebuild the search index on every write, and log admin actions.
4. If several instances are ever deployed, move rate limiting and caching to a shared store. For larger datasets, consider SQLite FTS5 or PostgreSQL full-text search.
5. Add CI that runs `npm ci && npm run typecheck && npm test && npm run build`.
