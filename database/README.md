# PAL-ONE — Database

The SQLite database and everything that defines it.

```
database/
├── prisma/
│   ├── schema.prisma     data model (Prisma)
│   ├── migrations/       SQL migrations, applied in order
│   ├── seed.ts           demo-data seed (non-destructive upsert by slug)
│   └── seed-data.ts      the demonstration categories and services
├── dev.db                development database (git-ignored, persistent)
└── README.md
```

The Prisma CLI is configured in `backend/prisma.config.ts`, which points at this folder and loads the root `.env`. Run every command below **from the project root**.

| Command | What it does |
|---|---|
| `npm run db:generate` | Generate Prisma Client (also runs automatically after `npm install`) |
| `npm run db:status` | Show which migrations are applied |
| `npm run db:migrate` | Development: apply pending migrations; after a schema edit, create a new one (`npm run db:migrate -- --name add_x`) |
| `npm run db:deploy` | Apply existing migrations only (CI / production); never resets |
| `npm run db:seed` | Insert or refresh the demo data |
| `npm run db:setup` | `db:deploy` + `db:seed`: initialize an empty database |
| `npm run db:studio` | Browse and edit data in Prisma Studio |
| `npm run db:reset` | **Destroys all data**, then re-applies migrations and the seed. Development only; asks for confirmation |

## Location

`DATABASE_URL="file:../dev.db"` in the root `.env` is resolved **relative to `prisma/schema.prisma`**, so it points at `database/dev.db`. To use another file, change the variable, for example `file:../staging.db`.

The browser never reads this file. Only the backend process opens it, and the production server serves only `frontend/dist`.

## The seed is safe to re-run

`db:seed` upserts categories, subcategories and services **by slug**:

- **Seed records:** created when missing, refreshed when present. Their ids and `createdAt` are kept.
- **Other records:** anything not in the seed is never modified or deleted. That includes real listings and every `AdminUser`.
- **Child rows:** a seeded service's language and highlight rows are replaced by the seed's version.

All seed content is **demonstration data**:
- Every seeded service has `isDemo = true`.
- No official URLs, e-mails or phone numbers are filled in, and nothing is marked verified.
- Names ending in "(demo)" are fictional.

## Backups

SQLite is one file. Stop the server, then copy the file:

```bash
cp database/dev.db database/dev-$(date +%Y%m%d).db
```

## Administrators

There is no public registration. Create or update an admin from the command line:

```bash
ADMIN_PASSWORD='a long passphrase' npm run admin:create -- --email you@example.org --name "Your Name" --role admin
```

The password must be at least 12 characters and is stored only as a scrypt hash.

## Changing the schema

1. Edit `prisma/schema.prisma`.
2. Run `npm run db:migrate -- --name describe_change`, then review the generated SQL in `prisma/migrations/`.
3. If service, category or subcategory names can change outside the seed, rebuild the search column with `rebuildSearchIndex()` (`backend/src/services/searchIndex.service.ts`).

See [docs/DATABASE_DESIGN.md](../docs/DATABASE_DESIGN.md) for tables, relationships and constraints.
