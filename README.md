# Chaurpati Digital Information Portal

A source-traceable civic information platform for Chaurpati Rural Municipality.

## Architecture

- `frontend/`: React + Vite client
- `backend/`: NestJS API and isolated official-source adapters
- `backend/prisma/schema.prisma`: PostgreSQL ownership model with provenance and audit fields

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

The API exposes `GET /api/health` and the first import workflow at `GET /api/admin/data-import/dashboard`, `GET /api/admin/data-import/latest`, and `POST /api/admin/data-import/fetch`.

Set `DATABASE_URL` before using Prisma migrations. The current UI uses a direct local API URL for the fetch action and is ready to move behind a shared environment variable before deployment.
