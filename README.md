# Chaurpati Digital Information Portal

A source-traceable civic information platform for Chaurpati Rural Municipality.

## Architecture

- `frontend/`: React + Vite client
- `backend/`: NestJS API and isolated official-source adapters
- `backend/prisma/schema.prisma`: SQLite ownership model with provenance and audit fields

The official municipality website is used as an external authoritative source for published municipal information. Imported content is staged for review and is never silently published or used to overwrite manually edited records.

## Run locally

```powershell
cd frontend
npm run dev
```

In another terminal:

```powershell
cd backend
npm run start
```

The API exposes `GET /api/health`, database-backed manual notices at `/api/notices`, and the official-data import workflow at `GET /api/admin/data-import/dashboard`, `GET /api/admin/data-import/latest`, and `POST /api/admin/data-import/fetch`.

## Janata Ko Aawaz setup

The public civic appeal module uses a local SQLite database. It supports public submissions, moderation, signed visitor sessions for votes and submission tracking, comments and replies, reports, approximate map locations, image uploads, and an admin review area at `/admin/appeals`.

SQLite setup creates a new local database and does not copy records from the old PostgreSQL database. Previous PostgreSQL migration files are retained under `backend/prisma/postgresql-migrations-archive` and must not be applied to SQLite.

1. Copy `backend/.env.example` to `backend/.env`. The sample SQLite URL stores data in `backend/dev.db`. Set a private `ADMIN_API_KEY` (at least 24 characters) and a different `VISITOR_TOKEN_SECRET` (at least 32 random characters).
2. From `backend`, run `npx prisma generate`, `npx prisma migrate deploy`, then `npm run build` to create/update the local SQLite database.
3. Run `npm start` from `backend`; Node loads the local `.env` file. Run the frontend with `npm run dev` from `frontend`.
4. Open `/admin/appeals` and enter the configured admin key. The key remains in session storage for that tab.

Citizen images are stored under `backend/uploads/appeals` and served through `/api/uploads/appeals`. Use persistent disk storage or replace this adapter with an object-storage service before deploying to an environment with ephemeral filesystems. Visitor accounts are browser-session identities because this project has no user/account authentication system; clearing browser storage loses the local “My appeals” link and voting identity.

The backend has no configured test or lint scripts. `npm run build` and Prisma validation are available; the frontend provides `npm run lint` and `npm run build`.
