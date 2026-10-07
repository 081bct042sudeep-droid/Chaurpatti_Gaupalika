# SQLite to PostgreSQL migration

The live SQLite database remains the source of truth until the PostgreSQL
import and application checks pass. The SQLite Prisma schema and migrations
remain at `prisma/schema.prisma` and `prisma/migrations/`. PostgreSQL has its own
schema and initial migration under `prisma/postgresql/`.

## Source database inventory

Inspected on 2026-10-07:

- Database: `backend/dev.db` (7,622,656 bytes)
- SHA-256: `00ccceb8c0610bc776e9f5c55c54f141456e7da195f1ec4781b4cce0c01a3a89`
- Prisma CLI and client: 6.19.3; Node: 22.11.0; package manager: npm
- SQLite integrity check: passed; SQLite foreign-key violations: 0
- 32 SQLite tables total, including `_prisma_migrations` (12 rows)
- 31 application and archived-data tables, 67 rows total
- All application primary keys are text IDs; there are no integer sequences
- No backend raw SQL queries were found. One old SQLite migration contains
  `PRAGMA foreign_keys`; that history is not used by PostgreSQL.
- A read-only Prisma diff found five legacy service archive tables outside the
  current app schema and SQLite table-rebuild diffs for `MapPlace` and
  `OfficialService`. The archive tables are now represented in the PostgreSQL
  schema; the importer compares complete row-content hashes after copying.
- The source has archived municipal-service tables no longer represented by
  active API code. Their five tables are represented in the PostgreSQL schema
  so the seven category rows and any later records are retained.
- Budget allocation tables currently contain zero rows. `amountNpr` remains a
  floating-point field as in the existing application, and `rawAmount` remains
  unchanged for exact source text.

The full SQLite table/column/index/foreign-key inventory is in the private
backup at `backups/sqlite-before-postgresql-20261007/sqlite-inventory.json`.
That backup also contains the original `.env`; keep it private and do not commit
or share it. `.gitignore` excludes the backup directory.

## Prepare an empty Render PostgreSQL database

Create a new, empty PostgreSQL database in Render. Do not point this procedure
at a database that already contains data. Use its external connection URL only
from this local machine during import. Keep it in an environment variable; do
not paste it into source files or chat.

In PowerShell, from `backend/`, set the external PostgreSQL URL without
replacing the SQLite URL in `.env`:

```powershell
$env:POSTGRES_MIGRATION_URL = 'YOUR_RENDER_EXTERNAL_DATABASE_URL'
$env:DATABASE_URL = $env:POSTGRES_MIGRATION_URL
npm run db:migrate:postgres
Remove-Item Env:DATABASE_URL
npm run migrate:sqlite-to-postgres
```

`db:migrate:postgres` applies the checked-in PostgreSQL initial migration. The
importer refuses a non-PostgreSQL URL, a non-empty target, source integrity or
foreign-key problems, duplicate source unique keys, missing or extra tables,
unparseable JSON/dates, Unicode replacement characters, and source writes
during the import. It copies all application tables in a dependency-safe order
inside one PostgreSQL transaction. It excludes only SQLite's
`_prisma_migrations` ledger because Prisma migration histories are
provider-specific.

If importing a specific backup, pass its path as the first argument and a new
report path as the second:

```powershell
node --experimental-sqlite --env-file-if-exists=.env scripts/migrate-sqlite-to-postgres.cjs 'PATH_TO_SQLITE_BACKUP' 'migration-report.json'
```

The importer does not truncate or merge target rows. It writes a timestamped
report with per-table row counts and full content checksums. Any mismatch rolls
back the import transaction and reports `MIGRATION FAILED — REVIEW REQUIRED`.

## Deploy on Render

The repository root contains `render.yaml`. In Render, create a **Blueprint
Instance** from the connected Git repository and keep `render.yaml` as the
Blueprint file. It defines the backend web service and its private PostgreSQL
database, generates the admin and visitor-token secrets, and sets the health
check. The initial free database is suitable for trying the deployment; Render
states that free PostgreSQL instances expire after 30 days. Choose a paid
database plan before using this as the municipality's long-term production
database.

The Blueprint is an initial deployment scaffold. It creates an empty database;
it does not copy `backend/dev.db` to Render. Before treating the deployed portal
as live, follow the import steps above against the Blueprint-created database,
then check the generated migration report and API data. Keep the external URL
local and secret. The web service uses the database's internal URL automatically.

The free web service is also a test/demo target: it can spin down, and its local
filesystem is ephemeral. This includes uploaded files. Long-term uploaded-file
storage needs a paid persistent disk mounted at
`/opt/render/project/src/uploads` (which disables zero-downtime deploys) or an
external object-storage service. Render free web services do not support
persistent disks.

### Manual service settings (if you are not using the Blueprint)

- Root Directory: `backend`
- Build Command: `PRISMA_SKIP_POSTINSTALL_GENERATE=true npm ci --include=dev && npm run build:postgres`
- Start Command: `npm run start:postgres`
- Health Check Path: `/api/health`
- Node version: `22.11.0` (the version inspected locally)
- Render `DATABASE_URL`: the database's **internal** connection URL, kept in
  Render environment variables
- Set `NODE_ENV=production`, `ADMIN_API_KEY` (at least 24 characters), and
  `VISITOR_TOKEN_SECRET` (at least 32 characters) in Render. The Blueprint
  generates both secrets automatically.

Only cut over after the generated report says `SUCCESS` and backend checks
pass against PostgreSQL.

`start:postgres` applies outstanding PostgreSQL migrations before starting
NestJS. Keep the local SQLite database and backup unchanged until the deployed
API and frontend have passed regression checks.

This is a database-only migration: local uploaded files are not copied. Their
stored paths remain unchanged, so the existing uploads directory still needs a
persistent production storage plan before relying on uploaded images or
documents after a Render restart.

## Rollback

The original SQLite file, schema, and migrations remain available locally. To
return to the current SQLite version, deploy the pre-migration application
revision and restore the SQLite `DATABASE_URL` (`file:../dev.db`). Do not delete
the backup or SQLite migration history after the PostgreSQL cutover.
