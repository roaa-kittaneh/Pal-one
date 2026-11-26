# PAL-ONE — Project Structure

```
pal-one/
├── package.json              npm workspaces root + project-wide scripts (dev, build, test, db:*)
├── package-lock.json         single lockfile for all workspaces
├── .env.example              configuration template → copy to .env (one .env for the whole project)
├── .gitignore
├── README.md                 setup & run guide
│
├── frontend/                 React SPA (workspace @pal-one/frontend)
│   ├── index.html
│   ├── vite.config.ts        dev server :5173, /api proxy → backend, envDir = project root
│   ├── tsconfig.json         browser code · tsconfig.node.json: vite.config.ts
│   ├── public/               static files copied as-is (favicon)
│   └── src/
│       ├── main.tsx          bootstrap: Router + LanguageProvider
│       ├── App.tsx           route table
│       ├── pages/            HomePage, CategoriesPage, CategoryPage, ExplorePage, SearchPage,
│       │                     ServiceDetailPage, LegalPage, NotFoundPage
│       ├── layouts/          MainLayout (header, footer, scroll handling)
│       ├── components/       reusable UI (ServiceCard, CategoryCard, SearchBar, Select, Pagination,
│       │                     StatusViews, Header, Footer, …)
│       ├── hooks/            useCatalog (domain data) · useApi (fetch/cache) · useUrlFilters ·
│       │                     useLanguage · useDebouncedValue · useDocumentTitle
│       ├── services/         apiClient.ts (base URL, ApiError, fetch) · catalogApi.ts (endpoint paths)
│       ├── i18n/             ar.ts · en.ts · LanguageContext.tsx
│       ├── types/            shared API types re-exported + UI types
│       ├── utils/            format.ts (names, "recently added")
│       ├── assets/           bundled static assets
│       └── index.css         Tailwind + design tokens
│
├── backend/                  Express REST API (workspace @pal-one/backend)
│   ├── prisma.config.ts      Prisma CLI config → ../database/prisma, loads root .env
│   ├── tsconfig.json         type-check (src, tests, scripts, shared, seed)
│   ├── tsconfig.build.json   production build → backend/dist
│   ├── src/
│   │   ├── server.ts         entry: connect DB, listen, graceful shutdown
│   │   ├── app.ts            middleware + routers (+ serve frontend/dist in production)
│   │   ├── config/           env.ts (Zod-validated env) · database.ts (Prisma client) · paths.ts
│   │   ├── routes/           index.ts · category / service / search / admin routes
│   │   ├── controllers/      category · service · statistics · health
│   │   ├── services/         category · service · statistics · health · searchIndex · mappers (DTOs)
│   │   ├── validators/       common · service · category (Zod schemas)
│   │   ├── middleware/       security (helmet/CORS/rate limit) · cache · validate · errorHandler
│   │   └── utils/            httpError · password (scrypt)
│   ├── scripts/create-admin.ts
│   └── tests/                api.test.ts (integration) · text.test.ts (unit)
│
├── database/                 everything that defines and stores data
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/20261126133944_init/migration.sql
│   │   ├── seed.ts           non-destructive upsert seed
│   │   └── seed-data.ts      demonstration content
│   ├── dev.db                development SQLite database (git-ignored)
│   └── README.md
│
├── shared/                   code used by both frontend and backend
│   ├── api.ts                response/DTO types (the API contract)
│   ├── constants.ts          allowed values: service types, locations, icons, sorts, roles
│   ├── text.ts               search normalization (Arabic + Latin)
│   └── search.ts             builds Service.searchText
│
└── docs/
    ├── PROJECT_AUDIT.md
    ├── SYSTEM_DESIGN.md
    ├── DATABASE_DESIGN.md
    ├── API_DOCUMENTATION.md
    └── PROJECT_STRUCTURE.md
```

## Why `shared/` is a separate top-level folder

The API contract (`shared/api.ts`) and the search normalization (`shared/text.ts`, `shared/search.ts`) must be identical on both sides. Keeping them in one place means the TypeScript compiler catches any frontend/backend mismatch. The search column written by the seed always matches what the API queries.

It's plain TypeScript with no dependencies, imported by relative path:
- the frontend imports it via Vite;
- the backend imports it via tsx in development and `tsc` for the build.

## Dependency direction

```
frontend ──► shared ◄── backend ──► database (Prisma schema / client)
                                     ▲
                       database/prisma/seed.ts ──► shared
```

The frontend never imports backend or database code.

## Refactor map (old → new)

| Before | After |
|---|---|
| `src/**` | `frontend/src/**` |
| `src/api/client.ts` | `frontend/src/services/apiClient.ts` |
| `src/api/endpoints.ts` | `frontend/src/services/catalogApi.ts` |
| `src/utils/services.ts` | `frontend/src/utils/format.ts` |
| — | `frontend/src/hooks/useCatalog.ts` (new domain hooks) |
| `public/`, `index.html`, `vite.config.ts`, `tsconfig.json` | `frontend/…` (+ new `tsconfig.node.json`) |
| `server/src/index.ts` | `backend/src/server.ts` |
| `server/src/routes/public.ts` | split into `backend/src/routes/*.routes.ts` + `backend/src/controllers/*.controller.ts` |
| `server/src/routes/admin.ts` | `backend/src/routes/admin.routes.ts` |
| `server/src/repositories/categories.ts` | `backend/src/services/category.service.ts` |
| `server/src/repositories/services.ts` | `backend/src/services/service.service.ts` |
| `server/src/repositories/statistics.ts` | `backend/src/services/statistics.service.ts` |
| `server/src/repositories/mappers.ts` | `backend/src/services/mappers.ts` |
| `server/src/lib/searchIndex.ts` | `backend/src/services/searchIndex.service.ts` (uses `shared/search.ts`) |
| `server/src/lib/prisma.ts` | `backend/src/config/database.ts` |
| `server/src/lib/errors.ts` | `backend/src/utils/httpError.ts` |
| `server/src/lib/password.ts` | `backend/src/utils/password.ts` |
| `server/src/schemas/index.ts` | `backend/src/validators/{common,service,category}.validators.ts` |
| — | `backend/src/middleware/{security,cache}.ts`, `config/paths.ts`, `services/health.service.ts` |
| `server/scripts/`, `server/tests/` | `backend/scripts/`, `backend/tests/` (+ `text.test.ts`) |
| `server/prisma/{schema.prisma,migrations,seed.ts,seed-data.ts}` | `database/prisma/…` |
| `server/prisma/dev.db` | `database/dev.db` (moved; checksum unchanged) |
| `package.json#prisma` (deprecated) | `backend/prisma.config.ts` |
| root `dist/`, `build/`, `tsconfig.tsbuildinfo` | removed (regenerated as `frontend/dist`, `backend/dist`) |
